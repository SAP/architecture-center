import React, { useCallback, useMemo, useState, JSX } from 'react';
import {
    LexicalTypeaheadMenuPlugin,
    MenuOption,
    useBasicTypeaheadTriggerMatch,
} from '@lexical/react/LexicalTypeaheadMenuPlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $createParagraphNode, $getSelection, $isRangeSelection, LexicalEditor, TextNode } from 'lexical';
import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND } from '@lexical/list';
import { $createHeadingNode } from '@lexical/rich-text';
import { $setBlocksType } from '@lexical/selection';
import * as ReactDOM from 'react-dom';
import {
    Type,
    Heading1,
    Heading2,
    List,
    ListOrdered,
    Image as ImageIcon,
    LayoutDashboard,
    Paperclip,
} from 'lucide-react';

import { TOGGLE_IMAGE_DIALOG, OPEN_DRAWIO_DIALOG } from '../commands';
import styles from './index.module.css';
import { fileUploadCommand } from '../fileUploadCommand';

class CommandOption extends MenuOption {
    name: string;
    icon?: JSX.Element;
    keywords: string[];
    hint?: string;
    onSelect: (editor: LexicalEditor) => void;

    constructor(
        name: string,
        options: {
            icon?: JSX.Element;
            keywords?: string[];
            hint?: string;
            onSelect: (editor: LexicalEditor) => void;
        }
    ) {
        super(name);
        this.name = name;
        this.icon = options.icon;
        this.keywords = options.keywords || [];
        this.hint = options.hint;
        this.onSelect = options.onSelect;
    }
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
    return (
        <li
            key={option.key}
            ref={option.setRefElement}
            className={isSelected ? styles.selected : ''}
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            role="option"
            aria-selected={isSelected}
        >
            <span className={styles.icon}>{option.icon}</span>
            <span className={styles.text}>{option.name}</span>
            {option.hint && <span className={styles.hint}>{option.hint}</span>}
        </li>
    );
}

function CommandMenu({
    options,
    onSelectOption,
    selectedIndex,
    queryString,
}: {
    options: CommandOption[];
    selectedIndex: number | null;
    onSelectOption: (option: CommandOption) => void;
    queryString: string | null;
}) {
    return (
        <div className={styles['typeahead-popover']}>
            <ul>
                {options.map((option, i) => (
                    <CommandMenuItem
                        key={option.key}
                        isSelected={selectedIndex === i}
                        onClick={() => onSelectOption(option)}
                        onMouseEnter={() => {}}
                        option={option}
                    />
                ))}
            </ul>
            <div className={styles.menuFooter}>
                <span>
                    {queryString ? (
                        <>
                            /<b>{queryString}</b>
                        </>
                    ) : (
                        "Type '/' on the page"
                    )}
                </span>
                <span className={styles.footerKey}>esc</span>
            </div>
        </div>
    );
}

const onFileSelect = (editor: LexicalEditor) => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.txt,.md,.js,.css,.html,.json';
    fileInput.style.display = 'none';

    fileInput.onchange = (e) => {
        const target = e.target as HTMLInputElement;
        const file = target.files?.[0];

        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const fileContent = event.target?.result as string;
            if (fileContent) {
                editor.update(() => {
                    const selection = $getSelection();
                    if ($isRangeSelection(selection)) {
                        selection.insertText(fileContent);
                    }
                });
            }
        };
        reader.onerror = (error) => console.error('Error reading file:', error);
        reader.readAsText(file);
        document.body.removeChild(fileInput);
    };

    document.body.appendChild(fileInput);
    fileInput.click();
};

export default function SlashCommandPlugin() {
    const [editor] = useLexicalComposerContext();
    const [queryString, setQueryString] = useState<string | null>(null);

    const ALL_COMMANDS = useMemo(
        () => [
            new CommandOption('Paragraph', {
                icon: <Type size={20} />,
                keywords: ['paragraph', 'text', 'p'],
                onSelect: (editor) => {
                    editor.update(() => {
                        const selection = $getSelection();
                        if ($isRangeSelection(selection)) {
                            $setBlocksType(selection, () => $createParagraphNode());
                        }
                    });
                },
            }),
            new CommandOption('Heading 1', {
                icon: <Heading1 size={20} />,
                keywords: ['heading', 'h1', 'header'],
                hint: '#',
                onSelect: (editor) => {
                    editor.update(() => {
                        const selection = $getSelection();
                        if ($isRangeSelection(selection)) {
                            $setBlocksType(selection, () => $createHeadingNode('h1'));
                        }
                    });
                },
            }),
            new CommandOption('Heading 2', {
                icon: <Heading2 size={20} />,
                keywords: ['heading', 'h2', 'header'],
                hint: '##',
                onSelect: (editor) => {
                    editor.update(() => {
                        const selection = $getSelection();
                        if ($isRangeSelection(selection)) {
                            $setBlocksType(selection, () => $createHeadingNode('h2'));
                        }
                    });
                },
            }),
            new CommandOption('Bulleted List', {
                icon: <List size={20} />,
                keywords: ['bullet', 'list', 'ul'],
                hint: '-',
                onSelect: (editor) => {
                    editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
                },
            }),
            new CommandOption('Numbered List', {
                icon: <ListOrdered size={20} />,
                keywords: ['numbered', 'list', 'ol'],
                hint: '1.',
                onSelect: (editor) => {
                    editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
                },
            }),
            new CommandOption('Image', {
                icon: <ImageIcon size={20} />,
                keywords: ['image', 'photo', 'picture', 'img'],
                onSelect: (editor) => {
                    editor.dispatchCommand(TOGGLE_IMAGE_DIALOG, undefined);
                },
            }),
            new CommandOption('Draw.io Diagram', {
                icon: <LayoutDashboard size={20} />,
                keywords: ['drawio', 'diagram', 'draw', 'flowchart'],
                onSelect: (editor) => {
                    editor.dispatchCommand(OPEN_DRAWIO_DIALOG, undefined);
                },
            }),
            new CommandOption(fileUploadCommand.name, { ...fileUploadCommand }),
        ],
        []
    );

    const filteredOptions = useMemo(() => {
        if (!queryString) {
            return ALL_COMMANDS;
        }
        const query = queryString.toLowerCase();
        return ALL_COMMANDS.filter(
            (option) =>
                option.name.toLowerCase().includes(query) || option.keywords.some((keyword) => keyword.includes(query))
        );
    }, [ALL_COMMANDS, queryString]);

    const checkForTriggerMatch = useBasicTypeaheadTriggerMatch('/', {
        minLength: 0,
    });

    const onSelectOption = useCallback(
        (selectedOption: CommandOption, nodeToReplace: TextNode | null, closeMenu: () => void) => {
            editor.update(() => {
                if (nodeToReplace) {
                    nodeToReplace.remove();
                }
                selectedOption.onSelect(editor);
                closeMenu();
            });
        },
        [editor]
    );

    return (
        <LexicalTypeaheadMenuPlugin<CommandOption>
            onQueryChange={setQueryString}
            onSelectOption={onSelectOption}
            triggerFn={checkForTriggerMatch}
            options={filteredOptions}
            menuRenderFn={(anchorElementRef, { selectedIndex, selectOptionAndCleanUp }) =>
                anchorElementRef.current && filteredOptions.length > 0
                    ? ReactDOM.createPortal(
                          <CommandMenu
                              options={filteredOptions}
                              selectedIndex={selectedIndex}
                              onSelectOption={(option) => {
                                  selectOptionAndCleanUp(option);
                              }}
                              queryString={queryString}
                          />,
                          anchorElementRef.current
                      )
                    : null
            }
        />
    );
}
