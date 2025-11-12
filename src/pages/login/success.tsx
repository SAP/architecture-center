import React, { useEffect } from 'react';
import { useLocation } from '@docusaurus/router';
import BrowserOnly from '@docusaurus/BrowserOnly';

function LoginSuccessContent() {
    const location = useLocation();

    useEffect(() => {
        // Only run in browser environment
        if (typeof window === 'undefined') return;

        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        const redirectPath = params.get('redirect');

        if (token) {
            localStorage.setItem('jwt_token', token);
            window.location.href = redirectPath || '/';
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

function LoginSuccess() {
    return (
        <BrowserOnly
            fallback={
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <h1>Finalizing Login...</h1>
                    <p>This should be quick.</p>
                </div>
            }
        >
            {() => <LoginSuccessContent />}
        </BrowserOnly>
    );
}

export default LoginSuccess;
