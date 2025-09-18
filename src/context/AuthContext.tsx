import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';

interface AuthUser {
    username: string;
    email?: string;
    avatar?: string;
    provider: 'github' | 'btp';
}

interface AuthContextType {
    user: AuthUser | null;
    loading: boolean;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const token = localStorage.getItem('jwt_token');
            if (token) {
                const decodedUser = jwtDecode<AuthUser>(token);
                setUser(decodedUser);
            }
        } catch (error) {
            console.error('Invalid app token found, removing it.', error);
            localStorage.removeItem('jwt_token');
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = () => {
        localStorage.removeItem('jwt_token');
        setUser(null);
        window.location.href = '/';
    };

    return <AuthContext.Provider value={{ user, loading, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
