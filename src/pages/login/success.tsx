import React, { useEffect } from 'react';
import { useLocation } from '@docusaurus/router';
import { useAuth } from '@site/src/context/AuthContext';

function LoginSuccess() {
    const { login } = useAuth();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        const redirectPath = params.get('redirect');

        if (token) {
            login(token);

            window.location.href = redirectPath || '/';
        } else {
            window.location.href = '/login/failure';
        }
    }, []);

    return (
        <div style={{ textAlign: 'center', padding: '50px' }}>
            <h1>Finalizing Login...</h1>
            <p>Please wait while we redirect you.</p>
        </div>
    );
}

export default LoginSuccess;
