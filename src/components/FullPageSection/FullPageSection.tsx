import React, { JSX, ReactNode } from 'react';
import ScrollArrow from '../ScrollArrow/ScrollArrow';
import styles from './FullPageSection.module.css';

interface FullPageSectionProps {
    children: ReactNode;
    showArrow?: boolean;
    className?: string;
    isLast?: boolean;
}

export default function FullPageSection({
    children,
    showArrow = true,
    className = '',
    isLast = false,
}: FullPageSectionProps): JSX.Element {
    const sectionClasses = [
        styles.fullPageSection,
        isLast ? styles.lastSection : '',
        className,
    ].filter(Boolean).join(' ');

    return (
        <section className={sectionClasses}>
            <div className={styles.content}>
                {children}
            </div>
            {showArrow && (
                <div className={styles.arrowContainer}>
                    <ScrollArrow />
                </div>
            )}
        </section>
    );
}
