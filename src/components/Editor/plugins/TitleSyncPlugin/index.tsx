import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot } from 'lexical';
import { $isHeadingNode } from '@lexical/rich-text';
import { usePageDataStore } from '@site/src/store/pageDataStore';

export default function TitleSyncPlugin() {
    const [editor] = useLexicalComposerContext();
    const { getActiveDocument, updateDocument } = usePageDataStore();

    useEffect(() => {
        const activeDocument = getActiveDocument();
        if (!activeDocument) return;

        return editor.registerUpdateListener(({ editorState }) => {
            editorState.read(() => {
                const root = $getRoot();
                const firstChild = root.getFirstChild();

                if ($isHeadingNode(firstChild) && firstChild.getTag() === 'h1') {
                    const newTitle = firstChild.getTextContent();
                    if (newTitle !== activeDocument.title) {
                        // Use the new update function with the document ID
                        updateDocument(activeDocument.id, { title: newTitle });
                    }
                }
            });
        });
    }, [editor, getActiveDocument, updateDocument]);

    return null;
}
