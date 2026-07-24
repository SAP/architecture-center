import React, { useEffect } from 'react';
import { useLocation } from '@docusaurus/router';

/**
 * Validates that a redirect path is safe (same-origin, relative path only).
 * Prevents open redirect attacks.
 */
function isSafeRedirectPath(path: string | null): boolean {
    if (!path || typeof path !== 'string') return false;
    // Must start with / and must not start with // (protocol-relative URL)
    if (!path.startsWith('/') || path.startsWith('//')) return false;
    // Block backslash-based bypasses
    if (path.includes('\\')) return false;
    // Block encoded slashes that could bypass checks
    if (path.toLowerCase().includes('%2f') || path.toLowerCase().includes('%5c')) return false;
    // Block URLs with protocol schemes
    if (/^\/[a-z]+:/i.test(path)) return false;
    return true;
}

function LoginSuccess() {
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        const redirectPath = params.get('redirect');

        if (token) {
            // Create a short-lived session for the GitHub token and avoid keeping it in the URL history
            const GITHUB_SESSION_DURATION_HOURS = 2;
            const expiresAt = Date.now() + GITHUB_SESSION_DURATION_HOURS * 60 * 60 * 1000;
            const githubAuthData = { token, expiresAt };
            localStorage.setItem('jwt_token', JSON.stringify(githubAuthData));

            // Remove token from the current history entry before navigating away
            window.history.replaceState(null, '', window.location.pathname);

            // Validate redirect path to prevent open redirect attacks
            const safeRedirect = isSafeRedirectPath(redirectPath) ? redirectPath! : '/';
            window.location.href = safeRedirect;
        } else {
            window.location.href = '/login/failure';
        }
    }, [location.search]);

    return (
        <div style={{ textAlign: 'center', padding: '50px' }}>
            <h1>Finalizing Login...</h1>
            <p>This should be quick.</p>
        </div>
    );
}

export default LoginSuccess;