import React, { useEffect, useRef, JSX } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getSelection, $isRangeSelection, COMMAND_PRIORITY_EDITOR } from 'lexical';
import { $createImageNode, ImageNode } from '../../nodes/ImageNode';
import { INSERT_IMAGE_COMMAND, TOGGLE_IMAGE_DIALOG } from '../commands';

function readFileAsDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result);
            } else {
                reject(new Error('FileReader did not return a string.'));
            }
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

export default function ImagePlugin(): JSX.Element | null {
    const [editor] = useLexicalComposerContext();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (file) {
            try {
                const dataUrl = await readFileAsDataURL(file);
                editor.dispatchCommand(INSERT_IMAGE_COMMAND, { src: dataUrl, altText: file.name });
            } catch (error) {
                console.error('Error reading file:', error);
            }
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
