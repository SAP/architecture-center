import React, { forwardRef, useRef, useImperativeHandle, useState } from 'react';
import Slider, { Settings } from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import styles from './ReactCarousel.module.css';
import Link from '@docusaurus/Link';

import { Button } from '@ui5/webcomponents-react';
import '@ui5/webcomponents-icons/dist/navigation-left-arrow';
import '@ui5/webcomponents-icons/dist/navigation-right-arrow';
import '@ui5/webcomponents-icons/dist/navigation-up-arrow';
import '@ui5/webcomponents-icons/dist/navigation-down-arrow';

type ArrowOrientation = 'H' | 'V';

interface ReactCarouselProps extends Settings {
    items: any[];
    renderItem: (item: any, idx: number) => React.ReactNode;
    className?: string;
    title?: React.ReactNode;
    showHeader?: boolean;
    showLink?: { name: string; url: string } | null;
    arrowOrientation?: ArrowOrientation;
}

const ReactCarousel = forwardRef<Slider, ReactCarouselProps>(
    (
        {
            items,
            renderItem,
            className,
            title,
            showHeader = true,
            showLink = null,
            arrowOrientation = 'H',
            slidesToShow = 3,
            ...settings
        },
        ref
    ) => {
        const sliderRef = useRef<Slider>(null);
        useImperativeHandle(ref, () => sliderRef.current as Slider);

        const [currentSlide, setCurrentSlide] = useState(0);
        const totalSlides = items.length;
        const [, forceUpdate] = useState(0);
        const handleAfterChange = (index: number) => {
            setCurrentSlide(index);
            forceUpdate(t => t + 1);
        };
        const atStart = currentSlide === 0;
        const atEnd = currentSlide >= totalSlides - (settings.slidesToScroll || 1);

        // Choose icons based on orientation
        const prevIcon = arrowOrientation === 'V' ? 'navigation-up-arrow' : 'navigation-left-arrow';
        const nextIcon = arrowOrientation === 'V' ? 'navigation-down-arrow' : 'navigation-right-arrow';

        return (
            <section className={styles.sectionContainer}>
                <div className={styles.innerContainer}>
                    {showHeader && (
                        <div className={styles.headerRow}>
                            <div className={styles.headerControls}>
                                <Button
                                    accessibleName="Previous slide"
                                    design="Transparent"
                                    icon={prevIcon}
                                    disabled={atStart}
                                    onClick={() => {
                                        if (sliderRef.current && typeof sliderRef.current.slickPrev === 'function') {
                                            sliderRef.current.slickPrev();
                                        } else {
                                            console.warn(
                                                'Previous slide is not a function or slider reference is null'
                                            );
                                        }
                                    }}
                                />
                                <Button
                                    accessibleName="Next slide"
                                    design="Transparent"
                                    icon={nextIcon}
                                    disabled={atEnd}
                                    onClick={() => {
                                        if (sliderRef.current && typeof sliderRef.current.slickNext === 'function') {
                                            sliderRef.current.slickNext();
                                        } else {
                                            console.warn('Next slide is not a function or slider reference is null');
                                        }
                                    }}
                                />
                                {showLink && showLink.url && showLink.name && (
                                    <Link to={showLink.url}>{showLink.name}</Link>
                                )}
                            </div>
                        </div>
                    )}
                    {title && <div className={styles.titleStyle}>{title}</div>}
                    <div className={className || styles.carouselContainer}>
                        <Slider
                            ref={sliderRef}
                            {...settings}
                            slidesToShow={slidesToShow}
                            afterChange={handleAfterChange}
                        >
                            {items.map((item, idx) => (
                                <React.Fragment key={idx}>{renderItem(item, idx)}</React.Fragment>
                            ))}
                        </Slider>
                    </div>
                </div>
            </section>
        );
    }
);

export default ReactCarousel;
