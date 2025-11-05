import { createCommand, LexicalCommand } from 'lexical';

export const INSERT_IMAGE_COMMAND: LexicalCommand<{ src: string; altText: string }> =
    createCommand('INSERT_IMAGE_COMMAND');
export const TOGGLE_IMAGE_DIALOG: LexicalCommand<void> = createCommand('TOGGLE_IMAGE_DIALOG');

export const INSERT_DRAWIO_COMMAND: LexicalCommand<string> = createCommand('INSERT_DRAWIO_COMMAND');
export const OPEN_DRAWIO_DIALOG: LexicalCommand<void> = createCommand('OPEN_DRAWIO_DIALOG');
