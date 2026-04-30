/**
 * Docusaurus plugin to add security headers
 * Implements CSP, X-Frame-Options, and other security headers
 *
 * SECURITY CONFIGURATION:
 * ✅ X-Frame-Options: DENY - Prevents clickjacking attacks
 * ✅ X-Content-Type-Options: nosniff - Prevents MIME type sniffing
 * ✅ X-XSS-Protection: 0 - Disabled per modern best practices (CSP is better)
 * ✅ Strict-Transport-Security: Enforces HTTPS with preload
 * ✅ Permissions-Policy: Restricts browser features (geolocation, camera, etc.)
 * ✅ Referrer-Policy: Limits referrer information leakage
 * ⚠️  Content-Security-Policy: Includes 'unsafe-inline' (see below)
 *
 * CSP LIMITATIONS (Static Site Generator):
 * - 'unsafe-inline' is currently required for Docusaurus-generated inline styles/scripts
 * - To remove 'unsafe-inline':
 *   1. Implement CSP nonces via Server-Side Rendering (SSR)
 *   2. Configure Docusaurus to use external CSS/JS only
 *   3. Use strict-dynamic with hashes for all inline scripts
 * - This is a known trade-off for static site generators
 * - All other security headers are fully hardened
 *
 * FUTURE IMPROVEMENTS:
 * - Implement CSP nonces when moving to SSR
 * - Add CSP reporting endpoint: report-uri, report-to
 * - Consider CSP Level 3 features (strict-dynamic, trusted-types)
 */

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
            
            const headersContent = `/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 0
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=(), payment=(), usb=(), bluetooth=()
  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://www.google-analytics.com https://architecture-center-auth.cfapps.eu10-005.hana.ondemand.com https://architecture-validator-prod-ns1j6yoi-prod-arch-val-pipeline.cfapps.eu10-005.hana.ondemand.com; frame-src 'self'; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests;
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
                                value: "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://www.google-analytics.com https://architecture-center-auth.cfapps.eu10-005.hana.ondemand.com https://architecture-validator-prod-ns1j6yoi-prod-arch-val-pipeline.cfapps.eu10-005.hana.ondemand.com; frame-src 'self'; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests;",
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