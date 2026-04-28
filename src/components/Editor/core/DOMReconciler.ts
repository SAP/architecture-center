import {
  EditorState,
  EditorNode,
  TextNode,
  HeadingNode,
  ListNode,
  ListItemNode,
  CodeNode,
  LinkNode,
  ImageNode,
  DrawioNode,
  TableNode,
  TableRowNode,
  TableCellNode,
  AdmonitionNode,
  RootNode,
  isElementNode,
  isTextNode,
  isDecoratorNode,
} from './types';
import { getNode } from './EditorState';

const DATA_KEY_ATTR = 'data-editor-key';
const ZERO_WIDTH_SPACE = '​';

export interface ReconcilerConfig {
  onImageClick?: (node: ImageNode) => void;
}

export class DOMReconciler {
  private config: ReconcilerConfig;

  constructor(config: ReconcilerConfig = {}) {
    this.config = config;
  }

  // Check if a block node is empty (has no text content)
  private isBlockEmpty(state: EditorState, node: EditorNode): boolean {
    if (!isElementNode(node)) return false;

    if (node.children.length === 0) return true;

    // Check if all children are empty text nodes
    for (const childKey of node.children) {
      const child = getNode(state, childKey);
      if (!child) continue;

      if (isTextNode(child)) {
        if (child.text && child.text.length > 0) return false;
      } else if (isElementNode(child)) {
        if (!this.isBlockEmpty(state, child)) return false;
      }
    }

    return true;
  }

  // Main reconcile function - updates DOM to match state
  reconcile(state: EditorState, container: HTMLElement): void {
    const root = getNode(state, state.root) as RootNode;
    if (!root) return;

    // Clear container and rebuild (simple approach for now)
    // A more optimized version would diff and patch
    this.reconcileChildren(state, root.children, container);
  }

  private reconcileChildren(
    state: EditorState,
    childKeys: string[],
    container: HTMLElement
  ): void {
    // Get existing DOM children with keys
    const existingElements = new Map<string, HTMLElement>();
    Array.from(container.children).forEach(child => {
      if (child instanceof HTMLElement) {
        const key = child.getAttribute(DATA_KEY_ATTR);
        if (key) existingElements.set(key, child);
      }
    });

    // Track which keys we've processed
    const processedKeys = new Set<string>();

    // Process each child in order
    childKeys.forEach((key, index) => {
      processedKeys.add(key);
      const node = getNode(state, key);
      if (!node) return;

      let element = existingElements.get(key);

      // For tables, always recreate to handle structural changes properly
      if (node.type === 'table' && element) {
        element.remove();
        element = undefined;
        existingElements.delete(key);
      }

      if (element) {
        // Update existing element
        this.updateElement(state, node, element);
      } else {
        // Create new element
        element = this.createElement(state, node) ?? undefined;
        if (element) {
          // Insert at correct position
          const referenceNode = container.children[index] ?? null;
          container.insertBefore(element, referenceNode);
        }
      }
    });

    // Remove elements that are no longer in state
    existingElements.forEach((element, key) => {
      if (!processedKeys.has(key)) {
        element.remove();
      }
    });

    // Ensure correct order
    childKeys.forEach((key, index) => {
      const element = container.querySelector(`[${DATA_KEY_ATTR}="${key}"]`);
      if (element && container.children[index] !== element) {
        const referenceNode = container.children[index] || null;
        container.insertBefore(element, referenceNode);
      }
    });
  }

  private createElement(state: EditorState, node: EditorNode): HTMLElement | null {
    if (isTextNode(node)) {
      return this.createTextElement(node);
    }

    if (isDecoratorNode(node)) {
      return this.createDecoratorElement(node);
    }

    if (isElementNode(node)) {
      return this.createElementNode(state, node);
    }

    return null;
  }

  private createTextElement(node: TextNode): HTMLElement {
    const span = document.createElement('span');
    span.setAttribute(DATA_KEY_ATTR, node.key);
    this.updateTextContent(span, node);
    return span;
  }

  private updateTextContent(element: HTMLElement, node: TextNode): void {
    // Build formatted content
    let content = node.text || ZERO_WIDTH_SPACE;

    // Clear existing content
    element.textContent = '';

    // Apply formatting by wrapping in elements
    let currentElement: HTMLElement = element;

    if (node.format.bold) {
      const strong = document.createElement('strong');
      currentElement.appendChild(strong);
      currentElement = strong;
    }

    if (node.format.italic) {
      const em = document.createElement('em');
      currentElement.appendChild(em);
      currentElement = em;
    }

    if (node.format.underline) {
      const u = document.createElement('u');
      currentElement.appendChild(u);
      currentElement = u;
    }

    if (node.format.strikethrough) {
      const s = document.createElement('s');
      currentElement.appendChild(s);
      currentElement = s;
    }

    if (node.format.code) {
      const code = document.createElement('code');
      currentElement.appendChild(code);
      currentElement = code;
    }

    currentElement.textContent = content;
  }

  private createElementNode(state: EditorState, node: EditorNode): HTMLElement {
    let element: HTMLElement;

    switch (node.type) {
      case 'paragraph':
        element = document.createElement('p');
        element.className = 'editorParagraph';
        // Check if paragraph is empty (only has empty text node)
        if (this.isBlockEmpty(state, node)) {
          element.classList.add('editorEmptyBlock');
        }
        break;

      case 'heading':
        const headingNode = node as HeadingNode;
        element = document.createElement(`h${headingNode.level}`);
        element.className = `editorH${headingNode.level}`;
        break;

      case 'list':
        const listNode = node as ListNode;
        element = document.createElement(listNode.listType === 'number' ? 'ol' : 'ul');
        element.className = listNode.listType === 'number' ? 'editorOList' : 'editorUList';
        break;

      case 'listitem':
        element = document.createElement('li');
        element.className = 'editorListItem';
        const listItemNode = node as ListItemNode;
        if (listItemNode.indent > 0) {
          element.style.marginLeft = `${listItemNode.indent * 24}px`;
        }
        break;

      case 'quote':
        element = document.createElement('blockquote');
        element.className = 'editorQuote';
        break;

      case 'code':
        element = document.createElement('pre');
        element.className = 'editorCode';
        const codeInner = document.createElement('code');
        const codeNode = node as CodeNode;
        if (codeNode.language) {
          codeInner.className = `language-${codeNode.language}`;
        }
        element.appendChild(codeInner);
        break;

      case 'link':
        element = document.createElement('a');
        element.className = 'editorLink';
        const linkNode = node as LinkNode;
        element.setAttribute('href', linkNode.url);
        element.setAttribute('target', '_blank');
        element.setAttribute('rel', 'noopener noreferrer');
        break;

      case 'table':
        element = this.createTableElement(state, node as TableNode);
        return element; // Return early as table handles its own children

      case 'tablerow':
        element = document.createElement('tr');
        element.className = 'editorTableRow';
        break;

      case 'tablecell':
        const cellNode = node as TableCellNode;
        element = document.createElement(cellNode.isHeader ? 'th' : 'td');
        element.className = 'editorTableCell';
        if (cellNode.colSpan && cellNode.colSpan > 1) {
          element.setAttribute('colspan', String(cellNode.colSpan));
        }
        if (cellNode.rowSpan && cellNode.rowSpan > 1) {
          element.setAttribute('rowspan', String(cellNode.rowSpan));
        }
        break;

      case 'admonition':
        element = document.createElement('div');
        const admonitionNode = node as AdmonitionNode;
        element.className = `editorAdmonition editorAdmonition--${admonitionNode.admonitionType}`;
        element.setAttribute('data-admonition-type', admonitionNode.admonitionType);

        // Add admonition title FIRST (above content)
        const titleEl = document.createElement('div');
        titleEl.className = 'editorAdmonitionTitle';
        titleEl.setAttribute('contenteditable', 'false');
        titleEl.textContent = admonitionNode.admonitionType.charAt(0).toUpperCase() + admonitionNode.admonitionType.slice(1);
        element.appendChild(titleEl);

        // Add content wrapper AFTER title
        const contentEl = document.createElement('div');
        contentEl.className = 'editorAdmonitionContent';

        // Recursively create children into content wrapper
        admonitionNode.children.forEach(childKey => {
          const childNode = getNode(state, childKey);
          if (childNode) {
            const childElement = this.createElement(state, childNode);
            if (childElement) {
              contentEl.appendChild(childElement);
            }
          }
        });

        element.appendChild(contentEl);

        // Set DATA_KEY_ATTR
        element.setAttribute(DATA_KEY_ATTR, node.key);
        return element;

      default:
        element = document.createElement('div');
    }

    element.setAttribute(DATA_KEY_ATTR, node.key);

    // Recursively create children
    if (isElementNode(node)) {
      const childContainer = node.type === 'code'
        ? element.querySelector('code') || element
        : element;

      node.children.forEach(childKey => {
        const childNode = getNode(state, childKey);
        if (childNode) {
          const childElement = this.createElement(state, childNode);
          if (childElement) {
            childContainer.appendChild(childElement);
          }
        }
      });
    }

    return element;
  }

  private createDecoratorElement(node: EditorNode): HTMLElement {
    if (node.type === 'image') {
      return this.createImageElement(node as ImageNode);
    }

    if (node.type === 'drawio') {
      return this.createDrawioElement(node as DrawioNode);
    }

    const element = document.createElement('div');
    element.setAttribute(DATA_KEY_ATTR, node.key);
    element.setAttribute('contenteditable', 'false');
    return element;
  }

  private createImageElement(node: ImageNode): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.setAttribute(DATA_KEY_ATTR, node.key);
    wrapper.setAttribute('contenteditable', 'false');
    wrapper.className = 'editorImageWrapper';

    const img = document.createElement('img');
    img.src = node.src;
    img.alt = node.alt;
    img.className = 'editorImage';
    if (node.width) img.width = node.width;
    if (node.height) img.height = node.height;

    if (this.config.onImageClick) {
      wrapper.style.cursor = 'pointer';
      wrapper.onclick = () => this.config.onImageClick?.(node);
    }

    wrapper.appendChild(img);
    return wrapper;
  }

  private createDrawioElement(node: DrawioNode): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.setAttribute(DATA_KEY_ATTR, node.key);
    wrapper.setAttribute('contenteditable', 'false');
    wrapper.className = 'editorDrawioWrapper';

    const iframe = document.createElement('iframe');
    iframe.className = 'editorDrawioIframe';
    iframe.frameBorder = '0';
    iframe.width = '100%';
    iframe.height = '400';

    // Encode the XML and create the viewer URL
    const encodedXML = encodeURIComponent(node.diagramXML);
    iframe.src = `https://viewer.diagrams.net/?lightbox=1&nav=1&edit=_blank#R${encodedXML}`;

    wrapper.appendChild(iframe);
    return wrapper;
  }

  private createTableElement(state: EditorState, node: TableNode): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.setAttribute(DATA_KEY_ATTR, node.key);
    wrapper.className = 'editorTableWrapper';

    // Create the actual table
    const table = document.createElement('table');
    table.className = 'editorTable';

    const tbody = document.createElement('tbody');

    // Create rows and cells
    node.children.forEach((rowKey, _rowIndex) => {
      const rowNode = getNode(state, rowKey);
      if (rowNode && rowNode.type === 'tablerow') {
        const tr = document.createElement('tr');
        tr.setAttribute(DATA_KEY_ATTR, rowKey);
        tr.className = 'editorTableRow';

        (rowNode as TableRowNode).children.forEach((cellKey, colIndex) => {
          const cellNode = getNode(state, cellKey);
          if (cellNode && cellNode.type === 'tablecell') {
            const cell = cellNode as TableCellNode;
            const td = document.createElement(cell.isHeader ? 'th' : 'td');
            td.setAttribute(DATA_KEY_ATTR, cellKey);
            td.className = 'editorTableCell';

            if (cell.colSpan && cell.colSpan > 1) {
              td.setAttribute('colspan', String(cell.colSpan));
            }
            if (cell.rowSpan && cell.rowSpan > 1) {
              td.setAttribute('rowspan', String(cell.rowSpan));
            }

            // Create cell content
            cell.children.forEach(childKey => {
              const childNode = getNode(state, childKey);
              if (childNode) {
                const childElement = this.createElement(state, childNode);
                if (childElement) {
                  td.appendChild(childElement);
                }
              }
            });

            // Add resize handle to each cell (including last column)
            const resizeHandle = document.createElement('div');
            resizeHandle.className = 'editorTableResizeHandle';
            resizeHandle.setAttribute('contenteditable', 'false');
            resizeHandle.setAttribute('data-col-index', String(colIndex));
            td.appendChild(resizeHandle);

            tr.appendChild(td);
          }
        });

        tbody.appendChild(tr);
      }
    });

    table.appendChild(tbody);

    // Add row button
    const addRowBtn = document.createElement('button');
    addRowBtn.className = 'editorTableAddRow';
    addRowBtn.innerHTML = '+';
    addRowBtn.setAttribute('contenteditable', 'false');
    addRowBtn.setAttribute('data-table-key', node.key);
    addRowBtn.setAttribute('data-action', 'add-row');

    // Add column button
    const addColBtn = document.createElement('button');
    addColBtn.className = 'editorTableAddCol';
    addColBtn.innerHTML = '+';
    addColBtn.setAttribute('contenteditable', 'false');
    addColBtn.setAttribute('data-table-key', node.key);
    addColBtn.setAttribute('data-action', 'add-col');

    wrapper.appendChild(table);
    wrapper.appendChild(addRowBtn);
    wrapper.appendChild(addColBtn);

    return wrapper;
  }

  private updateElement(state: EditorState, node: EditorNode, element: HTMLElement): void {
    if (isTextNode(node)) {
      this.updateTextContent(element, node);
      return;
    }

    if (isElementNode(node)) {
      // Update children - use appropriate container
      let childContainer: HTMLElement = element;

      if (node.type === 'code') {
        childContainer = element.querySelector('code') as HTMLElement || element;
      } else if (node.type === 'admonition') {
        childContainer = element.querySelector('.editorAdmonitionContent') as HTMLElement || element;
      }

      this.reconcileChildren(state, node.children, childContainer);
    }

    // Update empty block class for paragraphs
    if (node.type === 'paragraph') {
      if (this.isBlockEmpty(state, node)) {
        element.classList.add('editorEmptyBlock');
      } else {
        element.classList.remove('editorEmptyBlock');
      }
    }

    // Update specific attributes based on node type
    if (node.type === 'heading') {
      const headingNode = node as HeadingNode;
      element.className = `editorH${headingNode.level}`;
    }

    if (node.type === 'link') {
      const linkNode = node as LinkNode;
      element.setAttribute('href', linkNode.url);
    }

    if (node.type === 'listitem') {
      const listItemNode = node as ListItemNode;
      element.style.marginLeft = listItemNode.indent > 0 ? `${listItemNode.indent * 24}px` : '';
    }
  }
}
