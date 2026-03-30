import React, { JSX, ReactNode } from 'react';
import { useParallax } from '../../hooks/useParallax';
import styles from './ParallaxSection.module.css';

interface ParallaxSectionProps {
    children: ReactNode;
    speed?: number;
    direction?: 'up' | 'down';
    initialOffset?: number;
    className?: string;
}

export default function ParallaxSection({
    children,
    speed = 0.3,
    direction = 'up',
    initialOffset = 80,
    className = '',
}: ParallaxSectionProps): JSX.Element {
    const [ref, { translateY, opacity, isVisible }] = useParallax<HTMLDivElement>({
        speed,
        direction,
        initialOffset,
    });

    return (
        <div
            ref={ref}
            className={`${styles.parallaxSection} ${isVisible ? styles.visible : ''} ${className}`}
            style={{
                transform: `translateY(${translateY}px)`,
                opacity,
            }}
        >
            {children}
        </div>
    );
}
