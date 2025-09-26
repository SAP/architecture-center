import React from 'react';
import { ThemeProvider } from '@ui5/webcomponents-react';
import { AuthProvider } from '../context/AuthContext';

export default function Root({ children }) {
    return <ThemeProvider><AuthProvider>{children}</AuthProvider></ThemeProvider>;
}
