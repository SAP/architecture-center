import { nanoid } from 'nanoid';
import path from 'path';

export interface FileForCommit {
    path: string;
    content: string;
    encoding?: 'utf-8' | 'base64';
}

export interface DocumentObject {
    id: string;
    editorState: string;
    parentId: string | null;
    children?: DocumentObject[];
    metadata: {
        title: string;
        tags: string[];
        authors: string[];
        contributors: string[];
        description?: string;
    };
}

interface LexicalNode {
    type: string;
    src?: string;
    tag?: string;
    text?: string;
    format?: number;
    url?: string;
    altText?: string;
    start?: number;
    diagramXML?: string;
    fileName?: string;
    children?: LexicalNode[];
}

interface LexicalEditorState {
    root: LexicalNode;
}

const slugify = (text: string): string =>
    text
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '');

function extractDrawioData(node: LexicalNode): FileForCommit[] {
    if (!node) return [];
    let diagrams: FileForCommit[] = [];
    if (node.type === 'drawio' && node.diagramXML) {
        const fileName = `diagram-${nanoid(10)}.drawio`;
        node.fileName = fileName;
        diagrams.push({ path: `drawio/${fileName}`, content: node.diagramXML });
    }
    if (node.children && Array.isArray(node.children)) {
        for (const child of node.children) {
            diagrams = diagrams.concat(extractDrawioData(child));
        }
    }
    return diagrams;
}

function extractImageData(node: LexicalNode): FileForCommit[] {
    if (!node) return [];
    let images: FileForCommit[] = [];
    if (node.type === 'image' && node.src && node.src.startsWith('data:image/')) {
        const matches = node.src.match(/^data:image\/([a-zA-Z]+);base64,(.*)$/);
        if (matches && matches.length === 3) {
            const extension = matches[1];
            const base64Data = matches[2];
            const fileName = `image-${nanoid(10)}.${extension}`;
            node.fileName = fileName;
            images.push({
                path: `images/${fileName}`,
                content: base64Data,
                encoding: 'base64',
            });
        }
    }
    if (node.children && Array.isArray(node.children)) {
        for (const child of node.children) {
            images = images.concat(extractImageData(child));
        }
    }
    return images;
}

function convertNodeToMarkdown(node: LexicalNode): string {
    const childrenText = node.children?.map(convertNodeToMarkdown).join('') || '';
    switch (node.type) {
        case 'root':
            return childrenText;
        case 'heading':
            const level = node.tag === 'h1' ? 1 : node.tag === 'h2' ? 2 : 3;
            return `${'#'.repeat(level)} ${childrenText}\n\n`;
        case 'paragraph':
            return `${childrenText}\n\n`;
        case 'text':
            let text = node.text || '';
            if (node.format && node.format & 1) text = `**${text}**`;
            if (node.format && node.format & 2) text = `*${text}*`;
            return text;
        case 'list':
            const start = node.start || 1;
            return (
                (node.children
                    ?.map((child, index) => {
                        const prefix = node.tag === 'ol' ? `${start + index}. ` : '- ';
                        return `${prefix}${convertNodeToMarkdown(child)}`;
                    })
                    .join('') || '') + '\n'
            );
        case 'listitem':
            return `${childrenText}\n`;
        case 'link':
            return `[${childrenText}](${node.url})`;
        case 'drawio':
            return `![drawio](drawio/${node.fileName})\n\n`;
        case 'image':
            return `![${node.altText}](images/${node.fileName})\n\n`;
        default:
            return childrenText;
    }
}

function convertLexicalToMarkdown(editorState: string): string {
    if (!editorState) return '';
    try {
        const jsonState = JSON.parse(editorState) as LexicalEditorState;
        return convertNodeToMarkdown(jsonState.root);
    } catch (error) {
        console.error('Error converting Lexical state to Markdown:', error);
        return '';
    }
}

function processDocumentTreeRecursively(
    doc: DocumentObject,
    raFolderName: string,
    currentBasePath: string,
    sidebarPosition: number,
    idSegments: string[],
    parentSlug: string,
    isRoot: boolean = false
): FileForCommit[] {
    let filesForThisLevel: FileForCommit[] = [];
    const { metadata, editorState } = doc;
    let currentFullSlug: string;

    if (isRoot) {
        currentFullSlug = path.join(parentSlug, nanoid(8));
    } else {
        currentFullSlug = path.join(parentSlug, sidebarPosition.toString());
    }

    const today = new Date().toISOString().split('T')[0];
    const frontMatter = `---
id: id-${idSegments.join('-')}
slug: ${currentFullSlug}
sidebar_position: ${sidebarPosition}
title: '${metadata.title.replace(/'/g, "''")} [${raFolderName.toUpperCase()}]'
description: '${(metadata.description || '').replace(/'/g, "''")}'
sidebar_label: '${metadata.title.replace(/'/g, "''")}'
tags:
${(metadata.tags || []).map((tag) => `  - ${tag}`).join('\n')}
contributors:
${Array.from(new Set([...metadata.authors, ...(metadata.contributors || [])]))
    .map((c) => `  - ${c}`)
    .join('\n')}
last_update:
  date: ${today}
  author: ${metadata.authors[0] || ''}
---
`;

    if (editorState) {
        const jsonState = JSON.parse(editorState) as LexicalEditorState;
        const drawioFiles = extractDrawioData(jsonState.root);
        const imageFiles = extractImageData(jsonState.root);

        drawioFiles.forEach((drawioFile) => {
            filesForThisLevel.push({
                ...drawioFile,
                path: path.join(currentBasePath, drawioFile.path),
            });
        });

        imageFiles.forEach((imageFile) => {
            filesForThisLevel.push({
                ...imageFile,
                path: path.join(currentBasePath, imageFile.path),
            });
        });

        const markdownContent = convertLexicalToMarkdown(JSON.stringify(jsonState));
        filesForThisLevel.push({
            path: path.join(currentBasePath, 'readme.md'),
            content: frontMatter + '\n' + markdownContent,
            encoding: 'utf-8',
        });
    }

    if (doc.children && doc.children.length > 0) {
        doc.children.forEach((childDoc, index) => {
            const childPosition = index + 1;
            const childFolderName = `${childPosition}-${slugify(childDoc.metadata.title || 'untitled')}`;
            const childBasePath = path.join(currentBasePath, childFolderName);
            const childIdSegments = [...idSegments, childPosition.toString()];
            const childFiles = processDocumentTreeRecursively(
                childDoc,
                raFolderName,
                childBasePath,
                childPosition,
                childIdSegments,
                currentFullSlug,
                false
            );
            filesForThisLevel.push(...childFiles);
        });
    }

    return filesForThisLevel;
}

export function generateFileTreeInMemory(rootDoc: DocumentObject, raFolderName: string): FileForCommit[] {
    const initialIdSegments = [raFolderName.toLowerCase()];
    const initialParentSlug = '/ref-arch';
    return processDocumentTreeRecursively(rootDoc, raFolderName, '', 1, initialIdSegments, initialParentSlug, true);
}
