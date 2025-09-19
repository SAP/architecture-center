import React from 'react';
import '@ui5/webcomponents-icons/dist/AllIcons';
import { LexicalComposer, InitialConfigType } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListNode, ListItemNode } from '@lexical/list';
import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { Button } from '@ui5/webcomponents-react/Button';
import { usePageDataStore, Document } from '@site/src/store/pageDataStore';
import { ImageNode } from './nodes/ImageNode';
import ImagePlugin from './plugins/ImagePlugin';
import ToolbarPlugin from './plugins/ToolbarPlugin';
import { DrawioNode } from './nodes/DrawioNode';
import DrawioPlugin from './plugins/DrawioPlugin';
import TableOfContentsPlugin from './plugins/TableOfContentPlugin';
import SlashCommandPlugin from './plugins/SlashCommandPlugin';
import { ArticleMetadataNode } from './nodes/ArticleMetadataNode';
import InitializerPlugin from './plugins/InitializerPlugin';
import TitleSyncPlugin from './plugins/TitleSyncPlugin';
import EditorTheme from './EditorTheme';
import styles from './index.module.css';
import PageTabs from '../PageTabs';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

const findRootDocument = (startDocId: string, allDocs: Document[]): Document | null => {
    let currentDoc = allDocs.find((d) => d.id === startDocId);
    if (!currentDoc) return null;

    while (currentDoc.parentId) {
        const parentDoc = allDocs.find((d) => d.id === currentDoc.parentId);
        if (!parentDoc) {
            break;
        }
        currentDoc = parentDoc;
    }
    return currentDoc;
};

const buildDocumentTree = (docId: string, allDocs: Document[]): Document | null => {
    const rootDoc = allDocs.find((d) => d.id === docId);
    if (!rootDoc) return null;

    const children = allDocs
        .filter((d) => d.parentId === docId)
        .map((childDoc) => buildDocumentTree(childDoc.id, allDocs))
        .filter(Boolean) as Document[];

    return { ...rootDoc, children };
};

const transformTreeForBackend = (doc: Document): any => {
    return {
        id: doc.id,
        editorState: doc.editorState,
        parentId: doc.parentId,
        children: doc.children ? doc.children.map(transformTreeForBackend) : [],
        metadata: {
            title: doc.title,
            tags: doc.tags,
            authors: doc.authors,
            contributors: doc.contributors,
            description: doc.description || 'This is a default description.',
        },
    };
};

function Placeholder() {
    return <div className={styles.editorPlaceholder}>type / to get started</div>;
}

const editorNodes = [
    HeadingNode,
    QuoteNode,
    ListNode,
    ListItemNode,
    CodeNode,
    CodeHighlightNode,
    TableNode,
    TableCellNode,
    TableRowNode,
    AutoLinkNode,
    LinkNode,
    ImageNode,
    DrawioNode,
    ArticleMetadataNode,
];

const AutoSavePlugin: React.FC = () => {
    const [editor] = useLexicalComposerContext();
    const { getActiveDocument, updateDocument } = usePageDataStore();

    const handleSave = (editorState: any) => {
        const activeDoc = getActiveDocument();
        if (activeDoc) {
            const editorStateJSON = JSON.stringify(editorState.toJSON());
            if (editorStateJSON !== activeDoc.editorState) {
                updateDocument(activeDoc.id, { editorState: editorStateJSON });
            }
        }
    };

    return <OnChangePlugin onChange={handleSave} />;
};

interface EditorProps {
    onAddNew: (parentId?: string | null) => void;
}

const Editor: React.FC<EditorProps> = ({ onAddNew }) => {
    const { getActiveDocument, saveState, lastSaveTimestamp, deleteDocument, documents } = usePageDataStore();
    const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
    const activeDocument = getActiveDocument();
    const { siteConfig } = useDocusaurusContext();
    const backendUrl = siteConfig.customFields.backendUrl as string;

    const handleSubmit = async () => {
        if (!activeDocument) {
            alert('No active document to publish.');
            return;
        }

        const rootDoc = findRootDocument(activeDocument.id, documents);
        if (!rootDoc) {
            alert('Could not find the root document for publishing.');
            return;
        }

        const fullDocumentTree = buildDocumentTree(rootDoc.id, documents);
        if (!fullDocumentTree) {
            alert('Could not construct the document tree.');
            return;
        }

        const payload = transformTreeForBackend(fullDocumentTree);

        try {
            const response = await fetch(`${backendUrl}/api/publish`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (response.ok) {
                alert(`Success! ${result.message}`);
            } else {
                throw new Error(result.message || 'Failed to publish.');
            }
        } catch (error) {
            console.error('Publishing failed:', error);
            alert(`Error: ${error.message}`);
        }
    };

    if (!activeDocument) return null;

    const editorConfig: InitialConfigType = {
        namespace: 'MyEditor',
        theme: EditorTheme,
        onError(error) {
            throw error;
        },
        nodes: editorNodes,
        editorState: activeDocument.editorState || null,
    };

    return (
        <LexicalComposer initialConfig={editorConfig}>
            <div className={styles.editorPageWrapper}>
                <div className={styles.navColumn}>
                    <PageTabs onAddNew={onAddNew} />
                </div>
                <div className={styles.editorColumn}>
                    <div className={styles.editorHeader}>
                        {lastSaveTimestamp && (
                            <span className={styles.saveTimestamp}>Last saved: {lastSaveTimestamp}</span>
                        )}
                        <div className={styles.headerButtons}>
                            <Button design="Emphasized" icon="paper-plane" onClick={handleSubmit}>
                                Submit
                            </Button>
                            <Button design="Default" icon="save" onClick={saveState}>
                                Save
                            </Button>
                            {activeDocument && (
                                <Button
                                    design="Negative"
                                    icon="delete"
                                    onClick={() => setShowDeleteConfirm(true)}
                                    tooltip="Delete current document"
                                >
                                    Delete
                                </Button>
                            )}
                        </div>
                    </div>
                    <div className={styles.editorContainer}>
                        <ToolbarPlugin mode="fixed" />
                        <ToolbarPlugin mode="floating" />
                        <div className={styles.editorInner}>
                            <RichTextPlugin
                                contentEditable={<ContentEditable className={styles.editorInput} />}
                                placeholder={<Placeholder />}
                                ErrorBoundary={LexicalErrorBoundary}
                            />
                            <HistoryPlugin />
                            <AutoFocusPlugin />
                            <ListPlugin />
                            <LinkPlugin />
                            <ImagePlugin />
                            <DrawioPlugin />
                            <SlashCommandPlugin />
                            <InitializerPlugin />
                            <TitleSyncPlugin />
                            <AutoSavePlugin />
                        </div>
                    </div>
                </div>
                <div className={styles.tocColumn}>
                    <TableOfContentsPlugin />
                </div>
            </div>
            {showDeleteConfirm && activeDocument && (
                <div className={styles.dialogOverlay}>
                    <div className={styles.dialogContent}>
                        <h3 className={styles.dialogTitle}>Delete Document</h3>
                        <p className={styles.dialogMessage}>
                            Are you sure you want to delete "{activeDocument.title || 'Untitled Page'}"?
                            <br />
                            This action cannot be undone.
                        </p>
                        <div className={styles.dialogActions}>
                            <Button design="Default" onClick={() => setShowDeleteConfirm(false)}>
                                Cancel
                            </Button>
                            <Button
                                design="Negative"
                                onClick={() => {
                                    deleteDocument(activeDocument.id);
                                    setShowDeleteConfirm(false);
                                }}
                            >
                                Delete
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </LexicalComposer>
    );
};

export default Editor;
