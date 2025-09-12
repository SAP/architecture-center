import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export interface PageMetadata {
    title: string;
    tags: string[];
    authors: string[];
}

export interface Document extends PageMetadata {
    id: string;
    editorState: string;
    parentId: string | null;
}

interface StoredState {
    documents: Document[];
    lastSaveTimestamp: string | null;
}

interface PageDataState extends StoredState {
    activeDocumentId: string | null;
    isModalOpen: boolean;
    editingDocumentId: string | null;
    newDocParentId: string | null;
    getDocuments: () => Document[];
    getActiveDocument: () => Document | undefined;
    addDocument: (metadata: PageMetadata, parentId?: string | null) => void;
    updateDocument: (id: string, updates: Partial<Document>) => void;
    setActiveDocumentId: (id: string | null) => void;
    deleteDocument: (id: string) => void;
    openModalForNew: (parentId: string | null) => void;
    openModalForEdit: (docId: string) => void;
    closeModal: () => void;
    saveState: () => void;
}

const LOCAL_STORAGE_KEY = 'docusaurus-editor-content';

const debounce = <F extends (...args: any[]) => any>(func: F, wait: number) => {
    let timeout: NodeJS.Timeout | null = null;

    const debounced = (...args: Parameters<F>) => {
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(() => {
            func(...args);
        }, wait);
    };

    return debounced;
};

const loadState = (): StoredState => {
    try {
        const storedState = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (storedState) return JSON.parse(storedState);
    } catch (e) {
        console.error('Failed to load state', e);
    }
    return { documents: [], lastSaveTimestamp: null };
};

export const usePageDataStore = create<PageDataState>((set, get) => {
    const _performSave = () => {
        const timestamp = new Date().toLocaleString();
        const stateToSave: StoredState = { documents: get().documents, lastSaveTimestamp: timestamp };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
        set({ lastSaveTimestamp: timestamp });
        console.log('State saved to localStorage at', timestamp);
    };

    const debouncedSave = debounce(_performSave, 1000);

    return {
        ...loadState(),
        activeDocumentId: loadState().documents[0]?.id || null,
        isModalOpen: false,
        editingDocumentId: null,
        newDocParentId: null,

        getDocuments: () => get().documents,
        getActiveDocument: () => get().documents.find((doc) => doc.id === get().activeDocumentId),

        setActiveDocumentId: (id: string | null) => set({ activeDocumentId: id }),

        addDocument: (metadata: PageMetadata, parentId: string | null = null) => {
            const newDocument: Document = { ...metadata, id: uuidv4(), editorState: '', parentId };
            set((state) => ({ documents: [...state.documents, newDocument], activeDocumentId: newDocument.id }));
            debouncedSave(); // Trigger auto-save
        },

        updateDocument: (id: string, updates: Partial<Document>) => {
            set((state) => ({
                documents: state.documents.map((doc) => (doc.id === id ? { ...doc, ...updates } : doc)),
            }));
            debouncedSave();
        },

        deleteDocument: (id: string) => {
            set((state) => {
                const childrenIds = state.documents.filter((d) => d.parentId === id).map((d) => d.id);
                const docsToKeep = state.documents.filter((doc) => doc.id !== id && !childrenIds.includes(doc.id));
                let newActiveId = state.activeDocumentId;
                if (state.activeDocumentId === id || childrenIds.includes(state.activeDocumentId)) {
                    newActiveId = docsToKeep.length > 0 ? docsToKeep[0].id : null;
                }
                return { documents: docsToKeep, activeDocumentId: newActiveId };
            });
            debouncedSave();
        },

        openModalForNew: (parentId: string | null) =>
            set({ isModalOpen: true, editingDocumentId: null, newDocParentId: parentId }),
        openModalForEdit: (docId: string) => set({ isModalOpen: true, editingDocumentId: docId }),
        closeModal: () => set({ isModalOpen: false, editingDocumentId: null, newDocParentId: null }),

        saveState: () => {
            _performSave();
        },
    };
});
