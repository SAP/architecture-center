// import React, { createContext, useState, useEffect, useContext, ReactNode, useRef } from 'react';
// import { jwtDecode } from 'jwt-decode';
// import { authStorage } from '../utils/authStorage';
// import { useLocation, useHistory } from '@docusaurus/router';
// import siteConfig from '@generated/docusaurus.config';
// import BrowserOnly from '@docusaurus/BrowserOnly';

// interface GithubJwtPayload {
//     username: string;
//     email?: string;
//     avatar?: string;
//     githubAccessToken?: string;
// }

// interface AuthUser {
//     username: string;
//     email?: string;
//     avatar?: string;
//     provider: 'github' | 'btp';
//     githubAccessToken?: string;
//     expiresAt?: number; // Add expiresAt for BTP user, if applicable
// }
// interface DualAuthUsers {
//     github: AuthUser | null;
//     btp: AuthUser | null;
// }
// interface AuthContextType {
//     user: AuthUser | null;
//     users: DualAuthUsers;
//     loading: boolean;
//     logout: (provider?: 'github' | 'btp' | 'all') => void;
//     hasDualLogin: boolean;
//     token: string | null;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const AuthProvider = ({ children }: { children: ReactNode }) => {
//     return <BrowserOnly>{() => <AuthLogicProvider>{children}</AuthLogicProvider>}</BrowserOnly>;
// };

// const AuthLogicProvider = ({ children }: { children: ReactNode }) => {
//     const [user, setUser] = useState<AuthUser | null>(null);
//     const [users, setUsers] = useState<DualAuthUsers>({ github: null, btp: null });
//     const [loading, setLoading] = useState(true);
//     const [token, setToken] = useState<string | null>(null); // This token is specifically for GitHub
//     const location = useLocation();
//     const history = useHistory();
//     const logoutTimerRef = useRef<NodeJS.Timeout | null>(null); // Ref to store the timer ID

//     const clearLogoutTimer = () => {
//         if (logoutTimerRef.current) {
//             clearTimeout(logoutTimerRef.current);
//             logoutTimerRef.current = null;
//         }
//     };

//     const scheduleBtpTokenExpiryCheck = (expiresAt: number) => {
//         clearLogoutTimer(); // Clear any existing timer

//         const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
//         const timeLeft = expiresAt - currentTime; // Time left in seconds

//         if (timeLeft <= 0) {
//             console.log('BTP token already expired. Logging out BTP user.');
//             logout('btp');
//             return;
//         }

//         // Schedule logout slightly before actual expiry (e.g., 5 seconds before)
//         // Or directly at expiry if that's preferred
//         const delay = (timeLeft - 5) * 1000; // Convert to milliseconds, logout 5 seconds early
//         // Ensure delay is not negative or too small
//         const effectiveDelay = Math.max(1000, delay); // Minimum 1 second delay

//         console.log(
//             `Scheduling BTP token check for ${new Date(
//                 expiresAt * 1000
//             ).toLocaleString()}. Logging out in ~${Math.round(effectiveDelay / 1000)} seconds.`
//         );

//         logoutTimerRef.current = setTimeout(() => {
//             console.log('BTP token expired or nearing expiry. Initiating BTP logout.');
//             logout('btp');
//         }, effectiveDelay);
//     };

//     const checkAuthTokens = () => {
//         const newUsers: DualAuthUsers = { github: null, btp: null };
//         clearLogoutTimer(); // Clear timer whenever re-checking tokens

//         try {
//             const jwtToken = localStorage.getItem('jwt_token');
//             setToken(jwtToken);

//             if (jwtToken) {
//                 try {
//                     const decodedPayload = jwtDecode<GithubJwtPayload>(jwtToken);
//                     newUsers.github = {
//                         username: decodedPayload.username,
//                         email: decodedPayload.email,
//                         avatar: decodedPayload.avatar,
//                         provider: 'github',
//                         githubAccessToken: decodedPayload.githubAccessToken,
//                     };
//                 } catch (jwtError) {
//                     console.error('Invalid GitHub JWT token found, removing it.', jwtError);
//                     localStorage.removeItem('jwt_token');
//                     setToken(null);
//                 }
//             }

//             const authData = authStorage.load();
//             if (authData && authData.token) {
//                 // Only check if token exists
//                 try {
//                     const decodedBtpToken = jwtDecode<{ exp?: number; email?: string }>(authData.token);
//                     if (decodedBtpToken.exp) {
//                         const currentTime = Math.floor(Date.now() / 1000);
//                         if (decodedBtpToken.exp > currentTime) {
//                             // Token is still valid
//                             newUsers.btp = {
//                                 username: (authData.email || decodedBtpToken.email || '').split('@')[0],
//                                 email: authData.email || decodedBtpToken.email,
//                                 provider: 'btp',
//                                 expiresAt: decodedBtpToken.exp, // Store expiry for BTP user
//                             };
//                             scheduleBtpTokenExpiryCheck(decodedBtpToken.exp); // Schedule check
//                         } else {
//                             console.log('BTP token found but is expired. Clearing BTP auth data.');
//                             authStorage.clear();
//                         }
//                     } else {
//                         // No expiry in token, treat as valid for now but might be a legacy token
//                         // Still create the user, but no auto-logout scheduling
//                         newUsers.btp = {
//                             username: authData.email.split('@')[0],
//                             email: authData.email,
//                             provider: 'btp',
//                         };
//                     }
//                 } catch (btpJwtError) {
//                     console.error('Invalid BTP token found in authStorage, removing it.', btpJwtError);
//                     authStorage.clear();
//                 }
//             }

//             setUsers(newUsers);
//             if (newUsers.github && newUsers.btp) {
//                 setUser(newUsers.github);
//             } else if (newUsers.github) {
//                 setUser(newUsers.github);
//             } else if (newUsers.btp) {
//                 setUser(newUsers.btp);
//             } else {
//                 setUser(null);
//             }
//         } catch (error) {
//             console.error('Error processing authentication tokens:', error);
//             localStorage.removeItem('jwt_token');
//             authStorage.clear();
//             setUser(null);
//             setUsers({ github: null, btp: null });
//             setToken(null);
//             clearLogoutTimer();
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         const initializeAuth = async () => {
//             const params = new URLSearchParams(location.search);
//             const githubToken = params.get('token');
//             const btpToken = params.get('t');
//             const logoutSuccess = params.get('logout');
//             const logoutProvider = params.get('provider');

//             if (githubToken) {
//                 localStorage.setItem('jwt_token', githubToken);
//                 setToken(githubToken);

//                 const redirectPath = params.get('redirect');
//                 history.replace({ ...location, search: '' });

//                 if (redirectPath) {
//                     window.location.href = redirectPath;
//                     return;
//                 }
//                 checkAuthTokens();
//             } else if (btpToken) {
//                 // When BTP token is received, save it with expiry
//                 authStorage.save({ token: btpToken });
//                 console.log('BTP token saved to authStorage', btpToken);
//                 history.replace({ ...location, search: '' });
//                 try {
//                     const BTP_API = siteConfig.customFields.backendUrl as string;
//                     const userInfoUrl = new URL(`${BTP_API}/user/getUserInfo`);
//                     userInfoUrl.searchParams.append('isNewLogin', 'true');
//                     const responseUser = await fetch(userInfoUrl.toString(), {
//                         headers: { Authorization: `Bearer ${btpToken}` },
//                         mode: 'cors',
//                     });
//                     if (responseUser.ok) {
//                         const dataUser = await responseUser.json();
//                         // Update authStorage with email, which will also update/ensure expiry is set
//                         authStorage.update({ email: dataUser.email });

//                         // Reload auth data to get the potentially updated expiresAt
//                         const updatedAuthData = authStorage.load();
//                         if (updatedAuthData && updatedAuthData.token) {
//                             const decodedBtpToken = jwtDecode<{ exp?: number; email?: string }>(updatedAuthData.token);
//                             setUser({
//                                 username: updatedAuthData.email.split('@')[0],
//                                 email: updatedAuthData.email,
//                                 provider: 'btp',
//                                 expiresAt: decodedBtpToken.exp,
//                             });
//                             if (decodedBtpToken.exp) {
//                                 scheduleBtpTokenExpiryCheck(decodedBtpToken.exp);
//                             }
//                         }
//                     } else {
//                         console.error('Failed to fetch BTP user info');
//                         authStorage.clear();
//                     }
//                 } catch (error) {
//                     console.error('Error fetching BTP user info:', error);
//                     authStorage.clear();
//                 }
//                 window.dispatchEvent(new Event('storage'));
//             } else if (logoutSuccess === 'success' && logoutProvider) {
//                 console.log(`Logout success callback for provider: ${logoutProvider}`);
//                 history.replace({ ...location, search: '' });
//                 checkAuthTokens();
//             } else {
//                 checkAuthTokens();
//             }
//             setLoading(false);
//         };
//         initializeAuth();
//         const handleStorageChange = () => {
//             checkAuthTokens();
//         };
//         window.addEventListener('storage', handleStorageChange);
//         return () => {
//             window.removeEventListener('storage', handleStorageChange);
//             clearLogoutTimer(); // Clear timer on unmount
//         };
//     }, [location, history]);

//     // Get baseUrl from site config
//     const baseUrl = siteConfig.baseUrl || '/';

//     const logout = (provider?: 'github' | 'btp' | 'all') => {
//         const BTP_API = siteConfig.customFields.backendUrl as string;
//         clearLogoutTimer();

//         if (!provider || provider === 'all') {
//             // Clear both storage systems locally first
//             localStorage.removeItem('jwt_token');
//             authStorage.clear();
//             setUser(null);
//             setUsers({ github: null, btp: null });

//             // Always redirect to base URL regardless of authentication type
//             const baseRedirectUrl = window.location.origin + baseUrl;
//             if (users.btp) {
//                 const logoutUrl = new URL(`${BTP_API}/user/logout`);
//                 logoutUrl.searchParams.append('provider', 'btp');
//                 logoutUrl.searchParams.append('post_logout_redirect_uri', baseRedirectUrl);
//                 window.location.href = logoutUrl.toString();
//             } else {
//                 window.location.href = baseRedirectUrl;
//             }
//         } else if (provider === 'github') {
//             // Clear only GitHub authentication locally
//             localStorage.removeItem('jwt_token');
//             setToken(null);
//             const newUsers = { ...users, github: null };
//             setUsers(newUsers);

//             // Always redirect to base URL for consistency
//             const baseRedirectUrl = window.location.origin + baseUrl;
//             if (newUsers.btp) {
//                 setUser(newUsers.btp);
//                 if (newUsers.btp.expiresAt) {
//                     scheduleBtpTokenExpiryCheck(newUsers.btp.expiresAt); // Re-schedule BTP timer if still logged in
//                 }
//             } else {
//                 setUser(null);
//             }
//             window.location.href = baseRedirectUrl;

//             // GitHub doesn't have a logout endpoint, so we're done
//         } else if (provider === 'btp') {
//             const authData = authStorage.load();
//             const btpToken = authData?.token;
//             authStorage.clear();
//             const newUsers = { ...users, btp: null };
//             setUsers(newUsers);

//             // Always redirect to base URL for consistency
//             const baseRedirectUrl = window.location.origin + baseUrl;

//             if (btpToken) {
//                 const logoutUrl = new URL(`${BTP_API}/user/logout`);
//                 logoutUrl.searchParams.append('jwt_token', btpToken);
//                 logoutUrl.searchParams.append('origin_uri', baseRedirectUrl);

//                 if (newUsers.github) {
//                     setUser(newUsers.github);
//                 } else {
//                     setUser(null);
//                 }
//                 logoutUrl.searchParams.set('post_logout_redirect_uri', baseRedirectUrl);
//                 window.location.href = logoutUrl.toString();
//             } else {
//                 console.log('No BTP token found during BTP logout, clearing locally and redirecting to base URL.');
//                 if (newUsers.github) {
//                     setUser(newUsers.github);
//                     if (newUsers.github.expiresAt) {
//                         scheduleBtpTokenExpiryCheck(newUsers.github.expiresAt); // Unlikely, but for consistency
//                     }
//                 } else {
//                     setUser(null);
//                 }
//                 window.location.href = baseRedirectUrl;
//             }
//         }
//     };

//     const hasDualLogin = !!(users.github && users.btp);

//     return (
//         <AuthContext.Provider value={{ user, users, loading, logout, hasDualLogin, token }}>
//             {children}
//         </AuthContext.Provider>
//     );
// };

// export const useAuth = () => {
//     const context = useContext(AuthContext);
//     if (context === undefined) {
//         throw new Error('useAuth must be used within an AuthProvider');
//     }
//     return context;
// };

import React, { createContext, useState, useEffect, useContext, ReactNode, useRef } from 'react';
import { jwtDecode } from 'jwt-decode';
import { authStorage } from '../utils/authStorage';
import { useLocation, useHistory } from '@docusaurus/router';
import siteConfig from '@generated/docusaurus.config';
import BrowserOnly from '@docusaurus/BrowserOnly';

const GITHUB_SESSION_DURATION_HOURS = 2;

interface GithubJwtPayload {
    username: string;
    email?: string;
    avatar?: string;
    githubAccessToken?: string;
}

interface AuthUser {
    username: string;
    email?: string;
    avatar?: string;
    provider: 'github' | 'btp';
    githubAccessToken?: string;
    expiresAt?: number;
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
    token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    return <BrowserOnly>{() => <AuthLogicProvider>{children}</AuthLogicProvider>}</BrowserOnly>;
};

const AuthLogicProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [users, setUsers] = useState<DualAuthUsers>({ github: null, btp: null });
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState<string | null>(null);
    const location = useLocation();
    const history = useHistory();
    const btpLogoutTimerRef = useRef<NodeJS.Timeout | null>(null);
    const githubLogoutTimerRef = useRef<NodeJS.Timeout | null>(null);

    const clearAllLogoutTimers = () => {
        if (btpLogoutTimerRef.current) {
            clearTimeout(btpLogoutTimerRef.current);
            btpLogoutTimerRef.current = null;
        }
        if (githubLogoutTimerRef.current) {
            clearTimeout(githubLogoutTimerRef.current);
            githubLogoutTimerRef.current = null;
        }
    };

    const scheduleBtpTokenExpiryCheck = (expiresAt: number) => {
        if (btpLogoutTimerRef.current) clearTimeout(btpLogoutTimerRef.current);
        const currentTime = Math.floor(Date.now() / 1000);
        const timeLeft = expiresAt - currentTime;
        if (timeLeft <= 0) {
            logout('btp');
            return;
        }
        const delay = (timeLeft - 5) * 1000;
        const effectiveDelay = Math.max(1000, delay);
        btpLogoutTimerRef.current = setTimeout(() => logout('btp'), effectiveDelay);
    };

    const scheduleGithubTokenExpiryCheck = (expiresAt: number) => {
        if (githubLogoutTimerRef.current) clearTimeout(githubLogoutTimerRef.current);
        const timeLeft = expiresAt - Date.now();
        if (timeLeft <= 0) {
            logout('github');
            return;
        }
        githubLogoutTimerRef.current = setTimeout(() => logout('github'), timeLeft);
    };

    const checkAuthTokens = () => {
        const newUsers: DualAuthUsers = { github: null, btp: null };
        clearAllLogoutTimers();

        try {
            const githubAuthDataString = localStorage.getItem('jwt_token');
            if (githubAuthDataString) {
                try {
                    const githubAuthData = JSON.parse(githubAuthDataString);
                    if (githubAuthData.expiresAt && Date.now() < githubAuthData.expiresAt) {
                        const decodedPayload = jwtDecode<GithubJwtPayload>(githubAuthData.token);
                        newUsers.github = {
                            username: decodedPayload.username,
                            email: decodedPayload.email,
                            avatar: decodedPayload.avatar,
                            provider: 'github',
                            githubAccessToken: decodedPayload.githubAccessToken,
                            expiresAt: githubAuthData.expiresAt,
                        };
                        setToken(githubAuthData.token);
                        scheduleGithubTokenExpiryCheck(githubAuthData.expiresAt);
                    } else {
                        localStorage.removeItem('jwt_token');
                        setToken(null);
                    }
                } catch (jwtError) {
                    localStorage.removeItem('jwt_token');
                    setToken(null);
                }
            } else {
                setToken(null);
            }

            const authData = authStorage.load();
            if (authData?.token) {
                try {
                    const decodedBtpToken = jwtDecode<{ exp?: number; email?: string }>(authData.token);
                    if (decodedBtpToken.exp && decodedBtpToken.exp * 1000 > Date.now()) {
                        newUsers.btp = {
                            username: (authData.email || decodedBtpToken.email || '').split('@')[0],
                            email: authData.email || decodedBtpToken.email,
                            provider: 'btp',
                            expiresAt: decodedBtpToken.exp,
                        };
                        scheduleBtpTokenExpiryCheck(decodedBtpToken.exp);
                    } else {
                        authStorage.clear();
                    }
                } catch (btpJwtError) {
                    authStorage.clear();
                }
            }

            setUsers(newUsers);
            if (newUsers.github) setUser(newUsers.github);
            else if (newUsers.btp) setUser(newUsers.btp);
            else setUser(null);
        } catch (error) {
            localStorage.removeItem('jwt_token');
            authStorage.clear();
            setUser(null);
            setUsers({ github: null, btp: null });
            setToken(null);
            clearAllLogoutTimers();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const initializeAuth = async () => {
            const params = new URLSearchParams(location.search);
            const githubTokenFromUrl = params.get('token');
            const btpToken = params.get('t');

            if (githubTokenFromUrl) {
                const expiresAt = Date.now() + GITHUB_SESSION_DURATION_HOURS * 60 * 60 * 1000;
                const githubAuthData = { token: githubTokenFromUrl, expiresAt };
                localStorage.setItem('jwt_token', JSON.stringify(githubAuthData));
                history.replace({ ...location, search: '' });
                checkAuthTokens();
            } else if (btpToken) {
                authStorage.save({ token: btpToken });
                history.replace({ ...location, search: '' });
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
                        authStorage.update({ email: dataUser.email });
                    } else {
                        authStorage.clear();
                    }
                } catch (error) {
                    authStorage.clear();
                }
                window.dispatchEvent(new Event('storage'));
            } else {
                checkAuthTokens();
            }
            setLoading(false);
        };

        initializeAuth();
        const handleStorageChange = () => checkAuthTokens();
        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearAllLogoutTimers();
        };
    }, [location, history]);

    const logout = (provider?: 'github' | 'btp' | 'all') => {
        const BTP_API = siteConfig.customFields.backendUrl as string;
        clearAllLogoutTimers();
        const baseRedirectUrl = window.location.origin + (siteConfig.baseUrl || '/');

        const performRedirect = (url: string) => (window.location.href = url);

        if (!provider || provider === 'all') {
            localStorage.removeItem('jwt_token');
            authStorage.clear();
            setUser(null);
            setUsers({ github: null, btp: null });
            if (users.btp) {
                const logoutUrl = new URL(`${BTP_API}/user/logout`);
                logoutUrl.searchParams.append('post_logout_redirect_uri', baseRedirectUrl);
                performRedirect(logoutUrl.toString());
            } else {
                performRedirect(baseRedirectUrl);
            }
        } else if (provider === 'github') {
            localStorage.removeItem('jwt_token');
            setToken(null);
            const newUsers = { ...users, github: null };
            setUsers(newUsers);
            if (newUsers.btp) {
                setUser(newUsers.btp);
                if (newUsers.btp.expiresAt) {
                    scheduleBtpTokenExpiryCheck(newUsers.btp.expiresAt);
                }
            } else {
                setUser(null);
            }
            window.dispatchEvent(new Event('storage'));
        } else if (provider === 'btp') {
            const authData = authStorage.load();
            authStorage.clear();
            const newUsers = { ...users, btp: null };
            setUsers(newUsers);
            if (newUsers.github) {
                setUser(newUsers.github);
            } else {
                setUser(null);
            }
            if (authData?.token) {
                const logoutUrl = new URL(`${BTP_API}/user/logout`);
                logoutUrl.searchParams.append('post_logout_redirect_uri', baseRedirectUrl);
                performRedirect(logoutUrl.toString());
            } else {
                performRedirect(baseRedirectUrl);
            }
        }
    };

    const hasDualLogin = !!(users.github && users.btp);

    return (
        <AuthContext.Provider value={{ user, users, loading, logout, hasDualLogin, token }}>
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
