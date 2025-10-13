import React, { useState, useMemo } from 'react';
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
import InitializerPlugin from './plugins/InitializerPlugin';
import EditorTheme from './EditorTheme';
import styles from './index.module.css';
import PageTabs from '../PageTabs';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { useHistory } from '@docusaurus/router';
import LoadingModal, { PublishStage } from '../LoadingModal';
import ArticleHeader from '../ArticleHeader';
import Breadcrumbs from '../Breadcrumbs';
import ContributorsDisplay from '../ContributorsDisplay';

const findRootDocument = (startDocId: string, allDocs: Document[]): Document | null => {
    let currentDoc = allDocs.find((d) => d.id === startDocId);
    if (!currentDoc) return null;
    while (currentDoc.parentId) {
        const parentDoc = allDocs.find((d) => d.id === currentDoc.parentId);
        if (!parentDoc) break;
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

const buildBreadcrumbPath = (docId: string | null, allDocs: Document[]): Document[] => {
    if (!docId) return [];
    const path: Document[] = [];
    let currentDoc = allDocs.find((d) => d.id === docId);
    while (currentDoc) {
        path.unshift(currentDoc);
        currentDoc = allDocs.find((d) => d.id === currentDoc.parentId);
    }
    return path;
};

function Placeholder() {
    return <div className={styles.editorPlaceholder}>Type / to get started</div>;
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

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface PublishStatus {
    stage: PublishStage;
    error: string | null;
    commitUrl: string | null;
    pullRequestUrl: string | null;
}

const Editor: React.FC<EditorProps> = ({ onAddNew }) => {
    const { getActiveDocument, lastSaveTimestamp, deleteDocument, documents, resetStore } = usePageDataStore();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const activeDocument = getActiveDocument();
    const { siteConfig } = useDocusaurusContext();
    const { expressBackendUrl } = siteConfig.customFields as { expressBackendUrl: string };
    const [publishStatus, setPublishStatus] = useState<PublishStatus>({
        stage: 'idle',
        error: null,
        commitUrl: null,
        pullRequestUrl: null,
    });
    const history = useHistory();

    const breadcrumbPath = useMemo(
        () => buildBreadcrumbPath(activeDocument?.id, documents),
        [activeDocument, documents]
    );

    const handleSubmit = async () => {
        setIsLoading(true);
        setPublishStatus({ stage: 'forking', error: null, commitUrl: null, pullRequestUrl: null });
        if (!activeDocument) {
            alert('No active document to publish.');
            setIsLoading(false);
            return;
        }
        const rootDoc = findRootDocument(activeDocument.id, documents);
        if (!rootDoc) {
            alert('Could not find the root document for publishing.');
            setIsLoading(false);
            return;
        }
        const fullDocumentTree = buildDocumentTree(rootDoc.id, documents);
        if (!fullDocumentTree) {
            alert('Could not construct the document tree.');
            setIsLoading(false);
            return;
        }
        const documentObject = transformTreeForBackend(fullDocumentTree);
        const payloadForPublish = { document: JSON.stringify(documentObject) };
        await sleep(3000);
        setPublishStatus((prev) => ({ ...prev, stage: 'packaging' }));
        await sleep(5000);
        setPublishStatus((prev) => ({ ...prev, stage: 'committing' }));
        try {
            const token = localStorage.getItem('jwt_token');
            if (!token) {
                alert('Authentication error: You are not logged in. Please log in again.');
                return;
            }
            const response = await fetch(`${expressBackendUrl}/api/publish`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(payloadForPublish),
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error || 'Failed to publish to GitHub.');
            }
            setPublishStatus({
                stage: 'success',
                error: null,
                commitUrl: result.commitUrl,
                pullRequestUrl: result.pullRequestUrl,
            });
        } catch (error: any) {
            console.error('Publishing failed:', error);
            setPublishStatus({ stage: 'error', error: error.message, commitUrl: null, pullRequestUrl: null });
        } finally {
            setIsLoading(false);
        }
    };

    const closeLoadingModal = () => {
        setPublishStatus({ stage: 'idle', error: null, commitUrl: null, pullRequestUrl: null });
    };

    const handleSuccessAndReset = () => {
        // Prioritize PR URL over commit URL if available
        const urlToOpen = publishStatus.pullRequestUrl || publishStatus.commitUrl;
        if (urlToOpen) {
            window.open(urlToOpen, '_blank', 'noopener,noreferrer');
        }
        resetStore();
        history.push('/');
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
                            <Button design="Emphasized" icon="paper-plane" onClick={handleSubmit} disabled={isLoading}>
                                {isLoading ? 'Submitting...' : 'Submit'}
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
                        <div className={styles.contentHeader}>
                            <Breadcrumbs path={breadcrumbPath} />
                            <ArticleHeader />
                        </div>
                        <ToolbarPlugin mode="fixed" />
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
                            <AutoSavePlugin />
                            <InitializerPlugin />
                        </div>
                        <ContributorsDisplay contributors={activeDocument?.contributors} />
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
            <LoadingModal
                status={publishStatus.stage}
                error={publishStatus.error}
                commitUrl={publishStatus.commitUrl}
                pullRequestUrl={publishStatus.pullRequestUrl}
                onClose={closeLoadingModal}
                onSuccessFinish={handleSuccessAndReset}
            />
        </LexicalComposer>
    );
};

export default Editor;
