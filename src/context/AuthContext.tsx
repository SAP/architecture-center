import React, { createContext, useState, useEffect, useContext, ReactNode, useRef } from 'react';
import { jwtDecode } from 'jwt-decode';
import { authStorage } from '../utils/authStorage';
import { useLocation, useHistory } from '@docusaurus/router';
import siteConfig from '@generated/docusaurus.config';
import { logger } from '../utils/logger';

interface AuthUser {
    username: string;
    email?: string;
    avatar?: string;
    provider: 'github' | 'btp';
    githubAccessToken?: string;
    expiresAt?: number; // Add expiresAt for BTP user, if applicable
}
interface DualAuthUsers {
    github: AuthUser | null;
    btp: AuthUser | null;
}
interface AuthContextType {
    user: AuthUser | null;
    users: DualAuthUsers;
    loading: boolean;
    logout: (provider?: 'github' | 'btp' | 'all') => void;
    hasDualLogin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    // During SSR or initial render, provide default values and render children
    if (!isClient) {
        return (
            <AuthContext.Provider
                value={{
                    user: null,
                    users: { github: null, btp: null },
                    loading: true,
                    logout: () => {},
                    hasDualLogin: false,
                }}
            >
                {children}
            </AuthContext.Provider>
        );
    }

    // On client, use the full auth logic
    return <AuthLogicProvider>{children}</AuthLogicProvider>;
};

const AuthLogicProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [users, setUsers] = useState<DualAuthUsers>({ github: null, btp: null });
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const history = useHistory();
    const btpLogoutTimerRef = useRef<NodeJS.Timeout | null>(null); // Ref to store the timer ID for BTP
    const githubUserRef = useRef<AuthUser | null>(null); // Tracks current GitHub user for cross-call consistency

    const clearAllLogoutTimers = () => {
        if (btpLogoutTimerRef.current) {
            clearTimeout(btpLogoutTimerRef.current);
            btpLogoutTimerRef.current = null;
        }
    };

    const scheduleBtpTokenExpiryCheck = (expiresAt: number) => {
        if (btpLogoutTimerRef.current) clearTimeout(btpLogoutTimerRef.current); // Clear any existing BTP timer

        const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
        const timeLeft = expiresAt - currentTime; // Time left in seconds

        if (timeLeft <= 0) {
            logger.info('BTP token already expired. Logging out BTP user.');
            logout('btp');
            return;
        }

        // Schedule logout slightly before actual expiry (e.g., 5 seconds before)
        // Or directly at expiry if that's preferred
        const delay = (timeLeft - 5) * 1000; // Convert to milliseconds, logout 5 seconds early
        // Ensure delay is not negative or too small
        const effectiveDelay = Math.max(1000, delay); // Minimum 1 second delay

        btpLogoutTimerRef.current = setTimeout(() => {
            logger.info('BTP token expired or nearing expiry. Initiating BTP logout.');
            logout('btp');
        }, effectiveDelay);
    };

    const fetchGithubSession = async () => {
        const expressBackendUrl = siteConfig.customFields?.expressBackendUrl as string;
        if (!expressBackendUrl) return;
        try {
            const res = await fetch(`${expressBackendUrl}/user/me`, { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                githubUserRef.current = {
                    username: data.username,
                    email: data.email,
                    avatar: data.avatar,
                    provider: 'github',
                };
            } else if (res.status === 401) {
                // Expected "not logged in" state — e.g. the HttpOnly cookie was
                // cleared on logout. This is not an error: don't log it and don't
                // trigger any automatic re-login. Just treat the user as logged out.
                githubUserRef.current = null;
            } else {
                // Genuinely unexpected response (5xx, etc.). Still treat as logged
                // out gracefully, but surface it for diagnostics.
                logger.warn(`Unexpected status ${res.status} from /user/me; treating as logged out.`);
                githubUserRef.current = null;
            }
        } catch {
            // Network failure — treat as logged out gracefully, no retry.
            githubUserRef.current = null;
        }
    };

    const checkAuthTokens = () => {
        const newUsers: DualAuthUsers = { github: githubUserRef.current, btp: null };
        clearAllLogoutTimers(); // Clear timers whenever re-checking tokens

        try {
            const authData = authStorage.load();
            if (authData && authData.token) {
                // Only check if token exists
                try {
                    const decodedBtpToken = jwtDecode<{ exp?: number; email?: string }>(authData.token);
                    if (decodedBtpToken.exp) {
                        const currentTime = Math.floor(Date.now() / 1000);
                        if (decodedBtpToken.exp > currentTime) {
                            // Token is still valid
                            newUsers.btp = {
                                username: (authData.email || decodedBtpToken.email || '').split('@')[0],
                                email: authData.email || decodedBtpToken.email,
                                provider: 'btp',
                                expiresAt: decodedBtpToken.exp, // Store expiry for BTP user
                            };
                            scheduleBtpTokenExpiryCheck(decodedBtpToken.exp); // Schedule check
                        } else {
                            logger.info('BTP token found but is expired. Clearing BTP auth data.');
                            authStorage.clear();
                        }
                    } else {
                        // No expiry in token, treat as valid for now but might be a legacy token
                        // Still create the user, but no auto-logout scheduling
                        newUsers.btp = {
                            username: authData.email.split('@')[0],
                            email: authData.email,
                            provider: 'btp',
                        };
                    }
                } catch {
                    logger.error('Invalid BTP token found in authStorage, removing it.');
                    authStorage.clear();
                }
            }

            setUsers(newUsers);
            if (newUsers.github && newUsers.btp) {
                setUser(newUsers.github);
            } else if (newUsers.github) {
                setUser(newUsers.github);
            } else if (newUsers.btp) {
                setUser(newUsers.btp);
            } else {
                setUser(null);
            }
        } catch {
            logger.error('Error processing authentication tokens');
            authStorage.clear();
            setUser(null);
            setUsers({ github: null, btp: null });
            clearAllLogoutTimers();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const initializeAuth = async () => {
            const params = new URLSearchParams(location.search);
            const btpToken = params.get('t');
            const logoutSuccess = params.get('logout');
            const logoutProvider = params.get('provider');

            await fetchGithubSession();

            if (btpToken) {
                // SECURITY: Immediately clear token from URL to prevent exposure
                history.replace({ ...location, search: '' });

                // When BTP token is received, save it with expiry
                authStorage.save({ token: btpToken });
                try {
                    const BTP_API = siteConfig.customFields.backendUrl as string;
                    const userInfoUrl = new URL(`${BTP_API}/user/getUserInfo`);
                    userInfoUrl.searchParams.append('isNewLogin', 'true');
                    const responseUser = await fetch(userInfoUrl.toString(), {
                        headers: { Authorization: `Bearer ${btpToken}` },
                        mode: 'cors',
                    });
                    if (responseUser.ok) {
                        const dataUser = await responseUser.json();
                        // Update authStorage with email, which will also update/ensure expiry is set
                        authStorage.update({ email: dataUser.email });

                        // Reload auth data to get the potentially updated expiresAt
                        const updatedAuthData = authStorage.load();
                        if (updatedAuthData && updatedAuthData.token) {
                            const decodedBtpToken = jwtDecode<{ exp?: number; email?: string }>(updatedAuthData.token);
                            setUser({
                                username: updatedAuthData.email.split('@')[0],
                                email: updatedAuthData.email,
                                provider: 'btp',
                                expiresAt: decodedBtpToken.exp,
                            });
                            if (decodedBtpToken.exp) {
                                scheduleBtpTokenExpiryCheck(decodedBtpToken.exp);
                            }
                        }
                    } else {
                        logger.error('Failed to fetch BTP user info');
                        authStorage.clear();
                    }
                } catch {
                    logger.error('Error fetching BTP user info');
                    authStorage.clear();
                }
                window.dispatchEvent(new Event('storage'));
            } else if (logoutSuccess === 'success' && logoutProvider) {
                history.replace({ ...location, search: '' });
                checkAuthTokens();
            } else {
                checkAuthTokens();
            }
            setLoading(false);
        };
        initializeAuth();
        const handleStorageChange = () => {
            checkAuthTokens();
        };
        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearAllLogoutTimers(); // Clear timers on unmount
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location, history]);

    // Get baseUrl from site config
    const baseUrl = siteConfig.baseUrl || '/';

    const logout = async (provider?: 'github' | 'btp' | 'all') => {
        const BTP_API = siteConfig.customFields.backendUrl as string;
        const expressBackendUrl = siteConfig.customFields?.expressBackendUrl as string;
        clearAllLogoutTimers();

        const clearGithubCookie = async () => {
            if (expressBackendUrl) {
                try {
                    await fetch(`${expressBackendUrl}/user/logout`, {
                        method: 'POST',
                        credentials: 'include',
                    });
                } catch {
                    // best-effort — proceed with redirect regardless
                }
            }
        };

        if (!provider || provider === 'all') {
            // Clear both storage systems locally first
            authStorage.clear();
            githubUserRef.current = null;
            setUser(null);
            setUsers({ github: null, btp: null });

            await clearGithubCookie();

            // Always redirect to base URL regardless of authentication type
            const baseRedirectUrl = window.location.origin + baseUrl;
            if (users.btp) {
                const logoutUrl = new URL(`${BTP_API}/user/logout`);
                logoutUrl.searchParams.append('provider', 'btp');
                logoutUrl.searchParams.append('origin_uri', baseRedirectUrl);
                window.location.href = logoutUrl.toString();
            } else {
                window.location.href = baseRedirectUrl;
            }
        } else if (provider === 'github') {
            // Clear only GitHub authentication locally
            githubUserRef.current = null;
            const newUsers = { ...users, github: null };
            setUsers(newUsers);
            const baseRedirectUrl = window.location.origin + baseUrl;
            if (newUsers.btp) {
                setUser(newUsers.btp);
                // Re-schedule BTP timer if BTP user is still logged in
                if (newUsers.btp.expiresAt) {
                    scheduleBtpTokenExpiryCheck(newUsers.btp.expiresAt);
                }
            } else {
                setUser(null);
            }
            await clearGithubCookie();
            window.location.href = baseRedirectUrl;
            window.dispatchEvent(new Event('storage'));
        } else if (provider === 'btp') {
            const authData = authStorage.load();
            const btpToken = authData?.token;
            authStorage.clear();
            const newUsers = { ...users, btp: null };
            setUsers(newUsers);

            // Always redirect to base URL for consistency
            const baseRedirectUrl = window.location.origin + baseUrl;

            if (btpToken) {
                // NOTE: We don't pass the token in URL to avoid exposure in browser history/logs
                // The backend should use session cookies for logout verification
                const logoutUrl = new URL(`${BTP_API}/user/logout`);
                logoutUrl.searchParams.append('origin_uri', baseRedirectUrl);

                if (newUsers.github) {
                    setUser(newUsers.github);
                } else {
                    setUser(null);
                }
                window.location.href = logoutUrl.toString();
            } else {
                logger.info('No BTP token found during BTP logout, clearing locally and redirecting to base URL.');
                if (newUsers.github) {
                    setUser(newUsers.github);
                    // No need to schedule github timer, it's already running if valid
                } else {
                    setUser(null);
                }
                window.location.href = baseRedirectUrl;
            }
        }
    };

    const hasDualLogin = !!(users.github && users.btp);

    return (
        <AuthContext.Provider value={{ user, users, loading, logout, hasDualLogin }}>
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
