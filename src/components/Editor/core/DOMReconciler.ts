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

    // Update list markers after reconciliation
    this.updateAllListMarkers(state, container);
  }

  // Update markers for all lists in the container
  private updateAllListMarkers(state: EditorState, container: HTMLElement): void {
    const lists = container.querySelectorAll('.editorOList, .editorUList');
    lists.forEach(list => {
      this.updateListMarkers(state, list as HTMLElement);
    });
  }

  // Update markers for a single list
  private updateListMarkers(state: EditorState, listElement: HTMLElement): void {
    const isNumbered = listElement.classList.contains('editorOList');
    const items = listElement.querySelectorAll(':scope > .editorListItem');

    console.log('[updateListMarkers] Found', items.length, 'items, isNumbered:', isNumbered);

    // Track counters per indent level
    const counters: number[] = [0, 0, 0, 0, 0]; // Support up to 5 indent levels

    items.forEach((item, idx) => {
      const indent = parseInt(item.getAttribute('data-indent') || '0', 10);

      // Increment counter for this indent level
      counters[indent]++;

      // Reset all deeper counters when we see a shallower indent
      for (let i = indent + 1; i < counters.length; i++) {
        counters[i] = 0;
      }

      // Generate marker text
      let marker: string;
      if (isNumbered) {
        marker = this.getNumberedMarker(counters[indent], indent);
      } else {
        marker = this.getBulletMarker(indent);
      }

      console.log('[updateListMarkers] Item', idx, 'indent:', indent, 'marker:', marker);

      // Find or create marker element - must be the FIRST child
      let markerEl = item.querySelector('.listMarker') as HTMLElement;
      if (!markerEl) {
        markerEl = document.createElement('span');
        markerEl.className = 'listMarker';
        markerEl.contentEditable = 'false';
      }
      // Always ensure marker is first child
      if (item.firstChild !== markerEl) {
        item.insertBefore(markerEl, item.firstChild);
      }
      markerEl.textContent = marker;

      // Apply indent via margin on the marker's negative margin
      // More indent = more negative margin to pull marker left further
      const baseMargin = 2; // base 2rem
      const indentOffset = indent * 1.5; // 1.5rem per indent level
      markerEl.style.marginLeft = `-${baseMargin + indentOffset}rem`;
      markerEl.style.width = `${baseMargin + indentOffset}rem`;

      // Also add padding to the list item for content indent
      (item as HTMLElement).style.paddingLeft = indent > 0 ? `${indent * 1.5}rem` : '';
    });
  }

  // Get numbered marker based on count and indent level
  private getNumberedMarker(count: number, indent: number): string {
    switch (indent % 3) {
      case 0:
        // 1. 2. 3.
        return `${count}. `;
      case 1:
        // a. b. c.
        return `${String.fromCharCode(96 + count)}. `;
      case 2:
        // i. ii. iii.
        return `${this.toRoman(count)}. `;
      default:
        return `${count}. `;
    }
  }

  // Get bullet marker based on indent level
  private getBulletMarker(indent: number): string {
    const bullets = ['•', '◦', '▪'];
    return bullets[indent % 3] + ' ';
  }

  // Convert number to lowercase roman numeral
  private toRoman(num: number): string {
    const romanNumerals: [number, string][] = [
      [10, 'x'], [9, 'ix'], [5, 'v'], [4, 'iv'], [1, 'i']
    ];
    let result = '';
    for (const [value, symbol] of romanNumerals) {
      while (num >= value) {
        result += symbol;
        num -= value;
      }
    }
    return result;
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

    // Replace trailing space with non-breaking space to prevent browser from collapsing it
    if (content.endsWith(' ')) {
      content = content.slice(0, -1) + ' ';
    }

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
        element.setAttribute('data-list-type', listNode.listType);
        break;

      case 'listitem':
        element = document.createElement('li');
        element.className = 'editorListItem';
        const listItemNode = node as ListItemNode;
        element.setAttribute('data-indent', String(listItemNode.indent || 0));
        if (listItemNode.indent > 0) {
          element.style.paddingLeft = `${listItemNode.indent * 24}px`;
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

    if (node.type === 'divider') {
      return this.createDividerElement(node);
    }

    const element = document.createElement('div');
    element.setAttribute(DATA_KEY_ATTR, node.key);
    element.setAttribute('contenteditable', 'false');
    return element;
  }

  private createDividerElement(node: EditorNode): HTMLElement {
    const hr = document.createElement('hr');
    hr.setAttribute(DATA_KEY_ATTR, node.key);
    hr.setAttribute('contenteditable', 'false');
    hr.className = 'editorDivider';
    return hr;
  }

  private createImageElement(node: ImageNode): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.setAttribute(DATA_KEY_ATTR, node.key);
    wrapper.setAttribute('contenteditable', 'false');
    wrapper.className = 'editorImageWrapper';

    const img = document.createElement('img');
    if (node.src) {
      img.src = node.src;
    }
    img.alt = node.alt || '';
    img.className = 'editorImage';
    if (node.width) img.width = node.width;
    if (node.height) img.height = node.height;

    // Show placeholder if no src yet (loading)
    if (!node.src) {
      img.style.minHeight = '100px';
      img.style.backgroundColor = '#f0f0f0';
    } else {
      // Set background for transparent PNGs based on current theme
      const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
      img.style.backgroundColor = isDarkMode ? '#1f2937' : 'transparent';
    }

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
    // Set initial height, will be resized by postMessage from iframe content
    iframe.style.height = '400px';

    // Listen for resize messages from the iframe
    const handleResize = (event: MessageEvent) => {
      if (event.data && event.data.type === 'drawio-resize' && event.source === iframe.contentWindow) {
        const newHeight = Math.max(event.data.height, 200);
        iframe.style.height = `${newHeight}px`;
      }
    };
    window.addEventListener('message', handleResize);

    // Use srcdoc with embedded viewer for large diagrams (URL length limits)
    if (node.diagramXML) {
      // Store XML in data attribute for change detection
      wrapper.setAttribute('data-diagram-xml', node.diagramXML);
      iframe.srcdoc = this.createDrawioSrcdoc(node.diagramXML);
    } else {
      // Show loading placeholder
      iframe.srcdoc = '<html><body style="display:flex;align-items:center;justify-content:center;height:100%;margin:0;background:#f0f0f0;color:#666;">Loading diagram...</body></html>';
    }

    // Add invisible overlay for mouse event handling (allows drag detection)
    const overlay = document.createElement('div');
    overlay.className = 'editorDrawioOverlay';

    // Double-click to interact with diagram
    overlay.addEventListener('dblclick', () => {
      wrapper.classList.add('interacting');
    });

    // Click outside to exit interaction mode
    const exitInteraction = (e: MouseEvent) => {
      if (!wrapper.contains(e.target as Node)) {
        wrapper.classList.remove('interacting');
        document.removeEventListener('click', exitInteraction);
      }
    };
    wrapper.addEventListener('click', () => {
      if (wrapper.classList.contains('interacting')) {
        setTimeout(() => document.addEventListener('click', exitInteraction), 0);
      }
    });

    wrapper.appendChild(iframe);
    wrapper.appendChild(overlay);
    return wrapper;
  }

  private createDrawioSrcdoc(diagramXML: string): string {
    // Base64 encode the XML to avoid any escaping issues
    const base64XML = btoa(unescape(encodeURIComponent(diagramXML)));

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { margin: 0; padding: 0; overflow: visible; background: #fff; }
    #diagram { width: 100%; min-height: 200px; }
    .loading { display: flex; align-items: center; justify-content: center; height: 200px; color: #666; }
    .error { color: #c00; padding: 20px; }
    .mxgraph { max-width: 100%; overflow: visible; }
  </style>
</head>
<body>
  <div id="diagram" class="loading">Rendering diagram...</div>
  <script src="https://viewer.diagrams.net/js/viewer-static.min.js"><\/script>
  <script>
    (function() {
      // Function to resize iframe to fit content
      function resizeIframe() {
        var height = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight, 400);
        // Send message to parent to resize iframe
        if (window.parent !== window) {
          window.parent.postMessage({ type: 'drawio-resize', height: height }, '*');
        }
      }

      try {
        var base64 = "${base64XML}";
        var xml = decodeURIComponent(escape(atob(base64)));

        var container = document.getElementById('diagram');
        container.innerHTML = '';
        container.className = '';

        var div = document.createElement('div');
        div.className = 'mxgraph';
        div.setAttribute('data-mxgraph', JSON.stringify({
          highlight: '#0000ff',
          nav: true,
          resize: true,
          toolbar: 'zoom layers lightbox',
          xml: xml
        }));
        container.appendChild(div);

        // Wait for viewer library to load, then initialize
        var initViewer = function() {
          if (typeof GraphViewer !== 'undefined') {
            try {
              GraphViewer.createViewerForElement(div);
              // Resize after rendering with delay to ensure content is rendered
              setTimeout(resizeIframe, 500);
              setTimeout(resizeIframe, 1000);
              setTimeout(resizeIframe, 2000);
            } catch (viewerError) {
              // Viewer error but diagram might still be partially rendered
              console.warn('GraphViewer warning:', viewerError.message);
              setTimeout(resizeIframe, 500);
            }
          } else {
            setTimeout(initViewer, 100);
          }
        };
        initViewer();
      } catch (e) {
        document.getElementById('diagram').innerHTML = '<div class="error">Error loading diagram: ' + e.message + '</div>';
        console.error('Drawio render error:', e);
      }
    })();
  <\/script>
</body>
</html>`;
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

            // Apply saved column width if available
            if (node.colWidths && node.colWidths[colIndex]) {
              td.style.width = `${node.colWidths[colIndex]}px`;
              td.style.minWidth = `${node.colWidths[colIndex]}px`;
            }

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

    // Handle image node updates (for lazy-loaded assets)
    if (node.type === 'image') {
      const imageNode = node as ImageNode;
      const img = element.querySelector('img');
      if (img && imageNode.src && img.src !== imageNode.src) {
        img.src = imageNode.src;
      }
      return;
    }

    // Handle drawio node updates (for lazy-loaded assets)
    if (node.type === 'drawio') {
      const drawioNode = node as DrawioNode;
      const iframe = element.querySelector('iframe') as HTMLIFrameElement;
      if (iframe && drawioNode.diagramXML) {
        // Only update if XML changed - check stored XML in data attribute
        const currentXML = element.getAttribute('data-diagram-xml');
        if (currentXML !== drawioNode.diagramXML) {
          element.setAttribute('data-diagram-xml', drawioNode.diagramXML);
          iframe.srcdoc = this.createDrawioSrcdoc(drawioNode.diagramXML);
        }
      }
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
      element.setAttribute('data-indent', String(listItemNode.indent || 0));
      // Padding will be set by updateListMarkers after reconciliation
    }
  }
}
