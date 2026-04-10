import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
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
import { Button, Dialog, Bar, Text, Title, BusyIndicator } from '@ui5/webcomponents-react';
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
import EmptyLineCommandHintPlugin from './plugins/EmptyLineCommandHintPlugin';
import SpotlightSearchPlugin from './plugins/SpotlightSearchPlugin';
import { AdmonitionNode } from './nodes/AdmonitionNode';
import AdmonitionPlugin from './plugins/AdmonitionPlugin';
import EditorTheme from './EditorTheme';
import styles from './index.module.css';
import PageTabs from '../PageTabs';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { useHistory } from '@docusaurus/router';
import LoadingModal, { PublishStage } from '../LoadingModal';
import ArticleHeader from '../ArticleHeader';
import Breadcrumbs from '../Breadcrumbs';
import ContributorsDisplay from '../ContributorsDisplay';
import { publishDocument, syncFork } from '@site/src/services/documentApi';
import ArchitecturePillSwitcher from '../ArchitecturePillSwitcher';

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
    return null;
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
    AdmonitionNode,
];

/**
 * Save status indicator component
 */
const SaveStatusIndicator: React.FC<{
    isSaving: boolean;
    lastSaveTimestamp: string | null;
    saveError: Error | null;
    onRetry?: () => void;
}> = ({ isSaving, lastSaveTimestamp, saveError, onRetry }) => {
    if (saveError) {
        return (
            <div className={styles.saveStatus}>
                <span className={styles.saveError}>
                    Save failed
                    {onRetry && (
                        <Button
                            design="Transparent"
                            onClick={onRetry}
                            className={styles.retryButton}
                        >
                            Retry
                        </Button>
                    )}
                </span>
            </div>
        );
    }

    if (isSaving) {
        return (
            <div className={styles.saveStatus}>
                <BusyIndicator size="S" active />
                <span className={styles.savingText}>Saving...</span>
            </div>
        );
    }

    if (lastSaveTimestamp) {
        return (
            <div className={styles.saveStatus}>
                <span className={styles.saveTimestamp}>Saved at {lastSaveTimestamp}</span>
            </div>
        );
    }

    return null;
};

/**
 * AutoSave plugin - uses the store's debounced saveEditorState
 */
const AutoSavePlugin: React.FC = () => {
    const [editor] = useLexicalComposerContext();
    const activeDocumentId = usePageDataStore((state) => state.activeDocumentId);
    const saveEditorState = usePageDataStore((state) => state.saveEditorState);
    const getActiveDocument = usePageDataStore((state) => state.getActiveDocument);

    const handleChange = useCallback(
        (editorState: any) => {
            const activeDoc = getActiveDocument();
            if (activeDoc && activeDocumentId) {
                const editorStateJSON = JSON.stringify(editorState.toJSON());
                // Only save if content actually changed
                if (editorStateJSON !== activeDoc.editorState) {
                    saveEditorState(activeDocumentId, editorStateJSON);
                }
            }
        },
        [activeDocumentId, saveEditorState, getActiveDocument]
    );

    return <OnChangePlugin onChange={handleChange} />;
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
    const {
        getActiveDocument,
        lastSaveTimestamp,
        deleteDocumentAsync,
        documents,
        resetStore,
        setDocumentContributorsAsync,
        isSaving,
        saveError,
        flushPendingChanges,
    } = usePageDataStore();
    const { token, user } = useAuth();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const activeDocument = getActiveDocument();
    const { siteConfig } = useDocusaurusContext();
    const editorColumnRef = useRef<HTMLDivElement>(null);
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
    const [uploadError, setUploadError] = useState<string | null>(null);

    const breadcrumbPath = useMemo(
        () => buildBreadcrumbPath(activeDocument?.id, documents),
        [activeDocument, documents]
    );

    const handleContributorsUpdate = async (updatedContributors: string[]) => {
        if (activeDocument) {
            try {
                await setDocumentContributorsAsync(activeDocument.id, updatedContributors);
            } catch (error) {
                console.error('Failed to update contributors:', error);
            }
        }
    };

    const handleUploadError = useCallback((error: Error) => {
        setUploadError(error.message);
        // Auto-clear after 5 seconds
        setTimeout(() => setUploadError(null), 5000);
    }, []);

    const handleAutomaticSync = async () => {
        setIsSyncing(true);
        try {
            await syncFork();
            setShowSyncDialog(false);
            handleSubmit();
        } catch (error: any) {
            alert(error.message || 'Automatic sync failed. Please try the manual method.');
        } finally {
            setIsSyncing(false);
        }
    };

    const handleSubmit = async () => {
        setIsPublishing(true);
        setPublishStatus({ stage: 'idle', error: null, commitUrl: null, pullRequestUrl: null });

        if (!activeDocument) {
            alert('No active document to publish.');
            setIsPublishing(false);
            return;
        }

        // Flush any pending changes before publishing
        try {
            await flushPendingChanges();
        } catch (error) {
            console.warn('Failed to flush pending changes:', error);
        }

        const rootDoc = findRootDocument(activeDocument.id, documents);
        if (!rootDoc) {
            alert('Could not find the root document for publishing.');
            setIsPublishing(false);
            return;
        }

        try {
            if (!token) {
                alert('Authentication error: You are not logged in. Please log in again.');
                setIsPublishing(false);
                return;
            }

            setPublishStatus((prev) => ({ ...prev, stage: 'forking' }));

            // Use the new publishDocument API that sends only rootDocumentId
            const result = await publishDocument(rootDoc.id);

            await sleep(500);
            setPublishStatus((prev) => ({ ...prev, stage: 'packaging' }));
            await sleep(500);
            setPublishStatus((prev) => ({ ...prev, stage: 'committing' }));
            await sleep(500);

            setPublishStatus({
                stage: 'success',
                error: null,
                commitUrl: result.commitUrl,
                pullRequestUrl: result.pullRequestUrl || null,
            });
        } catch (error: any) {
            console.error('Publishing failed:', error);

            // Check for sync conflict
            if (error.message && error.message.includes('SYNC_CONFLICT')) {
                if (user?.username) {
                    setUserForkUrl(`https://github.com/${user.username}/architecture-center`);
                }
                setShowSyncDialog(true);
                setPublishStatus({ stage: 'idle', error: null, commitUrl: null, pullRequestUrl: null });
                setIsPublishing(false);
                return;
            }

            setPublishStatus({
                stage: 'error',
                error: error.message || 'Failed to publish',
                commitUrl: null,
                pullRequestUrl: null,
            });
        } finally {
            setIsPublishing(false);
        }
    };

    const handleDelete = async () => {
        if (!activeDocument) return;

        setIsDeleting(true);
        try {
            await deleteDocumentAsync(activeDocument.id);
            setShowDeleteConfirm(false);
        } catch (error) {
            console.error('Failed to delete document:', error);
            alert('Failed to delete document. Please try again.');
        } finally {
            setIsDeleting(false);
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

    const handleCreateNewArchitecture = () => {
        onAddNew(null); // null parentId creates a root architecture
    };

    return (
        <LexicalComposer initialConfig={editorConfig}>
            <div className={styles.editorPageWrapper}>
                <ArchitecturePillSwitcher onCreateNew={handleCreateNewArchitecture} />
                <div className={styles.editorMainLayout}>
                    <div className={styles.navColumn}>
                        <PageTabs onAddNew={onAddNew} />
                    </div>
                    <div className={styles.mainAndTocWrapper}>
                    <div className={styles.editorColumn} ref={editorColumnRef}>
                        <div className={styles.editorContentWrapper}>
                            <div className={styles.editorHeader}>
                                <Button
                                    icon="sap-icon://information"
                                    onClick={handleInfoClick}
                                    tooltip="Learn more about contributing"
                                ></Button>
                                <SaveStatusIndicator
                                    isSaving={isSaving}
                                    lastSaveTimestamp={lastSaveTimestamp}
                                    saveError={saveError}
                                    onRetry={flushPendingChanges}
                                />
                                {uploadError && (
                                    <span className={styles.uploadError}>{uploadError}</span>
                                )}
                                <div className={styles.headerButtons}>
                                    <Button
                                        design="Emphasized"
                                        onClick={handleSubmit}
                                        disabled={isPublishing || isSaving}
                                    >
                                        {isPublishing ? 'Submitting...' : 'Submit'}
                                    </Button>
                                    {activeDocument && (
                                        <Button
                                            design="Default"
                                            onClick={() => setShowDeleteConfirm(true)}
                                            tooltip="Delete current document"
                                            disabled={isDeleting}
                                        >
                                            {isDeleting ? 'Deleting...' : 'Delete'}
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
                                    <ImagePlugin onUploadError={handleUploadError} />
                                    <DrawioPlugin onUploadError={handleUploadError} />
                                    <AdmonitionPlugin />
                                    <SlashCommandPlugin />
                                    <EmptyLineCommandHintPlugin />
                                    <SpotlightSearchPlugin />
                                    <AutoSavePlugin />
                                    <InitializerPlugin />
                                    <FloatingToolbarPlugin />
                                </div>
                                <ContributorsDisplay
                                    contributors={activeDocument?.contributors || []}
                                />
                            </div>
                        </div>
                    </div>
                    <div className={styles.tocColumn}>
                        <TableOfContentsPlugin />
                    </div>
                </div>
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
                                        onClick={handleDelete}
                                        disabled={isDeleting}
                                    >
                                        {isDeleting ? 'Deleting...' : 'Delete'}
                                    </Button>
                                    <Button
                                        design="Transparent"
                                        onClick={() => setShowDeleteConfirm(false)}
                                        disabled={isDeleting}
                                    >
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
