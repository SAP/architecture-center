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

import { TOGGLE_IMAGE_DIALOG, OPEN_DRAWIO_DIALOG } from '../commands';
import styles from './index.module.css';

const TextIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M5 4V7H9.5M5 4H19M5 4H7.5M19 4V7H14.5M19 4H16.5M12 20V4M12 20H9.5M12 20H14.5"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
        />
    </svg>
);
const H1Icon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M6 4V20M18 4V20M6 12H18M11 4H4M20 4H13M11 20H4M20 20H13"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
        />
    </svg>
);
const H2Icon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M6 4V20M18 12H6M18 5.5C18 4.67157 17.3284 4 16.5 4H13C13 4 13 6.5 15.5 6.5C18 6.5 18 9 18 9M18 18.5C18 19.3284 17.3284 20 16.5 20H13C13 20 13 17.5 15.5 17.5C18 17.5 18 15 18 15"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
        />
    </svg>
);
const BulletedListIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M8 6H21M8 12H21M8 18H21M3.5 6V6.01M3.5 12V12.01M3.5 18V18.01"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
        />
    </svg>
);
const NumberedListIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M8 6H21M8 12H21M8 18H21M4 6L3 7M4 18H3L4 17H3M3 11H4L3 13H4"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
        />
    </svg>
);
const ImageIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M21 12.18C21 12.75 20.78 13.29 20.34 13.68L13.66 19.64C12.74 20.47 11.23 20.47 10.31 19.64L3.62999 13.68C3.21999 13.29 2.99999 12.75 2.99999 12.18V5.91C2.99999 4.29 4.28999 3 5.91999 3H18.08C19.71 3 21 4.29 21 5.91V12.18Z"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
        />
        <path
            d="M7.5 8C8.32843 8 9 7.32843 9 6.5C9 5.67157 8.32843 5 7.5 5C6.67157 5 6 5.67157 6 6.5C6 7.32843 6.67157 8 7.5 8Z"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
        />
    </svg>
);

const DrawioIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M9 20V21M15 20V21M9 3V4M15 3V4M3 9H4M3 15H4M20 9H21M20 15H21M12 8V16M8 12H16"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
        />
    </svg>
);

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

export default function SlashCommandPlugin() {
    const [editor] = useLexicalComposerContext();
    const [queryString, setQueryString] = useState<string | null>(null);

    const ALL_COMMANDS = useMemo(
        () => [
            new CommandOption('Paragraph', {
                icon: <TextIcon />,
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
                icon: <H1Icon />,
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
                icon: <H2Icon />,
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
                icon: <BulletedListIcon />,
                keywords: ['bullet', 'list', 'ul'],
                hint: '-',
                onSelect: (editor) => {
                    editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
                },
            }),
            new CommandOption('Numbered List', {
                icon: <NumberedListIcon />,
                keywords: ['numbered', 'list', 'ol'],
                hint: '1.',
                onSelect: (editor) => {
                    editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
                },
            }),
            new CommandOption('Image', {
                icon: <ImageIcon />,
                keywords: ['image', 'photo', 'picture', 'img'],
                onSelect: (editor) => {
                    editor.dispatchCommand(TOGGLE_IMAGE_DIALOG, undefined);
                },
            }),
            new CommandOption('Draw.io Diagram', {
                icon: <DrawioIcon />,
                keywords: ['drawio', 'diagram', 'draw', 'flowchart'],
                onSelect: (editor) => {
                    editor.dispatchCommand(OPEN_DRAWIO_DIALOG, undefined);
                },
            }),
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
