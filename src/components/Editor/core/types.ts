// Node Types
export type NodeType =
  | 'root'
  | 'paragraph'
  | 'heading'
  | 'text'
  | 'list'
  | 'listitem'
  | 'quote'
  | 'code'
  | 'link'
  | 'image'
  | 'drawio'
  | 'divider'
  | 'table'
  | 'tablerow'
  | 'tablecell'
  | 'admonition';

export type HeadingLevel = 1 | 2 | 3 | 4 | 5;
export type ListType = 'bullet' | 'number';
export type AdmonitionType = 'note' | 'info' | 'tip' | 'warning' | 'danger';

export interface TextFormat {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
}

// Base node interface
export interface BaseNode {
  key: string;
  type: NodeType;
  parent: string | null;
}

// Root node - contains all content
export interface RootNode extends BaseNode {
  type: 'root';
  children: string[];
}

// Paragraph node
export interface ParagraphNode extends BaseNode {
  type: 'paragraph';
  children: string[];
  indent?: number;
}

// Heading node
export interface HeadingNode extends BaseNode {
  type: 'heading';
  level: HeadingLevel;
  children: string[];
}

// Text node - leaf node containing actual text
export interface TextNode extends BaseNode {
  type: 'text';
  text: string;
  format: TextFormat;
}

// List node
export interface ListNode extends BaseNode {
  type: 'list';
  listType: ListType;
  children: string[];
}

// List item node
export interface ListItemNode extends BaseNode {
  type: 'listitem';
  children: string[];
  indent: number;
}

// Quote node
export interface QuoteNode extends BaseNode {
  type: 'quote';
  children: string[];
}

// Code block node
export interface CodeNode extends BaseNode {
  type: 'code';
  language?: string;
  children: string[];
}

// Link node - inline, wraps text
export interface LinkNode extends BaseNode {
  type: 'link';
  url: string;
  children: string[];
}

// Image node - decorator/void node
export interface ImageNode extends BaseNode {
  type: 'image';
  assetId?: string;  // Reference to DocumentAsset (persisted)
  src?: string;      // Data URL for display (transient, not persisted)
  alt: string;
  width?: number;
  height?: number;
}

// Draw.io diagram node - decorator/void node
export interface DrawioNode extends BaseNode {
  type: 'drawio';
  assetId?: string;    // Reference to DocumentAsset (persisted)
  diagramXML?: string; // XML for display (transient, not persisted)
}

// Table node
export interface TableNode extends BaseNode {
  type: 'table';
  children: string[]; // TableRowNode keys
  colWidths?: number[];
}

// Table row node
export interface TableRowNode extends BaseNode {
  type: 'tablerow';
  children: string[]; // TableCellNode keys
}

// Table cell node
export interface TableCellNode extends BaseNode {
  type: 'tablecell';
  children: string[]; // Text or other inline content
  colSpan?: number;
  rowSpan?: number;
  isHeader?: boolean;
}

// Admonition node (note, info, tip, warning, danger)
export interface AdmonitionNode extends BaseNode {
  type: 'admonition';
  admonitionType: AdmonitionType;
  children: string[];
}

// Divider/Horizontal rule node - void node (no children)
export interface DividerNode extends BaseNode {
  type: 'divider';
}

// Union of all node types
export type EditorNode =
  | RootNode
  | ParagraphNode
  | HeadingNode
  | TextNode
  | ListNode
  | ListItemNode
  | QuoteNode
  | CodeNode
  | LinkNode
  | ImageNode
  | DrawioNode
  | TableNode
  | TableRowNode
  | TableCellNode
  | AdmonitionNode
  | DividerNode;

// Element nodes (have children)
export type ElementNode =
  | RootNode
  | ParagraphNode
  | HeadingNode
  | ListNode
  | ListItemNode
  | QuoteNode
  | CodeNode
  | LinkNode
  | TableNode
  | TableRowNode
  | TableCellNode
  | AdmonitionNode;

// Type guards
export function isElementNode(node: EditorNode): node is ElementNode {
  return 'children' in node;
}

export function isTextNode(node: EditorNode): node is TextNode {
  return node.type === 'text';
}

export function isDecoratorNode(node: EditorNode): node is ImageNode | DrawioNode {
  return node.type === 'image' || node.type === 'drawio';
}

export function isTableNode(node: EditorNode): node is TableNode {
  return node.type === 'table';
}

// Editor State
export interface EditorState {
  root: string;
  nodeMap: Map<string, EditorNode>;
  version: number;
}

// Selection
export interface SelectionPoint {
  key: string;
  offset: number;
}

export interface EditorSelection {
  anchor: SelectionPoint;
  focus: SelectionPoint;
  isCollapsed: boolean;
  isBackward: boolean;
}

// Commands
export type CommandType =
  | 'INSERT_TEXT'
  | 'INSERT_PARAGRAPH'
  | 'INSERT_PARAGRAPH_AFTER'
  | 'DELETE_BACKWARD'
  | 'DELETE_FORWARD'
  | 'DELETE_RANGE'
  | 'FORMAT_TEXT'
  | 'SET_BLOCK_TYPE'
  | 'TOGGLE_LIST'
  | 'INSERT_IMAGE'
  | 'INSERT_DRAWIO'
  | 'INSERT_DIVIDER'
  | 'INSERT_HTML'
  | 'INSERT_TABLE'
  | 'ADD_TABLE_ROW'
  | 'ADD_TABLE_COL'
  | 'TABLE_NAV_NEXT'
  | 'TABLE_NAV_PREV'
  | 'INSERT_TABLE_ROW_AT'
  | 'INSERT_TABLE_COL_AT'
  | 'DELETE_TABLE_ROW'
  | 'DELETE_TABLE_COL'
  | 'MOVE_TABLE_ROW'
  | 'MOVE_TABLE_COL'
  | 'DUPLICATE_TABLE_ROW'
  | 'DUPLICATE_TABLE_COL'
  | 'INSERT_LINK'
  | 'UPDATE_LINK'
  | 'REMOVE_LINK'
  | 'INSERT_ADMONITION'
  | 'DUPLICATE_BLOCK'
  | 'DELETE_BLOCK'
  | 'MOVE_BLOCK'
  | 'UNDO'
  | 'REDO';

export interface EditorCommand {
  type: CommandType;
  payload?: unknown;
}

export interface InsertTextCommand extends EditorCommand {
  type: 'INSERT_TEXT';
  payload: { text: string };
}

export interface FormatTextCommand extends EditorCommand {
  type: 'FORMAT_TEXT';
  payload: { format: keyof TextFormat };
}

export interface SetBlockTypeCommand extends EditorCommand {
  type: 'SET_BLOCK_TYPE';
  payload: { blockType: 'paragraph' | 'heading' | 'quote' | 'code'; level?: HeadingLevel };
}

export interface ToggleListCommand extends EditorCommand {
  type: 'TOGGLE_LIST';
  payload: { listType: ListType };
}
