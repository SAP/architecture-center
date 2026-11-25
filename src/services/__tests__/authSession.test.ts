import {
    authenticatedFetch,
    clearLegacyClientCredentials,
    clearSessionClientState,
    endSession,
    getLoginUrl,
    getSafeReturnPath,
    getSession,
    SESSION_INVALIDATED_EVENT,
    SupersededSessionRequestError,
} from '../authSession';

function response(status: number, body?: unknown): Response {
    return {
        status,
        ok: status >= 200 && status < 300,
        json: jest.fn().mockResolvedValue(body),
    } as unknown as Response;
}

function deferred<T>() {
    let resolve!: (value: T) => void;
    let reject!: (reason: unknown) => void;
    const promise = new Promise<T>((resolvePromise, rejectPromise) => {
        resolve = resolvePromise;
        reject = rejectPromise;
    });
    return { promise, resolve, reject };
}

function githubSession(username: string, csrfToken = `csrf-${username}-at-least-16-characters`) {
    return {
        users: { github: { username, provider: 'github' }, btp: null },
        activeProvider: 'github',
        csrfToken,
    };
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

    it.each([
        'http://localhost//attacker.example/steal',
        '/.//attacker.example/steal',
        '//attacker.example/steal',
    ])('does not turn %s into a protocol-relative redirect', (returnTo) => {
        expect(getSafeReturnPath(returnTo)).toBe('/');
        expect(new URL(getSafeReturnPath(returnTo), window.location.origin).origin).toBe(window.location.origin);
    });

    it('rejects cross-origin authentication endpoints', () => {
        expect(() => getLoginUrl('https://backend.example/api/auth', 'btp', '/docs')).toThrow(
            'Authentication endpoints must be served from the site origin.',
        );
    });

    it.each(['/.//attacker.example', 'http://localhost//attacker.example'])(
        'rejects an authentication endpoint that normalizes to a protocol-relative path: %s', (endpoint) => {
            expect(() => getLoginUrl(endpoint, 'github', '/docs')).toThrow('protocol-relative path');
        },
    );

    it('rejects credential-bearing same-origin authentication URLs', async () => {
        expect(() => getLoginUrl('http://user:secret@localhost/api/auth', 'github', '/docs')).toThrow(
            'Credentials must not be sent in authentication URLs',
        );
        await expect(authenticatedFetch('http://user:secret@localhost/api/backend/documents')).rejects.toThrow(
            'Credentials must not be sent in authentication URLs',
        );
        expect(fetchMock).not.toHaveBeenCalled();
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

    it('prevents API redirects from forwarding protected headers and bodies to another origin', async () => {
        fetchMock.mockResolvedValueOnce(response(200, githubSession('account-a')));
        await getSession('/api/auth');
        fetchMock.mockResolvedValueOnce(response(204));
        await authenticatedFetch('/api/backend/documents', { method: 'POST', body: '{}', redirect: 'follow' });
        expect(fetchMock.mock.calls[1][1].redirect).toBe('error');
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

    it('discards a late session response instead of restoring a previous account and CSRF token', async () => {
        const olderResponse = deferred<Response>();
        fetchMock.mockReturnValueOnce(olderResponse.promise);
        const olderSession = getSession('/api/auth');
        const discarded = expect(olderSession).rejects.toBeInstanceOf(SupersededSessionRequestError);

        fetchMock.mockResolvedValueOnce(response(200, githubSession('account-b')));
        expect((await getSession('/api/auth')).users.github?.username).toBe('account-b');
        olderResponse.resolve(response(200, githubSession('account-a')));
        await discarded;

        fetchMock.mockResolvedValueOnce(response(204));
        await authenticatedFetch('/api/backend/documents', { method: 'PATCH' });
        expect(new Headers(fetchMock.mock.calls[2][1].headers).get('X-CSRF-Token')).toBe(
            githubSession('account-b').csrfToken,
        );
    });

    it('does not let a late failed refresh clear a newer session', async () => {
        const olderResponse = deferred<Response>();
        fetchMock.mockReturnValueOnce(olderResponse.promise);
        const discarded = expect(getSession('/api/auth')).rejects.toBeInstanceOf(SupersededSessionRequestError);
        fetchMock.mockResolvedValueOnce(response(200, githubSession('account-b')));
        await getSession('/api/auth');
        olderResponse.reject(new Error('Earlier request failed'));
        await discarded;

        fetchMock.mockResolvedValueOnce(response(204));
        await expect(authenticatedFetch('/api/backend/documents', { method: 'DELETE' })).resolves.toHaveProperty(
            'status', 204,
        );
    });

    it('does not restore CSRF state from JSON that completes after session invalidation', async () => {
        const body = deferred<unknown>();
        fetchMock.mockResolvedValueOnce({ ...response(200), json: () => body.promise });
        const discarded = expect(getSession('/api/auth')).rejects.toBeInstanceOf(SupersededSessionRequestError);
        await Promise.resolve();
        clearSessionClientState();
        body.resolve(githubSession('account-a'));
        await discarded;

        await expect(authenticatedFetch('/api/backend/documents', { method: 'PATCH' })).rejects.toThrow(
            'without a CSRF token',
        );
    });

    it('ignores a protected request denial from a previous session', async () => {
        fetchMock.mockResolvedValueOnce(response(200, githubSession('account-a')));
        await getSession('/api/auth');
        const oldResponse = deferred<Response>();
        fetchMock.mockReturnValueOnce(oldResponse.promise);
        const oldRequest = authenticatedFetch('/api/backend/documents');
        fetchMock.mockResolvedValueOnce(response(200, githubSession('account-b')));
        await getSession('/api/auth');

        const listener = jest.fn();
        window.addEventListener(SESSION_INVALIDATED_EVENT, listener);
        try {
            oldResponse.resolve(response(401));
            await oldRequest;
            expect(listener).not.toHaveBeenCalled();
            fetchMock.mockResolvedValueOnce(response(204));
            await authenticatedFetch('/api/backend/documents', { method: 'PATCH' });
            expect(new Headers(fetchMock.mock.calls[3][1].headers).get('X-CSRF-Token')).toBe(
                githubSession('account-b').csrfToken,
            );
        } finally {
            window.removeEventListener(SESSION_INVALIDATED_EVENT, listener);
        }
    });

    it('invalidates pending refreshes and blocks mutations while logout establishes the remaining session', async () => {
        fetchMock.mockResolvedValueOnce(response(200, githubSession('account-a')));
        await getSession('/api/auth');
        const oldResponse = deferred<Response>();
        fetchMock.mockReturnValueOnce(oldResponse.promise);
        const discarded = expect(getSession('/api/auth')).rejects.toBeInstanceOf(SupersededSessionRequestError);
        const logoutResponse = deferred<Response>();
        fetchMock.mockReturnValueOnce(logoutResponse.promise);
        const logout = endSession('/api/auth', 'github', '/docs');

        expect(new Headers(fetchMock.mock.calls[2][1].headers).get('X-CSRF-Token')).toBe(
            githubSession('account-a').csrfToken,
        );
        await expect(authenticatedFetch('/api/backend/documents', { method: 'PATCH' })).rejects.toThrow(
            'without a CSRF token',
        );
        oldResponse.resolve(response(200, githubSession('account-a')));
        await discarded;
        logoutResponse.resolve(response(200, { users: { github: null, btp: null } }));
        expect((await logout).users.github).toBeNull();
        await expect(authenticatedFetch('/api/backend/documents', { method: 'PATCH' })).rejects.toThrow(
            'without a CSRF token',
        );
    });

    it('retains only the remaining provider and its rotated CSRF token after partial logout', async () => {
        fetchMock.mockResolvedValueOnce(response(200, githubSession('account-a')));
        await getSession('/api/auth');
        const remaining = {
            users: { github: null, btp: { username: 'btp-user', provider: 'btp' } },
            activeProvider: 'btp',
            csrfToken: 'rotated-btp-csrf-token',
            redirectTo: 'http://localhost//attacker.example/logout',
        };
        fetchMock.mockResolvedValueOnce(response(200, remaining));
        expect(await endSession('/api/auth', 'github', '/docs')).toEqual({ ...remaining, redirectTo: '/' });
        fetchMock.mockResolvedValueOnce(response(204));
        await authenticatedFetch('/api/auth/logout', { method: 'POST' });
        expect(new Headers(fetchMock.mock.calls[2][1].headers).get('X-CSRF-Token')).toBe(remaining.csrfToken);
    });

    it('clears CSRF protection when the current session response is malformed', async () => {
        fetchMock.mockResolvedValueOnce(response(200, githubSession('account-a')));
        await getSession('/api/auth');
        fetchMock.mockResolvedValueOnce(response(200, { users: [] }));
        await expect(getSession('/api/auth')).rejects.toThrow('Invalid github user');
        await expect(authenticatedFetch('/api/backend/documents', { method: 'PATCH' })).rejects.toThrow(
            'without a CSRF token',
        );
    });

    it('does not accept a new CSRF token from a malformed logout response', async () => {
        fetchMock.mockResolvedValueOnce(response(200, githubSession('account-a')));
        await getSession('/api/auth');
        fetchMock.mockResolvedValueOnce(response(200, { ...githubSession('account-b'), redirectTo: 42 }));
        await expect(endSession('/api/auth', 'github', '/docs')).rejects.toThrow('Invalid logout redirect');
        await expect(authenticatedFetch('/api/backend/documents', { method: 'PATCH' })).rejects.toThrow(
            'without a CSRF token',
        );
    });
});
