import React, { useEffect } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { clearLegacyClientCredentials } from '@site/src/services/authSession';

/**
 * Compatibility route for bookmarked versions of the retired browser-token
 * callback. The BFF completes OAuth itself and redirects directly to the
 * validated return path, so this page never consumes credentials.
 */
export default function LoginSuccess() {
    const { siteConfig } = useDocusaurusContext();

    useEffect(() => {
        clearLegacyClientCredentials();
        window.location.replace(siteConfig.baseUrl || '/');
    }, [siteConfig.baseUrl]);

    return (
        <div style={{ textAlign: 'center', padding: '50px' }}>
            <h1>Finalizing Login...</h1>
            <p>This should be quick.</p>
        </div>
    );
}
