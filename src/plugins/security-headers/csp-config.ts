/**
 * Enhanced Content Security Policy Configuration
 *
 * This file provides an enhanced CSP configuration with reporting
 * and stricter policies for production environments.
 *
 * KNOWN LIMITATION (v3.2617.1):
 * - CSP currently uses 'unsafe-inline' for both script-src and style-src
 * - This is a Docusaurus limitation that requires inline scripts/styles
 * - To remove 'unsafe-inline', we need to implement CSP nonces via SSR
 * - Track implementation: [Create GitHub issue for CSP nonce implementation]
 * - Priority: Post-release (does not block v3.2617.1 release)
 *
 * USAGE:
 * Import this in security-headers plugin when CSP nonces are implemented
 */

interface CSPDirectives {
    [key: string]: string[];
}

/**
 * Base CSP directives (current implementation with unsafe-inline)
 *
 * SECURITY NOTE: 'unsafe-inline' weakens XSS protection but is required for:
 * - Docusaurus inline scripts for routing and hydration
 * - UI5 Web Components inline styles
 * - React inline event handlers
 *
 * MITIGATION: While not ideal, we compensate with:
 * - Input sanitization (src/utils/sanitization.ts)
 * - No user-generated content directly rendered as HTML
 * - Strict validation of all external data
 */
export const baseCSP: CSPDirectives = {
    'default-src': ["'self'"],
    'script-src': [
        "'self'",
        "'unsafe-inline'", // REQUIRED: Docusaurus limitation - see header comment
        'https://www.googletagmanager.com',
        'https://www.google-analytics.com',
        'https://static.cloudflareinsights.com',
    ],
    'style-src': [
        "'self'",
        "'unsafe-inline'", // REQUIRED: Docusaurus + UI5 limitation - see header comment
    ],
    'img-src': ["'self'", 'data:', 'https:'],
    'font-src': ["'self'", 'data:'],
    'connect-src': [
        "'self'",
        'https://www.google-analytics.com',
        'https://architecture-center-auth.cfapps.eu10-005.hana.ondemand.com',
        'https://architecture-validator-prod-ns1j6yoi-prod-arch-val-pipeline.cfapps.eu10-005.hana.ondemand.com',
        'https://cloudflareinsights.com',
    ],
    'frame-src': ["'self'"],
    'frame-ancestors': ["'none'"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'upgrade-insecure-requests': [],
};

/**
 * Strict CSP directives (for future implementation with nonces)
 * Use this when SSR with nonces is implemented
 */
export const strictCSP: CSPDirectives = {
    'default-src': ["'self'"],
    'script-src': [
        "'self'",
        "'strict-dynamic'", // Allows scripts loaded by trusted scripts
        // 'nonce-{RANDOM}' will be added dynamically by SSR
        'https://www.googletagmanager.com',
        'https://www.google-analytics.com',
        'https://static.cloudflareinsights.com',
    ],
    'style-src': [
        "'self'",
        // 'nonce-{RANDOM}' will be added dynamically by SSR
    ],
    'img-src': ["'self'", 'data:', 'https:'],
    'font-src': ["'self'", 'data:'],
    'connect-src': [
        "'self'",
        'https://www.google-analytics.com',
        'https://architecture-center-auth.cfapps.eu10-005.hana.ondemand.com',
        'https://architecture-validator-prod-ns1j6yoi-prod-arch-val-pipeline.cfapps.eu10-005.hana.ondemand.com',
        'https://cloudflareinsights.com',
    ],
    'frame-src': ["'self'"],
    'frame-ancestors': ["'none'"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'worker-src': ["'self'", 'blob:'],
    'manifest-src': ["'self'"],
    'upgrade-insecure-requests': [],
    // CSP Level 3 features
    'trusted-types': ['default'], // Requires Trusted Types API
    'require-trusted-types-for': ["'script'"],
};

/**
 * CSP Reporting configuration
 * Set up a reporting endpoint to monitor CSP violations
 */
export const cspReporting = {
    // CSP Level 2 reporting
    'report-uri': '/api/csp-report',

    // CSP Level 3 reporting (preferred)
    'report-to': 'csp-endpoint',
};

/**
 * Report-To header configuration for CSP Level 3
 */
export const reportToHeader = {
    group: 'csp-endpoint',
    max_age: 86400, // 24 hours
    endpoints: [
        {
            url: '/api/csp-report',
        },
    ],
    include_subdomains: true,
};

/**
 * Convert CSP directives object to CSP header string
 */
export function buildCSPHeader(directives: CSPDirectives, includeReporting: boolean = false): string {
    const policies: string[] = [];

    for (const [directive, values] of Object.entries(directives)) {
        if (values.length === 0) {
            policies.push(directive);
        } else {
            policies.push(`${directive} ${values.join(' ')}`);
        }
    }

    if (includeReporting) {
        if (cspReporting['report-uri']) {
            policies.push(`report-uri ${cspReporting['report-uri']}`);
        }
        if (cspReporting['report-to']) {
            policies.push(`report-to ${cspReporting['report-to']}`);
        }
    }

    return policies.join('; ') + ';';
}

/**
 * Generate CSP nonce for use in SSR
 * Call this for each request to generate a unique nonce
 */
export function generateNonce(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array));
}

/**
 * Add nonce to CSP directives
 */
export function addNonceToCSP(directives: CSPDirectives, nonce: string): CSPDirectives {
    const withNonce = { ...directives };

    if (withNonce['script-src']) {
        withNonce['script-src'] = [
            ...withNonce['script-src'].filter((v) => v !== "'unsafe-inline'"),
            `'nonce-${nonce}'`,
        ];
    }

    if (withNonce['style-src']) {
        withNonce['style-src'] = [
            ...withNonce['style-src'].filter((v) => v !== "'unsafe-inline'"),
            `'nonce-${nonce}'`,
        ];
    }

    return withNonce;
}

/**
 * Other security headers configuration
 */
export const securityHeaders = {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '0', // Modern browsers rely on CSP instead
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy':
        'geolocation=(), microphone=(), camera=(), payment=(), usb=(), bluetooth=(), interest-cohort=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
};

/**
 * Development CSP (more permissive for debugging)
 */
export const devCSP: CSPDirectives = {
    ...baseCSP,
    'script-src': [...(baseCSP['script-src'] || []), "'unsafe-eval'"], // Allow eval for dev tools
    'connect-src': [...(baseCSP['connect-src'] || []), 'ws:', 'wss:', 'http://localhost:*'],
};
