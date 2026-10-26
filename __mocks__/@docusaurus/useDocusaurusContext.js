// Mock for @docusaurus/useDocusaurusContext
module.exports = function useDocusaurusContext() {
    return {
        siteConfig: {
            baseUrl: '/',
            customFields: {
                authApiPath: '/api/auth',
                authenticatedApiPath: '/api/backend',
                authProviders: {},
            },
        },
    };
};
