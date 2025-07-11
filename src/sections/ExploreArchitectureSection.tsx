import React, { useRef } from 'react';
// @ts-ignore
import DocCard from '@theme/DocCard';
// @ts-ignore
import exploreSidebar from '../data/exploreArch.json';

import { Title } from '@ui5/webcomponents-react';
import ReactCarousel from '@site/src/components/ReactCarousel';
import carouselStyles from '@site/src/components/ReactCarousel/ReactCarousel.module.css';

export default function ExploreAllArchitecturesSection() {
    const carouselRef = useRef<any>(null);
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
        <ReactCarousel
            ref={carouselRef}
            items={items}
            renderItem={(item, idx) => (
                <div className={carouselStyles.cardContainer}>
                    <DocCard item={item} />
                </div>
            )}
            title={
                <Title level="H3" size="H3" className={carouselStyles.titleStyle}>
                    Explore the latest Reference Architectures
                </Title>
            }
            showHeader={true}
            showLink={{ name: 'Browse All', url: 'docs/exploreallrefarch' }}
            arrowOrientation="H"
            className={carouselStyles.carouselContainer}
            {...settings}
        />
    );
}
