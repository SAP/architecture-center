import { useEffect, useRef } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot, $createParagraphNode } from 'lexical';

export default function InitializerPlugin() {
    const [editor] = useLexicalComposerContext();
    const isInitialized = useRef(false);

    useEffect(() => {
        if (isInitialized.current) {
            return;
        }

        let needsFocus = false;

        editor.update(() => {
            const root = $getRoot();
            if (root.isEmpty()) {
                const paragraphNode = $createParagraphNode();
                root.append(paragraphNode);
                needsFocus = true;
            }
        });

        if (needsFocus) {
            setTimeout(() => {
                editor.focus();
            }, 0);
        }

        isInitialized.current = true;
    }, [editor]);

    return null;
}
