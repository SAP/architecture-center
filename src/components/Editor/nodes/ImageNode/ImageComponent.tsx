import React, { useState, useCallback, JSX } from 'react';
import type { NodeKey, EditorConfig, LexicalEditor } from 'lexical';
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getNodeByKey } from 'lexical';

import styles from './index.module.css';

interface ImageComponentProps {
    src: string;
    altText: string;
    nodeKey: NodeKey;
    width: 'inherit' | number;
    height: 'inherit' | number;
}

export default function ImageComponent({ src, altText, nodeKey, width, height }: ImageComponentProps): JSX.Element {
    const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey);
    const [editor] = useLexicalComposerContext();

    const onClick = useCallback(
        (payload) => {
            const event = payload;
            event.preventDefault();

            if (isSelected) {
                clearSelection();
            } else {
                clearSelection();
                setSelected(true);
            }
        },
        [isSelected, clearSelection, setSelected]
    );

    return (
        <div draggable={false} onClick={onClick} onContextMenu={onClick}>
            <img src={src} alt={altText} className={isSelected ? `${styles.image} ${styles.focused}` : styles.image} />
        </div>
    );
}
