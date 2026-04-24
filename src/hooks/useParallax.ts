import { useEffect, useRef, useState, RefObject } from 'react';

interface ParallaxOptions {
    speed?: number; // How much the element moves (0.1 = subtle, 0.5 = strong)
    direction?: 'up' | 'down';
    threshold?: number; // When to start the effect (0-1)
    initialOffset?: number; // Initial Y offset in pixels
}

interface ParallaxState {
    translateY: number;
    opacity: number;
    isVisible: boolean;
}

export function useParallax<T extends HTMLElement>(
    options: ParallaxOptions = {}
): [RefObject<T | null>, ParallaxState] {
    const { speed = 0.3, direction = 'up', threshold = 0.1, initialOffset = 80 } = options;
    const ref = useRef<T>(null);
    const [state, setState] = useState<ParallaxState>({
        translateY: direction === 'up' ? initialOffset : -initialOffset,
        opacity: 0,
        isVisible: false,
    });

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const handleScroll = () => {
            const rect = element.getBoundingClientRect();
            const windowHeight = window.innerHeight;

            // Calculate how far the element is in the viewport
            const elementCenter = rect.top + rect.height / 2;
            const viewportCenter = windowHeight / 2;
            const distanceFromCenter = elementCenter - viewportCenter;

            // Check if element is visible
            const isInView = rect.top < windowHeight * (1 - threshold) && rect.bottom > 0;

            if (isInView) {
                // Calculate parallax offset based on scroll position
                const parallaxOffset = distanceFromCenter * speed * (direction === 'up' ? 0.1 : -0.1);

                // Calculate opacity based on how much of element is visible
                const visibleRatio = Math.min(
                    1,
                    Math.max(0, (windowHeight - rect.top) / (windowHeight * 0.4))
                );

                setState({
                    translateY: parallaxOffset,
                    opacity: Math.min(1, visibleRatio * 1.5),
                    isVisible: true,
                });
            } else if (rect.top >= windowHeight) {
                // Element is below viewport - reset to initial state
                setState({
                    translateY: direction === 'up' ? initialOffset : -initialOffset,
                    opacity: 0,
                    isVisible: false,
                });
            }
        };

        // Initial check
        handleScroll();

        // Add scroll listener with passive for better performance
        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleScroll);
        };
    }, [speed, direction, threshold, initialOffset]);

    return [ref, state];
}
