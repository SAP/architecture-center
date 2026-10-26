export type AuthProvider = 'github' | 'btp';

export interface SessionUser {
    username: string;
    email?: string;
    avatar?: string;
    provider: AuthProvider;
}

export interface SessionUsers {
    github: SessionUser | null;
    btp: SessionUser | null;
}

export interface SessionSnapshot {
    users: SessionUsers;
    activeProvider?: AuthProvider;
    csrfToken?: string;
}

interface LogoutResponse extends SessionSnapshot {
    redirectTo?: string;
}

interface AuthenticatedRequestInit extends RequestInit {
    suppressSessionInvalidation?: boolean;
}

const EMPTY_USERS: SessionUsers = { github: null, btp: null };
const LEGACY_AUTH_STORAGE_KEYS = [
    'jwt_token',
    'sap-architecture-center',
    'sap-architecture-center-dev',
];
const LEGACY_AUTH_QUERY_PARAMETERS = ['token', 't', 'access_token', 'id_token'];
const UNSAFE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
export const SESSION_INVALIDATED_EVENT = 'architecture-center:session-invalidated';

let csrfToken: string | null = null;

export function clearSessionClientState(): void {
    csrfToken = null;
}

function browserOrigin(): string {
    if (typeof window === 'undefined') {
        throw new Error('Authenticated requests are only available in the browser.');
    }
    return window.location.origin;
}

function sameOriginUrl(value: string | URL): URL {
    const origin = browserOrigin();
    const url = new URL(value.toString(), origin);
    if (url.origin !== origin) {
        throw new Error('Authentication endpoints must be served from the site origin.');
    }
    return url;
}

function stripCredentialParameters(url: URL): boolean {
    let changed = false;
    for (const parameter of LEGACY_AUTH_QUERY_PARAMETERS) {
        if (url.searchParams.has(parameter)) {
            url.searchParams.delete(parameter);
            changed = true;
        }
    }

    if (!url.hash) return changed;

    const fragment = new URLSearchParams(url.hash.slice(1));
    let fragmentChanged = false;
    for (const parameter of LEGACY_AUTH_QUERY_PARAMETERS) {
        if (fragment.has(parameter)) {
            fragment.delete(parameter);
            changed = true;
            fragmentChanged = true;
        }
    }
    if (fragmentChanged) {
        const nextHash = fragment.toString();
        url.hash = nextHash ? `#${nextHash}` : '';
    }

    return changed;
}

function userForProvider(value: unknown, provider: AuthProvider): SessionUser | null {
    if (value === null) return null;
    if (!value || typeof value !== 'object') {
        throw new Error(`Invalid ${provider} user in session response.`);
    }

    const candidate = value as Record<string, unknown>;
    if (typeof candidate.username !== 'string' || candidate.username.length === 0) {
        throw new Error(`Invalid ${provider} username in session response.`);
    }
    if (candidate.provider !== provider) {
        throw new Error(`Invalid ${provider} provider in session response.`);
    }
    if (candidate.email !== undefined && typeof candidate.email !== 'string') {
        throw new Error(`Invalid ${provider} email in session response.`);
    }
    if (candidate.avatar !== undefined && typeof candidate.avatar !== 'string') {
        throw new Error(`Invalid ${provider} avatar in session response.`);
    }

    return {
        username: candidate.username,
        provider,
        ...(candidate.email ? { email: candidate.email as string } : {}),
        ...(candidate.avatar ? { avatar: candidate.avatar as string } : {}),
    };
}

function parseSessionSnapshot(value: unknown): SessionSnapshot {
    if (!value || typeof value !== 'object') {
        throw new Error('Invalid session response.');
    }

    const candidate = value as Record<string, unknown>;
    if (!candidate.users || typeof candidate.users !== 'object') {
        throw new Error('Session response is missing users.');
    }
    const candidateUsers = candidate.users as Record<string, unknown>;
    const users: SessionUsers = {
        github: userForProvider(candidateUsers.github, 'github'),
        btp: userForProvider(candidateUsers.btp, 'btp'),
    };

    const activeProvider = candidate.activeProvider;
    if (activeProvider !== undefined && activeProvider !== 'github' && activeProvider !== 'btp') {
        throw new Error('Invalid active provider in session response.');
    }

    const responseCsrfToken = candidate.csrfToken;
    const hasAuthenticatedUser = users.github !== null || users.btp !== null;
    if (hasAuthenticatedUser && (typeof responseCsrfToken !== 'string' || responseCsrfToken.length < 16)) {
        throw new Error('Authenticated session response is missing a CSRF token.');
    }
    if (responseCsrfToken !== undefined && typeof responseCsrfToken !== 'string') {
        throw new Error('Invalid CSRF token in session response.');
    }

    return {
        users,
        ...(activeProvider ? { activeProvider } : {}),
        ...(responseCsrfToken ? { csrfToken: responseCsrfToken } : {}),
    };
}

function rememberCsrfToken(snapshot: SessionSnapshot): SessionSnapshot {
    csrfToken = snapshot.csrfToken || null;
    return snapshot;
}

export function getSafeReturnPath(value: string, fallback = '/'): string {
    try {
        const url = sameOriginUrl(value);
        stripCredentialParameters(url);
        return `${url.pathname}${url.search}${url.hash}`;
    } catch {
        return fallback;
    }
}

export function getLoginUrl(authApiPath: string, provider: AuthProvider, returnTo: string): string {
    const url = sameOriginUrl(`${authApiPath.replace(/\/$/, '')}/login`);
    url.searchParams.set('provider', provider);
    url.searchParams.set('returnTo', getSafeReturnPath(returnTo));
    return `${url.pathname}${url.search}`;
}

export function clearLegacyClientCredentials(): void {
    if (typeof window === 'undefined') return;

    try {
        for (const key of LEGACY_AUTH_STORAGE_KEYS) {
            window.localStorage.removeItem(key);
        }
    } catch {
        // Storage can be unavailable under strict browser privacy settings.
    }

    const url = new URL(window.location.href);
    if (stripCredentialParameters(url)) {
        window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
    }
}

export async function authenticatedFetch(
    input: string | URL,
    init: AuthenticatedRequestInit = {},
): Promise<Response> {
    const { suppressSessionInvalidation = false, ...requestInit } = init;
    const url = sameOriginUrl(input);
    if (LEGACY_AUTH_QUERY_PARAMETERS.some((parameter) => url.searchParams.has(parameter))) {
        throw new Error('Credentials must not be sent in authenticated request URLs.');
    }
    const method = (requestInit.method || 'GET').toUpperCase();
    const headers = new Headers(requestInit.headers);
    headers.delete('Authorization');
    headers.delete('Cookie');

    if (UNSAFE_METHODS.has(method)) {
        if (!csrfToken) {
            throw new Error('Cannot send an authenticated mutation without a CSRF token.');
        }
        headers.set('X-CSRF-Token', csrfToken);
    }

    const response = await fetch(url.toString(), {
        ...requestInit,
        headers,
        credentials: 'same-origin',
        cache: 'no-store',
    });

    if (response.status === 401 && !suppressSessionInvalidation) {
        clearSessionClientState();
        window.dispatchEvent(new Event(SESSION_INVALIDATED_EVENT));
    }

    return response;
}

export async function getSession(authApiPath: string): Promise<SessionSnapshot> {
    const response = await authenticatedFetch(`${authApiPath.replace(/\/$/, '')}/session`, {
        cache: 'no-store',
        headers: { Accept: 'application/json' },
        suppressSessionInvalidation: true,
    });

    if (response.status === 401) {
        return rememberCsrfToken({ users: { ...EMPTY_USERS } });
    }
    if (!response.ok) {
        throw new Error(`Session check failed with status ${response.status}.`);
    }

    return rememberCsrfToken(parseSessionSnapshot(await response.json()));
}

export async function endSession(
    authApiPath: string,
    provider: AuthProvider | 'all',
    returnTo: string,
): Promise<LogoutResponse> {
    const response = await authenticatedFetch(`${authApiPath.replace(/\/$/, '')}/logout`, {
        method: 'POST',
        cache: 'no-store',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ provider, returnTo: getSafeReturnPath(returnTo) }),
    });

    if (!response.ok) {
        throw new Error(`Logout failed with status ${response.status}.`);
    }

    const body = await response.json() as Record<string, unknown>;
    const snapshot = rememberCsrfToken(parseSessionSnapshot(body));
    const redirectTo = body.redirectTo;
    if (redirectTo !== undefined && typeof redirectTo !== 'string') {
        throw new Error('Invalid logout redirect in session response.');
    }

    return {
        ...snapshot,
        ...(redirectTo ? { redirectTo: getSafeReturnPath(redirectTo) } : {}),
    };
}
