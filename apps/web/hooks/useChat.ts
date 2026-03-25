"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { chatApi } from '../services/chat.service';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_URL?.split('/api')[0] || 'http://localhost:3001';

// Singleton socket so all components share the same connection
let sharedSocket: Socket | null = null;

function getSocket(token: string): Socket {
    if (!sharedSocket || !sharedSocket.connected) {
        sharedSocket = io(`${SOCKET_URL}/chat`, {
            auth: { token: `Bearer ${token}` },
            transports: ['websocket'],
        });
    }
    return sharedSocket;
}

export function useChat(conversationId?: string) {
    const { user } = useAuth();
    const [messages, setMessages] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const socketRef = useRef<Socket | null>(null);

    // Initialize socket and join appropriate rooms
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token || !user) return;

        const socket = getSocket(token);
        socketRef.current = socket;

        const onConnect = () => {
            console.log('[useChat] Connected to socket');

            // Join the specific conversation room
            if (conversationId) {
                socket.emit('joinRoom', { conversationId });
            }

            // Join personal rooms for real-time conversation list updates
            if (user.role === 'vendor' && user.vendor?.id) {
                socket.emit('joinVendorRoom', { vendorId: user.vendor.id });
            } else {
                socket.emit('joinUserRoom');
            }
        };

        socket.on('connect', onConnect);

        // If already connected, join rooms immediately
        if (socket.connected) {
            onConnect();
        }

        return () => {
            socket.off('connect', onConnect);
        };
    }, [conversationId, user]);

    // Listen to messages for this conversation
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token || !user) return;

        const socket = getSocket(token);

        const onNewMessage = (message: any) => {
            if (message.conversationId === conversationId) {
                setMessages(prev => [...prev, message]);
                setIsTyping(false);
            }
        };

        const onUserTyping = (data: any) => {
            if (data.conversationId === conversationId && data.userId !== user.id) {
                setIsTyping(true);
                setTimeout(() => setIsTyping(false), 3000);
            }
        };

        socket.on('newMessage', onNewMessage);
        socket.on('userTyping', onUserTyping);

        socket.on('error', (err: any) => {
            console.error('[useChat] Socket error:', err);
        });

        return () => {
            socket.off('newMessage', onNewMessage);
            socket.off('userTyping', onUserTyping);
        };
    }, [conversationId, user]);

    // Fetch message history when conversation opens
    useEffect(() => {
        if (!conversationId) return;

        const fetchHistory = async () => {
            setIsLoading(true);
            try {
                const history = await chatApi.getMessages(conversationId) as any[];
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
        if (!socketRef.current || !conversationId || !content.trim() || !user) return;

        const tempId = `temp-${Date.now()}`;
        const optimisticMessage = {
            id: tempId,
            conversationId,
            senderId: user.id,
            content,
            createdAt: new Date().toISOString(),
            isOptimistic: true,
        };

        // Optimistically add message
        setMessages(prev => [...prev, optimisticMessage]);

        socketRef.current.emit('sendMessage', {
            conversationId,
            content,
        });
    }, [conversationId, user]);

    const sendTyping = useCallback(() => {
        if (!socketRef.current || !conversationId) return;
        socketRef.current.emit('typing', { conversationId });
    }, [conversationId]);

    return {
        messages: messages.reduce((acc: any[], current) => {
            // Find if a version of this message already exists in acc
            const duplicateIdx = acc.findIndex(m => {
                // Exact ID match (both real or both identical temp)
                if (m.id === current.id) return true;
                
                // Content match between optimistic and real
                const isOp1 = !!m.isOptimistic;
                const isOp2 = !!current.isOptimistic;
                if (isOp1 !== isOp2 && m.content === current.content) {
                    // Check timestamp proximity to be safe (within 10 seconds)
                    const mTime = new Date(m.createdAt).getTime();
                    const cTime = new Date(current.createdAt).getTime();
                    if (Math.abs(mTime - cTime) < 10000) return true; 
                }
                return false;
            });

            if (duplicateIdx > -1) {
                // If the new one is real and the existing one is optimistic, replace it
                if (!current.isOptimistic && acc[duplicateIdx].isOptimistic) {
                    acc[duplicateIdx] = current;
                }
                // Otherwise, keep the one already in acc
            } else {
                acc.push(current);
            }
            return acc;
        }, []),
        isLoading,
        isTyping,
        sendMessage,
        sendTyping,
        socket: socketRef.current,
    };
}

/**
 * Lightweight hook to get the shared chat socket for listening to
 * real-time conversation list events (newConversation, conversationUpdated).
 */
export function useChatSocket() {
    const { user } = useAuth();
    const socketRef = useRef<Socket | null>(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token || !user) return;

        const socket = getSocket(token);
        socketRef.current = socket;

        const onConnect = () => {
            setReady(true);
            if (user.role === 'vendor' && user.vendor?.id) {
                socket.emit('joinVendorRoom', { vendorId: user.vendor.id });
            } else {
                socket.emit('joinUserRoom');
            }
        };

        socket.on('connect', onConnect);
        if (socket.connected) onConnect();

        return () => {
            socket.off('connect', onConnect);
        };
    }, [user]);

    return { socket: socketRef.current, ready };
}
