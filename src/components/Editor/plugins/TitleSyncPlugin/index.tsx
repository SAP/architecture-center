import { useEffect, useRef, useCallback } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot } from 'lexical';
import { $isHeadingNode } from '@lexical/rich-text';
import { usePageDataStore } from '@site/src/store/pageDataStore';
import debounce from 'lodash/debounce';

export default function TitleSyncPlugin() {
    const [editor] = useLexicalComposerContext();
    const activeDocumentId = usePageDataStore((state) => state.activeDocumentId);
    const updateDocumentAsync = usePageDataStore((state) => state.updateDocumentAsync);
    const updateDocumentLocal = usePageDataStore((state) => state.updateDocumentLocal);

    // Track the last saved title to avoid duplicate saves
    const lastSavedTitleRef = useRef<string | null>(null);

    // Create debounced save function
    const debouncedSave = useCallback(
        debounce(async (docId: string, title: string) => {
            try {
                console.log('Saving title to backend:', title);
                await updateDocumentAsync(docId, { title });
                lastSavedTitleRef.current = title;
            } catch (error) {
                console.error('Failed to save title:', error);
            }
        }, 1500),
        [updateDocumentAsync]
    );

    useEffect(() => {
        if (!activeDocumentId) return;

        const unregister = editor.registerUpdateListener(({ editorState }) => {
            editorState.read(() => {
                const root = $getRoot();
                const firstChild = root.getFirstChild();

                if ($isHeadingNode(firstChild) && firstChild.getTag() === 'h1') {
                    const newTitle = firstChild.getTextContent();

                    // Only save if title actually changed from last saved value
                    if (newTitle && newTitle !== lastSavedTitleRef.current) {
                        console.log('Title changed:', newTitle);
                        // Update local state immediately for responsive UI
                        updateDocumentLocal(activeDocumentId, { title: newTitle });
                        // Debounced save to backend
                        debouncedSave(activeDocumentId, newTitle);
                    }
                }
            });
        });

        return () => {
            unregister();
            debouncedSave.cancel();
        };
    }, [editor, activeDocumentId, updateDocumentLocal, debouncedSave]);

    // Initialize lastSavedTitleRef when document changes
    useEffect(() => {
        const doc = usePageDataStore.getState().getActiveDocument();
        if (doc) {
            lastSavedTitleRef.current = doc.title;
        }
    }, [activeDocumentId]);

    return null;
}
