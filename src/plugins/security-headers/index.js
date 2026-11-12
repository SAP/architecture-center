/**
 * Docusaurus plugin: emits the site's HTTP security headers.
 *
 * The header VALUES live in ./csp-config.js (the single source of truth, also
 * used to generate the committed vercel.json via `npm run gen:headers`). This
 * plugin only writes the Cloudflare Pages `_headers` file at build time.
 *
 * SECURITY HEADERS (see csp-config.js for the authoritative definitions):
 *  - Content-Security-Policy (includes 'unsafe-inline' — unavoidable for a static
 *    Docusaurus/UI5 build without SSR nonces; all other directives are tight)
 *  - Strict-Transport-Security (HSTS, preload)
 *  - X-Frame-Options: DENY + frame-ancestors 'none' (clickjacking)
 *  - X-Content-Type-Options: nosniff
 *  - Cross-Origin-Opener-Policy, Referrer-Policy, Permissions-Policy
 *
 * NOTE: vercel.json is NOT written here. Vercel reads vercel.json from the repo
 * root at build-config time (before this postBuild hook runs), so generating it
 * here would never take effect. It is a committed file kept in sync via the
 * `gen:headers` npm script and enforced by CI.
 */
const { renderHeadersFile } = require('./csp-config');

module.exports = function (_context, _options) {
    return {
        name: 'docusaurus-plugin-security-headers',

        injectHtmlTags() {
            return {
                headTags: [
                    {
                        tagName: 'meta',
                        attributes: {
                            'http-equiv': 'X-Content-Type-Options',
                            content: 'nosniff',
                        },
                    },
                    {
                        tagName: 'meta',
                        attributes: {
                            'http-equiv': 'X-XSS-Protection',
                            content: '0',
                        },
                    },
                    {
                        tagName: 'meta',
                        attributes: {
                            name: 'referrer',
                            content: 'strict-origin-when-cross-origin',
                        },
                    },
                ],
            };
        },

        postBuild({ outDir }) {
            // Create the _headers file consumed by Cloudflare Pages (and Netlify).
            const fs = require('fs');
            const path = require('path');

            const headersPath = path.join(outDir, '_headers');
            fs.writeFileSync(headersPath, renderHeadersFile(), 'utf8');
            console.log('✅ Security headers (_headers) generated at:', headersPath);
        },
    };
};
