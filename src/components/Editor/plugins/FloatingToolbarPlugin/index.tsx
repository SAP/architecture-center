import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useEditor } from '../../hooks/useEditor';
import { Link, Strikethrough, Code, ChevronDown, Heading1, Heading2, Type, Quote, List, ListOrdered } from 'lucide-react';
import styles from './index.module.css';

const blockTypeLabels: Record<string, string> = {
  paragraph: 'Text',
  h1: 'H1',
  h2: 'H1',  // Level 2 displays as "H1" to user
  h3: 'H2',  // Level 3 displays as "H2" to user
  quote: 'Quote',
  heading: 'Heading',
};

function FloatingToolbarInternal() {
  const editor = useEditor();
  const toolbarRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const linkInputRef = useRef<HTMLInputElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [showBlockDropdown, setShowBlockDropdown] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [savedSelection, setSavedSelection] = useState<any>(null);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isCode, setIsCode] = useState(false);
  const [blockType, setBlockType] = useState('paragraph');

  const updateToolbar = useCallback(() => {
    const formats = editor.getActiveFormats();
    setIsBold(formats.bold || false);
    setIsItalic(formats.italic || false);
    setIsUnderline(formats.underline || false);
    setIsStrikethrough(formats.strikethrough || false);
    setIsCode(formats.code || false);
    setBlockType(editor.getActiveBlockType());
  }, [editor]);

  const positionToolbar = useCallback(() => {
    // Don't reposition if link input is open
    if (showLinkInput) return;

    const toolbar = toolbarRef.current;
    if (!toolbar) return;

    const selection = editor.core?.getSelection();

    if (!selection || selection.isCollapsed) {
      setIsVisible(false);
      setShowBlockDropdown(false);
      return;
    }

    const domSelection = window.getSelection();
    if (!domSelection || domSelection.rangeCount === 0) {
      setIsVisible(false);
      setShowBlockDropdown(false);
      return;
    }

    const domRange = domSelection.getRangeAt(0);
    const rect = domRange.getBoundingClientRect();

    if (rect.width === 0) {
      setIsVisible(false);
      setShowBlockDropdown(false);
      return;
    }

    const top = window.scrollY + rect.top - toolbar.offsetHeight - 10;
    const left = window.scrollX + rect.left + (rect.width / 2) - (toolbar.offsetWidth / 2);

    toolbar.style.top = `${Math.max(10, top)}px`;
    toolbar.style.left = `${Math.max(10, left)}px`;
    setIsVisible(true);
    updateToolbar();
  }, [editor, updateToolbar, showLinkInput]);

  useEffect(() => {
    const unsubscribe = editor.core?.subscribe(() => {
      positionToolbar();
    });

    document.addEventListener('selectionchange', positionToolbar);

    return () => {
      unsubscribe?.();
      document.removeEventListener('selectionchange', positionToolbar);
    };
  }, [editor, positionToolbar]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowBlockDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus link input when it opens
  useEffect(() => {
    if (showLinkInput && linkInputRef.current) {
      linkInputRef.current.focus();
    }
  }, [showLinkInput]);

  const formatText = (format: 'bold' | 'italic' | 'underline' | 'strikethrough' | 'code') => {
    editor.dispatchCommand({ type: 'FORMAT_TEXT', payload: { format } });
  };

  const handleLinkClick = () => {
    // Save selection before showing input
    setSavedSelection(editor.selection);
    setShowLinkInput(true);
    setLinkUrl('');
  };

  const handleLinkSubmit = () => {
    if (linkUrl && savedSelection && !savedSelection.isCollapsed) {
      editor.core?.setSelection(savedSelection);
      editor.dispatchCommand({ type: 'INSERT_LINK', payload: { url: linkUrl } });
    }
    setShowLinkInput(false);
    setLinkUrl('');
    setSavedSelection(null);
  };

  const handleLinkCancel = () => {
    // Use timeout to allow Enter key to process first
    setTimeout(() => {
      setShowLinkInput(false);
      setLinkUrl('');
      setSavedSelection(null);
    }, 100);
  };

  const handleLinkKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      const url = linkUrl;
      const selection = savedSelection;
      setShowLinkInput(false);
      setLinkUrl('');
      setSavedSelection(null);

      if (url && selection && !selection.isCollapsed) {
        editor.core?.setSelection(selection);
        editor.dispatchCommand({ type: 'INSERT_LINK', payload: { url } });
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setShowLinkInput(false);
      setLinkUrl('');
      setSavedSelection(null);
    }
  };

  const setBlockTypeHandler = (type: 'paragraph' | 'heading' | 'quote', level?: 1 | 2 | 3) => {
    editor.dispatchCommand({ type: 'SET_BLOCK_TYPE', payload: { blockType: type, level } });
    setShowBlockDropdown(false);
  };

  const toggleList = (listType: 'bullet' | 'number') => {
    editor.dispatchCommand({ type: 'TOGGLE_LIST', payload: { listType } });
    setShowBlockDropdown(false);
  };

  return (
    <div
      ref={toolbarRef}
      className={styles.floatingToolbar}
      style={{
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? 'auto' : 'none',
      }}
    >
      {showLinkInput ? (
        <div className={styles.linkInputContainer}>
          <input
            ref={linkInputRef}
            type="text"
            className={styles.linkInput}
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={handleLinkKeyDown}
            onBlur={handleLinkCancel}
            placeholder="Paste link"
          />
        </div>
      ) : (
        <div className={styles.row}>
          <div className={styles.blockDropdown} ref={dropdownRef}>
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setShowBlockDropdown(!showBlockDropdown)}
              className={styles.blockButton}
              title="Change block type"
            >
              {blockTypeLabels[blockType] || 'Text'}
              <ChevronDown size={14} />
            </button>
            {showBlockDropdown && (
              <div className={styles.dropdownMenu}>
                <button
                  className={styles.dropdownItem}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setBlockTypeHandler('paragraph')}
                >
                  <Type size={16} /> Text
                </button>
                <button
                  className={styles.dropdownItem}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setBlockTypeHandler('heading', 2)}
                >
                  <Heading1 size={16} /> Heading 1
                </button>
                <button
                  className={styles.dropdownItem}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setBlockTypeHandler('heading', 3)}
                >
                  <Heading2 size={16} /> Heading 2
                </button>
                <button
                  className={styles.dropdownItem}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setBlockTypeHandler('quote')}
                >
                  <Quote size={16} /> Quote
                </button>
                <div className={styles.dropdownDivider} />
                <button
                  className={styles.dropdownItem}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => toggleList('bullet')}
                >
                  <List size={16} /> Bullet List
                </button>
                <button
                  className={styles.dropdownItem}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => toggleList('number')}
                >
                  <ListOrdered size={16} /> Numbered List
                </button>
              </div>
            )}
          </div>
          <div className={styles.divider} />
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => formatText('bold')}
            className={`${styles.button} ${isBold ? styles.active : ''}`}
            title="Bold (⌘B)"
          >
            <span className={styles.boldIcon}>B</span>
          </button>
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => formatText('italic')}
            className={`${styles.button} ${isItalic ? styles.active : ''}`}
            title="Italic (⌘I)"
          >
            <span className={styles.italicIcon}>I</span>
          </button>
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => formatText('underline')}
            className={`${styles.button} ${isUnderline ? styles.active : ''}`}
            title="Underline (⌘U)"
          >
            <span className={styles.underlineIcon}>U</span>
          </button>
          <div className={styles.divider} />
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleLinkClick}
            className={styles.button}
            title="Add link"
          >
            <Link size={18} strokeWidth={2} />
          </button>
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => formatText('strikethrough')}
            className={`${styles.button} ${isStrikethrough ? styles.active : ''}`}
            title="Strikethrough"
          >
            <Strikethrough size={18} strokeWidth={2} />
          </button>
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => formatText('code')}
            className={`${styles.button} ${isCode ? styles.active : ''}`}
            title="Code"
          >
            <Code size={18} strokeWidth={2} />
          </button>
        </div>
      )}
    </div>
  );
}

export default function FloatingToolbarPlugin() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(<FloatingToolbarInternal />, document.body);
}
