/**
 * Input sanitization utilities for XSS prevention
 *
 * SECURITY PURPOSE:
 * - Prevent Cross-Site Scripting (XSS) attacks
 * - Sanitize user input before rendering or processing
 * - Validate and clean data from external sources
 *
 * NOTE: React automatically escapes JSX content, but these utilities
 * are useful for:
 * - dangerouslySetInnerHTML scenarios
 * - URL parameters
 * - API request/response data
 * - File names and paths
 */

/**
 * Sanitize HTML string by removing dangerous tags and attributes
 * Use this when you must render user-provided HTML (avoid when possible)
 */
export function sanitizeHtml(html: string): string {
    // Create a temporary div to parse HTML
    const temp = document.createElement('div');
    temp.textContent = html;
    return temp.innerHTML;
}

/**
 * Sanitize string for use in URLs to prevent injection attacks
 */
export function sanitizeUrl(url: string): string {
    // Remove any protocol that isn't http/https/mailto
    const urlPattern = /^(https?:\/\/|mailto:)/i;

    if (!urlPattern.test(url)) {
        // If URL doesn't start with safe protocol, treat as relative path
        return url.replace(/[^\w\-./]/g, '');
    }

    // Block javascript: and data: protocols
    if (/^(javascript|data|vbscript):/i.test(url)) {
        return '';
    }

    return url;
}

/**
 * Sanitize file name to prevent path traversal attacks
 */
export function sanitizeFileName(fileName: string): string {
    // Remove path separators and null bytes
    let sanitized = fileName.replace(/[\/\\:\0]/g, '');

    // Remove leading dots to prevent hidden files
    sanitized = sanitized.replace(/^\.+/, '');

    // Limit length
    if (sanitized.length > 255) {
        const ext = sanitized.split('.').pop() || '';
        const name = sanitized.substring(0, 255 - ext.length - 1);
        sanitized = `${name}.${ext}`;
    }

    return sanitized || 'unnamed';
}

/**
 * Sanitize email address
 */
export function sanitizeEmail(email: string): string {
    // Basic email validation and sanitization
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailPattern.test(email)) {
        return '';
    }

    return email.toLowerCase().trim();
}

/**
 * Escape special characters for use in RegExp
 */
export function escapeRegExp(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Sanitize string for use as HTML attribute value
 */
export function sanitizeAttribute(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

/**
 * Remove all HTML tags from a string
 */
export function stripHtml(html: string): string {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || '';
}

/**
 * Validate and sanitize URL parameters
 */
export function sanitizeUrlParams(params: Record<string, unknown>): Record<string, string> {
    const sanitized: Record<string, string> = {};

    for (const [key, value] of Object.entries(params)) {
        // Only allow alphanumeric keys
        const sanitizedKey = key.replace(/[^a-zA-Z0-9_]/g, '');

        // Convert value to string and encode
        if (value !== null && value !== undefined) {
            sanitized[sanitizedKey] = encodeURIComponent(String(value));
        }
    }

    return sanitized;
}

/**
 * Validate input length to prevent DoS attacks via large inputs
 */
export function validateInputLength(
    input: string,
    maxLength: number,
    fieldName: string = 'Input'
): { valid: boolean; error?: string; sanitized: string } {
    if (input.length > maxLength) {
        return {
            valid: false,
            error: `${fieldName} exceeds maximum length of ${maxLength} characters`,
            sanitized: input.substring(0, maxLength),
        };
    }

    return {
        valid: true,
        sanitized: input,
    };
}

/**
 * Sanitize object keys to prevent prototype pollution
 */
export function sanitizeObjectKeys<T extends Record<string, unknown>>(obj: T): Partial<T> {
    const sanitized: Record<string, unknown> = {};
    const dangerousKeys = ['__proto__', 'constructor', 'prototype'];

    for (const [key, value] of Object.entries(obj)) {
        // Check both exact case and lowercase to prevent bypass attempts
        if (!dangerousKeys.includes(key) && !dangerousKeys.includes(key.toLowerCase())) {
            sanitized[key] = value;
        }
    }

    return sanitized as Partial<T>;
}

/**
 * Validate and sanitize JWT token format (doesn't verify signature)
 */
export function validateTokenFormat(token: string): { valid: boolean; error?: string } {
    // JWT should have 3 parts separated by dots
    const parts = token.split('.');

    if (parts.length !== 3) {
        return { valid: false, error: 'Invalid token format' };
    }

    // Check if parts are base64url encoded
    const base64UrlPattern = /^[A-Za-z0-9_-]+$/;

    for (const part of parts) {
        if (!base64UrlPattern.test(part)) {
            return { valid: false, error: 'Invalid token encoding' };
        }
    }

    return { valid: true };
}

/**
 * Sanitize JSON input to prevent injection
 */
export function sanitizeJson(jsonString: string): { valid: boolean; data?: unknown; error?: string } {
    try {
        const parsed = JSON.parse(jsonString);

        // Prevent prototype pollution
        const sanitized = sanitizeObjectKeys(parsed);

        return { valid: true, data: sanitized };
    } catch (error) {
        return {
            valid: false,
            error: error instanceof Error ? error.message : 'Invalid JSON',
        };
    }
}

/**
 * Pre-configured validators for common scenarios
 */
export const validators = {
    /** Validate username (alphanumeric, dash, underscore, 3-30 chars) */
    username: (username: string) => /^[a-zA-Z0-9_-]{3,30}$/.test(username),

    /** Validate email */
    email: (email: string) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email),

    /** Validate URL */
    url: (url: string) => {
        try {
            const parsed = new URL(url);
            return ['http:', 'https:'].includes(parsed.protocol);
        } catch {
            return false;
        }
    },

    /** Validate hex color */
    hexColor: (color: string) => /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color),

    /** Validate slug (URL-friendly string) */
    slug: (slug: string) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug),
};
