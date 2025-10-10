import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import { authStorage } from '../utils/authStorage';
import { useLocation, useHistory } from '@docusaurus/router';
import siteConfig from '@generated/docusaurus.config';
import BrowserOnly from '@docusaurus/BrowserOnly';

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

    const checkAuthTokens = () => {
        const newUsers: DualAuthUsers = { github: null, btp: null };
        try {
            const jwtToken = localStorage.getItem('jwt_token');
            setToken(jwtToken);

            if (jwtToken) {
                try {
                    const decodedPayload = jwtDecode<GithubJwtPayload>(jwtToken);
                    newUsers.github = {
                        username: decodedPayload.username,
                        email: decodedPayload.email,
                        avatar: decodedPayload.avatar,
                        provider: 'github',
                        githubAccessToken: decodedPayload.githubAccessToken,
                    };
                } catch (jwtError) {
                    console.error('Invalid JWT token found, removing it.', jwtError);
                    localStorage.removeItem('jwt_token');
                    setToken(null);
                }
            }
            const authData = authStorage.load();
            if (authData && authData.token && authData.email) {
                newUsers.btp = {
                    username: authData.email.split('@')[0],
                    email: authData.email,
                    provider: 'btp',
                };
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
        } catch (error) {
            console.error('Error processing authentication tokens:', error);
            localStorage.removeItem('jwt_token');
            authStorage.clear();
            setUser(null);
            setUsers({ github: null, btp: null });
            setToken(null);
        }
    };

    useEffect(() => {
        const initializeAuth = async () => {
            const params = new URLSearchParams(location.search);
            const githubToken = params.get('token');
            const btpToken = params.get('t');
            const logoutSuccess = params.get('logout');
            const logoutProvider = params.get('provider');
            if (githubToken) {
                localStorage.setItem('jwt_token', githubToken);
                setToken(githubToken);

                const redirectPath = params.get('redirect');
                history.replace({ ...location, search: '' });

                if (redirectPath) {
                    window.location.href = redirectPath;
                    return;
                }
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
                window.dispatchEvent(new Event('storage'));
            } else if (logoutSuccess === 'success' && logoutProvider) {
                console.log(`Logout success callback for provider: ${logoutProvider}`);
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
        };
    }, [location, history]);

    const logout = (provider?: 'github' | 'btp' | 'all') => {
        console.log(`Frontend logout called with provider: ${provider}`);
        if (!provider || provider === 'all') {
            localStorage.removeItem('jwt_token');
            authStorage.clear();
            setUser(null);
            setUsers({ github: null, btp: null });
            setToken(null);
            window.location.href = '/';
        } else if (provider === 'github') {
            localStorage.removeItem('jwt_token');
            setToken(null);
            const newUsers = { ...users, github: null };
            setUsers(newUsers);
            if (newUsers.btp) {
                setUser(newUsers.btp);
            } else {
                setUser(null);
                window.location.href = '/';
            }
        } else if (provider === 'btp') {
            const authData = authStorage.load();
            const btpToken = authData?.token;
            if (btpToken) {
                window.location.href = '/';
            } else {
                console.log('No BTP token found, clearing locally and redirecting');
                authStorage.clear();
                const newUsers = { ...users, btp: null };
                setUsers(newUsers);
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
