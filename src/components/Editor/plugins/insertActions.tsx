import { LexicalEditor } from 'lexical';
import { Image as ImageIcon, LayoutDashboard, Paperclip, LucideIcon, Info, AlertTriangle, Lightbulb, StickyNote, AlertOctagon } from 'lucide-react';
import { TOGGLE_IMAGE_DIALOG, OPEN_DRAWIO_DIALOG, INSERT_ADMONITION_COMMAND } from './commands';
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
    {
        id: 'callout-note',
        name: 'Note',
        keywords: ['note', 'callout', 'admonition', 'box'],
        icon: StickyNote,
        onSelect: (editor) => {
            editor.dispatchCommand(INSERT_ADMONITION_COMMAND, { admonitionType: 'note' });
        },
    },
    {
        id: 'callout-info',
        name: 'Info',
        keywords: ['info', 'information', 'callout', 'admonition'],
        icon: Info,
        onSelect: (editor) => {
            editor.dispatchCommand(INSERT_ADMONITION_COMMAND, { admonitionType: 'info' });
        },
    },
    {
        id: 'callout-tip',
        name: 'Tip',
        keywords: ['tip', 'hint', 'callout', 'admonition'],
        icon: Lightbulb,
        onSelect: (editor) => {
            editor.dispatchCommand(INSERT_ADMONITION_COMMAND, { admonitionType: 'tip' });
        },
    },
    {
        id: 'callout-warning',
        name: 'Warning',
        keywords: ['warning', 'caution', 'callout', 'admonition'],
        icon: AlertTriangle,
        onSelect: (editor) => {
            editor.dispatchCommand(INSERT_ADMONITION_COMMAND, { admonitionType: 'warning' });
        },
    },
    {
        id: 'callout-danger',
        name: 'Danger',
        keywords: ['danger', 'error', 'alert', 'callout', 'admonition'],
        icon: AlertOctagon,
        onSelect: (editor) => {
            editor.dispatchCommand(INSERT_ADMONITION_COMMAND, { admonitionType: 'danger' });
        },
    },
];
