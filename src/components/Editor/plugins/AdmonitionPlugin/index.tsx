import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { COMMAND_PRIORITY_EDITOR, $getSelection, $isRangeSelection } from 'lexical';
import { INSERT_ADMONITION_COMMAND } from '../commands';
import { $createAdmonitionNode } from '../../nodes/AdmonitionNode';

export default function AdmonitionPlugin() {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        return editor.registerCommand(
            INSERT_ADMONITION_COMMAND,
            (payload) => {
                editor.update(() => {
                    const selection = $getSelection();
                    if ($isRangeSelection(selection)) {
                        const admonitionNode = $createAdmonitionNode(payload.admonitionType);
                        selection.insertNodes([admonitionNode]);
                    }
                });
                return true;
            },
            COMMAND_PRIORITY_EDITOR
        );
    }, [editor]);

    return null;
}
