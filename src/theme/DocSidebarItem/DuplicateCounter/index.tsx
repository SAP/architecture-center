import React from 'react';
import styles from './styles.module.css';

interface DuplicateCounterProps {
  count: number;
}

export default function DuplicateCounter({ count }: DuplicateCounterProps): React.ReactNode {
  if (count <= 0) {
    return null;
  }

  return (
    <span
      className={`sidebar-duplicate-counter ${styles.duplicateCounter}`}
      title={`Also appears in ${count} other technology ${count === 1 ? 'domain' : 'domains'}`}
    >
      [+{count}]
    </span>
  );
}
