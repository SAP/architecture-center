import { useEffect, useRef } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot, $createParagraphNode } from 'lexical';
import { usePageDataStore } from '@site/src/store/pageDataStore';
import { ArticleHeaderNode, $createArticleHeaderNode } from '../../nodes/ArticleMetadataNode';

export default function InitializerPlugin() {
    const [editor] = useLexicalComposerContext();
    const { getActiveDocument } = usePageDataStore();
    const isInitialized = useRef(false);

    useEffect(() => {
        if (isInitialized.current) return;

        const activeDocument = getActiveDocument();
        if (!activeDocument) return;

        let needsSetupAndFocus = false;

        editor.update(() => {
            const root = $getRoot();
            const children = root.getChildren();

            if (children.length === 0) {
                const { title, tags, authors } = activeDocument;
                root.append(
                    $createArticleHeaderNode(title || 'Untitled Page', tags || [], authors || []),
                    $createParagraphNode()
                );
                needsSetupAndFocus = true; // Mark for focus
            } else if (children.length === 1 && children[0] instanceof ArticleHeaderNode) {
                root.append($createParagraphNode());
                needsSetupAndFocus = true; // Mark for focus
            }
        });

        if (needsSetupAndFocus) {
            setTimeout(() => {
                editor.update(() => {
                    $getRoot().selectEnd();
                });
                editor.focus();
            }, 0);
        }

        isInitialized.current = true;
    }, [editor, getActiveDocument]);

    return null;
}
