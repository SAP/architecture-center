import React, { JSX, useEffect, useState } from 'react';
import Link from '@docusaurus/Link';
import BrowserOnly from '@docusaurus/BrowserOnly';
import '@ui5/webcomponents-icons/dist/AllIcons';
import styles from './HeroSection.module.css';
import AnniversarySticker from '../components/AnniversarySticker/AnniversarySticker';

export default function HeroSection(): JSX.Element {
    const [displayedText, setDisplayedText] = useState('');
    const [typingDone, setTypingDone] = useState(false);
    const fullText = 'SAP Architecture Center';

    // Typewriter effect
    useEffect(() => {
        let index = 0;
        const interval = setInterval(() => {
            index++;
            setDisplayedText(fullText.slice(0, index));
            if (index >= fullText.length) {
                clearInterval(interval);
                setTypingDone(true);
            }
        }, 70);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className={styles.heroWrapper}>
            <AnniversarySticker />
            <div className={styles.background} />
            <div className={styles.canvasWrapper}>
                <BrowserOnly>
                    {() => {
                        const ThreeWave = require('../components/ThreeWave/ThreeWave').default;
                        return <ThreeWave />;
                    }}
                </BrowserOnly>
            </div>
            <div className={styles.heroContainer}>
                <div className={styles.heroContent}>
                    <h1 className={styles.heroTitle}>
                        {displayedText}
                        {!typingDone && <span className={styles.cursor}>|</span>}
                    </h1>
                    <p className={styles.heroSubtitle}>
                        Empowering architects and developers to design, integrate, and optimize SAP Solutions through best practices, reference architectures, and community-driven guidance.
                    </p>
                    <div className={styles.heroActions}>
                        <Link to="/docs/ref-arch" className={styles.primaryButton}>
                            Browse Architectures
                        </Link>
                        <Link to="/docs/community/intro" className={styles.secondaryButton}>
                            Community of Practice
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
