import { nanoid } from 'nanoid';

export interface FileForCommit {
    path: string;
    content: string;
    encoding?: 'utf-8' | 'base64';
}

export interface DocumentObject {
    metadata: {
        title: string;
        tags: string[];
        authors: string[];
        contributors: string[];
        description?: string;
    };
    editorState: string;
}

interface LexicalNode {
    type: string;
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

function extractDrawioData(node: LexicalNode): FileForCommit[] {
    if (!node) return [];
    let diagrams: FileForCommit[] = [];
    if (node.type === 'drawio' && node.diagramXML) {
        const fileName = `diagram-${nanoid(10)}.drawio`;
        node.fileName = fileName;
        diagrams.push({
            path: `drawio/${fileName}`,
            content: node.diagramXML,
        });
    }
    if (node.children && Array.isArray(node.children)) {
        for (const child of node.children) {
            diagrams = diagrams.concat(extractDrawioData(child));
        }
    }
    return diagrams;
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

export function generateFileTreeInMemory(doc: DocumentObject, raFolderName: string): FileForCommit[] {
    const { metadata } = doc;
    const today = new Date().toISOString().split('T')[0];
    const frontMatter = `---
id: id-${raFolderName.toLowerCase()}
slug: /ref-arch/${nanoid(8)}
sidebar_position: 1
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

    let filesToCommit: FileForCommit[] = [];
    if (doc.editorState) {
        const jsonState = JSON.parse(doc.editorState) as LexicalEditorState;
        const drawioFiles = extractDrawioData(jsonState.root);
        filesToCommit.push(...drawioFiles);
        const markdownContent = convertLexicalToMarkdown(JSON.stringify(jsonState));
        filesToCommit.push({
            path: 'readme.md',
            content: frontMatter + '\n' + markdownContent,
            encoding: 'utf-8',
        });
    }
    return filesToCommit;
}
