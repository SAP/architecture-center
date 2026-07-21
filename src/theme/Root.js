import React from 'react';
import { ThemeProvider } from '@ui5/webcomponents-react';
import { addCustomCSS } from '@ui5/webcomponents-base/dist/Theming.js';
import { AuthProvider } from '../context/AuthContext';
import '@ui5/webcomponents-icons/dist/AllIcons.js';

/**
 * Keep the site navbar usable while a UI5 Dialog is open.
 *
 * A UI5 `Dialog` (e.g. the auto-opened "Create New Reference Architecture"
 * dialog on /quick-start) renders a transparent, `pointer-events: all`
 * `.ui5-block-layer` inside its shadow DOM that intercepts every click across
 * the whole viewport — including the navbar, which makes the theme toggle,
 * GitHub link and logout unclickable.
 *
 * Injecting this into the dialog's shadow root pushes the click-blocking layer
 * to start just below the navbar (`--ifm-navbar-height`), leaving the navbar
 * strip clickable while the dialog stays modal over the page content.
 *
 * Applied once at module load (before any dialog renders).
 */
addCustomCSS(
    'ui5-dialog',
    `
        .ui5-block-layer {
            top: var(--ifm-navbar-height, 60px) !important;
        }
    `
);

export default function Root({ children }) {
    return <ThemeProvider><AuthProvider>{children}</AuthProvider></ThemeProvider>;
}
