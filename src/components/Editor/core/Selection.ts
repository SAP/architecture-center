import { EditorState, EditorSelection, SelectionPoint, isTextNode, isElementNode } from './types';
import { getNode, findFirstTextNode, findLastTextNode } from './EditorState';

const DATA_KEY_ATTR = 'data-editor-key';

// Get element by node key
export function getElementByKey(key: string, container: HTMLElement): HTMLElement | null {
  return container.querySelector(`[${DATA_KEY_ATTR}="${key}"]`);
}

// Get node key from element
export function getKeyFromElement(element: HTMLElement): string | null {
  return element.getAttribute(DATA_KEY_ATTR);
}

// Find closest element with data-editor-key
export function findClosestKeyElement(node: Node | null): HTMLElement | null {
  if (!node) return null;
  let current: Node | null = node;
  while (current) {
    if (current instanceof HTMLElement && current.hasAttribute(DATA_KEY_ATTR)) {
      return current;
    }
    current = current.parentNode;
  }
  return null;
}

// Convert DOM selection point to model selection point
export function domPointToModel(
  node: Node,
  offset: number,
  state: EditorState
): SelectionPoint | null {
  // Text node case
  if (node.nodeType === Node.TEXT_NODE) {
    const parent = node.parentElement;
    if (!parent) return null;

    const keyElement = findClosestKeyElement(parent);
    if (!keyElement) return null;

    const key = getKeyFromElement(keyElement);
    if (!key) return null;

    const editorNode = getNode(state, key);
    if (!editorNode) return null;

    // If it's a text node element
    if (isTextNode(editorNode)) {
      // Clamp offset to actual text length (handles zero-width space)
      const clampedOffset = Math.min(offset, editorNode.text.length);
      return { key, offset: clampedOffset };
    }

    // If it's an element, find the text child
    if (isElementNode(editorNode) && editorNode.children.length > 0) {
      const firstTextKey = editorNode.children[0];
      const textNode = getNode(state, firstTextKey);
      if (textNode && isTextNode(textNode)) {
        return { key: firstTextKey, offset: Math.min(offset, textNode.text.length) };
      }
    }

    return null;
  }

  // Element node case
  if (node.nodeType === Node.ELEMENT_NODE) {
    const element = node as HTMLElement;
    const keyElement = findClosestKeyElement(element);
    if (!keyElement) return null;

    const key = getKeyFromElement(keyElement);
    if (!key) return null;

    const editorNode = getNode(state, key);
    if (!editorNode) return null;

    // If clicking at start of element, select first text
    if (isElementNode(editorNode) && editorNode.children.length > 0) {
      if (offset === 0) {
        const firstText = findFirstTextNode(state, key);
        if (firstText) {
          return { key: firstText.key, offset: 0 };
        }
      } else {
        const lastText = findLastTextNode(state, key);
        if (lastText) {
          return { key: lastText.key, offset: lastText.text.length };
        }
      }
    }

    return { key, offset: 0 };
  }

  return null;
}

// Convert model selection point to DOM position
export function modelPointToDOM(
  point: SelectionPoint,
  state: EditorState,
  container: HTMLElement
): { node: Node; offset: number } | null {
  const editorNode = getNode(state, point.key);
  if (!editorNode) return null;

  // Find the DOM element for this key
  const element = getElementByKey(point.key, container);
  if (!element) return null;

  if (isTextNode(editorNode)) {
    // Find the text node inside the element
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    const textNode = walker.nextNode();

    if (textNode) {
      // Handle empty text (zero-width space)
      const actualLength = textNode.textContent?.length || 0;
      const offset = editorNode.text === '' ? 0 : Math.min(point.offset, actualLength);
      return { node: textNode, offset };
    }

    // No text node found, return element itself
    return { node: element, offset: 0 };
  }

  return { node: element, offset: point.offset };
}

// Get current selection from DOM
export function getSelection(state: EditorState, container: HTMLElement): EditorSelection | null {
  const domSelection = window.getSelection();
  if (!domSelection || domSelection.rangeCount === 0) return null;

  // Check if selection is within our container
  const range = domSelection.getRangeAt(0);
  if (!container.contains(range.commonAncestorContainer)) return null;

  const anchor = domPointToModel(
    domSelection.anchorNode!,
    domSelection.anchorOffset,
    state
  );

  const focus = domPointToModel(
    domSelection.focusNode!,
    domSelection.focusOffset,
    state
  );

  if (!anchor || !focus) return null;

  const isCollapsed = anchor.key === focus.key && anchor.offset === focus.offset;
  const isBackward = !isCollapsed && isSelectionBackward(domSelection);

  return { anchor, focus, isCollapsed, isBackward };
}

// Set DOM selection from model
export function setSelection(
  selection: EditorSelection | null,
  state: EditorState,
  container: HTMLElement
): void {
  const domSelection = window.getSelection();
  if (!domSelection) return;

  if (!selection) {
    domSelection.removeAllRanges();
    return;
  }

  let anchorDOM = modelPointToDOM(selection.anchor, state, container);
  let focusDOM = modelPointToDOM(selection.focus, state, container);

  // If selection points are invalid, fall back to first text node
  if (!anchorDOM || !focusDOM) {
    const firstText = findFirstTextNode(state, state.root);
    if (firstText) {
      const fallbackPoint = { key: firstText.key, offset: 0 };
      anchorDOM = modelPointToDOM(fallbackPoint, state, container);
      focusDOM = anchorDOM;
    }
    if (!anchorDOM || !focusDOM) return;
  }

  try {
    const range = document.createRange();

    if (selection.isBackward) {
      range.setStart(focusDOM.node, focusDOM.offset);
      range.setEnd(anchorDOM.node, anchorDOM.offset);
    } else {
      range.setStart(anchorDOM.node, anchorDOM.offset);
      range.setEnd(focusDOM.node, focusDOM.offset);
    }

    domSelection.removeAllRanges();
    domSelection.addRange(range);
  } catch (e) {
    // Selection failed - try to recover by focusing first text node
    const firstText = findFirstTextNode(state, state.root);
    if (firstText) {
      const fallbackDOM = modelPointToDOM({ key: firstText.key, offset: 0 }, state, container);
      if (fallbackDOM) {
        try {
          const fallbackRange = document.createRange();
          fallbackRange.setStart(fallbackDOM.node, fallbackDOM.offset);
          fallbackRange.collapse(true);
          domSelection.removeAllRanges();
          domSelection.addRange(fallbackRange);
        } catch {
          // Give up
        }
      }
    }
  }
}

// Check if DOM selection is backward
function isSelectionBackward(selection: Selection): boolean {
  if (!selection.anchorNode || !selection.focusNode) return false;

  const position = selection.anchorNode.compareDocumentPosition(selection.focusNode);

  if (position === 0) {
    return selection.anchorOffset > selection.focusOffset;
  }

  return (position & Node.DOCUMENT_POSITION_PRECEDING) !== 0;
}

// Create collapsed selection at point
export function createCollapsedSelection(key: string, offset: number): EditorSelection {
  const point = { key, offset };
  return { anchor: point, focus: point, isCollapsed: true, isBackward: false };
}

// Create range selection
export function createRangeSelection(
  anchorKey: string,
  anchorOffset: number,
  focusKey: string,
  focusOffset: number
): EditorSelection {
  const anchor = { key: anchorKey, offset: anchorOffset };
  const focus = { key: focusKey, offset: focusOffset };
  const isCollapsed = anchorKey === focusKey && anchorOffset === focusOffset;
  return { anchor, focus, isCollapsed, isBackward: false };
}

// Get selection bounding rect for positioning floating elements
export function getSelectionRect(): DOMRect | null {
  const domSelection = window.getSelection();
  if (!domSelection || domSelection.rangeCount === 0) return null;

  const range = domSelection.getRangeAt(0);
  return range.getBoundingClientRect();
}
