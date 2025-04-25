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

function useSyntheticTitle(): string | null {
    const { metadata, frontMatter, contentTitle } = useDoc();
    const shouldRender = !frontMatter.hide_title && typeof contentTitle === 'undefined';
    if (!shouldRender) {
        return null;
    }
    return metadata.title;
}

export default function DocItemContent({ children }: Props): ReactNode {
    const syntheticTitle = useSyntheticTitle();
    const { metadata } = useDoc();
    const { editUrl, lastUpdatedAt, lastUpdatedBy, tags } = metadata;
    const canDisplayTagsRow = tags.length > 0;
    const canDisplayEditMetaRow = !!(editUrl || lastUpdatedAt || lastUpdatedBy);

    const canDisplayContent = canDisplayTagsRow || canDisplayEditMetaRow;

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

                <MDXContent>{children}</MDXContent>
            </div>
        </div>
    );
}
