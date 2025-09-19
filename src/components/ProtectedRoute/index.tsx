// src/components/ProtectedRoute.tsx

import React, { ReactNode } from 'react';
import { useAuth } from '@site/src/context/AuthContext';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { useLocation } from '@docusaurus/router';
import Layout from '@theme/Layout';

function Redirecting({ provider }: { provider?: string }) {
    return (
        <Layout>
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <h2>Redirecting to {provider ? `${provider.toUpperCase()} ` : ''}login...</h2>
            </div>
        </Layout>
    );
}

export default function ProtectedRoute({ children }: { children: ReactNode }) {
    const { user, loading } = useAuth();
    const { siteConfig } = useDocusaurusContext();
    const location = useLocation();

    const { backendUrl, authProviders } = siteConfig.customFields as {
        backendUrl: string;
        authProviders: Record<string, 'btp' | 'github'>;
    };

    if (loading) {
        return (
            <Layout>
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                    <h2>Loading User...</h2>
                </div>
            </Layout>
        );
    }

    if (user) {
        const requiredProvider = authProviders[location.pathname];
        if (requiredProvider && user.provider !== requiredProvider) {
            return (
                <Layout>
                    <div style={{ padding: '2rem', textAlign: 'center' }}>
                        <h2>Access Denied</h2>
                        <p>
                            This page requires you to be logged in with {requiredProvider.toUpperCase()}. You are
                            currently logged in with {user.provider.toUpperCase()}.
                        </p>
                        <p>Please log out and log in with the correct provider.</p>
                    </div>
                </Layout>
            );
        }
        return <>{children}</>;
    }

    if (!user) {
        const requiredProvider = authProviders[location.pathname];

        if (requiredProvider) {
            if (typeof window !== 'undefined') {
                const redirectPath = location.pathname + location.search;
                const loginUrl = `${backendUrl}/user/login?origin_uri=${encodeURIComponent(
                    redirectPath
                )}&provider=${requiredProvider}`;
                window.location.href = loginUrl;
            }
            return <Redirecting provider={requiredProvider} />;
        }
    }
    return <>{children}</>;
}
