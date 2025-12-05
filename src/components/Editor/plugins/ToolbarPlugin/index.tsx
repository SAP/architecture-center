import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useIsVisible } from '@site/src/hooks/useIsVisible'; 
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
    LexicalEditor,
} from 'lexical';
import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import { $setBlocksType } from '@lexical/selection';
import { $isHeadingNode, $createQuoteNode, $createHeadingNode } from '@lexical/rich-text';
import { $isListNode, INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND } from '@lexical/list';
import {
    ChevronDown, Underline, Link2, Bold, Italic, Strikethrough, Code, Quote, List,
    ListOrdered, AlignLeft, AlignCenter, AlignRight, AlignJustify, Undo, Redo,
    Heading1, Heading2, Heading3, Indent, Outdent, Plus, Image as ImageIcon,
    LayoutDashboard, Paperclip, MoreHorizontal 
} from 'lucide-react';
import { TOGGLE_IMAGE_DIALOG, OPEN_DRAWIO_DIALOG } from '../commands';
import { fileUploadCommand } from '../fileUploadCommand';
import styles from './index.module.css';

interface ToolbarState {
    isBold: boolean;
    isItalic: boolean;
    isUnderline: boolean;
    isStrikethrough: boolean;
    isCode: boolean;
    isLink: boolean;
    canUndo: boolean;
    canRedo: boolean;
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

interface BlockFormatDropDownProps {
    editor: LexicalEditor;
    blockType: string;
}

interface InsertDropDownProps {
    editor: LexicalEditor;
}


function useClickOutside(ref: React.RefObject<HTMLElement>, handler: (event: MouseEvent) => void) {
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
    const isVisible = useIsVisible(ref);

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


export default function ToolbarPlugin() {
    const [editor] = useLexicalComposerContext();
    const [hiddenIds, setHiddenIds] = useState<string[]>([]);
    const [showHamburger, setShowHamburger] = useState(false);
    const hamburgerRef = useRef<HTMLDivElement>(null);

    
    const [blockType, setBlockType] = useState('paragraph');
    const [state, setState] = useState<ToolbarState>({
        isBold: false,
        isItalic: false,
        isUnderline: false,
        isStrikethrough: false,
        isCode: false,
        isLink: false,
        canUndo: false,
        canRedo: false,
    });

    useClickOutside(hamburgerRef, () => setShowHamburger(false));

    const updateToolbar = useCallback(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
            const anchorNode = selection.anchor.getNode();
            const element = anchorNode.getKey() === 'root' 
                ? anchorNode 
                : anchorNode.getTopLevelElementOrThrow();
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

           
            const node = selection.getNodes()[0];
            const parent = node.getParent();
            const isLink = $isLinkNode(parent) || $isLinkNode(node);

            setState({
                isBold: selection.hasFormat('bold'),
                isItalic: selection.hasFormat('italic'),
                isUnderline: selection.hasFormat('underline'),
                isStrikethrough: selection.hasFormat('strikethrough'),
                isCode: selection.hasFormat('code'),
                isLink: isLink,
                canUndo: state.canUndo, 
                canRedo: state.canRedo,
            });
        }
    }, [editor, state.canUndo, state.canRedo]);

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
                setState((s) => ({ ...s, canUndo: payload }));
                return false;
            },
            COMMAND_PRIORITY_LOW
        );
    }, [editor]);

    useEffect(() => {
        return editor.registerCommand(
            CAN_REDO_COMMAND,
            (payload) => {
                setState((s) => ({ ...s, canRedo: payload }));
                return false;
            },
            COMMAND_PRIORITY_LOW
        );
    }, [editor]);

    const insertLink = useCallback(() => {
        if (!state.isLink) {
            editor.dispatchCommand(TOGGLE_LINK_COMMAND, 'https://');
        } else {
            editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
        }
    }, [editor, state.isLink]);

    const formatQuote = () => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                $setBlocksType(selection, () => $createQuoteNode());
            }
        });
    };

    
    const tools: ToolItem[] = [
        { id: 'undo', group: 'History', component: <button disabled={!state.canUndo} onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)} className={styles.button} title="Undo"><Undo size={16} /></button> },
        { id: 'redo', group: 'History', component: <button disabled={!state.canRedo} onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)} className={styles.button} title="Redo"><Redo size={16} /></button> },
        { id: 'divider-1', type: 'divider' },
        
        { id: 'block-format', group: 'Text Style', component: <BlockFormatDropDown editor={editor} blockType={blockType} /> },
        { id: 'divider-2', type: 'divider' },

        { id: 'bold', group: 'Formatting', component: <button onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')} className={`${styles.button} ${state.isBold ? styles.active : ''}`} title="Bold"><Bold size={16} /></button> },
        { id: 'italic', group: 'Formatting', component: <button onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')} className={`${styles.button} ${state.isItalic ? styles.active : ''}`} title="Italic"><Italic size={16} /></button> },
        { id: 'underline', group: 'Formatting', component: <button onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')} className={`${styles.button} ${state.isUnderline ? styles.active : ''}`} title="Underline"><Underline size={16} /></button> },
        { id: 'strikethrough', group: 'Formatting', component: <button onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')} className={`${styles.button} ${state.isStrikethrough ? styles.active : ''}`} title="Strikethrough"><Strikethrough size={16} /></button> },
        { id: 'code', group: 'Formatting', component: <button onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code')} className={`${styles.button} ${state.isCode ? styles.active : ''}`} title="Code"><Code size={16} /></button> },
        { id: 'link', group: 'Formatting', component: <button onClick={insertLink} className={`${styles.button} ${state.isLink ? styles.active : ''}`} title="Link"><Link2 size={16} /></button> },
        { id: 'divider-3', type: 'divider' },

        { id: 'ul', group: 'Lists', component: <button onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)} className={styles.button} title="Bullet List"><List size={16} /></button> },
        { id: 'ol', group: 'Lists', component: <button onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)} className={styles.button} title="Numbered List"><ListOrdered size={16} /></button> },
        { id: 'quote', group: 'Lists', component: <button onClick={formatQuote} className={styles.button} title="Quote"><Quote size={16} /></button> },
        { id: 'divider-4', type: 'divider' },

        { id: 'left', group: 'Alignment', component: <button onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left')} className={styles.button} title="Left"><AlignLeft size={16} /></button> },
        { id: 'center', group: 'Alignment', component: <button onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center')} className={styles.button} title="Center"><AlignCenter size={16} /></button> },
        { id: 'right', group: 'Alignment', component: <button onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right')} className={styles.button} title="Right"><AlignRight size={16} /></button> },
        { id: 'justify', group: 'Alignment', component: <button onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify')} className={styles.button} title="Justify"><AlignJustify size={16} /></button> },
        { id: 'divider-5', type: 'divider' },

        { id: 'outdent', group: 'Indentation', component: <button onClick={() => editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined)} className={styles.button} title="Outdent"><Outdent size={16} /></button> },
        { id: 'indent', group: 'Indentation', component: <button onClick={() => editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined)} className={styles.button} title="Indent"><Indent size={16} /></button> },
        { id: 'divider-6', type: 'divider' },

        { id: 'insert', group: 'Insert', component: <InsertDropDown editor={editor} /> }
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
                                            <React.Fragment key={tool.id}>
                                                {tool.component}
                                            </React.Fragment>
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


const blockTypeToBlockName: Record<string, string> = {
    h1: 'Heading 1',
    h2: 'Heading 2',
    h3: 'Heading 3',
    paragraph: 'Paragraph',
    quote: 'Quote',
    ul: 'Bulleted List',
    ol: 'Numbered List',
};

const BlockFormatDropDown: React.FC<BlockFormatDropDownProps> = ({ editor, blockType }) => {
    const dropDownRef = useRef<HTMLDivElement>(null);
    const [showDropDown, setShowDropDown] = useState(false);
    useClickOutside(dropDownRef, () => setShowDropDown(false));

    const formatHeading = (level: 'h1' | 'h2' | 'h3') => {
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
                {blockTypeToBlockName[blockType] || 'Paragraph'} <ChevronDown size={16} />
            </button>
            {showDropDown && (
                <div className={styles.dropdownMenu} style={{ zIndex: 100 }}>
                    <button className={styles.dropdownItem} onClick={() => formatHeading('h1')}>
                        <Heading1 size={18} /> Heading 1
                    </button>
                    <button className={styles.dropdownItem} onClick={() => formatHeading('h2')}>
                        <Heading2 size={18} /> Heading 2
                    </button>
                    <button className={styles.dropdownItem} onClick={() => formatHeading('h3')}>
                        <Heading3 size={18} /> Heading 3
                    </button>
                    <button className={styles.dropdownItem} onClick={formatQuote}>
                        <Quote size={18} /> Quote
                    </button>
                </div>
            )}
        </div>
    );
};

const InsertDropDown: React.FC<InsertDropDownProps> = ({ editor }) => {
    const dropDownRef = useRef<HTMLDivElement>(null);
    const [showDropDown, setShowDropDown] = useState(false);
    useClickOutside(dropDownRef, () => setShowDropDown(false));

    return (
        <div className={styles.dropdown} ref={dropDownRef}>
            <button className={styles.button} onClick={() => setShowDropDown((v) => !v)}>
                <Plus size={16} /> <span style={{ marginLeft: '4px' }}>Insert</span>
            </button>
            {showDropDown && (
                <div className={`${styles.dropdownMenu} ${styles.dropdownMenuRight}`} style={{ zIndex: 100 }}>
                    <button className={styles.dropdownItem} onClick={() => editor.dispatchCommand(TOGGLE_IMAGE_DIALOG, undefined)}>
                        <ImageIcon size={18} /> Image
                    </button>
                    <button className={styles.dropdownItem} onClick={() => editor.dispatchCommand(OPEN_DRAWIO_DIALOG, undefined)}>
                        <LayoutDashboard size={18} /> Draw.io
                    </button>
                    <button
                        className={styles.dropdownItem}
                        onClick={() => fileUploadCommand.onSelect(editor)}
                    >
                        <Paperclip size={18} /> File
                    </button>
                </div>
            )}
        </div>
    );
};