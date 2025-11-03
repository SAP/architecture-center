import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
    $getSelection,
    $isRangeSelection,
    FORMAT_TEXT_COMMAND,
    FORMAT_ELEMENT_COMMAND,
    UNDO_COMMAND,
    REDO_COMMAND,
    SELECTION_CHANGE_COMMAND,
    COMMAND_PRIORITY_LOW,
    CAN_UNDO_COMMAND,
    CAN_REDO_COMMAND,
    INDENT_CONTENT_COMMAND,
    OUTDENT_CONTENT_COMMAND,
} from 'lexical';
import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import { $setBlocksType } from '@lexical/selection';
import { $isHeadingNode, $createQuoteNode, $createHeadingNode } from '@lexical/rich-text';
import { $isListNode, INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND } from '@lexical/list';
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
    Undo,
    Redo,
    Heading1,
    Heading2,
    Heading3,
    Indent,
    Outdent,
    Plus,
    Image as ImageIcon,
    LayoutDashboard,
    Paperclip,
} from 'lucide-react';
import { TOGGLE_IMAGE_DIALOG, OPEN_DRAWIO_DIALOG } from '../commands';
import { fileUploadCommand } from '../fileUploadCommand';
import styles from './index.module.css';

const LowPriority = 1;

const blockTypeToBlockName = {
    h1: 'Heading 1',
    h2: 'Heading 2',
    h3: 'Heading 3',
    paragraph: 'Paragraph',
    quote: 'Quote',
    ul: 'Bulleted List',
    ol: 'Numbered List',
};

function useClickOutside(ref, handler) {
    useEffect(() => {
        const listener = (event) => {
            if (!ref.current || ref.current.contains(event.target)) {
                return;
            }
            handler(event);
        };
        document.addEventListener('mousedown', listener);
        return () => document.removeEventListener('mousedown', listener);
    }, [ref, handler]);
}

function BlockFormatDropDown({ editor, blockType }) {
    const dropDownRef = useRef(null);
    const [showDropDown, setShowDropDown] = useState(false);

    useClickOutside(dropDownRef, () => setShowDropDown(false));

    const formatHeading = (level) => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                $setBlocksType(selection, () => $createHeadingNode(level));
            }
        });
        setShowDropDown(false);
    };

    const formatQuote = () => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                $setBlocksType(selection, () => $createQuoteNode());
            }
        });
        setShowDropDown(false);
    };

    return (
        <div className={styles.dropdown} ref={dropDownRef}>
            <button className={styles.dropdownToggle} onClick={() => setShowDropDown((v) => !v)}>
                {blockTypeToBlockName[blockType] || 'Paragraph'}
                <ChevronDown size={16} />
            </button>
            {showDropDown && (
                <div className={styles.dropdownMenu}>
                    <button className={styles.dropdownItem} onClick={() => formatHeading('h1')}>
                        <Heading1 size={18} />
                        <span>Heading 1</span>
                    </button>
                    <button className={styles.dropdownItem} onClick={() => formatHeading('h2')}>
                        <Heading2 size={18} />
                        <span>Heading 2</span>
                    </button>
                    <button className={styles.dropdownItem} onClick={() => formatHeading('h3')}>
                        <Heading3 size={18} />
                        <span>Heading 3</span>
                    </button>
                    <button className={styles.dropdownItem} onClick={formatQuote}>
                        <Quote size={18} />
                        <span>Quote</span>
                    </button>
                </div>
            )}
        </div>
    );
}

function InsertDropDown({ editor }) {
    const dropDownRef = useRef(null);
    const [showDropDown, setShowDropDown] = useState(false);

    useClickOutside(dropDownRef, () => setShowDropDown(false));

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
        <div className={styles.dropdown} ref={dropDownRef}>
            <button className={styles.button} onClick={() => setShowDropDown((v) => !v)}>
                <Plus size={16} />
                <span style={{ marginLeft: '4px' }}>Insert</span>
            </button>
            {showDropDown && (
                <div className={`${styles.dropdownMenu} ${styles.dropdownMenuRight}`}>
                    <button className={styles.dropdownItem} onClick={insertImage}>
                        <ImageIcon size={18} />
                        <span>Image</span>
                    </button>
                    <button className={styles.dropdownItem} onClick={insertDrawio}>
                        <LayoutDashboard size={18} />
                        <span>Draw.io Diagram</span>
                    </button>
                    <button className={styles.dropdownItem} onClick={insertFile}>
                        <Paperclip size={18} />
                        <span>File</span>
                    </button>
                </div>
            )}
        </div>
    );
}

function TextFormatButtons({ isBold, isItalic, isUnderline, isStrikethrough, isCode, isLink, onLinkClick }) {
    const [editor] = useLexicalComposerContext();
    return (
        <>
            <button
                onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
                className={`${styles.button} ${isBold ? styles.active : ''}`}
                title="Bold (Ctrl+B)"
            >
                <Bold size={16} />
            </button>
            <button
                onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
                className={`${styles.button} ${isItalic ? styles.active : ''}`}
                title="Italic (Ctrl+I)"
            >
                <Italic size={16} />
            </button>
            <button
                onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
                className={`${styles.button} ${isUnderline ? styles.active : ''}`}
                title="Underline (Ctrl+U)"
            >
                <Underline size={16} />
            </button>
            <button
                onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')}
                className={`${styles.button} ${isStrikethrough ? styles.active : ''}`}
                title="Strikethrough"
            >
                <Strikethrough size={16} />
            </button>
            <button
                onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code')}
                className={`${styles.button} ${isCode ? styles.active : ''}`}
                title="Code"
            >
                <Code size={16} />
            </button>
            <button
                onClick={onLinkClick}
                className={`${styles.button} ${isLink ? styles.active : ''}`}
                title="Insert Link"
            >
                <Link2 size={16} />
            </button>
        </>
    );
}

export default function ToolbarPlugin() {
    const [editor] = useLexicalComposerContext();
    const toolbarRef = useRef(null);
    const [blockType, setBlockType] = useState('paragraph');
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [isUnderline, setIsUnderline] = useState(false);
    const [isStrikethrough, setIsStrikethrough] = useState(false);
    const [isCode, setIsCode] = useState(false);
    const [isLink, setIsLink] = useState(false);
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);

    const updateToolbar = useCallback(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
            const anchorNode = selection.anchor.getNode();
            const element = anchorNode.getKey() === 'root' ? anchorNode : anchorNode.getTopLevelElementOrThrow();
            const elementKey = element.getKey();
            const elementDOM = editor.getElementByKey(elementKey);

            if (elementDOM !== null) {
                if ($isListNode(element)) {
                    setBlockType(element.getTag());
                } else {
                    const type = $isHeadingNode(element) ? element.getTag() : element.getType();
                    setBlockType(type);
                }
            }

            setIsBold(selection.hasFormat('bold'));
            setIsItalic(selection.hasFormat('italic'));
            setIsUnderline(selection.hasFormat('underline'));
            setIsStrikethrough(selection.hasFormat('strikethrough'));
            setIsCode(selection.hasFormat('code'));

            const node = selection.getNodes()[0];
            const parent = node.getParent();
            setIsLink($isLinkNode(parent) || $isLinkNode(node));
        }
    }, [editor]);

    useEffect(() => {
        return editor.registerCommand(
            SELECTION_CHANGE_COMMAND,
            () => {
                updateToolbar();
                return false;
            },
            COMMAND_PRIORITY_LOW
        );
    }, [editor, updateToolbar]);

    useEffect(() => {
        return editor.registerCommand(
            CAN_UNDO_COMMAND,
            (payload) => {
                setCanUndo(payload);
                return false;
            },
            COMMAND_PRIORITY_LOW
        );
    }, [editor]);

    useEffect(() => {
        return editor.registerCommand(
            CAN_REDO_COMMAND,
            (payload) => {
                setCanRedo(payload);
                return false;
            },
            COMMAND_PRIORITY_LOW
        );
    }, [editor]);

    const insertLink = useCallback(() => {
        if (!isLink) {
            editor.dispatchCommand(TOGGLE_LINK_COMMAND, 'https://');
        } else {
            editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
        }
    }, [editor, isLink]);

    const formatQuote = () => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                $setBlocksType(selection, () => $createQuoteNode());
            }
        });
    };

    return (
        <div className={styles.fixedToolbar} ref={toolbarRef}>
            <div className={styles.group}>
                <button
                    disabled={!canUndo}
                    onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
                    className={styles.button}
                    title="Undo (Ctrl+Z)"
                >
                    <Undo size={16} />
                </button>
                <button
                    disabled={!canRedo}
                    onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
                    className={styles.button}
                    title="Redo (Ctrl+Y)"
                >
                    <Redo size={16} />
                </button>
            </div>
            <div className={styles.divider} />
            <div className={styles.group}>
                <BlockFormatDropDown editor={editor} blockType={blockType} />
            </div>
            <div className={styles.divider} />
            <div className={styles.group}>
                <TextFormatButtons
                    isBold={isBold}
                    isItalic={isItalic}
                    isUnderline={isUnderline}
                    isStrikethrough={isStrikethrough}
                    isCode={isCode}
                    isLink={isLink}
                    onLinkClick={insertLink}
                />
            </div>
            <div className={styles.divider} />
            <div className={styles.group}>
                <button
                    onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)}
                    className={styles.button}
                    title="Bulleted List"
                >
                    <List size={16} />
                </button>
                <button
                    onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)}
                    className={styles.button}
                    title="Numbered List"
                >
                    <ListOrdered size={16} />
                </button>
                <button onClick={formatQuote} className={styles.button} title="Quote">
                    <Quote size={16} />
                </button>
            </div>
            <div className={styles.divider} />
            <div className={styles.group}>
                <button
                    onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left')}
                    className={styles.button}
                    title="Align Left"
                >
                    <AlignLeft size={16} />
                </button>
                <button
                    onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center')}
                    className={styles.button}
                    title="Align Center"
                >
                    <AlignCenter size={16} />
                </button>
                <button
                    onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right')}
                    className={styles.button}
                    title="Align Right"
                >
                    <AlignRight size={16} />
                </button>
                <button
                    onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify')}
                    className={styles.button}
                    title="Align Justify"
                >
                    <AlignJustify size={16} />
                </button>
            </div>
            <div className={styles.divider} />
            <div className={styles.group}>
                <button
                    onClick={() => editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined)}
                    className={styles.button}
                    title="Outdent"
                >
                    <Outdent size={16} />
                </button>
                <button
                    onClick={() => editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined)}
                    className={styles.button}
                    title="Indent"
                >
                    <Indent size={16} />
                </button>
            </div>
            <div className={styles.divider} />
            <div className={styles.group}>
                <InsertDropDown editor={editor} />
            </div>
        </div>
    );
}
