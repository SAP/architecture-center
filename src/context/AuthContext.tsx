import React, {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useState,
} from 'react';
import siteConfig from '@generated/docusaurus.config';
import { logger } from '../utils/logger';
import {
    clearLegacyClientCredentials,
    clearSessionClientState,
    endSession,
    getSession,
    SESSION_INVALIDATED_EVENT,
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
    const [user, setUser] = useState<SessionUser | null>(null);
    const [users, setUsers] = useState<SessionUsers>(EMPTY_USERS);
    const [loading, setLoading] = useState(true);
    const authApiPath = siteConfig.customFields?.authApiPath as string;
    const baseUrl = siteConfig.baseUrl || '/';

    const applySession = useCallback((snapshot: SessionSnapshot) => {
        setUsers(snapshot.users);
        setUser(activeUser(snapshot));
    }, []);

    const refreshSession = useCallback(async () => {
        try {
            applySession(await getSession(authApiPath));
        } catch (error) {
            clearSessionClientState();
            setUsers(EMPTY_USERS);
            setUser(null);
            logger.warn('Unable to load the authentication session.', error);
        } finally {
            setLoading(false);
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
        window.addEventListener('focus', refreshVisibleSession);
        window.addEventListener(SESSION_INVALIDATED_EVENT, refreshVisibleSession);
        document.addEventListener('visibilitychange', refreshVisibleSession);
        return () => {
            window.removeEventListener('focus', refreshVisibleSession);
            window.removeEventListener(SESSION_INVALIDATED_EVENT, refreshVisibleSession);
            document.removeEventListener('visibilitychange', refreshVisibleSession);
        };
    }, [refreshSession]);

    const logout = useCallback(async (provider: AuthProviderName | 'all' = 'all') => {
        setLoading(true);
        const returnTo = window.location.origin + baseUrl;

        try {
            const result = await endSession(authApiPath, provider, returnTo);
            applySession(result);

            if (result.redirectTo) {
                window.location.assign(result.redirectTo);
                return;
            }
            if (provider === 'all' || (!result.users.github && !result.users.btp)) {
                window.location.assign(baseUrl);
                return;
            }
        } catch (error) {
            logger.error('Unable to end the authentication session.', error);
            await refreshSession();
            return;
        }

        setLoading(false);
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
