import React, { useEffect } from 'react';
import { ThemeProvider } from '@ui5/webcomponents-react';
import { AuthProvider } from '../context/AuthContext';
import '@ui5/webcomponents-icons/dist/AllIcons.js';

export default function Root({ children }) {
    useEffect(() => {
        import('@ui5/webcomponents-base/dist/Theming.js').then(({ addCustomCSS }) => {
            addCustomCSS(
                'ui5-dialog',
                `.ui5-block-layer { top: var(--ifm-navbar-height, 60px) !important; }`
            );
        });
    }, []);

    return <ThemeProvider><AuthProvider>{children}</AuthProvider></ThemeProvider>;
}
