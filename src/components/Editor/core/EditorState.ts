import {
  EditorState,
  EditorNode,
  RootNode,
  ParagraphNode,
  TextNode,
  HeadingNode,
  ListNode,
  ListItemNode,
  QuoteNode,
  CodeNode,
  LinkNode,
  ImageNode,
  DrawioNode,
  DividerNode,
  TableNode,
  TableRowNode,
  TableCellNode,
  AdmonitionNode,
  AdmonitionType,
  TextFormat,
  HeadingLevel,
  ListType,
  isElementNode,
  isTextNode,
} from './types';

let keyCounter = 0;

export function generateKey(): string {
  return `node_${Date.now()}_${keyCounter++}`;
}

// Create empty editor state
export function createEmptyState(): EditorState {
  const rootKey = generateKey();
  const paragraphKey = generateKey();
  const textKey = generateKey();

  const textNode: TextNode = {
    key: textKey,
    type: 'text',
    parent: paragraphKey,
    text: '',
    format: {},
  };

  const paragraphNode: ParagraphNode = {
    key: paragraphKey,
    type: 'paragraph',
    parent: rootKey,
    children: [textKey],
  };

  const rootNode: RootNode = {
    key: rootKey,
    type: 'root',
    parent: null,
    children: [paragraphKey],
  };

  const nodeMap = new Map<string, EditorNode>();
  nodeMap.set(rootKey, rootNode);
  nodeMap.set(paragraphKey, paragraphNode);
  nodeMap.set(textKey, textNode);

  return {
    root: rootKey,
    nodeMap,
    version: 0,
  };
}

// Clone state (for immutable updates)
export function cloneState(state: EditorState): EditorState {
  const nodeMap = new Map<string, EditorNode>();
  state.nodeMap.forEach((node, key) => {
    nodeMap.set(key, cloneNode(node));
  });
  return {
    root: state.root,
    nodeMap,
    version: state.version + 1,
  };
}

function cloneNode(node: EditorNode): EditorNode {
  if (isElementNode(node)) {
    return { ...node, children: [...node.children] };
  }
  if (isTextNode(node)) {
    return { ...node, format: { ...node.format } };
  }
  return { ...node };
}

// Node getters
export function getNode(state: EditorState, key: string): EditorNode | null {
  return state.nodeMap.get(key) || null;
}

export function getRoot(state: EditorState): RootNode {
  return state.nodeMap.get(state.root) as RootNode;
}

export function getParent(state: EditorState, key: string): EditorNode | null {
  const node = getNode(state, key);
  if (!node || !node.parent) return null;
  return getNode(state, node.parent);
}

export function getChildren(state: EditorState, key: string): EditorNode[] {
  const node = getNode(state, key);
  if (!node || !isElementNode(node)) return [];
  return node.children.map(childKey => getNode(state, childKey)).filter(Boolean) as EditorNode[];
}

// Find the nearest block ancestor
export function getBlockAncestor(state: EditorState, key: string): EditorNode | null {
  let current = getNode(state, key);
  while (current) {
    if (
      current.type === 'paragraph' ||
      current.type === 'heading' ||
      current.type === 'listitem' ||
      current.type === 'quote' ||
      current.type === 'code'
    ) {
      return current;
    }
    current = current.parent ? getNode(state, current.parent) : null;
  }
  return null;
}

// Get text content of a node and its descendants
export function getTextContent(state: EditorState, key: string): string {
  const node = getNode(state, key);
  if (!node) return '';
  if (isTextNode(node)) return node.text;
  if (isElementNode(node)) {
    return node.children.map(childKey => getTextContent(state, childKey)).join('');
  }
  return '';
}

// Find first/last text node in subtree
export function findFirstTextNode(state: EditorState, key: string): TextNode | null {
  const node = getNode(state, key);
  if (!node) return null;
  if (isTextNode(node)) return node;
  if (isElementNode(node)) {
    for (const childKey of node.children) {
      const found = findFirstTextNode(state, childKey);
      if (found) return found;
    }
  }
  return null;
}

export function findLastTextNode(state: EditorState, key: string): TextNode | null {
  const node = getNode(state, key);
  if (!node) return null;
  if (isTextNode(node)) return node;
  if (isElementNode(node)) {
    for (let i = node.children.length - 1; i >= 0; i--) {
      const found = findLastTextNode(state, node.children[i]);
      if (found) return found;
    }
  }
  return null;
}

// Get sibling nodes
export function getPreviousSibling(state: EditorState, key: string): EditorNode | null {
  const node = getNode(state, key);
  if (!node || !node.parent) return null;
  const parent = getNode(state, node.parent);
  if (!parent || !isElementNode(parent)) return null;
  const index = parent.children.indexOf(key);
  if (index <= 0) return null;
  return getNode(state, parent.children[index - 1]);
}

export function getNextSibling(state: EditorState, key: string): EditorNode | null {
  const node = getNode(state, key);
  if (!node || !node.parent) return null;
  const parent = getNode(state, node.parent);
  if (!parent || !isElementNode(parent)) return null;
  const index = parent.children.indexOf(key);
  if (index < 0 || index >= parent.children.length - 1) return null;
  return getNode(state, parent.children[index + 1]);
}

// Node creation helpers
export function createTextNode(text: string, format: TextFormat = {}): TextNode {
  return {
    key: generateKey(),
    type: 'text',
    parent: null,
    text,
    format,
  };
}

export function createParagraphNode(children: string[] = []): ParagraphNode {
  return {
    key: generateKey(),
    type: 'paragraph',
    parent: null,
    children,
  };
}

export function createHeadingNode(level: HeadingLevel, children: string[] = []): HeadingNode {
  return {
    key: generateKey(),
    type: 'heading',
    parent: null,
    level,
    children,
  };
}

export function createListNode(listType: ListType, children: string[] = []): ListNode {
  return {
    key: generateKey(),
    type: 'list',
    parent: null,
    listType,
    children,
  };
}

export function createListItemNode(children: string[] = [], indent: number = 0): ListItemNode {
  return {
    key: generateKey(),
    type: 'listitem',
    parent: null,
    children,
    indent,
  };
}

export function createQuoteNode(children: string[] = []): QuoteNode {
  return {
    key: generateKey(),
    type: 'quote',
    parent: null,
    children,
  };
}

export function createCodeNode(language?: string, children: string[] = []): CodeNode {
  return {
    key: generateKey(),
    type: 'code',
    parent: null,
    language,
    children,
  };
}

export function createLinkNode(url: string, children: string[] = []): LinkNode {
  return {
    key: generateKey(),
    type: 'link',
    parent: null,
    url,
    children,
  };
}

export function createImageNode(src: string, alt: string, assetId?: string): ImageNode {
  return {
    key: generateKey(),
    type: 'image',
    parent: null,
    src,
    alt,
    assetId,
  };
}

export function createDrawioNode(diagramXML: string, assetId?: string): DrawioNode {
  return {
    key: generateKey(),
    type: 'drawio',
    parent: null,
    diagramXML,
    assetId,
  };
}

export function createDividerNode(): DividerNode {
  return {
    key: generateKey(),
    type: 'divider',
    parent: null,
  };
}

export function createAdmonitionNode(admonitionType: AdmonitionType, children: string[] = []): AdmonitionNode {
  return {
    key: generateKey(),
    type: 'admonition',
    parent: null,
    admonitionType,
    children,
  };
}

export function createTableNode(children: string[] = []): TableNode {
  return {
    key: generateKey(),
    type: 'table',
    parent: null,
    children,
  };
}

export function createTableRowNode(children: string[] = []): TableRowNode {
  return {
    key: generateKey(),
    type: 'tablerow',
    parent: null,
    children,
  };
}

export function createTableCellNode(children: string[] = [], isHeader: boolean = false): TableCellNode {
  return {
    key: generateKey(),
    type: 'tablecell',
    parent: null,
    children,
    isHeader,
  };
}

// State mutation helpers (return new state)
export function insertNode(
  state: EditorState,
  parentKey: string,
  node: EditorNode,
  index: number = -1
): EditorState {
  const newState = cloneState(state);
  const parent = newState.nodeMap.get(parentKey);
  if (!parent || !isElementNode(parent)) return state;

  node.parent = parentKey;
  newState.nodeMap.set(node.key, node);

  if (index === -1 || index >= parent.children.length) {
    parent.children.push(node.key);
  } else {
    parent.children.splice(index, 0, node.key);
  }

  return newState;
}

export function removeNode(state: EditorState, key: string): EditorState {
  const newState = cloneState(state);
  const node = newState.nodeMap.get(key);
  if (!node) return state;

  // Remove from parent's children
  if (node.parent) {
    const parent = newState.nodeMap.get(node.parent);
    if (parent && isElementNode(parent)) {
      const index = parent.children.indexOf(key);
      if (index !== -1) {
        parent.children.splice(index, 1);
      }
    }
  }

  // Remove node and all descendants
  const removeRecursive = (nodeKey: string) => {
    const n = newState.nodeMap.get(nodeKey);
    if (n && isElementNode(n)) {
      n.children.forEach(removeRecursive);
    }
    newState.nodeMap.delete(nodeKey);
  };
  removeRecursive(key);

  return newState;
}

export function updateNode(
  state: EditorState,
  key: string,
  updates: Partial<EditorNode>
): EditorState {
  const newState = cloneState(state);
  const node = newState.nodeMap.get(key);
  if (!node) return state;

  newState.nodeMap.set(key, { ...node, ...updates } as EditorNode);
  return newState;
}

// Serialize/deserialize for persistence
export function serializeState(state: EditorState): string {
  const cleanNodeMap: Record<string, any> = {};

  state.nodeMap.forEach((node, key) => {
    if (node.type === 'image') {
      // Strip transient src field, keep assetId
      const { src, ...rest } = node as ImageNode;
      cleanNodeMap[key] = rest;
    } else if (node.type === 'drawio') {
      // Strip transient diagramXML field, keep assetId
      const { diagramXML, ...rest } = node as DrawioNode;
      cleanNodeMap[key] = rest;
    } else {
      cleanNodeMap[key] = node;
    }
  });

  const obj = {
    root: state.root,
    nodeMap: cleanNodeMap,
    version: state.version,
  };
  return JSON.stringify(obj);
}

// Pattern for detecting HTML fragment corruption (e.g., "/head" from "</head>")
const CORRUPTION_PATTERNS = [
  /\/head(?:\s|$|[?!.])/gi,  // /head from </head>
  /\/body(?:\s|$|[?!.])/gi,  // /body from </body>
  /\/script(?:\s|$|[?!.])/gi, // /script from </script>
  /\/style(?:\s|$|[?!.])/gi,  // /style from </style>
  /\/html(?:\s|$|[?!.])/gi,   // /html from </html>
];

function cleanCorruptedText(text: string): string {
  let cleaned = text;
  let wasCorrupted = false;

  for (const pattern of CORRUPTION_PATTERNS) {
    if (pattern.test(cleaned)) {
      wasCorrupted = true;
      cleaned = cleaned.replace(pattern, '');
    }
  }

  if (wasCorrupted) {
    console.warn('[EditorState] Cleaned corrupted text:', { original: text, cleaned });
  }

  return cleaned.trim();
}

export function deserializeState(json: string): EditorState | null {
  try {
    const obj = JSON.parse(json);
    if (!obj.root || !obj.nodeMap) return null;

    // Check for and clean corruption in text nodes
    const cleanedNodeMap: Record<string, any> = {};
    for (const [key, node] of Object.entries(obj.nodeMap)) {
      const typedNode = node as any;
      if (typedNode.type === 'text' && typeof typedNode.text === 'string') {
        const originalText = typedNode.text;
        const cleanedText = cleanCorruptedText(originalText);
        if (cleanedText !== originalText) {
          cleanedNodeMap[key] = { ...typedNode, text: cleanedText };
        } else {
          cleanedNodeMap[key] = typedNode;
        }
      } else {
        cleanedNodeMap[key] = typedNode;
      }
    }

    // Validate parent references - check for orphaned nodes and remove them
    const nodeKeys = new Set(Object.keys(cleanedNodeMap));
    const orphanedKeys: string[] = [];

    for (const [key, node] of Object.entries(cleanedNodeMap)) {
      const typedNode = node as any;
      if (typedNode.parent && !nodeKeys.has(typedNode.parent)) {
        console.warn('[EditorState] Removing orphaned node:', key, 'references missing parent:', typedNode.parent);
        orphanedKeys.push(key);
      }
    }

    // Remove orphaned nodes instead of failing
    for (const key of orphanedKeys) {
      delete cleanedNodeMap[key];
    }

    if (orphanedKeys.length > 0) {
      console.warn('[EditorState] Cleaned up', orphanedKeys.length, 'orphaned nodes');
    }

    return {
      root: obj.root,
      nodeMap: new Map(Object.entries(cleanedNodeMap)),
      version: obj.version || 0,
    };
  } catch (e) {
    console.error('[EditorState] Failed to deserialize:', e);
    return null;
  }
}
