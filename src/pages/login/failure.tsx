import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';

function LoginFailure() {
    return (
        <Layout title="Login Failed">
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <h1>Login Failed</h1>
                <p>Something went wrong during the authentication process.</p>
                <Link to="/" className="button button--primary">
                    Go back to Homepage
                </Link>
            </div>
        </Layout>
    );
}

export default LoginFailure;
