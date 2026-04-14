"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
    socket: Socket | null;
    connected: boolean;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    connected: false
});

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 
    (process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api/v1', '') : 
     process.env.NEXT_PUBLIC_API_BASE_URL ? process.env.NEXT_PUBLIC_API_BASE_URL.replace('/api/v1', '') : 
     'http://localhost:3001');

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const { user, syncProfile } = useAuth();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        if (!user) {
            if (socket) {
                socket.disconnect();
                setSocket(null);
                setConnected(false);
            }
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) return;

        const cleanUrl = SOCKET_URL.endsWith('/') ? SOCKET_URL.slice(0, -1) : SOCKET_URL;
        const newSocket = io(`${cleanUrl}/notifications`, {
            auth: { token: `Bearer ${token}` },
            transports: ['websocket'],
            upgrade: false,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
        });

        newSocket.on('connect', () => {
            setConnected(true);
            newSocket.emit('authenticate');
        });

        // Real-time subscription sync
        newSocket.on('subscription_updated', async (data: any) => {
            console.log('[SocketContext] Real-time subscription update received');
            try {
                await syncProfile();
            } catch (err) {
                console.error('[SocketContext] Profile sync failed:', err);
            }
        });

        newSocket.on('disconnect', () => setConnected(false));
        newSocket.on('connect_error', () => setConnected(false));

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [user, syncProfile]);

    return (
        <SocketContext.Provider value={{ socket, connected }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);
