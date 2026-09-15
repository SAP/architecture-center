import React from 'react';
import styles from './index.module.css';

interface CircularTextProps {
  text: string;
  radius?: number;
  fontSize?: number;
  className?: string;
}

export default function CircularText({
  text,
  radius = 80,
  fontSize = 16,
  className = ''
}: CircularTextProps) {
  const circumference = 2 * Math.PI * radius;
  const viewBoxSize = radius * 2 + fontSize * 2;
  const center = viewBoxSize / 2;

  return (
    <div className={`${styles.circularText} ${className}`}>
      <svg
        viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
        width={viewBoxSize}
        height={viewBoxSize}
        className={styles.svg}
      >
        <defs>
          <path
            id="circlePath"
            d={`
              M ${center}, ${center}
              m -${radius}, 0
              a ${radius},${radius} 0 1,1 ${radius * 2},0
              a ${radius},${radius} 0 1,1 -${radius * 2},0
            `}
            fill="none"
          />
        </defs>
        <text className={styles.text} fontSize={fontSize}>
          <textPath href="#circlePath" startOffset="0%">
            {text}
          </textPath>
        </text>
      </svg>
    </div>
  );
}
