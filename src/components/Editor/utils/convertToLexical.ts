// Converts custom editor state format to Lexical-compatible format for backend

interface CustomTextFormat {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
}

interface CustomNode {
  key: string;
  type: string;
  parent: string | null;
  children?: string[];
  text?: string;
  format?: CustomTextFormat;
  level?: number;
  listType?: 'bullet' | 'number';
  url?: string;
  src?: string;
  alt?: string;
  assetId?: string;
  diagramXML?: string;
  language?: string;
  indent?: number;
  admonitionType?: 'note' | 'info' | 'tip' | 'warning' | 'danger';
  isHeader?: boolean;
}

interface CustomEditorState {
  root: string;
  nodeMap: Record<string, CustomNode>;
  version: number;
}

// Lexical format uses bitmask for text formatting
function formatToLexicalBitmask(format?: CustomTextFormat): number {
  if (!format) return 0;
  let bitmask = 0;
  if (format.bold) bitmask |= 1;
  if (format.italic) bitmask |= 2;
  if (format.underline) bitmask |= 8;
  if (format.strikethrough) bitmask |= 4;
  if (format.code) bitmask |= 16;
  return bitmask;
}

function convertNode(node: CustomNode, nodeMap: Record<string, CustomNode>): any {
  if (!node) return null;

  switch (node.type) {
    case 'root': {
      return {
        type: 'root',
        children: node.children?.map(key => convertNode(nodeMap[key], nodeMap)).filter(Boolean) || [],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      };
    }

    case 'paragraph': {
      return {
        type: 'paragraph',
        children: node.children?.map(key => convertNode(nodeMap[key], nodeMap)).filter(Boolean) || [],
        direction: 'ltr',
        format: '',
        indent: node.indent || 0,
        version: 1,
      };
    }

    case 'heading': {
      const tag = `h${node.level || 1}`;
      return {
        type: 'heading',
        tag,
        children: node.children?.map(key => convertNode(nodeMap[key], nodeMap)).filter(Boolean) || [],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      };
    }

    case 'text': {
      return {
        type: 'text',
        text: node.text || '',
        format: formatToLexicalBitmask(node.format),
        detail: 0,
        mode: 'normal',
        style: '',
        version: 1,
      };
    }

    case 'list': {
      const tag = node.listType === 'number' ? 'ol' : 'ul';
      return {
        type: 'list',
        tag,
        listType: node.listType === 'number' ? 'number' : 'bullet',
        start: 1,
        children: node.children?.map(key => convertNode(nodeMap[key], nodeMap)).filter(Boolean) || [],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      };
    }

    case 'listitem': {
      return {
        type: 'listitem',
        children: node.children?.map(key => convertNode(nodeMap[key], nodeMap)).filter(Boolean) || [],
        direction: 'ltr',
        format: '',
        indent: node.indent || 0,
        value: 1,
        version: 1,
      };
    }

    case 'link': {
      return {
        type: 'link',
        url: node.url || '',
        children: node.children?.map(key => convertNode(nodeMap[key], nodeMap)).filter(Boolean) || [],
        direction: 'ltr',
        format: '',
        indent: 0,
        rel: 'noopener',
        target: '_blank',
        version: 1,
      };
    }

    case 'quote': {
      return {
        type: 'quote',
        children: node.children?.map(key => convertNode(nodeMap[key], nodeMap)).filter(Boolean) || [],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      };
    }

    case 'code': {
      // For code blocks, combine all text children
      const codeText = node.children?.map(key => {
        const child = nodeMap[key];
        return child?.text || '';
      }).join('') || '';

      return {
        type: 'code',
        language: node.language || '',
        children: [{
          type: 'code-highlight',
          text: codeText,
          format: 0,
          detail: 0,
          mode: 'normal',
          style: '',
          version: 1,
        }],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      };
    }

    case 'image': {
      // Images are stored with assetId reference - backend needs to resolve this
      // Don't set src to empty string - leave it undefined so backend knows to resolve from assetId
      return {
        type: 'image',
        src: node.src || undefined,
        altText: node.alt || '',
        assetId: node.assetId || null,
        width: 0,
        height: 0,
        maxWidth: 800,
        showCaption: false,
        caption: {
          editorState: {
            root: {
              children: [],
              direction: null,
              format: '',
              indent: 0,
              type: 'root',
              version: 1,
            },
          },
        },
        version: 1,
      };
    }

    case 'drawio': {
      // Drawio diagrams are stored with assetId reference - backend needs to resolve this
      // Don't set diagramXML to empty string - leave it undefined so backend knows to resolve from assetId
      return {
        type: 'drawio',
        diagramXML: node.diagramXML || undefined,
        assetId: node.assetId || null,
        version: 1,
      };
    }

    case 'divider': {
      return {
        type: 'horizontalrule',
        version: 1,
      };
    }

    case 'admonition': {
      // Convert admonition to Docusaurus-compatible format
      // Docusaurus uses :::note, :::tip, :::info, :::warning, :::danger
      return {
        type: 'admonition',
        admonitionType: node.admonitionType || 'note',
        children: node.children?.map(key => convertNode(nodeMap[key], nodeMap)).filter(Boolean) || [],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      };
    }

    case 'table': {
      return {
        type: 'table',
        children: node.children?.map(key => convertNode(nodeMap[key], nodeMap)).filter(Boolean) || [],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      };
    }

    case 'tablerow': {
      return {
        type: 'tablerow',
        children: node.children?.map(key => convertNode(nodeMap[key], nodeMap)).filter(Boolean) || [],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      };
    }

    case 'tablecell': {
      return {
        type: 'tablecell',
        children: node.children?.map(key => convertNode(nodeMap[key], nodeMap)).filter(Boolean) || [],
        direction: 'ltr',
        format: '',
        indent: 0,
        colSpan: 1,
        rowSpan: 1,
        backgroundColor: null,
        headerState: node.isHeader ? 1 : 0,
        version: 1,
      };
    }

    default: {
      // For unknown types, try to convert children
      if (node.children) {
        return {
          type: 'paragraph',
          children: node.children.map(key => convertNode(nodeMap[key], nodeMap)).filter(Boolean),
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1,
        };
      }
      return null;
    }
  }
}

export function convertToLexicalFormat(customEditorState: string): string {
  try {
    const state: CustomEditorState = JSON.parse(customEditorState);

    if (!state.root || !state.nodeMap) {
      // Already in Lexical format or invalid
      return customEditorState;
    }

    const rootNode = state.nodeMap[state.root];
    if (!rootNode) {
      return customEditorState;
    }

    const lexicalRoot = convertNode(rootNode, state.nodeMap);

    return JSON.stringify({ root: lexicalRoot });
  } catch (e) {
    console.error('Failed to convert editor state to Lexical format:', e);
    return customEditorState;
  }
}
