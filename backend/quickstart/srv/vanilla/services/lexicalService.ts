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

/**
 * Asset data structure passed from publish.ts
 */
export interface AssetData {
    ID: string;
    mediaType: string;
    filename: string;
    content: Buffer | null;
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
    assetId?: string; // NEW: Reference to DocumentAsset
    children?: LexicalNode[];
    // Additional fields for specific node types
    language?: string; // for code blocks
    admonitionType?: string; // for admonition nodes
    nestedEditorState?: LexicalEditorState; // for admonition content
    content?: string; // legacy admonition content
    listType?: string; // for list nodes
    indent?: number; // for nested lists
}

interface LexicalEditorState {
    root: LexicalNode;
}

const slugify = (text: string): string =>
    text
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '');

/**
 * Get file extension from media type
 */
function getExtensionFromMediaType(mediaType: string): string {
    const mediaTypeMap: Record<string, string> = {
        'image/png': 'png',
        'image/jpeg': 'jpg',
        'image/jpg': 'jpg',
        'image/webp': 'webp',
        'image/gif': 'gif',
        'image/svg+xml': 'svg',
        'application/vnd.jgraph.mxfile+xml': 'drawio',
        'application/xml': 'xml',
        'text/xml': 'xml',
    };
    return mediaTypeMap[mediaType] || 'bin';
}

function processNodeAndExtractFiles(
    node: LexicalNode,
    assetFiles: FileForCommit[],
    assetsMap?: Map<string, AssetData>,
    indentLevel: number = 0
): string {
    if (!node) {
        return '';
    }

    const indent = '  '.repeat(indentLevel);

    switch (node.type) {
        case 'root': {
            return node.children?.map((child) => processNodeAndExtractFiles(child, assetFiles, assetsMap, 0)).join('') || '';
        }
        case 'heading': {
            const childrenText =
                node.children?.map((child) => processNodeAndExtractFiles(child, assetFiles, assetsMap, 0)).join('') || '';
            const level = node.tag === 'h1' ? 1 : node.tag === 'h2' ? 2 : node.tag === 'h3' ? 3 : node.tag === 'h4' ? 4 : node.tag === 'h5' ? 5 : 6;
            return `${'#'.repeat(level)} ${childrenText}\n\n`;
        }
        case 'paragraph': {
            const childrenText =
                node.children?.map((child) => processNodeAndExtractFiles(child, assetFiles, assetsMap, 0)).join('') || '';
            // Handle indented paragraphs in lists
            if (indentLevel > 0) {
                return `${indent}${childrenText}\n`;
            }
            return `${childrenText}\n\n`;
        }
        case 'text': {
            let text = node.text || '';
            // Format flags: 1=bold, 2=italic, 4=strikethrough, 8=underline, 16=code, 32=subscript, 64=superscript
            if (node.format) {
                // Apply code first (innermost)
                if (node.format & 16) text = `\`${text}\``;
                // Apply strikethrough
                if (node.format & 4) text = `~~${text}~~`;
                // Apply italic
                if (node.format & 2) text = `*${text}*`;
                // Apply bold
                if (node.format & 1) text = `**${text}**`;
                // Underline - no standard markdown, use HTML
                if (node.format & 8) text = `<u>${text}</u>`;
                // Subscript
                if (node.format & 32) text = `<sub>${text}</sub>`;
                // Superscript
                if (node.format & 64) text = `<sup>${text}</sup>`;
            }
            return text;
        }
        case 'linebreak': {
            return '  \n'; // Two spaces + newline for markdown line break
        }
        case 'list': {
            const listIndent = node.indent || 0;
            const start = node.start || 1;
            return (
                (node.children
                    ?.map((child, index) => {
                        const prefix = node.tag === 'ol' ? `${start + index}. ` : '- ';
                        const childMarkdown = processNodeAndExtractFiles(child, assetFiles, assetsMap, listIndent);
                        return `${'  '.repeat(listIndent)}${prefix}${childMarkdown}`;
                    })
                    .join('') || '') + '\n'
            );
        }
        case 'listitem': {
            const childrenText =
                node.children?.map((child) => processNodeAndExtractFiles(child, assetFiles, assetsMap, indentLevel)).join('') || '';
            return `${childrenText.trimEnd()}\n`;
        }
        case 'link': {
            const childrenText =
                node.children?.map((child) => processNodeAndExtractFiles(child, assetFiles, assetsMap, 0)).join('') || '';
            return `[${childrenText}](${node.url})`;
        }
        case 'quote': {
            const childrenText =
                node.children?.map((child) => processNodeAndExtractFiles(child, assetFiles, assetsMap, 0)).join('') || '';
            // Add > prefix to each line
            const quotedLines = childrenText
                .trim()
                .split('\n')
                .map((line) => `> ${line}`)
                .join('\n');
            return `${quotedLines}\n\n`;
        }
        case 'code': {
            // Code block node
            const code = node.children?.map((child) => child.text || '').join('') || '';
            const language = node.language || '';
            return `\`\`\`${language}\n${code}\n\`\`\`\n\n`;
        }
        case 'code-highlight': {
            // Code highlight inside code block - just return the text
            return node.text || '';
        }
        case 'table': {
            if (!node.children || node.children.length === 0) return '';

            const rows = node.children.filter((child) => child.type === 'tablerow');
            if (rows.length === 0) return '';

            let tableMarkdown = '';

            rows.forEach((row, rowIndex) => {
                const cells = row.children?.filter((child) => child.type === 'tablecell') || [];
                const cellContents = cells.map((cell) => {
                    const content = cell.children?.map((child) => processNodeAndExtractFiles(child, assetFiles, assetsMap, 0)).join('') || '';
                    return content.trim().replace(/\|/g, '\\|').replace(/\n/g, ' ');
                });

                tableMarkdown += `| ${cellContents.join(' | ')} |\n`;

                // Add header separator after first row
                if (rowIndex === 0) {
                    tableMarkdown += `| ${cells.map(() => '---').join(' | ')} |\n`;
                }
            });

            return `${tableMarkdown}\n`;
        }
        case 'tablerow': {
            // Handled by table
            return '';
        }
        case 'tablecell': {
            // Handled by table
            return '';
        }
        case 'horizontalrule': {
            return `---\n\n`;
        }
        case 'admonition': {
            // Convert admonition to Docusaurus admonition format
            const admonitionType = node.admonitionType || 'note';
            let content = '';

            // Handle nested editor state (new format)
            if (node.nestedEditorState && node.nestedEditorState.root) {
                content = processNodeAndExtractFiles(node.nestedEditorState.root, assetFiles, assetsMap, 0).trim();
            }
            // Handle legacy content string
            else if (node.content) {
                content = node.content;
            }

            // Indent content for admonition
            const indentedContent = content
                .split('\n')
                .map((line) => line)
                .join('\n');

            return `:::${admonitionType}\n\n${indentedContent}\n\n:::\n\n`;
        }
        case 'drawio': {
            // NEW: Handle assetId reference
            if (node.assetId && assetsMap) {
                const asset = assetsMap.get(node.assetId);
                if (asset && asset.content) {
                    const fileName = `diagram-${nanoid(10)}.drawio`;
                    // Draw.io files are XML text
                    assetFiles.push({
                        path: `drawio/${fileName}`,
                        content: asset.content.toString('utf-8'),
                        encoding: 'utf-8',
                    });
                    return `![drawio](drawio/${fileName})\n\n`;
                }
            }
            // Fallback: embedded XML (legacy format)
            if (node.diagramXML) {
                const fileName = `diagram-${nanoid(10)}.drawio`;
                assetFiles.push({ path: `drawio/${fileName}`, content: node.diagramXML });
                return `![drawio](drawio/${fileName})\n\n`;
            }
            return '';
        }
        case 'image': {
            // NEW: Handle assetId reference
            if (node.assetId && assetsMap) {
                const asset = assetsMap.get(node.assetId);
                if (asset && asset.content) {
                    const extension = getExtensionFromMediaType(asset.mediaType);
                    const fileName = `image-${nanoid(10)}.${extension}`;
                    assetFiles.push({
                        path: `images/${fileName}`,
                        content: asset.content.toString('base64'),
                        encoding: 'base64',
                    });
                    return `![${node.altText || ''}](images/${fileName})\n\n`;
                }
            }
            // Fallback: embedded base64 data URL (legacy format)
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
            return node.children?.map((child) => processNodeAndExtractFiles(child, assetFiles, assetsMap, indentLevel)).join('') || '';
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
    isRoot: boolean = false,
    assetsMap?: Map<string, AssetData>
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

    // --- START OF CHANGES ---
    const frontMatter = `---
id: id-${idSegments.join('-')}
slug: ${currentFullSlug}
sidebar_position: ${sidebarPosition}
title: '${metadata.title.replace(/'/g, "''")}'
description: '${(metadata.description || '').replace(/'/g, "''")}'
keywords:
${(metadata.tags || []).map((tag) => `  - ${tag}`).join('\n')}
sidebar_label: '${metadata.title.replace(/'/g, "''")}'
image: img/logo.svg
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
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
    // --- END OF CHANGES ---

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
        const markdownContent = processNodeAndExtractFiles(stateForProcessing.root, assetFiles, assetsMap, 0);

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
                false,
                assetsMap
            );
            filesForThisLevel.push(...childFiles);
        });
    }

    return filesForThisLevel;
}

export function generateFileTreeInMemory(
    rootDoc: DocumentObject,
    raFolderName: string,
    assetsMap?: Map<string, AssetData>
): FileForCommit[] {
    const match = raFolderName.match(/\d+/);
    const initialSidebarPosition = match ? parseInt(match[0], 10) : 1;
    const initialIdSegments = [raFolderName.toLowerCase()];
    const initialParentSlug = '/ref-arch';
    return processDocumentTreeRecursively(
        rootDoc,
        raFolderName,
        '',
        initialSidebarPosition,
        initialIdSegments,
        initialParentSlug,
        true,
        assetsMap
    );
}
