import React, { JSX } from 'react';
import styles from './AnniversarySticker.module.css';

export default function AnniversarySticker(): JSX.Element {
    return (
        <a
            className={styles.sticker}
            href="https://www.sap.com/germany/events/teched/berlin.html"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="SAP TechEd 2026 30th anniversary"
        >
            <span className={styles.text}>SAP TechEd 2026 30th anniversary</span>
        </a>
    );
}
