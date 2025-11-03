import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
    $getSelection,
    $isRangeSelection,
    FORMAT_TEXT_COMMAND,
    SELECTION_CHANGE_COMMAND,
    $createParagraphNode,
} from 'lexical';
import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import { $wrapNodes, $isAtNodeEnd } from '@lexical/selection';
import { $isHeadingNode, $createHeadingNode, HeadingTagType } from '@lexical/rich-text';
import { mergeRegister } from '@lexical/utils';
import { createPortal } from 'react-dom';
import { ChevronDown, Underline, Link2, Bold, Italic, Type } from 'lucide-react';
import styles from './index.module.css';

const LowPriority = 1;

const blockTypeToBlockName = {
    h1: 'Heading 1',
    h2: 'Heading 2',
    h3: 'Heading 3',
    paragraph: 'Paragraph',
};

function getSelectedNode(selection) {
    const anchor = selection.anchor;
    const anchorNode = selection.anchor.getNode();
    const focusNode = selection.focus.getNode();
    if (anchorNode === focusNode) return anchorNode;
    return $isAtNodeEnd(anchor) ? anchorNode : anchorNode.getParent();
}

function BlockOptionsDropdown({ editor, blockType }: { editor: any; blockType: keyof typeof blockTypeToBlockName }) {
    const [showDropDown, setShowDropDown] = useState(false);
    const dropDownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropDownRef.current && !dropDownRef.current.contains(event.target as Node)) {
                setShowDropDown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const formatParagraph = () => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) $wrapNodes(selection, () => $createParagraphNode());
        });
        setShowDropDown(false);
    };

    const formatHeading = (headingSize: 'h1' | 'h2' | 'h3') => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) $wrapNodes(selection, () => $createHeadingNode(headingSize));
        });
        setShowDropDown(false);
    };

    return (
        <div className={styles.dropdown} ref={dropDownRef}>
            <button className={styles.dropdownToggle} onClick={() => setShowDropDown(!showDropDown)}>
                {blockTypeToBlockName[blockType] || 'Paragraph'}
                <ChevronDown size={16} />
            </button>
            {showDropDown && (
                <div className={styles.dropdownMenu}>
                    <button className={styles.dropdownItem} onClick={formatParagraph}>
                        <Type size={16} /> Paragraph
                    </button>
                    <button className={styles.dropdownItem} onClick={() => formatHeading('h1')}>
                        <span className={styles.h1}>H1</span> Heading 1
                    </button>
                    <button className={styles.dropdownItem} onClick={() => formatHeading('h2')}>
                        <span className={styles.h2}>H2</span> Heading 2
                    </button>
                    <button className={styles.dropdownItem} onClick={() => formatHeading('h3')}>
                        <span className={styles.h3}>H3</span> Heading 3
                    </button>
                </div>
            )}
        </div>
    );
}

function FloatingLinkEditor({ editor, onClose }: { editor: any; onClose: () => void }) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [linkUrl, setLinkUrl] = useState('');
    const [isEdit, setIsEdit] = useState(false);

    useEffect(() => {
        editor.getEditorState().read(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                const node = getSelectedNode(selection);
                const parent = node.getParent();
                if ($isLinkNode(parent)) {
                    setLinkUrl(parent.getURL());
                    setIsEdit(true);
                } else if ($isLinkNode(node)) {
                    setLinkUrl(node.getURL());
                    setIsEdit(true);
                }
            }
        });
        setTimeout(() => inputRef.current?.focus(), 0);
    }, [editor]);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            if (linkUrl.trim() !== '') {
                editor.dispatchCommand(TOGGLE_LINK_COMMAND, linkUrl);
            }
            onClose();
        } else if (event.key === 'Escape') {
            event.preventDefault();
            onClose();
        }
    };

    return (
        <div className={styles.linkEditor}>
            <input
                ref={inputRef}
                className={styles.linkInput}
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="https://example.com"
            />
            {isEdit && (
                <button
                    className={styles.linkTrash}
                    onClick={() => {
                        editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
                        onClose();
                    }}
                >
                    &#x1F5D1;
                </button>
            )}
        </div>
    );
}

function FloatingToolbarInternal() {
    const [editor] = useLexicalComposerContext();
    const toolbarRef = useRef<HTMLDivElement>(null);
    const [isLinkEditMode, setIsLinkEditMode] = useState(false);

    const [blockType, setBlockType] = useState<keyof typeof blockTypeToBlockName>('paragraph');
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [isUnderline, setIsUnderline] = useState(false);
    const [isLink, setIsLink] = useState(false);

    const updateToolbar = useCallback(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
            const node = getSelectedNode(selection);
            const parent = node.getParent();
            const headingNode = $isHeadingNode(parent) ? parent : $isHeadingNode(node) ? node : null;
            if (headingNode) {
                const tag = headingNode.getTag();
                if (tag === 'h1' || tag === 'h2' || tag === 'h3') {
                    setBlockType(tag);
                } else {
                    setBlockType('paragraph');
                }
            } else {
                setBlockType('paragraph');
            }
            setIsBold(selection.hasFormat('bold'));
            setIsItalic(selection.hasFormat('italic'));
            setIsUnderline(selection.hasFormat('underline'));
            setIsLink($isLinkNode(parent) || $isLinkNode(node));
        }
    }, []);

    useEffect(() => {
        const toolbar = toolbarRef.current;
        if (!toolbar) return;

        // FIX: This is the new, more stable positioning logic
        const positionToolbar = () => {
            const domSelection = window.getSelection();
            if (!domSelection || domSelection.rangeCount === 0) return;

            const domRange = domSelection.getRangeAt(0);
            const rect = domRange.getBoundingClientRect();

            // Add scrollY to account for page scrolling
            const top = window.scrollY + rect.top - toolbar.offsetHeight - 5;
            // Align to the start of the selection, not the center
            const left = window.scrollX + rect.left;

            toolbar.style.opacity = '1';
            toolbar.style.top = `${top}px`;
            toolbar.style.left = `${left}px`;
        };

        const hideToolbar = () => {
            toolbar.style.opacity = '0';
            toolbar.style.top = '-1000px';
            toolbar.style.left = '-1000px';
            setIsLinkEditMode(false);
        };

        return mergeRegister(
            editor.registerUpdateListener(({ editorState }) => {
                editorState.read(() => updateToolbar());
            }),
            editor.registerCommand(
                SELECTION_CHANGE_COMMAND,
                () => {
                    const selection = $getSelection();
                    if ($isRangeSelection(selection) && !selection.isCollapsed()) {
                        positionToolbar();
                    } else if (!isLinkEditMode) {
                        hideToolbar();
                    }
                    return false;
                },
                LowPriority
            )
        );
    }, [editor, updateToolbar, isLinkEditMode]);

    return (
        <div ref={toolbarRef} className={styles.floatingToolbar}>
            {isLinkEditMode ? (
                <FloatingLinkEditor editor={editor} onClose={() => setIsLinkEditMode(false)} />
            ) : (
                <>
                    <BlockOptionsDropdown editor={editor} blockType={blockType} />
                    <div className={styles.divider} />
                    <div className={styles.group}>
                        <button
                            onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
                            className={`${styles.button} ${isBold ? styles.active : ''}`}
                        >
                            <Bold size={16} />
                        </button>
                        <button
                            onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
                            className={`${styles.button} ${isItalic ? styles.active : ''}`}
                        >
                            <Italic size={16} />
                        </button>
                        <button
                            onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
                            className={`${styles.button} ${isUnderline ? styles.active : ''}`}
                        >
                            <Underline size={16} />
                        </button>
                    </div>
                    <div className={styles.divider} />
                    <div className={styles.group}>
                        <button
                            onClick={() => setIsLinkEditMode(true)}
                            className={`${styles.button} ${isLink ? styles.active : ''}`}
                        >
                            <Link2 size={16} />
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

export default function FloatingToolbarPlugin() {
    return createPortal(<FloatingToolbarInternal />, document.body);
}
