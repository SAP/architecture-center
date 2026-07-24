import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useEditor } from '../../hooks/useEditor';
import { useAuth } from '@site/src/context/AuthContext';
import { usePageDataStore } from '@site/src/store/pageDataStore';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { getApiService } from '@site/src/services/api';
import {
  ChevronDown, Underline, Bold, Italic, Strikethrough, Code, Quote, List,
  ListOrdered, Undo, Redo, Heading1, Heading2, Heading3, Heading4,
  Info, Lightbulb, AlertTriangle, AlertCircle, StickyNote, Type,
  Image, PenTool, FileText, Table
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

const blockTypeToBlockName: Record<string, string> = {
  h1: 'Heading 1',
  h2: 'Heading 2',
  h3: 'Heading 3',
  h4: 'Heading 4',
  paragraph: 'Paragraph',
  quote: 'Quote',
  code: 'Code',
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

  const formatHeading = (level: 2 | 3 | 4) => {
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

  const formatCode = () => {
    editor.dispatchCommand({ type: 'SET_BLOCK_TYPE', payload: { blockType: 'code' } });
    setShowDropDown(false);
  };

  return (
    <div className={styles.dropdown} ref={dropDownRef}>
      <button className={styles.dropdownToggle} onClick={() => setShowDropDown((v) => !v)} title="Block type">
        <Type size={16} />
        <span className={styles.dropdownLabel}>{blockTypeToBlockName[blockType] || 'Paragraph'}</span>
        <ChevronDown size={14} />
      </button>
      {showDropDown && (
        <div className={styles.dropdownMenu}>
          <button className={styles.dropdownItem} onClick={formatParagraph}>
            <Type size={16} /> Paragraph
          </button>
          <button className={`${styles.dropdownItem} ${styles.disabled}`} disabled title="Reserved for title only">
            <Heading1 size={16} /> Heading 1
          </button>
          <button className={styles.dropdownItem} onClick={() => formatHeading(2)}>
            <Heading2 size={16} /> Heading 2
          </button>
          <button className={styles.dropdownItem} onClick={() => formatHeading(3)}>
            <Heading3 size={16} /> Heading 3
          </button>
          <button className={styles.dropdownItem} onClick={() => formatHeading(4)}>
            <Heading4 size={16} /> Heading 4
          </button>
          <button className={styles.dropdownItem} onClick={formatQuote}>
            <Quote size={16} /> Quote
          </button>
          <button className={styles.dropdownItem} onClick={formatCode}>
            <Code size={16} /> Code Block
          </button>
        </div>
      )}
    </div>
  );
}

function InsertDropDown({ onInsertImage, onInsertDrawio, onInsertDocx }: {
  onInsertImage: () => void;
  onInsertDrawio: () => void;
  onInsertDocx: () => void;
}) {
  const dropDownRef = useRef<HTMLDivElement>(null);
  const [showDropDown, setShowDropDown] = useState(false);
  const editor = useEditor();

  useClickOutside(dropDownRef, () => setShowDropDown(false));

  const insertTable = () => {
    editor.dispatchCommand({ type: 'INSERT_TABLE', payload: { rows: 3, cols: 3 } });
    setShowDropDown(false);
  };

  return (
    <div className={styles.dropdown} ref={dropDownRef}>
      <button className={styles.dropdownToggle} onClick={() => setShowDropDown((v) => !v)} title="Insert">
        <Image size={16} />
        <span className={styles.dropdownLabel}>Insert</span>
        <ChevronDown size={14} />
      </button>
      {showDropDown && (
        <div className={styles.dropdownMenu}>
          <div className={styles.dropdownSection}>Media</div>
          <button className={styles.dropdownItem} onClick={() => { onInsertImage(); setShowDropDown(false); }}>
            <Image size={16} /> Image
          </button>
          <button className={styles.dropdownItem} onClick={() => { onInsertDrawio(); setShowDropDown(false); }}>
            <PenTool size={16} /> Diagram
          </button>
          <button className={styles.dropdownItem} onClick={() => { onInsertDocx(); setShowDropDown(false); }}>
            <FileText size={16} /> Word Document
          </button>
          <div className={styles.dropdownSection}>Advanced</div>
          <button className={styles.dropdownItem} onClick={insertTable}>
            <Table size={16} /> Table
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
      <button className={styles.dropdownToggle} onClick={() => setShowDropDown((v) => !v)} title="Callouts">
        <Info size={16} />
        <span className={styles.dropdownLabel}>Callout</span>
        <ChevronDown size={14} />
      </button>
      {showDropDown && (
        <div className={styles.dropdownMenu}>
          <button className={styles.dropdownItem} onClick={() => insertAdmonition('note')}>
            <StickyNote size={16} /> Note
          </button>
          <button className={styles.dropdownItem} onClick={() => insertAdmonition('info')}>
            <Info size={16} /> Info
          </button>
          <button className={styles.dropdownItem} onClick={() => insertAdmonition('tip')}>
            <Lightbulb size={16} /> Tip
          </button>
          <button className={styles.dropdownItem} onClick={() => insertAdmonition('warning')}>
            <AlertTriangle size={16} /> Warning
          </button>
          <button className={styles.dropdownItem} onClick={() => insertAdmonition('danger')}>
            <AlertCircle size={16} /> Danger
          </button>
        </div>
      )}
    </div>
  );
}

export default function ToolbarPlugin() {
  const editor = useEditor();
  const { token } = useAuth();
  const { getActiveDocument } = usePageDataStore();
  const { siteConfig } = useDocusaurusContext();
  const backendUrl = siteConfig.customFields?.expressBackendUrl as string | undefined;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingFileType = useRef<'image' | 'drawio' | 'docx' | null>(null);

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
    const unsubscribe = editor.core?.subscribe(() => updateToolbar());
    document.addEventListener('selectionchange', updateToolbar);
    return () => {
      unsubscribe?.();
      document.removeEventListener('selectionchange', updateToolbar);
    };
  }, [editor, updateToolbar]);

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
      switch (type) {
        case 'image': {
          editor.dispatchCommand({
            type: 'INSERT_IMAGE',
            payload: { src: '', alt: file.name, assetId: undefined }
          });

          const dataUrl = await readFileAsDataURL(file);
          let assetId: string | undefined;

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
            type: 'UPDATE_IMAGE',
            payload: { src: dataUrl, alt: file.name, assetId }
          });
          break;
        }
        case 'drawio': {
          if (!file.name.toLowerCase().endsWith('.drawio') && !file.name.toLowerCase().endsWith('.xml')) {
            alert('Please select a valid .drawio file');
            return;
          }

          editor.dispatchCommand({
            type: 'INSERT_DRAWIO',
            payload: { diagramXML: '', assetId: undefined }
          });

          const xml = await readFileAsText(file);
          let assetId: string | undefined;

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
            type: 'UPDATE_DRAWIO',
            payload: { diagramXML: xml, assetId }
          });
          break;
        }
        case 'docx': {
          const mammoth = await import('mammoth');
          const arrayBuffer = await file.arrayBuffer();
          const result = await mammoth.convertToHtml({ arrayBuffer });
          const html = result.value;

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
    }

    e.target.value = '';
    pendingFileType.current = null;
  }, [editor, backendUrl, token, getActiveDocument]);

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        style={{ display: 'none' }}
        onChange={onFileSelected}
      />
      <div className={styles.toolbar}>
        <button
          disabled={!state.canUndo}
          onClick={() => editor.dispatchCommand({ type: 'UNDO' })}
          className={styles.button}
          title="Undo"
        >
          <Undo size={16} />
        </button>
        <button
          disabled={!state.canRedo}
          onClick={() => editor.dispatchCommand({ type: 'REDO' })}
          className={styles.button}
          title="Redo"
        >
          <Redo size={16} />
        </button>

        <BlockFormatDropDown />

        <button
          onClick={() => editor.dispatchCommand({ type: 'FORMAT_TEXT', payload: { format: 'bold' } })}
          className={`${styles.button} ${state.isBold ? styles.active : ''}`}
          title="Bold"
        >
          <Bold size={16} />
        </button>
        <button
          onClick={() => editor.dispatchCommand({ type: 'FORMAT_TEXT', payload: { format: 'italic' } })}
          className={`${styles.button} ${state.isItalic ? styles.active : ''}`}
          title="Italic"
        >
          <Italic size={16} />
        </button>
        <button
          onClick={() => editor.dispatchCommand({ type: 'FORMAT_TEXT', payload: { format: 'underline' } })}
          className={`${styles.button} ${state.isUnderline ? styles.active : ''}`}
          title="Underline"
        >
          <Underline size={16} />
        </button>
        <button
          onClick={() => editor.dispatchCommand({ type: 'FORMAT_TEXT', payload: { format: 'strikethrough' } })}
          className={`${styles.button} ${state.isStrikethrough ? styles.active : ''}`}
          title="Strikethrough"
        >
          <Strikethrough size={16} />
        </button>
        <button
          onClick={() => editor.dispatchCommand({ type: 'FORMAT_TEXT', payload: { format: 'code' } })}
          className={`${styles.button} ${state.isCode ? styles.active : ''}`}
          title="Inline Code"
        >
          <Code size={16} />
        </button>

        <button
          onClick={() => editor.dispatchCommand({ type: 'TOGGLE_LIST', payload: { listType: 'bullet' } })}
          className={styles.button}
          title="Bullet List"
        >
          <List size={16} />
        </button>
        <button
          onClick={() => editor.dispatchCommand({ type: 'TOGGLE_LIST', payload: { listType: 'number' } })}
          className={styles.button}
          title="Numbered List"
        >
          <ListOrdered size={16} />
        </button>

        <InsertDropDown
          onInsertImage={() => handleFileUpload('image')}
          onInsertDrawio={() => handleFileUpload('drawio')}
          onInsertDocx={() => handleFileUpload('docx')}
        />

        <AdmonitionDropDown />
      </div>
    </>
  );
}
