import React, { useRef } from 'react';
import Slider from 'react-slick';
// @ts-ignore
import DocCard from '@theme/DocCard';
// @ts-ignore
import exploreSidebar from '../data/exploreArch.json';
import { Text, Title, Button, FlexBox } from '@ui5/webcomponents-react';
import '@ui5/webcomponents-icons/dist/navigation-left-arrow';
import '@ui5/webcomponents-icons/dist/navigation-right-arrow';
import Link from '@docusaurus/Link';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import styles from './index.module.css';

export default function ExploreAllArchitecturesSection() {
    const sliderRef = useRef<Slider>(null);
    const items = exploreSidebar[0]?.items || [];

    // react-slick settings for responsive carousel
    const settings = {
        dots: true,
        arrows: false, // We'll use our own UI5 buttons for navigation
        infinite: items.length > 3,
        speed: 500,
        slidesToShow: 3,
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

    return (
        <section className={styles.sectionContainer}>
            <div className={styles.innerContainer}>
                <Title level="H3" className={styles.titleStyle}>
                    Explore the latest Reference Architectures
                </Title>
                <FlexBox justifyContent="End" alignItems="Center" className={styles.headerRow}>
                    <FlexBox alignItems="Center" className={styles.headerControls}>
                        <Button
                            design="Transparent"
                            icon="navigation-left-arrow"
                            onClick={() => sliderRef.current?.slickPrev()}
                        />
                        <Button
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
