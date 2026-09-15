import React, { useEffect, useRef } from 'react';
import styles from './index.module.css';

interface LetterGlitchLoaderProps {
  text?: string;
  subtitle?: string;
}

const GLITCH_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';

export default function LetterGlitchLoader({
  text = 'INITIALIZING COMMAND CENTER',
  subtitle = 'Preparing your workspace...'
}: LetterGlitchLoaderProps) {
  const textRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!textRef.current) return;

    const originalText = text;
    const letters = textRef.current.querySelectorAll('.letter');

    // Initial scramble
    letters.forEach((letter) => {
      const el = letter as HTMLElement;
      el.textContent = GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
    });

    // Reveal letters one by one with glitch effect
    let currentIndex = 0;

    const revealNext = () => {
      if (currentIndex >= letters.length) {
        // After all revealed, keep occasional glitches
        intervalRef.current = window.setInterval(() => {
          const randomIdx = Math.floor(Math.random() * letters.length);
          const el = letters[randomIdx] as HTMLElement;
          const originalChar = originalText[randomIdx];

          // Glitch for a moment
          el.textContent = GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
          el.classList.add(styles.glitching);

          setTimeout(() => {
            el.textContent = originalChar;
            el.classList.remove(styles.glitching);
          }, 100);
        }, 150);
        return;
      }

      const el = letters[currentIndex] as HTMLElement;
      const targetChar = originalText[currentIndex];

      // Quick scramble before revealing
      let scrambleCount = 0;
      const scrambleInterval = setInterval(() => {
        el.textContent = GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
        scrambleCount++;

        if (scrambleCount >= 3) {
          clearInterval(scrambleInterval);
          el.textContent = targetChar;
          el.classList.add(styles.revealed);
          currentIndex++;
          setTimeout(revealNext, 30);
        }
      }, 40);
    };

    setTimeout(revealNext, 500);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [text]);

  return (
    <div className={styles.container}>
      <div className={styles.glitchBackground}>
        {/* Animated grid lines */}
        <div className={styles.gridOverlay} />
        <div className={styles.scanline} />
      </div>

      <div className={styles.content}>
        <div className={styles.textContainer} ref={textRef}>
          {text.split('').map((char, i) => (
            <span
              key={i}
              className={`letter ${styles.letter} ${char === ' ' ? styles.space : ''}`}
            >
              {char}
            </span>
          ))}
        </div>

        <div className={styles.subtitle}>{subtitle}</div>

        <div className={styles.progressBar}>
          <div className={styles.progressFill} />
        </div>
      </div>
    </div>
  );
}
