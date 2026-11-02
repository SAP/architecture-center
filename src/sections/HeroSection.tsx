import React, { JSX, useEffect, useRef, useState } from 'react';
import Link from '@docusaurus/Link';
import '@ui5/webcomponents-icons/dist/AllIcons';
import styles from './HeroSection.module.css';

interface TileSpec {
    width: number;
    height: number;
    count: number;
    oMin: number;
    oMax: number;
}

// Three discrete dot sizes (radius in tile px) and their share of the total.
const DOT_SIZES = [
    { r: 0.8, share: 0.5 }, // tiny  — 50%
    { r: 1.5, share: 0.35 }, // medium — 35%
    { r: 2.6, share: 0.15 }, // large  — 15%
];

// Endpoints of the site gradient --gradient-primary (#465BE5 → #CD00BE).
const GRADIENT_START = [70, 91, 229];
const GRADIENT_END = [205, 0, 190];

// Sample a colour from the site gradient at position t (0 = start, 1 = end).
function gradientColor(t: number): string {
    const mix = GRADIENT_START.map((s, i) => Math.round(s + t * (GRADIENT_END[i] - s)));
    return `rgb(${mix[0]}, ${mix[1]}, ${mix[2]})`;
}

// Build one dot tile as a CSS url(...) data URI. The tile is sized to the
// viewport width so it never repeats horizontally within view; dots near an
// edge are duplicated on the opposite edge (toroidal wrap) so the vertical
// tiling needed for parallax has no visible seam. Each dot gets one of three
// sizes per DOT_SIZES, a random position, and a random opacity.
function buildDotTile(rng: () => number, spec: TileSpec): string {
    const { width, height, count, oMin, oMax } = spec;
    const radii: number[] = [];
    for (const s of DOT_SIZES) {
        for (let i = 0; i < Math.round(count * s.share); i++) radii.push(s.r);
    }
    const margin = 3; // >= largest radius, for seamless edge wrapping
    let circles = '';
    const add = (x: number, y: number, r: number, o: string) => {
        circles += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="#fff" opacity="${o}"/>`;
    };
    for (const r of radii) {
        const x = rng() * width;
        const y = rng() * height;
        const o = (oMin + rng() * (oMax - oMin)).toFixed(3);
        const xs = [x];
        if (x < margin) xs.push(x + width);
        if (x > width - margin) xs.push(x - width);
        const ys = [y];
        if (y < margin) ys.push(y + height);
        if (y > height - margin) ys.push(y - height);
        for (const xx of xs) for (const yy of ys) add(xx, yy, r, o);
    }
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${circles}</svg>`;
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

export default function HeroSection(): JSX.Element {
    const backgroundRef = useRef<HTMLDivElement>(null);
    const [displayedText, setDisplayedText] = useState('');
    const [typingDone, setTypingDone] = useState(false);
    const fullText = 'SAP Architecture Center';

    // Generate a fresh random dot layout on every load, sized to the viewport
    // so the field never repeats horizontally. Done on the client (not during
    // render) so each reload differs without an SSR hydration mismatch, and
    // regenerated on resize to keep covering the viewport.
    useEffect(() => {
        const el = backgroundRef.current;
        if (!el) return;
        const generate = () => {
            const w = window.innerWidth;
            const h = window.innerHeight;
            // Scale counts with area to keep the previous dot density
            // (17.5 per 260px tile, 14 per 420px tile).
            const countA = Math.round((17.5 * (w * h)) / (260 * 260));
            const countB = Math.round((14 * (w * h)) / (420 * 420));
            const dotsA = buildDotTile(Math.random, { width: w, height: h, count: countA, oMin: 0.05, oMax: 0.22 });
            const dotsB = buildDotTile(Math.random, { width: w, height: h, count: countB, oMin: 0.1, oMax: 0.4 });
            el.style.setProperty('--dots-a', dotsA);
            el.style.setProperty('--dots-b', dotsB);
            el.style.setProperty('--dots-a-size', `${w}px ${h}px`);
            el.style.setProperty('--dots-b-size', `${w}px ${h}px`);
        };
        generate();
        let timer: ReturnType<typeof setTimeout>;
        const onResize = () => {
            clearTimeout(timer);
            timer = setTimeout(generate, 200);
        };
        window.addEventListener('resize', onResize);
        return () => {
            window.removeEventListener('resize', onResize);
            clearTimeout(timer);
        };
    }, []);

    // Randomise each blob's start position and gradient colour on every load
    // (client-only, so it varies per reload; the CSS top/left and --blob-color
    // act as the SSR fallback), then fade them in so the reposition isn't seen.
    useEffect(() => {
        const el = backgroundRef.current;
        if (!el) return;
        const blobs = Array.from(el.querySelectorAll<HTMLElement>('[data-blob]'));
        // Gradient positions (0..1) for the blobs. Force the extremes to span at
        // least 50% of the gradient: one in the low quarter, one in the high
        // quarter (span >= 0.5). The third sits at their midpoint — since the
        // gradient is linear, that yields the average of the two extreme
        // colours. Shuffle so the roles aren't tied to specific blobs.
        const ts = blobs.map(() => Math.random());
        if (ts.length >= 2) {
            const lowT = Math.random() * 0.25; // 0 .. 0.25
            const highT = 0.75 + Math.random() * 0.25; // 0.75 .. 1
            ts[0] = lowT;
            ts[1] = highT;
            if (ts.length >= 3) ts[2] = (lowT + highT) / 2; // middle = average colour
            for (let i = ts.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [ts[i], ts[j]] = [ts[j], ts[i]];
            }
        }
        blobs.forEach((blob, i) => {
            // Place each blob by its CENTRE within a safe range so it stays on
            // screen. Blob is 38.4vmax, so half-size is 19.2vmax; centre kept in
            // 28..72vw/vh which, with the bounded drift, never leaves the view.
            const cx = (28 + Math.random() * 44).toFixed(1);
            const cy = (28 + Math.random() * 44).toFixed(1);
            blob.style.left = `calc(${cx}vw - 19.2vmax)`;
            blob.style.top = `calc(${cy}vh - 19.2vmax)`;
            blob.style.setProperty('--blob-color', gradientColor(ts[i]));
            // Random opacity within +/-30% of the 0.32 base (~0.22 .. 0.42).
            blob.style.setProperty('--blob-opacity', (0.32 * (0.7 + Math.random() * 0.6)).toFixed(3));
        });
        const id = requestAnimationFrame(() => {
            for (const blob of blobs) blob.style.opacity = '1';
        });
        return () => cancelAnimationFrame(id);
    }, []);

    // Typewriter effect
    useEffect(() => {
        let index = 0;
        const interval = setInterval(() => {
            index++;
            setDisplayedText(fullText.slice(0, index));
            if (index >= fullText.length) {
                clearInterval(interval);
                setTypingDone(true);
            }
        }, 70);
        return () => clearInterval(interval);
    }, []);

    // Dot parallax: feed the scroll offset into a CSS variable on the fixed
    // background so the two dot tiles shift at different speeds.
    useEffect(() => {
        const el = backgroundRef.current;
        if (!el) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        let frame = 0;
        const onScroll = () => {
            if (frame) return;
            frame = requestAnimationFrame(() => {
                el.style.setProperty('--scroll-y', `${window.scrollY}`);
                frame = 0;
            });
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
        return () => {
            window.removeEventListener('scroll', onScroll);
            if (frame) cancelAnimationFrame(frame);
        };
    }, []);

    // Blobs "run away" from the pointer: push each blob's core away from the
    // cursor with a force that falls off with distance. Measured from each
    // blob's current (drifting) centre, written as --push-x/--push-y vars.
    useEffect(() => {
        const el = backgroundRef.current;
        if (!el) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const blobs = Array.from(el.querySelectorAll<HTMLElement>('[data-blob]'));
        if (!blobs.length) return;
        const influence = 420; // px radius within which the cursor repels a blob
        const maxPush = 160; // px, strongest push when the cursor is at the centre
        let frame = 0;
        let mx = -99999;
        let my = -99999;
        const apply = () => {
            frame = 0;
            for (const blob of blobs) {
                const rect = blob.getBoundingClientRect();
                const dx = rect.left + rect.width / 2 - mx;
                const dy = rect.top + rect.height / 2 - my;
                const dist = Math.hypot(dx, dy) || 1;
                let px = 0;
                let py = 0;
                if (dist < influence) {
                    const force = (1 - dist / influence) * maxPush;
                    px = (dx / dist) * force;
                    py = (dy / dist) * force;
                }
                blob.style.setProperty('--push-x', `${px.toFixed(1)}px`);
                blob.style.setProperty('--push-y', `${py.toFixed(1)}px`);
            }
        };
        const schedule = () => {
            if (!frame) frame = requestAnimationFrame(apply);
        };
        const onMove = (event: MouseEvent) => {
            mx = event.clientX;
            my = event.clientY;
            schedule();
        };
        const onLeave = () => {
            mx = -99999;
            my = -99999;
            schedule();
        };
        window.addEventListener('mousemove', onMove, { passive: true });
        document.addEventListener('mouseleave', onLeave);
        return () => {
            window.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseleave', onLeave);
            if (frame) cancelAnimationFrame(frame);
        };
    }, []);

    return (
        <div className={styles.heroWrapper}>
            <div className={styles.background} ref={backgroundRef}>
                <div className={styles.blob} data-blob><div className={styles.blobCore} /></div>
                <div className={styles.blob} data-blob><div className={styles.blobCore} /></div>
                <div className={styles.blob} data-blob><div className={styles.blobCore} /></div>
            </div>
            <div className={styles.heroContainer}>
                <div className={styles.heroContent}>
                    <h1 className={styles.heroTitle}>
                        {displayedText}
                        {!typingDone && <span className={styles.cursor}>|</span>}
                    </h1>
                    <p className={styles.heroSubtitle}>
                        Empowering architects and developers to design, integrate, and optimize SAP Solutions through best practices, reference architectures, and community-driven guidance.
                    </p>
                    <div className={styles.heroActions}>
                        <Link to="/docs/ref-arch" className={styles.primaryButton}>
                            Browse Architectures
                        </Link>
                        <Link to="/docs/community/intro" className={styles.secondaryButton}>
                            Community of Practice
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
