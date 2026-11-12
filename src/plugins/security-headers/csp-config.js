/**
 * Single source of truth for the site's HTTP security headers (CSP + related).
 *
 * Consumed by:
 *   - src/plugins/security-headers/index.js      -> build/_headers (Cloudflare Pages)
 *   - src/_scripts/_generate-vercel-headers.js   -> vercel.json      (Vercel)
 *
 * This is the ONLY place these values are defined. After editing, run
 * `npm run gen:headers` to regenerate the committed vercel.json. CI
 * (check-security-headers.yml) fails if vercel.json drifts from this file.
 *
 * NOTE on 'unsafe-inline': still required for Docusaurus/UI5 inline scripts and
 * styles on a static (non-SSR) build. Removing it needs SSR nonces or hashes and
 * is tracked as a future improvement (see git history for the nonce prototype).
 *
 * Every allowed origin below is justified:
 *   - static.cloudflareinsights.com / cloudflareinsights.com -> Cloudflare Web Analytics
 *   - cdn.jsdelivr.net/npm/@sap-theming/ -> SAP Fiori/UI5 web-component theming fonts
 *   - architecture-center-auth.cfapps.eu10-005.hana.ondemand.com -> Quick Start auth app
 *   - sap-architecture-center-quickstart-cap-port-ij290co9-pr61a3cf31.cfapps.eu10-005.hana.ondemand.com
 *       -> Quick Start document and collaboration API
 *   - embed.diagrams.net -> embedded Draw.io editor
 *   - viewer.diagrams.net -> embedded Draw.io diagram renderer
 *   - cdnapisec.kaltura.com -> Kaltura video player embedded in RA0005
 * Google Analytics / Tag Manager origins were removed: no analytics plugin is
 * configured in docusaurus.config.ts, so nothing loads them.
 */

// Ordered CSP directives. An empty value array renders a valueless directive
// (e.g. upgrade-insecure-requests).
const cspDirectives = [
    ['default-src', ["'self'"]],
    [
        'script-src',
        ["'self'", "'unsafe-inline'", 'https://static.cloudflareinsights.com', 'https://viewer.diagrams.net'],
    ],
    ['style-src', ["'self'", "'unsafe-inline'"]],
    ['img-src', ["'self'", 'data:', 'blob:', 'https:']],
    ['font-src', ["'self'", 'data:', 'https://cdn.jsdelivr.net/npm/@sap-theming/']],
    [
        'connect-src',
        [
            "'self'",
            'https://architecture-center-auth.cfapps.eu10-005.hana.ondemand.com',
            'https://sap-architecture-center-quickstart-cap-port-ij290co9-pr61a3cf31.cfapps.eu10-005.hana.ondemand.com',
            'https://cloudflareinsights.com',
            'https://viewer.diagrams.net',
        ],
    ],
    [
        'frame-src',
        ["'self'", 'https://embed.diagrams.net', 'https://cdnapisec.kaltura.com'],
    ],
    ['worker-src', ["'self'", 'blob:']],
    ['frame-ancestors', ["'none'"]],
    ['object-src', ["'none'"]],
    ['base-uri', ["'self'"]],
    ['form-action', ["'self'"]],
    ['upgrade-insecure-requests', []],
];

// Non-CSP security headers, in output order.
const securityHeaders = [
    ['X-Frame-Options', 'DENY'],
    ['X-Content-Type-Options', 'nosniff'],
    ['X-XSS-Protection', '0'], // Modern browsers rely on CSP instead
    ['Referrer-Policy', 'strict-origin-when-cross-origin'],
    ['Cross-Origin-Opener-Policy', 'same-origin-allow-popups'], // XS-Leaks isolation; safe for OAuth/Kaltura popups
    ['Permissions-Policy', 'geolocation=(), microphone=(), camera=(), payment=(), usb=(), bluetooth=()'],
    ['Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload'],
];

/** Build the Content-Security-Policy header value. */
function buildCSP() {
    return (
        cspDirectives.map(([name, values]) => (values.length ? `${name} ${values.join(' ')}` : name)).join('; ') + ';'
    );
}

/** All response headers (non-CSP + CSP) as ordered [key, value] pairs. */
function allHeaders() {
    return [...securityHeaders, ['Content-Security-Policy', buildCSP()]];
}

/** Cloudflare Pages "_headers" file body, applied to every path. */
function renderHeadersFile() {
    const lines = allHeaders().map(([key, value]) => `  ${key}: ${value}`);
    return `/*\n${lines.join('\n')}\n`;
}

/** Vercel "vercel.json" configuration object. */
function buildVercelConfig() {
    return {
        headers: [
            {
                source: '/(.*)',
                headers: allHeaders().map(([key, value]) => ({ key, value })),
            },
        ],
    };
}

module.exports = {
    cspDirectives,
    securityHeaders,
    buildCSP,
    allHeaders,
    renderHeadersFile,
    buildVercelConfig,
};
