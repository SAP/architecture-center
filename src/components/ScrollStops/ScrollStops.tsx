import React, { useState, useEffect, useRef, JSX, ReactNode } from 'react';
import styles from './ScrollStops.module.css';

interface ScrollStopsProps {
    stops: number; // Number of scroll stops
    onStopChange?: (stopIndex: number) => void;
    children: (currentStop: number) => ReactNode;
}

/**
 * Component that creates multiple scroll "stops" within a single section.
 * Each stop represents a full viewport and requires a scroll action to advance.
 */
export default function ScrollStops({ stops, onStopChange, children }: ScrollStopsProps): JSX.Element {
    const [currentStop, setCurrentStop] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const lastScrollTime = useRef(0);
    const sectionEnteredTime = useRef(0);
    const hasInitialized = useRef(false);

    console.log('ScrollStops render - currentStop:', currentStop);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        console.log('ScrollStops initialized with', stops, 'stops, currentStop:', currentStop);

        const handleWheel = (e: WheelEvent) => {
            const now = Date.now();

            // Wait 1 second after section enters viewport before responding to scroll
            if (now - sectionEnteredTime.current < 1000) {
                console.log('Ignoring wheel event - section just entered viewport');
                return;
            }

            // Reduce throttle for more responsive feel (500ms instead of 800ms)
            if (now - lastScrollTime.current < 1000) {
                console.log('Throttling wheel event');
                e.preventDefault();
                return;
            }

            const rect = container.getBoundingClientRect();
            // More lenient viewport check for better feel
            const isInView = rect.top <= 100 && rect.bottom >= window.innerHeight - 100;

            if (!isInView) {
                console.log('Section not in view, allowing natural scroll');
                return;
            }

            console.log('Wheel event in section:', { deltaY: e.deltaY, currentStop });

            // Scrolling down
            if (e.deltaY > 0) {
                if (currentStop < stops - 1) {
                    // Prevent scroll and advance to next stop
                    e.preventDefault();
                    e.stopPropagation();
                    lastScrollTime.current = now;

                    const nextStop = currentStop + 1;
                    console.log('Advancing from stop', currentStop, 'to stop', nextStop);
                    setCurrentStop(nextStop);
                    onStopChange?.(nextStop);
                } else {
                    console.log('At last stop, allowing scroll to next section');
                }
            }
            // Scrolling up
            else if (e.deltaY < 0) {
                if (currentStop > 0) {
                    // Prevent scroll and go back to previous stop
                    e.preventDefault();
                    e.stopPropagation();
                    lastScrollTime.current = now;

                    const prevStop = currentStop - 1;
                    console.log('Going back from stop', currentStop, 'to stop', prevStop);
                    setCurrentStop(prevStop);
                    onStopChange?.(prevStop);
                } else {
                    console.log('At first stop, allowing scroll to previous section');
                }
            }
        };

        // Use capture phase to intercept before other handlers
        window.addEventListener('wheel', handleWheel, { passive: false, capture: true });

        return () => {
            window.removeEventListener('wheel', handleWheel, { capture: true } as any);
        };
    }, [currentStop, stops, onStopChange]);

    // Reset to first stop when section enters viewport
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !hasInitialized.current) {
                        const now = Date.now();
                        console.log('Section entered viewport - resetting to stop 0');
                        setCurrentStop(0);
                        sectionEnteredTime.current = now; // Record when section entered
                        hasInitialized.current = true;
                    }
                });
            },
            {
                threshold: 0.5,
            }
        );

        observer.observe(container);

        return () => {
            observer.disconnect();
        };
    }, []);

    return (
        <div ref={containerRef} className={styles.scrollStopsContainer}>
            {children(currentStop)}
        </div>
    );
}
