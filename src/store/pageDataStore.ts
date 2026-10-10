import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import type { Operation } from '@site/src/components/Editor/core/Operations';
import { logger } from '../utils/logger';

export interface PageMetadata {
    title: string;
    tags: string[];
    authors: string[];
    contributors?: string[];
    description?: string;
}

export interface Document extends PageMetadata {
    id: string;
    editorState: string | null;
    parentId: string | null;
    children?: Document[];
    updatedAt?: string | null;
    // Remote sync status
    _synced?: boolean;
    _remoteId?: string;
    // Read-only flag for contributors (non-authors)
    isReadOnly?: boolean;
    // Dirty flags to track what needs syncing
    _contributorsDirty?: boolean;
    _tagsDirty?: boolean;
}

interface PageDataState {
    documents: Document[];
    lastSaveTimestamp: string | null;
    activeDocumentId: string | null;
    openDocumentIds: string[];  // Array of open root document IDs (ref archs)
    isLoading: boolean;
    isCreating: boolean;  // Separate state for document creation
    isSyncing: boolean;
    syncError: string | null;
    backendUrl: string | null;
    authToken: string | null;
    currentUsername: string | null;

    // Getters
    getDocuments: () => Document[];
    getActiveDocument: () => Document | null;
    getRootDocumentId: (docId: string) => string | null;

    // Local actions
    addDocument: (metadata: PageMetadata, parentId?: string | null) => void;
    updateDocument: (id: string, updates: Partial<Document>, skipRemoteSync?: boolean) => void;
    setActiveDocumentId: (id: string | null) => void;
    openDocument: (id: string) => void;
    closeDocument: (id: string) => void;
    deleteDocument: (id: string) => void;
    resetStore: () => void;

    // Remote sync actions
    setBackendConfig: (backendUrl: string, authToken: string, username: string) => void;
    fetchDocuments: () => Promise<void>;
    syncDocument: (id: string) => Promise<void>;
    syncOperations: (documentId: string, operations: Operation[]) => Promise<string | null>;
    createRemoteDocument: (metadata: PageMetadata, parentId?: string | null) => Promise<Document | null>;
    deleteRemoteDocument: (id: string) => Promise<void>;
}

const safeLocalStorage: StateStorage = {
    getItem: (key) => {
        if (typeof window === 'undefined') {
            return null;
        }
        return localStorage.getItem(key);
    },
    setItem: (key, value) => {
        if (typeof window === 'undefined') {
            return;
        }
        localStorage.setItem(key, value);
    },
    removeItem: (key) => {
        if (typeof window === 'undefined') {
            return;
        }
        localStorage.removeItem(key);
    },
};

// Throttled storage to reduce localStorage writes - writes at most every 2 seconds
let pendingWrite: { key: string; value: string } | null = null;
let writeTimeout: NodeJS.Timeout | null = null;
const STORAGE_THROTTLE_MS = 2000;

const throttledLocalStorage: StateStorage = {
    getItem: (key) => safeLocalStorage.getItem(key),
    setItem: (key, value) => {
        pendingWrite = { key, value };

        if (!writeTimeout) {
            writeTimeout = setTimeout(() => {
                if (pendingWrite) {
                    safeLocalStorage.setItem(pendingWrite.key, pendingWrite.value);
                    pendingWrite = null;
                }
                writeTimeout = null;
            }, STORAGE_THROTTLE_MS);
        }
    },
    removeItem: (key) => safeLocalStorage.removeItem(key),
};

// Flush pending writes immediately (call before page unload)
const flushPendingWrites = () => {
    if (pendingWrite) {
        safeLocalStorage.setItem(pendingWrite.key, pendingWrite.value);
        pendingWrite = null;
    }
    if (writeTimeout) {
        clearTimeout(writeTimeout);
        writeTimeout = null;
    }
};

// Add beforeunload handler to flush writes
if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', flushPendingWrites);
}

const findDocumentById = (docs: Document[], id: string | null): Document | null => {
    if (!id) return null;
    for (const doc of docs) {
        if (doc.id === id) return doc;
        if (doc.children) {
            const found = findDocumentById(doc.children, id);
            if (found) return found;
        }
    }
    return null;
};

// Debounce helper for auto-save.
// Keyed per document id: editing document B must NOT cancel a pending save of
// document A. A single shared timer would drop A's changes silently when the
// user switches documents within the debounce window.
const syncTimeouts = new Map<string, NodeJS.Timeout>();
// Ids of documents whose debounced sync is currently in flight. Because timers
// are per-document, several syncs can run concurrently; the global isSyncing /
// syncError state must only settle once ALL of them finish, otherwise the first
// to complete would hide that another document is still saving (or wipe its error).
const activeSyncIds = new Set<string>();
// Per-document last sync error. A single shared `syncError` string is wrong when
// several documents sync concurrently: the later-completing document's success
// branch would compute syncError = null and silently wipe a different document's
// real error. Tracking errors per id lets the derived global syncError stay
// truthful regardless of completion order.
const syncErrors = new Map<string, string>();
// Derive the global syncError shown in the UI from the per-document map: surface
// any still-outstanding error, or null when none remain.
const deriveSyncError = (): string | null => {
    const first = syncErrors.values().next();
    return first.done ? null : first.value;
};
const SYNC_DEBOUNCE_MS = 2000;

export const usePageDataStore = create<PageDataState>()(
    persist(
        (set, get) => ({
            documents: [],
            lastSaveTimestamp: null,
            activeDocumentId: null,
            openDocumentIds: [],
            isLoading: false,
            isCreating: false,
            isSyncing: false,
            syncError: null,
            backendUrl: null,
            authToken: null,
            currentUsername: null,

            getDocuments: () => get().documents,

            getActiveDocument: () => {
                const { documents, activeDocumentId } = get();
                const activeDoc = findDocumentById(documents, activeDocumentId);
                return activeDoc ? JSON.parse(JSON.stringify(activeDoc)) : null;
            },

            getRootDocumentId: (docId: string) => {
                const { documents } = get();
                let currentDoc = documents.find(d => d.id === docId);
                if (!currentDoc) return null;
                while (currentDoc.parentId) {
                    const parentDoc = documents.find(d => d.id === currentDoc!.parentId);
                    if (!parentDoc) break;
                    currentDoc = parentDoc;
                }
                return currentDoc.id;
            },

            setActiveDocumentId: (id) => set({ activeDocumentId: id }),

            openDocument: (id: string) => {
                const { documents, openDocumentIds, getRootDocumentId } = get();
                const doc = documents.find(d => d.id === id);
                if (!doc) return;

                // Find root document ID
                const rootId = getRootDocumentId(id);
                if (!rootId) return;

                // Add to open documents if not already open
                const newOpenIds = openDocumentIds.includes(rootId)
                    ? openDocumentIds
                    : [...openDocumentIds, rootId];

                set({
                    openDocumentIds: newOpenIds,
                    activeDocumentId: id,
                });
            },

            closeDocument: (id: string) => {
                const { openDocumentIds, activeDocumentId, getRootDocumentId } = get();

                // Find root document ID
                const rootId = getRootDocumentId(id);
                if (!rootId) return;

                const newOpenIds = openDocumentIds.filter(openId => openId !== rootId);

                // If closing the active document's root, switch to another open doc
                let newActiveId = activeDocumentId;
                if (activeDocumentId) {
                    const activeRootId = getRootDocumentId(activeDocumentId);
                    if (activeRootId === rootId) {
                        // Switch to first remaining open document, or null
                        newActiveId = newOpenIds.length > 0 ? newOpenIds[0] : null;
                    }
                }

                set({
                    openDocumentIds: newOpenIds,
                    activeDocumentId: newActiveId,
                });
            },

            setBackendConfig: (backendUrl, authToken, username) => {
                logger.debug('[PageDataStore] Backend configured:', { backendUrl, hasToken: !!authToken });
                set({ backendUrl, authToken, currentUsername: username });
            },

            // Fetch all documents from remote
            fetchDocuments: async () => {
                const { backendUrl, authToken, currentUsername, documents: localDocuments } = get();
                logger.debug('[PageDataStore] fetchDocuments called:', { backendUrl, hasToken: !!authToken });
                if (!backendUrl || !authToken) {
                    logger.warn('[PageDataStore] Backend not configured, skipping fetch');
                    return;
                }

                set({ isLoading: true, syncError: deriveSyncError() });

                try {
                    logger.debug('[PageDataStore] Fetching documents from:', `${backendUrl}/quickstart/document-service/Documents`);
                    const response = await fetch(
                        `${backendUrl}/quickstart/document-service/Documents?$expand=author,contributors($expand=user),tags($expand=tag)`,
                        {
                            headers: {
                                'Authorization': `Bearer ${authToken}`,
                                'Content-Type': 'application/json',
                            },
                        }
                    );

                    if (!response.ok) {
                        throw new Error(`Failed to fetch documents: ${response.statusText}`);
                    }

                    const data = await response.json();
                    logger.debug('[PageDataStore] Fetched documents:', data.value?.length || 0, 'documents');
                    const remoteDocuments: Document[] = data.value.map((doc: any) => {
                        const authorUsername = doc.author?.username;
                        const isAuthor = currentUsername && authorUsername === currentUsername;
                        // Debug: check for /head corruption in editorState
                        if (doc.editorState && doc.editorState.includes('/head')) {
                            logger.error('[PageDataStore] CORRUPTION DETECTED: /head found in editorState for document:', doc.ID);
                        }
                        return {
                            id: doc.ID,
                            _remoteId: doc.ID,
                            _synced: true,
                            title: doc.title,
                            description: doc.description || '',
                            parentId: doc.parent_ID || null,
                            editorState: doc.editorState || null,
                            authors: authorUsername ? [authorUsername] : [],
                            contributors: doc.contributors?.map((c: any) => c.user?.username).filter(Boolean) || [],
                            tags: doc.tags?.map((t: any) => t.tag?.code).filter(Boolean) || [],
                            isReadOnly: !isAuthor,
                            updatedAt: doc.modifiedAt || doc.createdAt || null,
                        };
                    });

                    // Merge local unsynced changes with remote data
                    const mergedDocuments = remoteDocuments.map(remoteDoc => {
                        const localDoc = localDocuments.find(d => d.id === remoteDoc.id);
                        // If local doc has unsynced changes (editorState differs), prefer local
                        if (localDoc && !localDoc._synced && localDoc.editorState) {
                            logger.debug('[PageDataStore] Preserving local changes for document:', remoteDoc.id);
                            return {
                                ...remoteDoc,
                                editorState: localDoc.editorState,
                                _synced: false, // Mark for sync
                            };
                        }
                        return remoteDoc;
                    });

                    // Also sync any preserved local changes to backend
                    const unsyncedDocs = mergedDocuments.filter(d => !d._synced);
                    if (unsyncedDocs.length > 0) {
                        logger.debug('[PageDataStore] Syncing', unsyncedDocs.length, 'locally modified documents to backend');
                        // Sync in background without blocking
                        unsyncedDocs.forEach(doc => {
                            fetch(
                                `${backendUrl}/quickstart/document-service/Documents(${doc.id})`,
                                {
                                    method: 'PATCH',
                                    headers: {
                                        'Authorization': `Bearer ${authToken}`,
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({
                                        title: doc.title,
                                        description: doc.description || null,
                                        editorState: doc.editorState,
                                    }),
                                }
                            ).then(() => {
                                logger.debug('[PageDataStore] Synced local changes for:', doc.id);
                                set(state => ({
                                    documents: state.documents.map(d =>
                                        d.id === doc.id ? { ...d, _synced: true } : d
                                    )
                                }));
                            }).catch(err => {
                                logger.error('[PageDataStore] Failed to sync local changes:', err);
                            });
                        });
                    }

                    // Full reload = fresh state: drop any stale per-document
                    // sync errors so they can't resurface via deriveSyncError().
                    syncErrors.clear();
                    set({
                        documents: mergedDocuments,
                        activeDocumentId: (() => {
                            // Prioritize "My Documents" (non-read-only) over "Shared with me" (read-only)
                            const myDocs = mergedDocuments.filter(d => d.parentId === null && !d.isReadOnly);
                            if (myDocs.length > 0) return myDocs[0].id;
                            // Fallback to shared documents if no owned documents
                            const sharedDocs = mergedDocuments.filter(d => d.parentId === null && d.isReadOnly);
                            if (sharedDocs.length > 0) return sharedDocs[0].id;
                            return mergedDocuments.length > 0 ? mergedDocuments[0].id : null;
                        })(),
                        openDocumentIds: mergedDocuments.filter(d => d.parentId === null).slice(0, 1).map(d => d.id),
                        isLoading: false,
                        lastSaveTimestamp: data.value?.[0]?.modifiedAt || data.value?.[0]?.createdAt || new Date().toISOString(),
                        syncError: deriveSyncError(),
                    });
                } catch (error) {
                    logger.error('Error fetching documents:', error);
                    syncErrors.set('__fetch__', error instanceof Error ? error.message : 'Failed to fetch documents');
                    set({
                        isLoading: false,
                        syncError: deriveSyncError(),
                    });
                }
            },

            // Sync a single document to remote (debounced auto-save)
            syncDocument: async (id: string) => {
                const { backendUrl, authToken, documents } = get();
                logger.debug('[PageDataStore] syncDocument called:', { id, hasBackend: !!backendUrl, hasToken: !!authToken });
                if (!backendUrl || !authToken) return;

                const doc = findDocumentById(documents, id);
                if (!doc) return;

                // Clear existing timeout for THIS document only
                const existingTimeout = syncTimeouts.get(id);
                if (existingTimeout) {
                    clearTimeout(existingTimeout);
                }

                // Debounce the sync (per document)
                const timeout = setTimeout(async () => {
                    syncTimeouts.delete(id);
                    activeSyncIds.add(id);
                    logger.debug('[PageDataStore] Syncing document to backend:', doc.id);
                    set({ isSyncing: true });

                    try {
                        // 1. PATCH basic document fields (title, description, editorState)
                        const patchResponse = await fetch(
                            `${backendUrl}/quickstart/document-service/Documents(${doc.id})`,
                            {
                                method: 'PATCH',
                                headers: {
                                    'Authorization': `Bearer ${authToken}`,
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    title: doc.title,
                                    description: doc.description || null,
                                    editorState: doc.editorState,
                                }),
                            }
                        );

                        if (!patchResponse.ok) {
                            throw new Error(`Failed to sync document: ${patchResponse.statusText}`);
                        }

                        // 2. Call setDocumentContributors action only if contributors changed
                        if (doc._contributorsDirty) {
                            const contributorsResponse = await fetch(
                                `${backendUrl}/quickstart/document-service/setDocumentContributors`,
                                {
                                    method: 'POST',
                                    headers: {
                                        'Authorization': `Bearer ${authToken}`,
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({
                                        documentId: doc.id,
                                        contributorsUsernames: doc.contributors || [],
                                    }),
                                }
                            );

                            if (!contributorsResponse.ok) {
                                logger.warn('Failed to sync contributors:', contributorsResponse.statusText);
                            }
                        }

                        // 3. Call setDocumentTags action only if tags changed
                        if (doc._tagsDirty) {
                            const tagsResponse = await fetch(
                                `${backendUrl}/quickstart/document-service/setDocumentTags`,
                                {
                                    method: 'POST',
                                    headers: {
                                        'Authorization': `Bearer ${authToken}`,
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({
                                        documentId: doc.id,
                                        tags: doc.tags || [],
                                    }),
                                }
                            );

                            if (!tagsResponse.ok) {
                                logger.warn('Failed to sync tags:', tagsResponse.statusText);
                            }
                        }

                        // Mark as synced and clear dirty flags
                        activeSyncIds.delete(id);
                        // This document synced cleanly: clear only ITS error.
                        syncErrors.delete(id);
                        set((state) => ({
                            documents: state.documents.map((d) =>
                                d.id === id ? { ...d, _synced: true, _contributorsDirty: false, _tagsDirty: false } : d
                            ),
                            // Only report "syncing" while other saves are still
                            // in flight, and surface any remaining per-document
                            // error so this success can't wipe a sibling's error.
                            isSyncing: activeSyncIds.size > 0,
                            lastSaveTimestamp: new Date().toISOString(),
                            syncError: deriveSyncError(),
                        }));
                    } catch (error) {
                        activeSyncIds.delete(id);
                        const message = error instanceof Error ? error.message : 'Failed to sync';
                        syncErrors.set(id, message);
                        logger.error('Error syncing document:', error);
                        set({
                            isSyncing: activeSyncIds.size > 0,
                            syncError: deriveSyncError(),
                        });
                    }
                }, SYNC_DEBOUNCE_MS);
                syncTimeouts.set(id, timeout);
            },

            // Sync operations (delta sync) instead of full state
            syncOperations: async (documentId: string, operations: Operation[]): Promise<string | null> => {
                const { backendUrl, authToken, syncDocument } = get();
                if (!backendUrl || !authToken || operations.length === 0) return null;

                set({ isSyncing: true });

                try {
                    // CAP action endpoint - serialize payload for each operation
                    const serializedOps = operations.map(op => ({
                        ...op,
                        payload: typeof op.payload === 'string' ? op.payload : JSON.stringify(op.payload),
                    }));

                    // Debug: Log operations being sent
                    logger.debug('[PageDataStore] Sending operations:', serializedOps.map(op => ({
                        type: op.type,
                        nodeKey: op.nodeKey,
                        payloadPreview: typeof op.payload === 'string' ? op.payload.substring(0, 200) : op.payload
                    })));

                    const response = await fetch(
                        `${backendUrl}/quickstart/document-service/syncOperations`,
                        {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${authToken}`,
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                documentId,
                                operations: serializedOps,
                            }),
                        }
                    );

                    if (!response.ok) {
                        throw new Error('Operations sync failed');
                    }

                    const result = await response.json();

                    // Check if operations were actually applied
                    // If appliedCount is 0, the backend state might be invalid - fall back to full sync
                    if (result.appliedCount === 0 && operations.length > 0) {
                        logger.warn('[PageDataStore] No operations were applied, falling back to full sync');
                        throw new Error('No operations applied - backend state may be invalid');
                    }

                    logger.debug('[PageDataStore] syncOperations result:', {
                        lastOpId: result.lastOpId,
                        appliedCount: result.appliedCount,
                        sentCount: operations.length
                    });

                    // Delta sync for THIS document succeeded: clear only its
                    // error and derive the global flags from the per-document
                    // map so a sibling's in-flight error is never wiped.
                    syncErrors.delete(documentId);
                    set({
                        isSyncing: activeSyncIds.size > 0,
                        lastSaveTimestamp: new Date().toLocaleString(),
                        syncError: deriveSyncError(),
                    });

                    return result.lastOpId || null;
                } catch (error) {
                    logger.warn('Operation sync failed, falling back to full state sync:', error);
                    // Fallback to full state sync (syncDocument records its own
                    // per-document error into syncErrors on failure).
                    await syncDocument(documentId);
                    set({ isSyncing: activeSyncIds.size > 0, syncError: deriveSyncError() });
                    return null;
                }
            },

            // Create a new document on remote
            createRemoteDocument: async (metadata, parentId = null) => {
                const { backendUrl, authToken, openDocumentIds } = get();
                if (!backendUrl || !authToken) {
                    // Fallback to local-only
                    const newDocument: Document = {
                        ...metadata,
                        id: uuidv4(),
                        editorState: null,
                        parentId,
                        _synced: false,
                    };
                    // If it's a root document, add to open tabs
                    const newOpenIds = parentId === null
                        ? [...openDocumentIds, newDocument.id]
                        : openDocumentIds;
                    set((state) => ({
                        documents: [...state.documents, newDocument],
                        activeDocumentId: newDocument.id,
                        openDocumentIds: newOpenIds,
                        lastSaveTimestamp: new Date().toLocaleString(),
                    }));
                    return newDocument;
                }

                syncErrors.delete('__create__');
                set({ isCreating: true, syncError: deriveSyncError() });

                try {
                    const response = await fetch(
                        `${backendUrl}/quickstart/document-service/createNewDocument`,
                        {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${authToken}`,
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                title: metadata.title,
                                description: metadata.description || null,
                                parentId: parentId,
                                tags: metadata.tags || [],
                                contributorsUsernames: metadata.contributors || [],
                                editorState: '',
                            }),
                        }
                    );

                    if (!response.ok) {
                        const errorData = await response.json().catch(() => ({}));
                        throw new Error(errorData.error?.message || `Failed to create document: ${response.statusText}`);
                    }

                    const remoteDoc = await response.json();

                    const newDocument: Document = {
                        id: remoteDoc.ID,
                        _remoteId: remoteDoc.ID,
                        _synced: true,
                        title: remoteDoc.title,
                        description: remoteDoc.description || '',
                        parentId: remoteDoc.parent_ID || null,
                        editorState: remoteDoc.editorState || null,
                        authors: remoteDoc.author ? [remoteDoc.author.username] : metadata.authors,
                        contributors: remoteDoc.contributors?.map((c: any) => c.user?.username).filter(Boolean) || [],
                        tags: remoteDoc.tags?.map((t: any) => t.tag?.code).filter(Boolean) || [],
                    };

                    set((state) => {
                        // If it's a root document, add to open tabs
                        const newOpenIds = newDocument.parentId === null
                            ? [...state.openDocumentIds, newDocument.id]
                            : state.openDocumentIds;
                        return {
                            documents: [...state.documents, newDocument],
                            activeDocumentId: newDocument.id,
                            openDocumentIds: newOpenIds,
                            lastSaveTimestamp: new Date().toISOString(),
                            isCreating: false,
                        };
                    });

                    return newDocument;
                } catch (error) {
                    logger.error('Error creating document:', error);
                    syncErrors.set('__create__', error instanceof Error ? error.message : 'Failed to create document');
                    set({
                        isCreating: false,
                        syncError: deriveSyncError(),
                    });
                    return null;
                }
            },

            // Delete document from remote
            deleteRemoteDocument: async (id: string) => {
                const { backendUrl, authToken, getRootDocumentId } = get();

                // Drop any per-document sync bookkeeping so a deleted document
                // cannot leave an orphaned ghost error or in-flight timer.
                const pending = syncTimeouts.get(id);
                if (pending) clearTimeout(pending);
                syncTimeouts.delete(id);
                activeSyncIds.delete(id);
                syncErrors.delete(id);

                // Get root ID before deletion
                const rootId = getRootDocumentId(id);

                // Always delete locally first
                set((state) => {
                    const docsToKeep = state.documents.filter((doc) => doc.id !== id && doc.parentId !== id);
                    // Remove from open tabs if it's a root document being deleted
                    const newOpenIds = rootId
                        ? state.openDocumentIds.filter(openId => openId !== rootId)
                        : state.openDocumentIds;
                    let newActiveId = state.activeDocumentId;
                    if (state.activeDocumentId === id) {
                        newActiveId = newOpenIds.length > 0 ? newOpenIds[0] : (docsToKeep.length > 0 ? docsToKeep[0].id : null);
                    }
                    return {
                        documents: docsToKeep,
                        activeDocumentId: newActiveId,
                        openDocumentIds: newOpenIds,
                        lastSaveTimestamp: new Date().toLocaleString(),
                    };
                });

                // Then delete from remote if configured
                if (backendUrl && authToken) {
                    try {
                        const response = await fetch(
                            `${backendUrl}/quickstart/document-service/Documents(${id})`,
                            {
                                method: 'DELETE',
                                headers: {
                                    'Authorization': `Bearer ${authToken}`,
                                },
                            }
                        );

                        if (!response.ok && response.status !== 404) {
                            logger.error('Failed to delete document from remote:', response.statusText);
                        }
                    } catch (error) {
                        logger.error('Error deleting document from remote:', error);
                    }
                }
            },

            // Local-only add (for backwards compatibility)
            addDocument: (metadata, parentId = null) => {
                const { createRemoteDocument } = get();
                createRemoteDocument(metadata, parentId);
            },

            // Update document locally and optionally trigger sync
            updateDocument: (id, updates, skipRemoteSync = false) => {
                const { syncDocument, backendUrl, authToken } = get();

                // Track which fields are being updated for dirty flags
                const contributorsDirty = 'contributors' in updates;
                const tagsDirty = 'tags' in updates;

                set((state) => ({
                    documents: state.documents.map((doc) =>
                        doc.id === id ? {
                            ...doc,
                            ...updates,
                            _synced: false,
                            // Set dirty flags if these fields are being updated
                            _contributorsDirty: contributorsDirty || doc._contributorsDirty,
                            _tagsDirty: tagsDirty || doc._tagsDirty,
                        } : doc
                    ),
                }));

                // Auto-sync to remote if configured and not skipped
                // Skip when delta sync (onSyncOperations) is handling remote sync
                if (!skipRemoteSync && backendUrl && authToken) {
                    syncDocument(id);
                }
            },

            deleteDocument: (id) => {
                const { deleteRemoteDocument } = get();
                deleteRemoteDocument(id);
            },

            resetStore: () => {
                // Clear all per-document sync bookkeeping so the derived
                // syncError/isSyncing cannot resurface after a reset.
                syncTimeouts.forEach((t) => clearTimeout(t));
                syncTimeouts.clear();
                activeSyncIds.clear();
                syncErrors.clear();
                set({
                    documents: [],
                    lastSaveTimestamp: null,
                    activeDocumentId: null,
                    openDocumentIds: [],
                    syncError: null,
                });
            },
        }),
        {
            name: 'docusaurus-editor-content',
            storage: createJSONStorage(() => throttledLocalStorage),
            onRehydrateStorage: () => (state) => {
                if (state) {
                    // Set first document as active if none
                    state.activeDocumentId = state.activeDocumentId || state.documents[0]?.id || null;
                    // Ensure openDocumentIds has at least the first root document
                    if (!state.openDocumentIds || state.openDocumentIds.length === 0) {
                        const firstRoot = state.documents.find(d => d.parentId === null);
                        state.openDocumentIds = firstRoot ? [firstRoot.id] : [];
                    }
                }
            },
            partialize: (state) => ({
                documents: state.documents,
                lastSaveTimestamp: state.lastSaveTimestamp,
                openDocumentIds: state.openDocumentIds,
            }),
        }
    )
);
