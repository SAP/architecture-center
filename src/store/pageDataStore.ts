import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import type { Operation } from '@site/src/components/Editor/core/Operations';

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
    // Remote sync status
    _synced?: boolean;
    _remoteId?: string;
    // Read-only flag for contributors (non-authors)
    isReadOnly?: boolean;
}

interface PageDataState {
    documents: Document[];
    lastSaveTimestamp: string | null;
    activeDocumentId: string | null;
    openDocumentIds: string[];  // Array of open root document IDs (ref archs)
    isLoading: boolean;
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

// Debounce helper for auto-save
let syncTimeout: NodeJS.Timeout | null = null;
const SYNC_DEBOUNCE_MS = 2000;

export const usePageDataStore = create<PageDataState>()(
    persist(
        (set, get) => ({
            documents: [],
            lastSaveTimestamp: null,
            activeDocumentId: null,
            openDocumentIds: [],
            isLoading: false,
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
                console.log('[PageDataStore] Backend configured:', { backendUrl, hasToken: !!authToken, username });
                set({ backendUrl, authToken, currentUsername: username });
            },

            // Fetch all documents from remote
            fetchDocuments: async () => {
                const { backendUrl, authToken, currentUsername } = get();
                console.log('[PageDataStore] fetchDocuments called:', { backendUrl, hasToken: !!authToken, currentUsername });
                if (!backendUrl || !authToken) {
                    console.warn('[PageDataStore] Backend not configured, skipping fetch');
                    return;
                }

                set({ isLoading: true, syncError: null });

                try {
                    console.log('[PageDataStore] Fetching documents from:', `${backendUrl}/quickstart/document-service/Documents`);
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
                    console.log('[PageDataStore] Fetched documents:', data.value?.length || 0, 'documents');
                    const remoteDocuments: Document[] = data.value.map((doc: any) => {
                        const authorUsername = doc.author?.username;
                        const isAuthor = currentUsername && authorUsername === currentUsername;
                        // Debug: check for /head corruption in editorState
                        if (doc.editorState && doc.editorState.includes('/head')) {
                            console.error('[PageDataStore] CORRUPTION DETECTED: /head found in editorState for document:', doc.ID, doc.editorState.substring(0, 500));
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
                        };
                    });

                    set({
                        documents: remoteDocuments,
                        activeDocumentId: remoteDocuments.length > 0 ? remoteDocuments[0].id : null,
                        openDocumentIds: remoteDocuments.filter(d => d.parentId === null).slice(0, 1).map(d => d.id),
                        isLoading: false,
                    });
                } catch (error) {
                    console.error('Error fetching documents:', error);
                    set({
                        isLoading: false,
                        syncError: error instanceof Error ? error.message : 'Failed to fetch documents',
                    });
                }
            },

            // Sync a single document to remote (debounced auto-save)
            syncDocument: async (id: string) => {
                const { backendUrl, authToken, documents } = get();
                console.log('[PageDataStore] syncDocument called:', { id, hasBackend: !!backendUrl, hasToken: !!authToken });
                if (!backendUrl || !authToken) return;

                const doc = findDocumentById(documents, id);
                if (!doc) return;

                // Clear existing timeout
                if (syncTimeout) {
                    clearTimeout(syncTimeout);
                }

                // Debounce the sync
                syncTimeout = setTimeout(async () => {
                    console.log('[PageDataStore] Syncing document to backend:', doc.id);
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

                        // 2. Call setDocumentContributors action (always sync, even empty arrays for removals)
                        if (doc.contributors !== undefined) {
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
                                        contributorsUsernames: doc.contributors,
                                    }),
                                }
                            );

                            if (!contributorsResponse.ok) {
                                console.warn('Failed to sync contributors:', contributorsResponse.statusText);
                            }
                        }

                        // 3. Call setDocumentTags action if tags exist
                        if (doc.tags && doc.tags.length > 0) {
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
                                        tags: doc.tags,
                                    }),
                                }
                            );

                            if (!tagsResponse.ok) {
                                console.warn('Failed to sync tags:', tagsResponse.statusText);
                            }
                        }

                        // Mark as synced
                        set((state) => ({
                            documents: state.documents.map((d) =>
                                d.id === id ? { ...d, _synced: true } : d
                            ),
                            isSyncing: false,
                            lastSaveTimestamp: new Date().toLocaleString(),
                            syncError: null,
                        }));
                    } catch (error) {
                        console.error('Error syncing document:', error);
                        set({
                            isSyncing: false,
                            syncError: error instanceof Error ? error.message : 'Failed to sync',
                        });
                    }
                }, SYNC_DEBOUNCE_MS);
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
                    console.log('[PageDataStore] Sending operations:', serializedOps.map(op => ({
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
                        console.warn('[PageDataStore] No operations were applied, falling back to full sync');
                        throw new Error('No operations applied - backend state may be invalid');
                    }

                    console.log('[PageDataStore] syncOperations result:', {
                        lastOpId: result.lastOpId,
                        appliedCount: result.appliedCount,
                        sentCount: operations.length
                    });

                    set({
                        isSyncing: false,
                        lastSaveTimestamp: new Date().toLocaleString(),
                        syncError: null,
                    });

                    return result.lastOpId || null;
                } catch (error) {
                    console.warn('Operation sync failed, falling back to full state sync:', error);
                    // Fallback to full state sync
                    await syncDocument(documentId);
                    set({ isSyncing: false });
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

                set({ isLoading: true, syncError: null });

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
                            lastSaveTimestamp: new Date().toLocaleString(),
                            isLoading: false,
                        };
                    });

                    return newDocument;
                } catch (error) {
                    console.error('Error creating document:', error);
                    set({
                        isLoading: false,
                        syncError: error instanceof Error ? error.message : 'Failed to create document',
                    });
                    return null;
                }
            },

            // Delete document from remote
            deleteRemoteDocument: async (id: string) => {
                const { backendUrl, authToken, getRootDocumentId } = get();

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
                            console.error('Failed to delete document from remote:', response.statusText);
                        }
                    } catch (error) {
                        console.error('Error deleting document from remote:', error);
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

                set((state) => ({
                    documents: state.documents.map((doc) =>
                        doc.id === id ? { ...doc, ...updates, _synced: false } : doc
                    ),
                    lastSaveTimestamp: new Date().toLocaleString(),
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
            storage: createJSONStorage(() => safeLocalStorage),
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
