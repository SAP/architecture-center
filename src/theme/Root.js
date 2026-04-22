import React from 'react';
import { ThemeProvider } from '@ui5/webcomponents-react';
import { AuthProvider } from '../context/AuthContext';
import '@ui5/webcomponents-icons/dist/AllIcons.js';

export default function Root({ children }) {
    return <ThemeProvider><AuthProvider>{children}</AuthProvider></ThemeProvider>;
}
