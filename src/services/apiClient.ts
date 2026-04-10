/**
 * Base API client with authentication and error handling
 */

// Auth configuration for testing with basic auth
interface AuthConfig {
    mode: 'jwt' | 'basic';
    basicCredentials?: {
        username: string;
        password: string;
    };
}

// Default to JWT auth, can be overridden for testing
let authConfig: AuthConfig = { mode: 'jwt' };

/**
 * Set auth mode for API requests
 * For testing with basic auth: setAuthConfig({ mode: 'basic', basicCredentials: { username: 'alice', password: '...' } })
 */
export function setAuthConfig(config: AuthConfig): void {
    authConfig = config;
}

/**
 * Get current auth config
 */
export function getAuthConfig(): AuthConfig {
    return authConfig;
}

export class ApiError extends Error {
    constructor(
        message: string,
        public statusCode: number,
        public code?: string,
        public retryable: boolean = false
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

export class NetworkError extends ApiError {
    constructor(message = 'Network error. Please check your connection.') {
        super(message, 0, 'NETWORK_ERROR', true);
        this.name = 'NetworkError';
    }
}

export class AuthError extends ApiError {
    constructor(message = 'Authentication required. Please log in again.') {
        super(message, 401, 'AUTH_ERROR', false);
        this.name = 'AuthError';
    }
}

export class PermissionError extends ApiError {
    constructor(message = 'You do not have permission to perform this action.') {
        super(message, 403, 'PERMISSION_ERROR', false);
        this.name = 'PermissionError';
    }
}

export class NotFoundError extends ApiError {
    constructor(message = 'The requested resource was not found.') {
        super(message, 404, 'NOT_FOUND', false);
        this.name = 'NotFoundError';
    }
}

export class ValidationError extends ApiError {
    constructor(message: string) {
        super(message, 400, 'VALIDATION_ERROR', false);
        this.name = 'ValidationError';
    }
}

function getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;

    const storedData = localStorage.getItem('jwt_token');
    if (!storedData) return null;

    try {
        // Token is stored as JSON: { token: "...", expiresAt: ... }
        const parsed = JSON.parse(storedData);
        if (parsed.token && parsed.expiresAt && Date.now() < parsed.expiresAt) {
            return parsed.token;
        }
        // Token expired
        return null;
    } catch {
        // If it's not valid JSON, it might be a raw token (legacy)
        return storedData;
    }
}

function getAuthHeader(): string | null {
    if (authConfig.mode === 'basic' && authConfig.basicCredentials) {
        const { username, password } = authConfig.basicCredentials;
        const encoded = btoa(`${username}:${password}`);
        return `Basic ${encoded}`;
    }

    // JWT mode
    const token = getAuthToken();
    if (token) {
        return `Bearer ${token}`;
    }

    return null;
}

function transformError(response: Response, data: any): ApiError {
    const message = data?.error?.message || data?.error || data?.message || `Request failed with status ${response.status}`;

    switch (response.status) {
        case 400:
            return new ValidationError(message);
        case 401:
            return new AuthError(message);
        case 403:
            return new PermissionError(message);
        case 404:
            return new NotFoundError(message);
        default:
            return new ApiError(message, response.status, undefined, response.status >= 500);
    }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
    body?: any;
    skipAuth?: boolean;
}

export async function apiRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { body, skipAuth = false, headers: customHeaders, ...fetchOptions } = options;

    const headers: HeadersInit = {
        ...customHeaders,
    };

    if (!skipAuth) {
        const authHeader = getAuthHeader();
        if (authHeader) {
            (headers as Record<string, string>)['Authorization'] = authHeader;
        }
    }

    if (body && !(body instanceof FormData) && !(body instanceof Blob)) {
        (headers as Record<string, string>)['Content-Type'] = 'application/json';
    }

    const requestBody = body && !(body instanceof FormData) && !(body instanceof Blob) ? JSON.stringify(body) : body;

    try {
        const response = await fetch(endpoint, {
            ...fetchOptions,
            headers,
            body: requestBody,
        });

        // Handle 204 No Content
        if (response.status === 204) {
            return undefined as T;
        }

        // Try to parse JSON response
        let data: any;
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('application/json')) {
            data = await response.json();
        } else {
            data = await response.text();
        }

        if (!response.ok) {
            throw transformError(response, data);
        }

        return data as T;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        // Network errors (fetch throws TypeError for network issues)
        throw new NetworkError((error as Error).message);
    }
}

/**
 * Upload binary content to a specific endpoint
 */
export async function uploadBinary(endpoint: string, content: Blob, mediaType: string): Promise<void> {
    const authHeader = getAuthHeader();
    const headers: HeadersInit = {
        'Content-Type': mediaType,
    };

    if (authHeader) {
        (headers as Record<string, string>)['Authorization'] = authHeader;
    }

    try {
        const response = await fetch(endpoint, {
            method: 'PUT',
            headers,
            body: content,
        });

        if (!response.ok) {
            let data: any;
            try {
                data = await response.json();
            } catch {
                data = { message: `Upload failed with status ${response.status}` };
            }
            throw transformError(response, data);
        }
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new NetworkError((error as Error).message);
    }
}

/**
 * Download binary content from an endpoint
 */
export async function downloadBinary(endpoint: string): Promise<{ blob: Blob; mediaType: string }> {
    const authHeader = getAuthHeader();
    const headers: HeadersInit = {};

    if (authHeader) {
        (headers as Record<string, string>)['Authorization'] = authHeader;
    }

    try {
        const response = await fetch(endpoint, {
            method: 'GET',
            headers,
        });

        if (!response.ok) {
            let data: any;
            try {
                data = await response.json();
            } catch {
                data = { message: `Download failed with status ${response.status}` };
            }
            throw transformError(response, data);
        }

        const blob = await response.blob();
        const mediaType = response.headers.get('content-type') || 'application/octet-stream';

        return { blob, mediaType };
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new NetworkError((error as Error).message);
    }
}
