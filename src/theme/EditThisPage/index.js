import React from 'react';
import { ThemeClassNames } from '@docusaurus/theme-common';
import Link from '@docusaurus/Link';
import IconEdit from '@theme/Icon/Edit';

export default function EditThisPage({ editUrl }) {
    return (
        <Link to={editUrl} className={ThemeClassNames.common.editThisPage} title="Edit this page">
            <IconEdit />
        </Link>
    );
}
