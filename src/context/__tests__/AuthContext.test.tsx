import React from 'react';
import '@testing-library/jest-dom';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import { authenticatedFetch, clearSessionClientState } from '../../services/authSession';

jest.mock('../../utils/logger', () => ({ logger: { warn: jest.fn(), error: jest.fn() } }));

function response(status: number, body?: unknown): Response {
    return { status, ok: status >= 200 && status < 300, json: async () => body } as Response;
}

function session(username: string) {
    return {
        users: { github: { username, provider: 'github' }, btp: null },
        activeProvider: 'github',
        csrfToken: 'csrf-' + username + '-at-least-16-characters',
    };
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

describe('AuthProvider session changes', () => {
    const fetchMock = jest.fn();
    let auth!: ReturnType<typeof useAuth>;

    function Consumer() {
        auth = useAuth();
        return <div data-testid="session">{auth.loading ? 'loading' : auth.users.github?.username || 'logged-out'}</div>;
    }

    async function mountSession(username = 'account-a') {
        fetchMock.mockResolvedValueOnce(response(200, session(username)));
        render(<AuthProvider><Consumer /></AuthProvider>);
        await waitFor(() => expect(screen.getByTestId('session')).toHaveTextContent(username));
    }

    beforeEach(() => {
        clearSessionClientState();
        fetchMock.mockReset();
        global.fetch = fetchMock;
        jest.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');
    });

    afterEach(() => {
        cleanup();
        jest.restoreAllMocks();
    });

    it('keeps the newest account when overlapping refreshes finish out of order', async () => {
        await mountSession();
        const olderResponse = deferred<Response>();
        fetchMock.mockReturnValueOnce(olderResponse.promise);
        const olderRefresh = auth.refreshSession();
        fetchMock.mockResolvedValueOnce(response(200, session('account-b')));
        await act(async () => { await auth.refreshSession(); });
        expect(auth.users.github?.username).toBe('account-b');

        await act(async () => {
            olderResponse.resolve(response(200, session('account-a')));
            await olderRefresh;
        });
        expect(auth.users.github?.username).toBe('account-b');
        expect(auth.loading).toBe(false);
    });

    it('does not clear a new account when an older refresh fails', async () => {
        await mountSession();
        const olderResponse = deferred<Response>();
        fetchMock.mockReturnValueOnce(olderResponse.promise);
        const olderRefresh = auth.refreshSession();
        fetchMock.mockResolvedValueOnce(response(200, session('account-b')));
        await act(async () => { await auth.refreshSession(); });
        await act(async () => {
            olderResponse.reject(new Error('Earlier session request failed'));
            await olderRefresh;
        });
        expect(auth.users.github?.username).toBe('account-b');
        expect(auth.loading).toBe(false);
    });

    it('clears a hidden tab immediately on session invalidation and restores it only after a fresh check', async () => {
        await mountSession();
        jest.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
        fetchMock.mockResolvedValueOnce(response(401));
        await act(async () => { await authenticatedFetch('/api/backend/documents'); });

        expect(auth.user).toBeNull();
        expect(auth.users.github).toBeNull();
        expect(auth.loading).toBe(true);
        expect(fetchMock).toHaveBeenCalledTimes(2);

        jest.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');
        fetchMock.mockResolvedValueOnce(response(401));
        await act(async () => { document.dispatchEvent(new Event('visibilitychange')); });
        await waitFor(() => expect(auth.loading).toBe(false));
        expect(screen.getByTestId('session')).toHaveTextContent('logged-out');
    });

    it('withholds stale profile state while a visible tab rechecks an invalid session', async () => {
        await mountSession();
        const refreshResponse = deferred<Response>();
        fetchMock.mockResolvedValueOnce(response(401)).mockReturnValueOnce(refreshResponse.promise);
        await act(async () => { await authenticatedFetch('/api/backend/documents'); });
        expect(auth.users.github).toBeNull();
        expect(auth.loading).toBe(true);
        await act(async () => { refreshResponse.resolve(response(200, session('account-b'))); });
        await waitFor(() => expect(auth.users.github?.username).toBe('account-b'));
    });

    it('does not let focus events or older refreshes restore a provider during logout', async () => {
        fetchMock.mockResolvedValueOnce(response(200, {
            ...session('account-a'),
            users: { ...session('account-a').users, btp: { username: 'btp-user', provider: 'btp' } },
        }));
        render(<AuthProvider><Consumer /></AuthProvider>);
        await waitFor(() => expect(auth.hasDualLogin).toBe(true));

        const olderResponse = deferred<Response>();
        fetchMock.mockReturnValueOnce(olderResponse.promise);
        const olderRefresh = auth.refreshSession();
        const logoutResponse = deferred<Response>();
        fetchMock.mockReturnValueOnce(logoutResponse.promise);
        let logout!: Promise<void>;
        act(() => { logout = auth.logout('btp'); });
        act(() => { window.dispatchEvent(new Event('focus')); });
        expect(fetchMock).toHaveBeenCalledTimes(3);
        expect(auth.loading).toBe(true);
        await act(async () => {
            olderResponse.resolve(response(200, session('stale-account')));
            await olderRefresh;
        });
        expect(auth.loading).toBe(true);
        await act(async () => {
            logoutResponse.resolve(response(200, session('account-a')));
            await logout;
        });
        expect(auth.users.github?.username).toBe('account-a');
        expect(auth.users.btp).toBeNull();
        expect(auth.loading).toBe(false);
    });

    it('does not restore CSRF state when a session response arrives after unmount', async () => {
        const pendingResponse = deferred<Response>();
        fetchMock.mockReturnValueOnce(pendingResponse.promise);
        const view = render(<AuthProvider><Consumer /></AuthProvider>);
        view.unmount();
        await act(async () => { pendingResponse.resolve(response(200, session('account-a'))); });
        await expect(authenticatedFetch('/api/backend/documents', { method: 'PATCH' })).rejects.toThrow(
            'without a CSRF token',
        );
    });
});
