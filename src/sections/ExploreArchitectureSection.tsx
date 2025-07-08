import React, { useRef, useState, useEffect } from 'react';
import Slid
// @ts-ignore
import DocCard from '@theme/DocCard';
// @ts-ignore
import exploreSidebar from '../data/exploreArch.json';
import { Title, Button, FlexBox } from '@ui5/webcomponents-react';
import '@ui5/webcomponents-icons/dist/navigation-left-arrow';
import '@ui5/webcomponents-icons/dist/navigation-right-arrow';
import Link from '@docusaurus/Link';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import styles from './index.module.css';

export default function ExploreAllArchitecturesSection() {
    const sliderRef = useRef<Slider>(null);
    const items = exploreSidebar[0]?.items || [];
    
    // Hydration guard to prevent SSR/client mismatch
    const [isHydrated, setIsHydrated] = useState(false);
    const [slidesToShow, setSlidesToShow] = useState(3); // SSR-safe default

    // Set hydration state and initial responsive settings
    useEffect(() => {
        const updateSlidesToShow = () => {
            if (typeof window !== 'undefined') {
                const width = window.innerWidth;
                setSlidesToShow(width <= 996 ? 1 : 3);
            }
        };
        
        updateSlidesToShow();
        setIsHydrated(true);
    }, []);

    // Handle resize events after hydration
    useEffect(() => {
        if (!isHydrated) return;
        const handleResize = () => {
            const width = window.innerWidth;
            setSlidesToShow(width <= 996 ? 1 : 3);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isHydrated]);

    // react-slick settings for responsive carousel
    const settings = {
        dots: true,
        arrows: false, // We'll use our own UI5 buttons for navigation
        infinite: items.length > 3,
        speed: 500,
        slidesToShow: slidesToShow,
        slidesToScroll: 1,
        responsive: [
            {
                breakpoint: 996,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                },
            },
        ],
    };

    // Don't render the slider until after hydration to prevent mismatch
    if (!isHydrated) {
        return (
            <section className={styles.sectionContainer}>
                <div className={styles.innerContainer}>
                    <Title level="H3" size="H3" className={styles.titleStyle}>
                        Explore the latest Reference Architectures
                    </Title>
                    <FlexBox justifyContent="End" alignItems="Center" className={styles.headerRow}>
                        <FlexBox alignItems="Center" className={styles.headerControls}>
                            <Button
                                accessibleName="Previous slide"
                                design="Transparent"
                                icon="navigation-left-arrow"
                                disabled
                            />
                            <Button
                                accessibleName="Next slide"
                                design="Transparent"
                                icon="navigation-right-arrow"
                                disabled
                            />
                            <Link to="docs/exploreallrefarch">Browse All</Link>
                        </FlexBox>
                    </FlexBox>
                    <div className={styles.carouselContainer}>
                        {/* Show first few cards as fallback during hydration */}
                        {items.slice(0, 3).map((item, idx) => (
                            <div key={idx} className={styles.cardContainer}>
                                <DocCard item={item} />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className={styles.sectionContainer}>
            <div className={styles.innerContainer}>
                <Title level="H3" size="H3" className={styles.titleStyle}>
                    Explore the latest Reference Architectures
                </Title>
                <FlexBox justifyContent="End" alignItems="Center" className={styles.headerRow}>
                    <FlexBox alignItems="Center" className={styles.headerControls}>
                        <Button
                            accessibleName="Previous slide"
                            design="Transparent"
                            icon="navigation-left-arrow"
                            onClick={() => sliderRef.current?.slickPrev()}
                        />
                        <Button
                            accessibleName="Next slide"
                            design="Transparent"
                            icon="navigation-right-arrow"
                            onClick={() => sliderRef.current?.slickNext()}
                        />
                        <Link to="docs/exploreallrefarch">Browse All</Link>
                    </FlexBox>
                </FlexBox>
                <div className={styles.carouselContainer}>
                    <Slider ref={sliderRef} {...settings}>
                        {items.map((item, idx) => (
                            <div key={idx} className={styles.cardContainer}>
                                <DocCard item={item} />
                            </div>
                        ))}
                    </Slider>
                </div>
            </div>
        </section>
    );
}
