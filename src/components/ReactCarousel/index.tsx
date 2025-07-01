import React, { forwardRef } from 'react';
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
            ...settings
        },
        ref
    ) => {
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
                                    onClick={() => (ref as any)?.current?.slickPrev()}
                                />
                                <Button
                                    accessibleName="Next slide"
                                    design="Transparent"
                                    icon={nextIcon}
                                    onClick={() => (ref as any)?.current?.slickNext()}
                                />
                                {showLink && showLink.url && showLink.name && (
                                    <Link to={showLink.url}>{showLink.name}</Link>
                                )}
                            </div>
                        </div>
                    )}
                    {title && <div className={styles.titleStyle}>{title}</div>}
                    <div className={className || styles.carouselContainer}>
                        <Slider ref={ref} {...settings}>
                            {items.map((item, idx) => (
                                <div key={idx} className={styles.cardContainer}>
                                    {renderItem(item, idx)}
                                </div>
                            ))}
                        </Slider>
                    </div>
                </div>
            </section>
        );
    }
);

export default ReactCarousel;
