import React, { JSX, useRef, useEffect } from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Link from '@docusaurus/Link';
import '@ui5/webcomponents-icons/dist/AllIcons';
import styles from './HeroSection.module.css';

export default function HeroSection(): JSX.Element {
    const videoSrc = useBaseUrl('/video/297893_gettyimages-1396007643_video_web.mp4');
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        let isReversing = false;
        let reverseStartWall = 0;
        let reverseFromTime = 0;

        const stepBack = () => {
            const elapsed = (performance.now() - reverseStartWall) / 1000;
            const target = reverseFromTime - elapsed;
            if (target <= 0) {
                isReversing = false;
                video.currentTime = 0;
                if (!document.hidden) {
                    video.play().catch(() => {});
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

        const handleSeeked = () => {
            if (isReversing) {
                stepBack();
            }
        };

        const handleVisibilityChange = () => {
            if (document.hidden) {
                video.pause();
            } else if (!isReversing) {
                video.play().catch(() => {});
            }
        };

        video.play().catch(() => {});

        video.addEventListener('ended', handleEnded);
        video.addEventListener('seeked', handleSeeked);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            video.removeEventListener('ended', handleEnded);
            video.removeEventListener('seeked', handleSeeked);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    return (
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
    );
}