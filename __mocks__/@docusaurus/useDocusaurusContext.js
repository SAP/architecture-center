// Mock for @docusaurus/useDocusaurusContext
module.exports = function useDocusaurusContext() {
    return {
        siteConfig: {
            customFields: {
                backendUrl: 'https://backend.example.com',
                expressBackendUrl: 'https://express.example.com',
                authProviders: {},
            },
        },
    };
};
