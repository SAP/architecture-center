/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import clsx from 'clsx';
import EditThisPage from '@theme/EditThisPage';
import LastUpdated from '@theme/LastUpdated';
import styles from './styles.module.css';
import ShareSite from '../../components/ShareSite';

export default function EditMetaRow({ className, editUrl, lastUpdatedAt, lastUpdatedBy }) {
    return (
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
    );
}
