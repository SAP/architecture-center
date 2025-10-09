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

function processNodeAndExtractFiles(node: LexicalNode, assetFiles: FileForCommit[]): string {
    if (!node) {
        return '';
    }

    switch (node.type) {
        case 'root': {
            return node.children?.map((child) => processNodeAndExtractFiles(child, assetFiles)).join('') || '';
        }
        case 'heading': {
            const childrenText =
                node.children?.map((child) => processNodeAndExtractFiles(child, assetFiles)).join('') || '';
            const level = node.tag === 'h1' ? 1 : node.tag === 'h2' ? 2 : 3;
            return `${'#'.repeat(level)} ${childrenText}\n\n`;
        }
        case 'paragraph': {
            const childrenText =
                node.children?.map((child) => processNodeAndExtractFiles(child, assetFiles)).join('') || '';
            return `${childrenText}\n\n`;
        }
        case 'text': {
            let text = node.text || '';
            if (node.format && node.format & 1) text = `**${text}**`;
            if (node.format && node.format & 2) text = `*${text}*`;
            return text;
        }
        case 'list': {
            const start = node.start || 1;
            return (
                (node.children
                    ?.map((child, index) => {
                        const prefix = node.tag === 'ol' ? `${start + index}. ` : '- ';
                        const childMarkdown = processNodeAndExtractFiles(child, assetFiles);
                        return `${prefix}${childMarkdown}`;
                    })
                    .join('') || '') + '\n'
            );
        }
        case 'listitem': {
            const childrenText =
                node.children?.map((child) => processNodeAndExtractFiles(child, assetFiles)).join('') || '';
            return `${childrenText.trimEnd()}\n`;
        }
        case 'link': {
            const childrenText =
                node.children?.map((child) => processNodeAndExtractFiles(child, assetFiles)).join('') || '';
            return `[${childrenText}](${node.url})`;
        }
        case 'drawio': {
            if (node.diagramXML) {
                const fileName = `diagram-${nanoid(10)}.drawio`;
                assetFiles.push({ path: `drawio/${fileName}`, content: node.diagramXML });
                return `![drawio](drawio/${fileName})\n\n`;
            }
            return '';
        }
        case 'image': {
            if (node.src && node.src.startsWith('data:image/')) {
                const dataUrl = node.src;
                const commaIndex = dataUrl.indexOf(',');
                if (commaIndex === -1) return '';
                const header = dataUrl.substring(0, commaIndex);
                let data = dataUrl.substring(commaIndex + 1);
                const mimeMatch = header.match(/^data:image\/([\w+\-]+)/);
                if (!mimeMatch) return '';
                let extension = mimeMatch[1].replace('+xml', '');
                let encoding: 'base64' | 'utf-8' = 'utf-8';
                let content: string;
                if (header.includes(';base64')) {
                    encoding = 'base64';
                    content = data;
                } else {
                    content = decodeURIComponent(data);
                }
                const fileName = `image-${nanoid(10)}.${extension}`;
                assetFiles.push({
                    path: `images/${fileName}`,
                    content: content,
                    encoding: encoding,
                });
                return `![${node.altText || ''}](images/${fileName})\n\n`;
            }
            return '';
        }
        default: {
            return node.children?.map((child) => processNodeAndExtractFiles(child, assetFiles)).join('') || '';
        }
    }
}

function extractTextFromNode(node: LexicalNode): string {
    if (node.text) {
        return node.text;
    }
    if (node.children) {
        return node.children.map(extractTextFromNode).join('');
    }
    return '';
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
        let stateForProcessing = jsonState;
        const rootChildren = jsonState.root?.children;
        const firstChild = rootChildren?.[0];

        if (rootChildren && firstChild && firstChild.type === 'heading' && firstChild.tag === 'h1') {
            const h1Text = extractTextFromNode(firstChild);
            const normalize = (str: string) =>
                str
                    .toLowerCase()
                    .trim()
                    .replace(/[^\w\s]/g, '');
            if (normalize(metadata.title) === normalize(h1Text)) {
                stateForProcessing = {
                    ...jsonState,
                    root: {
                        ...jsonState.root,
                        children: rootChildren.slice(1),
                    },
                };
            }
        }

        const assetFiles: FileForCommit[] = [];
        const markdownContent = processNodeAndExtractFiles(stateForProcessing.root, assetFiles);

        assetFiles.forEach((assetFile) => {
            filesForThisLevel.push({
                ...assetFile,
                path: path.join(currentBasePath, assetFile.path),
            });
        });

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
