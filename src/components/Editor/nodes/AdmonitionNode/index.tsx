import {
    DecoratorNode,
    LexicalNode,
    NodeKey,
    SerializedLexicalNode,
    LexicalEditor,
    createEditor,
    $getRoot,
    $createParagraphNode,
    SerializedEditorState,
} from 'lexical';
import { ReactNode, useEffect, useCallback, useState } from 'react';
import React from 'react';
import { LexicalNestedComposer } from '@lexical/react/LexicalNestedComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { ListNode, ListItemNode } from '@lexical/list';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { LinkNode } from '@lexical/link';
import styles from './index.module.css';

export type AdmonitionType = 'note' | 'info' | 'tip' | 'warning' | 'danger';

export interface SerializedAdmonitionNode extends SerializedLexicalNode {
    admonitionType: AdmonitionType;
    nestedEditorState: SerializedEditorState | null;
}

const ADMONITION_ICONS: Record<AdmonitionType, string> = {
    note: '📝',
    info: 'ℹ️',
    tip: '💡',
    warning: '⚠️',
    danger: '🚨',
};

const ADMONITION_LABELS: Record<AdmonitionType, string> = {
    note: 'Note',
    info: 'Info',
    tip: 'Tip',
    warning: 'Warning',
    danger: 'Danger',
};

export class AdmonitionNode extends DecoratorNode<ReactNode> {
    __admonitionType: AdmonitionType;
    __nestedEditor: LexicalEditor;

    static getType(): string {
        return 'admonition';
    }

    static clone(node: AdmonitionNode): AdmonitionNode {
        const newNode = new AdmonitionNode(node.__admonitionType, node.__key);
        // Clone the nested editor state
        const editorState = node.__nestedEditor.getEditorState();
        newNode.__nestedEditor.setEditorState(editorState.clone());
        return newNode;
    }

    constructor(admonitionType: AdmonitionType = 'note', key?: NodeKey) {
        super(key);
        this.__admonitionType = admonitionType;
        this.__nestedEditor = createEditor({
            namespace: 'AdmonitionEditor',
            nodes: [ListNode, ListItemNode, HeadingNode, QuoteNode, LinkNode],
            onError: (error) => console.error('Admonition nested editor error:', error),
        });
        // Initialize with an empty paragraph to prevent empty root errors
        this.__nestedEditor.update(() => {
            const root = $getRoot();
            if (root.getChildrenSize() === 0) {
                root.append($createParagraphNode());
            }
        }, { discrete: true });
    }

    createDOM(): HTMLElement {
        const div = document.createElement('div');
        div.className = 'admonition-wrapper';
        return div;
    }

    updateDOM(): boolean {
        return false;
    }

    setAdmonitionType(type: AdmonitionType): void {
        const self = this.getWritable();
        self.__admonitionType = type;
    }

    getAdmonitionType(): AdmonitionType {
        return this.__admonitionType;
    }

    getNestedEditor(): LexicalEditor {
        return this.__nestedEditor;
    }

    static importJSON(serializedNode: SerializedAdmonitionNode): AdmonitionNode {
        const node = $createAdmonitionNode(serializedNode.admonitionType);
        if (serializedNode.nestedEditorState && serializedNode.nestedEditorState.root) {
            // Check if root has children to avoid empty state error
            const rootChildren = serializedNode.nestedEditorState.root.children;
            if (rootChildren && rootChildren.length > 0) {
                try {
                    const nestedEditorState = node.__nestedEditor.parseEditorState(
                        serializedNode.nestedEditorState
                    );
                    node.__nestedEditor.setEditorState(nestedEditorState);
                } catch (e) {
                    console.warn('Failed to restore admonition nested state:', e);
                    // Keep default empty state with paragraph
                }
            }
        }
        return node;
    }

    exportJSON(): SerializedAdmonitionNode {
        return {
            type: 'admonition',
            version: 1,
            admonitionType: this.__admonitionType,
            nestedEditorState: this.__nestedEditor.getEditorState().toJSON(),
        };
    }

    decorate(editor: LexicalEditor): ReactNode {
        return (
            <AdmonitionComponent
                admonitionType={this.__admonitionType}
                nodeKey={this.__key}
                parentEditor={editor}
                nestedEditor={this.__nestedEditor}
            />
        );
    }
}

interface AdmonitionComponentProps {
    admonitionType: AdmonitionType;
    nodeKey: NodeKey;
    parentEditor: LexicalEditor;
    nestedEditor: LexicalEditor;
}

const TYPE_SELECT_CLASSES: Record<AdmonitionType, string> = {
    note: 'typeSelectNote',
    info: 'typeSelectInfo',
    tip: 'typeSelectTip',
    warning: 'typeSelectWarning',
    danger: 'typeSelectDanger',
};

function AdmonitionComponent({ admonitionType, nodeKey, parentEditor, nestedEditor }: AdmonitionComponentProps) {
    const [currentType, setCurrentType] = useState(admonitionType);

    const handleTypeChange = useCallback((newType: AdmonitionType) => {
        setCurrentType(newType);
        parentEditor.update(() => {
            const node = $getAdmonitionNodeByKey(nodeKey);
            if (node) {
                node.setAdmonitionType(newType);
            }
        });
    }, [parentEditor, nodeKey]);

    const handleDelete = useCallback(() => {
        parentEditor.update(() => {
            const node = $getAdmonitionNodeByKey(nodeKey);
            if (node) {
                node.remove();
            }
        });
    }, [parentEditor, nodeKey]);

    const handleNestedChange = useCallback(() => {
        // Trigger parent editor update when nested content changes
        parentEditor.update(() => {
            const node = $getAdmonitionNodeByKey(nodeKey);
            if (node) {
                // Mark node as dirty to ensure serialization picks up nested changes
                node.markDirty();
            }
        }, { discrete: true });
    }, [parentEditor, nodeKey]);

    return (
        <div className={`${styles.admonition} ${styles[currentType]}`}>
            <div className={styles.header}>
                <span className={styles.icon}>{ADMONITION_ICONS[currentType]}</span>
                <select
                    value={currentType}
                    onChange={(e) => handleTypeChange(e.target.value as AdmonitionType)}
                    className={`${styles.typeSelect} ${styles[TYPE_SELECT_CLASSES[currentType]]}`}
                >
                    <option value="note">Note</option>
                    <option value="info">Info</option>
                    <option value="tip">Tip</option>
                    <option value="warning">Warning</option>
                    <option value="danger">Danger</option>
                </select>
                <button
                    onClick={handleDelete}
                    className={styles.deleteButton}
                    title="Remove callout"
                >
                    ×
                </button>
            </div>
            <div className={styles.content}>
                <LexicalNestedComposer initialEditor={nestedEditor}>
                    <RichTextPlugin
                        contentEditable={
                            <ContentEditable className={styles.contentEditable} />
                        }
                        placeholder={
                            <div className={styles.placeholder}>
                                Type your content here... (Use - for bullets)
                            </div>
                        }
                        ErrorBoundary={LexicalErrorBoundary}
                    />
                    <HistoryPlugin />
                    <ListPlugin />
                    <OnChangePlugin onChange={handleNestedChange} />
                </LexicalNestedComposer>
            </div>
        </div>
    );
}

function $getAdmonitionNodeByKey(key: NodeKey): AdmonitionNode | null {
    const node = $getNodeByKey(key);
    if ($isAdmonitionNode(node)) {
        return node;
    }
    return null;
}

function $getNodeByKey(key: NodeKey): LexicalNode | null {
    const root = $getRoot();
    const queue: LexicalNode[] = [root];
    while (queue.length > 0) {
        const current = queue.shift()!;
        if (current.getKey() === key) {
            return current;
        }
        if ('getChildren' in current && typeof current.getChildren === 'function') {
            queue.push(...(current as any).getChildren());
        }
    }
    return null;
}

export function $createAdmonitionNode(
    admonitionType: AdmonitionType = 'note'
): AdmonitionNode {
    return new AdmonitionNode(admonitionType);
}

export function $isAdmonitionNode(node: LexicalNode | null | undefined): node is AdmonitionNode {
    return node instanceof AdmonitionNode;
}
