import React, { JSX, useRef } from 'react';
import styles from './ScrollArrow.module.css';

export default function ScrollArrow(): JSX.Element {
    const arrowRef = useRef<HTMLDivElement>(null);

    const scrollToNextSection = () => {
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

    const handleClick = () => {
        scrollToNextSection();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            scrollToNextSection();
        }
    };

    return (
        <div ref={arrowRef} className={styles.scrollArrowContainer}>
            <div
                className={styles.scrollArrow}
                onClick={handleClick}
                onKeyDown={handleKeyDown}
                role="button"
                tabIndex={0}
                aria-label="Scroll to next section"
            >
                <span></span>
            </div>
        </div>
    );
}
