import React from 'react';
import { $getSelection, $isRangeSelection, LexicalEditor } from 'lexical';
import { Paperclip } from 'lucide-react';
import * as mammoth from 'mammoth';
import { $generateNodesFromDOM } from '@lexical/html';

const onFileSelect = (editor: LexicalEditor) => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.txt,.md,.docx';
    fileInput.style.display = 'none';

    fileInput.onchange = (e) => {
        const target = e.target as HTMLInputElement;
        const file = target.files?.[0];

        if (!file) {
            return;
        }

        const reader = new FileReader();

        if (file.name.endsWith('.docx')) {
            reader.readAsArrayBuffer(file);

            reader.onload = async (event) => {
                const arrayBuffer = event.target?.result as ArrayBuffer;

                if (arrayBuffer) {
                    try {
                        const mammothOptions = {
                            convertImage: mammoth.images.imgElement(() => ({})),
                        };

                        const result = await mammoth.convertToHtml({ arrayBuffer }, mammothOptions);

                        const html = result.value;

                        editor.update(() => {
                            const parser = new DOMParser();
                            const dom = parser.parseFromString(html, 'text/html');
                            const nodes = $generateNodesFromDOM(editor, dom);

                            const selection = $getSelection();
                            if ($isRangeSelection(selection)) {
                                selection.insertNodes(nodes);
                            }
                        });
                    } catch (error) {
                        console.error('Error converting .docx file:', error);
                        alert('Could not process the .docx file. It may be corrupted or in an unsupported format.');
                    }
                }
            };
        } else {
            reader.readAsText(file);

            reader.onload = (event) => {
                const fileContent = event.target?.result as string;
                if (fileContent) {
                    editor.update(() => {
                        const selection = $getSelection();
                        if ($isRangeSelection(selection)) {
                            selection.insertText(fileContent);
                        }
                    });
                }
            };
        }

        reader.onerror = (error) => {
            console.error('Error reading file:', error);
            alert('An error occurred while reading the file.');
        };

        document.body.removeChild(fileInput);
    };

    document.body.appendChild(fileInput);
    fileInput.click();
};

export const fileUploadCommand = {
    name: 'File',
    icon: <Paperclip size={20} />,
    keywords: ['file', 'upload', 'import', 'attach', 'document', 'docx'],
    onSelect: onFileSelect,
};
