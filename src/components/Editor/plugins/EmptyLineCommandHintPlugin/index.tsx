import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
    COMMAND_PRIORITY_LOW,
    $getSelection,
    $isParagraphNode,
    $isRangeSelection,
    SELECTION_CHANGE_COMMAND,
} from 'lexical';
import { useEffect, useRef } from 'react';
import styles from '../../index.module.css';

export default function EmptyLineCommandHintPlugin() {
    const [editor] = useLexicalComposerContext();
    const activeNodeKeyRef = useRef<string | null>(null);

    useEffect(() => {
        const setHintTarget = () => {
            let nextNodeKey: string | null = null;

            editor.getEditorState().read(() => {
                const selection = $getSelection();
                if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
                    return;
                }

                const anchorNode = selection.anchor.getNode();
                const topLevel = anchorNode.getTopLevelElementOrThrow();
                if ($isParagraphNode(topLevel) && topLevel.getTextContent().trim() === '') {
                    nextNodeKey = topLevel.getKey();
                }
            });

            const previousKey = activeNodeKeyRef.current;
            if (previousKey && previousKey !== nextNodeKey) {
                editor.getElementByKey(previousKey)?.classList.remove(styles.editorEmptyLineCommandHint);
            }

            if (nextNodeKey) {
                editor.getElementByKey(nextNodeKey)?.classList.add(styles.editorEmptyLineCommandHint);
            }

            activeNodeKeyRef.current = nextNodeKey;
        };

        const unregisterUpdate = editor.registerUpdateListener(() => {
            setHintTarget();
        });

        const unregisterSelection = editor.registerCommand(
            SELECTION_CHANGE_COMMAND,
            () => {
                setHintTarget();
                return false;
            },
            COMMAND_PRIORITY_LOW
        );

        setHintTarget();

        return () => {
            unregisterUpdate();
            unregisterSelection();
            if (activeNodeKeyRef.current) {
                editor.getElementByKey(activeNodeKeyRef.current)?.classList.remove(styles.editorEmptyLineCommandHint);
            }
        };
    }, [editor]);

    return null;
}
