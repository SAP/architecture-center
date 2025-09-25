import React, { useState } from 'react';
import {
    DecoratorNode,
    EditorConfig,
    LexicalEditor,
    NodeKey,
    SerializedLexicalNode,
    Spread,
    ElementNode,
} from 'lexical';
import { $createHeadingNode } from '@lexical/rich-text';
import { Button, MultiComboBox, MultiComboBoxItem, MultiInput, Token } from '@ui5/webcomponents-react';
import '@ui5/webcomponents-icons/dist/edit.js';
import { usePageDataStore } from '@site/src/store/pageDataStore';
import styles from './index.module.css';

const AVAILABLE_TAGS = ['Beginner', 'Advanced', 'Tutorial', 'Reference', 'Deep Dive'];

export type SerializedArticleMetadataNode = Spread<
    {
        tags: string[];
        authors: string[];
        type: 'article-metadata';
        version: 1;
    },
    SerializedLexicalNode
>;

function ArticleMetadataComponent({ tags, authors, nodeKey, editor }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editableData, setEditableData] = useState({ tags, authors });
    const [authorInputValue, setAuthorInputValue] = useState('');
    const { getActiveDocument, updateDocument } = usePageDataStore();

    const handleSave = () => {
        const activeDocument = getActiveDocument();
        if (!activeDocument) return;

        editor.update(() => {
            const node = editor.getElementByKey(nodeKey)?.getWritable();
            if (node instanceof ArticleMetadataNode) {
                node.setTags(editableData.tags);
                node.setAuthors(editableData.authors);
            }
        });

        updateDocument(activeDocument.id, {
            tags: editableData.tags,
            authors: editableData.authors,
        });

        setIsEditing(false);

        setTimeout(() => {
            editor.update(() => {
                const node = editor.getElementByKey(nodeKey);
                if (node) {
                    const nextSibling = node.getNextSibling();
                    if (!nextSibling) {
                        const newHeading = $createHeadingNode('h1');
                        node.insertAfter(newHeading);
                        newHeading.select();
                    } else if (nextSibling instanceof ElementNode) {
                        nextSibling.selectStart();
                    }
                }
            });
            editor.focus();
        }, 0);
    };

    const handleAuthorAdd = (event) => {
        const newAuthor = event.target.value.trim();
        if (newAuthor && !editableData.authors.includes(newAuthor)) {
            setEditableData((d) => ({ ...d, authors: [...d.authors, newAuthor] }));
        }
        setAuthorInputValue('');
    };

    const handleAuthorDelete = (event) => {
        const authorToRemove = event.detail.token.text;
        setEditableData((d) => ({ ...d, authors: d.authors.filter((author) => author !== authorToRemove) }));
    };

    if (isEditing) {
        return (
            <div style={{ padding: '1rem', border: '1px dashed #ccc', borderRadius: '4px', margin: '1rem 0 2rem 0' }}>
                <div style={{ marginBottom: '1rem' }}>
                    <MultiComboBox
                        placeholder="Select tags"
                        onSelectionChange={(e) =>
                            setEditableData((d) => ({ ...d, tags: e.detail.items.map((i) => i.text) }))
                        }
                    >
                        {AVAILABLE_TAGS.map((tag) => (
                            <MultiComboBoxItem key={tag} text={tag} selected={editableData.tags.includes(tag)} />
                        ))}
                    </MultiComboBox>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <MultiInput
                        placeholder="Add authors"
                        value={authorInputValue}
                        onInput={(e) => setAuthorInputValue(e.target.value)}
                        onChange={handleAuthorAdd}
                        onTokenDelete={handleAuthorDelete}
                        tokens={editableData.authors.map((author) => (
                            <Token key={author} text={author} />
                        ))}
                    />
                </div>
                <Button onClick={handleSave} design="Emphasized">
                    Save Changes
                </Button>
                <Button onClick={() => setIsEditing(false)} style={{ marginLeft: '8px' }}>
                    Cancel
                </Button>
            </div>
        );
    }

    return (
        <div className={styles.metadataContainer}>
            <div className={styles.metadataInfo}>
                <div>
                    {tags.length > 0 ? (
                        tags.map((tag) => (
                            <span key={tag} className={styles.tag}>
                                {tag}
                            </span>
                        ))
                    ) : (
                        <span className={styles.placeholder}>No tags yet</span>
                    )}
                </div>
                <div>
                    <p className={styles.updateInfo}>
                        Last updated on <strong>{new Date().toLocaleDateString()}</strong> by{' '}
                        <strong>{authors.length > 0 ? authors.join(', ') : 'Unknown'}</strong>
                    </p>
                </div>
            </div>
            <div className={styles.actions}>
                <Button icon="edit" design="Transparent" onClick={() => setIsEditing(true)} />
            </div>
        </div>
    );
}

export class ArticleMetadataNode extends DecoratorNode<React.ReactNode> {
    __tags: string[];
    __authors: string[];

    static getType(): string {
        return 'article-metadata';
    }

    static clone(node: ArticleMetadataNode): ArticleMetadataNode {
        return new ArticleMetadataNode(node.__tags, node.__authors, node.__key);
    }

    exportJSON(): SerializedArticleMetadataNode {
        return {
            authors: this.__authors,
            tags: this.__tags,
            type: 'article-metadata',
            version: 1,
        };
    }

    static importJSON(serializedNode: SerializedArticleMetadataNode): ArticleMetadataNode {
        return $createArticleMetadataNode(serializedNode.tags, serializedNode.authors);
    }

    constructor(tags: string[] = [], authors: string[] = [], key?: NodeKey) {
        super(key);
        this.__tags = tags;
        this.__authors = authors;
    }

    createDOM(config: EditorConfig): HTMLElement {
        return document.createElement('div');
    }

    updateDOM(): false {
        return false;
    }

    setTags(tags: string[]) {
        this.getWritable().__tags = tags;
    }

    setAuthors(authors: string[]) {
        this.getWritable().__authors = authors;
    }

    decorate(editor: LexicalEditor): React.ReactNode {
        return (
            <ArticleMetadataComponent
                tags={this.__tags}
                authors={this.__authors}
                nodeKey={this.getKey()}
                editor={editor}
            />
        );
    }
}

export function $createArticleMetadataNode(tags: string[], authors: string[]): ArticleMetadataNode {
    return new ArticleMetadataNode(tags, authors);
}
