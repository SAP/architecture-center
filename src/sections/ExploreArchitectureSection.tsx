import React, { useRef, useState, useMemo, useEffect } from 'react';
// @ts-ignore
import DocCard from '@theme/DocCard';
// @ts-ignore
import exploreSidebar from '../data/exploreArch.json';
import { Text, Title, Button, FlexBox } from '@ui5/webcomponents-react';
import '@ui5/webcomponents-icons/dist/navigation-left-arrow';
import '@ui5/webcomponents-icons/dist/navigation-right-arrow';
import Link from '@docusaurus/Link';

import styles from './index.module.css';

export default function ExploreAllArchitecturesSection() {
    const items = exploreSidebar[0]?.items || [];

    // Group size based on screen width
    const getCardsPerGroup = () => {
        if (typeof window !== 'undefined') {
            const width = window.innerWidth;
            if (width <= 996) return 1;
        }
        return 3;
    };

    const [cardsPerGroup, setCardsPerGroup] = useState(3); // SSR-safe default
    const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
    const [isHydrated, setIsHydrated] = useState(false);

    const carouselRef = useRef<HTMLDivElement>(null);

    // Set initial cards per group after hydration
    useEffect(() => {
        setCardsPerGroup(getCardsPerGroup());
        setIsHydrated(true);
    }, []);

    // Recalculate cards per group on resize
    useEffect(() => {
        if (!isHydrated) return; // Only run after hydration

        const handleResize = () => {
            const newGroupSize = getCardsPerGroup();
            setCardsPerGroup(newGroupSize);
            setCurrentGroupIndex(0); // Reset position on resize
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isHydrated]);

    // Group items into chunks
    const groupedItems = useMemo(() => {
        const groups = [];
        for (let i = 0; i < items.length; i += cardsPerGroup) {
            groups.push(items.slice(i, i + cardsPerGroup));
        }
        return groups;
    }, [items, cardsPerGroup]);

    const totalGroups = groupedItems.length;

    const canGoLeft = currentGroupIndex > 0;
    const canGoRight = currentGroupIndex < totalGroups - 1;

    const goNext = () => {
        if (carouselRef.current && canGoRight) {
            const scrollAmount = carouselRef.current.clientWidth;
            carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            setCurrentGroupIndex((prev) => prev + 1);
        }
    };

    const goPrevious = () => {
        if (carouselRef.current && canGoLeft) {
            const scrollAmount = carouselRef.current.clientWidth;
            carouselRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            setCurrentGroupIndex((prev) => prev - 1);
        }
    };

    return (
        <div className={styles.sectionContainer}>
            <div className={styles.innerContainer}>
                {/* Header Reference Architectures */}
                <Title size="H3" className={styles.titleStyle}>
                    Explore the latest Reference Architectures
                </Title>
                <FlexBox justifyContent="End" alignItems="Center" className={styles.headerRow}>
                    <FlexBox alignItems="Center" style={{ gap: '10px' }}>
                        <Button
                            design={canGoLeft ? 'Emphasized' : 'Transparent'}
                            icon="navigation-left-arrow"
                            onClick={goPrevious}
                            disabled={!canGoLeft}
                        />
                        <Button
                            design={canGoRight ? 'Emphasized' : 'Transparent'}
                            icon="navigation-right-arrow"
                            onClick={goNext}
                            disabled={!canGoRight}
                        />
                        <div></div>
                        <Link to="docs/exploreallrefarch">Browse All</Link>
                    </FlexBox>
                </FlexBox>

                {/* Carousel */}
                <div ref={carouselRef} className={styles.carouselContainer}>
                    {groupedItems.map((group, index) => (
                        <div key={index} className={styles.cardGroup}>
                            {group.map((item, itemIndex) => (
                                <div key={item.href || itemIndex} className={styles.cardContainer}>
                                    <DocCard item={item} />
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
