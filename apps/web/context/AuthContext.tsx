"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../lib/api';
import { GoogleOAuthProvider } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = '696583631101-3td2apbr7d2tlbne4o6tmc0crg84u1nv.apps.googleusercontent.com';

// Ping interval: mark user as online every 90 seconds
const PING_INTERVAL_MS = 90_000;

interface AuthContextType {
    user: any | null;
    loading: boolean;
    login: (credentials: any) => Promise<void>;
    googleLogin: (credential: string, role?: string) => Promise<void>;
    register: (userData: any) => Promise<void>;
    logout: () => void;
    updateUser: (userData: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // --- Heartbeat: mark user as online in DB ---
    const startPing = () => {
        // Fire immediately
        api.auth.ping().catch(() => {});

        // Then fire every PING_INTERVAL_MS
        if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = setInterval(() => {
            api.auth.ping().catch(() => {});
        }, PING_INTERVAL_MS);
    };

    const stopPing = () => {
        if (pingIntervalRef.current) {
            clearInterval(pingIntervalRef.current);
            pingIntervalRef.current = null;
        }
    };

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

                        // Start heartbeat: mark user as online
                        startPing();
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

        // Stop heartbeat on unmount
        return () => stopPing();
    }, []);

    const logout = async () => {
        stopPing();
        try {
            await api.auth.logout();
        } catch (err) {
            console.warn('[AuthContext] Backend logout failed:', err);
        }
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        router.push('/login');
    };

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
        } catch (err: any) {
            console.error('[AuthContext] Profile sync failed:', err);
            // If the token is invalid or expired, clear the local state
            if (err.message?.toLowerCase().includes('token') || err.message?.toLowerCase().includes('unauthorized')) {
                logout();
            }
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
        // Immediately mark online in DB
        api.auth.ping().catch(() => {});
        startPing();
        redirectUser(response.user);
    };

    const googleLogin = async (credential: string, role?: string) => {
        const response = await api.auth.googleLogin({ credential, role });
        localStorage.setItem('token', response.tokens.accessToken);
        localStorage.setItem('user', JSON.stringify(response.user));
        setUser(response.user);
        // Immediately mark online in DB
        api.auth.ping().catch(() => {});
        startPing();
        redirectUser(response.user);
    };

    const register = async (userData: any) => {
        const response = await api.auth.register(userData);
        localStorage.setItem('token', response.tokens.accessToken);
        localStorage.setItem('user', JSON.stringify(response.user));
        setUser(response.user);
        startPing();
        redirectUser(response.user);
    };

    const updateUser = (userData: any) => {
        const updatedUser = { ...user, ...userData };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };

    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <AuthContext.Provider value={{ user, loading, login, googleLogin, register, logout, updateUser }}>
                {children}
            </AuthContext.Provider>
        </GoogleOAuthProvider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
