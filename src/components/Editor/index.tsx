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
import { Button, Dialog, Bar, Text, Title } from '@ui5/webcomponents-react';
import { usePageDataStore, Document } from '@site/src/store/pageDataStore';
import { useAuth } from '@site/src/context/AuthContext';
import { ImageNode } from './nodes/ImageNode';
import ImagePlugin from './plugins/ImagePlugin';
import ToolbarPlugin from './plugins/ToolbarPlugin';
import FloatingToolbarPlugin from './plugins/FloatingToolbarPlugin';
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
    const { getActiveDocument, lastSaveTimestamp, deleteDocument, documents, resetStore, updateDocument } =
        usePageDataStore();
    const { token, user } = useAuth();
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
    const baseUrl = siteConfig.baseUrl;
    const [showSyncDialog, setShowSyncDialog] = useState(false);
    const [userForkUrl, setUserForkUrl] = useState('');
    const [isSyncing, setIsSyncing] = useState(false);

    const breadcrumbPath = useMemo(
        () => buildBreadcrumbPath(activeDocument?.id, documents),
        [activeDocument, documents]
    );
    const handleContributorsUpdate = (updatedContributors: string[]) => {
        if (activeDocument) {
            updateDocument(activeDocument.id, { contributors: updatedContributors });
        }
    };

    const handleAutomaticSync = async () => {
        setIsSyncing(true);
        try {
            const token = localStorage.getItem('jwt_token');
            const response = await fetch(`${expressBackendUrl}/api/sync-fork`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            });
            if (!response.ok) {
                throw new Error('Automatic sync failed. Please try the manual method.');
            }
            setShowSyncDialog(false);
            handleSubmit();
        } catch (error) {
            alert(error.message);
        } finally {
            setIsSyncing(false);
        }
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        setPublishStatus({ stage: 'idle', error: null, commitUrl: null, pullRequestUrl: null });

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

        try {
            if (!token) {
                alert('Authentication error: You are not logged in. Please log in again.');
                setIsLoading(false);
                return;
            }

            setPublishStatus((prev) => ({ ...prev, stage: 'forking' }));
            const response = await fetch(`${expressBackendUrl}/api/publish`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(payloadForPublish),
            });
            const result = await response.json();

            if (!response.ok) {
                if (result.error && result.error.includes('SYNC_CONFLICT')) {
                    if (user?.username) {
                        setUserForkUrl(`https://github.com/${user.username}/architecture-center`);
                    }
                    setShowSyncDialog(true);
                    setPublishStatus({ stage: 'idle', error: null, commitUrl: null, pullRequestUrl: null });
                    setIsLoading(false);
                    return;
                }
                throw new Error(result.error || 'Failed to publish to GitHub.');
            }

            await sleep(1000);
            setPublishStatus((prev) => ({ ...prev, stage: 'packaging' }));
            await sleep(1000);
            setPublishStatus((prev) => ({ ...prev, stage: 'committing' }));
            await sleep(1000);

            setPublishStatus({
                stage: 'success',
                error: null,
                commitUrl: result.commitUrl,
                pullRequestUrl: result.pullRequestUrl,
            });
        } catch (error: any) {
            console.error('Publishing failed:', error);
            setPublishStatus({ stage: 'error', error: error.message, commitUrl: null, pullRequestUrl: null });
        }
    };

    const closeLoadingModal = () => {
        setPublishStatus({ stage: 'idle', error: null, commitUrl: null, pullRequestUrl: null });
    };

    const handleSuccessAndReset = () => {
        const urlToOpen = publishStatus.pullRequestUrl || publishStatus.commitUrl;
        if (urlToOpen) {
            window.open(urlToOpen, '_blank', 'noopener,noreferrer');
        }
        resetStore();
        history.push(baseUrl);
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

    const handleInfoClick = () => {
        const infoUrl = `${baseUrl}community/get-started-quickstart`;
        window.open(infoUrl, '_blank', 'noopener,noreferrer');
    };

    return (
        <LexicalComposer initialConfig={editorConfig}>
            <div className={styles.editorPageWrapper}>
                <div className={styles.navColumn}>
                    <PageTabs onAddNew={onAddNew} />
                </div>
                <div className={styles.editorColumn}>
                    <div className={styles.editorContentWrapper}>
                        <div className={styles.editorHeader}>
                            <Button
                                icon="sap-icon://information"
                                onClick={handleInfoClick}
                                tooltip="Learn more about contributing"
                            ></Button>
                            {lastSaveTimestamp && (
                                <span className={styles.saveTimestamp}>Last saved: {lastSaveTimestamp}</span>
                            )}
                            <div className={styles.headerButtons}>
                                <Button design="Emphasized" onClick={handleSubmit} disabled={isLoading}>
                                    {isLoading ? 'Submitting...' : 'Submit'}
                                </Button>
                                {activeDocument && (
                                    <Button
                                        design="Default"
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
                            <ToolbarPlugin />
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
                                <FloatingToolbarPlugin />
                            </div>
                            <ContributorsDisplay
                                contributors={activeDocument?.contributors || []}
                                onContributorsChange={handleContributorsUpdate}
                            />
                        </div>
                    </div>
                </div>
                <div className={styles.tocColumn}>
                    <TableOfContentsPlugin />
                </div>
            </div>
            {showDeleteConfirm && activeDocument && (
                <Dialog
                    open={showDeleteConfirm}
                    headerText="Delete Document"
                    footer={
                        <Bar
                            endContent={
                                <>
                                    <Button
                                        design="Emphasized"
                                        onClick={() => {
                                            deleteDocument(activeDocument.id);
                                            setShowDeleteConfirm(false);
                                        }}
                                    >
                                        Delete
                                    </Button>
                                    <Button design="Transparent" onClick={() => setShowDeleteConfirm(false)}>
                                        Cancel
                                    </Button>
                                </>
                            }
                        />
                    }
                >
                    <Text>
                        Are you sure you want to delete <strong>{activeDocument.title || 'Untitled Page'}</strong>?
                        <br />
                        This action cannot be undone.
                    </Text>
                </Dialog>
            )}
            <LoadingModal
                status={publishStatus.stage}
                error={publishStatus.error}
                commitUrl={publishStatus.commitUrl}
                pullRequestUrl={publishStatus.pullRequestUrl}
                onClose={closeLoadingModal}
                onSuccessFinish={handleSuccessAndReset}
            />
            <Dialog
                open={showSyncDialog}
                header={
                    <Bar>
                        <Title>Sync Required</Title>
                    </Bar>
                }
                footer={
                    <Bar
                        endContent={
                            <>
                                <Button
                                    design="Transparent"
                                    className={styles.transparentButton}
                                    onClick={() => {
                                        setShowSyncDialog(false);
                                        handleSubmit();
                                    }}
                                    disabled={isSyncing}
                                >
                                    I've Synced Manually, Retry
                                </Button>
                                {/* <Button design="Default" onClick={handleAutomaticSync} disabled={isSyncing}>
                                    {isSyncing ? 'Syncing...' : 'Try Automatic Sync Again'}
                                </Button> */}
                                <Button onClick={() => setShowSyncDialog(false)} disabled={isSyncing}>
                                    Cancel
                                </Button>
                            </>
                        }
                    />
                }
            >
                <div style={{ padding: '1.5rem', fontSize: '1rem', color: '#333' }}>
                    <p style={{ marginTop: 0, marginBottom: '1rem' }}>
                        Your fork is out of sync and could not be updated automatically.
                    </p>
                    <p style={{ marginBottom: '1.5rem' }}>
                        Please sync your fork manually on GitHub and then try again, or attempt another automatic sync.
                    </p>
                    <h4 style={{ marginBottom: '0.5rem', fontWeight: 600 }}>Manual Sync Instructions:</h4>
                    <ol style={{ paddingLeft: '20px', margin: 0, lineHeight: '1.8' }}>
                        <li>
                            <strong>
                                <a
                                    href={userForkUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: '#0b65de' }}
                                >
                                    Open your fork on GitHub
                                </a>
                            </strong>
                        </li>
                        <li>Find the "Sync fork" button near the top of the page.</li>
                        <li>Click "Update branch" to complete the sync.</li>
                    </ol>
                </div>
            </Dialog>
        </LexicalComposer>
    );
};

export default Editor;
