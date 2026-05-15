import {
  EditorState,
  EditorSelection,
  EditorCommand,
  TextFormat,
  HeadingLevel,
  ListType,
  AdmonitionType,
  ListNode,
  TextNode,
  EditorNode,
  isTextNode,
  isElementNode,
  ParagraphNode,
  ImageNode,
  DrawioNode,
} from './types';
import { OperationLogger } from './OperationLogger';
import { Operation } from './Operations';
import {
  createEmptyState,
  cloneState,
  getNode,
  getBlockAncestor,
  findFirstTextNode,
  findLastTextNode,
  getPreviousSibling,
  createTextNode,
  createParagraphNode,
  createHeadingNode,
  createQuoteNode,
  createCodeNode,
  createListNode,
  createListItemNode,
  createLinkNode,
  createImageNode,
  createDrawioNode,
  createDividerNode,
  createAdmonitionNode,
  createTableNode,
  createTableRowNode,
  createTableCellNode,
  insertNode,
  removeNode,
  updateNode,
  serializeState,
  deserializeState,
} from './EditorState';
import { DOMReconciler } from './DOMReconciler';
import {
  getSelection,
  setSelection,
  createCollapsedSelection,
} from './Selection';
import { HistoryManager } from './History';

export type EditorListener = (state: EditorState, selection: EditorSelection | null) => void;

export interface EditorCoreConfig {
  initialState?: string;
  onChange?: (serializedState: string) => void;
  onSyncOperations?: (ops: Operation[]) => void;
  syncDebounceMs?: number;
  readOnly?: boolean;
}

export class EditorCore {
  private state: EditorState;
  private selection: EditorSelection | null = null;
  private container: HTMLElement | null = null;
  private reconciler: DOMReconciler;
  private history: HistoryManager;
  private listeners: Set<EditorListener> = new Set();
  private config: EditorCoreConfig;
  private isComposing: boolean = false;
  private isRendering: boolean = false;
  private opLogger: OperationLogger | null = null;
  private compositionTimeout: NodeJS.Timeout | null = null;

  constructor(config: EditorCoreConfig = {}) {
    this.config = config;

    // Initialize state
    if (config.initialState) {
      const parsed = deserializeState(config.initialState);
      // Validate parsed state - ensure we can find a text node
      if (parsed && findFirstTextNode(parsed, parsed.root)) {
        this.state = parsed;
      } else {
        console.log('EditorCore: invalid initial state, creating empty state');
        this.state = createEmptyState();
      }
    } else {
      this.state = createEmptyState();
    }

    this.reconciler = new DOMReconciler({
      onCodeLanguageChange: (nodeKey, language) => {
        this.dispatchCommand({
          type: 'SET_CODE_LANGUAGE',
          payload: { nodeKey, language }
        });
      }
    });
    this.history = new HistoryManager();

    // Initialize operation logger for delta sync
    if (config.onSyncOperations) {
      this.opLogger = new OperationLogger(
        config.onSyncOperations,
        config.syncDebounceMs || 1000
      );
    }

    // Push initial state to history
    this.history.forcePush(this.state, null);
  }

  // Mount editor to DOM element
  mount(element: HTMLElement): void {
    this.container = element;

    // Set up contentEditable based on readOnly mode
    element.contentEditable = this.config.readOnly ? 'false' : 'true';
    element.setAttribute('data-editor-root', 'true');
    element.setAttribute('spellcheck', this.config.readOnly ? 'false' : 'true');
    if (this.config.readOnly) {
      element.setAttribute('data-readonly', 'true');
    }

    // Initial render
    this.reconciler.reconcile(this.state, element);

    // Set up event listeners (only if not read-only)
    if (!this.config.readOnly) {
      this.setupEventListeners();

      // Focus and set initial selection
      element.focus();
      const firstText = findFirstTextNode(this.state, this.state.root);
      if (firstText) {
        this.selection = createCollapsedSelection(firstText.key, 0);
        setSelection(this.selection, this.state, element);
      }
    }
  }

  // Unmount and clean up
  destroy(): void {
    if (this.compositionTimeout) {
      clearTimeout(this.compositionTimeout);
      this.compositionTimeout = null;
    }
    if (this.container) {
      this.container.removeEventListener('beforeinput', this.handleBeforeInput);
      this.container.removeEventListener('keydown', this.handleKeyDown);
      this.container.removeEventListener('click', this.handleClick);
      this.container.removeEventListener('mousedown', this.handleMouseDown);
      this.container.removeEventListener('compositionstart', this.handleCompositionStart);
      this.container.removeEventListener('compositionend', this.handleCompositionEnd);
      this.container.removeEventListener('paste', this.handlePaste);
      this.container.removeEventListener('focus', this.handleFocus);
      document.removeEventListener('selectionchange', this.handleSelectionChange);
    }
    this.opLogger?.clear();
    this.listeners.clear();
  }

  // Subscribe to state changes
  subscribe(listener: EditorListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Get current state
  getState(): EditorState {
    return this.state;
  }

  // Get current selection
  getSelection(): EditorSelection | null {
    return this.selection;
  }

  // Set selection programmatically
  setSelection(selection: EditorSelection | null): void {
    this.selection = selection;
    if (selection && this.container) {
      setSelection(selection, this.state, this.container);
    }
  }

  // Get container element
  getContainer(): HTMLElement | null {
    return this.container;
  }

  // Check if editor is in read-only mode
  isReadOnly(): boolean {
    return this.config.readOnly ?? false;
  }

  // Update node for display only (doesn't trigger onChange - used for loading cached media)
  updateNodeDisplay(nodeKey: string, updates: Partial<EditorNode>): void {
    const node = this.state.nodeMap.get(nodeKey);
    if (node) {
      this.state.nodeMap.set(nodeKey, { ...node, ...updates } as EditorNode);
      if (this.container) {
        this.reconciler.reconcile(this.state, this.container);
      }
      // Don't notify listeners or call onChange - this is display-only update
    }
  }

  // Mark operations as synced (called after successful backend sync)
  markSynced(lastOpId: string): void {
    this.opLogger?.markSynced(lastOpId);
  }

  // Get unsynced operations for manual sync
  getUnsyncedOperations(): Operation[] {
    return this.opLogger?.getUnsynced() || [];
  }

  // Force flush pending operations
  flushOperations(): void {
    this.opLogger?.flushNow();
  }

  // Clear all pending operations (used after full state sync)
  clearOperations(): void {
    this.opLogger?.clear();
  }

  // Dispatch a command
  dispatchCommand(command: EditorCommand): void {
    switch (command.type) {
      case 'INSERT_TEXT':
        this.insertText((command.payload as { text: string }).text);
        break;
      case 'INSERT_PARAGRAPH':
        this.insertParagraph();
        break;
      case 'INSERT_PARAGRAPH_AFTER':
        this.insertParagraphAfter((command.payload as { blockKey: string }).blockKey);
        break;
      case 'DELETE_BACKWARD':
        this.deleteBackward();
        break;
      case 'DELETE_FORWARD':
        this.deleteForward();
        break;
      case 'DELETE_RANGE':
        const rangePayload = command.payload as { nodeKey: string; startOffset: number; endOffset: number };
        this.deleteRange(rangePayload.nodeKey, rangePayload.startOffset, rangePayload.endOffset);
        break;
      case 'FORMAT_TEXT':
        this.formatText((command.payload as { format: keyof TextFormat }).format);
        break;
      case 'SET_BLOCK_TYPE':
        const blockPayload = command.payload as { blockType: string; level?: HeadingLevel };
        this.setBlockType(blockPayload.blockType, blockPayload.level);
        break;
      case 'TOGGLE_LIST':
        this.toggleList((command.payload as { listType: ListType }).listType);
        break;
      case 'INSERT_IMAGE':
        const imagePayload = command.payload as { src: string; alt: string; assetId?: string };
        this.insertImage(imagePayload.src, imagePayload.alt, imagePayload.assetId);
        break;
      case 'UPDATE_IMAGE':
        const updateImagePayload = command.payload as { src: string; alt: string; assetId?: string };
        this.updateLastImage(updateImagePayload.src, updateImagePayload.alt, updateImagePayload.assetId);
        break;
      case 'INSERT_DRAWIO':
        const drawioPayload = command.payload as { diagramXML: string; assetId?: string };
        this.insertDrawio(drawioPayload.diagramXML, drawioPayload.assetId);
        break;
      case 'UPDATE_DRAWIO':
        const updateDrawioPayload = command.payload as { diagramXML: string; assetId?: string };
        this.updateLastDrawio(updateDrawioPayload.diagramXML, updateDrawioPayload.assetId);
        break;
      case 'INSERT_DIVIDER':
        this.insertDivider();
        break;
      case 'INSERT_HTML':
        const htmlPayload = command.payload as { html: string };
        this.insertHtml(htmlPayload.html);
        break;
      case 'INSERT_TABLE':
        const tablePayload = command.payload as { rows: number; cols: number };
        this.insertTable(tablePayload.rows, tablePayload.cols);
        break;
      case 'ADD_TABLE_ROW':
        this.addTableRow((command.payload as { tableKey: string }).tableKey);
        break;
      case 'ADD_TABLE_COL':
        this.addTableCol((command.payload as { tableKey: string }).tableKey);
        break;
      case 'TABLE_NAV_NEXT':
        this.tableNavNext();
        break;
      case 'TABLE_NAV_PREV':
        this.tableNavPrev();
        break;
      case 'INSERT_TABLE_ROW_AT':
        const insertRowPayload = command.payload as { tableKey: string; atIndex: number };
        this.insertTableRowAt(insertRowPayload.tableKey, insertRowPayload.atIndex);
        break;
      case 'INSERT_TABLE_COL_AT':
        const insertColPayload = command.payload as { tableKey: string; atIndex: number };
        this.insertTableColAt(insertColPayload.tableKey, insertColPayload.atIndex);
        break;
      case 'DELETE_TABLE_ROW':
        const delRowPayload = command.payload as { tableKey: string; rowIndex: number };
        this.deleteTableRow(delRowPayload.tableKey, delRowPayload.rowIndex);
        break;
      case 'DELETE_TABLE_COL':
        const delColPayload = command.payload as { tableKey: string; colIndex: number };
        this.deleteTableCol(delColPayload.tableKey, delColPayload.colIndex);
        break;
      case 'MOVE_TABLE_ROW':
        const moveRowPayload = command.payload as { tableKey: string; fromIndex: number; toIndex: number };
        this.moveTableRow(moveRowPayload.tableKey, moveRowPayload.fromIndex, moveRowPayload.toIndex);
        break;
      case 'MOVE_TABLE_COL':
        const moveColPayload = command.payload as { tableKey: string; fromIndex: number; toIndex: number };
        this.moveTableCol(moveColPayload.tableKey, moveColPayload.fromIndex, moveColPayload.toIndex);
        break;
      case 'DUPLICATE_TABLE_ROW':
        const dupRowPayload = command.payload as { tableKey: string; rowIndex: number };
        this.duplicateTableRow(dupRowPayload.tableKey, dupRowPayload.rowIndex);
        break;
      case 'DUPLICATE_TABLE_COL':
        const dupColPayload = command.payload as { tableKey: string; colIndex: number };
        this.duplicateTableCol(dupColPayload.tableKey, dupColPayload.colIndex);
        break;
      case 'INSERT_ADMONITION':
        const admonitionPayload = command.payload as { admonitionType: 'note' | 'info' | 'tip' | 'warning' | 'danger' };
        this.insertAdmonition(admonitionPayload.admonitionType);
        break;
      case 'SET_CODE_LANGUAGE':
        const codeLangPayload = command.payload as { nodeKey: string; language: string };
        this.setCodeLanguage(codeLangPayload.nodeKey, codeLangPayload.language);
        break;
      case 'INSERT_LINK':
        const linkPayload = command.payload as { url: string };
        this.insertLink(linkPayload.url);
        break;
      case 'UPDATE_LINK':
        const updateLinkPayload = command.payload as { nodeKey: string; textNodeKey: string; url: string; text: string };
        this.updateLink(updateLinkPayload.nodeKey, updateLinkPayload.textNodeKey, updateLinkPayload.url, updateLinkPayload.text);
        break;
      case 'REMOVE_LINK':
        const removeLinkPayload = command.payload as { nodeKey: string };
        this.removeLink(removeLinkPayload.nodeKey);
        break;
      case 'DUPLICATE_BLOCK':
        const dupBlockPayload = command.payload as { blockKey: string };
        this.duplicateBlock(dupBlockPayload.blockKey);
        break;
      case 'DELETE_BLOCK':
        const delBlockPayload = command.payload as { blockKey: string };
        this.deleteBlock(delBlockPayload.blockKey);
        break;
      case 'MOVE_BLOCK':
        const moveBlockPayload = command.payload as { blockKey: string; targetKey: string; position: 'before' | 'after' };
        this.moveBlock(moveBlockPayload.blockKey, moveBlockPayload.targetKey, moveBlockPayload.position);
        break;
      case 'UNDO':
        this.undo();
        break;
      case 'REDO':
        this.redo();
        break;
    }
  }

  // Check if can undo/redo
  canUndo(): boolean {
    return this.history.canUndo();
  }

  canRedo(): boolean {
    return this.history.canRedo();
  }

  // Check current formatting at selection
  getActiveFormats(): TextFormat {
    if (!this.selection) return {};
    const node = getNode(this.state, this.selection.anchor.key);
    if (node && isTextNode(node)) {
      return { ...node.format };
    }
    return {};
  }

  // Check current block type at selection
  getActiveBlockType(): string {
    if (!this.selection) return 'paragraph';
    const block = getBlockAncestor(this.state, this.selection.anchor.key);
    return block?.type || 'paragraph';
  }

  // Private methods

  private setupEventListeners(): void {
    if (!this.container) return;

    this.container.addEventListener('beforeinput', this.handleBeforeInput);
    this.container.addEventListener('keydown', this.handleKeyDown);
    this.container.addEventListener('click', this.handleClick);
    this.container.addEventListener('mousedown', this.handleMouseDown);
    this.container.addEventListener('compositionstart', this.handleCompositionStart);
    this.container.addEventListener('compositionend', this.handleCompositionEnd);
    this.container.addEventListener('paste', this.handlePaste);
    this.container.addEventListener('focus', this.handleFocus);
    document.addEventListener('selectionchange', this.handleSelectionChange);
  }

  private handleBeforeInput = (e: InputEvent): void => {
    // Don't handle during IME composition
    if (this.isComposing) {
      console.log('[EditorCore] handleBeforeInput: skipping due to isComposing');
      return;
    }

    e.preventDefault();

    // Ensure we have a valid selection before processing input
    if (!this.selection) {
      console.log('[EditorCore] handleBeforeInput: no selection, calling ensureValidState');
      this.ensureValidState();
      if (!this.selection) {
        console.log('[EditorCore] handleBeforeInput: still no selection after ensureValidState');
        return; // Still no selection, can't process
      }
    }

    console.log('[EditorCore] handleBeforeInput:', e.inputType, 'selection:', this.selection);

    switch (e.inputType) {
      case 'insertText':
        if (e.data) this.insertText(e.data);
        break;
      case 'insertParagraph':
      case 'insertLineBreak':
        console.log('[EditorCore] handleBeforeInput: calling insertParagraph for', e.inputType);
        this.insertParagraph();
        break;
      case 'deleteContentBackward':
        this.deleteBackward();
        break;
      case 'deleteContentForward':
        this.deleteForward();
        break;
      case 'deleteByCut':
        this.deleteBackward();
        break;
      case 'insertFromPaste':
        // Handled by paste event listener
        break;
    }
  };

  private handleKeyDown = (e: KeyboardEvent): void => {
    const isMod = e.metaKey || e.ctrlKey;

    // Undo: Cmd/Ctrl + Z
    if (isMod && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      this.undo();
      return;
    }

    // Redo: Cmd/Ctrl + Shift + Z or Cmd/Ctrl + Y
    if ((isMod && e.key === 'z' && e.shiftKey) || (isMod && e.key === 'y')) {
      e.preventDefault();
      this.redo();
      return;
    }

    // Bold: Cmd/Ctrl + B
    if (isMod && e.key === 'b') {
      e.preventDefault();
      this.formatText('bold');
      return;
    }

    // Italic: Cmd/Ctrl + I
    if (isMod && e.key === 'i') {
      e.preventDefault();
      this.formatText('italic');
      return;
    }

    // Underline: Cmd/Ctrl + U
    if (isMod && e.key === 'u') {
      e.preventDefault();
      this.formatText('underline');
      return;
    }

    // Enter key - insert paragraph (fallback for browsers that don't fire beforeinput)
    if (e.key === 'Enter' && !e.shiftKey && !e.metaKey && !e.ctrlKey) {
      // Check if we're in a code block - Enter in code block inserts newline
      const codeBlockCtx = this.getCodeBlockAncestor();
      if (codeBlockCtx) {
        e.preventDefault();
        this.insertText('\n');
        return;
      }

      // Check if we're in a table - Enter in table should not create paragraph
      const tableCtx = this.getTableContext();
      if (!tableCtx) {
        e.preventDefault();
        this.insertParagraph();
        return;
      }
    }

    // Backspace key - delete backward (fallback for browsers that don't fire beforeinput)
    if (e.key === 'Backspace' && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      this.deleteBackward();
      return;
    }

    // Delete key - delete forward (fallback)
    if (e.key === 'Delete' && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      this.deleteForward();
      return;
    }

    // Shift+Enter to exit code block or admonition
    if (e.key === 'Enter' && e.shiftKey) {
      const codeBlockCtx = this.getCodeBlockAncestor();
      if (codeBlockCtx) {
        e.preventDefault();
        this.exitCodeBlock(codeBlockCtx.key);
        return;
      }

      const admonitionAncestor = this.getAdmonitionAncestor();
      if (admonitionAncestor) {
        e.preventDefault();
        this.exitAdmonition(admonitionAncestor.key);
        return;
      }
    }

    // Escape to exit table
    if (e.key === 'Escape') {
      const tableCtx = this.getTableContext();
      if (tableCtx) {
        e.preventDefault();
        this.exitTable(tableCtx.tableKey, 'after');
        return;
      }
    }

    // Arrow keys for table exit
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      const tableCtx = this.getTableContext();
      if (tableCtx) {
        const table = getNode(this.state, tableCtx.tableKey) as any;
        const rows = table.children;

        // Arrow Down from last row - exit below
        if (e.key === 'ArrowDown' && tableCtx.rowIndex === rows.length - 1) {
          e.preventDefault();
          this.exitTable(tableCtx.tableKey, 'after');
          return;
        }

        // Arrow Up from first row - exit above
        if (e.key === 'ArrowUp' && tableCtx.rowIndex === 0) {
          e.preventDefault();
          this.exitTable(tableCtx.tableKey, 'before');
          return;
        }
      }

      // Handle arrow navigation across void nodes (divider, image, drawio)
      if (!this.selection) return;
      const block = getBlockAncestor(this.state, this.selection.anchor.key);
      if (!block || !block.parent) return;

      const parent = getNode(this.state, block.parent);
      if (!parent || !isElementNode(parent)) return;

      const blockIndex = parent.children.indexOf(block.key);

      // ArrowUp - check if cursor is at the start of the block
      if (e.key === 'ArrowUp') {
        const textNode = getNode(this.state, this.selection.anchor.key);
        if (textNode && isTextNode(textNode) && this.selection.anchor.offset === 0) {
          // Look for previous sibling
          if (blockIndex > 0) {
            const prevKey = parent.children[blockIndex - 1];
            const prevBlock = getNode(this.state, prevKey);
            if (prevBlock && this.isVoidNode(prevBlock)) {
              // Skip the void node and go to the block before it
              e.preventDefault();
              if (blockIndex > 1) {
                const targetKey = parent.children[blockIndex - 2];
                const targetText = findLastTextNode(this.state, targetKey);
                if (targetText) {
                  this.selection = createCollapsedSelection(targetText.key, targetText.text.length);
                  this.render();
                }
              }
              return;
            }
          }
        }
      }

      // ArrowDown - check if cursor is at the end of the block
      if (e.key === 'ArrowDown') {
        const textNode = getNode(this.state, this.selection.anchor.key);
        if (textNode && isTextNode(textNode) && this.selection.anchor.offset === textNode.text.length) {
          // Look for next sibling
          if (blockIndex < parent.children.length - 1) {
            const nextKey = parent.children[blockIndex + 1];
            const nextBlock = getNode(this.state, nextKey);
            if (nextBlock && this.isVoidNode(nextBlock)) {
              // Skip the void node and go to the block after it
              e.preventDefault();
              if (blockIndex < parent.children.length - 2) {
                const targetKey = parent.children[blockIndex + 2];
                const targetText = findFirstTextNode(this.state, targetKey);
                if (targetText) {
                  this.selection = createCollapsedSelection(targetText.key, 0);
                  this.render();
                }
              }
              return;
            }
          }
        }
      }
    }

    // Handle ArrowLeft/ArrowRight for void node navigation
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      if (!this.selection) return;
      const block = getBlockAncestor(this.state, this.selection.anchor.key);
      if (!block || !block.parent) return;

      const parent = getNode(this.state, block.parent);
      if (!parent || !isElementNode(parent)) return;

      const blockIndex = parent.children.indexOf(block.key);

      if (e.key === 'ArrowLeft') {
        const textNode = getNode(this.state, this.selection.anchor.key);
        if (textNode && isTextNode(textNode) && this.selection.anchor.offset === 0) {
          if (blockIndex > 0) {
            const prevKey = parent.children[blockIndex - 1];
            const prevBlock = getNode(this.state, prevKey);
            if (prevBlock && this.isVoidNode(prevBlock)) {
              e.preventDefault();
              if (blockIndex > 1) {
                const targetKey = parent.children[blockIndex - 2];
                const targetText = findLastTextNode(this.state, targetKey);
                if (targetText) {
                  this.selection = createCollapsedSelection(targetText.key, targetText.text.length);
                  this.render();
                }
              }
              return;
            }
          }
        }
      }

      if (e.key === 'ArrowRight') {
        const textNode = getNode(this.state, this.selection.anchor.key);
        if (textNode && isTextNode(textNode) && this.selection.anchor.offset === textNode.text.length) {
          if (blockIndex < parent.children.length - 1) {
            const nextKey = parent.children[blockIndex + 1];
            const nextBlock = getNode(this.state, nextKey);
            if (nextBlock && this.isVoidNode(nextBlock)) {
              e.preventDefault();
              if (blockIndex < parent.children.length - 2) {
                const targetKey = parent.children[blockIndex + 2];
                const targetText = findFirstTextNode(this.state, targetKey);
                if (targetText) {
                  this.selection = createCollapsedSelection(targetText.key, 0);
                  this.render();
                }
              }
              return;
            }
          }
        }
      }
    }

    // Tab for table navigation or list indent
    if (e.key === 'Tab') {
      // Check if we're in a table
      const tableCtx = this.getTableContext();
      if (tableCtx) {
        e.preventDefault();
        if (e.shiftKey) {
          this.tableNavPrev();
        } else {
          this.tableNavNext();
        }
        return;
      }

      const block = this.selection ? getBlockAncestor(this.state, this.selection.anchor.key) : null;
      if (block?.type === 'listitem') {
        e.preventDefault();
        const listItem = block as any;
        const currentIndent = listItem.indent || 0;

        if (e.shiftKey) {
          // Outdent - decrease indent level (min 0)
          if (currentIndent > 0) {
            this.history.push(this.state, this.selection);
            this.state = updateNode(this.state, block.key, { indent: currentIndent - 1 });
            this.render();
          }
        } else {
          // Indent - increase indent level (max 4)
          if (currentIndent < 4) {
            this.history.push(this.state, this.selection);
            this.state = updateNode(this.state, block.key, { indent: currentIndent + 1 });
            this.render();
          }
        }
      }
    }
  };

  private handleClick = (e: MouseEvent): void => {
    const target = e.target as HTMLElement;

    // Handle table add row/col buttons
    const action = target.getAttribute('data-action');
    const tableKey = target.getAttribute('data-table-key');

    if (action && tableKey) {
      e.preventDefault();
      e.stopPropagation();

      if (action === 'add-row') {
        this.addTableRow(tableKey);
      } else if (action === 'add-col') {
        this.addTableCol(tableKey);
      }
      return;
    }

    // Check if click is in the empty area below content (padding area)
    // This allows adding a paragraph when clicking below decorator nodes
    if (target === this.container || target.classList.contains('editorInput')) {
      const containerRect = this.container?.getBoundingClientRect();
      if (!containerRect) return;

      // Get the last block's position
      const root = getNode(this.state, this.state.root);
      if (!root || !isElementNode(root) || root.children.length === 0) return;

      const lastChildKey = root.children[root.children.length - 1];
      const lastBlockElement = this.container?.querySelector(`[data-editor-key="${lastChildKey}"]`);

      if (lastBlockElement) {
        const lastBlockRect = lastBlockElement.getBoundingClientRect();

        // If click is below the last block, ensure there's a paragraph and focus it
        if (e.clientY > lastBlockRect.bottom + 10) {
          const lastChild = getNode(this.state, lastChildKey);
          if (lastChild) {
            const decoratorTypes = ['image', 'drawio', 'divider', 'table'];
            if (decoratorTypes.includes(lastChild.type)) {
              this.ensureTrailingParagraph();
              this.render();

              // Focus the new paragraph
              const updatedRoot = getNode(this.state, this.state.root);
              if (updatedRoot && isElementNode(updatedRoot)) {
                const newLastChildKey = updatedRoot.children[updatedRoot.children.length - 1];
                const firstText = findFirstTextNode(this.state, newLastChildKey);
                if (firstText) {
                  this.selection = createCollapsedSelection(firstText.key, 0);
                  this.render();
                  this.container?.focus();
                }
              }
            }
          }
        }
      }
    }
  };

  private handleMouseDown = (e: MouseEvent): void => {
    const target = e.target as HTMLElement;

    // Handle table column resize
    if (target.classList.contains('editorTableResizeHandle')) {
      e.preventDefault();
      e.stopPropagation();

      const cell = target.closest('.editorTableCell') as HTMLElement;
      if (!cell) return;

      const table = target.closest('.editorTable') as HTMLTableElement;
      if (!table) return;

      const tableWrapper = table.closest('.editorTableWrapper') as HTMLElement;
      const tableKey = tableWrapper?.getAttribute('data-editor-key');

      const startX = e.clientX;
      const startWidth = cell.offsetWidth;
      const colIndex = parseInt(target.getAttribute('data-col-index') || '0');

      // Calculate max width - leave room for other columns and some padding
      const tableRect = table.getBoundingClientRect();
      const containerRect = this.container?.getBoundingClientRect();
      const maxTableWidth = containerRect ? containerRect.width - 40 : tableRect.width;

      // Get total width of other columns
      const firstRow = table.querySelector('tr');
      const cells = firstRow?.querySelectorAll('td, th');
      let otherColumnsWidth = 0;
      cells?.forEach((c, idx) => {
        if (idx !== colIndex) {
          otherColumnsWidth += (c as HTMLElement).offsetWidth;
        }
      });

      // Max width for this column = available space minus other columns, with a buffer
      const maxWidth = Math.max(200, maxTableWidth - otherColumnsWidth - 20);

      // Add resizing class
      target.classList.add('resizing');

      let currentWidth = startWidth;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const delta = moveEvent.clientX - startX;
        currentWidth = Math.max(60, Math.min(maxWidth, startWidth + delta));

        // Update width for all cells in this column
        const rows = table.querySelectorAll('tr');
        rows.forEach(row => {
          const cells = row.querySelectorAll('td, th');
          if (cells[colIndex]) {
            (cells[colIndex] as HTMLElement).style.width = `${currentWidth}px`;
            (cells[colIndex] as HTMLElement).style.minWidth = `${currentWidth}px`;
          }
        });
      };

      const handleMouseUp = () => {
        target.classList.remove('resizing');
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);

        // Persist column widths to state
        if (tableKey) {
          const tableNode = getNode(this.state, tableKey);
          if (tableNode && tableNode.type === 'table') {
            // Get current widths of all columns
            const colWidths: number[] = [];
            const headerCells = firstRow?.querySelectorAll('td, th');
            headerCells?.forEach((c) => {
              colWidths.push((c as HTMLElement).offsetWidth);
            });

            // Update state with new column widths
            this.state = updateNode(this.state, tableKey, { colWidths });

            // Log operation for delta sync
            if (this.opLogger) {
              this.opLogger.logNodeUpdate(tableKey, { colWidths });
            }

            this.render();
          }
        }
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
  };

  private handleCompositionStart = (): void => {
    this.isComposing = true;

    // Safety timeout - reset isComposing after 10 seconds in case compositionend never fires
    if (this.compositionTimeout) {
      clearTimeout(this.compositionTimeout);
    }
    this.compositionTimeout = setTimeout(() => {
      if (this.isComposing) {
        console.warn('EditorCore: composition timeout, resetting isComposing flag');
        this.isComposing = false;
      }
    }, 10000);
  };

  private handleCompositionEnd = (e: CompositionEvent): void => {
    // Clear the safety timeout
    if (this.compositionTimeout) {
      clearTimeout(this.compositionTimeout);
      this.compositionTimeout = null;
    }

    this.isComposing = false;
    if (e.data) {
      this.insertText(e.data);
    }
  };

  // Recovery method - ensures editor is in a valid, editable state
  private ensureValidState(): void {
    // Reset flags that might be stuck
    this.isComposing = false;
    this.isRendering = false;

    // Ensure we have a valid selection
    if (!this.selection) {
      const firstText = findFirstTextNode(this.state, this.state.root);
      if (firstText) {
        this.selection = createCollapsedSelection(firstText.key, 0);
      }
    } else {
      // Validate current selection points to existing nodes
      const anchorNode = getNode(this.state, this.selection.anchor.key);
      if (!anchorNode || !isTextNode(anchorNode)) {
        const firstText = findFirstTextNode(this.state, this.state.root);
        if (firstText) {
          this.selection = createCollapsedSelection(firstText.key, 0);
        }
      }
    }
  }

  private handleFocus = (): void => {
    // When editor receives focus, ensure we're in a valid state
    this.ensureValidState();

    // If we have a selection, restore it
    if (this.selection && this.container) {
      setSelection(this.selection, this.state, this.container);
    }
  };

  private handlePaste = (e: ClipboardEvent): void => {
    e.preventDefault();

    const clipboardData = e.clipboardData;
    if (!clipboardData) return;

    // Try to get plain text first
    const text = clipboardData.getData('text/plain');
    if (!text) return;

    // Check if we're inside a code block
    const codeBlockCtx = this.getCodeBlockAncestor();
    if (codeBlockCtx) {
      // Inside code block: insert text with newlines preserved (no paragraph breaks)
      this.insertText(text);
    } else {
      // Normal paste: split by newlines and insert each line as separate paragraph
      const lines = text.split(/\r?\n/);
      lines.forEach((line, index) => {
        if (index > 0) {
          // Insert paragraph break for each newline
          this.dispatchCommand({ type: 'INSERT_PARAGRAPH' });
        }
        if (line) {
          this.insertText(line);
        }
      });
    }
  };

  private handleSelectionChange = (): void => {
    if (!this.container) return;

    // Don't update selection during composition or rendering
    if (this.isComposing || this.isRendering) {
      return;
    }

    const newSelection = getSelection(this.state, this.container);
    if (newSelection) {
      this.selection = newSelection;
      this.updateFocusedBlock();
      this.notifyListeners();
    }
  };

  private updateFocusedBlock(): void {
    if (!this.container || !this.selection) return;

    // Remove focused class from all blocks
    this.container.querySelectorAll('.editorFocusedBlock').forEach(el => {
      el.classList.remove('editorFocusedBlock');
    });

    // Find the block containing the selection
    const block = getBlockAncestor(this.state, this.selection.anchor.key);
    if (block) {
      const blockElement = this.container.querySelector(`[data-editor-key="${block.key}"]`);
      if (blockElement) {
        blockElement.classList.add('editorFocusedBlock');
      }
    }
  }

  private insertText(text: string): void {
    console.log('insertText called:', { text, selection: this.selection });
    if (!this.selection) {
      console.log('insertText: no selection');
      return;
    }

    const node = getNode(this.state, this.selection.anchor.key);
    console.log('insertText: node for key', this.selection.anchor.key, ':', node?.type, node ? (node as any).text : 'N/A');
    if (!node || !isTextNode(node)) {
      console.log('insertText: node not found or not text node');
      return;
    }

    // Save to history before change
    this.history.push(this.state, this.selection);

    // If there's a selection, delete it first (without rendering)
    if (!this.selection.isCollapsed) {
      this.deleteSelectionInternal();
      // Re-get the node after deletion as state changed
      const updatedNode = getNode(this.state, this.selection.anchor.key);
      if (!updatedNode || !isTextNode(updatedNode)) return;
    }

    // Get node again (might have been updated by deleteSelectionInternal)
    const currentNode = getNode(this.state, this.selection.anchor.key);
    if (!currentNode || !isTextNode(currentNode)) return;

    // Log operation for delta sync
    if (this.opLogger) {
      this.opLogger.logTextInsert(currentNode.key, this.selection.anchor.offset, text);
    }

    // Insert text at cursor
    const before = currentNode.text.slice(0, this.selection.anchor.offset);
    const after = currentNode.text.slice(this.selection.anchor.offset);
    const newText = before + text + after;

    this.state = updateNode(this.state, currentNode.key, { text: newText });

    // Update selection
    const newOffset = this.selection.anchor.offset + text.length;
    this.selection = createCollapsedSelection(currentNode.key, newOffset);

    // Check for markdown shortcuts and apply them
    this.checkMarkdownShortcuts(currentNode.key, newText, newOffset);

    this.render();
  }

  // Check for markdown shortcuts and convert them to formatted content
  private checkMarkdownShortcuts(nodeKey: string, fullText: string, cursorOffset: number): void {
    const node = getNode(this.state, nodeKey);
    if (!node || !isTextNode(node)) return;

    const block = getBlockAncestor(this.state, nodeKey);
    if (!block) return;

    // Only check block-level shortcuts for paragraph blocks
    if (block.type === 'paragraph') {
      // Check for heading shortcuts: "# text" or "## text" etc at start of line
      // Triggers when space is typed after # symbols at the beginning
      const headingMatch = fullText.match(/^(#{1,4})\s(.*)$/);
      if (headingMatch && cursorOffset >= headingMatch[1].length + 1) {
        const level = headingMatch[1].length as 1 | 2 | 3 | 4;
        const remainingText = headingMatch[2] || '';
        this.convertToHeadingWithText(block.key, nodeKey, level, remainingText);
        return;
      }

      // Check for bullet list: "- text" at start
      const bulletMatch = fullText.match(/^-\s(.*)$/);
      if (bulletMatch && cursorOffset >= 2) {
        const remainingText = bulletMatch[1] || '';
        this.convertToListWithText(block.key, nodeKey, 'bullet', remainingText);
        return;
      }

      // Check for numbered list: "1. text" at start
      const numberMatch = fullText.match(/^1\.\s(.*)$/);
      if (numberMatch && cursorOffset >= 3) {
        const remainingText = numberMatch[1] || '';
        this.convertToListWithText(block.key, nodeKey, 'number', remainingText);
        return;
      }

      // Check for code block: ``` (only on empty line)
      if (fullText === '```') {
        this.convertToCodeBlock(block.key, nodeKey);
        return;
      }

      // Check for blockquote: "> text" at start
      const quoteMatch = fullText.match(/^>\s(.*)$/);
      if (quoteMatch && cursorOffset >= 2) {
        const remainingText = quoteMatch[1] || '';
        this.convertToQuoteWithText(block.key, nodeKey, remainingText);
        return;
      }

      // Check for divider: --- (only exact match)
      if (fullText === '---') {
        this.convertToDivider(block.key, nodeKey);
        return;
      }
    }

    // Check for inline formatting (works in any block type)
    // Bold: **text**
    const boldMatch = fullText.match(/\*\*(.+?)\*\*$/);
    if (boldMatch && cursorOffset === fullText.length) {
      this.applyInlineFormat(nodeKey, fullText, boldMatch, 'bold');
      return;
    }

    // Italic: *text* (but not ** which is bold marker)
    // Match *text* where text doesn't start or end with *
    const italicMatch = fullText.match(/(?:^|[^*])\*([^*]+)\*$/);
    if (italicMatch && cursorOffset === fullText.length) {
      // Adjust match to get the correct captured group
      const actualMatch = fullText.match(/\*([^*]+)\*$/);
      if (actualMatch) {
        this.applyInlineFormat(nodeKey, fullText, actualMatch, 'italic');
        return;
      }
    }

    // Strikethrough: ~~text~~
    const strikeMatch = fullText.match(/~~(.+?)~~$/);
    if (strikeMatch && cursorOffset === fullText.length) {
      this.applyInlineFormat(nodeKey, fullText, strikeMatch, 'strikethrough');
      return;
    }

    // Inline code: `text`
    const codeMatch = fullText.match(/`([^`]+?)`$/);
    if (codeMatch && cursorOffset === fullText.length) {
      this.applyInlineFormat(nodeKey, fullText, codeMatch, 'code');
      return;
    }
  }

  private convertToHeadingWithText(blockKey: string, _textNodeKey: string, level: 1 | 2 | 3 | 4, text: string): void {
    const block = getNode(this.state, blockKey);
    if (!block || !block.parent) return;

    const parent = getNode(this.state, block.parent);
    if (!parent || !isElementNode(parent)) return;

    const blockIndex = parent.children.indexOf(blockKey);

    // Create new heading with the remaining text
    const newText = createTextNode(text, {});
    const heading = createHeadingNode(level, [newText.key]);
    newText.parent = heading.key;
    heading.parent = block.parent;

    // Remove old block and insert heading
    this.state = removeNode(this.state, blockKey);
    this.state = insertNode(this.state, block.parent, heading, blockIndex);
    this.state.nodeMap.set(newText.key, newText);

    // Log for delta sync
    if (this.opLogger) {
      this.opLogger.logNodeDelete(blockKey);
      this.opLogger.logNodeInsert(heading.key, block.parent, blockIndex, {
        type: 'heading',
        key: heading.key,
        level,
        children: heading.children,
      });
    }

    // Place cursor at end of text
    this.selection = createCollapsedSelection(newText.key, text.length);
  }

  private convertToListWithText(blockKey: string, _textNodeKey: string, listType: 'bullet' | 'number', text: string): void {
    const block = getNode(this.state, blockKey);
    if (!block || !block.parent) return;

    const parent = getNode(this.state, block.parent);
    if (!parent || !isElementNode(parent)) return;

    const blockIndex = parent.children.indexOf(blockKey);

    // Create list structure with the remaining text
    const newText = createTextNode(text, {});
    const listItem = createListItemNode([newText.key]);
    newText.parent = listItem.key;
    const list = createListNode(listType, [listItem.key]);
    listItem.parent = list.key;
    list.parent = block.parent;

    // Remove old block and insert list
    this.state = removeNode(this.state, blockKey);
    this.state = insertNode(this.state, block.parent, list, blockIndex);
    this.state.nodeMap.set(listItem.key, listItem);
    this.state.nodeMap.set(newText.key, newText);

    // Log for delta sync
    if (this.opLogger) {
      this.opLogger.logNodeDelete(blockKey);
      this.opLogger.logNodeInsert(list.key, block.parent, blockIndex, {
        type: 'list',
        key: list.key,
        listType,
        children: list.children,
      });
    }

    // Place cursor at end of text
    this.selection = createCollapsedSelection(newText.key, text.length);
  }

  private convertToQuoteWithText(blockKey: string, _textNodeKey: string, text: string): void {
    const block = getNode(this.state, blockKey);
    if (!block || !block.parent) return;

    const parent = getNode(this.state, block.parent);
    if (!parent || !isElementNode(parent)) return;

    const blockIndex = parent.children.indexOf(blockKey);

    // Create quote with the remaining text
    const newText = createTextNode(text, {});
    const quote = createQuoteNode([newText.key]);
    newText.parent = quote.key;
    quote.parent = block.parent;

    // Remove old block and insert quote
    this.state = removeNode(this.state, blockKey);
    this.state = insertNode(this.state, block.parent, quote, blockIndex);
    this.state.nodeMap.set(newText.key, newText);

    // Log for delta sync
    if (this.opLogger) {
      this.opLogger.logNodeDelete(blockKey);
      this.opLogger.logNodeInsert(quote.key, block.parent, blockIndex, {
        type: 'quote',
        key: quote.key,
        children: quote.children,
      });
    }

    // Place cursor at end of text
    this.selection = createCollapsedSelection(newText.key, text.length);
  }

  private convertToHeading(blockKey: string, _textNodeKey: string, level: 1 | 2 | 3 | 4): void {
    const block = getNode(this.state, blockKey);
    if (!block || !block.parent) return;

    const parent = getNode(this.state, block.parent);
    if (!parent || !isElementNode(parent)) return;

    const blockIndex = parent.children.indexOf(blockKey);

    // Create new heading with empty text
    const newText = createTextNode('', {});
    const heading = createHeadingNode(level, [newText.key]);
    newText.parent = heading.key;
    heading.parent = block.parent;

    // Remove old block and insert heading
    this.state = removeNode(this.state, blockKey);
    this.state = insertNode(this.state, block.parent, heading, blockIndex);
    this.state.nodeMap.set(newText.key, newText);

    // Log for delta sync
    if (this.opLogger) {
      this.opLogger.logNodeDelete(blockKey);
      this.opLogger.logNodeInsert(heading.key, block.parent, blockIndex, {
        type: 'heading',
        key: heading.key,
        level,
        children: heading.children,
      });
    }

    this.selection = createCollapsedSelection(newText.key, 0);
  }

  private convertToList(blockKey: string, _textNodeKey: string, listType: 'bullet' | 'number'): void {
    const block = getNode(this.state, blockKey);
    if (!block || !block.parent) return;

    const parent = getNode(this.state, block.parent);
    if (!parent || !isElementNode(parent)) return;

    const blockIndex = parent.children.indexOf(blockKey);

    // Create list structure with empty text
    const newText = createTextNode('', {});
    const listItem = createListItemNode([newText.key]);
    newText.parent = listItem.key;
    const list = createListNode(listType, [listItem.key]);
    listItem.parent = list.key;
    list.parent = block.parent;

    // Remove old block and insert list
    this.state = removeNode(this.state, blockKey);
    this.state = insertNode(this.state, block.parent, list, blockIndex);
    this.state.nodeMap.set(listItem.key, listItem);
    this.state.nodeMap.set(newText.key, newText);

    // Log for delta sync
    if (this.opLogger) {
      this.opLogger.logNodeDelete(blockKey);
      this.opLogger.logNodeInsert(list.key, block.parent, blockIndex, {
        type: 'list',
        key: list.key,
        listType,
        children: list.children,
      });
    }

    this.selection = createCollapsedSelection(newText.key, 0);
  }

  private convertToCodeBlock(blockKey: string, _textNodeKey: string): void {
    const block = getNode(this.state, blockKey);
    if (!block || !block.parent) return;

    const parent = getNode(this.state, block.parent);
    if (!parent || !isElementNode(parent)) return;

    const blockIndex = parent.children.indexOf(blockKey);

    // Create code block with empty text
    const newText = createTextNode('', {});
    const codeBlock = createCodeNode(undefined, [newText.key]);
    newText.parent = codeBlock.key;
    codeBlock.parent = block.parent;

    // Remove old block and insert code block
    this.state = removeNode(this.state, blockKey);
    this.state = insertNode(this.state, block.parent, codeBlock, blockIndex);
    this.state.nodeMap.set(newText.key, newText);

    // Log for delta sync
    if (this.opLogger) {
      this.opLogger.logNodeDelete(blockKey);
      this.opLogger.logNodeInsert(codeBlock.key, block.parent, blockIndex, {
        type: 'code',
        key: codeBlock.key,
        children: codeBlock.children,
      });
    }

    this.selection = createCollapsedSelection(newText.key, 0);
  }

  private convertToQuote(blockKey: string, _textNodeKey: string): void {
    const block = getNode(this.state, blockKey);
    if (!block || !block.parent) return;

    const parent = getNode(this.state, block.parent);
    if (!parent || !isElementNode(parent)) return;

    const blockIndex = parent.children.indexOf(blockKey);

    // Create quote with empty text
    const newText = createTextNode('', {});
    const quote = createQuoteNode([newText.key]);
    newText.parent = quote.key;
    quote.parent = block.parent;

    // Remove old block and insert quote
    this.state = removeNode(this.state, blockKey);
    this.state = insertNode(this.state, block.parent, quote, blockIndex);
    this.state.nodeMap.set(newText.key, newText);

    // Log for delta sync
    if (this.opLogger) {
      this.opLogger.logNodeDelete(blockKey);
      this.opLogger.logNodeInsert(quote.key, block.parent, blockIndex, {
        type: 'quote',
        key: quote.key,
        children: quote.children,
      });
    }

    this.selection = createCollapsedSelection(newText.key, 0);
  }

  private convertToDivider(blockKey: string, _textNodeKey: string): void {
    const block = getNode(this.state, blockKey);
    if (!block || !block.parent) return;

    const parent = getNode(this.state, block.parent);
    if (!parent || !isElementNode(parent)) return;

    const blockIndex = parent.children.indexOf(blockKey);

    // Create divider
    const divider = createDividerNode();
    divider.parent = block.parent;

    // Create paragraph after divider for continued editing
    const newText = createTextNode('', {});
    const newParagraph = createParagraphNode([newText.key]);
    newText.parent = newParagraph.key;
    newParagraph.parent = block.parent;

    // Remove old block and insert divider + paragraph
    this.state = removeNode(this.state, blockKey);
    this.state = insertNode(this.state, block.parent, divider, blockIndex);
    this.state = insertNode(this.state, block.parent, newParagraph, blockIndex + 1);
    this.state.nodeMap.set(newText.key, newText);

    // Log for delta sync
    if (this.opLogger) {
      this.opLogger.logNodeDelete(blockKey);
      this.opLogger.logNodeInsert(divider.key, block.parent, blockIndex, {
        type: 'divider',
        key: divider.key,
      });
    }

    this.selection = createCollapsedSelection(newText.key, 0);
  }

  private applyInlineFormat(
    nodeKey: string,
    fullText: string,
    match: RegExpMatchArray,
    formatType: 'bold' | 'italic' | 'strikethrough' | 'code'
  ): void {
    const node = getNode(this.state, nodeKey);
    if (!node || !isTextNode(node) || !node.parent) return;

    const parent = getNode(this.state, node.parent);
    if (!parent || !isElementNode(parent)) return;

    const matchedText = match[1]; // The text inside the markers
    const fullMatch = match[0]; // The full match including markers
    const matchStart = fullText.length - fullMatch.length;
    const beforeText = fullText.slice(0, matchStart);

    const nodeIndex = parent.children.indexOf(nodeKey);

    // Clone state for modifications
    const newState = cloneState(this.state);
    const parentInNewState = newState.nodeMap.get(node.parent) as any;

    // Remove the original node
    parentInNewState.children.splice(nodeIndex, 1);
    newState.nodeMap.delete(nodeKey);

    let insertIndex = nodeIndex;
    let lastNodeKey = '';

    // Create "before" text node if there's text before the match
    if (beforeText) {
      const beforeNode = createTextNode(beforeText, { ...node.format });
      beforeNode.parent = node.parent;
      newState.nodeMap.set(beforeNode.key, beforeNode);
      parentInNewState.children.splice(insertIndex++, 0, beforeNode.key);
    }

    // Create formatted text node
    const formattedNode = createTextNode(matchedText, {
      ...node.format,
      [formatType]: true,
    });
    formattedNode.parent = node.parent;
    newState.nodeMap.set(formattedNode.key, formattedNode);
    parentInNewState.children.splice(insertIndex++, 0, formattedNode.key);
    lastNodeKey = formattedNode.key;

    // Create empty text node after for continued typing (unformatted)
    const afterNode = createTextNode('', {});
    afterNode.parent = node.parent;
    newState.nodeMap.set(afterNode.key, afterNode);
    parentInNewState.children.splice(insertIndex, 0, afterNode.key);
    lastNodeKey = afterNode.key;

    this.state = newState;

    // Log for delta sync
    if (this.opLogger) {
      this.opLogger.logNodeDelete(nodeKey);
    }

    // Move cursor to after the formatted text
    this.selection = createCollapsedSelection(lastNodeKey, 0);
  }

  private insertParagraph(): void {
    console.log('[EditorCore] insertParagraph called, selection:', this.selection);
    if (!this.selection) {
      console.log('[EditorCore] insertParagraph: no selection');
      return;
    }

    const node = getNode(this.state, this.selection.anchor.key);
    console.log('[EditorCore] insertParagraph: node:', node?.key, node?.type, 'node.parent:', node?.parent);
    if (!node || !isTextNode(node)) {
      console.log('[EditorCore] insertParagraph: not a text node');
      return;
    }

    // Debug: check the parent chain
    if (node.parent) {
      const parentNode = getNode(this.state, node.parent);
      console.log('[EditorCore] insertParagraph: parentNode:', parentNode?.key, parentNode?.type, 'parentNode.parent:', parentNode?.parent);
    } else {
      console.log('[EditorCore] insertParagraph: node has no parent!');
    }

    const block = getBlockAncestor(this.state, node.key);
    console.log('[EditorCore] insertParagraph: block:', block?.key, block?.type, 'block.parent:', block?.parent);
    if (!block || !block.parent) {
      console.log('[EditorCore] insertParagraph: no block or parent');
      return;
    }

    // Save to history
    this.history.push(this.state, this.selection);

    // Check if we're in a list item
    if (block.type === 'listitem') {
      const listNode = getNode(this.state, block.parent);
      if (listNode?.type === 'list') {
        // Check if this list item is completely empty (no text at all)
        const isEmptyItem = node.text === '' && this.selection.anchor.offset === 0;

        if (isEmptyItem) {
          // Empty list item - exit the list and create paragraph
          this.exitListItem(block, listNode as ListNode, node);
          return;
        } else {
          // Non-empty list item - create new list item below
          this.splitListItem(block, listNode as ListNode, node);
          return;
        }
      }
    }

    // Regular paragraph/heading/quote - split and create new paragraph
    const before = node.text.slice(0, this.selection.anchor.offset);
    const after = node.text.slice(this.selection.anchor.offset);

    // Update current text node
    this.state = updateNode(this.state, node.key, { text: before });

    // Create new paragraph with remaining text
    const newText = createTextNode(after, { ...node.format });
    const newParagraph = createParagraphNode([newText.key]);
    newText.parent = newParagraph.key;

    // Insert new paragraph after current block
    const parent = getNode(this.state, block.parent);
    if (parent && isElementNode(parent)) {
      const blockIndex = parent.children.indexOf(block.key);
      this.state = insertNode(this.state, block.parent, newParagraph, blockIndex + 1);
      this.state.nodeMap.set(newText.key, newText);

      // Log operations for delta sync
      if (this.opLogger) {
        // Log text update for the split
        if (before !== node.text) {
          this.opLogger.logNodeUpdate(node.key, { text: before });
        }
        // Log new paragraph insertion (including its children structure)
        const { parent: _parent, ...paragraphWithoutParent } = newParagraph;
        this.opLogger.logNodeInsert(newParagraph.key, block.parent, blockIndex + 1, paragraphWithoutParent);
        // Log the text node inside the paragraph
        const { parent: _textParent, ...textWithoutParent } = newText;
        this.opLogger.logNodeInsert(newText.key, newParagraph.key, 0, textWithoutParent);
      }
    }

    // Move selection to start of new paragraph
    this.selection = createCollapsedSelection(newText.key, 0);

    this.render();
  }

  // Insert a new empty paragraph after a specific block (used by + button)
  private insertParagraphAfter(blockKey: string): void {
    const block = getNode(this.state, blockKey);
    if (!block || !block.parent) return;

    const parent = getNode(this.state, block.parent);
    if (!parent || !isElementNode(parent)) return;

    // Save to history
    this.history.push(this.state, this.selection);

    const blockIndex = parent.children.indexOf(blockKey);

    // Create new empty paragraph
    const newText = createTextNode('', {});
    const newParagraph = createParagraphNode([newText.key]);
    newText.parent = newParagraph.key;
    newParagraph.parent = block.parent;

    // Insert after the block
    this.state = insertNode(this.state, block.parent, newParagraph, blockIndex + 1);
    this.state.nodeMap.set(newText.key, newText);

    // Log for delta sync
    if (this.opLogger) {
      const { parent: _p, ...paragraphWithoutParent } = newParagraph;
      this.opLogger.logNodeInsert(newParagraph.key, block.parent, blockIndex + 1, paragraphWithoutParent);
      const { parent: _tp, ...textWithoutParent } = newText;
      this.opLogger.logNodeInsert(newText.key, newParagraph.key, 0, textWithoutParent);
    }

    // Move selection to the new paragraph
    this.selection = createCollapsedSelection(newText.key, 0);

    this.render();
  }

  private exitListItem(listItem: any, listNode: ListNode, _textNode: TextNode): void {
    const grandParent = getNode(this.state, listNode.parent!);
    if (!grandParent || !isElementNode(grandParent)) return;

    const newState = cloneState(this.state);
    const listInNewState = newState.nodeMap.get(listNode.key) as ListNode;
    const grandParentInNewState = newState.nodeMap.get(listNode.parent!) as any;

    const listIndex = grandParentInNewState.children.indexOf(listNode.key);
    const itemIndex = listInNewState.children.indexOf(listItem.key);

    // Get text children from listitem
    const textChildren = isElementNode(listItem) ? [...(listItem as ParagraphNode).children] : [];

    // Create new paragraph
    const newParagraph = createParagraphNode(textChildren);
    newParagraph.parent = listNode.parent;

    // Update text children's parent
    textChildren.forEach(childKey => {
      const child = newState.nodeMap.get(childKey);
      if (child) {
        child.parent = newParagraph.key;
      }
    });

    // Add paragraph to nodeMap
    newState.nodeMap.set(newParagraph.key, newParagraph);

    // Remove listitem from list
    listInNewState.children.splice(itemIndex, 1);
    newState.nodeMap.delete(listItem.key);

    // Insert paragraph after the list
    grandParentInNewState.children.splice(listIndex + 1, 0, newParagraph.key);

    // Track if list will be removed
    const listWillBeRemoved = listInNewState.children.length === 0;

    // If list is now empty, remove it
    if (listWillBeRemoved) {
      const listIdx = grandParentInNewState.children.indexOf(listNode.key);
      if (listIdx !== -1) {
        grandParentInNewState.children.splice(listIdx, 1);
      }
      newState.nodeMap.delete(listNode.key);
    }

    this.state = newState;

    // Log operations for delta sync
    if (this.opLogger) {
      this.opLogger.logNodeDelete(listItem.key);
      if (listWillBeRemoved) {
        this.opLogger.logNodeDelete(listNode.key);
      }
      const { parent: _parent, ...paragraphWithoutParent } = newParagraph;
      this.opLogger.logNodeInsert(newParagraph.key, listNode.parent!, listIndex + 1, paragraphWithoutParent);
    }

    // Update selection to new paragraph
    const firstText = findFirstTextNode(this.state, newParagraph.key);
    if (firstText) {
      this.selection = createCollapsedSelection(firstText.key, 0);
    }

    this.render();
  }

  private splitListItem(listItem: any, listNode: ListNode, textNode: TextNode): void {
    const before = textNode.text.slice(0, this.selection!.anchor.offset);
    const after = textNode.text.slice(this.selection!.anchor.offset);

    const newState = cloneState(this.state);
    const listInNewState = newState.nodeMap.get(listNode.key) as ListNode;

    // Update current text node
    const currentTextNode = newState.nodeMap.get(textNode.key) as TextNode;
    currentTextNode.text = before;

    // Create new text and list item
    const newText = createTextNode(after, { ...textNode.format });
    const newListItem = createListItemNode([newText.key], 0);
    newText.parent = newListItem.key;
    newListItem.parent = listNode.key;

    // Add to nodeMap
    newState.nodeMap.set(newText.key, newText);
    newState.nodeMap.set(newListItem.key, newListItem);

    // Insert new list item after current one
    const itemIndex = listInNewState.children.indexOf(listItem.key);
    listInNewState.children.splice(itemIndex + 1, 0, newListItem.key);

    this.state = newState;
    this.selection = createCollapsedSelection(newText.key, 0);

    // Log operations for delta sync
    if (this.opLogger) {
      if (before !== textNode.text) {
        this.opLogger.logNodeUpdate(textNode.key, { text: before });
      }
      const { parent: _parent, ...listItemWithoutParent } = newListItem;
      this.opLogger.logNodeInsert(newListItem.key, listNode.key, itemIndex + 1, listItemWithoutParent);
      // Also log the text node inside the list item
      const { parent: _textParent, ...textWithoutParent } = newText;
      this.opLogger.logNodeInsert(newText.key, newListItem.key, 0, textWithoutParent);
    }

    this.render();
  }

  private deleteBackward(): void {
    if (!this.selection) return;

    // Handle range selection (selected text)
    if (!this.selection.isCollapsed) {
      this.deleteSelection();
      return;
    }

    const node = getNode(this.state, this.selection.anchor.key);
    if (!node || !isTextNode(node)) return;

    if (this.selection.anchor.offset > 0) {
      // Save to history
      this.history.push(this.state, this.selection);

      // Log operation for delta sync
      if (this.opLogger) {
        this.opLogger.logTextDelete(node.key, this.selection.anchor.offset - 1, 1);
      }

      // Delete character before cursor
      const newText = node.text.slice(0, this.selection.anchor.offset - 1) +
                      node.text.slice(this.selection.anchor.offset);
      this.state = updateNode(this.state, node.key, { text: newText });
      this.selection = createCollapsedSelection(node.key, this.selection.anchor.offset - 1);
      this.render();
    } else {
      // At start of text node
      const block = getBlockAncestor(this.state, node.key);
      if (!block) return;

      // If block is a heading/quote at start, convert to paragraph
      if (block.type === 'heading' || block.type === 'quote') {
        // Save to history
        this.history.push(this.state, this.selection);

        const children = isElementNode(block) ? [...block.children] : [];
        const parent = block.parent;
        if (!parent) return;

        const parentNode = getNode(this.state, parent);
        if (!parentNode || !isElementNode(parentNode)) return;

        const blockIndex = parentNode.children.indexOf(block.key);

        // Save children data BEFORE removing the block (since removeNode deletes descendants)
        const childrenData: EditorNode[] = [];
        children.forEach(childKey => {
          const child = this.state.nodeMap.get(childKey);
          if (child) {
            childrenData.push({ ...child });
          }
        });

        // Remove old block (this also removes children from nodeMap)
        this.state = removeNode(this.state, block.key);

        // Create new paragraph with same children keys
        const newParagraph = createParagraphNode(children);

        // Re-add children to nodeMap with updated parent
        childrenData.forEach(child => {
          child.parent = newParagraph.key;
          this.state.nodeMap.set(child.key, child);
        });

        // Insert new paragraph
        this.state = insertNode(this.state, parent, newParagraph, blockIndex);

        // Keep cursor at start - use the first child's key if available
        const cursorKey = children.length > 0 ? children[0] : null;
        if (cursorKey && this.state.nodeMap.has(cursorKey)) {
          this.selection = createCollapsedSelection(cursorKey, 0);
        }
        this.render();
      } else {
        // Try to merge with previous block
        const prevBlock = getPreviousSibling(this.state, block.key);
        if (prevBlock && isElementNode(prevBlock)) {
          const lastText = findLastTextNode(this.state, prevBlock.key);
          if (lastText) {
            // Save to history
            this.history.push(this.state, this.selection);

            const cursorPos = lastText.text.length;

            // Merge text content
            const mergedText = lastText.text + node.text;
            this.state = updateNode(this.state, lastText.key, { text: mergedText });

            // Log operation for delta sync
            if (this.opLogger) {
              this.opLogger.logNodeDelete(block.key);
            }

            // Remove current block
            this.state = removeNode(this.state, block.key);

            // Set cursor to merge point
            this.selection = createCollapsedSelection(lastText.key, cursorPos);
            this.render();
          }
        }
        // If no previous block, do nothing - cursor stays at start of first block
        // The e.preventDefault() in handleBeforeInput prevents cursor from escaping
      }
    }
  }

  private deleteSelection(): void {
    if (!this.selection || this.selection.isCollapsed) return;

    // Save to history
    this.history.push(this.state, this.selection);

    this.deleteSelectionInternal();
    this.render();
  }

  private deleteRange(nodeKey: string, startOffset: number, endOffset: number): void {
    console.log('deleteRange called:', { nodeKey, startOffset, endOffset });
    const node = getNode(this.state, nodeKey);
    if (!node || !isTextNode(node)) {
      console.log('deleteRange: node not found or not text');
      return;
    }

    // Validate offsets
    const textLen = node.text.length;
    const start = Math.max(0, Math.min(startOffset, textLen));
    const end = Math.max(start, Math.min(endOffset, textLen));

    console.log('deleteRange: text before:', JSON.stringify(node.text), 'deleting', start, 'to', end);

    if (start === end) return;

    // Save to history
    this.history.push(this.state, this.selection);

    // Delete the range
    const newText = node.text.slice(0, start) + node.text.slice(end);
    this.state = updateNode(this.state, nodeKey, { text: newText });

    console.log('deleteRange: text after:', JSON.stringify(newText));

    // Set cursor at start of deleted range
    this.selection = createCollapsedSelection(nodeKey, start);
    console.log('deleteRange: selection set to', nodeKey, start);

    this.render();
  }

  private deleteSelectionInternal(): void {
    if (!this.selection || this.selection.isCollapsed) return;

    const { anchor, focus } = this.selection;

    // For now, handle simple case where selection is within same text node
    if (anchor.key === focus.key) {
      const node = getNode(this.state, anchor.key);
      if (!node || !isTextNode(node)) return;

      const startOffset = Math.min(anchor.offset, focus.offset);
      const endOffset = Math.max(anchor.offset, focus.offset);

      const newText = node.text.slice(0, startOffset) + node.text.slice(endOffset);
      this.state = updateNode(this.state, node.key, { text: newText });
      this.selection = createCollapsedSelection(anchor.key, startOffset);
    } else {
      // Cross-node selection - need to handle properly
      const anchorNode = getNode(this.state, anchor.key);
      const focusNode = getNode(this.state, focus.key);

      if (!anchorNode || !isTextNode(anchorNode) || !focusNode || !isTextNode(focusNode)) return;

      // Determine which is first (anchor or focus) by walking the tree
      const anchorBlock = getBlockAncestor(this.state, anchor.key);
      const focusBlock = getBlockAncestor(this.state, focus.key);

      if (!anchorBlock || !focusBlock) return;

      // Check if selection is within the same block (same paragraph/heading/etc)
      if (anchorBlock.key === focusBlock.key && isElementNode(anchorBlock)) {
        // Same block - selection spans multiple text nodes within one paragraph
        const blockChildren = anchorBlock.children;
        const anchorIndex = blockChildren.indexOf(anchor.key);
        const focusIndex = blockChildren.indexOf(focus.key);

        if (anchorIndex === -1 || focusIndex === -1) return;

        // Determine start and end based on child order
        const isAnchorFirst = anchorIndex < focusIndex;
        const startIndex = Math.min(anchorIndex, focusIndex);
        const endIndex = Math.max(anchorIndex, focusIndex);
        const startKey = isAnchorFirst ? anchor.key : focus.key;
        const startOffset = isAnchorFirst ? anchor.offset : focus.offset;
        const endKey = isAnchorFirst ? focus.key : anchor.key;
        const endOffset = isAnchorFirst ? focus.offset : anchor.offset;

        const startNode = getNode(this.state, startKey) as any;
        const endNode = getNode(this.state, endKey) as any;

        // Keep text before selection in start node
        const keepText = startNode.text.slice(0, startOffset);
        // Get text after selection in end node
        const appendText = endNode.text.slice(endOffset);

        // Update the start node with merged text
        this.state = updateNode(this.state, startKey, { text: keepText + appendText });

        // Delete all nodes between start and end (inclusive of end, exclusive of start)
        const newState = cloneState(this.state);
        const blockInNewState = newState.nodeMap.get(anchorBlock.key) as any;

        // Remove nodes from endIndex down to startIndex+1
        for (let i = endIndex; i > startIndex; i--) {
          const nodeKeyToDelete = blockInNewState.children[i];
          newState.nodeMap.delete(nodeKeyToDelete);
          blockInNewState.children.splice(i, 1);
        }

        this.state = newState;
        this.selection = createCollapsedSelection(startKey, startOffset);
      } else {
        // Cross-block selection
        console.log('[deleteSelectionInternal] Cross-block selection', { anchorBlock: anchorBlock.key, focusBlock: focusBlock.key });

        // Get root to find all blocks
        const root = this.state.nodeMap.get(this.state.root);
        if (!root || !isElementNode(root)) return;

        // Find the top-level blocks (direct children of root) for anchor and focus
        const findTopLevelBlock = (blockKey: string): string | null => {
          let current = this.state.nodeMap.get(blockKey);
          while (current && current.parent !== this.state.root) {
            current = current.parent ? this.state.nodeMap.get(current.parent) : null;
          }
          return current ? current.key : null;
        };

        const anchorTopBlock = findTopLevelBlock(anchorBlock.key);
        const focusTopBlock = findTopLevelBlock(focusBlock.key);

        console.log('[deleteSelectionInternal] Top-level blocks:', { anchorTopBlock, focusTopBlock });

        if (!anchorTopBlock || !focusTopBlock) return;

        // If both are in the same top-level block (e.g., same list), handle differently
        if (anchorTopBlock === focusTopBlock) {
          console.log('[deleteSelectionInternal] Same top-level block - handling within-block deletion');

          // Get start and end based on anchor/focus position
          // We need to figure out which comes first
          const anchorNode = getNode(this.state, anchor.key);
          const focusNode = getNode(this.state, focus.key);

          if (!anchorNode || !isTextNode(anchorNode) || !focusNode || !isTextNode(focusNode)) return;

          // For now, just merge the texts and leave structure intact
          // This is a simplification - proper handling would need to clean up empty nodes
          const startKey = this.selection.isBackward ? focus.key : anchor.key;
          const startOffset = this.selection.isBackward ? focus.offset : anchor.offset;
          const endKey = this.selection.isBackward ? anchor.key : focus.key;
          const endOffset = this.selection.isBackward ? anchor.offset : focus.offset;

          const startNode = getNode(this.state, startKey) as any;
          const endNode = getNode(this.state, endKey) as any;

          // Keep text before selection in start node
          const keepText = startNode.text.slice(0, startOffset);
          // Get text after selection in end node
          const appendText = endNode.text.slice(endOffset);

          console.log('[deleteSelectionInternal] Same block merge:', { keepText, appendText, startKey, endKey });

          // Update start node with merged text
          this.state = updateNode(this.state, startKey, { text: keepText + appendText });

          // If end node is different from start, make it empty (or we could delete it)
          if (endKey !== startKey) {
            this.state = updateNode(this.state, endKey, { text: '' });
          }

          // Set cursor at merge point
          this.selection = createCollapsedSelection(startKey, startOffset);
          return;
        }

        // Find indices of anchor and focus top-level blocks
        const anchorBlockIndex = root.children.indexOf(anchorTopBlock);
        const focusBlockIndex = root.children.indexOf(focusTopBlock);

        console.log('[deleteSelectionInternal] Block indices:', { anchorBlockIndex, focusBlockIndex });

        // Determine start and end
        let startKey = anchor.key;
        let startOffset = anchor.offset;
        let startBlockIndex = anchorBlockIndex;
        let startTopBlock = anchorTopBlock;
        let endKey = focus.key;
        let endOffset = focus.offset;
        let endBlockIndex = focusBlockIndex;

        if (anchorBlockIndex > focusBlockIndex) {
          // Swap - focus comes before anchor
          startKey = focus.key;
          startOffset = focus.offset;
          startBlockIndex = focusBlockIndex;
          startTopBlock = focusTopBlock;
          endKey = anchor.key;
          endOffset = anchor.offset;
          endBlockIndex = anchorBlockIndex;
        }

        // Get start and end nodes
        const startNode = getNode(this.state, startKey);
        const endNode = getNode(this.state, endKey);

        if (!startNode || !isTextNode(startNode) || !endNode || !isTextNode(endNode)) return;

        // Keep text before selection in start node
        const keepText = startNode.text.slice(0, startOffset);
        // Get text after selection in end node
        const appendText = endNode.text.slice(endOffset);

        console.log('[deleteSelectionInternal] Merging text:', { keepText, appendText });

        // Merge the text
        this.state = updateNode(this.state, startKey, { text: keepText + appendText });

        // Delete all top-level blocks between start and end (exclusive of start block)
        // But we need to be careful - we should only delete the END block and blocks in between
        // The start block stays (with its content before selection)
        const blocksToDelete: string[] = [];
        for (let i = startBlockIndex + 1; i <= endBlockIndex; i++) {
          if (i < root.children.length) {
            blocksToDelete.push(root.children[i]);
          }
        }

        console.log('[deleteSelectionInternal] Blocks to delete:', blocksToDelete);

        // Delete blocks from end to start to avoid index shifting issues
        for (let i = blocksToDelete.length - 1; i >= 0; i--) {
          this.state = removeNode(this.state, blocksToDelete[i]);
        }

        // Set cursor at merge point
        this.selection = createCollapsedSelection(startKey, startOffset);
      }
    }
  }

  private deleteForward(): void {
    if (!this.selection) return;

    const node = getNode(this.state, this.selection.anchor.key);
    if (!node || !isTextNode(node)) return;

    // Save to history
    this.history.push(this.state, this.selection);

    if (this.selection.anchor.offset < node.text.length) {
      // Delete character after cursor
      const newText = node.text.slice(0, this.selection.anchor.offset) +
                      node.text.slice(this.selection.anchor.offset + 1);
      this.state = updateNode(this.state, node.key, { text: newText });
    } else {
      // At end of text node - try to merge with next
      // TODO: Implement merge with next block
    }

    this.render();
  }

  private formatText(format: keyof TextFormat): void {
    if (!this.selection) return;

    const { anchor, focus } = this.selection;

    // Handle collapsed selection - toggle format for typing
    if (this.selection.isCollapsed) {
      const node = getNode(this.state, anchor.key);
      if (!node || !isTextNode(node)) return;

      // For collapsed selection, we could track "pending format" for next typed character
      // For now, just return without doing anything
      return;
    }

    // Non-collapsed selection - format the selected range
    // For simplicity, handle same-node selection first
    if (anchor.key === focus.key) {
      const node = getNode(this.state, anchor.key);
      if (!node || !isTextNode(node)) return;

      const startOffset = Math.min(anchor.offset, focus.offset);
      const endOffset = Math.max(anchor.offset, focus.offset);

      // If the entire node is selected, just toggle format on the whole node
      if (startOffset === 0 && endOffset === node.text.length) {
        this.history.push(this.state, this.selection);
        const newFormat = { ...node.format };
        newFormat[format] = !newFormat[format];
        this.state = updateNode(this.state, node.key, { format: newFormat });
        if (this.opLogger) {
          this.opLogger.logNodeUpdate(node.key, { format: newFormat });
        }
        this.render();
        return;
      }

      // Need to split the text node into up to 3 parts: before, selected, after
      this.history.push(this.state, this.selection);

      const parent = getNode(this.state, node.parent!);
      if (!parent || !isElementNode(parent)) return;

      const beforeText = node.text.slice(0, startOffset);
      const selectedText = node.text.slice(startOffset, endOffset);
      const afterText = node.text.slice(endOffset);

      // Determine the new format for the selected portion
      const newFormat = { ...node.format };
      newFormat[format] = !newFormat[format];

      // Clone state
      const newState = cloneState(this.state);
      const parentInNewState = newState.nodeMap.get(node.parent!) as any;
      const nodeIndex = parentInNewState.children.indexOf(node.key);

      // Remove original node
      parentInNewState.children.splice(nodeIndex, 1);
      newState.nodeMap.delete(node.key);

      const newNodes: TextNode[] = [];
      let selectionNodeKey = '';
      let insertIndex = nodeIndex;

      // Create "before" node if there's text before selection
      if (beforeText) {
        const beforeNode = createTextNode(beforeText, { ...node.format });
        beforeNode.parent = node.parent;
        newState.nodeMap.set(beforeNode.key, beforeNode);
        parentInNewState.children.splice(insertIndex++, 0, beforeNode.key);
        newNodes.push(beforeNode);
      }

      // Create "selected" node with toggled format
      const selectedNode = createTextNode(selectedText, newFormat);
      selectedNode.parent = node.parent;
      newState.nodeMap.set(selectedNode.key, selectedNode);
      parentInNewState.children.splice(insertIndex++, 0, selectedNode.key);
      selectionNodeKey = selectedNode.key;
      newNodes.push(selectedNode);

      // Create "after" node if there's text after selection
      if (afterText) {
        const afterNode = createTextNode(afterText, { ...node.format });
        afterNode.parent = node.parent;
        newState.nodeMap.set(afterNode.key, afterNode);
        parentInNewState.children.splice(insertIndex++, 0, afterNode.key);
        newNodes.push(afterNode);
      }

      this.state = newState;

      // Log operations for delta sync
      if (this.opLogger) {
        this.opLogger.logNodeDelete(node.key);
        newNodes.forEach((n, i) => {
          const { parent: _p, ...nodeWithoutParent } = n;
          this.opLogger!.logNodeInsert(n.key, node.parent!, nodeIndex + i, nodeWithoutParent);
        });
      }

      // Update selection to cover the formatted node
      this.selection = {
        anchor: { key: selectionNodeKey, offset: 0 },
        focus: { key: selectionNodeKey, offset: selectedText.length },
        isCollapsed: false,
      };

      this.render();
      return;
    }

    // Cross-node selection - more complex, for now just format anchor node
    // TODO: Handle multi-node selection properly
    const node = getNode(this.state, anchor.key);
    if (!node || !isTextNode(node)) return;

    this.history.push(this.state, this.selection);
    const newFormat = { ...node.format };
    newFormat[format] = !newFormat[format];
    this.state = updateNode(this.state, node.key, { format: newFormat });

    if (this.opLogger) {
      this.opLogger.logNodeUpdate(node.key, { format: newFormat });
    }

    this.render();
  }

  private setBlockType(blockType: string, level?: HeadingLevel): void {
    console.log('setBlockType called:', { blockType, level, selection: this.selection });
    if (!this.selection) return;

    const block = getBlockAncestor(this.state, this.selection.anchor.key);
    console.log('setBlockType: block ancestor:', block?.key, block?.type);
    if (!block || !block.parent) return;

    // Save to history
    this.history.push(this.state, this.selection);

    const parent = getNode(this.state, block.parent);
    if (!parent || !isElementNode(parent)) return;

    const blockIndex = parent.children.indexOf(block.key);
    const children = isElementNode(block) ? [...(block as ParagraphNode).children] : [];
    console.log('setBlockType: children keys:', children);

    // Clone state for immutable update
    const newState = cloneState(this.state);

    // Remove old block from parent's children (but don't delete descendants)
    const parentInNewState = newState.nodeMap.get(block.parent);
    if (parentInNewState && isElementNode(parentInNewState)) {
      const idx = parentInNewState.children.indexOf(block.key);
      if (idx !== -1) {
        parentInNewState.children.splice(idx, 1);
      }
    }
    // Remove old block from nodeMap (but keep children)
    newState.nodeMap.delete(block.key);

    // Create new block
    let newBlock;
    switch (blockType) {
      case 'heading':
        newBlock = createHeadingNode(level || 1, children);
        break;
      case 'quote':
        newBlock = createQuoteNode(children);
        break;
      case 'code':
        newBlock = createCodeNode(undefined, children);
        break;
      case 'paragraph':
      default:
        newBlock = createParagraphNode(children);
    }

    // Set new block's parent
    newBlock.parent = block.parent;

    // Update children's parent reference to new block
    children.forEach(childKey => {
      const child = newState.nodeMap.get(childKey);
      if (child) {
        child.parent = newBlock.key;
      }
    });

    // Add new block to nodeMap
    newState.nodeMap.set(newBlock.key, newBlock);

    // Insert new block into parent at same position
    if (parentInNewState && isElementNode(parentInNewState)) {
      parentInNewState.children.splice(blockIndex, 0, newBlock.key);
    }

    this.state = newState;

    // Log operations for delta sync
    if (this.opLogger) {
      this.opLogger.logNodeDelete(block.key);
      const { parent: _parent, ...nodeWithoutParent } = newBlock;
      this.opLogger.logNodeInsert(newBlock.key, block.parent, blockIndex, nodeWithoutParent);
    }

    // Update selection - find first text node and set cursor at end of text
    const firstText = findFirstTextNode(this.state, newBlock.key);
    console.log('setBlockType: firstText:', firstText?.key, 'text:', JSON.stringify(firstText?.text));
    if (firstText) {
      // Put cursor at end of existing text
      this.selection = createCollapsedSelection(firstText.key, firstText.text.length);
      console.log('setBlockType: selection set to', firstText.key, firstText.text.length);
    }

    this.render();
  }

  private toggleList(listType: ListType): void {
    if (!this.selection) return;

    const block = getBlockAncestor(this.state, this.selection.anchor.key);
    if (!block || !block.parent) return;

    // Save to history
    this.history.push(this.state, this.selection);

    const parent = getNode(this.state, block.parent);
    if (!parent) return;

    // Clone state for immutable update
    const newState = cloneState(this.state);

    if (parent.type === 'list') {
      // Already in a list - convert back to paragraph
      const listNode = parent as ListNode;
      const grandParent = getNode(newState, listNode.parent!);
      if (!grandParent || !isElementNode(grandParent)) return;

      const listIndex = grandParent.children.indexOf(listNode.key);

      // Get text content from the listitem
      const textChildren = isElementNode(block) ? [...(block as ParagraphNode).children] : [];

      // Create new paragraph with the text
      const newParagraph = createParagraphNode(textChildren);
      newParagraph.parent = listNode.parent;

      // Update text children's parent
      textChildren.forEach(childKey => {
        const child = newState.nodeMap.get(childKey);
        if (child) {
          child.parent = newParagraph.key;
        }
      });

      // Add paragraph to nodeMap
      newState.nodeMap.set(newParagraph.key, newParagraph);

      // Remove listitem from list
      if (isElementNode(listNode)) {
        const itemIndex = listNode.children.indexOf(block.key);
        if (itemIndex !== -1) {
          listNode.children.splice(itemIndex, 1);
        }
      }

      // Remove the listitem from nodeMap (but keep text children)
      newState.nodeMap.delete(block.key);

      // Insert paragraph at list position
      grandParent.children.splice(listIndex, 0, newParagraph.key);

      // Track if list will be removed
      const listWillBeRemoved = listNode.children.length === 0;

      // If list is now empty, remove it
      if (listWillBeRemoved) {
        const listIdx = grandParent.children.indexOf(listNode.key);
        if (listIdx !== -1) {
          grandParent.children.splice(listIdx, 1);
        }
        newState.nodeMap.delete(listNode.key);
      }

      this.state = newState;

      // Log operations for delta sync
      if (this.opLogger) {
        this.opLogger.logNodeDelete(block.key);
        if (listWillBeRemoved) {
          this.opLogger.logNodeDelete(listNode.key);
        }
        const { parent: _parent, ...paragraphWithoutParent } = newParagraph;
        this.opLogger.logNodeInsert(newParagraph.key, listNode.parent!, listIndex, paragraphWithoutParent);
      }

      // Update selection
      const firstText = findFirstTextNode(this.state, newParagraph.key);
      if (firstText) {
        this.selection = createCollapsedSelection(firstText.key, firstText.text.length);
      }
    } else {
      // Not in a list - convert block to list item
      const parentNode = newState.nodeMap.get(block.parent);
      if (!parentNode || !isElementNode(parentNode)) return;

      const blockIndex = parentNode.children.indexOf(block.key);
      const textChildren = isElementNode(block) ? [...(block as ParagraphNode).children] : [];

      // Create list item with the text
      const newListItem = createListItemNode(textChildren, 0);

      // Create list containing the item
      const newList = createListNode(listType, [newListItem.key]);
      newList.parent = block.parent;
      newListItem.parent = newList.key;

      // Update text children's parent to listitem
      textChildren.forEach(childKey => {
        const child = newState.nodeMap.get(childKey);
        if (child) {
          child.parent = newListItem.key;
        }
      });

      // Remove old block from parent
      const idx = parentNode.children.indexOf(block.key);
      if (idx !== -1) {
        parentNode.children.splice(idx, 1);
      }
      newState.nodeMap.delete(block.key);

      // Add list and listitem to nodeMap
      newState.nodeMap.set(newList.key, newList);
      newState.nodeMap.set(newListItem.key, newListItem);

      // Insert list at block position
      parentNode.children.splice(blockIndex, 0, newList.key);

      this.state = newState;

      // Log operations for delta sync
      if (this.opLogger) {
        this.opLogger.logNodeDelete(block.key);
        const { parent: _listParent, ...listWithoutParent } = newList;
        const { parent: _itemParent, ...listItemWithoutParent } = newListItem;
        this.opLogger.logNodeInsert(newList.key, block.parent, blockIndex, listWithoutParent);
        this.opLogger.logNodeInsert(newListItem.key, newList.key, 0, listItemWithoutParent);
      }

      // Update selection
      const firstText = findFirstTextNode(this.state, newListItem.key);
      if (firstText) {
        this.selection = createCollapsedSelection(firstText.key, firstText.text.length);
      }
    }

    this.render();
  }

  private insertImage(src: string, alt: string, assetId?: string): void {
    if (!this.selection) return;

    const block = getBlockAncestor(this.state, this.selection.anchor.key);
    if (!block || !block.parent) return;

    // Save to history
    this.history.push(this.state, this.selection);

    const parent = getNode(this.state, block.parent);
    if (!parent || !isElementNode(parent)) return;

    const blockIndex = parent.children.indexOf(block.key);

    // Check if current block is empty (only contains empty text)
    const textNode = getNode(this.state, this.selection.anchor.key);
    const isBlockEmpty = textNode && isTextNode(textNode) && textNode.text === '';

    // Create image node with optional assetId
    const imageNode = createImageNode(src, alt, assetId);

    // Log operation for delta sync
    if (this.opLogger) {
      if (isBlockEmpty) {
        this.opLogger.logNodeDelete(block.key);
      }
      this.opLogger.logNodeInsert(imageNode.key, block.parent, blockIndex + (isBlockEmpty ? 0 : 1), {
        type: 'image',
        assetId,
        alt,
      });
    }

    if (isBlockEmpty) {
      // Replace empty block with image
      this.state = removeNode(this.state, block.key);
      this.state = insertNode(this.state, parent.key, imageNode, blockIndex);

      // Create a new paragraph after the image for continued editing
      const newText = createTextNode('', {});
      const newParagraph = createParagraphNode([newText.key]);
      newText.parent = newParagraph.key;

      this.state = insertNode(this.state, parent.key, newParagraph, blockIndex + 1);
      this.state.nodeMap.set(newText.key, newText);

      // Log the new paragraph and text node for delta sync
      if (this.opLogger) {
        const { parent: _p, ...paragraphWithoutParent } = newParagraph;
        this.opLogger.logNodeInsert(newParagraph.key, parent.key, blockIndex + 1, paragraphWithoutParent);
        const { parent: _tp, ...textWithoutParent } = newText;
        this.opLogger.logNodeInsert(newText.key, newParagraph.key, 0, textWithoutParent);
      }

      // Move selection to the new paragraph
      this.selection = createCollapsedSelection(newText.key, 0);
    } else {
      // Insert image after current block
      this.state = insertNode(this.state, block.parent, imageNode, blockIndex + 1);

      // Create a new paragraph after the image for continued editing
      const newText = createTextNode('', {});
      const newParagraph = createParagraphNode([newText.key]);
      newText.parent = newParagraph.key;

      this.state = insertNode(this.state, block.parent, newParagraph, blockIndex + 2);
      this.state.nodeMap.set(newText.key, newText);

      // Log the new paragraph and text node for delta sync
      if (this.opLogger) {
        const { parent: _p, ...paragraphWithoutParent } = newParagraph;
        this.opLogger.logNodeInsert(newParagraph.key, block.parent, blockIndex + 2, paragraphWithoutParent);
        const { parent: _tp, ...textWithoutParent } = newText;
        this.opLogger.logNodeInsert(newText.key, newParagraph.key, 0, textWithoutParent);
      }

      // Move selection to the new paragraph
      this.selection = createCollapsedSelection(newText.key, 0);
    }

    this.render();
  }

  private insertAdmonition(admonitionType: AdmonitionType): void {
    if (!this.selection) return;

    const block = getBlockAncestor(this.state, this.selection.anchor.key);
    if (!block || !block.parent) return;

    // Save to history
    this.history.push(this.state, this.selection);

    const parent = getNode(this.state, block.parent);
    if (!parent || !isElementNode(parent)) return;

    const blockIndex = parent.children.indexOf(block.key);

    // Check if current block is empty (only contains empty text)
    const currentTextNode = getNode(this.state, this.selection.anchor.key);
    const isBlockEmpty = currentTextNode && isTextNode(currentTextNode) && currentTextNode.text === '';

    // Create text node for admonition content
    const textNode = createTextNode('', {});
    const paragraphNode = createParagraphNode([textNode.key]);
    textNode.parent = paragraphNode.key;

    // Create admonition node with paragraph inside
    const admonitionNode = createAdmonitionNode(admonitionType, [paragraphNode.key]);
    paragraphNode.parent = admonitionNode.key;

    if (isBlockEmpty) {
      // Replace empty block with admonition
      this.state = removeNode(this.state, block.key);
      this.state = insertNode(this.state, parent.key, admonitionNode, blockIndex);
      this.state.nodeMap.set(paragraphNode.key, paragraphNode);
      this.state.nodeMap.set(textNode.key, textNode);
    } else {
      // Insert admonition after current block
      this.state = insertNode(this.state, block.parent, admonitionNode, blockIndex + 1);
      this.state.nodeMap.set(paragraphNode.key, paragraphNode);
      this.state.nodeMap.set(textNode.key, textNode);
    }

    // Log operation for delta sync
    if (this.opLogger) {
      if (isBlockEmpty) {
        this.opLogger.logNodeDelete(block.key);
      }
      this.opLogger.logNodeInsert(admonitionNode.key, block.parent, blockIndex + (isBlockEmpty ? 0 : 1), {
        type: admonitionNode.type,
        key: admonitionNode.key,
        admonitionType: admonitionNode.admonitionType,
        children: admonitionNode.children,
      });
    }

    // Move selection to the text inside admonition
    this.selection = createCollapsedSelection(textNode.key, 0);

    this.render();
  }

  private setCodeLanguage(nodeKey: string, language: string): void {
    const node = getNode(this.state, nodeKey);
    if (!node || node.type !== 'code') return;

    // Save to history
    this.history.push(this.state, this.selection);

    // Update the node's language
    this.state = updateNode(this.state, nodeKey, { language: language || undefined });

    // Log operation for delta sync
    if (this.opLogger) {
      this.opLogger.logNodeUpdate(nodeKey, { language: language || undefined });
    }

    this.render();
  }

  private insertLink(url: string): void {
    console.log('[EditorCore] insertLink called:', { url, selection: this.selection });
    if (!this.selection) return;

    const { anchor, focus } = this.selection;

    // Need a selection to create a link
    if (this.selection.isCollapsed) {
      console.log('[EditorCore] insertLink: collapsed selection, inserting URL as text');
      // For collapsed selection, insert the URL as link text
      const node = getNode(this.state, anchor.key);
      if (!node || !isTextNode(node)) return;

      const parent = getNode(this.state, node.parent!);
      if (!parent || !isElementNode(parent)) return;

      this.history.push(this.state, this.selection);

      const nodeIndex = parent.children.indexOf(node.key);
      const offset = anchor.offset;

      // Split text if needed
      const beforeText = node.text.slice(0, offset);
      const afterText = node.text.slice(offset);

      const newState = cloneState(this.state);
      const parentInNewState = newState.nodeMap.get(node.parent!) as any;

      // Remove original node
      parentInNewState.children.splice(nodeIndex, 1);
      newState.nodeMap.delete(node.key);

      let insertIndex = nodeIndex;
      let linkTextKey = '';

      // Create "before" node if there's text
      if (beforeText) {
        const beforeNode = createTextNode(beforeText, { ...node.format });
        beforeNode.parent = node.parent;
        newState.nodeMap.set(beforeNode.key, beforeNode);
        parentInNewState.children.splice(insertIndex++, 0, beforeNode.key);
      }

      // Create link node with URL as text
      const linkTextNode = createTextNode(url, {});
      const linkNode = createLinkNode(url, [linkTextNode.key]);
      linkNode.parent = node.parent;
      linkTextNode.parent = linkNode.key;
      newState.nodeMap.set(linkNode.key, linkNode);
      newState.nodeMap.set(linkTextNode.key, linkTextNode);
      parentInNewState.children.splice(insertIndex++, 0, linkNode.key);
      linkTextKey = linkTextNode.key;

      // Create "after" node if there's text
      if (afterText) {
        const afterNode = createTextNode(afterText, { ...node.format });
        afterNode.parent = node.parent;
        newState.nodeMap.set(afterNode.key, afterNode);
        parentInNewState.children.splice(insertIndex++, 0, afterNode.key);
      }

      this.state = newState;
      this.selection = createCollapsedSelection(linkTextKey, url.length);
      this.render();
      return;
    }

    // Non-collapsed selection - wrap selected text in a link
    if (anchor.key === focus.key) {
      const node = getNode(this.state, anchor.key);
      console.log('[EditorCore] insertLink: same node selection, node:', node);
      if (!node || !isTextNode(node)) return;

      const parent = getNode(this.state, node.parent!);
      console.log('[EditorCore] insertLink: parent:', parent);
      if (!parent || !isElementNode(parent)) return;

      this.history.push(this.state, this.selection);

      const startOffset = Math.min(anchor.offset, focus.offset);
      const endOffset = Math.max(anchor.offset, focus.offset);

      const beforeText = node.text.slice(0, startOffset);
      const selectedText = node.text.slice(startOffset, endOffset);
      const afterText = node.text.slice(endOffset);

      console.log('[EditorCore] insertLink: splitting text:', { beforeText, selectedText, afterText });

      const newState = cloneState(this.state);
      const parentInNewState = newState.nodeMap.get(node.parent!) as any;
      const nodeIndex = parentInNewState.children.indexOf(node.key);

      // Remove original node
      parentInNewState.children.splice(nodeIndex, 1);
      newState.nodeMap.delete(node.key);

      let insertIndex = nodeIndex;
      let linkTextKey = '';

      // Create "before" node if there's text
      if (beforeText) {
        const beforeNode = createTextNode(beforeText, { ...node.format });
        beforeNode.parent = node.parent;
        newState.nodeMap.set(beforeNode.key, beforeNode);
        parentInNewState.children.splice(insertIndex++, 0, beforeNode.key);
      }

      // Create link node with selected text
      const linkTextNode = createTextNode(selectedText, { ...node.format });
      const linkNode = createLinkNode(url, [linkTextNode.key]);
      linkNode.parent = node.parent;
      linkTextNode.parent = linkNode.key;
      newState.nodeMap.set(linkNode.key, linkNode);
      newState.nodeMap.set(linkTextNode.key, linkTextNode);
      parentInNewState.children.splice(insertIndex++, 0, linkNode.key);
      linkTextKey = linkTextNode.key;

      console.log('[EditorCore] insertLink: created link node:', linkNode);
      console.log('[EditorCore] insertLink: created link text node:', linkTextNode);
      console.log('[EditorCore] insertLink: parent children after insert:', parentInNewState.children);

      // Create "after" node if there's text
      if (afterText) {
        const afterNode = createTextNode(afterText, { ...node.format });
        afterNode.parent = node.parent;
        newState.nodeMap.set(afterNode.key, afterNode);
        parentInNewState.children.splice(insertIndex++, 0, afterNode.key);
      }

      this.state = newState;

      // Log operations for delta sync
      if (this.opLogger) {
        this.opLogger.logNodeDelete(node.key);
        this.opLogger.logNodeInsert(linkNode.key, node.parent!, nodeIndex + (beforeText ? 1 : 0), {
          type: 'link',
          url,
          children: [linkTextNode.key],
        });
      }

      // Set selection to cover the link text
      this.selection = {
        anchor: { key: linkTextKey, offset: 0 },
        focus: { key: linkTextKey, offset: selectedText.length },
        isCollapsed: false,
      };

      this.render();
    } else {
      // Multi-node selection - collect all text from selection range
      console.log('[EditorCore] insertLink: multi-node selection');

      const anchorNode = getNode(this.state, anchor.key);
      const focusNode = getNode(this.state, focus.key);

      if (!anchorNode || !isTextNode(anchorNode) || !focusNode || !isTextNode(focusNode)) {
        console.log('[EditorCore] insertLink: anchor or focus is not a text node');
        return;
      }

      // Both nodes should have the same parent for simplicity
      if (anchorNode.parent !== focusNode.parent) {
        console.log('[EditorCore] insertLink: nodes have different parents, not supported');
        return;
      }

      const parent = getNode(this.state, anchorNode.parent!);
      if (!parent || !isElementNode(parent)) return;

      this.history.push(this.state, this.selection);

      const newState = cloneState(this.state);
      const parentInNewState = newState.nodeMap.get(anchorNode.parent!) as any;

      // Determine which node comes first
      const anchorIndex = parentInNewState.children.indexOf(anchor.key);
      const focusIndex = parentInNewState.children.indexOf(focus.key);

      const startIndex = Math.min(anchorIndex, focusIndex);
      const endIndex = Math.max(anchorIndex, focusIndex);

      const isAnchorFirst = anchorIndex < focusIndex;
      const startNode = isAnchorFirst ? anchorNode : focusNode;
      const endNode = isAnchorFirst ? focusNode : anchorNode;
      const startOffset = isAnchorFirst ? anchor.offset : focus.offset;
      const endOffset = isAnchorFirst ? focus.offset : anchor.offset;

      // Collect all text from start to end
      let selectedText = '';
      selectedText += startNode.text.slice(startOffset);

      for (let i = startIndex + 1; i < endIndex; i++) {
        const middleNode = getNode(this.state, parentInNewState.children[i]);
        if (middleNode && isTextNode(middleNode)) {
          selectedText += middleNode.text;
        }
      }

      selectedText += endNode.text.slice(0, endOffset);

      console.log('[EditorCore] insertLink: collected text:', selectedText);

      // Text before selection in start node
      const beforeText = startNode.text.slice(0, startOffset);
      // Text after selection in end node
      const afterText = endNode.text.slice(endOffset);

      // Remove all nodes from start to end (inclusive)
      const nodesToRemove = parentInNewState.children.slice(startIndex, endIndex + 1);
      parentInNewState.children.splice(startIndex, endIndex - startIndex + 1);
      nodesToRemove.forEach((key: string) => newState.nodeMap.delete(key));

      let insertIndex = startIndex;
      let linkTextKey = '';

      // Create "before" node if there's text
      if (beforeText) {
        const beforeNode = createTextNode(beforeText, { ...startNode.format });
        beforeNode.parent = anchorNode.parent;
        newState.nodeMap.set(beforeNode.key, beforeNode);
        parentInNewState.children.splice(insertIndex++, 0, beforeNode.key);
      }

      // Create link node with selected text
      const linkTextNode = createTextNode(selectedText, {});
      const linkNode = createLinkNode(url, [linkTextNode.key]);
      linkNode.parent = anchorNode.parent;
      linkTextNode.parent = linkNode.key;
      newState.nodeMap.set(linkNode.key, linkNode);
      newState.nodeMap.set(linkTextNode.key, linkTextNode);
      parentInNewState.children.splice(insertIndex++, 0, linkNode.key);
      linkTextKey = linkTextNode.key;

      // Create "after" node if there's text
      if (afterText) {
        const afterNode = createTextNode(afterText, { ...endNode.format });
        afterNode.parent = anchorNode.parent;
        newState.nodeMap.set(afterNode.key, afterNode);
        parentInNewState.children.splice(insertIndex++, 0, afterNode.key);
      }

      this.state = newState;

      // Set selection to cover the link text
      this.selection = {
        anchor: { key: linkTextKey, offset: 0 },
        focus: { key: linkTextKey, offset: selectedText.length },
        isCollapsed: false,
      };

      this.render();
    }
  }

  private updateLink(nodeKey: string, textNodeKey: string, newUrl: string, newText: string): void {
    const linkNode = getNode(this.state, nodeKey);
    if (!linkNode || linkNode.type !== 'link') return;

    const textNode = getNode(this.state, textNodeKey);
    if (!textNode || !isTextNode(textNode)) return;

    this.history.push(this.state, this.selection);

    // Update link URL
    this.state = updateNode(this.state, nodeKey, { url: newUrl });

    // Update text content
    this.state = updateNode(this.state, textNodeKey, { text: newText });

    if (this.opLogger) {
      this.opLogger.logNodeUpdate(nodeKey, { url: newUrl });
      this.opLogger.logNodeUpdate(textNodeKey, { text: newText });
    }

    this.render();
  }

  private removeLink(nodeKey: string): void {
    const linkNode = getNode(this.state, nodeKey);
    if (!linkNode || linkNode.type !== 'link' || !linkNode.parent) return;

    const parent = getNode(this.state, linkNode.parent);
    if (!parent || !isElementNode(parent)) return;

    this.history.push(this.state, this.selection);

    const newState = cloneState(this.state);
    const parentInNewState = newState.nodeMap.get(linkNode.parent) as any;
    const linkIndex = parentInNewState.children.indexOf(nodeKey);

    if (linkIndex === -1) return;

    // Get the text from the link's children
    const linkChildren = (linkNode as any).children || [];

    // Remove link from parent's children
    parentInNewState.children.splice(linkIndex, 1);

    // Insert link's children (text nodes) in place of the link
    linkChildren.forEach((childKey: string, i: number) => {
      const child = newState.nodeMap.get(childKey);
      if (child) {
        child.parent = linkNode.parent;
        parentInNewState.children.splice(linkIndex + i, 0, childKey);
      }
    });

    // Remove link node from nodeMap
    newState.nodeMap.delete(nodeKey);

    this.state = newState;

    if (this.opLogger) {
      this.opLogger.logNodeDelete(nodeKey);
    }

    // Set selection to the unwrapped text
    if (linkChildren.length > 0) {
      const firstChild = newState.nodeMap.get(linkChildren[0]);
      if (firstChild && isTextNode(firstChild)) {
        this.selection = createCollapsedSelection(firstChild.key, 0);
      }
    }

    this.render();
  }

  private insertDrawio(diagramXML: string, assetId?: string): void {
    if (!this.selection) return;

    const block = getBlockAncestor(this.state, this.selection.anchor.key);
    if (!block || !block.parent) return;

    // Save to history
    this.history.push(this.state, this.selection);

    const parent = getNode(this.state, block.parent);
    if (!parent || !isElementNode(parent)) return;

    const blockIndex = parent.children.indexOf(block.key);

    // Check if current block is empty (only contains empty text)
    const textNode = getNode(this.state, this.selection.anchor.key);
    const isBlockEmpty = textNode && isTextNode(textNode) && textNode.text === '';

    // Create drawio node with optional assetId
    const drawioNode = createDrawioNode(diagramXML, assetId);

    // Log operation for delta sync
    if (this.opLogger) {
      if (isBlockEmpty) {
        this.opLogger.logNodeDelete(block.key);
      }
      this.opLogger.logNodeInsert(drawioNode.key, block.parent, blockIndex + (isBlockEmpty ? 0 : 1), {
        type: 'drawio',
        assetId,
      });
    }

    if (isBlockEmpty) {
      // Replace empty block with drawio
      this.state = removeNode(this.state, block.key);
      this.state = insertNode(this.state, parent.key, drawioNode, blockIndex);

      // Create a new paragraph after the diagram for continued editing
      const newText = createTextNode('', {});
      const newParagraph = createParagraphNode([newText.key]);
      newText.parent = newParagraph.key;

      this.state = insertNode(this.state, parent.key, newParagraph, blockIndex + 1);
      this.state.nodeMap.set(newText.key, newText);

      // Log the new paragraph and text node for delta sync
      if (this.opLogger) {
        const { parent: _p, ...paragraphWithoutParent } = newParagraph;
        this.opLogger.logNodeInsert(newParagraph.key, parent.key, blockIndex + 1, paragraphWithoutParent);
        const { parent: _tp, ...textWithoutParent } = newText;
        this.opLogger.logNodeInsert(newText.key, newParagraph.key, 0, textWithoutParent);
      }

      // Move selection to the new paragraph
      this.selection = createCollapsedSelection(newText.key, 0);
    } else {
      // Insert drawio after current block
      this.state = insertNode(this.state, block.parent, drawioNode, blockIndex + 1);

      // Create a new paragraph after the diagram for continued editing
      const newText = createTextNode('', {});
      const newParagraph = createParagraphNode([newText.key]);
      newText.parent = newParagraph.key;

      this.state = insertNode(this.state, block.parent, newParagraph, blockIndex + 2);
      this.state.nodeMap.set(newText.key, newText);

      // Log the new paragraph and text node for delta sync
      if (this.opLogger) {
        const { parent: _p, ...paragraphWithoutParent } = newParagraph;
        this.opLogger.logNodeInsert(newParagraph.key, block.parent, blockIndex + 2, paragraphWithoutParent);
        const { parent: _tp, ...textWithoutParent } = newText;
        this.opLogger.logNodeInsert(newText.key, newParagraph.key, 0, textWithoutParent);
      }

      // Move selection to the new paragraph
      this.selection = createCollapsedSelection(newText.key, 0);
    }

    this.render();
  }

  // Track the last inserted image/drawio key for updates
  private lastInsertedImageKey: string | null = null;
  private lastInsertedDrawioKey: string | null = null;

  private updateLastImage(src: string, alt: string, assetId?: string): void {
    // Find the most recent image node without src (placeholder)
    const rootNode = getNode(this.state, this.state.root);
    if (!rootNode || !isElementNode(rootNode)) return;

    for (const childKey of [...rootNode.children].reverse()) {
      const node = getNode(this.state, childKey);
      if (node && node.type === 'image' && !(node as ImageNode).src) {
        // Found the placeholder, update it
        const imageNode = node as ImageNode;
        const updatedNode: ImageNode = {
          ...imageNode,
          src,
          alt,
          assetId,
        };
        this.state.nodeMap.set(imageNode.key, updatedNode);

        // Log operation for delta sync
        if (this.opLogger) {
          this.opLogger.logNodeUpdate(imageNode.key, { src, alt, assetId });
        }

        this.render();
        return;
      }
    }
  }

  private updateLastDrawio(diagramXML: string, assetId?: string): void {
    // Find the most recent drawio node without diagramXML (placeholder)
    const rootNode = getNode(this.state, this.state.root);
    if (!rootNode || !isElementNode(rootNode)) return;

    for (const childKey of [...rootNode.children].reverse()) {
      const node = getNode(this.state, childKey);
      if (node && node.type === 'drawio' && !(node as DrawioNode).diagramXML) {
        // Found the placeholder, update it
        const drawioNode = node as DrawioNode;
        const updatedNode: DrawioNode = {
          ...drawioNode,
          diagramXML,
          assetId,
        };
        this.state.nodeMap.set(drawioNode.key, updatedNode);

        // Log operation for delta sync
        if (this.opLogger) {
          this.opLogger.logNodeUpdate(drawioNode.key, { diagramXML, assetId });
        }

        this.render();
        return;
      }
    }
  }

  private insertDivider(): void {
    if (!this.selection) return;

    const block = getBlockAncestor(this.state, this.selection.anchor.key);
    if (!block || !block.parent) return;

    // Save to history
    this.history.push(this.state, this.selection);

    const parent = getNode(this.state, block.parent);
    if (!parent || !isElementNode(parent)) return;

    const blockIndex = parent.children.indexOf(block.key);

    // Check if current block is empty (only contains empty text)
    const textNode = getNode(this.state, this.selection.anchor.key);
    const isBlockEmpty = textNode && isTextNode(textNode) && textNode.text === '';

    // Create divider node
    const dividerNode = createDividerNode();

    // Log operation for delta sync
    if (this.opLogger) {
      if (isBlockEmpty) {
        this.opLogger.logNodeDelete(block.key);
      }
      this.opLogger.logNodeInsert(dividerNode.key, block.parent, blockIndex + (isBlockEmpty ? 0 : 1), {
        type: 'divider',
      });
    }

    if (isBlockEmpty) {
      // Replace empty block with divider
      this.state = removeNode(this.state, block.key);
      this.state = insertNode(this.state, parent.key, dividerNode, blockIndex);

      // Create a new paragraph after the divider for continued editing
      const newText = createTextNode('', {});
      const newParagraph = createParagraphNode([newText.key]);
      newText.parent = newParagraph.key;

      this.state = insertNode(this.state, parent.key, newParagraph, blockIndex + 1);
      this.state.nodeMap.set(newText.key, newText);

      // Log the new paragraph and text node for delta sync
      if (this.opLogger) {
        const { parent: _p, ...paragraphWithoutParent } = newParagraph;
        this.opLogger.logNodeInsert(newParagraph.key, parent.key, blockIndex + 1, paragraphWithoutParent);
        const { parent: _tp, ...textWithoutParent } = newText;
        this.opLogger.logNodeInsert(newText.key, newParagraph.key, 0, textWithoutParent);
      }

      // Move selection to the new paragraph
      this.selection = createCollapsedSelection(newText.key, 0);
    } else {
      // Insert divider after current block
      this.state = insertNode(this.state, block.parent, dividerNode, blockIndex + 1);

      // Create a new paragraph after the divider for continued editing
      const newText = createTextNode('', {});
      const newParagraph = createParagraphNode([newText.key]);
      newText.parent = newParagraph.key;

      this.state = insertNode(this.state, block.parent, newParagraph, blockIndex + 2);
      this.state.nodeMap.set(newText.key, newText);

      // Log the new paragraph and text node for delta sync
      if (this.opLogger) {
        const { parent: _p, ...paragraphWithoutParent } = newParagraph;
        this.opLogger.logNodeInsert(newParagraph.key, block.parent, blockIndex + 2, paragraphWithoutParent);
        const { parent: _tp, ...textWithoutParent } = newText;
        this.opLogger.logNodeInsert(newText.key, newParagraph.key, 0, textWithoutParent);
      }

      // Move selection to the new paragraph
      this.selection = createCollapsedSelection(newText.key, 0);
    }

    this.render();
  }

  private insertTable(rows: number, cols: number): void {
    if (!this.selection) return;

    const block = getBlockAncestor(this.state, this.selection.anchor.key);
    if (!block || !block.parent) return;

    // Save to history
    this.history.push(this.state, this.selection);

    const parent = getNode(this.state, block.parent);
    if (!parent || !isElementNode(parent)) return;

    const blockIndex = parent.children.indexOf(block.key);

    // Check if current block is empty (only contains empty text)
    const currentTextNode = getNode(this.state, this.selection.anchor.key);
    const isBlockEmpty = currentTextNode && isTextNode(currentTextNode) && currentTextNode.text === '';

    // Create table structure
    const tableNode = createTableNode([]);
    let firstCellTextKey: string | null = null;

    // Determine insert index
    const insertIndex = isBlockEmpty ? blockIndex : blockIndex + 1;

    // Remove empty block if needed
    if (isBlockEmpty) {
      this.state = removeNode(this.state, block.key);
    }

    // Insert the table node to get the new state
    this.state = insertNode(this.state, parent.key, tableNode, insertIndex);

    // Now build the table structure in the new state
    for (let r = 0; r < rows; r++) {
      const rowNode = createTableRowNode([]);
      rowNode.parent = tableNode.key;

      for (let c = 0; c < cols; c++) {
        const textNode = createTextNode('', {});
        const cellNode = createTableCellNode([textNode.key], false);
        textNode.parent = cellNode.key;
        cellNode.parent = rowNode.key;

        this.state.nodeMap.set(textNode.key, textNode);
        this.state.nodeMap.set(cellNode.key, cellNode);
        rowNode.children.push(cellNode.key);

        // Track first cell for selection
        if (r === 0 && c === 0) {
          firstCellTextKey = textNode.key;
        }
      }

      this.state.nodeMap.set(rowNode.key, rowNode);
      // Add row to table's children in the state
      const tableInState = this.state.nodeMap.get(tableNode.key) as any;
      if (tableInState) {
        tableInState.children.push(rowNode.key);
      }
    }

    // Create a new paragraph after the table for continued editing
    const newText = createTextNode('', {});
    const newParagraph = createParagraphNode([newText.key]);
    newText.parent = newParagraph.key;

    this.state = insertNode(this.state, parent.key, newParagraph, insertIndex + 1);
    this.state.nodeMap.set(newText.key, newText);

    // Log operation for delta sync
    if (this.opLogger) {
      if (isBlockEmpty) {
        this.opLogger.logNodeDelete(block.key);
      }
      const tableInState = this.state.nodeMap.get(tableNode.key);
      if (tableInState) {
        const { parent: _parent, ...tableWithoutParent } = tableInState;
        this.opLogger.logNodeInsert(tableNode.key, block.parent!, insertIndex, tableWithoutParent);

        // Log all nested nodes (rows, cells, text nodes)
        const tableChildren = (tableInState as any).children || [];
        tableChildren.forEach((rowKey: string, rowIndex: number) => {
          const rowNode = this.state.nodeMap.get(rowKey);
          if (rowNode) {
            const { parent: _rp, ...rowWithoutParent } = rowNode;
            this.opLogger!.logNodeInsert(rowKey, tableNode.key, rowIndex, rowWithoutParent);

            const rowChildren = (rowNode as any).children || [];
            rowChildren.forEach((cellKey: string, cellIndex: number) => {
              const cellNode = this.state.nodeMap.get(cellKey);
              if (cellNode) {
                const { parent: _cp, ...cellWithoutParent } = cellNode;
                this.opLogger!.logNodeInsert(cellKey, rowKey, cellIndex, cellWithoutParent);

                const cellChildren = (cellNode as any).children || [];
                cellChildren.forEach((textKey: string, textIndex: number) => {
                  const textNode = this.state.nodeMap.get(textKey);
                  if (textNode) {
                    const { parent: _tp, ...textWithoutParent } = textNode;
                    this.opLogger!.logNodeInsert(textKey, cellKey, textIndex, textWithoutParent);
                  }
                });
              }
            });
          }
        });
      }

      // Log the new paragraph after table
      const { parent: _pp, ...paragraphWithoutParent } = newParagraph;
      this.opLogger.logNodeInsert(newParagraph.key, parent.key, insertIndex + 1, paragraphWithoutParent);
      const { parent: _tp, ...textWithoutParent } = newText;
      this.opLogger.logNodeInsert(newText.key, newParagraph.key, 0, textWithoutParent);
    }

    // Move selection to the first cell
    if (firstCellTextKey) {
      this.selection = createCollapsedSelection(firstCellTextKey, 0);
    }

    this.render();
  }

  private addTableRow(tableKey: string): void {
    const table = getNode(this.state, tableKey);
    if (!table || table.type !== 'table') return;

    this.history.push(this.state, this.selection);

    // Get column count from first row
    const firstRowKey = (table as any).children[0];
    const firstRow = getNode(this.state, firstRowKey);
    if (!firstRow || firstRow.type !== 'tablerow') return;

    const colCount = (firstRow as any).children.length;

    // Create new row
    const rowNode = createTableRowNode([]);
    rowNode.parent = tableKey;

    for (let c = 0; c < colCount; c++) {
      const textNode = createTextNode('', {});
      const cellNode = createTableCellNode([textNode.key], false);
      textNode.parent = cellNode.key;
      cellNode.parent = rowNode.key;

      this.state.nodeMap.set(textNode.key, textNode);
      this.state.nodeMap.set(cellNode.key, cellNode);
      rowNode.children.push(cellNode.key);
    }

    this.state.nodeMap.set(rowNode.key, rowNode);
    const tableInState = this.state.nodeMap.get(tableKey) as any;
    const rowIndex = tableInState.children.length;
    tableInState.children.push(rowNode.key);

    // Log operations for delta sync
    if (this.opLogger) {
      const { parent: _rp, ...rowWithoutParent } = rowNode;
      this.opLogger.logNodeInsert(rowNode.key, tableKey, rowIndex, rowWithoutParent);

      // Log all cells and text nodes
      rowNode.children.forEach((cellKey: string, cellIndex: number) => {
        const cellNode = this.state.nodeMap.get(cellKey);
        if (cellNode) {
          const { parent: _cp, ...cellWithoutParent } = cellNode;
          this.opLogger!.logNodeInsert(cellKey, rowNode.key, cellIndex, cellWithoutParent);

          const cellChildren = (cellNode as any).children || [];
          cellChildren.forEach((textKey: string, textIndex: number) => {
            const textNode = this.state.nodeMap.get(textKey);
            if (textNode) {
              const { parent: _tp, ...textWithoutParent } = textNode;
              this.opLogger!.logNodeInsert(textKey, cellKey, textIndex, textWithoutParent);
            }
          });
        }
      });
    }

    this.render();
  }

  private addTableCol(tableKey: string): void {
    const table = getNode(this.state, tableKey);
    if (!table || table.type !== 'table') return;

    this.history.push(this.state, this.selection);

    const insertedCells: { cellKey: string; textKey: string; rowKey: string; colIndex: number }[] = [];

    // Add a cell to each row
    (table as any).children.forEach((rowKey: string) => {
      const row = this.state.nodeMap.get(rowKey);
      if (!row || row.type !== 'tablerow') return;

      const textNode = createTextNode('', {});
      const cellNode = createTableCellNode([textNode.key], false);
      textNode.parent = cellNode.key;
      cellNode.parent = rowKey;

      const colIndex = (row as any).children.length;

      this.state.nodeMap.set(textNode.key, textNode);
      this.state.nodeMap.set(cellNode.key, cellNode);
      (row as any).children.push(cellNode.key);

      insertedCells.push({ cellKey: cellNode.key, textKey: textNode.key, rowKey, colIndex });
    });

    // Log operations for delta sync
    if (this.opLogger) {
      insertedCells.forEach(({ cellKey, textKey, rowKey, colIndex }) => {
        const cellNode = this.state.nodeMap.get(cellKey);
        if (cellNode) {
          const { parent: _cp, ...cellWithoutParent } = cellNode;
          this.opLogger!.logNodeInsert(cellKey, rowKey, colIndex, cellWithoutParent);
        }
        const textNode = this.state.nodeMap.get(textKey);
        if (textNode) {
          const { parent: _tp, ...textWithoutParent } = textNode;
          this.opLogger!.logNodeInsert(textKey, cellKey, 0, textWithoutParent);
        }
      });
    }

    this.render();
  }

  private insertTableRowAt(tableKey: string, atIndex: number): void {
    const table = getNode(this.state, tableKey);
    if (!table || table.type !== 'table') return;

    this.history.push(this.state, this.selection);

    const firstRowKey = (table as any).children[0];
    const firstRow = getNode(this.state, firstRowKey);
    if (!firstRow || firstRow.type !== 'tablerow') return;

    const colCount = (firstRow as any).children.length;

    const rowNode = createTableRowNode([]);
    rowNode.parent = tableKey;

    for (let c = 0; c < colCount; c++) {
      const textNode = createTextNode('', {});
      const cellNode = createTableCellNode([textNode.key], false);
      textNode.parent = cellNode.key;
      cellNode.parent = rowNode.key;

      this.state.nodeMap.set(textNode.key, textNode);
      this.state.nodeMap.set(cellNode.key, cellNode);
      rowNode.children.push(cellNode.key);
    }

    this.state.nodeMap.set(rowNode.key, rowNode);
    const tableNode = this.state.nodeMap.get(tableKey) as any;
    tableNode.children.splice(atIndex, 0, rowNode.key);

    // Log operation for delta sync
    if (this.opLogger) {
      const { parent: _parent, ...rowWithoutParent } = rowNode;
      this.opLogger.logNodeInsert(rowNode.key, tableKey, atIndex, rowWithoutParent);

      // Log all cells and text nodes within the row
      rowNode.children.forEach((cellKey: string, cellIndex: number) => {
        const cellNode = this.state.nodeMap.get(cellKey);
        if (cellNode) {
          const { parent: _cp, ...cellWithoutParent } = cellNode;
          this.opLogger!.logNodeInsert(cellKey, rowNode.key, cellIndex, cellWithoutParent);

          const cellChildren = (cellNode as any).children || [];
          cellChildren.forEach((textKey: string, textIndex: number) => {
            const textNode = this.state.nodeMap.get(textKey);
            if (textNode) {
              const { parent: _tp, ...textWithoutParent } = textNode;
              this.opLogger!.logNodeInsert(textKey, cellKey, textIndex, textWithoutParent);
            }
          });
        }
      });
    }

    this.render();
  }

  private insertTableColAt(tableKey: string, atIndex: number): void {
    const table = getNode(this.state, tableKey);
    if (!table || table.type !== 'table') return;

    this.history.push(this.state, this.selection);

    const insertedCells: { cellKey: string; textKey: string; rowKey: string }[] = [];

    (table as any).children.forEach((rowKey: string) => {
      const row = this.state.nodeMap.get(rowKey);
      if (!row || row.type !== 'tablerow') return;

      const textNode = createTextNode('', {});
      const cellNode = createTableCellNode([textNode.key], false);
      textNode.parent = cellNode.key;
      cellNode.parent = rowKey;

      this.state.nodeMap.set(textNode.key, textNode);
      this.state.nodeMap.set(cellNode.key, cellNode);
      (row as any).children.splice(atIndex, 0, cellNode.key);

      insertedCells.push({ cellKey: cellNode.key, textKey: textNode.key, rowKey });
    });

    // Log operations for delta sync (log cell and text node insertions for each row)
    if (this.opLogger) {
      insertedCells.forEach(({ cellKey, textKey, rowKey }) => {
        const cell = this.state.nodeMap.get(cellKey);
        if (cell) {
          const { parent: _parent, ...cellWithoutParent } = cell;
          this.opLogger!.logNodeInsert(cellKey, rowKey, atIndex, cellWithoutParent);
        }
        const text = this.state.nodeMap.get(textKey);
        if (text) {
          const { parent: _tp, ...textWithoutParent } = text;
          this.opLogger!.logNodeInsert(textKey, cellKey, 0, textWithoutParent);
        }
      });
    }

    this.render();
  }

  private deleteTableRow(tableKey: string, rowIndex: number): void {
    const table = getNode(this.state, tableKey);
    if (!table || table.type !== 'table') return;

    const rows = (table as any).children;
    if (rows.length <= 1) return; // Don't delete last row

    this.history.push(this.state, this.selection);

    const rowKey = rows[rowIndex];
    const row = this.state.nodeMap.get(rowKey);

    // Log operation for delta sync before deletion
    if (this.opLogger) {
      this.opLogger.logNodeDelete(rowKey);
    }

    // Delete all cells and their content
    if (row && (row as any).children) {
      (row as any).children.forEach((cellKey: string) => {
        const cell = this.state.nodeMap.get(cellKey);
        if (cell && (cell as any).children) {
          (cell as any).children.forEach((childKey: string) => {
            this.state.nodeMap.delete(childKey);
          });
        }
        this.state.nodeMap.delete(cellKey);
      });
    }

    this.state.nodeMap.delete(rowKey);
    (table as any).children.splice(rowIndex, 1);

    this.render();
  }

  private deleteTableCol(tableKey: string, colIndex: number): void {
    const table = getNode(this.state, tableKey);
    if (!table || table.type !== 'table') return;

    const firstRow = this.state.nodeMap.get((table as any).children[0]);
    if (!firstRow || (firstRow as any).children.length <= 1) return; // Don't delete last column

    this.history.push(this.state, this.selection);

    const deletedCells: string[] = [];

    (table as any).children.forEach((rowKey: string) => {
      const row = this.state.nodeMap.get(rowKey);
      if (!row || row.type !== 'tablerow') return;

      const cellKey = (row as any).children[colIndex];
      if (cellKey) {
        deletedCells.push(cellKey);
        const cell = this.state.nodeMap.get(cellKey);
        if (cell && (cell as any).children) {
          (cell as any).children.forEach((childKey: string) => {
            this.state.nodeMap.delete(childKey);
          });
        }
        this.state.nodeMap.delete(cellKey);
        (row as any).children.splice(colIndex, 1);
      }
    });

    // Log operations for delta sync
    if (this.opLogger) {
      deletedCells.forEach(cellKey => {
        this.opLogger!.logNodeDelete(cellKey);
      });
    }

    this.render();
  }

  private moveTableRow(tableKey: string, fromIndex: number, toIndex: number): void {
    const table = getNode(this.state, tableKey);
    if (!table || table.type !== 'table') return;

    this.history.push(this.state, this.selection);

    const rows = (table as any).children;
    const [removed] = rows.splice(fromIndex, 1);
    rows.splice(toIndex, 0, removed);

    this.render();
  }

  private moveTableCol(tableKey: string, fromIndex: number, toIndex: number): void {
    const table = getNode(this.state, tableKey);
    if (!table || table.type !== 'table') return;

    this.history.push(this.state, this.selection);

    (table as any).children.forEach((rowKey: string) => {
      const row = this.state.nodeMap.get(rowKey);
      if (!row || row.type !== 'tablerow') return;

      const cells = (row as any).children;
      const [removed] = cells.splice(fromIndex, 1);
      cells.splice(toIndex, 0, removed);
    });

    this.render();
  }

  private duplicateTableRow(tableKey: string, rowIndex: number): void {
    const table = getNode(this.state, tableKey);
    if (!table || table.type !== 'table') return;

    this.history.push(this.state, this.selection);

    const sourceRowKey = (table as any).children[rowIndex];
    const sourceRow = this.state.nodeMap.get(sourceRowKey);
    if (!sourceRow || sourceRow.type !== 'tablerow') return;

    const newRow = createTableRowNode([]);
    newRow.parent = tableKey;

    (sourceRow as any).children.forEach((cellKey: string) => {
      const sourceCell = this.state.nodeMap.get(cellKey);
      if (!sourceCell || sourceCell.type !== 'tablecell') return;

      // Get text content from source cell
      let textContent = '';
      (sourceCell as any).children.forEach((childKey: string) => {
        const child = this.state.nodeMap.get(childKey);
        if (child && child.type === 'text') {
          textContent += (child as any).text;
        }
      });

      const textNode = createTextNode(textContent, {});
      const cellNode = createTableCellNode([textNode.key], false);
      textNode.parent = cellNode.key;
      cellNode.parent = newRow.key;

      this.state.nodeMap.set(textNode.key, textNode);
      this.state.nodeMap.set(cellNode.key, cellNode);
      newRow.children.push(cellNode.key);
    });

    this.state.nodeMap.set(newRow.key, newRow);
    (table as any).children.splice(rowIndex + 1, 0, newRow.key);

    this.render();
  }

  private duplicateTableCol(tableKey: string, colIndex: number): void {
    const table = getNode(this.state, tableKey);
    if (!table || table.type !== 'table') return;

    this.history.push(this.state, this.selection);

    (table as any).children.forEach((rowKey: string) => {
      const row = this.state.nodeMap.get(rowKey);
      if (!row || row.type !== 'tablerow') return;

      const sourceCellKey = (row as any).children[colIndex];
      const sourceCell = this.state.nodeMap.get(sourceCellKey);
      if (!sourceCell || sourceCell.type !== 'tablecell') return;

      // Get text content from source cell
      let textContent = '';
      (sourceCell as any).children.forEach((childKey: string) => {
        const child = this.state.nodeMap.get(childKey);
        if (child && child.type === 'text') {
          textContent += (child as any).text;
        }
      });

      const textNode = createTextNode(textContent, {});
      const cellNode = createTableCellNode([textNode.key], false);
      textNode.parent = cellNode.key;
      cellNode.parent = rowKey;

      this.state.nodeMap.set(textNode.key, textNode);
      this.state.nodeMap.set(cellNode.key, cellNode);
      (row as any).children.splice(colIndex + 1, 0, cellNode.key);
    });

    this.render();
  }

  private isVoidNode(node: EditorNode): boolean {
    return node.type === 'divider' || node.type === 'image' || node.type === 'drawio';
  }

  private getTableContext(): { tableKey: string; rowIndex: number; colIndex: number } | null {
    if (!this.selection) return null;

    // Walk up from current selection to find table cell and table
    let current = getNode(this.state, this.selection.anchor.key);
    let cellKey: string | null = null;

    while (current && current.parent) {
      if (current.type === 'tablecell') {
        cellKey = current.key;
        break;
      }
      current = getNode(this.state, current.parent);
    }

    if (!cellKey) return null;

    const cell = getNode(this.state, cellKey);
    if (!cell || !cell.parent) return null;

    const row = getNode(this.state, cell.parent);
    if (!row || row.type !== 'tablerow' || !row.parent) return null;

    const table = getNode(this.state, row.parent);
    if (!table || table.type !== 'table') return null;

    const colIndex = (row as any).children.indexOf(cellKey);
    const rowIndex = (table as any).children.indexOf(row.key);

    return { tableKey: table.key, rowIndex, colIndex };
  }

  private tableNavNext(): void {
    const ctx = this.getTableContext();
    if (!ctx) return;

    const table = getNode(this.state, ctx.tableKey) as any;
    const rows = table.children;
    const currentRow = getNode(this.state, rows[ctx.rowIndex]) as any;
    const colCount = currentRow.children.length;

    let nextRowIndex = ctx.rowIndex;
    let nextColIndex = ctx.colIndex + 1;

    if (nextColIndex >= colCount) {
      nextColIndex = 0;
      nextRowIndex++;
    }

    if (nextRowIndex >= rows.length) {
      // At end of table, move to next block
      const block = getNode(this.state, table.parent);
      if (block && isElementNode(block)) {
        const tableIndex = block.children.indexOf(ctx.tableKey);
        if (tableIndex < block.children.length - 1) {
          const nextBlock = getNode(this.state, block.children[tableIndex + 1]);
          if (nextBlock) {
            const firstText = findFirstTextNode(this.state, nextBlock.key);
            if (firstText) {
              this.selection = createCollapsedSelection(firstText.key, 0);
              this.render();
            }
          }
        }
      }
      return;
    }

    // Move to next cell
    const nextRow = getNode(this.state, rows[nextRowIndex]) as any;
    const nextCell = getNode(this.state, nextRow.children[nextColIndex]) as any;
    const firstText = findFirstTextNode(this.state, nextCell.key);
    if (firstText) {
      this.selection = createCollapsedSelection(firstText.key, 0);
      this.render();
    }
  }

  private tableNavPrev(): void {
    const ctx = this.getTableContext();
    if (!ctx) return;

    const table = getNode(this.state, ctx.tableKey) as any;
    const rows = table.children;
    const currentRow = getNode(this.state, rows[ctx.rowIndex]) as any;
    const colCount = currentRow.children.length;

    let prevRowIndex = ctx.rowIndex;
    let prevColIndex = ctx.colIndex - 1;

    if (prevColIndex < 0) {
      prevColIndex = colCount - 1;
      prevRowIndex--;
    }

    if (prevRowIndex < 0) {
      // At start of table, stay in first cell
      return;
    }

    // Move to previous cell
    const prevRow = getNode(this.state, rows[prevRowIndex]) as any;
    const prevCell = getNode(this.state, prevRow.children[prevColIndex]) as any;
    const lastText = findLastTextNode(this.state, prevCell.key);
    if (lastText) {
      this.selection = createCollapsedSelection(lastText.key, lastText.text.length);
      this.render();
    }
  }

  private exitTable(tableKey: string, direction: 'before' | 'after'): void {
    const table = getNode(this.state, tableKey);
    if (!table || !table.parent) return;

    const parent = getNode(this.state, table.parent);
    if (!parent || !isElementNode(parent)) return;

    const tableIndex = parent.children.indexOf(tableKey);

    if (direction === 'after') {
      // Move to block after table
      if (tableIndex < parent.children.length - 1) {
        const nextBlock = getNode(this.state, parent.children[tableIndex + 1]);
        if (nextBlock) {
          const firstText = findFirstTextNode(this.state, nextBlock.key);
          if (firstText) {
            this.selection = createCollapsedSelection(firstText.key, 0);
            this.render();
            return;
          }
        }
      }
      // No block after, create one
      const newText = createTextNode('', {});
      const newParagraph = createParagraphNode([newText.key]);
      newText.parent = newParagraph.key;
      this.state.nodeMap.set(newText.key, newText);
      this.state = insertNode(this.state, table.parent, newParagraph, tableIndex + 1);

      // Log operation for delta sync
      if (this.opLogger) {
        const { parent: _parent, ...paragraphWithoutParent } = newParagraph;
        this.opLogger.logNodeInsert(newParagraph.key, table.parent, tableIndex + 1, paragraphWithoutParent);
        const { parent: _textParent, ...textWithoutParent } = newText;
        this.opLogger.logNodeInsert(newText.key, newParagraph.key, 0, textWithoutParent);
      }

      this.selection = createCollapsedSelection(newText.key, 0);
      this.render();
    } else {
      // Move to block before table
      if (tableIndex > 0) {
        const prevBlock = getNode(this.state, parent.children[tableIndex - 1]);
        if (prevBlock) {
          const lastText = findLastTextNode(this.state, prevBlock.key);
          if (lastText) {
            this.selection = createCollapsedSelection(lastText.key, lastText.text.length);
            this.render();
            return;
          }
        }
      }
      // No block before, create one
      const newText = createTextNode('', {});
      const newParagraph = createParagraphNode([newText.key]);
      newText.parent = newParagraph.key;
      this.state.nodeMap.set(newText.key, newText);
      this.state = insertNode(this.state, table.parent, newParagraph, tableIndex);

      // Log operation for delta sync
      if (this.opLogger) {
        const { parent: _parent, ...paragraphWithoutParent } = newParagraph;
        this.opLogger.logNodeInsert(newParagraph.key, table.parent, tableIndex, paragraphWithoutParent);
        const { parent: _textParent, ...textWithoutParent } = newText;
        this.opLogger.logNodeInsert(newText.key, newParagraph.key, 0, textWithoutParent);
      }

      this.selection = createCollapsedSelection(newText.key, 0);
      this.render();
    }
  }

  private getAdmonitionAncestor(): { key: string; type: string } | null {
    if (!this.selection) return null;

    let currentKey = this.selection.anchor.key;
    while (currentKey) {
      const node = getNode(this.state, currentKey);
      if (!node) break;
      if (node.type === 'admonition') {
        return { key: node.key, type: node.type };
      }
      if (!node.parent) break;
      currentKey = node.parent;
    }
    return null;
  }

  private getCodeBlockAncestor(): { key: string } | null {
    if (!this.selection) return null;

    let currentKey = this.selection.anchor.key;
    while (currentKey) {
      const node = getNode(this.state, currentKey);
      if (!node) break;
      if (node.type === 'code') {
        return { key: node.key };
      }
      if (!node.parent) break;
      currentKey = node.parent;
    }
    return null;
  }

  private exitCodeBlock(codeBlockKey: string): void {
    const codeBlock = getNode(this.state, codeBlockKey);
    if (!codeBlock || !codeBlock.parent) return;

    const parent = getNode(this.state, codeBlock.parent);
    if (!parent || !isElementNode(parent)) return;

    // Save to history
    this.history.push(this.state, this.selection);

    const codeBlockIndex = parent.children.indexOf(codeBlockKey);

    // Create a new paragraph after the code block
    const newText = createTextNode('', {});
    const newParagraph = createParagraphNode([newText.key]);
    newText.parent = newParagraph.key;
    this.state.nodeMap.set(newText.key, newText);
    this.state = insertNode(this.state, codeBlock.parent, newParagraph, codeBlockIndex + 1);

    // Log operation for delta sync
    if (this.opLogger) {
      const { parent: _p, ...paragraphWithoutParent } = newParagraph;
      this.opLogger.logNodeInsert(newParagraph.key, codeBlock.parent, codeBlockIndex + 1, paragraphWithoutParent);
      const { parent: _tp, ...textWithoutParent } = newText;
      this.opLogger.logNodeInsert(newText.key, newParagraph.key, 0, textWithoutParent);
    }

    // Move selection to the new paragraph
    this.selection = createCollapsedSelection(newText.key, 0);

    this.render();
  }

  private exitAdmonition(admonitionKey: string): void {
    const admonition = getNode(this.state, admonitionKey);
    if (!admonition || !admonition.parent) return;

    const parent = getNode(this.state, admonition.parent);
    if (!parent || !isElementNode(parent)) return;

    // Save to history
    this.history.push(this.state, this.selection);

    const admonitionIndex = parent.children.indexOf(admonitionKey);

    // Create a new paragraph after the admonition
    const newText = createTextNode('', {});
    const newParagraph = createParagraphNode([newText.key]);
    newText.parent = newParagraph.key;
    this.state.nodeMap.set(newText.key, newText);
    this.state = insertNode(this.state, admonition.parent, newParagraph, admonitionIndex + 1);

    // Log operation for delta sync
    if (this.opLogger) {
      const { parent: _parent, ...paragraphWithoutParent } = newParagraph;
      this.opLogger.logNodeInsert(newParagraph.key, admonition.parent, admonitionIndex + 1, paragraphWithoutParent);
      const { parent: _textParent, ...textWithoutParent } = newText;
      this.opLogger.logNodeInsert(newText.key, newParagraph.key, 0, textWithoutParent);
    }

    this.selection = createCollapsedSelection(newText.key, 0);
    this.render();
  }

  private insertHtml(html: string): void {
    if (!this.selection) return;

    const block = getBlockAncestor(this.state, this.selection.anchor.key);
    if (!block || !block.parent) return;

    // Save to history
    this.history.push(this.state, this.selection);

    const parent = getNode(this.state, block.parent);
    if (!parent || !isElementNode(parent)) return;

    let insertIndex = parent.children.indexOf(block.key) + 1;

    // Parse HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Process each top-level element
    const processElement = (element: Element): void => {
      const tagName = element.tagName.toLowerCase();

      // Handle headings
      if (/^h[1-5]$/.test(tagName)) {
        const level = parseInt(tagName[1]) as HeadingLevel;
        const { textNodes } = this.createTextNodesFromElement(element);
        if (textNodes.length > 0) {
          const heading = createHeadingNode(level, textNodes.map(t => t.key));
          textNodes.forEach(t => { t.parent = heading.key; this.state.nodeMap.set(t.key, t); });
          this.state = insertNode(this.state, block.parent!, heading, insertIndex++);
        }
      }
      // Handle paragraphs and divs
      else if (tagName === 'p' || tagName === 'div') {
        const { textNodes } = this.createTextNodesFromElement(element);
        if (textNodes.length > 0) {
          const para = createParagraphNode(textNodes.map(t => t.key));
          textNodes.forEach(t => { t.parent = para.key; this.state.nodeMap.set(t.key, t); });
          this.state = insertNode(this.state, block.parent!, para, insertIndex++);
        }
      }
      // Handle unordered lists
      else if (tagName === 'ul') {
        const listItems = Array.from(element.children).filter(c => c.tagName.toLowerCase() === 'li');
        if (listItems.length > 0) {
          const listNode = createListNode('bullet', []);
          this.state = insertNode(this.state, block.parent!, listNode, insertIndex++);

          listItems.forEach(li => {
            const { textNodes } = this.createTextNodesFromElement(li);
            if (textNodes.length > 0) {
              const listItem = createListItemNode(textNodes.map(t => t.key), 0);
              textNodes.forEach(t => { t.parent = listItem.key; this.state.nodeMap.set(t.key, t); });
              listItem.parent = listNode.key;
              this.state.nodeMap.set(listItem.key, listItem);
              (this.state.nodeMap.get(listNode.key) as ListNode).children.push(listItem.key);
            }
          });
        }
      }
      // Handle ordered lists
      else if (tagName === 'ol') {
        const listItems = Array.from(element.children).filter(c => c.tagName.toLowerCase() === 'li');
        if (listItems.length > 0) {
          const listNode = createListNode('number', []);
          this.state = insertNode(this.state, block.parent!, listNode, insertIndex++);

          listItems.forEach(li => {
            const { textNodes } = this.createTextNodesFromElement(li);
            if (textNodes.length > 0) {
              const listItem = createListItemNode(textNodes.map(t => t.key), 0);
              textNodes.forEach(t => { t.parent = listItem.key; this.state.nodeMap.set(t.key, t); });
              listItem.parent = listNode.key;
              this.state.nodeMap.set(listItem.key, listItem);
              (this.state.nodeMap.get(listNode.key) as ListNode).children.push(listItem.key);
            }
          });
        }
      }
      // Handle blockquotes
      else if (tagName === 'blockquote') {
        const { textNodes } = this.createTextNodesFromElement(element);
        if (textNodes.length > 0) {
          const quote = createQuoteNode(textNodes.map(t => t.key));
          textNodes.forEach(t => { t.parent = quote.key; this.state.nodeMap.set(t.key, t); });
          this.state = insertNode(this.state, block.parent!, quote, insertIndex++);
        }
      }
      // Handle pre/code blocks
      else if (tagName === 'pre') {
        const text = element.textContent || '';
        const textNode = createTextNode(text, {});
        const codeBlock = createCodeNode(undefined, [textNode.key]);
        textNode.parent = codeBlock.key;
        this.state.nodeMap.set(textNode.key, textNode);
        this.state = insertNode(this.state, block.parent!, codeBlock, insertIndex++);
      }
      // Handle plain text or other elements - create paragraph
      else if (element.textContent?.trim()) {
        const { textNodes } = this.createTextNodesFromElement(element);
        if (textNodes.length > 0) {
          const para = createParagraphNode(textNodes.map(t => t.key));
          textNodes.forEach(t => { t.parent = para.key; this.state.nodeMap.set(t.key, t); });
          this.state = insertNode(this.state, block.parent!, para, insertIndex++);
        }
      }
    };

    // Process body children
    Array.from(doc.body.children).forEach(processElement);

    // If nothing was inserted (plain text only), insert as paragraph
    if (insertIndex === parent.children.indexOf(block.key) + 1 && doc.body.textContent?.trim()) {
      const text = doc.body.textContent.trim();
      const textNode = createTextNode(text, {});
      const para = createParagraphNode([textNode.key]);
      textNode.parent = para.key;
      this.state.nodeMap.set(textNode.key, textNode);
      this.state = insertNode(this.state, block.parent!, para, insertIndex++);
    }

    // Create a new paragraph at the end for continued editing
    const newText = createTextNode('', {});
    const newParagraph = createParagraphNode([newText.key]);
    newText.parent = newParagraph.key;
    this.state.nodeMap.set(newText.key, newText);
    this.state = insertNode(this.state, block.parent!, newParagraph, insertIndex);

    // Move selection to the new paragraph
    this.selection = createCollapsedSelection(newText.key, 0);

    this.render();
  }

  private createTextNodesFromElement(element: Element): { textNodes: TextNode[] } {
    const textNodes: TextNode[] = [];

    const processNode = (node: Node, format: TextFormat): void => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || '';
        if (text) {
          const textNode = createTextNode(text, { ...format });
          textNodes.push(textNode);
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as Element;
        const tagName = el.tagName.toLowerCase();

        // Determine formatting from tag
        const newFormat = { ...format };
        if (tagName === 'strong' || tagName === 'b') newFormat.bold = true;
        if (tagName === 'em' || tagName === 'i') newFormat.italic = true;
        if (tagName === 'u') newFormat.underline = true;
        if (tagName === 's' || tagName === 'strike' || tagName === 'del') newFormat.strikethrough = true;
        if (tagName === 'code') newFormat.code = true;

        // Process children with accumulated format
        Array.from(el.childNodes).forEach(child => processNode(child, newFormat));
      }
    };

    processNode(element, {});

    // If no text nodes, create an empty one
    if (textNodes.length === 0) {
      const emptyNode = createTextNode('', {});
      textNodes.push(emptyNode);
    }

    return { textNodes };
  }

  private duplicateBlock(blockKey: string): void {
    const block = getNode(this.state, blockKey);
    if (!block || !block.parent) return;

    const parent = getNode(this.state, block.parent);
    if (!parent || !isElementNode(parent)) return;

    // Save to history
    this.history.push(this.state, this.selection);

    // Deep clone the block and all its children
    const cloneNodeDeep = (nodeKey: string, newParentKey: string): string | null => {
      const node = getNode(this.state, nodeKey);
      if (!node) return null;

      const newKey = `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      if (isTextNode(node)) {
        const newNode: TextNode = {
          key: newKey,
          type: 'text',
          parent: newParentKey,
          text: node.text,
          format: { ...node.format },
        };
        this.state = updateNode(this.state, newKey, newNode);
        return newKey;
      }

      if (isElementNode(node)) {
        // Create the node first without children
        const newNode = {
          ...node,
          key: newKey,
          parent: newParentKey,
          children: [] as string[],
        };
        this.state = updateNode(this.state, newKey, newNode);

        // Clone children
        const newChildren: string[] = [];
        for (const childKey of node.children) {
          const newChildKey = cloneNodeDeep(childKey, newKey);
          if (newChildKey) {
            newChildren.push(newChildKey);
          }
        }

        // Update with children
        const updatedNode = getNode(this.state, newKey);
        if (updatedNode && isElementNode(updatedNode)) {
          this.state = updateNode(this.state, newKey, {
            ...updatedNode,
            children: newChildren,
          });
        }

        return newKey;
      }

      return null;
    };

    const newBlockKey = cloneNodeDeep(blockKey, block.parent);
    if (!newBlockKey) return;

    // Insert the cloned block after the original
    const blockIndex = parent.children.indexOf(blockKey);
    const newChildren = [...parent.children];
    newChildren.splice(blockIndex + 1, 0, newBlockKey);

    this.state = updateNode(this.state, block.parent, {
      ...parent,
      children: newChildren,
    });

    // Log operation for delta sync
    if (this.opLogger) {
      const newBlock = getNode(this.state, newBlockKey);
      if (newBlock) {
        const { parent: _parent, ...blockWithoutParent } = newBlock;
        this.opLogger.logNodeInsert(newBlockKey, block.parent, blockIndex + 1, blockWithoutParent);
      }
    }

    // Set selection to the new block
    const firstText = findFirstTextNode(this.state, newBlockKey);
    if (firstText) {
      this.selection = createCollapsedSelection(firstText.key, 0);
    }

    this.render();
  }

  private deleteBlock(blockKey: string): void {
    const block = getNode(this.state, blockKey);
    if (!block || !block.parent) return;

    const parent = getNode(this.state, block.parent);
    if (!parent || !isElementNode(parent)) return;

    // Don't delete if it's the last block
    if (parent.children.length <= 1) return;

    // Save to history
    this.history.push(this.state, this.selection);

    const blockIndex = parent.children.indexOf(blockKey);

    // Log operation for delta sync
    if (this.opLogger) {
      this.opLogger.logNodeDelete(blockKey);
    }

    // Find the block to focus after deletion
    const nextBlockKey = blockIndex > 0
      ? parent.children[blockIndex - 1]
      : parent.children[blockIndex + 1];

    // Remove the block
    this.state = removeNode(this.state, blockKey);

    // Set selection to the next block
    if (nextBlockKey) {
      const firstText = findFirstTextNode(this.state, nextBlockKey);
      if (firstText) {
        this.selection = createCollapsedSelection(firstText.key, 0);
      }
    }

    // Ensure there's an editable block at the end if the last block is a decorator
    this.ensureTrailingParagraph();

    this.render();
  }

  // Ensure there's always an editable paragraph at the end of the document
  // if the last block is a decorator (image, drawio, table, divider)
  private ensureTrailingParagraph(): void {
    const root = getNode(this.state, this.state.root);
    if (!root || !isElementNode(root) || root.children.length === 0) return;

    const lastChildKey = root.children[root.children.length - 1];
    const lastChild = getNode(this.state, lastChildKey);
    if (!lastChild) return;

    // Check if the last block is a decorator (non-editable) node
    const decoratorTypes = ['image', 'drawio', 'divider', 'table'];
    if (decoratorTypes.includes(lastChild.type)) {
      // Add an empty paragraph at the end
      const textNode = createTextNode('');
      const paragraphNode = createParagraphNode([textNode.key]);

      // Insert nodes into state
      let newState = cloneState(this.state);
      newState.nodeMap.set(textNode.key, { ...textNode, parent: paragraphNode.key });
      newState.nodeMap.set(paragraphNode.key, { ...paragraphNode, parent: this.state.root });

      // Add to root's children
      const rootInNewState = newState.nodeMap.get(this.state.root) as any;
      rootInNewState.children = [...rootInNewState.children, paragraphNode.key];

      this.state = newState;

      // Log operations for delta sync
      if (this.opLogger) {
        this.opLogger.logNodeInsert(
          paragraphNode.key,
          this.state.root,
          root.children.length,
          paragraphNode
        );
        this.opLogger.logNodeInsert(
          textNode.key,
          paragraphNode.key,
          0,
          textNode
        );
      }

      // Set selection to the new paragraph
      this.selection = createCollapsedSelection(textNode.key, 0);
    }
  }

  private moveBlock(blockKey: string, targetKey: string, position: 'before' | 'after'): void {
    const block = getNode(this.state, blockKey);
    const target = getNode(this.state, targetKey);

    if (!block || !target || !block.parent || !target.parent) return;
    if (blockKey === targetKey) return;

    // Save to history
    this.history.push(this.state, this.selection);

    const sourceParent = getNode(this.state, block.parent);
    const targetParent = getNode(this.state, target.parent);

    if (!sourceParent || !targetParent || !isElementNode(sourceParent) || !isElementNode(targetParent)) return;

    // Clone state for immutable update
    const newState = cloneState(this.state);

    // Get parents from new state
    const sourceParentInNewState = newState.nodeMap.get(block.parent) as any;
    const targetParentInNewState = newState.nodeMap.get(target.parent) as any;

    // Get indices BEFORE any modification
    const sourceIndex = sourceParentInNewState.children.indexOf(blockKey);

    if (sourceIndex === -1) return;

    // Remove block from source
    sourceParentInNewState.children.splice(sourceIndex, 1);

    // Calculate target index in the modified array
    // After removal, if source was before target in the same parent, target's index shifted down by 1
    let targetIndex = targetParentInNewState.children.indexOf(targetKey);

    if (position === 'after') {
      targetIndex++;
    }

    // Insert block at new position
    targetParentInNewState.children.splice(targetIndex, 0, blockKey);

    // Update block's parent if moved to different parent
    if (block.parent !== target.parent) {
      const blockInNewState = newState.nodeMap.get(blockKey);
      if (blockInNewState) {
        blockInNewState.parent = target.parent;
      }
    }

    this.state = newState;

    // Log operation for delta sync
    if (this.opLogger) {
      this.opLogger.logNodeMove(blockKey, target.parent, targetIndex);
    }

    // Keep selection on the moved block
    const firstText = findFirstTextNode(this.state, blockKey);
    if (firstText) {
      this.selection = createCollapsedSelection(firstText.key, 0);
    }

    this.render();
  }

  private undo(): void {
    const entry = this.history.undo(this.state, this.selection);
    if (entry) {
      this.state = entry.state;
      // Validate selection - ensure it points to existing nodes
      this.selection = this.validateSelection(entry.selection);
      this.render();
    }
  }

  private redo(): void {
    const entry = this.history.redo(this.state, this.selection);
    if (entry) {
      this.state = entry.state;
      // Validate selection - ensure it points to existing nodes
      this.selection = this.validateSelection(entry.selection);
      this.render();
    }
  }

  private validateSelection(selection: EditorSelection | null): EditorSelection | null {
    if (!selection) {
      // No selection - create one at first text node
      const firstText = findFirstTextNode(this.state, this.state.root);
      if (firstText) {
        return createCollapsedSelection(firstText.key, 0);
      }
      return null;
    }

    // Check if anchor node exists
    const anchorNode = getNode(this.state, selection.anchor.key);
    const focusNode = getNode(this.state, selection.focus.key);

    if (!anchorNode || !focusNode) {
      // Selection points to non-existent nodes - find first text node
      const firstText = findFirstTextNode(this.state, this.state.root);
      if (firstText) {
        return createCollapsedSelection(firstText.key, 0);
      }
      return null;
    }

    // Validate offsets
    let anchorOffset = selection.anchor.offset;
    let focusOffset = selection.focus.offset;

    if (isTextNode(anchorNode)) {
      anchorOffset = Math.min(anchorOffset, anchorNode.text.length);
    }
    if (isTextNode(focusNode)) {
      focusOffset = Math.min(focusOffset, focusNode.text.length);
    }

    return {
      anchor: { key: selection.anchor.key, offset: anchorOffset },
      focus: { key: selection.focus.key, offset: focusOffset },
      isCollapsed: selection.anchor.key === selection.focus.key && anchorOffset === focusOffset,
      isBackward: selection.isBackward,
    };
  }

  private render(): void {
    if (!this.container) return;

    this.isRendering = true;
    try {
      // Update DOM
      this.reconciler.reconcile(this.state, this.container);

      // Restore selection
      if (this.selection) {
        setSelection(this.selection, this.state, this.container);
      }
    } finally {
      this.isRendering = false;
    }

    // Update focused block indicator
    this.updateFocusedBlock();

    // Notify listeners
    this.notifyListeners();

    // Notify onChange callback
    if (this.config.onChange) {
      this.config.onChange(serializeState(this.state));
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.state, this.selection));
  }
}
