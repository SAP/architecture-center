import React, { useEffect, useRef, JSX } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getSelection, $isRangeSelection, COMMAND_PRIORITY_EDITOR } from 'lexical';
import { $createDrawioNode, DrawioNode } from '../../nodes/DrawioNode';
import { INSERT_DRAWIO_COMMAND, OPEN_DRAWIO_DIALOG } from '../commands';

export default function DrawioPlugin(): JSX.Element | null {
    const [editor] = useLexicalComposerContext();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const processFile = (file: File) => {
        if (!file || !file.name.toLowerCase().endsWith('.drawio')) {
            console.warn('Invalid file type. Please upload a .drawio file.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const xml = e.target?.result as string;
            if (xml) {
                editor.dispatchCommand(INSERT_DRAWIO_COMMAND, xml);
            }
        };
        reader.readAsText(file);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            processFile(file);
        }
        event.target.value = '';
    };

    useEffect(() => {
        if (!editor.hasNodes([DrawioNode])) {
            throw new Error('DrawioPlugin: DrawioNode not registered on editor');
        }

        const unregisterInsert = editor.registerCommand(
            INSERT_DRAWIO_COMMAND,
            (payload) => {
                editor.update(() => {
                    const selection = $getSelection();
                    if ($isRangeSelection(selection)) {
                        selection.insertNodes([$createDrawioNode(payload)]);
                    }
                });
                return true;
            },
            COMMAND_PRIORITY_EDITOR
        );

        const unregisterOpen = editor.registerCommand(
            OPEN_DRAWIO_DIALOG,
            () => {
                fileInputRef.current?.click();
                return true;
            },
            COMMAND_PRIORITY_EDITOR
        );

        const editorRootElement = editor.getRootElement();
        const handleDragOver = (event: DragEvent) => {
            event.preventDefault();
        };

        const handleDrop = (event: DragEvent) => {
            event.preventDefault();
            const files = event.dataTransfer?.files;
            if (files && files.length > 0) {
                const drawioFile = Array.from(files).find((file) => file.name.toLowerCase().endsWith('.drawio'));

                if (drawioFile) {
                    processFile(drawioFile);
                }
            }
        };

        if (editorRootElement) {
            editorRootElement.addEventListener('dragover', handleDragOver);
            editorRootElement.addEventListener('drop', handleDrop);
        }

        return () => {
            unregisterInsert();
            unregisterOpen();
            if (editorRootElement) {
                editorRootElement.removeEventListener('dragover', handleDragOver);
                editorRootElement.removeEventListener('drop', handleDrop);
            }
        };
    }, [editor]);

    return (
        <input
            type="file"
            accept=".drawio"
            onChange={handleFileChange}
            ref={fileInputRef}
            style={{ display: 'none' }}
        />
    );
}
