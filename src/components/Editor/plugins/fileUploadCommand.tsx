import React from 'react';
import { $getSelection, $isRangeSelection, LexicalEditor } from 'lexical';
import { Paperclip } from 'lucide-react';

const onFileSelect = (editor: LexicalEditor) => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.txt,.md,.js,.css,.html,.json';
    fileInput.style.display = 'none';

    fileInput.onchange = (e) => {
        const target = e.target as HTMLInputElement;
        const file = target.files?.[0];

        if (!file) {
            return;
        }

        const reader = new FileReader();
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

        reader.onerror = (error) => console.error('Error reading file:', error);

        reader.readAsText(file);
        document.body.removeChild(fileInput);
    };

    document.body.appendChild(fileInput);
    fileInput.click();
};

export const fileUploadCommand = {
    name: 'File',
    icon: <Paperclip size={20} />,
    keywords: ['file', 'upload', 'import', 'attach', 'document'],
    onSelect: onFileSelect,
};
