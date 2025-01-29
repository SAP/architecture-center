import React from 'react';
import clsx from 'clsx';
import { ThemeClassNames } from '@docusaurus/theme-common';
import { useDoc } from '@docusaurus/plugin-content-docs/client';

import Contributors from '../../../components/Contributors';
import Discussion from '../../../components/Discussion';

export default function DocItemFooter(): JSX.Element | null {
    const { metadata } = useDoc();
    const { frontMatter } = metadata;

    const canDisplayContributorsRow = (frontMatter as any).contributors?.length > 0;

    const canDisplayFooter = canDisplayContributorsRow

    if (!canDisplayFooter) {
        return null;
    }

    return (
        <footer className={clsx(ThemeClassNames.docs.docFooter, 'docusaurus-mt-lg')}>
            {canDisplayContributorsRow && <Contributors />}
            <Discussion />
        </footer>
    );
}