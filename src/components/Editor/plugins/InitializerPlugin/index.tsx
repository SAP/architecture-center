import { useEffect, useRef } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $createHeadingNode } from '@lexical/rich-text';
import { $getRoot, $createTextNode } from 'lexical';
import { usePageDataStore } from '@site/src/store/pageDataStore';
import { $createArticleMetadataNode } from '../../nodes/ArticleMetadataNode';

export default function InitializerPlugin() {
    const [editor] = useLexicalComposerContext();
    const { getActiveDocument } = usePageDataStore();
    const isInitialized = useRef(false);

    useEffect(() => {
        const activeDocument = getActiveDocument();

        if (!activeDocument || isInitialized.current) {
            return;
        }

        editor.update(() => {
            const root = $getRoot();

            if (root.getChildrenSize() > 0) {
                isInitialized.current = true;
                return;
            }

            root.append(
                $createHeadingNode('h1').append($createTextNode(activeDocument.title)),
                $createArticleMetadataNode(activeDocument.tags, activeDocument.authors),
                $createHeadingNode('h1')
            );
            isInitialized.current = true;
        });
    }, [editor, getActiveDocument]);

    return null;
}
