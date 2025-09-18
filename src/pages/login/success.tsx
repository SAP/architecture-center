// src/pages/login/success.tsx

import React, { useEffect } from 'react';
import { useLocation } from '@docusaurus/router';
import Layout from '@theme/Layout';

function LoginSuccess() {
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        const redirectPath = params.get('redirect');

        if (token) {
            localStorage.setItem('jwt_token', token);

            window.location.href = redirectPath || '/';
        } else {
            window.location.href = '/login/failure';
        }
    }, []);

    return (
        <div style={{ textAlign: 'center', padding: '50px' }}>
            <h1>Finalizing Login...</h1>
            <p>This should be quick.</p>
        </div>
    );
}

export default LoginSuccess;
