"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Menu, ChevronDown, MapPin, User as UserIcon, LogOut, X, Search, Building2, Globe, Bell, Check, Trash2, BellRing, Megaphone, MessageSquare, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { api, getImageUrl } from '../lib/api';
import VendorAvatar from './VendorAvatar';
import { Category, City } from '../types/api';
import { usePushNotifications } from '../lib/usePushNotifications';
import { chatApi } from '../services/chat.service';

export default function Navbar() {
    const { user, logout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
    const [mobileDropdown, setMobileDropdown] = useState<string | null>(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMobileMenuOpen]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

    // ── Web Push Notifications ───────────────────────────────────────
    const { supported: pushSupported, permission: pushPermission, isSubscribed: pushSubscribed, subscribe: enablePush, loading: pushLoading } = usePushNotifications(user?.id, true);

    // ── Notifications (via SocketContext) ───────────────────────────
    const { 
        notifications, 
        unreadCount, 
        markAsRead, 
        markAllAsRead, 
        deleteNotification 
    } = useSocket();
    
    const [unreadChatCount, setUnreadChatCount] = useState(0);
    const [showBell, setShowBell] = useState(false);
    const [activeSub, setActiveSub] = useState<any>(null);
    const [loadingSub, setLoadingSub] = useState(true);
    const bellRef = useRef<HTMLDivElement>(null);

    const fetchUnreadChat = useCallback(async () => {
        if (!user) return;
        try {
            const chatRes = await chatApi.getUnreadCount() as any;
            setUnreadChatCount(chatRes.count || 0);
        } catch { /* ignore */ }
    }, [user]);

    useEffect(() => {
        fetchUnreadChat();

        const fetchSub = async () => {
            if (!user || user.role !== 'vendor') {
                setLoadingSub(false);
                return;
            }
            try {
                const sub = await api.subscriptions.getActive();
                setActiveSub(sub);
            } catch (err) {
                console.error('Failed to fetch active sub in navbar', err);
            } finally {
                setLoadingSub(false);
            }
        };

        fetchSub();
        const interval = setInterval(fetchUnreadChat, 30000);
        return () => clearInterval(interval);
    }, [fetchUnreadChat, user]);

    // Close bell dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
                setShowBell(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        await deleteNotification(id);
    };

    const timeAgo = (date: string) => {
        if (!isMounted) return '...'; // Prevent mismatch
        const diff = Date.now() - new Date(date).getTime();
        const m = Math.floor(diff / 60000);
        if (m < 1) return 'just now';
        if (m < 60) return `${m}m ago`;
        const h = Math.floor(m / 60);
        if (h < 24) return `${h}h ago`;
        return `${Math.floor(h / 24)}d ago`;
    };

    const typeColor: Record<string, string> = {
        new_listing: 'bg-blue-100 text-blue-600',
        enquiry_reply: 'bg-green-100 text-green-700',
        new_vendor: 'bg-purple-100 text-purple-700',
        info: 'bg-slate-100 text-slate-500',
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [cats, cityData] = await Promise.all([
                    api.categories.getPopular(10),
                    api.cities.getPopular()
                ]);
                setCategories(cats.slice(0, 10));
                setCities(cityData.slice(0, 10));
            } catch (error) {
                console.error('Error fetching navbar data:', error);
            }
        };
        fetchData();
    }, []);

    const handleDropdownToggle = (name: string) => {
        setActiveDropdown(activeDropdown === name ? null : name);
    };

    return (
        <nav className="sticky top-0 z-[100] bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20 relative">

                    {/* Logo Area */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link href="/" className="flex items-center group h-16">
                            <span className="text-xl font-bold text-[#202124] tracking-tight">
                                naampata<span className="text-[#FF7A30]">.</span>
                            </span>
                        </Link>
                    </div>


                    {/* Centered Desktop Nav Menu - Simplified */}
                    <div className="hidden lg:flex flex-grow justify-center">
                        <div className="flex items-center gap-1">
                            <Link href="/" className="text-sm font-medium text-[#70757a] hover:bg-gray-100 px-4 py-2 rounded-md transition-colors">
                                Home
                            </Link>

                            {/* Categories Dropdown */}
                            <div
                                className="relative group"
                                onMouseEnter={() => setActiveDropdown('categories')}
                                onMouseLeave={() => setActiveDropdown(null)}
                            >
                                <button 
                                    onClick={() => handleDropdownToggle('categories')}
                                    className="flex items-center gap-1 text-sm font-medium text-[#70757a] hover:bg-gray-100 px-4 py-2 rounded-md transition-colors"
                                >
                                    Categories <ChevronDown className="w-3 h-3 opacity-60" />
                                </button>

                                {activeDropdown === 'categories' && (
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 w-[800px] animate-in fade-in slide-in-from-top-4 duration-500 ease-out-expo" style={{ zIndex: "1000" }}>
                                        <div className="bg-white rounded-[32px] shadow-premium border border-slate-100 p-8">
                                            <div className="flex items-center justify-between mb-8">
                                                <h3 className="text-sm font-black uppercase tracking-[0.3em] text-slate-300">Browse Departments</h3>
                                                <Link href="/categories" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline" onClick={() => setActiveDropdown(null)}>View All →</Link>
                                            </div>
                                            <div className="grid grid-cols-4 gap-6">
                                                {categories.map((cat) => (
                                                    <Link
                                                        key={cat.id}
                                                        href={`/categories/${cat.slug}`}
                                                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-all group"
                                                        onClick={() => setActiveDropdown(null)}
                                                    >
                                                        <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center text-blue-500">
                                                            <Search className="w-4 h-4" />
                                                        </div>
                                                        <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900">
                                                            {cat.name}
                                                        </span>
                                                    </Link>
                                                ))}
                                            </div>
                                            <div className="border-t border-slate-100 mt-4 pt-3 text-center">
                                                <Link
                                                    href="/categories"
                                                    className="text-xs font-bold uppercase tracking-widest text-[#FF7A30] hover:text-[#E86920]"
                                                    onClick={() => setActiveDropdown(null)}
                                                >
                                                    View All Categories
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Businesses Dropdown */}
                            <div
                                className="relative group"
                                onMouseEnter={() => setActiveDropdown('businesses')}
                                onMouseLeave={() => setActiveDropdown(null)}
                            >
                                <button 
                                    onClick={() => handleDropdownToggle('businesses')}
                                    className="flex items-center gap-1 text-sm font-medium text-[#70757a] hover:bg-gray-100 px-4 py-2 rounded-md transition-colors"
                                >
                                    Businesses <ChevronDown className="w-3 h-3 opacity-60" />
                                </button>
                                {activeDropdown === 'businesses' && (
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 w-72 animate-in fade-in slide-in-from-top-4 duration-500 ease-out-expo" style={{ zIndex: "1000" }}>
                                        <div className="bg-white rounded-[32px] shadow-premium border border-slate-100 p-3">
                                            <div className="grid grid-cols-1 gap-1">
                                                <Link href="/search?filter=featured" onClick={() => setActiveDropdown(null)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-all group/item">
                                                    <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-[#FF7A30]">
                                                        <Building2 className="w-4 h-4" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-slate-900">Featured</span>
                                                        <span className="text-[10px] text-slate-400 font-medium italic">Hand-picked best locals</span>
                                                    </div>
                                                </Link>
                                                <Link href="/search?filter=new" onClick={() => setActiveDropdown(null)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-all group/item">
                                                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                                                        <Search className="w-4 h-4" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-slate-900">New Listings</span>
                                                        <span className="text-[10px] text-slate-400 font-medium italic">Fresh arrivals this week</span>
                                                    </div>
                                                </Link>
                                                <Link href="/offers-events" onClick={() => setActiveDropdown(null)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-all group/item">
                                                    <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-500">
                                                        <Megaphone className="w-4 h-4" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-slate-900">Offer & Events</span>
                                                        <span className="text-[10px] text-slate-400 font-medium italic">Best deals & local events</span>
                                                    </div>
                                                </Link>
                                                <Link href="/broadcast-request" onClick={() => setActiveDropdown(null)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-all group/item">
                                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500">
                                                        <Megaphone className="w-4 h-4" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-slate-900">Broadcast Request</span>
                                                        <span className="text-[10px] text-slate-400 font-medium italic">Get quotes from experts</span>
                                                    </div>
                                                </Link>
                                                <Link href="/search" onClick={() => setActiveDropdown(null)} className="mt-2 text-center py-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 border-t border-slate-50 pt-3">
                                                    Advanced Search
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Cities Dropdown */}
                            <div
                                className="relative group"
                                onMouseEnter={() => setActiveDropdown('cities')}
                                onMouseLeave={() => setActiveDropdown(null)}
                            >
                                <button 
                                    onClick={() => handleDropdownToggle('cities')}
                                    className="flex items-center gap-1 text-sm font-medium text-[#70757a] hover:bg-gray-100 px-4 py-2 rounded-md transition-colors"
                                >
                                    Cities <ChevronDown className="w-3 h-3 opacity-60" />
                                </button>
                                {activeDropdown === 'cities' && (
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 w-[800px] animate-in fade-in slide-in-from-top-4 duration-500 ease-out-expo" style={{ zIndex: "1000" }}>
                                        <div className="bg-white rounded-[32px] shadow-premium border border-slate-100 p-8">
                                            <div className="flex items-center justify-between mb-8">
                                                <h3 className="text-sm font-black uppercase tracking-[0.3em] text-slate-300">Popular Locations</h3>
                                                <Link href="/cities" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline" onClick={() => setActiveDropdown(null)}>Browse All →</Link>
                                            </div>
                                            <div className="grid grid-cols-4 gap-8">
                                                {cities.map((city) => (
                                                    <Link
                                                        key={city.id}
                                                        href={`/cities/${encodeURIComponent(city.name.toLowerCase())}`}
                                                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-all group"
                                                        onClick={() => setActiveDropdown(null)}
                                                    >
                                                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500">
                                                            <Globe className="w-4 h-4" />
                                                        </div>
                                                        <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900">
                                                            {city.name}
                                                        </span>
                                                    </Link>
                                                ))}
                                            </div>
                                            <div className="border-t border-slate-100 mt-4 pt-3 text-center">
                                                <Link
                                                    href="/cities"
                                                    className="text-xs font-bold uppercase tracking-widest text-[#FF7A30] hover:text-[#E86920]"
                                                    onClick={() => setActiveDropdown(null)}
                                                >
                                                    Browse All Cities
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Utility Area (Right) */}
                    <div className="flex items-center justify-end gap-2">
                        {user ? (
                            <div className="flex items-center gap-3">
                                <Link href={user.role === 'admin' || user.role === 'superadmin' ? '/admin' : '/dashboard'} className="hidden sm:flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-full border border-gray-100 hover:bg-gray-100 transition-colors">
                                    <VendorAvatar
                                        src={user.avatarUrl}
                                        alt={user.fullName || user.email}
                                        size="sm"
                                        className="shadow-sm"
                                    />
                                    <span className="text-xs font-medium text-[#202124] max-w-[80px] truncate">{user.fullName || user.email}</span>
                                </Link>

                                {/* Push Notifications Button */}
                                {pushSupported && !pushSubscribed && pushPermission === 'default' && (
                                    <button
                                        onClick={enablePush}
                                        disabled={pushLoading}
                                        title="Enable push notifications"
                                        className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 transition-all active:scale-95 disabled:opacity-60"
                                    >
                                        <BellRing className={`w-3.5 h-3.5 ${pushLoading ? 'animate-bounce' : ''}`} />
                                        {pushLoading ? 'Enabling…' : 'Enable Push'}
                                    </button>
                                )}

                                {/* Chat Icon */}
                                {user && (user.role === 'admin' || user.role === 'superadmin' || (activeSub?.plan?.dashboardFeatures?.showChat !== false)) && (
                                    <Link
                                        href="/chat"
                                        className={`relative p-2.5 rounded-xl text-slate-500 hover:text-[#FF7A30] hover:bg-orange-50 transition-all ${loadingSub && user.role === 'vendor' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                                        title="Messages"
                                    >
                                        <MessageSquare className="w-5 h-5" />
                                        {unreadChatCount > 0 && (
                                            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-emerald-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                                                {unreadChatCount > 9 ? '9+' : unreadChatCount}
                                            </span>
                                        )}
                                    </Link>
                                )}

                                {/* Notification Bell */}
                                <div ref={bellRef} className="relative">
                                    <button
                                        onClick={() => setShowBell(v => !v)}
                                        className="relative p-2.5 rounded-xl text-slate-500 hover:text-[#FF7A30] hover:bg-orange-50 transition-all"
                                        title="Notifications"
                                    >
                                        <Bell className="w-5 h-5" />
                                        {unreadCount > 0 && (
                                            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-[#FF7A30] text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                                                {unreadCount > 9 ? '9+' : unreadCount}
                                            </span>
                                        )}
                                    </button>

                                    {showBell && (
                                        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden">
                                            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                                                <span className="font-bold text-slate-900 text-sm">Notifications</span>
                                                {unreadCount > 0 && (
                                                    <button onClick={markAllAsRead} className="text-[11px] font-bold text-[#FF7A30] hover:text-[#E86920] flex items-center gap-1 transition-colors">
                                                        <Check className="w-3 h-3" /> Mark all read
                                                    </button>
                                                )}
                                            </div>
                                            <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                                                {notifications.length === 0 ? (
                                                    <div className="py-10 text-center">
                                                        <Bell className="w-8 h-8 mx-auto text-slate-200 mb-2" />
                                                        <p className="text-sm text-slate-400 font-medium">No notifications yet</p>
                                                    </div>
                                                ) : (
                                                    notifications.slice(0, 10).map(n => (
                                                        <div key={n.id} onClick={() => { if (!n.isRead) markAsRead(n.id); }} className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors group ${n.isRead ? 'opacity-60' : 'bg-orange-50/30'}`}>
                                                            <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${n.isRead ? 'bg-slate-200' : 'bg-[#FF7A30]'}`} />
                                                            <div className="flex-1 min-w-0">
                                                                 <div className="flex items-center gap-2 mb-0.5">
                                                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${typeColor[n.type] || typeColor.info}`}>
                                                                        {n.type?.replace(/_/g, ' ')}
                                                                    </span>
                                                                    <span className="text-[10px] text-slate-400 font-medium ml-auto">{timeAgo(n.createdAt)}</span>
                                                                </div>
                                                                <p className="text-xs font-bold text-slate-900 leading-snug">{n.title}</p>
                                                                <p className="text-[11px] text-slate-500 font-medium mt-0.5 line-clamp-2">{n.message}</p>
                                                            </div>
                                                            <button onClick={e => handleDelete(e, n.id)} className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-50 hover:text-red-500 transition-all text-slate-300 flex-shrink-0">
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                            <div className="border-t border-slate-100 px-4 py-2.5">
                                                <Link href="/notifications" onClick={() => setShowBell(false)} className="text-[11px] font-bold text-[#FF7A30] hover:text-[#E86920] transition-colors">
                                                    View all notifications →
                                                </Link>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <button onClick={logout} className="p-2.5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all" title="Logout">
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                             <div className="hidden sm:flex items-center gap-4">
                                <Link href="/login" className="text-sm font-semibold text-[#70757a] hover:text-[#202124] px-4 py-2">Login</Link>
                                <Link href="/register?role=vendor" className="px-6 py-2.5 rounded-xl bg-[#FF7A30] text-white font-bold text-sm hover:bg-[#E86920] shadow-lg shadow-orange-500/20 transition-all active:scale-95 whitespace-nowrap">Add Business</Link>
                            </div>
                        )}

                        <button
                            onClick={toggleMobileMenu}
                            className="lg:hidden p-2.5 bg-slate-50 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors relative z-[110]"
                            aria-label="Toggle menu"
                        >
                            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>

                </div>
            </div>

            {/* Mobile Menu Backdrop */}
            {isMounted && (
                <div 
                    className={`lg:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[80] transition-all duration-300 ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Menu Drawer */}
            {isMounted && (
                <div className={`lg:hidden fixed top-20 left-0 right-0 z-[90] bg-white border-b border-slate-100 shadow-2xl transition-all duration-300 ${isMobileMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}`}>
                    <div className="p-6 space-y-8 overflow-y-auto max-h-[calc(100vh-5rem)]">
                        {/* User Profile in Mobile Menu */}
                        {user ? (
                            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <VendorAvatar src={user.avatarUrl} alt={user.fullName} size="md" />
                                <div className="flex flex-col">
                                    <span className="font-bold text-slate-900">{user.fullName || user.email}</span>
                                    <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="text-xs font-bold text-[#FF7A30] uppercase tracking-wider">View Dashboard</Link>
                                </div>
                            </div>
                        ) : null}

                        <nav className="space-y-3">
                            <Link 
                                href="/" 
                                onClick={() => setIsMobileMenuOpen(false)} 
                                className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 font-bold text-slate-900 hover:bg-slate-100 transition-colors"
                            >
                                Home
                            </Link>
                            
                            {/* Categories Mobile Dropdown */}
                            <div className="space-y-1">
                                <button 
                                    onClick={() => setMobileDropdown(mobileDropdown === 'categories' ? null : 'categories')}
                                    className={`w-full flex items-center justify-between p-4 rounded-2xl border border-slate-100 font-bold transition-all ${mobileDropdown === 'categories' ? 'text-[#FF7A30] bg-orange-50/50 border-orange-100' : 'text-slate-700 bg-white'}`}
                                >
                                    <span>Categories</span>
                                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${mobileDropdown === 'categories' ? 'rotate-180' : '-rotate-90 opacity-40'}`} />
                                </button>
                                <AnimatePresence>
                                    {mobileDropdown === 'categories' && (
                                        <motion.div 
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="grid grid-cols-1 gap-2 p-2 bg-slate-50/50 rounded-2xl mt-1 border border-slate-100">
                                                {categories.map((cat) => (
                                                    <Link
                                                        key={cat.id}
                                                        href={`/categories/${cat.slug}`}
                                                        onClick={() => setIsMobileMenuOpen(false)}
                                                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-white transition-all group"
                                                    >
                                                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-500">
                                                            <Search className="w-3.5 h-3.5" />
                                                        </div>
                                                        <span className="text-sm font-semibold text-slate-700">{cat.name}</span>
                                                    </Link>
                                                ))}
                                                <Link
                                                    href="/categories"
                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                    className="p-3 text-center text-xs font-bold text-[#FF7A30] uppercase tracking-widest border-t border-slate-100 mt-1"
                                                >
                                                    View All Categories
                                                </Link>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Businesses Mobile Dropdown */}
                            <div className="space-y-1">
                                <button 
                                    onClick={() => setMobileDropdown(mobileDropdown === 'businesses' ? null : 'businesses')}
                                    className={`w-full flex items-center justify-between p-4 rounded-2xl border border-slate-100 font-bold transition-all ${mobileDropdown === 'businesses' ? 'text-[#FF7A30] bg-orange-50/50 border-orange-100' : 'text-slate-700 bg-white'}`}
                                >
                                    <span>Businesses</span>
                                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${mobileDropdown === 'businesses' ? 'rotate-180' : '-rotate-90 opacity-40'}`} />
                                </button>
                                <AnimatePresence>
                                    {mobileDropdown === 'businesses' && (
                                        <motion.div 
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="flex flex-col gap-1 p-2 bg-slate-50/50 rounded-2xl mt-1 border border-slate-100">
                                                <Link href="/search?filter=featured" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white transition-all">
                                                    <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-[#FF7A30]">
                                                        <Building2 className="w-4 h-4" />
                                                    </div>
                                                    <span className="text-sm font-bold text-slate-700">Featured</span>
                                                </Link>
                                                <Link href="/search?filter=new" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white transition-all">
                                                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                                                        <Search className="w-4 h-4" />
                                                    </div>
                                                    <span className="text-sm font-bold text-slate-700">New Listings</span>
                                                </Link>
                                                <Link href="/offers-events" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white transition-all">
                                                    <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-500">
                                                        <Megaphone className="w-4 h-4" />
                                                    </div>
                                                    <span className="text-sm font-bold text-slate-700">Offer & Events</span>
                                                </Link>
                                                <Link href="/broadcast-request" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white transition-all">
                                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500">
                                                        <Megaphone className="w-4 h-4" />
                                                    </div>
                                                    <span className="text-sm font-bold text-slate-700">Broadcast Request</span>
                                                </Link>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Cities Mobile Dropdown */}
                            <div className="space-y-1">
                                <button 
                                    onClick={() => setMobileDropdown(mobileDropdown === 'cities' ? null : 'cities')}
                                    className={`w-full flex items-center justify-between p-4 rounded-2xl border border-slate-100 font-bold transition-all ${mobileDropdown === 'cities' ? 'text-[#FF7A30] bg-orange-50/50 border-orange-100' : 'text-slate-700 bg-white'}`}
                                >
                                    <span>Cities</span>
                                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${mobileDropdown === 'cities' ? 'rotate-180' : '-rotate-90 opacity-40'}`} />
                                </button>
                                <AnimatePresence>
                                    {mobileDropdown === 'cities' && (
                                        <motion.div 
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="grid grid-cols-1 gap-2 p-2 bg-slate-50/50 rounded-2xl mt-1 border border-slate-100">
                                                {cities.map((city) => (
                                                    <Link
                                                        key={city.id}
                                                        href={`/cities/${encodeURIComponent(city.name.toLowerCase())}`}
                                                        onClick={() => setIsMobileMenuOpen(false)}
                                                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-white transition-all"
                                                    >
                                                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500">
                                                            <Globe className="w-4 h-4" />
                                                        </div>
                                                        <span className="text-sm font-semibold text-slate-700">{city.name}</span>
                                                    </Link>
                                                ))}
                                                <Link
                                                    href="/cities"
                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                    className="p-3 text-center text-xs font-bold text-[#FF7A30] uppercase tracking-widest border-t border-slate-100 mt-1"
                                                >
                                                    Browse All Cities
                                                </Link>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </nav>

                        {!user && (
                            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
                                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="py-4 text-center rounded-2xl font-bold bg-slate-100 text-[#2D3E50]">Log In</Link>
                                <Link href="/register?role=vendor" onClick={() => setIsMobileMenuOpen(false)} className="py-4 text-center rounded-2xl font-bold bg-[#FF7A30] text-white">Join Us</Link>
                            </div>
                        )}

                        {user && (
                            <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="w-full py-4 rounded-2xl font-bold text-red-600 bg-red-50 flex items-center justify-center gap-2">
                                <LogOut className="w-4 h-4" /> Sign Out
                            </button>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
