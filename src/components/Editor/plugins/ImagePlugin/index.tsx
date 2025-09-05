import React, { useEffect, useRef, JSX } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getSelection, $isRangeSelection, COMMAND_PRIORITY_EDITOR } from 'lexical';
import { $createImageNode, ImageNode } from '../../nodes/ImageNode';
import { INSERT_IMAGE_COMMAND, TOGGLE_IMAGE_DIALOG } from '../commands';

export default function ImagePlugin(): JSX.Element | null {
    const [editor] = useLexicalComposerContext();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (file) {
            const objectUrl = URL.createObjectURL(file);
            editor.dispatchCommand(INSERT_IMAGE_COMMAND, { src: objectUrl, altText: file.name });
        }

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    useEffect(() => {
        if (!editor.hasNodes([ImageNode])) {
            throw new Error('ImagePlugin: ImageNode not registered on editor');
        }

        const unregisterInsert = editor.registerCommand(
            INSERT_IMAGE_COMMAND,
            (payload) => {
                editor.update(() => {
                    const selection = $getSelection();
                    if ($isRangeSelection(selection)) {
                        const imageNode = $createImageNode(payload);
                        selection.insertNodes([imageNode]);
                    }
                });
                return true;
            },
            COMMAND_PRIORITY_EDITOR
        );

        const unregisterToggle = editor.registerCommand(
            TOGGLE_IMAGE_DIALOG,
            () => {
                fileInputRef.current?.click();
                return true;
            },
            COMMAND_PRIORITY_EDITOR
        );

        return () => {
            unregisterInsert();
            unregisterToggle();
        };
    }, [editor]);

    return (
        <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            ref={fileInputRef}
            style={{ display: 'none' }}
        />
    );
}
