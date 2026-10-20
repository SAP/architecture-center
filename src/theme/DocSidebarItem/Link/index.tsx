/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, {type ReactNode, useState, useEffect} from 'react';
import clsx from 'clsx';
import {ThemeClassNames} from '@docusaurus/theme-common';
import {isActiveSidebarItem} from '@docusaurus/plugin-content-docs/client';
import Link from '@docusaurus/Link';
import isInternalUrl from '@docusaurus/isInternalUrl';
import useGlobalData from '@docusaurus/useGlobalData';
import IconExternalLink from '@theme/Icon/ExternalLink';
import type {Props} from '@theme/DocSidebarItem/Link';
import {
  type DocIdToTagsMap,
  findDocIdFromPath,
  isDocRecentlyUpdated,
} from '@site/src/theme/DocSidebar/filterUtils';

import styles from './styles.module.css';

function LinkLabel({label}: {label: string}) {
  return (
    <span className={styles.linkLabel}>
      {label}
    </span>
  );
}

export default function DocSidebarItemLink({
  item,
  onItemClick,
  activePath,
  level,
  ...props
}: Props): ReactNode {
  const {href, label, className, autoAddBaseUrl} = item;
  const isActive = isActiveSidebarItem(item, activePath);
  const isInternalLink = isInternalUrl(href);

  // "Recently added or updated" marker for reference-architecture doc links, mirroring
  // the page-level indicator and the sidebar recency filter. Deferred to the client
  // because the cutoff depends on new Date() (now), which would otherwise cause an
  // SSR/hydration mismatch for docs near the 3-month boundary.
  const tagsDocId = useGlobalData()['docusaurus-tags-plugin']?.default
    ?.docIdToTags as DocIdToTagsMap | undefined;
  const docId = (item as {docId?: string}).docId
    ?? (tagsDocId ? findDocIdFromPath(href, tagsDocId) : null);
  const [isRecent, setIsRecent] = useState(false);
  useEffect(() => {
    setIsRecent(
      isInternalLink
      && !!href?.includes('/ref-arch/')
      && !!tagsDocId
      && !!docId
      && isDocRecentlyUpdated(docId, tagsDocId),
    );
  }, [isInternalLink, href, tagsDocId, docId]);

  return (
    <li
      className={clsx(
        ThemeClassNames.docs.docSidebarItemLink,
        ThemeClassNames.docs.docSidebarItemLinkLevel(level),
        'menu__list-item',
        className,
      )}
      key={label}>
      <Link
        className={clsx(
          'menu__link',
          !isInternalLink && styles.menuExternalLink,
          {
            'menu__link--active': isActive,
          },
        )}
        autoAddBaseUrl={autoAddBaseUrl}
        aria-current={isActive ? 'page' : undefined}
        to={href}
        title={label}
        {...(isInternalLink && {
          onClick: onItemClick ? () => onItemClick(item) : undefined,
        })}
        {...props}>
        <span className={styles.labelRow}>
          {isRecent && (
            <span
              className={styles.recentStar}
              title="Recently added or updated"
              aria-label="Recently added or updated">
              ✦
            </span>
          )}
          <LinkLabel label={label} />
        </span>
        {!isInternalLink && <IconExternalLink />}
      </Link>
    </li>
  );
}
