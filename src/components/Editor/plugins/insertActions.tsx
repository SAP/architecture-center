import { LexicalEditor } from 'lexical';
import { Image as ImageIcon, LayoutDashboard, Paperclip, LucideIcon } from 'lucide-react';
import { TOGGLE_IMAGE_DIALOG, OPEN_DRAWIO_DIALOG } from './commands';
import { fileUploadCommand } from './fileUploadCommand';

export interface InsertAction {
    id: string;
    name: string;
    keywords: string[];
    icon: LucideIcon;
    onSelect: (editor: LexicalEditor) => void;
}

export const INSERT_ACTIONS: InsertAction[] = [
    {
        id: 'image',
        name: 'Image',
        keywords: ['image', 'photo', 'picture', 'img'],
        icon: ImageIcon,
        onSelect: (editor) => {
            editor.dispatchCommand(TOGGLE_IMAGE_DIALOG, undefined);
        },
    },
    {
        id: 'drawio',
        name: 'Draw.io Diagram',
        keywords: ['drawio', 'diagram', 'draw', 'flowchart'],
        icon: LayoutDashboard,
        onSelect: (editor) => {
            editor.dispatchCommand(OPEN_DRAWIO_DIALOG, undefined);
        },
    },
    {
        id: 'file',
        name: fileUploadCommand.name,
        keywords: fileUploadCommand.keywords,
        icon: Paperclip,
        onSelect: fileUploadCommand.onSelect,
    },
];
