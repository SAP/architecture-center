import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useEditor } from '../../hooks/useEditor';
import { Globe, Copy, Pencil, Trash2 } from 'lucide-react';
import styles from './index.module.css';

interface LinkInfo {
  url: string;
  text: string;
  nodeKey: string;
  textNodeKey: string;
  rect: DOMRect;
}

interface EditModalProps {
  linkInfo: LinkInfo;
  onSave: (url: string, text: string) => void;
  onRemove: () => void;
  onClose: () => void;
}

function EditModal({ linkInfo, onSave, onRemove, onClose }: EditModalProps) {
  const [url, setUrl] = useState(linkInfo.url);
  const [text, setText] = useState(linkInfo.text);
  const modalRef = useRef<HTMLDivElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    urlInputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const handleSave = () => {
    onSave(url, text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <div
      ref={modalRef}
      className={styles.editModal}
      style={{
        top: linkInfo.rect.bottom + window.scrollY + 8,
        left: linkInfo.rect.left + window.scrollX,
      }}
    >
      <div className={styles.editField}>
        <label className={styles.editLabel}>Page or URL</label>
        <input
          ref={urlInputRef}
          type="text"
          className={styles.editInput}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="https://"
        />
      </div>
      <div className={styles.editField}>
        <label className={styles.editLabel}>Link title</label>
        <input
          type="text"
          className={styles.editInput}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Link text"
        />
      </div>
      <button className={styles.removeButton} onClick={onRemove}>
        <Trash2 size={16} />
        <span>Remove link</span>
      </button>
    </div>
  );
}

export default function LinkPreviewPlugin() {
  const editor = useEditor();
  const [hoveredLink, setHoveredLink] = useState<LinkInfo | null>(null);
  const [editingLink, setEditingLink] = useState<LinkInfo | null>(null);
  const [isHoveringPreview, setIsHoveringPreview] = useState(false);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const findLinkInfo = useCallback((linkElement: HTMLElement): LinkInfo | null => {
    const nodeKey = linkElement.getAttribute('data-editor-key');
    if (!nodeKey || !editor.state) return null;

    const linkNode = editor.state.nodeMap.get(nodeKey);
    if (!linkNode || linkNode.type !== 'link') return null;

    const url = (linkNode as any).url || '';
    const children = (linkNode as any).children || [];

    // Get text from first text child
    let text = '';
    if (children.length > 0) {
      const textNode = editor.state.nodeMap.get(children[0]);
      if (textNode && textNode.type === 'text') {
        text = (textNode as any).text || '';
      }
    }

    const rect = linkElement.getBoundingClientRect();

    return {
      url,
      text,
      nodeKey,
      textNodeKey: children[0] || '',
      rect,
    };
  }, [editor.state]);

  const handleMouseOver = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const linkElement = target.closest('a.editorLink') as HTMLElement;

    if (linkElement) {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }

      const linkInfo = findLinkInfo(linkElement);
      if (linkInfo) {
        setHoveredLink(linkInfo);
      }
    }
  }, [findLinkInfo]);

  const handleMouseOut = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const linkElement = target.closest('a.editorLink');

    if (linkElement && !isHoveringPreview) {
      hideTimeoutRef.current = setTimeout(() => {
        setHoveredLink(null);
      }, 200);
    }
  }, [isHoveringPreview]);

  const handleCopyUrl = useCallback(() => {
    if (hoveredLink) {
      navigator.clipboard.writeText(hoveredLink.url);
    }
  }, [hoveredLink]);

  const handleEdit = useCallback(() => {
    if (hoveredLink) {
      setEditingLink(hoveredLink);
      setHoveredLink(null);
    }
  }, [hoveredLink]);

  const handleSaveEdit = useCallback((newUrl: string, newText: string) => {
    if (!editingLink || !editor.core) return;

    // Update link URL
    editor.dispatchCommand({
      type: 'UPDATE_LINK',
      payload: {
        nodeKey: editingLink.nodeKey,
        textNodeKey: editingLink.textNodeKey,
        url: newUrl,
        text: newText,
      },
    });

    setEditingLink(null);
  }, [editingLink, editor]);

  const handleRemoveLink = useCallback(() => {
    if (!editingLink || !editor.core) return;

    editor.dispatchCommand({
      type: 'REMOVE_LINK',
      payload: {
        nodeKey: editingLink.nodeKey,
      },
    });

    setEditingLink(null);
  }, [editingLink, editor]);

  const handleCloseEdit = useCallback(() => {
    setEditingLink(null);
  }, []);

  useEffect(() => {
    const container = editor.core?.getContainer();
    if (!container) return;

    container.addEventListener('mouseover', handleMouseOver);
    container.addEventListener('mouseout', handleMouseOut);

    return () => {
      container.removeEventListener('mouseover', handleMouseOver);
      container.removeEventListener('mouseout', handleMouseOut);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [editor, handleMouseOver, handleMouseOut]);

  // Prevent link click from navigating
  useEffect(() => {
    const container = editor.core?.getContainer();
    if (!container) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const linkElement = target.closest('a.editorLink');
      if (linkElement) {
        e.preventDefault();
      }
    };

    container.addEventListener('click', handleClick);
    return () => container.removeEventListener('click', handleClick);
  }, [editor]);

  return (
    <>
      {hoveredLink && !editingLink && createPortal(
        <div
          className={styles.linkPreview}
          style={{
            top: hoveredLink.rect.bottom + window.scrollY + 4,
            left: hoveredLink.rect.left + window.scrollX,
          }}
          onMouseEnter={() => {
            setIsHoveringPreview(true);
            if (hideTimeoutRef.current) {
              clearTimeout(hideTimeoutRef.current);
              hideTimeoutRef.current = null;
            }
          }}
          onMouseLeave={() => {
            setIsHoveringPreview(false);
            hideTimeoutRef.current = setTimeout(() => {
              setHoveredLink(null);
            }, 200);
          }}
        >
          <Globe size={16} className={styles.globeIcon} />
          <span className={styles.linkUrl}>{hoveredLink.url}</span>
          <button
            className={styles.previewButton}
            onClick={handleCopyUrl}
            title="Copy URL"
          >
            <Copy size={14} />
          </button>
          <button
            className={styles.previewButton}
            onClick={handleEdit}
            title="Edit link"
          >
            <Pencil size={14} />
            <span>Edit</span>
          </button>
        </div>,
        document.body
      )}

      {editingLink && createPortal(
        <EditModal
          linkInfo={editingLink}
          onSave={handleSaveEdit}
          onRemove={handleRemoveLink}
          onClose={handleCloseEdit}
        />,
        document.body
      )}
    </>
  );
}
