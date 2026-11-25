import React, { ReactNode } from 'react';
import { useAuth } from '@site/src/context/AuthContext';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { useLocation } from '@docusaurus/router';
import { getLoginUrl } from '@site/src/services/authSession';

function Redirecting({ provider }: { provider?: string }) {
    return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h2>Redirecting to {provider ? `${provider.toUpperCase()} ` : ''}login...</h2>
        </div>
    );
}

export default function ProtectedRoute({ children }: { children: ReactNode }) {
    const { user, users, loading } = useAuth();
    const { siteConfig } = useDocusaurusContext();
    const location = useLocation();

    const { authApiPath, authProviders } = siteConfig.customFields as {
        authApiPath: string;
        authProviders: Record<string, 'btp' | 'github'>;
    };

    if (loading) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <h2>Loading User...</h2>
            </div>
        );
    }

    if (user) {
        const requiredProvider = authProviders[location.pathname];
        if (requiredProvider) {
            // Check if user is logged in with the required provider using the users object
            const isLoggedInWithRequiredProvider = users[requiredProvider] !== null;
            if (!isLoggedInWithRequiredProvider) {
                return (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>
                        <h2>Access Denied</h2>
                        <p>
                            This page requires you to be logged in with {requiredProvider.toUpperCase()}. You are
                            currently logged in with {user.provider.toUpperCase()}.
                        </p>
                        <p>Please log out and log in with the correct provider.</p>
                    </div>
                );
            }
        }
        return <>{children}</>;
    }

    if (!user) {
        const requiredProvider = authProviders[location.pathname];

        if (requiredProvider) {
            if (typeof window !== 'undefined') {
                const redirectPath = location.pathname + location.search;
                const loginUrl = getLoginUrl(authApiPath, requiredProvider, redirectPath);
                window.location.href = loginUrl;
            }
            return <Redirecting provider={requiredProvider} />;
        }
    }
    return <>{children}</>;
}
