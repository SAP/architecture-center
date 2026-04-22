import React, { useCallback, JSX } from 'react';
import type { NodeKey } from 'lexical';
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

import styles from './index.module.css';

interface ImageComponentProps {
    src: string;
    altText: string;
    nodeKey: NodeKey;
    width: 'inherit' | number;
    height: 'inherit' | number;
}

export default function ImageComponent({ src, altText, nodeKey, width: _width, height: _height }: ImageComponentProps): JSX.Element {
    const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey);
    useLexicalComposerContext(); // Hook must be called even if editor instance isn't used

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
