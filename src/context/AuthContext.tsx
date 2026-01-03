import React, { createContext, useContext, useState, useEffect } from "react";
import { login as loginApi, logout as logoutApi, getStoredUser, getToken, type User } from "../lib/authApi";
import { logActivity } from "../utils/activityLogger";

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (username: string, password: string) => Promise<{ success: boolean; error?: string; user?: User }>;
    logout: () => void;
    updateUser: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check for existing session on load
    useEffect(() => {
        const initAuth = () => {
            const storedUser = getStoredUser();
            const token = getToken();

            // Only set user if both token and user exist (valid session)
            if (storedUser && token) {
                setUser(storedUser);
            } else {
                // Clear any partial session data
                logoutApi();
                setUser(null);
            }

            setIsLoading(false);
        };

        initAuth();
    }, []);

    const login = async (username: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> => {
        try {
            setIsLoading(true);
            const response = await loginApi({ username, password });

            if (response.success && response.user) {
                setUser(response.user);
                // Log successful login activity
                logActivity('LOGIN', `Login berhasil sebagai ${response.user.fullName}`, response.user.id);
                return { success: true, user: response.user };
            }

            return { success: false, error: response.error || "Login gagal" };
        } catch (error) {
            const message = error instanceof Error ? error.message : "Login gagal";
            return { success: false, error: message };
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        logoutApi();
        setUser(null);
    };

    const updateUser = (updatedUser: User) => {
        setUser(updatedUser);
        // Also update localStorage
        localStorage.setItem('bananasedu_user', JSON.stringify(updatedUser));
    };

    const value: AuthContextType = {
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        updateUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

export default AuthContext;
