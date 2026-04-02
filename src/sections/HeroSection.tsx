import React, { JSX, useRef, useEffect, useState } from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Link from '@docusaurus/Link';
import '@ui5/webcomponents-icons/dist/AllIcons';
import styles from './HeroSection.module.css';

declare global {
    interface Window {
        particlesJS: (id: string, config: object) => void;
    }
}

export default function HeroSection(): JSX.Element {
    const particlesConfigUrl = useBaseUrl('/particlesjs-config.json');
    const particlesInitialized = useRef(false);
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
        }, 50);
        return () => clearInterval(interval);
    }, []);

    // Initialize particles.js
    useEffect(() => {
        if (particlesInitialized.current) return;

        const loadParticles = async () => {
            // Dynamically import particles.js (client-side only)
            await import('particles.js');

            // Fetch config and initialize
            const response = await fetch(particlesConfigUrl);
            const config = await response.json();
            window.particlesJS('particles-js', config);
            particlesInitialized.current = true;
        };

        loadParticles().catch(console.error);
    }, [particlesConfigUrl]);

    return (
        <div className={styles.heroWrapper}>
            <div id="particles-js" className={styles.particlesContainer}></div>
            <div className={styles.heroContainer}>
                <div className={styles.heroContent}>
                    <h1 className={styles.heroTitle}>
                        {displayedText}
                        {!typingDone && <span className={styles.cursor}>█</span>}
                    </h1>
                    <p className={styles.heroSubtitle}>
                        Empowering architects and developers with best practices, reference architectures,
                        and community-driven guidance for designing, integrating, and optimizing SAP and
                        cloud solutions.
                    </p>
                    <div className={styles.heroActions}>
                        <Link to="/docs/ref-arch" className={styles.primaryButton}>
                            Browse Architectures
                        </Link>
                        <Link to="/community/intro" className={styles.secondaryButton}>
                            Community of Practice
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}