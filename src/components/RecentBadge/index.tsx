import React from 'react';
import { useIsRecentlyUpdated } from './useIsRecentlyUpdated';
import styles from './styles.module.css';

// Badge component that displays when the current document was recently updated
export default function RecentBadge(): React.ReactElement | null {
    const isRecent = useIsRecentlyUpdated();

    if (!isRecent) return null;

    return (
        <div className={styles.recentBadge}>
            ✨ Recently added or updated
        </div>
    );
}
