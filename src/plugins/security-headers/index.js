/**
 * Docusaurus plugin to add security headers.
 *
 * DELIVERY REALITY (important):
 * - The production site is hosted on GitHub Pages, which does NOT serve custom
 *   HTTP response headers — it ignores both the generated `_headers` file and
 *   `vercel.json`. On GitHub Pages the ONLY header browsers honor from a static
 *   host is a Content-Security-Policy set via <meta http-equiv>, which this
 *   plugin now injects (see injectHtmlTags below).
 * - The `_headers` and `vercel.json` files are still emitted so the FULL header
 *   set (CSP + HSTS + X-Frame-Options + Permissions-Policy + Referrer-Policy)
 *   applies if the site is ever fronted by Netlify / Cloudflare Pages / Vercel
 *   or a CDN/reverse proxy.
 * - CAVEAT: a <meta> CSP cannot express `frame-ancestors`, so full clickjacking
 *   protection and HSTS still require a real response header from a CDN/proxy in
 *   front of GitHub Pages. Do not assume those are enforced on *.github.io.
 *
 * CSP notes:
 * - 'unsafe-inline' is currently required for Docusaurus-generated inline
 *   scripts/styles and UI5 Web Components. Removing it needs SSR nonces
 *   (see csp-config.ts strictCSP + generateNonce for the future path).
 * - viewer.diagrams.net is whitelisted because the Quick Start editor loads the
 *   drawio viewer script into a srcdoc iframe; omitting it breaks diagrams.
 */

// Single source of truth for the Content-Security-Policy directives.
const CSP_DIRECTIVES = {
    'default-src': ["'self'"],
    'script-src': [
        "'self'",
        "'unsafe-inline'", // Docusaurus hydration/routing inline scripts
        'https://www.googletagmanager.com',
        'https://www.google-analytics.com',
        'https://viewer.diagrams.net', // drawio viewer loaded by the editor
    ],
    'style-src': ["'self'", "'unsafe-inline'"], // Docusaurus + UI5 inline styles
    'img-src': ["'self'", 'data:', 'https:'],
    'font-src': ["'self'", 'data:'],
    'connect-src': [
        "'self'",
        'https://www.google-analytics.com',
        'https://www.googletagmanager.com',
        'https://api.github.com',
        'https://architecture-center-auth.cfapps.eu10-005.hana.ondemand.com',
        'https://architecture-validator-prod-ns1j6yoi-prod-arch-val-pipeline.cfapps.eu10-005.hana.ondemand.com',
    ],
    'frame-src': ["'self'", 'https://viewer.diagrams.net'],
    'frame-ancestors': ["'none'"], // response-header only; ignored inside <meta>
    'worker-src': ["'self'", 'blob:'], // UI5 web components / blob workers
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'upgrade-insecure-requests': [],
};

// Directives that are invalid in a <meta http-equiv> CSP (they trigger a
// browser console warning and are ignored there).
const META_INVALID_DIRECTIVES = new Set(['frame-ancestors']);

/**
 * Build a CSP header string from the directives object.
 * @param {{forMeta?: boolean}} opts - when forMeta is true, directives that are
 *   invalid inside a <meta> tag are omitted.
 */
function buildCsp(opts = {}) {
    const forMeta = opts.forMeta === true;
    return (
        Object.entries(CSP_DIRECTIVES)
            .filter(([directive]) => !(forMeta && META_INVALID_DIRECTIVES.has(directive)))
            .map(([directive, values]) => (values.length ? `${directive} ${values.join(' ')}` : directive))
            .join('; ') + ';'
    );
}

module.exports = function (_context, _options) {
    return {
        name: 'docusaurus-plugin-security-headers',

        configureWebpack(_config, isServer, _utils) {
            if (!isServer) {
                return {};
            }
            
            return {
                plugins: [],
            };
        },

        injectHtmlTags() {
            return {
                headTags: [
                    {
                        // On GitHub Pages this is the only security header that
                        // actually reaches the browser (see file header).
                        tagName: 'meta',
                        attributes: {
                            'http-equiv': 'Content-Security-Policy',
                            content: buildCsp({ forMeta: true }),
                        },
                    },
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
            // Create _headers file for Netlify/Cloudflare Pages
            const fs = require('fs');
            const path = require('path');

            const cspHeaderValue = buildCsp();

            const headersContent = `/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 0
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=(), payment=(), usb=(), bluetooth=()
  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
  Content-Security-Policy: ${cspHeaderValue}
`;

            const headersPath = path.join(outDir, '_headers');
            fs.writeFileSync(headersPath, headersContent, 'utf8');
            
            console.log('✅ Security headers file generated at:', headersPath);

            // Also create vercel.json for Vercel deployment
            const vercelConfig = {
                headers: [
                    {
                        source: '/(.*)',
                        headers: [
                            {
                                key: 'X-Frame-Options',
                                value: 'DENY',
                            },
                            {
                                key: 'X-Content-Type-Options',
                                value: 'nosniff',
                            },
                            {
                                key: 'X-XSS-Protection',
                                value: '0',
                            },
                            {
                                key: 'Referrer-Policy',
                                value: 'strict-origin-when-cross-origin',
                            },
                            {
                                key: 'Permissions-Policy',
                                value: 'geolocation=(), microphone=(), camera=(), payment=(), usb=(), bluetooth=()',
                            },
                            {
                                key: 'Strict-Transport-Security',
                                value: 'max-age=31536000; includeSubDomains; preload',
                            },
                            {
                                key: 'Content-Security-Policy',
                                value: cspHeaderValue,
                            },
                        ],
                    },
                ],
            };

            const vercelPath = path.join(outDir, '../vercel.json');
            if (!fs.existsSync(vercelPath)) {
                fs.writeFileSync(vercelPath, JSON.stringify(vercelConfig, null, 2), 'utf8');
                console.log('✅ Vercel security headers file generated');
            }
        },
    };
};