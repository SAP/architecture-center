import React, { JSX, useRef, useEffect, useState } from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Link from '@docusaurus/Link';
import '@ui5/webcomponents-icons/dist/AllIcons';
import styles from './HeroSectionParticles.module.css';
import { logger } from '@site/src/utils/logger';

declare global {
    interface Window {
        particlesJS: (id: string, config: object) => void;
        // particles.js tracks each initialised instance here; used for teardown.
        pJSDom?: Array<{ pJS?: { fn?: { vendors?: { destroypJS?: () => void } } } }>;
    }
}

export default function HeroSectionParticles(): JSX.Element {
    const particlesConfigUrl = useBaseUrl('/particlesjs-config.json');
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

    // Initialize particles.js, and tear it down on unmount. This hero is only
    // mounted while the light theme is active, so switching to dark unmounts it;
    // without explicit teardown particles.js leaves its canvas and animation
    // loop running (tracked on window.pJSDom), leaking one per theme toggle.
    useEffect(() => {
        let cancelled = false;
        let resizeTimer: ReturnType<typeof setTimeout> | undefined;
        let removeResizeListener = () => {};

        const destroy = () => {
            if (!window.pJSDom || !window.pJSDom.length) return;
            window.pJSDom.forEach((dom) => {
                try {
                    dom?.pJS?.fn?.vendors?.destroypJS?.();
                } catch (error) {
                    logger.error('Failed to tear down particles.js instance', error);
                }
            });
            window.pJSDom = [];
        };

        const loadParticles = async () => {
            // Dynamically import particles.js (client-side only)
            await import('particles.js');
            if (cancelled) return;

            // Fetch config and initialize
            const response = await fetch(particlesConfigUrl);
            const config = await response.json();
            if (cancelled) return;

            // Respect reduced-motion: the aurora variant disables its drift and
            // parallax for this preference, so keep the light variant still too.
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                config.particles.move.enable = false;
            }

            // particles.js 2.0.0 installs its own window resize listener when
            // interactivity.events.resize is on, and destroypJS() never removes
            // it, so every theme toggle would leak one. Disable the library's
            // resize handling and own a debounced re-init instead (cleaned up below).
            config.interactivity.events.resize = false;

            const initialize = () => {
                if (cancelled) return;
                // Clear any stale instance before (re)initialising, e.g. a dev
                // StrictMode double-mount or a quick light→dark→light toggle.
                destroy();
                window.particlesJS('particles-js', config);
            };
            initialize();

            const onResize = () => {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(initialize, 200);
            };
            window.addEventListener('resize', onResize);
            removeResizeListener = () => window.removeEventListener('resize', onResize);
        };

        loadParticles().catch((error) => {
            logger.error('Failed to load particles.js', error);
        });

        return () => {
            cancelled = true;
            removeResizeListener();
            clearTimeout(resizeTimer);
            destroy();
        };
    }, [particlesConfigUrl]);

    return (
        <div className={styles.heroWrapper}>
            <div id="particles-js" className={styles.particlesContainer}></div>
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
