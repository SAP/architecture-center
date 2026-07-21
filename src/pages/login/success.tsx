import React, { useEffect } from 'react';
import { useHistory } from '@docusaurus/router';

function LoginSuccess() {
    const history = useHistory();

    useEffect(() => {
        // GitHub auth now uses HttpOnly cookies set by the OAuth callback directly.
        // This page is no longer part of the login flow — redirect home.
        history.replace('/');
    }, [history]);

    return (
        <div style={{ textAlign: 'center', padding: '50px' }}>
            <h1>Finalizing Login...</h1>
            <p>This should be quick.</p>
        </div>
    );
}

export default LoginSuccess;
