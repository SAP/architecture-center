import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useEditor } from '../../hooks/useEditor';
import { useIsVisible } from '@site/src/hooks/useIsVisible';
import {
  ChevronDown, Underline, Bold, Italic, Strikethrough, Code, Quote, List,
  ListOrdered, Undo, Redo, Heading1, Heading2, MoreHorizontal,
  Info, Lightbulb, AlertTriangle, AlertCircle, StickyNote
} from 'lucide-react';
import styles from './index.module.css';

interface ToolbarState {
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  isStrikethrough: boolean;
  isCode: boolean;
  canUndo: boolean;
  canRedo: boolean;
  blockType: string;
}

interface ToolItem {
  id: string;
  group?: string;
  component?: React.ReactNode;
  type?: 'divider' | 'tool';
}

interface ResponsiveItemProps {
  id: string;
  children: React.ReactNode;
  setHiddenIds: React.Dispatch<React.SetStateAction<string[]>>;
}

function useClickOutside(ref: React.RefObject<HTMLElement | null>, handler: (event: MouseEvent) => void) {
  useEffect(() => {
    const listener = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!ref.current || ref.current.contains(target)) {
        return;
      }
      handler(event);
    };
    document.addEventListener('mousedown', listener);
    return () => document.removeEventListener('mousedown', listener);
  }, [ref, handler]);
}

const ResponsiveItem: React.FC<ResponsiveItemProps> = ({ id, children, setHiddenIds }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isVisible = useIsVisible(ref as React.RefObject<HTMLElement>);

  useEffect(() => {
    if (id.startsWith('divider')) return;

    setHiddenIds((prev) => {
      const exists = prev.includes(id);
      if (!isVisible && !exists) return [...prev, id];
      if (isVisible && exists) return prev.filter((item) => item !== id);
      return prev;
    });
  }, [id, isVisible, setHiddenIds]);

  return (
    <div ref={ref} className={styles.responsiveItemWrapper}>
      {children}
    </div>
  );
};

const blockTypeToBlockName: Record<string, string> = {
  h1: 'Heading 1',
  h2: 'Heading 1',  // Level 2 displays as "Heading 1" to user
  h3: 'Heading 2',  // Level 3 displays as "Heading 2" to user
  paragraph: 'Paragraph',
  quote: 'Quote',
  heading: 'Heading',
  note: 'Note',
  info: 'Info',
  tip: 'Tip',
  warning: 'Warning',
  danger: 'Danger',
};

function BlockFormatDropDown() {
  const dropDownRef = useRef<HTMLDivElement>(null);
  const [showDropDown, setShowDropDown] = useState(false);
  const editor = useEditor();
  const blockType = editor.getActiveBlockType();

  useClickOutside(dropDownRef, () => setShowDropDown(false));

  const formatHeading = (level: 2 | 3) => {
    editor.dispatchCommand({ type: 'SET_BLOCK_TYPE', payload: { blockType: 'heading', level } });
    setShowDropDown(false);
  };

  const formatParagraph = () => {
    editor.dispatchCommand({ type: 'SET_BLOCK_TYPE', payload: { blockType: 'paragraph' } });
    setShowDropDown(false);
  };

  const formatQuote = () => {
    editor.dispatchCommand({ type: 'SET_BLOCK_TYPE', payload: { blockType: 'quote' } });
    setShowDropDown(false);
  };

  return (
    <div className={styles.dropdown} ref={dropDownRef}>
      <button className={styles.dropdownToggle} onClick={() => setShowDropDown((v) => !v)}>
        {blockTypeToBlockName[blockType] || 'Paragraph'} <ChevronDown size={16} />
      </button>
      {showDropDown && (
        <div className={styles.dropdownMenu} style={{ zIndex: 100 }}>
          <button className={styles.dropdownItem} onClick={formatParagraph}>
            Paragraph
          </button>
          <button className={styles.dropdownItem} onClick={() => formatHeading(2)}>
            <Heading1 size={18} /> Heading 1
          </button>
          <button className={styles.dropdownItem} onClick={() => formatHeading(3)}>
            <Heading2 size={18} /> Heading 2
          </button>
          <button className={styles.dropdownItem} onClick={formatQuote}>
            <Quote size={18} /> Quote
          </button>
        </div>
      )}
    </div>
  );
}

function AdmonitionDropDown() {
  const dropDownRef = useRef<HTMLDivElement>(null);
  const [showDropDown, setShowDropDown] = useState(false);
  const editor = useEditor();

  useClickOutside(dropDownRef, () => setShowDropDown(false));

  const insertAdmonition = (type: 'note' | 'info' | 'tip' | 'warning' | 'danger') => {
    editor.dispatchCommand({ type: 'INSERT_ADMONITION', payload: { admonitionType: type } });
    setShowDropDown(false);
  };

  return (
    <div className={styles.dropdown} ref={dropDownRef}>
      <button className={styles.dropdownToggle} onClick={() => setShowDropDown((v) => !v)}>
        <Info size={16} /> Callout <ChevronDown size={14} />
      </button>
      {showDropDown && (
        <div className={styles.dropdownMenu} style={{ zIndex: 100 }}>
          <button className={styles.dropdownItem} onClick={() => insertAdmonition('note')}>
            <StickyNote size={18} /> Note
          </button>
          <button className={styles.dropdownItem} onClick={() => insertAdmonition('info')}>
            <Info size={18} /> Info
          </button>
          <button className={styles.dropdownItem} onClick={() => insertAdmonition('tip')}>
            <Lightbulb size={18} /> Tip
          </button>
          <button className={styles.dropdownItem} onClick={() => insertAdmonition('warning')}>
            <AlertTriangle size={18} /> Warning
          </button>
          <button className={styles.dropdownItem} onClick={() => insertAdmonition('danger')}>
            <AlertCircle size={18} /> Danger
          </button>
        </div>
      )}
    </div>
  );
}

export default function ToolbarPlugin() {
  const editor = useEditor();
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);
  const [showHamburger, setShowHamburger] = useState(false);
  const hamburgerRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<ToolbarState>({
    isBold: false,
    isItalic: false,
    isUnderline: false,
    isStrikethrough: false,
    isCode: false,
    canUndo: false,
    canRedo: false,
    blockType: 'paragraph',
  });

  useClickOutside(hamburgerRef, () => setShowHamburger(false));

  const updateToolbar = useCallback(() => {
    const formats = editor.getActiveFormats();
    setState({
      isBold: formats.bold || false,
      isItalic: formats.italic || false,
      isUnderline: formats.underline || false,
      isStrikethrough: formats.strikethrough || false,
      isCode: formats.code || false,
      canUndo: editor.canUndo(),
      canRedo: editor.canRedo(),
      blockType: editor.getActiveBlockType(),
    });
  }, [editor]);

  useEffect(() => {
    updateToolbar();
    const intervalId = setInterval(updateToolbar, 100);
    return () => clearInterval(intervalId);
  }, [updateToolbar]);

  const tools: ToolItem[] = [
    {
      id: 'undo',
      group: 'History',
      component: (
        <button
          disabled={!state.canUndo}
          onClick={() => editor.dispatchCommand({ type: 'UNDO' })}
          className={styles.button}
          title="Undo"
        >
          <Undo size={16} />
        </button>
      ),
    },
    {
      id: 'redo',
      group: 'History',
      component: (
        <button
          disabled={!state.canRedo}
          onClick={() => editor.dispatchCommand({ type: 'REDO' })}
          className={styles.button}
          title="Redo"
        >
          <Redo size={16} />
        </button>
      ),
    },
    { id: 'divider-1', type: 'divider' },
    { id: 'block-format', group: 'Text Style', component: <BlockFormatDropDown /> },
    { id: 'divider-2', type: 'divider' },
    {
      id: 'bold',
      group: 'Formatting',
      component: (
        <button
          onClick={() => editor.dispatchCommand({ type: 'FORMAT_TEXT', payload: { format: 'bold' } })}
          className={`${styles.button} ${state.isBold ? styles.active : ''}`}
          title="Bold"
        >
          <Bold size={16} />
        </button>
      ),
    },
    {
      id: 'italic',
      group: 'Formatting',
      component: (
        <button
          onClick={() => editor.dispatchCommand({ type: 'FORMAT_TEXT', payload: { format: 'italic' } })}
          className={`${styles.button} ${state.isItalic ? styles.active : ''}`}
          title="Italic"
        >
          <Italic size={16} />
        </button>
      ),
    },
    {
      id: 'underline',
      group: 'Formatting',
      component: (
        <button
          onClick={() => editor.dispatchCommand({ type: 'FORMAT_TEXT', payload: { format: 'underline' } })}
          className={`${styles.button} ${state.isUnderline ? styles.active : ''}`}
          title="Underline"
        >
          <Underline size={16} />
        </button>
      ),
    },
    {
      id: 'strikethrough',
      group: 'Formatting',
      component: (
        <button
          onClick={() => editor.dispatchCommand({ type: 'FORMAT_TEXT', payload: { format: 'strikethrough' } })}
          className={`${styles.button} ${state.isStrikethrough ? styles.active : ''}`}
          title="Strikethrough"
        >
          <Strikethrough size={16} />
        </button>
      ),
    },
    {
      id: 'code',
      group: 'Formatting',
      component: (
        <button
          onClick={() => editor.dispatchCommand({ type: 'FORMAT_TEXT', payload: { format: 'code' } })}
          className={`${styles.button} ${state.isCode ? styles.active : ''}`}
          title="Code"
        >
          <Code size={16} />
        </button>
      ),
    },
    { id: 'divider-3', type: 'divider' },
    {
      id: 'ul',
      group: 'Lists',
      component: (
        <button
          onClick={() => editor.dispatchCommand({ type: 'TOGGLE_LIST', payload: { listType: 'bullet' } })}
          className={styles.button}
          title="Bullet List"
        >
          <List size={16} />
        </button>
      ),
    },
    {
      id: 'ol',
      group: 'Lists',
      component: (
        <button
          onClick={() => editor.dispatchCommand({ type: 'TOGGLE_LIST', payload: { listType: 'number' } })}
          className={styles.button}
          title="Numbered List"
        >
          <ListOrdered size={16} />
        </button>
      ),
    },
    {
      id: 'quote',
      group: 'Lists',
      component: (
        <button
          onClick={() => editor.dispatchCommand({ type: 'SET_BLOCK_TYPE', payload: { blockType: 'quote' } })}
          className={styles.button}
          title="Quote"
        >
          <Quote size={16} />
        </button>
      ),
    },
    { id: 'divider-4', type: 'divider' },
    { id: 'admonition', group: 'Callouts', component: <AdmonitionDropDown /> },
  ];

  const getGroupedHiddenTools = () => {
    const hiddenTools = tools.filter((t) => hiddenIds.includes(t.id) && t.type !== 'divider');
    const groups: Record<string, ToolItem[]> = {};

    hiddenTools.forEach((tool) => {
      const groupName = tool.group || 'Other';
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(tool);
    });

    return Object.entries(groups);
  };

  return (
    <div className={styles.toolbarContainer}>
      <div className={styles.scrollableToolbar}>
        {tools.map((tool) => (
          <ResponsiveItem key={tool.id} id={tool.id} setHiddenIds={setHiddenIds}>
            {tool.type === 'divider' ? <div className={styles.divider} /> : tool.component}
          </ResponsiveItem>
        ))}
      </div>

      {hiddenIds.length > 0 && (
        <div className={styles.hamburgerContainer} ref={hamburgerRef}>
          <button className={styles.button} onClick={() => setShowHamburger((v) => !v)}>
            <MoreHorizontal size={16} />
          </button>
          {showHamburger && (
            <div className={styles.hamburgerDropdown}>
              {getGroupedHiddenTools().map(([groupName, groupTools]) => (
                <div key={groupName} className={styles.menuGroup}>
                  <div className={styles.menuHeader}>{groupName}</div>
                  <div className={styles.menuRow}>
                    {groupTools.map((tool) => (
                      <React.Fragment key={tool.id}>{tool.component}</React.Fragment>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
