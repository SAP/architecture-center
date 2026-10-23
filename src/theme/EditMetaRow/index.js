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
import { getRecentCutoffDate } from '../DocSidebar/filterUtils';

function useIsRecentlyUpdated() {
    const { frontMatter, metadata } = useDoc();
    const rawDate = frontMatter.last_update?.date;
    const permalink = metadata.permalink;
    const [isRecent, setIsRecent] = useState(false);

    useEffect(() => {
        // Match any ref-arch page (base or child)
        const isRefArchPage = permalink?.includes('ref-arch');

        if (!rawDate || !isRefArchPage) {
            setIsRecent(false);
            return;
        }
        const updated = new Date(rawDate);
        if (Number.isNaN(updated.getTime())) {
            setIsRecent(false);
            return;
        }
        setIsRecent(updated >= getRecentCutoffDate());
    }, [rawDate, permalink]);

    return isRecent;
}

export default function EditMetaRow({ className, editUrl, lastUpdatedAt, lastUpdatedBy }) {
    const isRecent = useIsRecentlyUpdated();
    return (
        <>
            <div className={clsx('row', className)} style={{ paddingTop: '0.2rem' }}>
                <div className={clsx('col', styles.lastUpdated)}>
                    {(lastUpdatedAt || lastUpdatedBy) && (
                        <LastUpdated lastUpdatedAt={lastUpdatedAt} lastUpdatedBy={lastUpdatedBy} />
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
            {isRecent && (
                <div className={styles.recentBadge}>
                    ✨ Recently added or updated
                </div>
            )}
        </>
    );
}
