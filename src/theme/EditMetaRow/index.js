/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import EditThisPage from '@theme/EditThisPage';
import LastUpdated from '@theme/LastUpdated';
import { useDoc } from '@docusaurus/plugin-content-docs/client';
import styles from './styles.module.css';
import ShareSite from '../../components/ShareSite';
import { isWithinRecentWindow } from '../DocSidebar/filterUtils';

// Mirrors the sidebar's "recently updated" filter: a reference-architecture page whose
// last_update.date falls within the recent window (see isWithinRecentWindow — on/after the
// cutoff and not in the future). Scoped to /ref-arch/ pages so it matches that filter.
// Deferred to the client because the window depends on new Date() (now), which would
// otherwise cause a hydration mismatch.
function useIsRecentlyUpdated() {
    const { frontMatter, metadata } = useDoc();
    const rawDate = frontMatter.last_update?.date;
    const permalink = metadata.permalink;
    const [isRecent, setIsRecent] = useState(false);
    useEffect(() => {
        if (!permalink?.includes('/ref-arch/')) {
            setIsRecent(false);
            return;
        }
        setIsRecent(isWithinRecentWindow(rawDate ?? null));
    }, [rawDate, permalink]);
    return isRecent;
}

export default function EditMetaRow({ className, editUrl, lastUpdatedAt, lastUpdatedBy }) {
    const isRecent = useIsRecentlyUpdated();
    return (
        <div className={clsx('row', className)} style={{ paddingTop: '0.2rem' }}>
            <div className={clsx('col', styles.lastUpdated)}>
                {(lastUpdatedAt || lastUpdatedBy) && (
                    <LastUpdated lastUpdatedAt={lastUpdatedAt} lastUpdatedBy={lastUpdatedBy} />
                )}
                {isRecent && (
                    <span className={styles.recentBadge}>
                        ✨ Recently added or updated
                    </span>
                )}
            </div>

            <div
                className={clsx('col', styles.editLink)}
                style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start' }}
            >
                {editUrl && <EditThisPage editUrl={editUrl} />}
                <div style={{ marginLeft: 10 }}>
                    <ShareSite />
                </div>
            </div>
        </div>
    );
}
