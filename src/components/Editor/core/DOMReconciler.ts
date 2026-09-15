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
  onCodeLanguageChange?: (nodeKey: string, language: string) => void;
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
  private updateListMarkers(_state: EditorState, listElement: HTMLElement): void {
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
        element = this.createCodeBlockElement(state, node as CodeNode);
        return element; // Return early as code block handles its own structure

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
      node.children.forEach(childKey => {
        const childNode = getNode(state, childKey);
        if (childNode) {
          const childElement = this.createElement(state, childNode);
          if (childElement) {
            element.appendChild(childElement);
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

    // Show loading placeholder if no src yet
    if (!node.src) {
      const mode = node.assetId ? 'loading' : 'saving';
      const label = mode === 'saving' ? 'Saving image' : 'Loading image';
      const placeholder = document.createElement('div');
      placeholder.className = 'editorMediaPlaceholder';
      placeholder.setAttribute('data-loading-type', 'image');
      placeholder.setAttribute('data-loading-mode', mode);
      placeholder.setAttribute('data-loading-label', label);
      wrapper.appendChild(placeholder);
      return wrapper;
    }

    const img = document.createElement('img');
    img.src = node.src;
    img.alt = node.alt || '';
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

  private setupDrawioResizeListener(): void {
    // Single global listener for all drawio resize messages
    if ((window as any).__drawioResizeListenerSetup) return;
    (window as any).__drawioResizeListenerSetup = true;

    window.addEventListener('message', (event: MessageEvent) => {
      if (event.data && event.data.type === 'drawio-resize') {
        // Find the iframe that sent this message
        const iframes = document.querySelectorAll('.editorDrawioIframe') as NodeListOf<HTMLIFrameElement>;
        for (const iframe of iframes) {
          if (iframe.contentWindow === event.source) {
            const newHeight = Math.max(event.data.height, 200);
            iframe.style.height = `${newHeight}px`;
            console.log('[Drawio] Resized iframe to', newHeight);
            break;
          }
        }
      }
    });
  }

  private createDrawioElement(node: DrawioNode): HTMLElement {
    // Ensure global resize listener is set up
    this.setupDrawioResizeListener();

    const wrapper = document.createElement('div');
    wrapper.setAttribute(DATA_KEY_ATTR, node.key);
    wrapper.setAttribute('contenteditable', 'false');
    wrapper.className = 'editorDrawioWrapper';

    const iframe = document.createElement('iframe');
    iframe.className = 'editorDrawioIframe';
    iframe.frameBorder = '0';
    iframe.width = '100%';
    iframe.style.height = '400px';

    // Use srcdoc with embedded viewer for large diagrams (URL length limits)
    if (node.diagramXML) {
      // Store XML in data attribute for change detection
      wrapper.setAttribute('data-diagram-xml', node.diagramXML);
      iframe.srcdoc = this.createDrawioSrcdoc(node.diagramXML);
    } else {
      // Show loading placeholder - add loading class to remove border
      wrapper.classList.add('editorDrawioLoading');
      const mode = node.assetId ? 'loading' : 'saving';
      const label = mode === 'saving' ? 'Saving diagram' : 'Loading diagram';
      const placeholder = document.createElement('div');
      placeholder.className = 'editorMediaPlaceholder';
      placeholder.setAttribute('data-loading-type', 'diagram');
      placeholder.setAttribute('data-loading-mode', mode);
      placeholder.setAttribute('data-loading-label', label);
      wrapper.appendChild(placeholder);
      // Don't add iframe when showing placeholder
      // Add invisible overlay for mouse event handling (allows drag detection)
      const overlay = document.createElement('div');
      overlay.className = 'editorDrawioOverlay';
      wrapper.appendChild(overlay);
      return wrapper;
    }

    // Add toolbar with zoom and edit buttons
    this.addDrawioToolbar(wrapper, node.key, iframe);

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

  private addDrawioToolbar(wrapper: HTMLElement, nodeKey: string, iframe: HTMLIFrameElement | null): void {
    // Don't add if already exists
    if (wrapper.querySelector('.editorDrawioToolbar')) return;

    const toolbar = document.createElement('div');
    toolbar.className = 'editorDrawioToolbar';

    // Zoom in button
    const zoomInBtn = document.createElement('button');
    zoomInBtn.className = 'editorDrawioBtn';
    zoomInBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>';
    zoomInBtn.title = 'Zoom In';
    zoomInBtn.onclick = (e) => {
      e.stopPropagation();
      const iframeEl = iframe || wrapper.querySelector('iframe');
      iframeEl?.contentWindow?.postMessage({ type: 'zoom', direction: 'in' }, '*');
    };

    // Zoom out button
    const zoomOutBtn = document.createElement('button');
    zoomOutBtn.className = 'editorDrawioBtn';
    zoomOutBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>';
    zoomOutBtn.title = 'Zoom Out';
    zoomOutBtn.onclick = (e) => {
      e.stopPropagation();
      const iframeEl = iframe || wrapper.querySelector('iframe');
      iframeEl?.contentWindow?.postMessage({ type: 'zoom', direction: 'out' }, '*');
    };

    // Fit to screen button
    const fitBtn = document.createElement('button');
    fitBtn.className = 'editorDrawioBtn';
    fitBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>';
    fitBtn.title = 'Fit to Screen';
    fitBtn.onclick = (e) => {
      e.stopPropagation();
      const iframeEl = iframe || wrapper.querySelector('iframe');
      iframeEl?.contentWindow?.postMessage({ type: 'zoom', direction: 'fit' }, '*');
    };

    // Edit button - opens draw.io editor
    const editBtn = document.createElement('button');
    editBtn.className = 'editorDrawioBtn editorDrawioEditBtn';
    editBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>';
    editBtn.title = 'Edit Diagram';
    editBtn.setAttribute('data-node-key', nodeKey);

    toolbar.appendChild(zoomInBtn);
    toolbar.appendChild(zoomOutBtn);
    toolbar.appendChild(fitBtn);
    toolbar.appendChild(editBtn);

    // Insert toolbar as first child
    wrapper.insertBefore(toolbar, wrapper.firstChild);
  }

  private createDrawioSrcdoc(diagramXML: string): string {
    // Base64 encode the XML to avoid any escaping issues
    const base64XML = btoa(unescape(encodeURIComponent(diagramXML)));

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; background: #fafafa; overflow: hidden; }
    #diagram { width: 100%; padding: 10px; }
    .loading { display: flex; align-items: center; justify-content: center; height: 200px; color: #666; }
    .error { color: #c00; padding: 20px; }
    .geDiagramContainer { overflow: visible !important; }
    .geDiagramContainer svg { display: block; width: 100%; height: auto; }
  </style>
</head>
<body>
  <div id="diagram" class="loading">Rendering diagram...</div>
  <script src="https://viewer.diagrams.net/js/viewer-static.min.js"><\/script>
  <script>
    (function() {
      var resizeSent = false;

      function resizeIframe() {
        // Try multiple selectors for the SVG
        var svg = document.querySelector('.geDiagramContainer svg') ||
                  document.querySelector('.mxgraph svg') ||
                  document.querySelector('#diagram svg') ||
                  document.querySelector('svg');
        var container = document.querySelector('.geDiagramContainer') || document.querySelector('.mxgraph');
        var height = 400;

        if (svg) {
          // Use getBoundingClientRect for actual rendered size
          var rect = svg.getBoundingClientRect();
          height = rect.height;

          // If that's too small, try the svg height attribute
          if (height < 100) {
            var svgHeightAttr = svg.getAttribute('height');
            if (svgHeightAttr) {
              height = parseFloat(svgHeightAttr);
            }
          }

          height = Math.max(height, 200);
          resizeSent = true;
        } else if (container) {
          height = Math.max(container.scrollHeight, container.offsetHeight, 200);
        }

        console.log('[Drawio iframe] Sending resize:', height, 'svg found:', !!svg);

        if (window.parent !== window) {
          window.parent.postMessage({ type: 'drawio-resize', height: Math.ceil(height) + 50 }, '*');
        }
      }

      // Watch for SVG to be added to DOM
      function watchForSVG() {
        var observer = new MutationObserver(function(mutations) {
          // Try multiple selectors
          var svg = document.querySelector('.geDiagramContainer svg') ||
                    document.querySelector('.mxgraph svg') ||
                    document.querySelector('#diagram svg') ||
                    document.querySelector('svg');
          if (svg) {
            console.log('[Drawio iframe] SVG found via MutationObserver, selector:', svg.parentElement?.className);
            observer.disconnect();
            // Give it a moment to fully render
            setTimeout(resizeIframe, 100);
            setTimeout(resizeIframe, 500);
            setTimeout(resizeIframe, 1000);
          }
        });
        observer.observe(document.body, { childList: true, subtree: true });

        // Fallback timeout in case observer misses it
        setTimeout(function() {
          if (!resizeSent) {
            console.log('[Drawio iframe] Fallback timeout, checking DOM:', document.body.innerHTML.substring(0, 500));
            observer.disconnect();
            resizeIframe();
          }
        }, 5000);
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
          xml: xml,
          lightbox: false,
          nav: false,
          resize: true,
          toolbar: '',
          border: 0
        }));
        container.appendChild(div);

        var currentScale = 1;

        // Start watching for SVG before creating viewer
        watchForSVG();

        var initViewer = function() {
          if (typeof GraphViewer !== 'undefined') {
            try {
              GraphViewer.createViewerForElement(div);
            } catch (viewerError) {
              console.error('GraphViewer error:', viewerError);
            }
          } else {
            setTimeout(initViewer, 100);
          }
        };
        initViewer();

        window.addEventListener('message', function(event) {
          if (event.data && event.data.type === 'zoom') {
            var svg = document.querySelector('.geDiagramContainer svg') ||
                      document.querySelector('.mxgraph svg') ||
                      document.querySelector('svg');
            if (svg) {
              if (event.data.direction === 'in') {
                currentScale = Math.min(currentScale * 1.25, 3);
              } else if (event.data.direction === 'out') {
                currentScale = Math.max(currentScale / 1.25, 0.25);
              } else if (event.data.direction === 'fit') {
                currentScale = 1;
              }
              svg.style.transform = 'scale(' + currentScale + ')';
              svg.style.transformOrigin = 'top left';
              setTimeout(resizeIframe, 100);
            }
          }
        });
      } catch (e) {
        document.getElementById('diagram').innerHTML = '<div class="error">Error: ' + e.message + '</div>';
        console.error('Drawio render error:', e);
      }
    })();
  <\/script>
</body>
</html>`;
  }

  private createLoadingPlaceholder(type: 'diagram' | 'image', mode: 'saving' | 'loading' = 'saving'): string {
    const action = mode === 'saving' ? 'Saving' : 'Loading';
    const label = type === 'diagram' ? `${action} diagram` : `${action} image`;
    // SAP UI5 BusyIndicator style - 5 animated dots
    return `<!DOCTYPE html>
<html style="height: 100%;">
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body {
      height: 100%;
      width: 100%;
    }
    body {
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0;
      background: transparent;
      font-family: '72', '72full', Arial, Helvetica, sans-serif;
    }
    .busy-indicator {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }
    .busy-indicator-dots {
      display: flex;
      gap: 6px;
    }
    .busy-indicator-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background-color: #0a6ed1;
      animation: ui5-busy-indicator 1.4s infinite ease-in-out both;
    }
    .busy-indicator-dot:nth-child(1) { animation-delay: -0.32s; }
    .busy-indicator-dot:nth-child(2) { animation-delay: -0.16s; }
    .busy-indicator-dot:nth-child(3) { animation-delay: 0s; }
    .busy-indicator-dot:nth-child(4) { animation-delay: 0.16s; }
    .busy-indicator-dot:nth-child(5) { animation-delay: 0.32s; }
    @keyframes ui5-busy-indicator {
      0%, 80%, 100% {
        transform: scale(0.4);
        opacity: 0.3;
      }
      40% {
        transform: scale(1);
        opacity: 1;
      }
    }
    .busy-indicator-text {
      color: #32363a;
      font-size: 14px;
    }
    @media (prefers-color-scheme: dark) {
      .busy-indicator-dot {
        background-color: #91c8f6;
      }
      .busy-indicator-text {
        color: #d1d5db;
      }
    }
  </style>
</head>
<body>
  <div class="busy-indicator">
    <div class="busy-indicator-dots">
      <div class="busy-indicator-dot"></div>
      <div class="busy-indicator-dot"></div>
      <div class="busy-indicator-dot"></div>
      <div class="busy-indicator-dot"></div>
      <div class="busy-indicator-dot"></div>
    </div>
    <div class="busy-indicator-text">${label}...</div>
  </div>
</body>
</html>`;
  }

  private createCodeBlockElement(state: EditorState, node: CodeNode): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.setAttribute(DATA_KEY_ATTR, node.key);
    wrapper.className = 'editorCodeWrapper';

    // Create floating toolbar in top right
    const toolbar = document.createElement('div');
    toolbar.className = 'editorCodeToolbar';
    toolbar.setAttribute('contenteditable', 'false');

    // Language dropdown
    const select = document.createElement('select');
    select.className = 'editorCodeLanguageSelect';

    const languages = [
      { value: '', label: 'Plain text' },
      { value: 'javascript', label: 'JavaScript' },
      { value: 'typescript', label: 'TypeScript' },
      { value: 'python', label: 'Python' },
      { value: 'java', label: 'Java' },
    ];

    languages.forEach(lang => {
      const option = document.createElement('option');
      option.value = lang.value;
      option.textContent = lang.label;
      if ((node.language || '') === lang.value) {
        option.selected = true;
      }
      select.appendChild(option);
    });

    select.onchange = (e) => {
      e.stopPropagation();
      const newLang = (e.target as HTMLSelectElement).value;
      if (this.config.onCodeLanguageChange) {
        this.config.onCodeLanguageChange(node.key, newLang);
      }
    };

    // Prevent selection changes when interacting with dropdown
    select.onmousedown = (e) => e.stopPropagation();
    select.onclick = (e) => e.stopPropagation();

    toolbar.appendChild(select);
    wrapper.appendChild(toolbar);

    // Create the pre/code elements for the actual code content
    const pre = document.createElement('pre');
    pre.className = 'editorCodeContent';

    const code = document.createElement('code');
    if (node.language) {
      code.className = `language-${node.language}`;
    }
    pre.appendChild(code);

    // Render children (text nodes) into the code element
    node.children.forEach(childKey => {
      const childNode = getNode(state, childKey);
      if (childNode) {
        const childElement = this.createElement(state, childNode);
        if (childElement) {
          code.appendChild(childElement);
        }
      }
    });

    wrapper.appendChild(pre);
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

    // Inner container for table + buttons (for proper positioning)
    const tableContainer = document.createElement('div');
    tableContainer.className = 'editorTableContainer';
    tableContainer.appendChild(table);
    tableContainer.appendChild(addRowBtn);
    tableContainer.appendChild(addColBtn);

    wrapper.appendChild(tableContainer);

    // Position buttons and check overflow
    const updateButtonPositions = () => {
      const editorContainer = wrapper.closest('.editorContainer');
      const tableHeight = table.offsetHeight;
      const tableWidth = table.offsetWidth;

      // Center the add column button vertically based on actual table height
      addColBtn.style.top = `${tableHeight / 2}px`;

      // Center the add row button horizontally based on actual table width
      addRowBtn.style.left = `${tableWidth / 2}px`;

      // Hide add column button if table would overflow editor
      if (editorContainer) {
        const editorWidth = editorContainer.clientWidth;
        const minColWidth = 100;
        if (tableWidth + minColWidth > editorWidth - 40) {
          addColBtn.style.display = 'none';
        } else {
          addColBtn.style.display = '';
        }
      }
    };

    // Check on initial render and observe for changes
    requestAnimationFrame(updateButtonPositions);
    const resizeObserver = new ResizeObserver(updateButtonPositions);
    resizeObserver.observe(table);

    // Store observer reference for cleanup
    (wrapper as any)._resizeObserver = resizeObserver;

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

      // Check if we're updating from loading state (placeholder div) to actual image
      const placeholder = element.querySelector('.editorMediaPlaceholder');
      if (placeholder && imageNode.src) {
        // Replace placeholder with actual image
        element.innerHTML = '';
        const img = document.createElement('img');
        img.src = imageNode.src;
        img.alt = imageNode.alt || '';
        img.className = 'editorImage';
        if (imageNode.width) img.width = imageNode.width;
        if (imageNode.height) img.height = imageNode.height;
        element.appendChild(img);
        return;
      }

      // Normal image update
      const img = element.querySelector('img');
      if (img && imageNode.src && img.src !== imageNode.src) {
        img.src = imageNode.src;
      }
      return;
    }

    // Handle drawio node updates (for lazy-loaded assets)
    if (node.type === 'drawio') {
      const drawioNode = node as DrawioNode;

      // Check if toolbar exists, if not add it
      if (!element.querySelector('.editorDrawioToolbar') && drawioNode.diagramXML) {
        const iframe = element.querySelector('iframe') as HTMLIFrameElement;
        this.addDrawioToolbar(element, drawioNode.key, iframe);
      }

      // Check if we're updating from loading state (placeholder div) to actual diagram
      const placeholder = element.querySelector('.editorMediaPlaceholder');
      if (placeholder && drawioNode.diagramXML) {
        // Remove loading class and placeholder
        element.classList.remove('editorDrawioLoading');
        placeholder.remove();

        // Store XML in data attribute
        element.setAttribute('data-diagram-xml', drawioNode.diagramXML);

        // Create iframe for the diagram
        const iframe = document.createElement('iframe');
        iframe.className = 'editorDrawioIframe';
        iframe.frameBorder = '0';
        iframe.width = '100%';
        iframe.style.height = '400px';

        iframe.srcdoc = this.createDrawioSrcdoc(drawioNode.diagramXML);

        // Add toolbar
        this.addDrawioToolbar(element, drawioNode.key, iframe);

        // Insert iframe before the overlay (if exists)
        const overlay = element.querySelector('.editorDrawioOverlay');
        if (overlay) {
          element.insertBefore(iframe, overlay);
        } else {
          element.appendChild(iframe);
        }
        return;
      }

      const iframe = element.querySelector('iframe') as HTMLIFrameElement;
      if (iframe && drawioNode.diagramXML) {
        // Remove loading class now that content is loaded
        element.classList.remove('editorDrawioLoading');

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
