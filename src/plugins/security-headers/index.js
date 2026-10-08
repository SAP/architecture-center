/**
 * Docusaurus plugin to add security headers.
 *
 * DELIVERY REALITY (important):
 * - Production is deployed to CLOUDFLARE PAGES (see .github/workflows/
 *   deploy-to-cloudflare.yml and src/_scripts/_deploy-cloudflare.zsh) at the
 *   custom domain architecture.learning.sap.com. Cloudflare Pages DOES serve
 *   the generated `_headers` file as real HTTP response headers, so the full
 *   header set (CSP + HSTS + X-Frame-Options + COOP + Permissions-Policy +
 *   Referrer-Policy) is enforced in production.
 * - This plugin ALSO injects a <meta http-equiv="Content-Security-Policy"> tag
 *   (see injectHtmlTags) as defence-in-depth for any header-less static mirror
 *   (e.g. plain GitHub Pages). It is injected in PRODUCTION BUILDS ONLY — never
 *   during `docusaurus start`, where an enforced connect-src would break the
 *   editor's localhost backend and webpack HMR. IMPORTANT: when both a
 *   response-header CSP and a <meta> CSP reach the browser, the browser enforces
 *   BOTH and the effective policy is their INTERSECTION. If the two policies
 *   diverge, the intersection silently breaks legitimate resources. To avoid
 *   that, BOTH the `_headers` CSP and the <meta> CSP are generated from the
 *   single source below (buildCsp): the header gets the full policy, the <meta>
 *   gets the same policy minus directives that are invalid inside <meta>
 *   (frame-ancestors). Their intersection therefore equals the intended policy.
 * - `vercel.json` is also emitted/committed from the same source for a possible
 *   Vercel mirror; the committed copy is drift-checked by
 *   __tests__/csp-config.test.ts.
 * - Only Content-Security-Policy and the referrer policy work via <meta>.
 *   X-Content-Type-Options (nosniff) and X-XSS-Protection are IGNORED by
 *   browsers when set via <meta>; they are delivered only as real response
 *   headers from the _headers file below.
 *
 * CSP notes:
 * - 'unsafe-inline' is currently required for Docusaurus-generated inline
 *   scripts/styles and UI5 Web Components. Removing it needs SSR nonces
 *   (see csp-config.ts strictCSP + generateNonce for the future path).
 * - CSP_DIRECTIVES is the UNION of every origin the site legitimately loads.
 *   Dropping any of them would break production once the policy is enforced.
 */

// Single source of truth for the Content-Security-Policy directives.
// This is the UNION of every origin the production site legitimately uses;
// both the response-header CSP and the <meta> CSP derive from it so their
// intersection equals the intended policy.
const CSP_DIRECTIVES = {
    'default-src': ["'self'"],
    'script-src': [
        "'self'",
        "'unsafe-inline'", // Docusaurus hydration/routing inline scripts
        'https://www.googletagmanager.com',
        'https://www.google-analytics.com',
        'https://static.cloudflareinsights.com', // Cloudflare Web Analytics beacon
        'https://viewer.diagrams.net', // drawio viewer loaded by the editor
    ],
    'style-src': ["'self'", "'unsafe-inline'"], // Docusaurus + UI5 inline styles
    'img-src': ["'self'", 'data:', 'https:', 'blob:'], // blob: = title-customized drawio SVGs (DrawioResources)
    'font-src': ["'self'", 'data:', 'https://cdn.jsdelivr.net'], // SAP theming fonts (UI5)
    'connect-src': [
        "'self'",
        'https://www.google-analytics.com',
        'https://www.googletagmanager.com',
        'https://api.github.com',
        // Quick Start auth + document-service backend (host injected at build
        // time from env). eu10-005 is the current region per csp-config.ts.
        'https://architecture-center-auth.cfapps.eu10-005.hana.ondemand.com',
        'https://architecture-validator-prod-ns1j6yoi-prod-arch-val-pipeline.cfapps.eu10-005.hana.ondemand.com',
        'https://cloudflareinsights.com', // Cloudflare Web Analytics reporting
    ],
    // frame-src origins the site embeds in iframes:
    // - viewer.diagrams.net = drawio VIEWER (srcdoc viewer-static.min.js)
    // - embed.diagrams.net   = drawio EDITOR (the "edit diagram" modal iframe,
    //   src/components/Editor/plugins/DrawioEditorPlugin) — omitting it blocks
    //   diagram editing under the enforced CSP.
    // - cdnapisec.kaltura.com = embedded video in docs/ref-arch/RA0005/readme.md.
    'frame-src': [
        "'self'",
        'https://viewer.diagrams.net',
        'https://embed.diagrams.net',
        'https://cdnapisec.kaltura.com',
    ],
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
            // Only two headers can meaningfully be delivered via <meta http-equiv>:
            // Content-Security-Policy and the referrer policy. X-Content-Type-Options
            // (nosniff) and X-XSS-Protection are IGNORED by browsers when set via
            // <meta> — they only work as real HTTP response headers, which Cloudflare
            // already sends from the generated _headers file. So we do NOT emit them
            // as meta tags here.
            //
            // The <meta> CSP is defence-in-depth for a header-less PRODUCTION mirror
            // (e.g. plain GitHub Pages). It must NOT be injected during `docusaurus
            // start`: in dev the Quick Start editor talks to a localhost backend
            // (EXPRESS_BACKEND_URL) on a different port and webpack HMR uses a
            // localhost WebSocket — both are a different origin than 'self' and an
            // enforced connect-src would break them. Production enforcement comes from
            // the real _headers/vercel.json response header, so dev loses nothing by
            // omitting the meta tag.
            const isProduction = process.env.NODE_ENV === 'production';

            const headTags = [
                {
                    tagName: 'meta',
                    attributes: {
                        name: 'referrer',
                        content: 'strict-origin-when-cross-origin',
                    },
                },
            ];

            if (isProduction) {
                // Prepend the CSP meta so it mirrors the response-header CSP
                // (minus frame-ancestors, which is invalid inside <meta>); their
                // intersection in the browser equals the intended policy.
                headTags.unshift({
                    tagName: 'meta',
                    attributes: {
                        'http-equiv': 'Content-Security-Policy',
                        content: buildCsp({ forMeta: true }),
                    },
                });
            }

            return { headTags };
        },

        postBuild({ outDir }) {
            // Create _headers file for Netlify/Cloudflare Pages
            const fs = require('fs');
            const path = require('path');
            // Single-source CSP: the response header gets the full policy
            // (including frame-ancestors, which <meta> cannot express).
            const cspHeaderValue = buildCsp();
            const headersContent = `/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 0
  Referrer-Policy: strict-origin-when-cross-origin
  Cross-Origin-Opener-Policy: same-origin-allow-popups
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
                                key: 'Cross-Origin-Opener-Policy',
                                value: 'same-origin-allow-popups',
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

// Exported for tests so the committed vercel.json can be checked for drift
// against this single CSP source (see __tests__/csp-config.test.ts). The
// committed vercel.json is not regenerated on build (it already exists), so the
// test is what keeps it from silently diverging from CSP_DIRECTIVES.
module.exports.CSP_DIRECTIVES = CSP_DIRECTIVES;
module.exports.buildCsp = buildCsp;
