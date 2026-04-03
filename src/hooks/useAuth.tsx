import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthService, AppUser } from '@/services/AuthService';

interface AuthContextType {
    user: AppUser | null;
    loading: boolean;
    login: typeof AuthService.login;
    logout: typeof AuthService.logout;
    refreshSession: typeof AuthService.refreshSession;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    login: AuthService.login,
    logout: AuthService.logout,
    refreshSession: AuthService.refreshSession,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AppUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        AuthService.getCurrentUser().then((currentUser) => {
            if (mounted) {
                setUser(currentUser);
                setLoading(false);
            }
        });

        const unsubscribe = AuthService.onAuthStateChange((newUser) => {
            if (mounted) {
                setUser(newUser);
                setLoading(false);
            }
        });

        return () => {
            mounted = false;
            unsubscribe();
        };
    }, []);

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            login: AuthService.login,
            logout: AuthService.logout,
            refreshSession: AuthService.refreshSession
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
