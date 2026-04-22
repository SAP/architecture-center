import { useState, useEffect, useCallback, useRef } from 'react';
import { throttle } from '../utils/requestThrottle';

interface UseScrollActivatedTabsOptions {
    totalTabs: number;
    enabled?: boolean;
    sectionRef?: React.RefObject<HTMLElement>;
}

interface UseScrollActivatedTabsReturn {
    scrollActiveIndex: number;
    isScrollControlled: boolean;
    disableScrollControl: () => void;
    containerRef: React.RefObject<HTMLDivElement>;
}

/**
 * Hook to automatically activate tabs based on scroll within a specific section.
 * Tabs advance as user scrolls through the section containing the tabs.
 *
 * @param options Configuration options
 * @param options.totalTabs Total number of tabs to cycle through
 * @param options.enabled Whether scroll activation is enabled (default: true)
 * @param options.sectionRef Optional ref to the section container
 * @returns Object with current scroll-activated tab index and control functions
 */
export function useScrollActivatedTabs(
    options: UseScrollActivatedTabsOptions
): UseScrollActivatedTabsReturn {
    const { totalTabs, enabled = true, sectionRef } = options;

    const [scrollActiveIndex, setScrollActiveIndex] = useState(0);
    const [manualOverride, setManualOverride] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const lastScrollY = useRef<number>(0);

    // Callback to disable scroll control when user manually clicks a tab
    const disableScrollControl = useCallback(() => {
        setManualOverride(true);
    }, []);

    useEffect(() => {
        // Don't attach listeners if disabled or manually overridden
        if (!enabled || manualOverride || totalTabs <= 1) {
            return;
        }

        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
            return;
        }

        const targetElement = sectionRef?.current || containerRef.current;
        if (!targetElement) {
            return;
        }

        // Track scroll progress through the section
        const handleScroll = throttle(() => {
            const currentScrollY = window.scrollY;
            lastScrollY.current = currentScrollY;

            const rect = targetElement.getBoundingClientRect();
            const windowHeight = window.innerHeight;

            // Check if section is in viewport
            const isInViewport = rect.top < windowHeight && rect.bottom > 0;

            if (!isInViewport) {
                return;
            }

            // Calculate how much of the section has scrolled into view
            // When section just entered: progress = 0
            // When section is centered: progress = 0.5
            // When section is about to leave: progress = 1
            const sectionHeight = rect.height;
            const visibleTop = Math.max(0, windowHeight - rect.top);
            const scrollProgress = Math.min(1, visibleTop / sectionHeight);

            // Map progress to tab index
            // Divide the section's scroll range evenly among tabs
            const newIndex = Math.min(
                Math.floor(scrollProgress * totalTabs),
                totalTabs - 1
            );

            if (newIndex !== scrollActiveIndex) {
                setScrollActiveIndex(newIndex);
            }
        }, 100, { leading: true, trailing: true });

        window.addEventListener('scroll', handleScroll, { passive: true });

        // Initial calculation
        handleScroll();

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [enabled, manualOverride, totalTabs, sectionRef, scrollActiveIndex]);

    return {
        scrollActiveIndex,
        isScrollControlled: !manualOverride && enabled,
        disableScrollControl,
        containerRef,
    };
}
