import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
    $getSelection,
    $isRangeSelection,
    FORMAT_TEXT_COMMAND,
    SELECTION_CHANGE_COMMAND,
    $createParagraphNode,
    FORMAT_ELEMENT_COMMAND,
    UNDO_COMMAND,
    REDO_COMMAND,
    CAN_UNDO_COMMAND,
    CAN_REDO_COMMAND,
    COMMAND_PRIORITY_CRITICAL,
    INDENT_CONTENT_COMMAND,
    OUTDENT_CONTENT_COMMAND,
} from 'lexical';
import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import { $setBlocksType, $isAtNodeEnd, $getSelectionStyleValueForProperty, $patchStyleText } from '@lexical/selection';
import { $isHeadingNode, $createHeadingNode, HeadingTagType, $createQuoteNode } from '@lexical/rich-text';
import { $createCodeNode } from '@lexical/code';
import {
    INSERT_UNORDERED_LIST_COMMAND,
    INSERT_ORDERED_LIST_COMMAND,
    REMOVE_LIST_COMMAND,
    $isListNode,
} from '@lexical/list';
import {
    ChevronDown,
    Underline,
    Link2,
    Bold,
    Italic,
    Strikethrough,
    Code,
    Quote,
    List,
    ListOrdered,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    Indent,
    Outdent,
    Undo,
    Redo,
    Palette,
    Type,
    Plus,
    Image as ImageIcon,
    LayoutDashboard,
    Paperclip,
} from 'lucide-react';
import { TOGGLE_IMAGE_DIALOG, OPEN_DRAWIO_DIALOG } from '../commands';
import { fileUploadCommand } from '../fileUploadCommand';
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
                        <Type size={16} style={{ marginRight: '8px' }} />
                        Paragraph
                    </button>
                    <button className={styles.dropdownItem} onClick={() => formatHeading('h1')}>
                        <span style={{ marginRight: '8px', fontSize: '16px', fontWeight: 'bold' }}>H1</span>
                        Heading 1
                    </button>
                    <button className={styles.dropdownItem} onClick={() => formatHeading('h2')}>
                        <span style={{ marginRight: '8px', fontSize: '14px', fontWeight: 'bold' }}>H2</span>
                        Heading 2
                    </button>
                    <button className={styles.dropdownItem} onClick={() => formatHeading('h3')}>
                        <span style={{ marginRight: '8px', fontSize: '12px', fontWeight: 'bold' }}>H3</span>
                        Heading 3
                    </button>
                    <button className={styles.dropdownItem} onClick={formatCode}>
                        <Code size={16} style={{ marginRight: '8px' }} />
                        Code Block
                    </button>
                </div>
            )}
        </div>
    );
}

function InsertDropdown({ editor }: { editor: any }) {
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

    const insertImage = () => {
        editor.dispatchCommand(TOGGLE_IMAGE_DIALOG, undefined);
        setShowDropDown(false);
    };

    const insertDrawio = () => {
        editor.dispatchCommand(OPEN_DRAWIO_DIALOG, undefined);
        setShowDropDown(false);
    };

    const insertFile = () => {
        fileUploadCommand.onSelect(editor);
        setShowDropDown(false);
    };

    return (
        <div className={styles.dropdownContainer} ref={dropDownRef}>
            <button className={styles.dropdownButton} onClick={() => setShowDropDown(!showDropDown)} title="Insert">
                <Plus size={16} />
                Insert
                <ChevronDown size={16} className={styles.dropdownChevron} />
            </button>
            {showDropDown && (
                <div className={styles.dropdownMenu}>
                    <button className={styles.dropdownItem} onClick={insertImage}>
                        <ImageIcon size={16} style={{ marginRight: '8px' }} />
                        Image
                    </button>
                    <button className={styles.dropdownItem} onClick={insertDrawio}>
                        <LayoutDashboard size={16} style={{ marginRight: '8px' }} />
                        Draw.io Diagram
                    </button>
                    <button className={styles.dropdownItem} onClick={insertFile}>
                        <Paperclip size={16} style={{ marginRight: '8px' }} />
                        File
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

function ComprehensiveToolbarContent({ onEditLink, mode }: { onEditLink: () => void; mode: string }) {
    const [editor] = useLexicalComposerContext();
    const [blockType, setBlockType] = useState<keyof typeof blockTypeToBlockName>('paragraph');
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [isUnderline, setIsUnderline] = useState(false);
    const [isStrikethrough, setIsStrikethrough] = useState(false);
    const [isCode, setIsCode] = useState(false);
    const [isLink, setIsLink] = useState(false);
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);
    const [fontColor, setFontColor] = useState('#000000');
    const [bgColor, setBgColor] = useState('#ffffff');

    const updateToolbar = useCallback(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
            setIsBold(selection.hasFormat('bold'));
            setIsItalic(selection.hasFormat('italic'));
            setIsUnderline(selection.hasFormat('underline'));
            setIsStrikethrough(selection.hasFormat('strikethrough'));
            setIsCode(selection.hasFormat('code'));

            // Get font color
            const color = $getSelectionStyleValueForProperty(selection, 'color', '#000000');
            setFontColor(color);

            // Get background color
            const backgroundColor = $getSelectionStyleValueForProperty(selection, 'background-color', '#ffffff');
            setBgColor(backgroundColor);

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

    useEffect(() => {
        const unregister = editor.registerCommand(
            CAN_UNDO_COMMAND,
            (payload) => {
                setCanUndo(payload);
                return false;
            },
            COMMAND_PRIORITY_CRITICAL
        );
        return unregister;
    }, [editor]);

    useEffect(() => {
        const unregister = editor.registerCommand(
            CAN_REDO_COMMAND,
            (payload) => {
                setCanRedo(payload);
                return false;
            },
            COMMAND_PRIORITY_CRITICAL
        );
        return unregister;
    }, [editor]);

    const insertLink = useCallback(() => {
        if (!isLink) {
            onEditLink();
        } else {
            editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
        }
    }, [editor, isLink, onEditLink]);

    const formatQuote = () => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                $setBlocksType(selection, () => $createQuoteNode());
            }
        });
    };

    const formatBulletList = () => {
        editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    };

    const formatNumberedList = () => {
        editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    };

    const applyStyleText = useCallback(
        (styles: Record<string, string>) => {
            editor.update(() => {
                const selection = $getSelection();
                if (selection !== null) {
                    $patchStyleText(selection, styles);
                }
            });
        },
        [editor]
    );

    const onFontColorSelect = useCallback(
        (value: string) => {
            applyStyleText({ color: value });
        },
        [applyStyleText]
    );

    const onBgColorSelect = useCallback(
        (value: string) => {
            applyStyleText({ 'background-color': value });
        },
        [applyStyleText]
    );

    if (mode === 'floating') {
        // Simplified floating toolbar
        return (
            <div className={styles.toolbarContent}>
                <BlockOptionsDropdown editor={editor} blockType={blockType} />
                <div className={styles.divider} />
                <div className={styles.toolbarButtonGroup}>
                    <button
                        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
                        className={`${styles.toolbarButton} ${isBold ? styles.active : ''}`}
                    >
                        <Bold size={16} />
                    </button>
                    <button
                        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
                        className={`${styles.toolbarButton} ${isItalic ? styles.active : ''}`}
                    >
                        <Italic size={16} />
                    </button>
                    <button
                        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
                        className={`${styles.toolbarButton} ${isUnderline ? styles.active : ''}`}
                    >
                        <Underline size={16} />
                    </button>
                </div>
                <div className={styles.divider} />
                <div className={styles.toolbarButtonGroup}>
                    <button onClick={insertLink} className={`${styles.toolbarButton} ${isLink ? styles.active : ''}`}>
                        <Link2 size={16} />
                    </button>
                </div>
            </div>
        );
    }

    // Comprehensive fixed toolbar
    return (
        <div className={styles.toolbarContent}>
            {/* Undo/Redo */}
            <div className={styles.toolbarButtonGroup}>
                <button
                    disabled={!canUndo}
                    onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
                    className={`${styles.toolbarButton} ${!canUndo ? styles.disabled : ''}`}
                    title="Undo"
                >
                    <Undo size={16} />
                </button>
                <button
                    disabled={!canRedo}
                    onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
                    className={`${styles.toolbarButton} ${!canRedo ? styles.disabled : ''}`}
                    title="Redo"
                >
                    <Redo size={16} />
                </button>
            </div>
            <div className={styles.divider} />

            {/* Block Type */}
            <BlockOptionsDropdown editor={editor} blockType={blockType} />
            <div className={styles.divider} />

            {/* Text Formatting */}
            <div className={styles.toolbarButtonGroup}>
                <button
                    onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
                    className={`${styles.toolbarButton} ${isBold ? styles.active : ''}`}
                    title="Bold"
                >
                    <Bold size={16} />
                </button>
                <button
                    onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
                    className={`${styles.toolbarButton} ${isItalic ? styles.active : ''}`}
                    title="Italic"
                >
                    <Italic size={16} />
                </button>
                <button
                    onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
                    className={`${styles.toolbarButton} ${isUnderline ? styles.active : ''}`}
                    title="Underline"
                >
                    <Underline size={16} />
                </button>
                <button
                    onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')}
                    className={`${styles.toolbarButton} ${isStrikethrough ? styles.active : ''}`}
                    title="Strikethrough"
                >
                    <Strikethrough size={16} />
                </button>
                <button
                    onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code')}
                    className={`${styles.toolbarButton} ${isCode ? styles.active : ''}`}
                    title="Code"
                >
                    <Code size={16} />
                </button>
            </div>
            <div className={styles.divider} />

            {/* Link */}
            <div className={styles.toolbarButtonGroup}>
                <button
                    onClick={insertLink}
                    className={`${styles.toolbarButton} ${isLink ? styles.active : ''}`}
                    title="Insert Link"
                >
                    <Link2 size={16} />
                </button>
            </div>
            <div className={styles.divider} />

            {/* Lists and Quote */}
            <div className={styles.toolbarButtonGroup}>
                <button onClick={formatBulletList} className={styles.toolbarButton} title="Bullet List">
                    <List size={16} />
                </button>
                <button onClick={formatNumberedList} className={styles.toolbarButton} title="Numbered List">
                    <ListOrdered size={16} />
                </button>
                <button onClick={formatQuote} className={styles.toolbarButton} title="Quote">
                    <Quote size={16} />
                </button>
            </div>
            <div className={styles.divider} />

            {/* Alignment */}
            <div className={styles.toolbarButtonGroup}>
                <button
                    onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left')}
                    className={styles.toolbarButton}
                    title="Align Left"
                >
                    <AlignLeft size={16} />
                </button>
                <button
                    onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center')}
                    className={styles.toolbarButton}
                    title="Align Center"
                >
                    <AlignCenter size={16} />
                </button>
                <button
                    onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right')}
                    className={styles.toolbarButton}
                    title="Align Right"
                >
                    <AlignRight size={16} />
                </button>
                <button
                    onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify')}
                    className={styles.toolbarButton}
                    title="Justify"
                >
                    <AlignJustify size={16} />
                </button>
            </div>
            <div className={styles.divider} />

            {/* Indent/Outdent */}
            <div className={styles.toolbarButtonGroup}>
                <button
                    onClick={() => editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined)}
                    className={styles.toolbarButton}
                    title="Outdent"
                >
                    <Outdent size={16} />
                </button>
                <button
                    onClick={() => editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined)}
                    className={styles.toolbarButton}
                    title="Indent"
                >
                    <Indent size={16} />
                </button>
            </div>
            <div className={styles.divider} />

            {/* Insert Dropdown */}
            <InsertDropdown editor={editor} />
        </div>
    );
}

interface ToolbarPluginProps {
    mode?: 'floating' | 'fixed';
}

export default function ToolbarPlugin({ mode = 'floating' }: ToolbarPluginProps) {
    const [editor] = useLexicalComposerContext();
    const toolbarRef = useRef<HTMLDivElement>(null);
    const [isLinkEditMode, setIsLinkEditMode] = useState(false);

    const updateToolbarLocation = useCallback(() => {
        if (mode === 'fixed') return; // Skip positioning for fixed mode

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
    }, [editor, mode]);

    useEffect(() => {
        if (mode === 'fixed') return; // Skip for fixed mode

        editor.getEditorState().read(() => {
            updateToolbarLocation();
        });
    }, [isLinkEditMode, editor, updateToolbarLocation, mode]);

    useEffect(() => {
        if (mode === 'fixed') return; // Skip for fixed mode

        const unregister = editor.registerUpdateListener(({ editorState }) => {
            editorState.read(() => {
                updateToolbarLocation();
            });
        });
        return unregister;
    }, [editor, updateToolbarLocation, mode]);

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

    const containerClassName = mode === 'fixed' ? styles.fixedToolbarContainer : styles.floatingToolbarContainer;

    return (
        <div ref={toolbarRef} className={containerClassName}>
            <ComprehensiveToolbarContent
                mode={mode}
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
