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
import { $setBlocksType, $isAtNodeEnd } from '@lexical/selection';
import { $isHeadingNode, $createHeadingNode, HeadingTagType } from '@lexical/rich-text';
import { $createCodeNode } from '@lexical/code';
import { ChevronDown, Underline, Link2 } from 'lucide-react';
import styles from './index.module.css';

function getSelectedNode(selection) {
    const anchor = selection.anchor;
    const focus = selection.focus;
    const anchorNode = selection.anchor.getNode();
    const focusNode = selection.focus.getNode();
    if (anchorNode === focusNode) {
        return anchorNode;
    }
    const isBackward = selection.isBackward();
    if (isBackward) {
        return $isAtNodeEnd(focus) ? anchorNode : focusNode;
    } else {
        return $isAtNodeEnd(anchor) ? focusNode : anchorNode;
    }
}

const LowPriority = 1;

const blockTypeToBlockName = {
    code: 'Code Block',
    h1: 'Heading 1',
    h2: 'Heading 2',
    h3: 'Heading 3',
    paragraph: 'Paragraph',
};

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
        if (blockType !== 'paragraph') {
            editor.update(() => {
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                    $setBlocksType(selection, () => $createParagraphNode());
                }
            });
        }
        setShowDropDown(false);
    };

    const formatHeading = (headingSize: HeadingTagType) => {
        if (blockType !== headingSize) {
            editor.update(() => {
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                    $setBlocksType(selection, () => $createHeadingNode(headingSize));
                }
            });
        }
        setShowDropDown(false);
    };

    const formatCode = () => {
        if (blockType !== 'code') {
            editor.update(() => {
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                    $setBlocksType(selection, () => $createCodeNode());
                }
            });
        }
        setShowDropDown(false);
    };

    return (
        <div className={styles.dropdownContainer} ref={dropDownRef}>
            <button className={styles.dropdownButton} onClick={() => setShowDropDown(!showDropDown)}>
                {blockTypeToBlockName[blockType] || 'Paragraph'}
                <ChevronDown size={16} className={styles.dropdownChevron} />
            </button>
            {showDropDown && (
                <div className={styles.dropdownMenu}>
                    <button className={styles.dropdownItem} onClick={formatParagraph}>
                        Paragraph
                    </button>
                    <button className={styles.dropdownItem} onClick={() => formatHeading('h1')}>
                        Heading 1
                    </button>
                    <button className={styles.dropdownItem} onClick={() => formatHeading('h2')}>
                        Heading 2
                    </button>
                    <button className={styles.dropdownItem} onClick={() => formatHeading('h3')}>
                        Heading 3
                    </button>
                    <button className={styles.dropdownItem} onClick={formatCode}>
                        Code Block
                    </button>
                </div>
            )}
        </div>
    );
}

function FloatingLinkEditor({ editor, onClose }: { editor: any; onClose: () => void }) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [linkUrl, setLinkUrl] = useState('');

    useEffect(() => {
        editor.getEditorState().read(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                const node = getSelectedNode(selection);
                const parent = node.getParent();
                if ($isLinkNode(parent)) {
                    setLinkUrl(parent.getURL());
                } else if ($isLinkNode(node)) {
                    setLinkUrl(node.getURL());
                } else {
                    setLinkUrl('https://');
                }
            }
        });
        setTimeout(() => inputRef.current?.focus(), 0);
    }, [editor]);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
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
                placeholder="Paste link or search pages"
            />
        </div>
    );
}

function FloatingToolbarContent({ onEditLink }: { onEditLink: () => void }) {
    const [editor] = useLexicalComposerContext();
    const [blockType, setBlockType] = useState<keyof typeof blockTypeToBlockName>('paragraph');
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [isUnderline, setIsUnderline] = useState(false);
    const [isLink, setIsLink] = useState(false);

    const updateToolbar = useCallback(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
            setIsBold(selection.hasFormat('bold'));
            setIsItalic(selection.hasFormat('italic'));
            setIsUnderline(selection.hasFormat('underline'));
            const anchorNode = selection.anchor.getNode();
            const element = anchorNode.getKey() === 'root' ? anchorNode : anchorNode.getTopLevelElementOrThrow();
            if ($isHeadingNode(element)) {
                const tag = element.getTag();
                if (tag in blockTypeToBlockName) {
                    setBlockType(tag as keyof typeof blockTypeToBlockName);
                } else {
                    setBlockType('paragraph');
                }
            } else {
                const type = element.getType();
                if (type in blockTypeToBlockName) {
                    setBlockType(type as keyof typeof blockTypeToBlockName);
                } else {
                    setBlockType('paragraph');
                }
            }
            const node = getSelectedNode(selection);
            const parent = node.getParent();
            setIsLink($isLinkNode(parent) || $isLinkNode(node));
        }
    }, []);

    useEffect(() => {
        return editor.registerUpdateListener(({ editorState }) => {
            editorState.read(() => {
                updateToolbar();
            });
        });
    }, [editor, updateToolbar]);

    const insertLink = useCallback(() => {
        if (!isLink) {
            onEditLink();
        } else {
            editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
        }
    }, [editor, isLink, onEditLink]);

    return (
        <div className={styles.toolbarContent}>
            <BlockOptionsDropdown editor={editor} blockType={blockType} />
            <div className={styles.divider} />
            <div className={styles.toolbarButtonGroup}>
                <button
                    onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
                    className={`${styles.toolbarButton} ${isBold ? styles.active : ''}`}
                >
                    <span className={styles.textBold}>B</span>
                </button>
                <button
                    onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
                    className={`${styles.toolbarButton} ${isItalic ? styles.active : ''}`}
                >
                    <span className={styles.textItalic}>I</span>
                </button>
                <button
                    onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
                    className={`${styles.toolbarButton} ${isUnderline ? styles.active : ''}`}
                >
                    <Underline size={18} />
                </button>
            </div>
            <div className={styles.divider} />
            <div className={styles.toolbarButtonGroup}>
                <button onClick={insertLink} className={`${styles.toolbarButton} ${isLink ? styles.active : ''}`}>
                    <Link2 size={18} />
                    <ChevronDown size={16} className={styles.dropdownChevronSmall} />
                </button>
            </div>
        </div>
    );
}

export default function ToolbarPlugin() {
    const [editor] = useLexicalComposerContext();
    const toolbarRef = useRef<HTMLDivElement>(null);
    const [isLinkEditMode, setIsLinkEditMode] = useState(false);

    const updateToolbarLocation = useCallback(() => {
        const toolbarElement = toolbarRef.current;
        if (!toolbarElement) {
            return;
        }

        const selection = $getSelection();
        const nativeSelection = window.getSelection();
        const rootElement = editor.getRootElement();

        if (
            selection !== null &&
            nativeSelection !== null &&
            !nativeSelection.isCollapsed &&
            rootElement &&
            rootElement.contains(nativeSelection.anchorNode)
        ) {
            const domRange = nativeSelection.getRangeAt(0);
            const selectionRect = domRange.getBoundingClientRect();
            const positioningContainer = toolbarElement.offsetParent;

            if (!positioningContainer) {
                return;
            }
            const containerRect = positioningContainer.getBoundingClientRect();

            const relativeTop = selectionRect.top - containerRect.top;
            const relativeLeft = selectionRect.left - containerRect.left;

            const top = relativeTop - toolbarElement.offsetHeight - 5;
            const left = relativeLeft;

            toolbarElement.style.opacity = '1';
            toolbarElement.style.top = `${top}px`;
            toolbarElement.style.left = `${left}px`;
        } else {
            toolbarElement.style.opacity = '0';
            toolbarElement.style.top = '-1000px';
        }
    }, [editor]);

    useEffect(() => {
        editor.getEditorState().read(() => {
            updateToolbarLocation();
        });
    }, [isLinkEditMode, editor, updateToolbarLocation]);

    useEffect(() => {
        const unregister = editor.registerUpdateListener(({ editorState }) => {
            editorState.read(() => {
                updateToolbarLocation();
            });
        });
        return unregister;
    }, [editor, updateToolbarLocation]);

    useEffect(() => {
        const onSelectionChange = () => {
            const selection = $getSelection();
            if (isLinkEditMode && (!$isRangeSelection(selection) || selection.isCollapsed())) {
                setIsLinkEditMode(false);
            }
            return false;
        };
        return editor.registerCommand(SELECTION_CHANGE_COMMAND, onSelectionChange, LowPriority);
    }, [editor, isLinkEditMode]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (toolbarRef.current && !toolbarRef.current.contains(event.target as Node)) {
                setIsLinkEditMode(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={toolbarRef} className={styles.floatingToolbarContainer}>
            <FloatingToolbarContent
                onEditLink={() => {
                    setIsLinkEditMode(true);
                }}
            />
            {isLinkEditMode && (
                <div className={styles.linkEditorPositioner}>
                    <FloatingLinkEditor
                        editor={editor}
                        onClose={() => {
                            setIsLinkEditMode(false);
                        }}
                    />
                </div>
            )}
        </div>
    );
}
