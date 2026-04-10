import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import debounce from 'lodash/debounce';
import * as documentApi from '@site/src/services/documentApi';
import type { Document as BackendDocument } from '@site/src/services/documentApi';

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
}

interface PageDataState {
    // Data
    documents: Document[];
    activeDocumentId: string | null;
    selectedArchitectureId: string | null; // Root document ID of selected architecture

    // Async state
    isLoading: boolean;
    isSaving: boolean;
    loadError: Error | null;
    saveError: Error | null;
    lastSaveTimestamp: string | null;

    // Sync getters (for immediate access)
    getDocuments: () => Document[];
    getActiveDocument: () => Document | null;
    getRootArchitectures: () => Document[]; // All root documents (architectures)
    getSelectedArchitecture: () => Document | null; // Currently selected architecture
    getArchitecturePages: (archId: string) => Document[]; // Children of an architecture
    getPageCount: (archId: string) => number; // Count of pages in an architecture

    // Sync setters (local state only)
    setActiveDocumentId: (id: string | null) => void;
    setSelectedArchitecture: (id: string | null) => void;

    // Async operations (backend-connected)
    fetchDocuments: () => Promise<void>;
    createDocumentAsync: (metadata: PageMetadata, parentId?: string | null) => Promise<string>;
    updateDocumentAsync: (id: string, updates: Partial<Document>) => Promise<void>;
    deleteDocumentAsync: (id: string) => Promise<void>;

    // Debounced save for editor state
    saveEditorState: (id: string, editorState: string) => void;
    flushPendingChanges: () => Promise<void>;

    // Tags and contributors (author-only actions)
    setDocumentTagsAsync: (id: string, tags: string[]) => Promise<void>;
    setDocumentContributorsAsync: (id: string, usernames: string[]) => Promise<void>;

    // Migration
    migrateFromLocalStorage: () => Promise<{ migrated: number; errors: string[] }>;

    // Local operations (for optimistic updates)
    updateDocumentLocal: (id: string, updates: Partial<Document>) => void;
    addDocumentLocal: (doc: Document) => void;
    removeDocumentLocal: (id: string) => void;

    // Reset
    resetStore: () => void;

    // Clear errors
    clearErrors: () => void;
}

// Helper to convert backend document to frontend format
function toFrontendDocument(backendDoc: BackendDocument): Document {
    return {
        id: backendDoc.ID,
        title: backendDoc.title,
        description: backendDoc.description || '',
        editorState: backendDoc.editorState || null,
        parentId: backendDoc.parent_ID || null,
        tags: backendDoc.tags?.map((t) => t.tag.code) || [],
        authors: backendDoc.author ? [backendDoc.author.username] : [],
        contributors: backendDoc.contributors?.map((c) => c.user.username) || [],
    };
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

// Pending changes queue for debounced saves
const pendingEditorStateChanges = new Map<string, string>();

export const usePageDataStore = create<PageDataState>()((set, get) => {
    // Debounced save function
    const debouncedSave = debounce(async () => {
        const changes = new Map(pendingEditorStateChanges);
        pendingEditorStateChanges.clear();

        if (changes.size === 0) return;

        set({ isSaving: true, saveError: null });

        try {
            const savePromises = Array.from(changes.entries()).map(async ([id, editorState]) => {
                await documentApi.updateDocument(id, { editorState });
            });

            await Promise.all(savePromises);

            set({
                isSaving: false,
                lastSaveTimestamp: new Date().toLocaleString(),
            });
        } catch (error) {
            set({
                isSaving: false,
                saveError: error instanceof Error ? error : new Error(String(error)),
            });
            // Re-queue failed changes for retry
            changes.forEach((editorState, id) => {
                pendingEditorStateChanges.set(id, editorState);
            });
        }
    }, 1500);

    return {
        documents: [],
        activeDocumentId: null,
        selectedArchitectureId: null,
        isLoading: false,
        isSaving: false,
        loadError: null,
        saveError: null,
        lastSaveTimestamp: null,

        getDocuments: () => get().documents,

        getActiveDocument: () => {
            const { documents, activeDocumentId } = get();
            const activeDoc = findDocumentById(documents, activeDocumentId);
            return activeDoc ? JSON.parse(JSON.stringify(activeDoc)) : null;
        },

        getRootArchitectures: () => {
            const { documents } = get();
            return documents.filter((doc) => !doc.parentId);
        },

        getSelectedArchitecture: () => {
            const { documents, selectedArchitectureId } = get();
            if (!selectedArchitectureId) return null;
            return documents.find((doc) => doc.id === selectedArchitectureId) || null;
        },

        getArchitecturePages: (archId: string) => {
            const { documents } = get();
            return documents.filter((doc) => doc.parentId === archId);
        },

        getPageCount: (archId: string) => {
            const { documents } = get();
            // Count all descendants, not just direct children
            const countDescendants = (parentId: string): number => {
                const children = documents.filter((doc) => doc.parentId === parentId);
                return children.length + children.reduce((sum, child) => sum + countDescendants(child.id), 0);
            };
            return countDescendants(archId);
        },

        setActiveDocumentId: (id) => set({ activeDocumentId: id }),

        setSelectedArchitecture: (id) => {
            set({ selectedArchitectureId: id });
            // When selecting an architecture, also set it as active document
            if (id) {
                set({ activeDocumentId: id });
            }
        },

        fetchDocuments: async () => {
            set({ isLoading: true, loadError: null });
            try {
                const backendDocs = await documentApi.getDocuments();
                const documents = backendDocs.map(toFrontendDocument);

                // Set active document and selected architecture
                const { activeDocumentId, selectedArchitectureId } = get();
                let newActiveId = activeDocumentId;
                let newSelectedArchId = selectedArchitectureId;

                // Find root documents (architectures)
                const rootDocs = documents.filter((d) => !d.parentId);

                // If no selected architecture or it doesn't exist, select the first one
                if (!newSelectedArchId || !rootDocs.find((d) => d.id === newSelectedArchId)) {
                    newSelectedArchId = rootDocs[0]?.id || null;
                }

                // If no active document or it doesn't exist, set to selected architecture
                if (!newActiveId || !documents.find((d) => d.id === newActiveId)) {
                    newActiveId = newSelectedArchId;
                }

                set({
                    documents,
                    activeDocumentId: newActiveId,
                    selectedArchitectureId: newSelectedArchId,
                    isLoading: false,
                });
            } catch (error) {
                set({
                    isLoading: false,
                    loadError: error instanceof Error ? error : new Error(String(error)),
                });
            }
        },

        createDocumentAsync: async (metadata, parentId = null) => {
            set({ isSaving: true, saveError: null });
            try {
                const backendDoc = await documentApi.createDocument({
                    title: metadata.title,
                    description: metadata.description,
                    parentId,
                    tags: metadata.tags,
                    contributorsUsernames: metadata.contributors,
                    editorState: '',
                });

                const newDoc = toFrontendDocument(backendDoc);

                // If creating a root document (architecture), also set it as selected
                const isRootDocument = !parentId;

                set((state) => ({
                    documents: [...state.documents, newDoc],
                    activeDocumentId: newDoc.id,
                    selectedArchitectureId: isRootDocument ? newDoc.id : state.selectedArchitectureId,
                    isSaving: false,
                    lastSaveTimestamp: new Date().toLocaleString(),
                }));

                return newDoc.id;
            } catch (error) {
                set({
                    isSaving: false,
                    saveError: error instanceof Error ? error : new Error(String(error)),
                });
                throw error;
            }
        },

        updateDocumentAsync: async (id, updates) => {
            // Optimistic update
            set((state) => ({
                documents: state.documents.map((doc) => (doc.id === id ? { ...doc, ...updates } : doc)),
            }));

            set({ isSaving: true, saveError: null });
            try {
                const backendUpdates: documentApi.UpdateDocumentParams = {};
                if (updates.title !== undefined) backendUpdates.title = updates.title;
                if (updates.description !== undefined) backendUpdates.description = updates.description;
                if (updates.editorState !== undefined) backendUpdates.editorState = updates.editorState;

                if (Object.keys(backendUpdates).length > 0) {
                    await documentApi.updateDocument(id, backendUpdates);
                }

                set({
                    isSaving: false,
                    lastSaveTimestamp: new Date().toLocaleString(),
                });
            } catch (error) {
                // Rollback on failure - refetch
                await get().fetchDocuments();
                set({
                    isSaving: false,
                    saveError: error instanceof Error ? error : new Error(String(error)),
                });
                throw error;
            }
        },

        deleteDocumentAsync: async (id) => {
            const { documents, activeDocumentId, selectedArchitectureId } = get();

            // Optimistic removal
            const docsToKeep = documents.filter((doc) => doc.id !== id && doc.parentId !== id);
            let newActiveId = activeDocumentId;
            let newSelectedArchId = selectedArchitectureId;

            // If deleting the active document, select another
            if (activeDocumentId === id) {
                newActiveId = docsToKeep.length > 0 ? docsToKeep[0].id : null;
            }

            // If deleting the selected architecture, select another root doc
            if (selectedArchitectureId === id) {
                const remainingRoots = docsToKeep.filter((doc) => !doc.parentId);
                newSelectedArchId = remainingRoots[0]?.id || null;
                newActiveId = newSelectedArchId;
            }

            set({
                documents: docsToKeep,
                activeDocumentId: newActiveId,
                selectedArchitectureId: newSelectedArchId,
                isSaving: true,
                saveError: null,
            });

            try {
                await documentApi.deleteDocument(id);
                set({
                    isSaving: false,
                    lastSaveTimestamp: new Date().toLocaleString(),
                });
            } catch (error) {
                // Rollback on failure
                await get().fetchDocuments();
                set({
                    isSaving: false,
                    saveError: error instanceof Error ? error : new Error(String(error)),
                });
                throw error;
            }
        },

        saveEditorState: (id, editorState) => {
            // Update local state immediately
            set((state) => ({
                documents: state.documents.map((doc) => (doc.id === id ? { ...doc, editorState } : doc)),
            }));

            // Queue for debounced backend save
            pendingEditorStateChanges.set(id, editorState);
            debouncedSave();
        },

        flushPendingChanges: async () => {
            debouncedSave.cancel();
            const changes = new Map(pendingEditorStateChanges);
            pendingEditorStateChanges.clear();

            if (changes.size === 0) return;

            set({ isSaving: true, saveError: null });

            try {
                const savePromises = Array.from(changes.entries()).map(async ([id, editorState]) => {
                    await documentApi.updateDocument(id, { editorState });
                });

                await Promise.all(savePromises);

                set({
                    isSaving: false,
                    lastSaveTimestamp: new Date().toLocaleString(),
                });
            } catch (error) {
                set({
                    isSaving: false,
                    saveError: error instanceof Error ? error : new Error(String(error)),
                });
                throw error;
            }
        },

        setDocumentTagsAsync: async (id, tags) => {
            set({ isSaving: true, saveError: null });
            try {
                const backendDoc = await documentApi.setDocumentTags(id, tags);
                const updatedDoc = toFrontendDocument(backendDoc);

                set((state) => ({
                    documents: state.documents.map((doc) => (doc.id === id ? updatedDoc : doc)),
                    isSaving: false,
                    lastSaveTimestamp: new Date().toLocaleString(),
                }));
            } catch (error) {
                set({
                    isSaving: false,
                    saveError: error instanceof Error ? error : new Error(String(error)),
                });
                throw error;
            }
        },

        setDocumentContributorsAsync: async (id, usernames) => {
            set({ isSaving: true, saveError: null });
            try {
                const backendDoc = await documentApi.setDocumentContributors(id, usernames);
                const updatedDoc = toFrontendDocument(backendDoc);

                set((state) => ({
                    documents: state.documents.map((doc) => (doc.id === id ? updatedDoc : doc)),
                    isSaving: false,
                    lastSaveTimestamp: new Date().toLocaleString(),
                }));
            } catch (error) {
                set({
                    isSaving: false,
                    saveError: error instanceof Error ? error : new Error(String(error)),
                });
                throw error;
            }
        },

        migrateFromLocalStorage: async () => {
            const STORAGE_KEY = 'docusaurus-editor-content';
            const MIGRATION_FLAG = 'docusaurus-editor-migrated';

            // Check if already migrated
            if (typeof window !== 'undefined' && localStorage.getItem(MIGRATION_FLAG)) {
                return { migrated: 0, errors: [] };
            }

            // Read localStorage data
            const localData = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
            if (!localData) {
                return { migrated: 0, errors: [] };
            }

            let parsed: { state?: { documents?: Document[] } };
            try {
                parsed = JSON.parse(localData);
            } catch {
                return { migrated: 0, errors: ['Failed to parse localStorage data'] };
            }

            const localDocs = parsed?.state?.documents || [];
            if (localDocs.length === 0) {
                return { migrated: 0, errors: [] };
            }

            const errors: string[] = [];
            let migrated = 0;
            const idMapping = new Map<string, string>(); // old ID -> new ID

            // Sort: root documents first, then children
            const rootDocs = localDocs.filter((d) => !d.parentId);
            const childDocs = localDocs.filter((d) => d.parentId);

            // Migrate root documents first
            for (const doc of rootDocs) {
                try {
                    const backendDoc = await documentApi.createDocument({
                        title: doc.title,
                        description: doc.description,
                        parentId: null,
                        tags: doc.tags,
                        contributorsUsernames: doc.contributors,
                        editorState: doc.editorState || '',
                    });
                    idMapping.set(doc.id, backendDoc.ID);
                    migrated++;
                } catch (error) {
                    errors.push(`Failed to migrate "${doc.title}": ${(error as Error).message}`);
                }
            }

            // Migrate child documents
            for (const doc of childDocs) {
                const newParentId = doc.parentId ? idMapping.get(doc.parentId) : null;
                if (doc.parentId && !newParentId) {
                    errors.push(`Skipped "${doc.title}": parent document not migrated`);
                    continue;
                }

                try {
                    const backendDoc = await documentApi.createDocument({
                        title: doc.title,
                        description: doc.description,
                        parentId: newParentId,
                        tags: doc.tags,
                        contributorsUsernames: doc.contributors,
                        editorState: doc.editorState || '',
                    });
                    idMapping.set(doc.id, backendDoc.ID);
                    migrated++;
                } catch (error) {
                    errors.push(`Failed to migrate "${doc.title}": ${(error as Error).message}`);
                }
            }

            // Mark migration as complete and clear localStorage
            if (typeof window !== 'undefined') {
                localStorage.setItem(MIGRATION_FLAG, new Date().toISOString());
                if (migrated > 0 && errors.length === 0) {
                    localStorage.removeItem(STORAGE_KEY);
                }
            }

            // Refresh documents from backend
            await get().fetchDocuments();

            return { migrated, errors };
        },

        updateDocumentLocal: (id, updates) => {
            set((state) => ({
                documents: state.documents.map((doc) => (doc.id === id ? { ...doc, ...updates } : doc)),
                lastSaveTimestamp: new Date().toLocaleString(),
            }));
        },

        addDocumentLocal: (doc) => {
            set((state) => ({
                documents: [...state.documents, doc],
                activeDocumentId: doc.id,
                lastSaveTimestamp: new Date().toLocaleString(),
            }));
        },

        removeDocumentLocal: (id) => {
            set((state) => {
                const docsToKeep = state.documents.filter((doc) => doc.id !== id && doc.parentId !== id);
                let newActiveId = state.activeDocumentId;
                if (state.activeDocumentId === id) {
                    newActiveId = docsToKeep.length > 0 ? docsToKeep[0].id : null;
                }
                return {
                    documents: docsToKeep,
                    activeDocumentId: newActiveId,
                    lastSaveTimestamp: new Date().toLocaleString(),
                };
            });
        },

        resetStore: () => {
            debouncedSave.cancel();
            pendingEditorStateChanges.clear();
            set({
                documents: [],
                lastSaveTimestamp: null,
                activeDocumentId: null,
                selectedArchitectureId: null,
                isLoading: false,
                isSaving: false,
                loadError: null,
                saveError: null,
            });
        },

        clearErrors: () => {
            set({ loadError: null, saveError: null });
        },
    };
});

// Legacy exports for backward compatibility during migration
// These can be removed once all consumers are updated

/**
 * @deprecated Use usePageDataStore().addDocumentLocal() or createDocumentAsync() instead
 */
export const addDocument = (metadata: PageMetadata, parentId?: string | null) => {
    const newDocument: Document = {
        ...metadata,
        id: uuidv4(),
        editorState: null,
        parentId: parentId || null,
    };
    usePageDataStore.getState().addDocumentLocal(newDocument);
};

/**
 * @deprecated Use usePageDataStore().updateDocumentLocal() or updateDocumentAsync() instead
 */
export const updateDocument = (id: string, updates: Partial<Document>) => {
    usePageDataStore.getState().updateDocumentLocal(id, updates);
};

/**
 * Check if there's localStorage data that needs migration
 */
export function hasLocalStorageData(): boolean {
    if (typeof window === 'undefined') return false;

    const STORAGE_KEY = 'docusaurus-editor-content';
    const MIGRATION_FLAG = 'docusaurus-editor-migrated';

    if (localStorage.getItem(MIGRATION_FLAG)) return false;

    const localData = localStorage.getItem(STORAGE_KEY);
    if (!localData) return false;

    try {
        const parsed = JSON.parse(localData);
        return (parsed?.state?.documents?.length || 0) > 0;
    } catch {
        return false;
    }
}

/**
 * Get localStorage documents for preview in migration prompt
 */
export function getLocalStorageDocuments(): Document[] {
    if (typeof window === 'undefined') return [];

    const STORAGE_KEY = 'docusaurus-editor-content';
    const localData = localStorage.getItem(STORAGE_KEY);
    if (!localData) return [];

    try {
        const parsed = JSON.parse(localData);
        return parsed?.state?.documents || [];
    } catch {
        return [];
    }
}

/**
 * Discard localStorage data without migrating
 */
export function discardLocalStorageData(): void {
    if (typeof window === 'undefined') return;

    const STORAGE_KEY = 'docusaurus-editor-content';
    const MIGRATION_FLAG = 'docusaurus-editor-migrated';

    localStorage.removeItem(STORAGE_KEY);
    localStorage.setItem(MIGRATION_FLAG, new Date().toISOString());
}
