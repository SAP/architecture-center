import React from 'react';
import { useState, useMemo } from 'react';
import {
    $getNodeByKey,
    DecoratorNode,
    EditorConfig,
    LexicalEditor,
    NodeKey,
    SerializedLexicalNode,
    Spread,
    $createParagraphNode,
} from 'lexical';
import { Input, Button, MultiComboBox, MultiComboBoxItem, MultiInput, Token } from '@ui5/webcomponents-react';
import '@ui5/webcomponents-icons/dist/edit.js';
import { usePageDataStore } from '@site/src/store/pageDataStore';
import useGlobalData from '@docusaurus/useGlobalData';
import styles from './index.module.css';

export type SerializedArticleHeaderNode = Spread<
    {
        title: string;
        tags: string[];
        authors: string[];
        type: 'article-metadata';
        version: 1;
    },
    SerializedLexicalNode
>;

function ArticleHeaderComponent({ title, tags, authors, nodeKey, editor }) {
    const tagsData = useGlobalData()['docusaurus-tags']['default']['tags'] || {};

    const { availableTags, tagKeyToLabelMap } = useMemo(() => {
        if (!tagsData || Object.keys(tagsData).length === 0) {
            return { availableTags: [], tagKeyToLabelMap: new Map() };
        }
        const tagsArray = Object.entries(tagsData)
            .filter(([key]) => key !== 'demo')
            .map(([key, value]: [string, any]) => ({
                key: key,
                label: value.label,
                description: value.description,
            }));
        const map = new Map(tagsArray.map((tag) => [tag.key, tag.label]));
        return { availableTags: tagsArray, tagKeyToLabelMap: map };
    }, [tagsData]);

    const [isEditing, setIsEditing] = useState(false);
    const [editableData, setEditableData] = useState(() => {
        const tagObjects = tags.map((key) => availableTags.find((tag) => tag.key === key)).filter(Boolean);
        return { title, tags: tagObjects, authors };
    });
    const [authorInputValue, setAuthorInputValue] = useState('');
    const { getActiveDocument, updateDocument } = usePageDataStore();

    const handleSave = () => {
        const activeDocument = getActiveDocument();
        if (!activeDocument) return;

        const tagKeysToSave = editableData.tags.map((tag) => tag.key);

        editor.update(() => {
            const node = $getNodeByKey(nodeKey);
            if (node instanceof ArticleHeaderNode) {
                node.setTitle(editableData.title);
                node.setTags(tagKeysToSave);
                node.setAuthors(editableData.authors);
            }
        });

        updateDocument(activeDocument.id, {
            title: editableData.title,
            tags: tagKeysToSave,
            authors: editableData.authors,
        });

        setIsEditing(false);
    };

    const handleCancel = () => {
        setIsEditing(false);
        const originalTagObjects = tags.map((key) => availableTags.find((tag) => tag.key === key)).filter(Boolean);
        setEditableData({ title, tags: originalTagObjects, authors });
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
            <div className={styles.container}>
                <Input
                    value={editableData.title}
                    className={styles.titleInput}
                    placeholder="Enter a title..."
                    onInput={(e) => setEditableData((d) => ({ ...d, title: e.target.value }))}
                />
                <div className={styles.formField}>
                    <MultiComboBox
                        placeholder="Select tags"
                        onSelectionChange={(e) => {
                            const selectedObjects = e.detail.items
                                .map((item) => availableTags.find((tag) => tag.label === item.text))
                                .filter(Boolean);
                            setEditableData((d) => ({ ...d, tags: selectedObjects }));
                        }}
                    >
                        {availableTags.map((tag) => (
                            <MultiComboBoxItem
                                key={tag.key}
                                text={tag.label}
                                selected={editableData.tags.some((selectedTag) => selectedTag.key === tag.key)}
                            />
                        ))}
                    </MultiComboBox>
                </div>
                <div className={styles.formField}>
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
                    Save
                </Button>
                <Button onClick={handleCancel} className={styles.cancelButton}>
                    Cancel
                </Button>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.actions}>
                <Button icon="edit" design="Transparent" onClick={() => setIsEditing(true)} />
            </div>
            <h1 className={styles.displayTitle}>{title || 'Untitled Page'}</h1>
            <div className={styles.metadataInfo}>
                <div>
                    {tags.length > 0 ? (
                        tags.map((tagKey) => (
                            <span key={tagKey} className={styles.tag}>
                                {tagKeyToLabelMap.get(tagKey) || tagKey}
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
        </div>
    );
}

export class ArticleHeaderNode extends DecoratorNode<React.ReactNode> {
    __title: string;
    __tags: string[];
    __authors: string[];

    static getType(): string {
        return 'article-metadata';
    }

    static clone(node: ArticleHeaderNode): ArticleHeaderNode {
        return new ArticleHeaderNode(node.__title, node.__tags, node.__authors, node.__key);
    }

    exportJSON(): SerializedArticleHeaderNode {
        return {
            title: this.__title,
            authors: this.__authors,
            tags: this.__tags,
            type: 'article-metadata',
            version: 1,
        };
    }

    static importJSON(serializedNode: SerializedArticleHeaderNode): ArticleHeaderNode {
        return $createArticleHeaderNode(serializedNode.title || '', serializedNode.tags, serializedNode.authors);
    }

    constructor(title: string = '', tags: string[] = [], authors: string[] = [], key?: NodeKey) {
        super(key);
        this.__title = title;
        this.__tags = tags;
        this.__authors = authors;
    }

    createDOM(config: EditorConfig): HTMLElement {
        return document.createElement('div');
    }

    updateDOM(): false {
        return false;
    }

    getTitle(): string {
        const self = this.getLatest();
        return self.__title;
    }

    setTitle(title: string) {
        this.getWritable().__title = title;
    }

    setTags(tags: string[]) {
        this.getWritable().__tags = tags;
    }

    setAuthors(authors: string[]) {
        this.getWritable().__authors = authors;
    }

    decorate(editor: LexicalEditor): React.ReactNode {
        return (
            <ArticleHeaderComponent
                title={this.__title}
                tags={this.__tags}
                authors={this.__authors}
                nodeKey={this.getKey()}
                editor={editor}
            />
        );
    }
}

export function $createArticleHeaderNode(title: string, tags: string[], authors: string[]): ArticleHeaderNode {
    return new ArticleHeaderNode(title, tags, authors);
}
