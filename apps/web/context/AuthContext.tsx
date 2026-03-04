"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../lib/api';

interface AuthContextType {
    user: any | null;
    loading: boolean;
    login: (credentials: any) => Promise<void>;
    register: (userData: any) => Promise<void>;
    logout: () => void;
    updateUser: (userData: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const initAuth = async () => {
            try {
                const storedUser = localStorage.getItem('user');
                const token = localStorage.getItem('token');

                if (storedUser && token) {
                    try {
                        const parsedUser = JSON.parse(storedUser);
                        setUser(parsedUser);

                        // Sync profile with backend to get latest data (including vendor relation)
                        await syncProfile();
                    } catch (e) {
                        console.error('Failed to parse stored user:', e);
                        localStorage.removeItem('user');
                        localStorage.removeItem('token');
                    }
                }
            } catch (err) {
                console.error('Auth initialization error:', err);
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, []);

    const syncProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await api.users.getProfile();
            if (response) {
                setUser(response);
                localStorage.setItem('user', JSON.stringify(response));
                console.log('[AuthContext] Profile synced successfully');
            }
        } catch (err) {
            console.error('[AuthContext] Profile sync failed:', err);
            // If it's a 401, we might want to logout, but fetcher handles non-ok responses
        }
    };

    const redirectUser = (user: any) => {
        if (user.role === 'admin' || user.role === 'superadmin') {
            router.push('/admin');
        } else {
            router.push('/vendor/dashboard');
        }
    };

    const login = async (credentials: any) => {
        const response = await api.auth.login(credentials);
        localStorage.setItem('token', response.tokens.accessToken);
        localStorage.setItem('user', JSON.stringify(response.user));
        setUser(response.user);
        redirectUser(response.user);
    };

    const register = async (userData: any) => {
        const response = await api.auth.register(userData);
        localStorage.setItem('token', response.tokens.accessToken);
        localStorage.setItem('user', JSON.stringify(response.user));
        setUser(response.user);
        redirectUser(response.user);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        router.push('/login');
    };

    const updateUser = (userData: any) => {
        const updatedUser = { ...user, ...userData };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
