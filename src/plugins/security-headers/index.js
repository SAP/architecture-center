/**
 * Docusaurus plugin to add security headers
 * Implements CSP, X-Frame-Options, and other security headers
 */

module.exports = function (context, options) {
    return {
        name: 'docusaurus-plugin-security-headers',
        
        configureWebpack(config, isServer, utils) {
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
                            'http-equiv': 'X-Frame-Options',
                            content: 'DENY',
                        },
                    },
                    {
                        tagName: 'meta',
                        attributes: {
                            'http-equiv': 'X-XSS-Protection',
                            content: '1; mode=block',
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
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=(), payment=()
  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://www.google-analytics.com; frame-src 'self' https:; object-src 'none'; base-uri 'self'; form-action 'self';
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
                                value: '1; mode=block',
                            },
                            {
                                key: 'Referrer-Policy',
                                value: 'strict-origin-when-cross-origin',
                            },
                            {
                                key: 'Permissions-Policy',
                                value: 'geolocation=(), microphone=(), camera=(), payment=()',
                            },
                            {
                                key: 'Strict-Transport-Security',
                                value: 'max-age=31536000; includeSubDomains; preload',
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