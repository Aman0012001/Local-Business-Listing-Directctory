"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, MessageSquare, Loader2 } from 'lucide-react';
import { useChat } from '../../hooks/useChat';
import { useAuth } from '../../context/AuthContext';

interface ChatWindowProps {
    isOpen: boolean;
    onClose: () => void;
    businessId: string;
    businessName: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ isOpen, onClose, businessId, businessName }) => {
    const { user } = useAuth();
    const [conversationId, setConversationId] = useState<string | null>(null);
    const { messages, isLoading, isTyping, sendMessage, sendTyping } = useChat(conversationId || undefined);
    const [input, setInput] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    // Initialize/Get conversation
    useEffect(() => {
        if (isOpen && businessId && !conversationId) {
            import('../../services/chat.service').then(({ chatApi }) => {
                chatApi.getOrCreateConversation(businessId).then((conv: any) => {
                    setConversationId(conv.id);
                });
            });
        }
    }, [isOpen, businessId, conversationId]);

    // Scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            const scrollContainer = scrollRef.current;
            scrollContainer.scrollTo({
                top: scrollContainer.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages, isTyping]);

    const handleSend = () => {
        if (!input.trim()) return;
        sendMessage(input);
        setInput('');
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        } else {
            sendTyping();
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                className="fixed bottom-24 right-6 w-80 sm:w-96 h-[500px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col z-[1000] overflow-hidden"
            >
                {/* Header */}
                <div className="p-4 bg-primary text-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                            <MessageSquare className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-sm line-clamp-1">{businessName}</h3>
                            <p className="text-[10px] text-white/70 tracking-wide uppercase font-bold">Live Chat</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Messages */}
                <div 
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-950/50 scroll-smooth"
                >
                    {isLoading && messages.length === 0 ? (
                        <div className="h-full flex items-center justify-center">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2 text-slate-400">
                            <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-3xl shadow-sm flex items-center justify-center mb-4 transform -rotate-6">
                                <MessageSquare className="w-8 h-8 text-primary/40" />
                            </div>
                            <p className="text-sm font-bold text-slate-600 dark:text-slate-300">No messages yet</p>
                            <p className="text-[11px] leading-relaxed max-w-[180px]">Be the first to say hello! Ask anything about our services.</p>
                        </div>
                    ) : (
                        messages.map((msg, idx) => {
                            const isMe = msg.senderId === user?.id;
                            return (
                                <motion.div
                                    key={msg.id || idx}
                                    initial={{ opacity: 0, x: isMe ? 10 : -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                                        isMe 
                                            ? 'bg-primary text-white rounded-tr-none' 
                                            : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-tl-none shadow-sm'
                                    }`}>
                                        {msg.content}
                                        <p className={`text-[10px] mt-1 ${isMe ? 'text-white/70 text-right' : 'text-gray-400'}`}>
                                            {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                                        </p>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="bg-white dark:bg-gray-800 p-2 px-3 rounded-full border border-gray-100 dark:border-gray-700 shadow-sm flex gap-1 items-center">
                                <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" />
                                <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce delay-75" />
                                <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce delay-150" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Input */}
                <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
                    <div className="relative flex items-center border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800/50 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="Type a message..."
                            className="w-full bg-transparent border-none focus:ring-0 p-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 resize-none max-h-24 min-h-[44px]"
                            rows={1}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim()}
                            className="p-2 mr-1 bg-primary hover:bg-primary/90 text-white rounded-lg disabled:opacity-50 disabled:grayscale transition-all"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-2 text-center">Powered by LocalListing Chat</p>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ChatWindow;
