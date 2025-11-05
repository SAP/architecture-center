import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot, $createParagraphNode } from 'lexical';

// --- 1. IMPORT THE ZUSTAND STORE HOOK ---
import { usePageDataStore } from '@site/src/store/pageDataStore';

import { ArticleHeaderNode, $createArticleHeaderNode } from '../../nodes/ArticleMetadataNode';

export default function SanityCheckPlugin() {
    const [editor] = useLexicalComposerContext();
    const { getActiveDocument } = usePageDataStore();

    useEffect(() => {
        return editor.registerUpdateListener(() => {
            const activeDocument = getActiveDocument();
            if (!activeDocument) {
                return;
            }

            editor.update(() => {
                const root = $getRoot();
                const firstChild = root.getFirstChild();

                if (!(firstChild instanceof ArticleHeaderNode)) {
                    const newHeader = $createArticleHeaderNode(
                        activeDocument.title || '',
                        activeDocument.tags || [],
                        activeDocument.authors || []
                    );

                    if (firstChild) {
                        firstChild.insertBefore(newHeader);
                    } else {
                        root.append(newHeader);
                    }
                }

                const headerNode = root.getFirstChild();
                const secondChild = headerNode ? headerNode.getNextSibling() : null;

                if (!secondChild) {
                    const newParagraph = $createParagraphNode();
                    root.append(newParagraph);
                }
            });
        });
    }, [editor, getActiveDocument]);

    return null;
}
