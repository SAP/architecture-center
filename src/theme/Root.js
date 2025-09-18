import React from 'react';
import { ThemeProvider } from '@ui5/webcomponents-react';
import { AuthProvider } from '../authProviderBTP';

// Default implementation, that you can customize
export default function Root({ children }) {
    return <ThemeProvider><AuthProvider>{children}</AuthProvider></ThemeProvider>;
}
