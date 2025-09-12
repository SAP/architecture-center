import React from 'react';
import { LexicalComposer, InitialConfigType } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListNode, ListItemNode } from '@lexical/list';
import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { usePageDataStore } from '@site/src/store/pageDataStore';
import { ImageNode } from './nodes/ImageNode';
import ImagePlugin from './plugins/ImagePlugin';
import ToolbarPlugin from './plugins/ToolbarPlugin';
import { DrawioNode } from './nodes/DrawioNode';
import DrawioPlugin from './plugins/DrawioPlugin';
import TableOfContentsPlugin from './plugins/TableOfContentPlugin';
import SlashCommandPlugin from './plugins/SlashCommandPlugin';
import { ArticleMetadataNode } from './nodes/ArticleMetadataNode';
import InitializerPlugin from './plugins/InitializerPlugin';
import TitleSyncPlugin from './plugins/TitleSyncPlugin';
import EditorTheme from './EditorTheme';
import styles from './index.module.css';
import PageTabs from '../PageTabs';

function Placeholder() {
    return <div className={styles.editorPlaceholder}>Type '/' for commands...</div>;
}

const editorNodes = [
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
    ArticleMetadataNode,
];

const AutoSavePlugin: React.FC = () => {
    const [editor] = useLexicalComposerContext();
    const { getActiveDocument, updateDocument } = usePageDataStore();

    const handleSave = (editorState: any) => {
        const activeDoc = getActiveDocument();
        if (activeDoc) {
            const editorStateJSON = JSON.stringify(editorState.toJSON());
            if (editorStateJSON !== activeDoc.editorState) {
                updateDocument(activeDoc.id, { editorState: editorStateJSON });
            }
        }
    };

    return <OnChangePlugin onChange={handleSave} />;
};

interface EditorProps {
    onAddNew: (parentId?: string | null) => void;
}

const Editor: React.FC<EditorProps> = ({ onAddNew }) => {
    const { getActiveDocument, saveState, lastSaveTimestamp } = usePageDataStore();
    const activeDocument = getActiveDocument();

    if (!activeDocument) return null;

    const editorConfig: InitialConfigType = {
        namespace: 'MyEditor',
        theme: EditorTheme,
        onError(error) {
            throw error;
        },
        nodes: editorNodes,
        editorState: activeDocument.editorState || null,
    };

    return (
        <LexicalComposer initialConfig={editorConfig}>
            <div className={styles.editorPageWrapper}>
                <div className={styles.navColumn}>
                    <PageTabs onAddNew={onAddNew} />
                </div>

                <div className={styles.editorColumn}>
                    {/* --- NEW HEADER --- */}
                    <div className={styles.editorHeader}>
                        {lastSaveTimestamp && (
                            <span className={styles.saveTimestamp}>Last saved: {lastSaveTimestamp}</span>
                        )}
                        <button className={styles.saveButton} onClick={saveState}>
                            Save
                        </button>
                    </div>
                    {/* --- END NEW HEADER --- */}

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
                            <InitializerPlugin />
                            <TitleSyncPlugin />
                            <AutoSavePlugin />
                        </div>
                    </div>
                </div>

                <div className={styles.tocColumn}>
                    <TableOfContentsPlugin />
                </div>
            </div>
        </LexicalComposer>
    );
};

export default Editor;
