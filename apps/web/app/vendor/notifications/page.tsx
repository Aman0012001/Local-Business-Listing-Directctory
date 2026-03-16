"use client";

import React, { useState, useEffect } from 'react';
import {
    Bell, Check, Trash2, Clock, AlertCircle,
    Info, Star, MessageSquare, Zap, Megaphone,
    Search, Filter, CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    createdAt: string;
    data?: any;
}

export default function VendorNotifications() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const data = await api.notifications.getAll();
            setNotifications(data.notifications || []);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchNotifications();
    }, [user]);

    const markAsRead = async (id: string) => {
        try {
            await api.notifications.markRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error('Failed to mark read:', error);
        }
    };

    const markAllRead = async () => {
        try {
            await api.notifications.markAllRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error('Failed to mark all read:', error);
        }
    };

    const deleteNotification = async (id: string) => {
        try {
            await api.notifications.delete(id);
            setNotifications(prev => prev.filter(n => n.id !== id));
        } catch (error) {
            console.error('Failed to delete notification:', error);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'new_listing': return <Zap className="w-5 h-5 text-amber-500" />;
            case 'new_enquiry': return <MessageSquare className="w-5 h-5 text-blue-500" />;
            case 'review': return <Star className="w-5 h-5 text-orange-500" />;
            case 'system': return <Info className="w-5 h-5 text-indigo-500" />;
            default: return <Bell className="w-5 h-5 text-slate-400" />;
        }
    };

    const displayNotifications = filter === 'unread'
        ? notifications.filter(n => !n.isRead)
        : notifications;

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className="max-w-4xl mx-auto p-6 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">Notifications</h1>
                    <p className="text-slate-500 font-medium">Keep track of your business activity and system updates.</p>
                </div>

                {unreadCount > 0 && (
                    <button
                        onClick={markAllRead}
                        className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-900 rounded-2xl font-bold hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
                    >
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        Mark all as read
                    </button>
                )}
            </div>

            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${filter === 'all' ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                >
                    All Notifications
                </button>
                <button
                    onClick={() => setFilter('unread')}
                    className={`px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${filter === 'unread' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                >
                    Unread
                    {unreadCount > 0 && <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px]">{unreadCount}</span>}
                </button>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-24 bg-slate-50 rounded-2xl animate-pulse border border-slate-100" />
                    ))}
                </div>
            ) : displayNotifications.length > 0 ? (
                <div className="space-y-4">
                    <AnimatePresence mode='popLayout'>
                        {displayNotifications.map((n) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                key={n.id}
                                className={`group p-5 bg-white rounded-3xl border transition-all ${!n.isRead ? 'border-indigo-100 bg-indigo-50/20 shadow-sm' : 'border-slate-100 hover:bg-slate-50/50'}`}
                            >
                                <div className="flex gap-5">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${!n.isRead ? 'bg-white text-indigo-500' : 'bg-slate-50 text-slate-400'}`}>
                                        {getIcon(n.type)}
                                    </div>

                                    <div className="flex-grow min-w-0">
                                        <div className="flex items-center justify-between mb-1 gap-4">
                                            <h3 className={`text-base truncate ${!n.isRead ? 'font-black text-slate-900' : 'font-bold text-slate-600'}`}>
                                                {n.title}
                                            </h3>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap flex items-center gap-1.5">
                                                <Clock className="w-3 h-3" />
                                                {new Date(n.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-slate-500 text-sm leading-relaxed mb-4">{n.message}</p>

                                        <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {!n.isRead && (
                                                <button
                                                    onClick={() => markAsRead(n.id)}
                                                    className="p-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-colors shadow-sm"
                                                    title="Mark as read"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => deleteNotification(n.id)}
                                                className="p-2 bg-rose-50 text-rose-500 rounded-lg hover:bg-rose-100 transition-colors shadow-sm"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            ) : (
                <div className="p-20 text-center bg-slate-50 rounded-[28px] border-2 border-dashed border-slate-200">
                    <div className="w-24 h-24 bg-white rounded-[20px] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-slate-200/50">
                        <Bell className="w-10 h-10 text-slate-200" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 mb-2">Everything's Quiet</h3>
                    <p className="text-slate-400 font-bold">You don't have any notifications {filter === 'unread' ? 'unread' : 'at the moment'}.</p>
                </div>
            )}
        </div>
    );
}
