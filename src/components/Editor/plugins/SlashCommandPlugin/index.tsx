import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useEditor } from '../../hooks/useEditor';
import { useAuth } from '@site/src/context/AuthContext';
import { usePageDataStore } from '@site/src/store/pageDataStore';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { getApiService } from '@site/src/services/api';
import {
  Type,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Image,
  FileText,
  PenTool,
  Code,
  Minus,
  Table,
  Info,
  Lightbulb,
  AlertTriangle,
  AlertCircle,
  StickyNote
} from 'lucide-react';
import styles from './index.module.css';

interface CommandOption {
  id: string;
  name: string;
  description?: string;
  icon: React.ReactNode;
  keywords: string[];
  hint?: string;
  category?: string;
  onSelect: () => void;
}

function CommandMenuItem({
  isSelected,
  onClick,
  onMouseEnter,
  option,
}: {
  isSelected: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  option: CommandOption;
}) {
  const ref = useRef<HTMLLIElement>(null);

  useEffect(() => {
    if (isSelected && ref.current) {
      ref.current.scrollIntoView({ block: 'nearest' });
    }
  }, [isSelected]);

  return (
    <li
      ref={ref}
      className={`${styles.menuItem} ${isSelected ? styles.selected : ''}`}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      role="option"
      aria-selected={isSelected}
    >
      <span className={styles.icon}>{option.icon}</span>
      <div className={styles.textContainer}>
        <span className={styles.text}>{option.name}</span>
        {option.description && <span className={styles.description}>{option.description}</span>}
      </div>
      {option.hint && <span className={styles.hint}>{option.hint}</span>}
    </li>
  );
}

function CommandMenu({
  options,
  selectedIndex,
  onSelectOption,
  onHoverOption,
  queryString,
}: {
  options: CommandOption[];
  selectedIndex: number;
  onSelectOption: (option: CommandOption) => void;
  onHoverOption: (index: number) => void;
  queryString: string;
}) {
  // Group options by category
  const groupedOptions = useMemo(() => {
    const groups: { [key: string]: CommandOption[] } = {};
    options.forEach((option) => {
      const category = option.category || 'Basic';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(option);
    });
    return groups;
  }, [options]);

  let globalIndex = 0;

  return (
    <div className={styles.popover}>
      <div className={styles.menuContent}>
        {Object.entries(groupedOptions).map(([category, categoryOptions]) => (
          <div key={category} className={styles.category}>
            <div className={styles.categoryHeader}>{category}</div>
            <ul>
              {categoryOptions.map((option) => {
                const currentIndex = globalIndex++;
                return (
                  <CommandMenuItem
                    key={option.id}
                    isSelected={selectedIndex === currentIndex}
                    onClick={() => onSelectOption(option)}
                    onMouseEnter={() => onHoverOption(currentIndex)}
                    option={option}
                  />
                );
              })}
            </ul>
          </div>
        ))}
      </div>
      <div className={styles.menuFooter}>
        <div className={styles.filterInput}>
          <span className={styles.filterSlash}>/</span>
          <span className={styles.filterText}>
            {queryString || 'Filter...'}
          </span>
        </div>
        <div className={styles.footerKeys}>
          <span className={styles.footerKey}>↑↓</span>
          <span className={styles.footerKey}>↵</span>
          <span className={styles.footerKey}>esc</span>
        </div>
      </div>
    </div>
  );
}

export default function SlashCommandPlugin() {
  const editor = useEditor();
  const { token } = useAuth();
  const { getActiveDocument } = usePageDataStore();
  const { siteConfig } = useDocusaurusContext();
  const backendUrl = siteConfig.customFields?.expressBackendUrl as string | undefined;

  const [isOpen, setIsOpen] = useState(false);
  const [queryString, setQueryString] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerNodeKey = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingFileType = useRef<'image' | 'drawio' | 'docx' | null>(null);

  const handleFileUpload = useCallback((type: 'image' | 'drawio' | 'docx') => {
    pendingFileType.current = type;
    if (fileInputRef.current) {
      switch (type) {
        case 'image':
          fileInputRef.current.accept = 'image/*';
          break;
        case 'drawio':
          fileInputRef.current.accept = '.drawio,.xml';
          break;
        case 'docx':
          fileInputRef.current.accept = '.docx,.doc';
          break;
      }
      fileInputRef.current.click();
    }
  }, []);

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('FileReader did not return a string.'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('FileReader did not return a string.'));
        }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const onFileSelected = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const type = pendingFileType.current;
    const activeDocument = getActiveDocument();

    try {
      setIsUploading(true);

      switch (type) {
        case 'image': {
          const dataUrl = await readFileAsDataURL(file);
          let assetId: string | undefined;

          // Upload to backend if configured
          if (backendUrl && token && activeDocument?.id) {
            try {
              const api = getApiService(backendUrl);
              const asset = await api.uploadAsset(token, activeDocument.id, file);
              assetId = asset.ID;
            } catch (uploadError) {
              console.warn('Asset upload failed, using inline data URL:', uploadError);
            }
          }

          editor.dispatchCommand({
            type: 'INSERT_IMAGE',
            payload: { src: dataUrl, alt: file.name, assetId }
          });
          break;
        }
        case 'drawio': {
          if (!file.name.toLowerCase().endsWith('.drawio') && !file.name.toLowerCase().endsWith('.xml')) {
            alert('Please select a valid .drawio file');
            return;
          }
          const xml = await readFileAsText(file);
          let assetId: string | undefined;

          // Upload to backend if configured
          if (backendUrl && token && activeDocument?.id) {
            try {
              const api = getApiService(backendUrl);
              const asset = await api.uploadAsset(token, activeDocument.id, file);
              assetId = asset.ID;
            } catch (uploadError) {
              console.warn('Asset upload failed, using inline XML:', uploadError);
            }
          }

          editor.dispatchCommand({
            type: 'INSERT_DRAWIO',
            payload: { diagramXML: xml, assetId }
          });
          break;
        }
        case 'docx': {
          // Dynamic import mammoth for DOCX processing
          const mammoth = await import('mammoth');
          const arrayBuffer = await file.arrayBuffer();
          const result = await mammoth.convertToHtml({ arrayBuffer });
          const html = result.value;

          // Insert HTML with formatting preserved
          if (html) {
            editor.dispatchCommand({
              type: 'INSERT_HTML',
              payload: { html }
            });
          }
          break;
        }
      }
    } catch (error) {
      console.error('Error processing file:', error);
      alert('Error processing file. Please try again.');
    } finally {
      setIsUploading(false);
    }

    // Reset input
    e.target.value = '';
    pendingFileType.current = null;
  }, [editor, backendUrl, token, getActiveDocument]);

  const allCommands: CommandOption[] = useMemo(
    () => [
      // Basic blocks
      {
        id: 'paragraph',
        name: 'Text',
        description: 'Plain text paragraph',
        icon: <Type size={20} />,
        keywords: ['paragraph', 'text', 'p', 'plain'],
        category: 'Basic Blocks',
        onSelect: () => {
          editor.dispatchCommand({ type: 'SET_BLOCK_TYPE', payload: { blockType: 'paragraph' } });
        },
      },
      {
        id: 'heading1',
        name: 'Heading 1',
        description: 'Large section heading',
        icon: <Heading1 size={20} />,
        keywords: ['heading', 'h1', 'header', 'title'],
        hint: '#',
        category: 'Basic Blocks',
        onSelect: () => {
          editor.dispatchCommand({ type: 'SET_BLOCK_TYPE', payload: { blockType: 'heading', level: 1 } });
        },
      },
      {
        id: 'heading2',
        name: 'Heading 2',
        description: 'Medium section heading',
        icon: <Heading2 size={20} />,
        keywords: ['heading', 'h2', 'header', 'subtitle'],
        hint: '##',
        category: 'Basic Blocks',
        onSelect: () => {
          editor.dispatchCommand({ type: 'SET_BLOCK_TYPE', payload: { blockType: 'heading', level: 2 } });
        },
      },
      {
        id: 'heading3',
        name: 'Heading 3',
        description: 'Small section heading',
        icon: <Heading3 size={20} />,
        keywords: ['heading', 'h3', 'header'],
        hint: '###',
        category: 'Basic Blocks',
        onSelect: () => {
          editor.dispatchCommand({ type: 'SET_BLOCK_TYPE', payload: { blockType: 'heading', level: 3 } });
        },
      },
      {
        id: 'bullet-list',
        name: 'Bullet List',
        description: 'Unordered list with bullets',
        icon: <List size={20} />,
        keywords: ['bullet', 'list', 'ul', 'unordered'],
        hint: '-',
        category: 'Basic Blocks',
        onSelect: () => {
          editor.dispatchCommand({ type: 'TOGGLE_LIST', payload: { listType: 'bullet' } });
        },
      },
      {
        id: 'numbered-list',
        name: 'Numbered List',
        description: 'Ordered list with numbers',
        icon: <ListOrdered size={20} />,
        keywords: ['numbered', 'list', 'ol', 'ordered'],
        hint: '1.',
        category: 'Basic Blocks',
        onSelect: () => {
          editor.dispatchCommand({ type: 'TOGGLE_LIST', payload: { listType: 'number' } });
        },
      },
      {
        id: 'quote',
        name: 'Quote',
        description: 'Blockquote for citations',
        icon: <Quote size={20} />,
        keywords: ['quote', 'blockquote', 'citation'],
        hint: '>',
        category: 'Basic Blocks',
        onSelect: () => {
          editor.dispatchCommand({ type: 'SET_BLOCK_TYPE', payload: { blockType: 'quote' } });
        },
      },
      {
        id: 'divider',
        name: 'Divider',
        description: 'Horizontal line separator',
        icon: <Minus size={20} />,
        keywords: ['divider', 'hr', 'line', 'separator'],
        hint: '---',
        category: 'Basic Blocks',
        onSelect: () => {
          editor.dispatchCommand({ type: 'INSERT_DIVIDER' });
        },
      },
      {
        id: 'code',
        name: 'Code Block',
        description: 'Code with syntax highlighting',
        icon: <Code size={20} />,
        keywords: ['code', 'pre', 'syntax', 'programming'],
        hint: '```',
        category: 'Basic Blocks',
        onSelect: () => {
          editor.dispatchCommand({ type: 'SET_BLOCK_TYPE', payload: { blockType: 'code' } });
        },
      },
      // Media
      {
        id: 'image',
        name: 'Image',
        description: 'Upload an image',
        icon: <Image size={20} />,
        keywords: ['image', 'picture', 'photo', 'img', 'upload'],
        category: 'Media',
        onSelect: () => {
          handleFileUpload('image');
        },
      },
      {
        id: 'drawio',
        name: 'Diagram',
        description: 'Upload a Draw.io diagram',
        icon: <PenTool size={20} />,
        keywords: ['drawio', 'diagram', 'draw', 'flowchart', 'architecture'],
        category: 'Media',
        onSelect: () => {
          handleFileUpload('drawio');
        },
      },
      {
        id: 'docx',
        name: 'Word Document',
        description: 'Import from Word',
        icon: <FileText size={20} />,
        keywords: ['docx', 'word', 'document', 'import', 'doc'],
        category: 'Media',
        onSelect: () => {
          handleFileUpload('docx');
        },
      },
      // Advanced
      {
        id: 'table',
        name: 'Table',
        description: 'Add a table with rows and columns',
        icon: <Table size={20} />,
        keywords: ['table', 'grid', 'spreadsheet', 'rows', 'columns'],
        category: 'Advanced',
        onSelect: () => {
          editor.dispatchCommand({
            type: 'INSERT_TABLE',
            payload: { rows: 3, cols: 3 }
          });
        },
      },
      // Admonitions
      {
        id: 'note',
        name: 'Note',
        description: 'Add a note callout',
        icon: <StickyNote size={20} />,
        keywords: ['note', 'admonition', 'callout'],
        category: 'Callouts',
        onSelect: () => {
          editor.dispatchCommand({
            type: 'INSERT_ADMONITION',
            payload: { admonitionType: 'note' }
          });
        },
      },
      {
        id: 'info',
        name: 'Info',
        description: 'Add an info callout',
        icon: <Info size={20} />,
        keywords: ['info', 'information', 'admonition', 'callout'],
        category: 'Callouts',
        onSelect: () => {
          editor.dispatchCommand({
            type: 'INSERT_ADMONITION',
            payload: { admonitionType: 'info' }
          });
        },
      },
      {
        id: 'tip',
        name: 'Tip',
        description: 'Add a tip callout',
        icon: <Lightbulb size={20} />,
        keywords: ['tip', 'hint', 'admonition', 'callout'],
        category: 'Callouts',
        onSelect: () => {
          editor.dispatchCommand({
            type: 'INSERT_ADMONITION',
            payload: { admonitionType: 'tip' }
          });
        },
      },
      {
        id: 'warning',
        name: 'Warning',
        description: 'Add a warning callout',
        icon: <AlertTriangle size={20} />,
        keywords: ['warning', 'caution', 'admonition', 'callout'],
        category: 'Callouts',
        onSelect: () => {
          editor.dispatchCommand({
            type: 'INSERT_ADMONITION',
            payload: { admonitionType: 'warning' }
          });
        },
      },
      {
        id: 'danger',
        name: 'Danger',
        description: 'Add a danger callout',
        icon: <AlertCircle size={20} />,
        keywords: ['danger', 'error', 'critical', 'admonition', 'callout'],
        category: 'Callouts',
        onSelect: () => {
          editor.dispatchCommand({
            type: 'INSERT_ADMONITION',
            payload: { admonitionType: 'danger' }
          });
        },
      },
    ],
    [editor, handleFileUpload]
  );

  const filteredOptions = useMemo(() => {
    if (!queryString) return allCommands;
    const query = queryString.toLowerCase();
    return allCommands.filter(
      (option) =>
        option.name.toLowerCase().includes(query) ||
        option.keywords.some((keyword) => keyword.includes(query)) ||
        option.description?.toLowerCase().includes(query)
    );
  }, [allCommands, queryString]);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
    setQueryString('');
    setSelectedIndex(0);
    setPosition(null);
    triggerNodeKey.current = null;
  }, []);

  const selectOption = useCallback(
    (option: CommandOption) => {
      // First, delete the "/" and any query text atomically
      const state = editor.state;
      const selection = editor.selection;
      if (state && selection && triggerNodeKey.current) {
        const node = state.nodeMap.get(triggerNodeKey.current);
        if (node && node.type === 'text') {
          const text = (node as any).text as string;
          const offset = selection.anchor.offset;
          const slashIndex = text.lastIndexOf('/', offset);
          if (slashIndex !== -1) {
            editor.dispatchCommand({
              type: 'DELETE_RANGE',
              payload: {
                nodeKey: triggerNodeKey.current,
                startOffset: slashIndex,
                endOffset: offset,
              },
            });
          }
        }
      }

      // Then execute the command
      option.onSelect();
      closeMenu();
    },
    [editor, closeMenu]
  );

  useEffect(() => {
    const container = editor.core?.getContainer();
    if (!container) return;

    const checkForSlashTrigger = () => {
      const selection = editor.selection;
      console.log('[SlashCommand] checkForSlashTrigger, selection:', selection);

      if (!selection || !selection.isCollapsed) {
        closeMenu();
        return;
      }

      const state = editor.state;
      if (!state) return;

      const node = state.nodeMap.get(selection.anchor.key);
      console.log('[SlashCommand] node:', node?.type, 'text:', node && (node as any).text);

      if (!node || node.type !== 'text') {
        closeMenu();
        return;
      }

      const text = (node as any).text as string;
      const offset = selection.anchor.offset;

      const slashIndex = text.lastIndexOf('/', offset);
      console.log('[SlashCommand] text:', JSON.stringify(text), 'offset:', offset, 'slashIndex:', slashIndex);

      if (slashIndex === -1 || slashIndex > offset) {
        closeMenu();
        return;
      }

      const charBeforeSlash = slashIndex > 0 ? text[slashIndex - 1] : '';
      console.log('[SlashCommand] charBeforeSlash:', JSON.stringify(charBeforeSlash));

      if (charBeforeSlash && charBeforeSlash !== ' ' && charBeforeSlash !== '\n') {
        closeMenu();
        return;
      }

      const query = text.slice(slashIndex + 1, offset);
      console.log('[SlashCommand] query:', JSON.stringify(query));

      if (query.includes(' ')) {
        closeMenu();
        return;
      }

      triggerNodeKey.current = node.key;
      setQueryString(query);
      setSelectedIndex(0);

      const domSelection = window.getSelection();
      if (domSelection && domSelection.rangeCount > 0) {
        const range = domSelection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        console.log('[SlashCommand] Opening menu at:', rect.bottom, rect.left);
        setPosition({
          top: rect.bottom + window.scrollY + 8,
          left: rect.left + window.scrollX,
        });
        setIsOpen(true);
      }
    };

    const unsubscribe = editor.core?.subscribe(() => {
      checkForSlashTrigger();
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          e.stopPropagation();
          setSelectedIndex((prev) => (prev + 1) % filteredOptions.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          e.stopPropagation();
          setSelectedIndex((prev) => (prev - 1 + filteredOptions.length) % filteredOptions.length);
          break;
        case 'Enter':
          e.preventDefault();
          e.stopPropagation();
          if (filteredOptions[selectedIndex]) {
            selectOption(filteredOptions[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          e.stopPropagation();
          closeMenu();
          break;
        case 'Tab':
          e.preventDefault();
          e.stopPropagation();
          if (filteredOptions[selectedIndex]) {
            selectOption(filteredOptions[selectedIndex]);
          }
          break;
      }
    };

    // Use capture phase to handle keys before EditorCore
    container.addEventListener('keydown', handleKeyDown, true);

    return () => {
      unsubscribe?.();
      container.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [editor, isOpen, filteredOptions, selectedIndex, selectOption, closeMenu]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, closeMenu]);

  return (
    <>
      {/* File input always rendered so it persists after menu closes */}
      <input
        ref={fileInputRef}
        type="file"
        style={{ display: 'none' }}
        onChange={onFileSelected}
      />
      {isOpen && position && filteredOptions.length > 0 && createPortal(
        <div
          ref={menuRef}
          style={{
            position: 'absolute',
            top: position.top,
            left: position.left,
            zIndex: 9999,
          }}
        >
          <CommandMenu
            options={filteredOptions}
            selectedIndex={selectedIndex}
            onSelectOption={selectOption}
            onHoverOption={setSelectedIndex}
            queryString={queryString}
          />
        </div>,
        document.body
      )}
    </>
  );
}
