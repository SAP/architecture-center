// src/components/ProtectedRoute.tsx

import React, { ReactNode, useEffect } from 'react';
import { useAuth } from '@site/src/context/AuthContext';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { useLocation } from '@docusaurus/router';
import Layout from '@theme/Layout';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
    const { user, loading } = useAuth();
    const { siteConfig } = useDocusaurusContext();
    const location = useLocation();

    useEffect(() => {
        if (!loading && !user) {
            const backendUrl = siteConfig.customFields.backendUrl as string;
            const redirectPath = location.pathname;

            const loginUrl = `${backendUrl}/api/auth/github?redirect=${encodeURIComponent(redirectPath)}`;
            window.location.href = loginUrl;
        }
    }, [user, loading, location.pathname, siteConfig]);

    if (loading) {
        return (
            <Layout>
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                    <h2>Loading...</h2>
                </div>
            </Layout>
        );
    }

    if (user) {
        return <>{children}</>;
    }

    return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h2>Redirecting to login...</h2>
        </div>
    );
}
