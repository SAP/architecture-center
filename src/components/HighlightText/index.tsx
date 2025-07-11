import React, { JSX } from 'react';
import styles from './HighlightText.module.css';

interface HighlightTextProps {
    children: React.ReactNode;
}

export default function HighlightText({ children }: HighlightTextProps): JSX.Element {
    return (
        <strong className={styles.highlightText}>
            {children}
        </strong>
    );
}
