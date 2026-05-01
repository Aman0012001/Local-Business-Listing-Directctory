"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard, ListTree, Plus, Heart, Star, Send, Bell,
    Settings, LogOut, ChevronDown, Shield, Phone, Megaphone,
    MessageSquare, TrendingUp, BarChart, CreditCard, Gift,
    UserPlus, Menu, X, Clock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getImageUrl, api } from '../../lib/api';
import VendorAvatar from '../VendorAvatar';
import { chatApi } from '../../services/chat.service';

export default function Sidebar() {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const [newEnquiryCount, setNewEnquiryCount] = useState(0);
    const [unreadChatCount, setUnreadChatCount] = useState(0);
    const [newBroadcastCount, setNewBroadcastCount] = useState(0);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [activeSub, setActiveSub] = useState<any>(null);
    const [loadingSub, setLoadingSub] = useState(true);

    // Close mobile sidebar on route change
    useEffect(() => {
        setIsMobileOpen(false);
    }, [pathname]);

    // Fetch badge counts & subscription
    useEffect(() => {
        if (!user) return;

        const refreshStats = () => {
            const isVendorOrAdmin = user?.role === 'vendor' || user?.role === 'admin' || user?.role === 'superadmin';
            if (!isVendorOrAdmin) return;

            api.leads.getStats()
                .then((stats: any) => setNewEnquiryCount(stats?.new || 0))
                .catch(() => { });
            chatApi.getUnreadCount()
                .then((res: any) => setUnreadChatCount(res?.count || 0))
                .catch(() => { });
            api.broadcasts.getStats()
                .then((res: any) => setNewBroadcastCount(res?.newCount || 0))
                .catch(() => { });
        };

        const fetchSub = async () => {
            if (user?.role !== 'vendor') {
                setLoadingSub(false);
                return;
            }

            // If user already has activeSubscription from profile sync, use it as initial state
            if (user?.vendor?.activeSubscription) {
                setActiveSub(user.vendor.activeSubscription);
            }

            try {
                const sub = await api.subscriptions.getActive();
                if (sub) {
                    setActiveSub(sub);
                }
            } catch (err) {
                console.error('Failed to fetch active sub', err);
            } finally {
                setLoadingSub(false);
            }
        };

        refreshStats();
        fetchSub();
        const interval = setInterval(refreshStats, 30000);
        return () => clearInterval(interval);
    }, [user]);

    const menuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, href: '/vendor/dashboard', badge: null },
        { name: 'My Listings', icon: ListTree, href: '/vendor/listings', badge: null },
        { name: 'Pending Approval', icon: Clock, href: '/vendor/pending-listings', badge: null },
        { name: 'Add Listing', icon: Plus, href: '/vendor/add-listing', badge: null },
        { name: 'Leads', icon: Phone, href: '/vendor/leads', badge: null },
        { name: 'Offers & Events', icon: Megaphone, href: '/vendor/offers', badge: null },
        { name: 'Reviews', icon: Star, href: '/vendor/reviews', badge: null },
        { name: 'Analytics', icon: BarChart, href: '/vendor/analytics', badge: null },
        { name: 'Saved', icon: Heart, href: '/vendor/saved', badge: null },
        { name: 'Following', icon: UserPlus, href: '/vendor/following', badge: null },
        { name: 'Queries', icon: Send, href: '/vendor/messages', badge: newEnquiryCount > 0 ? String(newEnquiryCount) : null },
        { name: 'Live Chat', icon: MessageSquare, iconColor: 'text-emerald-500', href: '/vendor/chat', badge: unreadChatCount > 0 ? String(unreadChatCount) : null },
        { name: 'Hot Demand Insights', icon: TrendingUp, href: '/vendor/demand', badge: null },
        { name: 'Subscription & Billing', icon: CreditCard, href: '/vendor/subscription', badge: null },
        { name: 'Offer Plans', icon: Gift, href: '/vendor/offer-plans', badge: '🔥' },
        { name: 'Broadcast Feed', icon: Megaphone, href: '/vendor/broadcasts', badge: newBroadcastCount > 0 ? String(newBroadcastCount) : null },
        { name: 'Notifications', icon: Bell, href: '/vendor/notifications', badge: null },
        { name: 'Affiliate', icon: Gift, href: '/vendor/affiliate', badge: 'Rewards' },
        { name: 'Settings', icon: Settings, href: '/vendor/settings', badge: null },
    ];

    const filteredItems = menuItems.filter(item => {
        const isVendorOrAdmin = user?.role === 'vendor' || user?.role === 'admin' || user?.role === 'superadmin';
        
        // Show all items to vendors and admins
        if (isVendorOrAdmin) return true;

        // For regular users/customers, show a limited subset
        return ['Dashboard', 'Live Chat', 'Saved', 'Following', 'Notifications', 'Settings'].includes(item.name);
    });

    const SidebarInner = () => (
        <>
            <div className="flex flex-col items-center mb-10 pt-4">
                <div className="relative mb-4 group cursor-pointer">
                    <VendorAvatar 
                        src={user?.avatarUrl} 
                        alt={user?.fullName || 'Vendor'} 
                        size="lg" 
                        className="shadow-[0_15px_40px_rgb(0,0,0,0.1)] transition-transform duration-500 group-hover:scale-105 border-4 border-white"
                    />
                    <div className="absolute -bottom-1 -right-1 w-9 h-9 bg-[#004a99] rounded-xl border-4 border-[#faf8ff] flex items-center justify-center text-white shadow-lg">
                        <Shield className="w-4 h-4" />
                    </div>
                </div>
                <div className="text-center w-full px-2">
                    <button className="flex items-center justify-center gap-1 mx-auto mb-1.5 group">
                        <span className="text-xl font-black text-[#131b2e] group-hover:text-[#004a99] transition-colors tracking-tight">
                            {user?.fullName || 'Vendor'}
                        </span>
                        <ChevronDown className="w-4 h-4 text-[#64748b] group-hover:text-[#004a99] transition-transform group-hover:translate-y-0.5" />
                    </button>
                    <div className="flex items-center justify-center gap-2 px-3 py-1.5 bg-[#f0f4ff] rounded-full w-fit mx-auto border border-[#004a99]/10">
                        <div className="w-2 h-2 bg-[#10b981] rounded-full" />
                        <span className="text-[10px] text-[#004a99] font-black uppercase tracking-[0.15em]">{user?.role || 'vendor account'}</span>
                    </div>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-grow space-y-1.5">
                {filteredItems.map(item => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center justify-between px-5 py-3.5 rounded-2xl group transition-all duration-300 ${isActive
                                ? 'bg-[#004a99] text-white shadow-[0_10px_20px_rgb(0,74,153,0.15)] translate-x-1'
                                : 'text-[#64748b] hover:text-[#131b2e] hover:bg-white'
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                <item.icon className={`w-5 h-5 transition-all duration-300 ${isActive
                                    ? 'text-white scale-110'
                                    : (item as any).iconColor && !isActive ? `${(item as any).iconColor} group-hover:scale-110` : 'text-[#94a3b8] group-hover:text-[#004a99] group-hover:scale-110'
                                    }`} />
                                <span className={`text-[14px] tracking-tight transition-all ${isActive ? 'font-bold' : 'font-semibold'}`}>{item.name}</span>
                            </div>
                            {item.badge && (
                                <span className={`flex items-center justify-center px-2 min-w-[22px] h-5.5 rounded-lg text-white text-[10px] font-black shadow-lg ${isActive ? 'bg-white/20' : 'bg-[#ff7a00] shadow-[#ff7a00]/20'}`}>
                                    {item.badge}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Logout */}
            <div className="mt-10 pt-6 border-t border-[#e2e8f0]">
                <button
                    onClick={logout}
                    className="flex items-center gap-4 px-5 py-4 w-full rounded-2xl text-[#64748b] hover:text-[#ba1a1a] hover:bg-rose-50 transition-all group active:scale-95"
                >
                    <LogOut className="w-5 h-5 text-[#94a3b8] group-hover:text-[#ba1a1a] group-hover:-translate-x-1 transition-all" />
                    <span className="font-bold text-[15px] tracking-tight">Log Out</span>
                </button>
            </div>
        </>
    );

    return (
        <>
            {/* ── Mobile hamburger button (bottom-left FAB) ── */}
            <button
                onClick={() => setIsMobileOpen(true)}
                aria-label="Open menu"
                className="fixed bottom-6 left-6 z-50 lg:hidden w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-slate-900/30 active:scale-95 transition-transform"
            >
                <Menu className="w-6 h-6" />
            </button>

            {/* ── Mobile backdrop overlay ── */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* ── Desktop sidebar (sticky, always visible) ── */}
            <aside className="w-76 bg-[#faf8ff] border-r border-[#e2e8f0] h-[calc(100vh-80px)] sticky top-20 flex-col p-6 overflow-y-auto hidden lg:flex shrink-0">
                <SidebarInner />
            </aside>

            {/* ── Mobile sidebar (slide-in drawer) ── */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-76 bg-[#faf8ff] border-r border-[#e2e8f0] flex flex-col p-6 overflow-y-auto transition-transform duration-300 ease-in-out lg:hidden ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {/* Close button */}
                <button
                    onClick={() => setIsMobileOpen(false)}
                    className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
                <SidebarInner />
            </aside>
        </>
    );
}
