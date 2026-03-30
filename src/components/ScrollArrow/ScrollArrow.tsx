import React, { JSX, useRef } from 'react';
import styles from './ScrollArrow.module.css';

export default function ScrollArrow(): JSX.Element {
    const arrowRef = useRef<HTMLDivElement>(null);

    const handleClick = () => {
        if (!arrowRef.current) return;

        // Find the parent section (FullPageSection)
        const currentSection = arrowRef.current.closest('section');
        if (!currentSection) return;

        // Find the next sibling section
        const nextSection = currentSection.nextElementSibling;
        if (nextSection) {
            nextSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div ref={arrowRef} className={styles.scrollArrowContainer}>
            <div className={styles.scrollArrow} onClick={handleClick}>
                <span></span>
            </div>
        </div>
    );
}
