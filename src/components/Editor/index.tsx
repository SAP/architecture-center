import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import '@ui5/webcomponents-icons/dist/AllIcons';
import { Button, Dialog, Bar, Text, Title } from '@ui5/webcomponents-react';
import { usePageDataStore, Document } from '@site/src/store/pageDataStore';
import { useAuth } from '@site/src/context/AuthContext';
import { EditorCore } from './core';
import { EditorContext, EditorContextValue } from './hooks/useEditor';
import { ImageNode, DrawioNode } from './core/types';
import { serializeState } from './core/EditorState';
import ToolbarPlugin from './plugins/ToolbarPlugin';
import FloatingToolbarPlugin from './plugins/FloatingToolbarPlugin';
import SlashCommandPlugin from './plugins/SlashCommandPlugin';
import BlockHandlePlugin from './plugins/BlockHandlePlugin';
import TableMenuPlugin from './plugins/TableMenuPlugin';
import TableOfContentsPlugin from './plugins/TableOfContentsPlugin';
import { convertToLexicalFormat } from './utils/convertToLexical';
import { getApiService } from '@site/src/services/api';
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
    const parentDoc = allDocs.find((d) => d.id === currentDoc!.parentId);
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

interface TransformedDocument {
  id: string;
  editorState: string;
  parentId: string | null;
  children: TransformedDocument[];
  metadata: {
    title: string;
    tags: string[];
    authors: string[];
    contributors: string[];
    description: string;
  };
}

const transformTreeForBackend = (doc: Document): TransformedDocument => {
  return {
    id: doc.id,
    editorState: doc.editorState ? convertToLexicalFormat(doc.editorState) : '',
    parentId: doc.parentId,
    children: doc.children ? doc.children.map(transformTreeForBackend) : [],
    metadata: {
      title: doc.title,
      tags: doc.tags ?? [],
      authors: doc.authors,
      contributors: doc.contributors ?? [],
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
    currentDoc = allDocs.find((d) => d.id === currentDoc!.parentId);
  }
  return path;
};

interface EditorContentProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
}

function EditorContent({ containerRef }: EditorContentProps) {
  return (
    <div className={styles.editorInner}>
      <div
        ref={containerRef}
        className={styles.editorInput}
      />
      <FloatingToolbarPlugin />
      <SlashCommandPlugin />
      <BlockHandlePlugin />
      <TableMenuPlugin />
    </div>
  );
}

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
  const { getActiveDocument, lastSaveTimestamp, deleteDocument, documents, resetStore, updateDocument, isSyncing, syncError, syncOperations } =
    usePageDataStore();
  const { token, user } = useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const activeDocument = getActiveDocument();
  const { siteConfig } = useDocusaurusContext();
  const { expressBackendUrl } = siteConfig.customFields as { expressBackendUrl: string };
  const editorColumnRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const coreRef = useRef<EditorCore | null>(null);
  const [contextValue, setContextValue] = useState<EditorContextValue | null>(null);
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

  const loadAssetsForState = useCallback(async (core: EditorCore) => {
    console.log('[Editor] loadAssetsForState called', { hasToken: !!token, hasBackendUrl: !!expressBackendUrl });
    if (!token || !expressBackendUrl) {
      console.log('[Editor] Skipping asset load - missing token or backend URL');
      return;
    }

    const state = core.getState();
    const api = getApiService(expressBackendUrl);

    const assetPromises: Promise<void>[] = [];

    state.nodeMap.forEach((node, key) => {
      if (node.type === 'image') {
        const imageNode = node as ImageNode;
        console.log('[Editor] Found image node:', { key, assetId: imageNode.assetId, hasSrc: !!imageNode.src });
        if (imageNode.assetId && !imageNode.src) {
          assetPromises.push(
            api.getAssetWithContent(token, imageNode.assetId)
              .then((asset) => {
                console.log('[Editor] Image asset fetched:', {
                  assetId: imageNode.assetId,
                  hasContent: !!asset.content,
                  mediaType: asset.mediaType,
                  contentLength: asset.content?.length,
                });
                if (asset.content) {
                  let src: string;
                  // Check if content is already a data URL
                  if (asset.content.startsWith('data:')) {
                    src = asset.content;
                  } else {
                    // Content is base64 encoded, create proper data URL
                    src = `data:${asset.mediaType || 'image/png'};base64,${asset.content}`;
                  }
                  console.log('[Editor] Setting image src, length:', src.length);
                  core.updateNodeDisplay(key, { src });
                }
              })
              .catch((err) => console.warn(`Failed to load image asset ${imageNode.assetId}:`, err))
          );
        }
      } else if (node.type === 'drawio') {
        const drawioNode = node as DrawioNode;
        if (drawioNode.assetId && !drawioNode.diagramXML) {
          assetPromises.push(
            api.getAssetWithContent(token, drawioNode.assetId)
              .then((asset) => {
                console.log('[Editor] Drawio asset fetched:', {
                  assetId: drawioNode.assetId,
                  hasContent: !!asset.content,
                  contentLength: asset.content?.length,
                });
                if (asset.content) {
                  let xml: string;
                  // Check if content is XML or base64-encoded XML
                  if (asset.content.startsWith('<?xml') || asset.content.startsWith('<mxfile')) {
                    xml = asset.content;
                  } else {
                    // Decode from base64
                    try {
                      xml = decodeURIComponent(escape(atob(asset.content)));
                    } catch {
                      try {
                        xml = atob(asset.content);
                      } catch {
                        console.warn('Could not decode drawio content');
                        xml = asset.content;
                      }
                    }
                  }
                  console.log('[Editor] Setting drawio XML, length:', xml.length, 'preview:', xml.substring(0, 50));
                  core.updateNodeDisplay(key, { diagramXML: xml });
                }
              })
              .catch((err) => console.warn(`Failed to load drawio asset ${drawioNode.assetId}:`, err))
          );
        }
      }
    });

    console.log('[Editor] Loading', assetPromises.length, 'assets');
    await Promise.all(assetPromises);
  }, [token, expressBackendUrl]);

  useEffect(() => {
    const activeDoc = getActiveDocument();
    if (!containerRef.current) return;

    // Check if document has valid editorState with proper structure
    // Delta sync only works if backend already has the node structure
    const hasValidState = (() => {
      if (!activeDoc?.editorState) return false;
      try {
        const parsed = JSON.parse(activeDoc.editorState);
        const isValid = parsed.root && parsed.nodeMap && Object.keys(parsed.nodeMap).length > 0;
        console.log('[Editor] Checking state validity:', {
          hasEditorState: !!activeDoc.editorState,
          root: parsed.root,
          nodeMapKeys: Object.keys(parsed.nodeMap || {}).length,
          isValid
        });
        return isValid;
      } catch (e) {
        console.log('[Editor] Failed to parse editorState:', e);
        return false;
      }
    })();

    // Track whether delta sync is safe to use
    // Start with hasValidState - if backend has valid state, we can use delta sync immediately
    let canUseDeltaSync = hasValidState;
    // Track if a full sync is in progress (to avoid race conditions)
    let fullSyncInProgress = false;
    let fullSyncTimeout: NodeJS.Timeout | null = null;

    console.log('[Editor] Initial canUseDeltaSync:', canUseDeltaSync);

    const core = new EditorCore({
      initialState: activeDoc?.editorState ?? undefined,
      onChange: (serializedState) => {
        const doc = getActiveDocument();
        if (doc && serializedState !== doc.editorState) {
          if (canUseDeltaSync && !fullSyncInProgress) {
            // Delta sync is active - just update local state, operations handle remote sync
            updateDocument(doc.id, { editorState: serializedState }, true);
          } else if (!fullSyncInProgress) {
            // Need to do full sync first to establish base state
            fullSyncInProgress = true;
            console.log('[Editor] Starting initial full sync mode...');

            // Clear any pending operations - we'll use full sync instead
            core.clearOperations();

            // Update local state only for now
            updateDocument(doc.id, { editorState: serializedState }, true);

            // Schedule full sync after typing settles
            // During this window, all changes go to local state only
            fullSyncTimeout = setTimeout(() => {
              // Clear operations accumulated during the wait
              core.clearOperations();

              // Get the CURRENT state (which includes ALL typing so far)
              const currentState = serializeState(core.getState());
              const currentDoc = getActiveDocument();

              if (currentDoc) {
                console.log('[Editor] Performing full sync with state length:', currentState.length);
                // Do full sync with current complete state
                updateDocument(currentDoc.id, { editorState: currentState }, false);
              }

              // Wait for sync to complete, then enable delta sync
              setTimeout(() => {
                // Final clear before enabling delta sync
                core.clearOperations();
                canUseDeltaSync = true;
                fullSyncInProgress = false;
                console.log('[Editor] Full sync complete, delta sync enabled');
              }, 2500);
            }, 3000);
          } else {
            // Full sync in progress - just update local state
            updateDocument(doc.id, { editorState: serializedState }, true);
          }
        }
      },
      onSyncOperations: (ops) => {
        const doc = getActiveDocument();
        // Only use delta sync if backend has valid state structure and not during initial full sync
        if (doc && canUseDeltaSync && !fullSyncInProgress) {
          console.log('[Editor] Delta sync - operations:', ops.length, ops);
          syncOperations(doc.id, ops).then((lastOpId) => {
            if (lastOpId) {
              core.markSynced(lastOpId);
              console.log('[Editor] Operations synced, lastOpId:', lastOpId);
            }
          }).catch((error) => {
            console.error('[Editor] Delta sync failed:', error);
          });
        } else {
          console.log('[Editor] Skipping delta sync - canUseDeltaSync:', canUseDeltaSync, 'fullSyncInProgress:', fullSyncInProgress);
        }
      },
      syncDebounceMs: 1000,
    });

    core.mount(containerRef.current);
    coreRef.current = core;

    const updateContext = () => {
      setContextValue({
        core,
        state: core.getState(),
        selection: core.getSelection(),
        dispatchCommand: (cmd) => core.dispatchCommand(cmd),
        getActiveFormats: () => core.getActiveFormats(),
        getActiveBlockType: () => core.getActiveBlockType(),
        canUndo: () => core.canUndo(),
        canRedo: () => core.canRedo(),
      });
    };

    updateContext();
    const unsubscribe = core.subscribe(updateContext);

    loadAssetsForState(core);

    return () => {
      // Clear any pending full sync timeout
      if (fullSyncTimeout) {
        clearTimeout(fullSyncTimeout);
      }
      unsubscribe();
      core.destroy();
    };
  }, [getActiveDocument, updateDocument, loadAssetsForState, syncOperations]);

  // Reload assets when token becomes available (after initial mount)
  useEffect(() => {
    if (token && coreRef.current) {
      loadAssetsForState(coreRef.current);
    }
  }, [token, loadAssetsForState]);

  const breadcrumbPath = useMemo(
    () => buildBreadcrumbPath(activeDocument?.id ?? null, documents),
    [activeDocument, documents]
  );

  const handleContributorsUpdate = (updatedContributors: string[]) => {
    if (activeDocument) {
      updateDocument(activeDocument.id, { contributors: updatedContributors });
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
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setPublishStatus({ stage: 'error', error: errorMessage, commitUrl: null, pullRequestUrl: null });
      setIsLoading(false);
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

    // Delete the submitted document (and its children) instead of resetting entire store
    if (activeDocument) {
      const rootDoc = findRootDocument(activeDocument.id, documents);
      if (rootDoc) {
        // Delete all documents in this ref arch tree
        const docsToDelete = documents.filter(d => {
          let current = d;
          while (current) {
            if (current.id === rootDoc.id) return true;
            current = documents.find(doc => doc.id === current.parentId) as typeof current;
          }
          return false;
        });
        docsToDelete.forEach(doc => deleteDocument(doc.id));
      }
    }

    // If no documents left, redirect to home
    if (documents.length <= 1) {
      history.push(baseUrl);
    }

    setIsLoading(false);
    closeLoadingModal();
  };

  const handleInfoClick = () => {
    const infoUrl = `${baseUrl}community/get-started-quickstart`;
    window.open(infoUrl, '_blank', 'noopener,noreferrer');
  };

  if (!activeDocument) return null;

  return (
    <EditorContext.Provider value={contextValue}>
      <div className={styles.editorPageWrapper}>
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
                {lastSaveTimestamp && (
                  <span className={styles.saveTimestamp}>
                    {isSyncing ? 'Saving...' : syncError ? `Error: ${syncError}` : `Last saved: ${lastSaveTimestamp}`}
                  </span>
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
                <div className={styles.editorScrollArea}>
                  <div className={styles.contentHeader}>
                    <Breadcrumbs path={breadcrumbPath} />
                    <ArticleHeader />
                  </div>
                  <div className={styles.stickyToolbarWrapper}>
                    {contextValue && <ToolbarPlugin />}
                  </div>
                  <EditorContent containerRef={containerRef} />
                  <ContributorsDisplay
                    contributors={[
                      ...(activeDocument?.authors || []),
                      ...(activeDocument?.contributors || []).filter(
                        c => !(activeDocument?.authors || []).includes(c)
                      )
                    ]}
                    onContributorsChange={handleContributorsUpdate}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className={styles.tocColumn}>
            {contextValue && <TableOfContentsPlugin />}
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
                  onClick={() => {
                    setShowSyncDialog(false);
                    handleSubmit();
                  }}
                >
                  I've Synced Manually, Retry
                </Button>
                <Button onClick={() => setShowSyncDialog(false)}>
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
            Please sync your fork manually on GitHub and then try again.
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
    </div>
    </EditorContext.Provider>
  );
};

export default Editor;
