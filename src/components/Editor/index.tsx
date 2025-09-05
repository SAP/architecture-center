import React from 'react';
import { LexicalComposer, InitialConfigType } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListNode, ListItemNode } from '@lexical/list';
import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table';
import { AutoLinkNode, LinkNode } from '@lexical/link';

import { ImageNode } from './nodes/ImageNode';
import ImagePlugin from './plugins/ImagePlugin';
import ToolbarPlugin from './plugins/ToolbarPlugin';
import { DrawioNode } from './nodes/DrawioNode';
import DrawioPlugin from './plugins/DrawioPlugin';
import SlashCommandPlugin from './plugins/SlashCommandPlugin';

import EditorTheme from './EditorTheme';
import styles from './index.module.css';

function Placeholder() {
    return <div className={styles.editorPlaceholder}>Type '/' for commands...</div>;
}

const editorConfig: InitialConfigType = {
    namespace: 'MyEditor',
    theme: EditorTheme,
    onError(error) {
        throw error;
    },
    nodes: [
        HeadingNode,
        QuoteNode,
        ListNode,
        ListItemNode,
        CodeNode,
        CodeHighlightNode,
        TableNode,
        TableCellNode,
        TableRowNode,
        AutoLinkNode,
        LinkNode,
        ImageNode,
        DrawioNode,
    ],
};

const Editor: React.FC = () => {
    return (
        <div className={styles.editorPageWrapper}>
            <LexicalComposer initialConfig={editorConfig}>
                <div className={styles.editorContainer}>
                    <ToolbarPlugin />
                    <div className={styles.editorInner}>
                        <RichTextPlugin
                            contentEditable={<ContentEditable className={styles.editorInput} />}
                            placeholder={<Placeholder />}
                            ErrorBoundary={LexicalErrorBoundary}
                        />
                        <HistoryPlugin />
                        <AutoFocusPlugin />
                        <ListPlugin />
                        <LinkPlugin />
                        <ImagePlugin />
                        <DrawioPlugin />
                        <SlashCommandPlugin />
                    </div>
                </div>
            </LexicalComposer>
        </div>
    );
};

export default Editor;
