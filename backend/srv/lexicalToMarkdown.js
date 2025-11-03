const { nanoid } = require('nanoid');

function extractDrawioData(node) {
    if (!node) return [];

    let diagrams = [];

    if (node.type === 'drawio' && node.diagramXML) {
        const fileName = `diagram-${nanoid(10)}.drawio`;
        node.fileName = fileName; 
        diagrams.push({
            path: `drawio/${fileName}`,
            content: node.diagramXML
        });
    }

    if (node.children && Array.isArray(node.children)) {
        for (const child of node.children) {
            diagrams = diagrams.concat(extractDrawioData(child));
        }
    }
    return diagrams;
}

function convertNodeToMarkdown(node) {
    const childrenText = node.children?.map(convertNodeToMarkdown).join('') || '';
    switch (node.type) {
        case 'root': return childrenText;
        case 'heading':
            const level = node.tag === 'h1' ? 1 : node.tag === 'h2' ? 2 : 3;
            return `${'#'.repeat(level)} ${childrenText}\n\n`;
        case 'paragraph': return `${childrenText}\n\n`;
        case 'text':
            let text = node.text;
            if (node.format & 1) text = `**${text}**`;
            if (node.format & 2) text = `*${text}*`;
            return text;
        case 'list':
            const start = node.start || 1;
            return (node.children?.map((child, index) => {
                const prefix = node.tag === 'ol' ? `${start + index}. ` : '- ';
                return `${prefix}${convertNodeToMarkdown(child)}`;
            }).join('') + '\n');
        case 'listitem': return `${childrenText}\n`;
        case 'link': return `[${childrenText}](${node.url})`;
        case 'drawio': return `![drawio](drawio/${node.fileName})\n\n`;
        case 'image': return `![${node.altText}](images/${node.fileName})\n\n`;
        default: return childrenText;
    }
}

function convertLexicalToMarkdown(editorState) {
    if (!editorState) return '';
    try {
        const jsonState = JSON.parse(editorState);
        return convertNodeToMarkdown(jsonState.root);
    } catch (error) {
        console.error('Error converting Lexical state to Markdown:', error);
        return '';
    }
}

module.exports = {
    extractDrawioData,
    convertLexicalToMarkdown,
};