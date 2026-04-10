import { createCommand, LexicalCommand } from 'lexical';
import { AdmonitionType } from '../nodes/AdmonitionNode';

export interface InsertImagePayload {
    src: string;
    altText: string;
    assetId?: string | null;
}

export interface InsertDrawioPayload {
    diagramXML?: string | null;
    assetId?: string | null;
}

export interface InsertAdmonitionPayload {
    admonitionType: AdmonitionType;
}

export const INSERT_IMAGE_COMMAND: LexicalCommand<InsertImagePayload> =
    createCommand('INSERT_IMAGE_COMMAND');
export const TOGGLE_IMAGE_DIALOG: LexicalCommand<void> = createCommand('TOGGLE_IMAGE_DIALOG');

export const INSERT_DRAWIO_COMMAND: LexicalCommand<InsertDrawioPayload> = createCommand('INSERT_DRAWIO_COMMAND');
export const OPEN_DRAWIO_DIALOG: LexicalCommand<void> = createCommand('OPEN_DRAWIO_DIALOG');

export const INSERT_ADMONITION_COMMAND: LexicalCommand<InsertAdmonitionPayload> = createCommand('INSERT_ADMONITION_COMMAND');
