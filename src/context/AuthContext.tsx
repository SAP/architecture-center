import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import { authStorage } from '../utils/authStorage';
import { useLocation, useHistory } from '@docusaurus/router';
import siteConfig from '@generated/docusaurus.config';

interface AuthUser {
    username: string;
    email?: string;
    avatar?: string;
    provider: 'github' | 'btp';
    githubAccessToken?: string;
}

interface DualAuthUsers {
    github: AuthUser | null;
    btp: AuthUser | null;
}

interface AuthContextType {
    user: AuthUser | null; // Primary user (for backward compatibility)
    users: DualAuthUsers; // Both users for dual login
    loading: boolean;
    logout: (provider?: 'github' | 'btp' | 'all') => void;
    hasDualLogin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [users, setUsers] = useState<DualAuthUsers>({ github: null, btp: null });
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const history = useHistory();

    const checkAuthTokens = () => {
        const newUsers: DualAuthUsers = { github: null, btp: null };

        try {
            // Check for GitHub JWT token
            const jwtToken = localStorage.getItem('jwt_token');
            if (jwtToken) {
                try {
                    const decodedUser = jwtDecode<AuthUser>(jwtToken);
                    newUsers.github = { ...decodedUser, provider: 'github' };
                } catch (jwtError) {
                    console.error('Invalid JWT token found, removing it.', jwtError);
                    localStorage.removeItem('jwt_token');
                }
            }

            // Check for BTP token in authStorage
            const authData = authStorage.load();
            if (authData && authData.token && authData.email) {
                newUsers.btp = {
                    username: authData.email.split('@')[0],
                    email: authData.email,
                    provider: 'btp',
                };
            }

            setUsers(newUsers);

            // Set primary user (prefer the most recently used one, or GitHub if both exist)
            if (newUsers.github && newUsers.btp) {
                // If both exist, prefer GitHub as primary
                setUser(newUsers.github);
            } else if (newUsers.github) {
                setUser(newUsers.github);
            } else if (newUsers.btp) {
                setUser(newUsers.btp);
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error('Error processing authentication tokens:', error);
            localStorage.removeItem('jwt_token');
            authStorage.clear();
            setUser(null);
            setUsers({ github: null, btp: null });
        }
    };

    useEffect(() => {
        const initializeAuth = async () => {
            const params = new URLSearchParams(location.search);

            // Check for GitHub token (uses 'token' parameter)
            const githubToken = params.get('token');
            // Check for BTP token (uses 't' parameter)
            const btpToken = params.get('t');
            // Check for logout success
            const logoutSuccess = params.get('logout');
            const logoutProvider = params.get('provider');

            if (githubToken) {
                // Handle GitHub authentication
                localStorage.setItem('jwt_token', githubToken);

                // Clean URL and redirect if needed
                const redirectPath = params.get('redirect');
                if (redirectPath) {
                    window.location.href = redirectPath;
                    return;
                } else {
                    history.replace({ ...location, search: '' });
                }

                // Set user from JWT token
                try {
                    const decodedUser = jwtDecode<AuthUser>(githubToken);
                    setUser(decodedUser);
                } catch (error) {
                    console.error('Invalid GitHub JWT token:', error);
                    localStorage.removeItem('jwt_token');
                }
            } else if (btpToken) {
                // Handle BTP authentication
                authStorage.save({ token: btpToken });
                history.replace({ ...location, search: '' });

                // Fetch user info from BTP API
                try {
                    const BTP_API = siteConfig.customFields.backendUrl as string;
                    const userInfoUrl = new URL(`${BTP_API}/user/getUserInfo`);
                    userInfoUrl.searchParams.append('isNewLogin', 'true');

                    const responseUser = await fetch(userInfoUrl.toString(), {
                        headers: {
                            Authorization: `Bearer ${btpToken}`,
                        },
                        mode: 'cors',
                    });

                    if (responseUser.ok) {
                        const dataUser = await responseUser.json();

                        // Update authStorage with user email
                        authStorage.update({ email: dataUser.email });

                        // Set user in main auth context
                        setUser({
                            username: dataUser.email.split('@')[0],
                            email: dataUser.email,
                            provider: 'btp',
                        });
                    } else {
                        console.error('Failed to fetch BTP user info');
                        authStorage.clear();
                    }
                } catch (error) {
                    console.error('Error fetching BTP user info:', error);
                    authStorage.clear();
                }

                // Trigger a storage event to notify other components
                window.dispatchEvent(new Event('storage'));
            } else if (logoutSuccess === 'success' && logoutProvider) {
                // Handle logout success callback
                console.log(`Logout success callback for provider: ${logoutProvider}`);

                // Clean URL to remove logout parameters
                history.replace({ ...location, search: '' });

                // The logout process has completed, auth state should already be cleared
                // Just ensure we check the current auth state
                checkAuthTokens();
            } else {
                // Check for existing authentication
                checkAuthTokens();
            }

            setLoading(false);
        };

        initializeAuth();

        // Listen for storage events to handle BTP login updates
        const handleStorageChange = () => {
            checkAuthTokens();
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [location, history]);

    const logout = (provider?: 'github' | 'btp' | 'all') => {
        const BTP_API = siteConfig.customFields.backendUrl as string;

        console.log(`Frontend logout called with provider: ${provider}`);

        if (!provider || provider === 'all') {
            // Clear both storage systems locally first
            localStorage.removeItem('jwt_token');
            authStorage.clear();
            setUser(null);
            setUsers({ github: null, btp: null });

            // Use backend logout for BTP if we had BTP authentication
            // if (users.btp) {
            //     const logoutUrl = new URL(`${BTP_API}/user/logout`);
            //     logoutUrl.searchParams.append('provider', 'btp');
            //     logoutUrl.searchParams.append('origin_uri', window.location.origin + '/');
            //     window.location.href = logoutUrl.toString();
            // } else {
            window.location.href = '/';
            // }
        } else if (provider === 'github') {
            // For GitHub, handle logout locally since there's no official logout endpoint
            localStorage.removeItem('jwt_token');
            const newUsers = { ...users, github: null };
            setUsers(newUsers);

            // Set BTP as primary user if it exists
            if (newUsers.btp) {
                setUser(newUsers.btp);
            } else {
                setUser(null);
                window.location.href = '/';
            }
        } else if (provider === 'btp') {
            // Get BTP token BEFORE clearing local storage
            const authData = authStorage.load();
            const btpToken = authData?.token;

            // Use backend logout handler for BTP
            if (btpToken) {
                // const logoutUrl = new URL(`${BTP_API}/user/logout`);
                // logoutUrl.searchParams.append('provider', 'btp');
                // logoutUrl.searchParams.append('sap-architecture-center-dev', btpToken);

                // Clear BTP authentication locally after getting the token
                authStorage.clear();
                const newUsers = { ...users, btp: null };
                setUsers(newUsers);

                // If we have GitHub user remaining, stay on current page
                // if (newUsers.github) {
                //     setUser(newUsers.github);
                //     logoutUrl.searchParams.append('origin_uri', window.location.href);
                // } else {
                //     logoutUrl.searchParams.append('origin_uri', window.location.origin + '/');
                // }

                // Redirect to backend logout handler
                // window.location.href = logoutUrl.toString();
                window.location.href = '/';
            } else {
                console.log('No BTP token found, clearing locally and redirecting');

                // Clear BTP authentication locally
                authStorage.clear();
                const newUsers = { ...users, btp: null };
                setUsers(newUsers);

                // Fallback if no token
                if (newUsers.github) {
                    setUser(newUsers.github);
                } else {
                    setUser(null);
                    window.location.href = '/';
                }
            }
        }
    };

    const hasDualLogin = !!(users.github && users.btp);

    return (
        <AuthContext.Provider value={{ user, users, loading, logout, hasDualLogin }}>{children}</AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
