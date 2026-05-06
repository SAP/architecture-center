import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useEditor } from '../../hooks/useEditor';
import { Plus, GripVertical, Copy, Trash2 } from 'lucide-react';
import styles from './index.module.css';

interface BlockPosition {
  top: number;
  left: number;
  blockKey: string;
  blockElement: HTMLElement;
}

interface DropTarget {
  top: number;
  left: number;
  width: number;
  targetKey: string;
  position: 'before' | 'after';
}

export default function BlockHandlePlugin() {
  const editor = useEditor();
  const [activeBlock, setActiveBlock] = useState<BlockPosition | null>(null);
  const [handlePosition, setHandlePosition] = useState<{ top: number; left: number } | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isHoveringHandle, setIsHoveringHandle] = useState(false);
  const [isMouseActive, setIsMouseActive] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedBlock, setDraggedBlock] = useState<BlockPosition | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const lastMousePosRef = useRef<{ x: number; y: number } | null>(null);
  const scrollAnimationRef = useRef<number | null>(null);

  const getBlockElements = useCallback((): HTMLElement[] => {
    const container = editor.core?.getContainer();
    if (!container) return [];

    const blocks: HTMLElement[] = [];
    const selector = '[data-editor-key]';
    const allElements = container.querySelectorAll(selector);

    allElements.forEach((el) => {
      const htmlEl = el as HTMLElement;
      const parent = htmlEl.parentElement;
      if (parent === container || parent?.getAttribute('data-editor-key') === editor.state?.root) {
        blocks.push(htmlEl);
      }
    });

    return blocks;
  }, [editor]);

  const findBlockAtPosition = useCallback((clientY: number): BlockPosition | null => {
    const container = editor.core?.getContainer();
    if (!container) return null;

    const containerRect = container.getBoundingClientRect();
    const blocks = getBlockElements();

    if (blocks.length === 0) return null;

    let closestBlock: HTMLElement | null = null;
    let closestDistance = Infinity;
    let exactMatch: HTMLElement | null = null;

    for (const block of blocks) {
      const rect = block.getBoundingClientRect();
      const blockKey = block.getAttribute('data-editor-key');

      if (!blockKey) continue;

      // Check if mouse is directly on the block (within vertical bounds)
      if (clientY >= rect.top && clientY <= rect.bottom) {
        exactMatch = block;
      }

      // Always calculate distance to find closest block
      // This ensures we can find blocks even when mouse is over iframe
      const blockCenter = rect.top + rect.height / 2;
      const distance = Math.abs(clientY - blockCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestBlock = block;
      }
    }

    // Prefer exact match, but fall back to closest block
    const targetBlock = exactMatch || closestBlock;

    if (targetBlock) {
      const rect = targetBlock.getBoundingClientRect();
      const blockKey = targetBlock.getAttribute('data-editor-key');
      if (blockKey) {
        return {
          top: rect.top + window.scrollY,
          left: containerRect.left + 12,
          blockKey,
          blockElement: targetBlock,
        };
      }
    }

    return null;
  }, [editor, getBlockElements]);

  // Find drop target when dragging
  const findDropTarget = useCallback((clientY: number, draggedKey: string): DropTarget | null => {
    const container = editor.core?.getContainer();
    if (!container) return null;

    const containerRect = container.getBoundingClientRect();
    const blocks = getBlockElements();

    let closestTarget: DropTarget | null = null;
    let closestDistance = Infinity;

    for (const block of blocks) {
      const blockKey = block.getAttribute('data-editor-key');
      if (!blockKey || blockKey === draggedKey) continue;

      const rect = block.getBoundingClientRect();
      const blockMiddle = rect.top + rect.height / 2;

      // Calculate distance from mouse to block middle
      const distance = Math.abs(clientY - blockMiddle);

      // Find the closest block to determine drop position
      if (distance < closestDistance) {
        closestDistance = distance;
        const position = clientY < blockMiddle ? 'before' : 'after';
        const indicatorTop = position === 'before' ? rect.top : rect.bottom;

        closestTarget = {
          top: indicatorTop + window.scrollY,
          left: containerRect.left + 12,
          width: containerRect.width - 24,
          targetKey: blockKey,
          position,
        };
      }
    }

    return closestTarget;
  }, [editor, getBlockElements]);

  // Auto-scroll when dragging near edges
  const startAutoScroll = useCallback((clientY: number) => {
    const container = editor.core?.getContainer();
    if (!container) return;

    // Find the scrollable parent (editorScrollArea)
    const scrollArea = container.closest('.editorScrollArea') as HTMLElement;
    if (!scrollArea) return;

    const scrollRect = scrollArea.getBoundingClientRect();
    const edgeThreshold = 80; // pixels from edge to start scrolling
    const maxScrollSpeed = 15; // max pixels per frame

    // Cancel any existing animation
    if (scrollAnimationRef.current) {
      cancelAnimationFrame(scrollAnimationRef.current);
      scrollAnimationRef.current = null;
    }

    let scrollDirection = 0;
    let scrollSpeed = 0;

    // Check if near top edge
    if (clientY < scrollRect.top + edgeThreshold) {
      const distance = scrollRect.top + edgeThreshold - clientY;
      scrollSpeed = Math.min(maxScrollSpeed, (distance / edgeThreshold) * maxScrollSpeed);
      scrollDirection = -1; // scroll up
    }
    // Check if near bottom edge
    else if (clientY > scrollRect.bottom - edgeThreshold) {
      const distance = clientY - (scrollRect.bottom - edgeThreshold);
      scrollSpeed = Math.min(maxScrollSpeed, (distance / edgeThreshold) * maxScrollSpeed);
      scrollDirection = 1; // scroll down
    }

    if (scrollDirection !== 0) {
      const scroll = () => {
        if (!isDragging) {
          scrollAnimationRef.current = null;
          return;
        }
        scrollArea.scrollTop += scrollDirection * scrollSpeed;
        scrollAnimationRef.current = requestAnimationFrame(scroll);
      };
      scrollAnimationRef.current = requestAnimationFrame(scroll);
    }
  }, [editor, isDragging]);

  const stopAutoScroll = useCallback(() => {
    if (scrollAnimationRef.current) {
      cancelAnimationFrame(scrollAnimationRef.current);
      scrollAnimationRef.current = null;
    }
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    // Handle dragging
    if (isDragging && draggedBlock) {
      const target = findDropTarget(e.clientY, draggedBlock.blockKey);
      setDropTarget(target);
      // Auto-scroll when dragging near edges
      startAutoScroll(e.clientY);
      return;
    }

    if (showMenu) return;

    // Check if the mouse actually moved (not just a synthetic event)
    const lastPos = lastMousePosRef.current;
    if (lastPos && Math.abs(e.clientX - lastPos.x) < 2 && Math.abs(e.clientY - lastPos.y) < 2) {
      return;
    }
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };

    // Mouse moved - activate mouse mode
    setIsMouseActive(true);

    const container = editor.core?.getContainer();
    if (!container) return;

    const containerRect = container.getBoundingClientRect();

    // Check if hovering over the handle itself - keep it visible
    if (handleRef.current) {
      const handleRect = handleRef.current.getBoundingClientRect();
      if (
        e.clientX >= handleRect.left - 5 &&
        e.clientX <= handleRect.right + 5 &&
        e.clientY >= handleRect.top - 5 &&
        e.clientY <= handleRect.bottom + 5
      ) {
        setIsVisible(true);
        return;
      }
    }

    // Only show handles when mouse is within the editor's vertical bounds
    const blocks = getBlockElements();
    if (blocks.length > 0) {
      const firstBlock = blocks[0];
      const lastBlock = blocks[blocks.length - 1];
      const firstRect = firstBlock.getBoundingClientRect();
      const lastRect = lastBlock.getBoundingClientRect();

      // Add some padding above and below (allow handles for first/last blocks)
      const topBound = firstRect.top - 50;
      const bottomBound = lastRect.bottom + 72;

      if (e.clientY < topBound || e.clientY > bottomBound) {
        if (!isHoveringHandle) {
          setIsVisible(false);
        }
        return;
      }
    }

    // Show handles when mouse is anywhere within or to the left of the editor
    // Extended range to the left to catch mouse near drag handles
    if (e.clientX < containerRect.left - 100 || e.clientX > containerRect.right + 20) {
      if (!isHoveringHandle) {
        setActiveBlock(null);
      }
      return;
    }

    const blockPos = findBlockAtPosition(e.clientY);
    if (blockPos) {
      setActiveBlock(blockPos);
      setHandlePosition({ top: blockPos.top, left: blockPos.left });
      setIsVisible(true);
    } else if (!isHoveringHandle) {
      setIsVisible(false);
    }
  }, [editor, findBlockAtPosition, findDropTarget, isHoveringHandle, showMenu, isDragging, draggedBlock, getBlockElements, startAutoScroll]);

  const handleMouseLeave = useCallback(() => {
    if (!isHoveringHandle && !showMenu) {
      setIsVisible(false);
    }
  }, [isHoveringHandle, showMenu]);

  const handlePlusClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!activeBlock || !editor.core) return;

    const container = editor.core.getContainer();
    if (!container) return;

    const blockElement = activeBlock.blockElement;

    // Find the last text node in the block to set cursor there
    const walker = document.createTreeWalker(blockElement, NodeFilter.SHOW_TEXT);
    let lastTextNode: Node | null = null;
    let node: Node | null;
    while ((node = walker.nextNode())) {
      lastTextNode = node;
    }

    if (lastTextNode) {
      const range = document.createRange();
      const sel = window.getSelection();
      range.setStart(lastTextNode, lastTextNode.textContent?.length || 0);
      range.collapse(true);
      sel?.removeAllRanges();
      sel?.addRange(range);
    }

    container.focus();

    // Use requestAnimationFrame to ensure focus is set before dispatching commands
    requestAnimationFrame(() => {
      editor.dispatchCommand({ type: 'INSERT_PARAGRAPH' });

      // Wait for the paragraph to be inserted, then open slash menu
      requestAnimationFrame(() => {
        // Get the position of the new paragraph for the slash menu
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();

          // Dispatch custom event to open slash menu
          const event = new CustomEvent('openSlashMenu', {
            detail: {
              top: rect.bottom + window.scrollY + 8,
              left: rect.left + window.scrollX,
            }
          });
          document.dispatchEvent(event);
        }
      });
    });

    setActiveBlock(null);
  }, [activeBlock, editor]);

  const handleGripClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMenu(prev => !prev);
  }, []);

  const handleDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!activeBlock) return;

    setIsDragging(true);
    setDraggedBlock(activeBlock);
    setShowMenu(false);

    // Add dragging class to the block element
    activeBlock.blockElement.classList.add(styles.draggingBlock);
  }, [activeBlock]);

  const handleDragEnd = useCallback(() => {
    // Stop auto-scroll
    stopAutoScroll();

    if (!isDragging || !draggedBlock) return;

    // Remove dragging class
    draggedBlock.blockElement.classList.remove(styles.draggingBlock);

    // If we have a valid drop target, move the block
    if (dropTarget && dropTarget.targetKey !== draggedBlock.blockKey) {
      editor.dispatchCommand({
        type: 'MOVE_BLOCK',
        payload: {
          blockKey: draggedBlock.blockKey,
          targetKey: dropTarget.targetKey,
          position: dropTarget.position,
        }
      });
    }

    setIsDragging(false);
    setDraggedBlock(null);
    setDropTarget(null);
  }, [isDragging, draggedBlock, dropTarget, editor, stopAutoScroll]);

  const handleDuplicate = useCallback(() => {
    if (!activeBlock || !editor.core) return;

    // Dispatch a duplicate block command
    editor.dispatchCommand({
      type: 'DUPLICATE_BLOCK',
      payload: { blockKey: activeBlock.blockKey }
    });

    setShowMenu(false);
    setActiveBlock(null);
  }, [activeBlock, editor]);

  const handleDelete = useCallback(() => {
    if (!activeBlock || !editor.core) return;

    // Dispatch a delete block command
    editor.dispatchCommand({
      type: 'DELETE_BLOCK',
      payload: { blockKey: activeBlock.blockKey }
    });

    setShowMenu(false);
    setActiveBlock(null);
  }, [activeBlock, editor]);

  // Handle drag end on mouseup
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseUp = () => {
      handleDragEnd();
    };

    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, [isDragging, handleDragEnd]);

  // Hide handles while typing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore modifier keys and navigation keys
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock'].includes(e.key)) return;

      // User is typing - hide handles
      setIsMouseActive(false);
      setIsVisible(false);
      setShowMenu(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    if (!showMenu) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node) &&
          handleRef.current && !handleRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  useEffect(() => {
    const container = editor.core?.getContainer();
    if (!container) return;

    const editorWrapper = container.closest('.editorInner') || container.parentElement;
    if (!editorWrapper) return;

    document.addEventListener('mousemove', handleMouseMove);
    editorWrapper.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      editorWrapper.removeEventListener('mouseleave', handleMouseLeave);
      // Clean up any ongoing auto-scroll animation
      if (scrollAnimationRef.current) {
        cancelAnimationFrame(scrollAnimationRef.current);
      }
    };
  }, [editor, handleMouseMove, handleMouseLeave]);

  if (!handlePosition) return null;

  const shouldShow = isVisible && isMouseActive;

  return createPortal(
    <>
      <div
        ref={handleRef}
        className={`${styles.blockHandle} ${shouldShow ? styles.visible : styles.hidden}`}
        style={{
          top: handlePosition.top,
          left: handlePosition.left,
        }}
        onMouseEnter={() => {
          setIsHoveringHandle(true);
          setIsVisible(true);
        }}
        onMouseLeave={() => {
          setIsHoveringHandle(false);
        }}
      >
        <button
          className={styles.handleButton}
          onClick={handlePlusClick}
          title="Add block below"
        >
          <Plus size={16} />
        </button>
        <button
          className={`${styles.handleButton} ${isDragging ? styles.dragging : ''}`}
          onMouseDown={handleDragStart}
          onClick={handleGripClick}
          title="Drag to move / Click for options"
        >
          <GripVertical size={16} />
        </button>
      </div>

      {showMenu && activeBlock && shouldShow && !isDragging && (
        <div
          ref={menuRef}
          className={styles.blockMenu}
          style={{
            top: handlePosition.top + 28,
            left: handlePosition.left,
          }}
        >
          <button className={styles.menuItem} onClick={handleDuplicate}>
            <Copy size={14} />
            <span>Duplicate</span>
          </button>
          <button className={`${styles.menuItem} ${styles.danger}`} onClick={handleDelete}>
            <Trash2 size={14} />
            <span>Delete</span>
          </button>
        </div>
      )}

      {/* Drop indicator line */}
      {isDragging && dropTarget && (
        <div
          className={styles.dropIndicator}
          style={{
            top: dropTarget.top,
            left: dropTarget.left,
            width: dropTarget.width,
          }}
        />
      )}
    </>,
    document.body
  );
}
