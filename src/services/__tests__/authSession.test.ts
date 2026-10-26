import {
    authenticatedFetch,
    clearLegacyClientCredentials,
    getLoginUrl,
    getSafeReturnPath,
    getSession,
    SESSION_INVALIDATED_EVENT,
} from '../authSession';

function response(status: number, body?: unknown): Response {
    return {
        status,
        ok: status >= 200 && status < 300,
        json: jest.fn().mockResolvedValue(body),
    } as unknown as Response;
}

describe('authSession', () => {
    const fetchMock = jest.fn();

    beforeEach(async () => {
        fetchMock.mockReset();
        global.fetch = fetchMock as typeof fetch;
        window.history.replaceState(null, '', '/');
        window.localStorage.clear();

        fetchMock.mockResolvedValueOnce(response(401));
        await getSession('/api/auth');
        fetchMock.mockReset();
    });

    it('builds a same-origin login URL with a relative return path', () => {
        expect(getLoginUrl('/api/auth', 'github', 'http://localhost/quick-start?draft=1')).toBe(
            '/api/auth/login?provider=github&returnTo=%2Fquick-start%3Fdraft%3D1',
        );
        expect(getSafeReturnPath('https://attacker.example/steal')).toBe('/');
        expect(getSafeReturnPath('/quick-start?token=secret&draft=1')).toBe('/quick-start?draft=1');
    });

    it('rejects cross-origin authentication endpoints', () => {
        expect(() => getLoginUrl('https://backend.example/api/auth', 'btp', '/docs')).toThrow(
            'Authentication endpoints must be served from the site origin.',
        );
    });

    it('removes credentials left by the retired URL and Web Storage flow', () => {
        window.localStorage.setItem('jwt_token', 'secret');
        window.localStorage.setItem('sap-architecture-center', 'secret');
        window.history.replaceState(
            null,
            '',
            '/quick-start?token=secret&redirect=%2Fdocs#access_token=secret&section=intro',
        );

        clearLegacyClientCredentials();

        expect(window.localStorage.getItem('jwt_token')).toBeNull();
        expect(window.localStorage.getItem('sap-architecture-center')).toBeNull();
        expect(window.location.href).not.toContain('secret');
        expect(window.location.search).toContain('redirect=');
        expect(window.location.hash).toContain('section=intro');
    });

    it('uses the in-memory CSRF token for authenticated mutations', async () => {
        fetchMock.mockResolvedValueOnce(response(200, {
            users: {
                github: { username: 'octocat', provider: 'github' },
                btp: null,
            },
            activeProvider: 'github',
            csrfToken: 'csrf-token-at-least-16-characters',
        }));
        await getSession('/api/auth');

        fetchMock.mockResolvedValueOnce(response(204));
        await authenticatedFetch('/api/backend/documents', { method: 'PATCH' });

        const [, init] = fetchMock.mock.calls[1] as [string, RequestInit];
        expect(init.credentials).toBe('same-origin');
        expect(init.cache).toBe('no-store');
        expect(new Headers(init.headers).get('X-CSRF-Token')).toBe('csrf-token-at-least-16-characters');
    });

    it('blocks authenticated mutations before a CSRF token is available', async () => {
        await expect(authenticatedFetch('/api/backend/documents', { method: 'DELETE' })).rejects.toThrow(
            'Cannot send an authenticated mutation without a CSRF token.',
        );
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('never forwards browser-supplied authorization headers', async () => {
        fetchMock.mockResolvedValueOnce(response(200));
        await authenticatedFetch('/api/backend/documents', {
            headers: { Authorization: 'Bearer should-not-leave-the-browser' },
        });

        const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
        expect(new Headers(init.headers).has('Authorization')).toBe(false);
    });

    it('rejects credentials in protected API URLs', async () => {
        await expect(authenticatedFetch('/api/backend/documents?token=secret')).rejects.toThrow(
            'Credentials must not be sent in authenticated request URLs.',
        );
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('rejects authenticated sessions without CSRF protection', async () => {
        fetchMock.mockResolvedValueOnce(response(200, {
            users: {
                github: { username: 'octocat', provider: 'github' },
                btp: null,
            },
        }));

        await expect(getSession('/api/auth')).rejects.toThrow(
            'Authenticated session response is missing a CSRF token.',
        );
    });

    it('blocks protected API calls to another origin', async () => {
        await expect(authenticatedFetch('https://backend.example/documents')).rejects.toThrow(
            'Authentication endpoints must be served from the site origin.',
        );
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('notifies the application when a protected request loses its session', async () => {
        const listener = jest.fn();
        window.addEventListener(SESSION_INVALIDATED_EVENT, listener);
        fetchMock.mockResolvedValueOnce(response(401));

        await authenticatedFetch('/api/backend/documents');

        expect(listener).toHaveBeenCalledTimes(1);
        window.removeEventListener(SESSION_INVALIDATED_EVENT, listener);
    });
});
