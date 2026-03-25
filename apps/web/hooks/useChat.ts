"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { chatApi } from '../services/chat.service';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.split('/api')[0] || 'http://localhost:3001';

export function useChat(conversationId?: string) {
    const { user } = useAuth();
    const [messages, setMessages] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const socketRef = useRef<Socket | null>(null);

    // Initialize socket
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token || !user) return;

        const socket = io(`${SOCKET_URL}/chat`, {
            auth: { token: `Bearer ${token}` },
            transports: ['websocket'],
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('[useChat] Connected to socket');
            if (conversationId) {
                socket.emit('joinRoom', { conversationId });
            }
        });

        socket.on('newMessage', (message: any) => {
            if (message.conversationId === conversationId) {
                setMessages(prev => [...prev, message]);
                setIsTyping(false);
            }
        });

        socket.on('userTyping', (data: any) => {
            if (data.conversationId === conversationId && data.userId !== user.id) {
                setIsTyping(true);
                // Auto-hide typing after 3 seconds of no updates
                setTimeout(() => setIsTyping(false), 3000);
            }
        });

        socket.on('error', (err: any) => {
            console.error('[useChat] Socket error:', err);
        });

        return () => {
            socket.disconnect();
        };
    }, [conversationId, user]);

    // Fetch history
    useEffect(() => {
        if (!conversationId) return;

        const fetchHistory = async () => {
            setIsLoading(true);
            try {
                const history = await chatApi.getMessages(conversationId);
                setMessages(history);
            } catch (error) {
                console.error('[useChat] Failed to fetch history:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchHistory();
    }, [conversationId]);

    const sendMessage = useCallback(async (content: string) => {
        if (!socketRef.current || !conversationId || !content.trim()) return;

        socketRef.current.emit('sendMessage', {
            conversationId,
            content,
        });
    }, [conversationId]);

    const sendTyping = useCallback(() => {
        if (!socketRef.current || !conversationId) return;
        socketRef.current.emit('typing', { conversationId });
    }, [conversationId]);

    return {
        messages,
        isLoading,
        isTyping,
        sendMessage,
        sendTyping,
    };
}
