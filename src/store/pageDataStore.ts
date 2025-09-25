// import { create } from 'zustand';
// import { v4 as uuidv4 } from 'uuid';

// export interface PageMetadata {
//     title: string;
//     tags: string[];
//     authors: string[];
//     contributors?: string[];
//     description?: string;
// }

// export interface Document extends PageMetadata {
//     id: string;
//     editorState: string | null;
//     parentId: string | null;
//     children?: Document[];
// }

// interface StoredState {
//     documents: Document[];
//     lastSaveTimestamp: string | null;
// }

// interface PageDataState extends StoredState {
//     activeDocumentId: string | null;
//     getDocuments: () => Document[];
//     getActiveDocument: () => Document | null;
//     addDocument: (metadata: PageMetadata, parentId?: string | null) => void;
//     updateDocument: (id: string, updates: Partial<Document>) => void;
//     setActiveDocumentId: (id: string | null) => void;
//     deleteDocument: (id: string) => void;
//     saveState: () => void;
//     resetStore: () => void;
// }

// const LOCAL_STORAGE_KEY = 'docusaurus-editor-content';

// const debounce = <F extends (...args: any[]) => any>(func: F, wait: number) => {
//     let timeout: NodeJS.Timeout | null = null;
//     const debounced = (...args: Parameters<F>) => {
//         if (timeout) {
//             clearTimeout(timeout);
//         }
//         timeout = setTimeout(() => {
//             func(...args);
//         }, wait);
//     };
//     return debounced;
// };

// const loadState = (): StoredState => {
//     try {
//         const storedState = localStorage.getItem(LOCAL_STORAGE_KEY);
//         if (storedState) return JSON.parse(storedState);
//     } catch (e) {
//         console.error('Failed to load state', e);
//     }
//     return { documents: [], lastSaveTimestamp: null };
// };

// export const usePageDataStore = create<PageDataState>((set, get) => {
//     const _performSave = () => {
//         const timestamp = new Date().toLocaleString();
//         const stateToSave: StoredState = { documents: get().documents, lastSaveTimestamp: timestamp };
//         localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
//         set({ lastSaveTimestamp: timestamp });
//         console.log('State saved to localStorage at', timestamp);
//     };

//     const debouncedSave = debounce(_performSave, 1000);

//     const findDocumentById = (docs: Document[], id: string | null): Document | null => {
//         if (!id) return null;
//         for (const doc of docs) {
//             if (doc.id === id) return doc;
//             if (doc.children) {
//                 const found = findDocumentById(doc.children, id);
//                 if (found) return found;
//             }
//         }
//         return null;
//     };

//     return {
//         ...loadState(),
//         activeDocumentId: loadState().documents[0]?.id || null,

//         getDocuments: () => get().documents,

//         getActiveDocument: () => {
//             const { documents, activeDocumentId } = get();
//             const activeDoc = findDocumentById(documents, activeDocumentId);

//             if (activeDoc) {
//                 return JSON.parse(JSON.stringify(activeDoc));
//             }
//             return null;
//         },

//         setActiveDocumentId: (id: string | null) => set({ activeDocumentId: id }),

//         addDocument: (metadata: PageMetadata, parentId: string | null = null) => {
//             const newDocument: Document = {
//                 ...metadata,
//                 id: uuidv4(),
//                 editorState: null,
//                 parentId,
//             };
//             set((state) => ({
//                 documents: [...state.documents, newDocument],
//                 activeDocumentId: newDocument.id,
//             }));
//             debouncedSave();
//         },

//         updateDocument: (id: string, updates: Partial<Document>) => {
//             set((state) => ({
//                 documents: state.documents.map((doc) => (doc.id === id ? { ...doc, ...updates } : doc)),
//             }));
//             debouncedSave();
//         },

//         deleteDocument: (id: string) => {
//             set((state) => {
//                 const docsToKeep = state.documents.filter((doc) => doc.id !== id && doc.parentId !== id);
//                 let newActiveId = state.activeDocumentId;
//                 if (state.activeDocumentId === id) {
//                     newActiveId = docsToKeep.length > 0 ? docsToKeep[0].id : null;
//                 }
//                 return { documents: docsToKeep, activeDocumentId: newActiveId };
//             });
//             debouncedSave();
//         },

//         saveState: () => {
//             _performSave();
//         },

//         resetStore: () => {
//             localStorage.removeItem(LOCAL_STORAGE_KEY);

//             set({
//                 documents: [],
//                 lastSaveTimestamp: null,
//                 activeDocumentId: null,
//             });

//             console.log('Editor store has been reset.');
//         },
//     };
// });

import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';

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
    documents: Document[];
    lastSaveTimestamp: string | null;
    activeDocumentId: string | null;
    getDocuments: () => Document[];
    getActiveDocument: () => Document | null;
    addDocument: (metadata: PageMetadata, parentId?: string | null) => void;
    updateDocument: (id: string, updates: Partial<Document>) => void;
    setActiveDocumentId: (id: string | null) => void;
    deleteDocument: (id: string) => void;
    resetStore: () => void;
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

export const usePageDataStore = create<PageDataState>()(
    persist(
        (set, get) => ({
            documents: [],
            lastSaveTimestamp: null,
            activeDocumentId: null,

            getDocuments: () => get().documents,

            getActiveDocument: () => {
                const { documents, activeDocumentId } = get();
                const activeDoc = findDocumentById(documents, activeDocumentId);
                return activeDoc ? JSON.parse(JSON.stringify(activeDoc)) : null;
            },

            setActiveDocumentId: (id) => set({ activeDocumentId: id }),

            addDocument: (metadata, parentId = null) => {
                const newDocument: Document = {
                    ...metadata,
                    id: uuidv4(),
                    editorState: null,
                    parentId,
                };
                set((state) => ({
                    documents: [...state.documents, newDocument],
                    activeDocumentId: newDocument.id,
                    lastSaveTimestamp: new Date().toLocaleString(),
                }));
            },

            updateDocument: (id, updates) => {
                set((state) => ({
                    documents: state.documents.map((doc) => (doc.id === id ? { ...doc, ...updates } : doc)),
                    lastSaveTimestamp: new Date().toLocaleString(),
                }));
            },

            deleteDocument: (id) => {
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
                set({
                    documents: [],
                    lastSaveTimestamp: null,
                    activeDocumentId: null,
                });
            },
        }),
        {
            name: 'docusaurus-editor-content',
            storage: createJSONStorage(() => safeLocalStorage),
            onRehydrateStorage: () => (state) => {
                if (state) {
                    state.activeDocumentId = state.documents[0]?.id || null;
                }
            },
            partialize: (state) => ({
                documents: state.documents,
                lastSaveTimestamp: state.lastSaveTimestamp,
            }),
        }
    )
);
