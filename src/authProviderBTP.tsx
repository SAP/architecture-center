import { useLocation, useHistory } from '@docusaurus/router';
import React, { createContext, useState, useContext, useEffect, useMemo, useRef } from 'react';
import siteConfig from '@generated/docusaurus.config';
import { authStorage } from './utils/authStorage';
const BTP_API = siteConfig.customFields.backendUrl as string;

interface AuthContextProps {
    isLoggedIn: boolean;
    login: () => Promise<void>;
    logout: () => void;
    user: UserInfo | null;
    isLoading: boolean;
    token: string;
    stopTracking: boolean;
}

interface UserInfo {
    ID?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    company?: string;
    companyId?: string[];
    type?: string;
}

const AuthContext = createContext<AuthContextProps>({
    isLoggedIn: false,
    login: async () => {},
    logout: () => {},
    user: null,
    isLoading: true,
    token: '',
    stopTracking: false, // Prevents tracking when logging out
});

interface AuthProviderProps {
    children: React.ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState<UserInfo | null>(null);
    const [token, setToken] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [stopTracking, setStopTracking] = useState(false);
    // Prevents multiple simultaneous auth checks which could create duplicate users
    const authCheckInProgress = useRef(false);
    const location = useLocation();
    const history = useHistory();

    const login = async () => {
        // Redirect to login
        console.log(BTP_API);
        window.location.href = `${BTP_API}/user/login?origin_uri=${window.location.href}`;
    };

    const logout = () => {
        setStopTracking(true);
        setIsLoggedIn(false);
        setUser(null);
        setToken('');
        authStorage.clear();
        window.location.reload();
    };

    const value = useMemo(
        () => ({
            isLoggedIn,
            login,
            logout,
            user,
            isLoading,
            token,
            stopTracking,
        }),
        [isLoggedIn, login, logout, user, isLoading, token, stopTracking]
    );

    useEffect(() => {
        if (token > '') {
            authStorage.update({
                token,
                email: user?.email,
            });
        } else {
            const authData = authStorage.load();
            if (authData?.token) {
                setToken(authData.token);
            }
        }
    }, [token, user?.email]);

    useEffect(() => {
        const checkAuth = async () => {
            // Prevent concurrent auth checks to avoid duplicate API calls
            // This ensures we don't create multiple users when isFreshLogin=true
            if (authCheckInProgress.current) return;
            authCheckInProgress.current = true;

            setIsLoading(true);
            const params = new URLSearchParams(location.search);
            const queryToken = params.get('t');
            let currentToken = '';
            let isFreshLogin = false;

            if (queryToken) {
                setToken(queryToken);
                authStorage.save({ token: queryToken });
                currentToken = queryToken;
                isFreshLogin = true;
                history.replace({ ...location, search: '' });
            } else {
                const authData = authStorage.load();
                if (authData?.token) {
                    setToken(authData.token);
                    currentToken = authData.token;

                    // If already available, set the user email
                    if (authData.email) {
                        setUser({ email: authData.email });
                    }
                } else {
                    setIsLoading(false);
                    return;
                }
            }

            if (currentToken) {
                try {
                    const userInfoUrl = new URL(`${BTP_API}/user/getUserInfo`);
                    if (isFreshLogin) {
                        userInfoUrl.searchParams.append('isNewLogin', 'true');
                    }

                    const responseUser = await fetch(userInfoUrl.toString(), {
                        headers: {
                            Authorization: `Bearer ${currentToken}`,
                        },
                        mode: 'cors',
                    });
                    if (responseUser.ok) {
                        const dataUser = await responseUser.json();
                        setUser(dataUser);
                        setIsLoggedIn(true);

                        // Update storage with email
                        if (dataUser.email) {
                            authStorage.update({ email: dataUser.email });
                        }
                    } else {
                        console.error('Failed to fetch user info, potentially invalid token');
                        logout();
                    }
                } catch (error) {
                    console.error('Error during auth check:', error);
                    logout();
                }
            }
            setIsLoading(false);
            authCheckInProgress.current = false;
        };

        checkAuth();
    }, [location, history]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const useAuth = () => {
    return useContext(AuthContext);
};

export { AuthProvider, useAuth };
