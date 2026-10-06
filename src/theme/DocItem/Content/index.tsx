/**
 * Adding edit button to the top of the page
 * Adding tags to the top of the page
 */

import React, { type ReactNode } from 'react';
import clsx from 'clsx';
import { ThemeClassNames } from '@docusaurus/theme-common';
import { useDoc } from '@docusaurus/plugin-content-docs/client';
import Heading from '@theme/Heading';
import MDXContent from '@theme/MDXContent';
import type { Props } from '@theme/DocItem/Content';

import TagsListInline from '@theme/TagsListInline';
import EditMetaRow from '@theme/EditMetaRow';

import ArchiveMessage from './archive-msg.md';
import OldMessage from './old-msg.md';

function useSyntheticTitle(): string | null {
    const { metadata, frontMatter, contentTitle } = useDoc();
    const shouldRender = !frontMatter.hide_title && typeof contentTitle === 'undefined';
    if (!shouldRender) {
        return null;
    }
    return metadata.title;
}

function useIsArchived(): boolean {
    const { frontMatter } = useDoc();
    const tags = frontMatter.tags;
    if (!Array.isArray(tags)) {
        return false;
    }
    return tags.some((tag) => {
        const value = typeof tag === 'string' ? tag : tag?.label;
        return value?.toLowerCase() === 'archive';
    });
}

function useIsOlderThanOneYear(): boolean {
    const { frontMatter } = useDoc();
    const rawDate = frontMatter.last_update?.date;
    if (!rawDate) {
        return false;
    }
    const updated = new Date(rawDate);
    if (Number.isNaN(updated.getTime())) {
        return false;
    }
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    return updated < oneYearAgo;
}

export default function DocItemContent({ children }: Props): ReactNode {
    const syntheticTitle = useSyntheticTitle();
    const isArchived = useIsArchived();
    const isOld = useIsOlderThanOneYear();
    const { metadata } = useDoc();
    const { editUrl, lastUpdatedAt, lastUpdatedBy, tags } = metadata;
    const canDisplayTagsRow = tags.length > 0;
    const canDisplayEditMetaRow = !!(editUrl || lastUpdatedAt || lastUpdatedBy);

    return (
        <div>
            <div className={clsx(ThemeClassNames.docs.docMarkdown, 'markdown')}>
                {syntheticTitle && (
                    <header>
                        <br></br>
                        <Heading as="h1">{syntheticTitle}</Heading>
                    </header>
                )}
                {canDisplayTagsRow && (
                    <div className={clsx('row margin-top--sm', ThemeClassNames.docs.docFooterTagsRow)}>
                        <div className="col">
                            <TagsListInline tags={tags} />
                        </div>
                    </div>
                )}

                {canDisplayEditMetaRow && (
                    <div>
                        <EditMetaRow
                            className={clsx('margin-top--sm', ThemeClassNames.docs.docFooterEditMetaRow)}
                            lastUpdatedAt={lastUpdatedAt}
                            lastUpdatedBy={lastUpdatedBy}
                            editUrl={editUrl}
                        />
                        <br></br>
                    </div>
                )}

                {isArchived ? (
                    <MDXContent>
                        <ArchiveMessage />
                    </MDXContent>
                ) : isOld ? (
                    <MDXContent>
                        <OldMessage />
                    </MDXContent>
                ) : null}

                <MDXContent>{children}</MDXContent>
            </div>
        </div>
    );
}
