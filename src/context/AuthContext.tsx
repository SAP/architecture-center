import React, {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { logger } from '../utils/logger';
import {
    clearLegacyClientCredentials,
    clearSessionClientState,
    endSession,
    getSession,
    SESSION_INVALIDATED_EVENT,
    SupersededSessionRequestError,
} from '../services/authSession';
import type {
    AuthProvider as AuthProviderName,
    SessionSnapshot,
    SessionUser,
    SessionUsers,
} from '../services/authSession';

interface AuthContextType {
    user: SessionUser | null;
    users: SessionUsers;
    loading: boolean;
    logout: (provider?: AuthProviderName | 'all') => Promise<void>;
    hasDualLogin: boolean;
    refreshSession: () => Promise<void>;
}

const EMPTY_USERS: SessionUsers = { github: null, btp: null };
const AuthContext = createContext<AuthContextType | undefined>(undefined);

function activeUser(snapshot: SessionSnapshot): SessionUser | null {
    if (snapshot.activeProvider) {
        const selectedUser = snapshot.users[snapshot.activeProvider];
        if (selectedUser) return selectedUser;
    }
    return snapshot.users.github || snapshot.users.btp;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return (
            <AuthContext.Provider
                value={{
                    user: null,
                    users: EMPTY_USERS,
                    loading: true,
                    logout: async () => {},
                    hasDualLogin: false,
                    refreshSession: async () => {},
                }}
            >
                {children}
            </AuthContext.Provider>
        );
    }

    return <AuthLogicProvider>{children}</AuthLogicProvider>;
};

const AuthLogicProvider = ({ children }: { children: ReactNode }) => {
    const { siteConfig } = useDocusaurusContext();
    const [user, setUser] = useState<SessionUser | null>(null);
    const [users, setUsers] = useState<SessionUsers>(EMPTY_USERS);
    const [loading, setLoading] = useState(true);
    const requestRevision = useRef(0);
    const logoutRevision = useRef<number | null>(null);
    const authApiPath = siteConfig.customFields?.authApiPath as string;
    const baseUrl = siteConfig.baseUrl || '/';

    const applySession = useCallback((snapshot: SessionSnapshot) => {
        setUsers(snapshot.users);
        setUser(activeUser(snapshot));
    }, []);

    const refreshSession = useCallback(async () => {
        if (logoutRevision.current !== null) return;
        const revision = ++requestRevision.current;
        try {
            const snapshot = await getSession(authApiPath);
            if (revision !== requestRevision.current) return;
            applySession(snapshot);
        } catch (error) {
            if (revision !== requestRevision.current || error instanceof SupersededSessionRequestError) return;
            clearSessionClientState();
            setUsers(EMPTY_USERS);
            setUser(null);
            logger.warn('Unable to load the authentication session.', error);
        } finally {
            if (revision === requestRevision.current) setLoading(false);
        }
    }, [applySession, authApiPath]);

    useEffect(() => {
        // Remove secrets left by the retired browser-token flow. New logins never
        // place credentials in URLs or Web Storage.
        clearLegacyClientCredentials();
        void refreshSession();

        const refreshVisibleSession = () => {
            if (document.visibilityState === 'visible') {
                void refreshSession();
            }
        };
        const invalidateSession = () => {
            requestRevision.current += 1;
            logoutRevision.current = null;
            setUsers(EMPTY_USERS);
            setUser(null);
            setLoading(true);
            refreshVisibleSession();
        };
        window.addEventListener('focus', refreshVisibleSession);
        window.addEventListener(SESSION_INVALIDATED_EVENT, invalidateSession);
        document.addEventListener('visibilitychange', refreshVisibleSession);
        return () => {
            requestRevision.current += 1;
            clearSessionClientState();
            window.removeEventListener('focus', refreshVisibleSession);
            window.removeEventListener(SESSION_INVALIDATED_EVENT, invalidateSession);
            document.removeEventListener('visibilitychange', refreshVisibleSession);
        };
    }, [refreshSession]);

    const logout = useCallback(async (provider: AuthProviderName | 'all' = 'all') => {
        if (logoutRevision.current !== null) return;
        const revision = ++requestRevision.current;
        logoutRevision.current = revision;
        setLoading(true);
        const returnTo = window.location.origin + baseUrl;
        let redirecting = false;

        try {
            const result = await endSession(authApiPath, provider, returnTo);
            if (revision !== requestRevision.current) return;
            applySession(result);

            if (result.redirectTo) {
                redirecting = true;
                window.location.assign(result.redirectTo);
                return;
            }
            if (provider === 'all' || (!result.users.github && !result.users.btp)) {
                redirecting = true;
                window.location.assign(baseUrl);
                return;
            }
        } catch (error) {
            if (revision !== requestRevision.current || error instanceof SupersededSessionRequestError) return;
            logger.error('Unable to end the authentication session.', error);
            logoutRevision.current = null;
            await refreshSession();
            return;
        } finally {
            if (logoutRevision.current === revision) logoutRevision.current = null;
            if (revision === requestRevision.current && !redirecting) setLoading(false);
        }
    }, [applySession, authApiPath, baseUrl, refreshSession]);

    const hasDualLogin = users.github !== null && users.btp !== null;

    return (
        <AuthContext.Provider value={{ user, users, loading, logout, hasDualLogin, refreshSession }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
