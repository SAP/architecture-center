import React, { useEffect } from 'react';
import { ThemeProvider } from '@ui5/webcomponents-react';
import { AuthProvider } from '../context/AuthContext';

export default function Root({ children }) {
    // Suppress ResizeObserver loop error (benign warning from UI libraries)
    useEffect(() => {
        const errorHandler = (e) => {
            if (e.message?.includes('ResizeObserver loop')) {
                e.stopImmediatePropagation();
            }
        };
        window.addEventListener('error', errorHandler);
        return () => window.removeEventListener('error', errorHandler);
    }, []);

    return <ThemeProvider><AuthProvider>{children}</AuthProvider></ThemeProvider>;
}
