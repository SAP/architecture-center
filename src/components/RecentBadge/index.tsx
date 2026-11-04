import React from 'react';
import { useDoc } from '@docusaurus/plugin-content-docs/client';
import { isDateRecent } from '@site/src/utils/dateUtils';
import styles from './styles.module.css';

// Badge component that displays when the current document was recently updated
export default function RecentBadge(): React.ReactElement | null {
  const { frontMatter } = useDoc();
  const isRecent = isDateRecent(frontMatter.last_update?.date);

  if (!isRecent) return null;

  return (
    <div className={styles.recentBadge}>
      ✨ Recently added or updated
    </div>
  );
}
