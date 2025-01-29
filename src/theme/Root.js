import React from 'react';
import { ThemeProvider } from '@ui5/webcomponents-react';

// Default implementation, that you can customize
export default function Root({ children }) {
    return <ThemeProvider>{children}</ThemeProvider>;
}
