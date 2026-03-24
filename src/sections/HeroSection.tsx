import React, { JSX, useRef, useEffect } from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { navigationCardsData } from '../constant/constants';
import ArchitectureTabs from '../components/ArchitectureTabs/ArchitectureTabs';
import Link from '@docusaurus/Link';
import '@ui5/webcomponents-icons/dist/AllIcons';
import styles from './HeroSection.module.css';
import { useAuth } from '../context/AuthContext';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

export default function HeroSection(): JSX.Element {
    const { users } = useAuth();
    const { siteConfig } = useDocusaurusContext();
    const videoSrc = useBaseUrl('/video/297893_gettyimages-1396007643_video_web.mp4');

    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        let isReversing = false;
        let reverseStartWall = 0;
        let reverseFromTime = 0;

        // Called once per completed seek while reversing.
        // Uses wall-clock elapsed time so the reverse plays at exactly 1× speed
        // regardless of how long each seek takes.
        const stepBack = () => {
            const elapsed = (performance.now() - reverseStartWall) / 1000;
            const target = reverseFromTime - elapsed;
            if (target <= 0) {
                isReversing = false;
                video.currentTime = 0;
                if (!document.hidden) {
                    video.play().catch(() => {
                        // Ignore play errors
                    });
                }
            } else {
                video.currentTime = target;
            }
        };

        const handleEnded = () => {
            isReversing = true;
            reverseStartWall = performance.now();
            reverseFromTime = video.duration;
            stepBack();
        };

        // Fire the next seek only after the previous one has completed,
        // preventing seek-queue flooding that caused the earlier jank.
        const handleSeeked = () => {
            if (isReversing) {
                stepBack();
            }
        };

        // Pause video when page is not visible
        const handleVisibilityChange = () => {
            if (document.hidden) {
                video.pause();
            } else {
                // Only try to play if we're not reversing
                if (!isReversing) {
                    video.play().catch(() => {
                        // Ignore play errors when page becomes visible
                    });
                }
            }
        };

        // Start playing the video manually
        video.play().catch(() => {
            // Ignore initial play errors
        });

        video.addEventListener('ended', handleEnded);
        video.addEventListener('seeked', handleSeeked);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            video.removeEventListener('ended', handleEnded);
            video.removeEventListener('seeked', handleSeeked);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    const getVisibleNavigationCards = () => {
        const { authProviders } = siteConfig.customFields as {
            authProviders: Record<string, 'btp' | 'github'>;
        };

        return navigationCardsData.map((card) => {
            const requiredProvider = authProviders?.[card.link];
            let disabled = false;

            if (requiredProvider) {
                const isLoggedInWithRequiredProvider = users[requiredProvider] !== null;
                disabled = !isLoggedInWithRequiredProvider;
            } else if (card.requiresAuth) {
                const isLoggedIn = users.github || users.btp;
                disabled = !isLoggedIn;
            }

            return {
                ...card,
                disabled,
            };
        });
    };

    return (
        <section className={styles.section}>
            {/* Modern Hero Banner */}
            <div className={styles.heroContainer}>
                <div className={styles.heroContent}>
                    <h1 className={styles.heroTitle}>SAP Architecture Center</h1>
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
                <div className={styles.heroImage}>
                    <video
                        ref={videoRef}
                        className={styles.heroVideo}
                        src={videoSrc}
                        muted
                        playsInline
                    />
                </div>
            </div>

            {/* Navigation Cards */}
            {/* HIDDEN: Cards for AI-Native North Star Architecture, Quick Start, and Architecture Validator */}
            {/* <div className={styles.cardsGrid}>
                {getVisibleNavigationCards().map((item, index) => (
                    <NavigationCard
                        key={index}
                        title={item.title}
                        subtitle={item.subtitle}
                        icon={item.icon}
                        link={item.link}
                        disabled={item.disabled}
                        isNew={item.isNew}
                    />
                ))}
            </div> */}

            {/* Redundant Architecture Tabs (for Stakeholder Comparison) */}
            <ArchitectureTabs tabs={getVisibleNavigationCards()} />
        </section>
    );
}