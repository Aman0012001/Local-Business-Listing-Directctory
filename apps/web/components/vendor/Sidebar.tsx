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
import { usePlanFeature, DashboardFeatures } from '../../hooks/usePlanFeature';

export default function Sidebar() {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const [newEnquiryCount, setNewEnquiryCount] = useState(0);
    const [unreadChatCount, setUnreadChatCount] = useState(0);
    const [newBroadcastCount, setNewBroadcastCount] = useState(0);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const { hasFeature, planName } = usePlanFeature();

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

        refreshStats();
        // Removed fetchSub as usePlanFeature handles it via AuthContext sync
        const interval = setInterval(refreshStats, 30000);
        return () => clearInterval(interval);
    }, [user]);

    const menuItems: { name: string; icon: any; href: string; badge: string | null; feature?: keyof DashboardFeatures; iconColor?: string }[] = [
        { name: 'Dashboard', icon: LayoutDashboard, href: '/vendor/dashboard', badge: null },
        { name: 'My Listings', icon: ListTree, href: '/vendor/listings', badge: null, feature: 'showListings' },
        { name: 'Pending Approval', icon: Clock, href: '/vendor/pending-listings', badge: null, feature: 'showListings' },
        { name: 'Add Listing', icon: Plus, href: '/vendor/add-listing', badge: null, feature: 'canAddListing' },
        { name: 'Leads', icon: Phone, href: '/vendor/leads', badge: null, feature: 'showLeads' },
        { name: 'Offers & Events', icon: Megaphone, href: '/vendor/offers', badge: null, feature: 'showOffers' },
        { name: 'Reviews', icon: Star, href: '/vendor/reviews', badge: null, feature: 'showReviews' },
        { name: 'Analytics', icon: BarChart, href: '/vendor/analytics', badge: null, feature: 'showAnalytics' },
        { name: 'Saved', icon: Heart, href: '/vendor/saved', badge: null, feature: 'showSaved' },
        { name: 'Following', icon: UserPlus, href: '/vendor/following', badge: null, feature: 'showFollowing' },
        { name: 'Queries', icon: Send, href: '/vendor/messages', badge: newEnquiryCount > 0 ? String(newEnquiryCount) : null, feature: 'showQueries' },
        { name: 'Live Chat', icon: MessageSquare, iconColor: 'text-emerald-500', href: '/vendor/chat', badge: unreadChatCount > 0 ? String(unreadChatCount) : null, feature: 'showChat' },
        { name: 'Hot Demand Insights', icon: TrendingUp, href: '/vendor/demand', badge: null, feature: 'showDemand' },
        { name: 'Subscription & Billing', icon: CreditCard, href: '/vendor/subscription', badge: null },
        { name: 'Offer Plans', icon: Gift, href: '/vendor/offer-plans', badge: '🔥' },
        { name: 'Broadcast Feed', icon: Megaphone, href: '/vendor/broadcasts', badge: newBroadcastCount > 0 ? String(newBroadcastCount) : null, feature: 'showBroadcast' },
        { name: 'Notifications', icon: Bell, href: '/vendor/notifications', badge: null },
        { name: 'Affiliate', icon: Gift, href: '/vendor/affiliate', badge: 'Rewards' },
        { name: 'Settings', icon: Settings, href: '/vendor/settings', badge: null },
    ];

    const filteredItems = menuItems.filter(item => {
        const isVendorOrAdmin = user?.role === 'vendor' || user?.role === 'admin' || user?.role === 'superadmin';
        
        // Show all items to admins
        if (user?.role === 'admin' || user?.role === 'superadmin') return true;

        if (user?.role === 'vendor') {
            // Show all items to vendors, restricting access on the page level
            return true;
        }

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
                        className="shadow-2xl transition-transform duration-500 group-hover:scale-105 border-4 border-white"
                    />
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 rounded-xl border-4 border-[#F8FAFC] flex items-center justify-center text-white shadow-lg">
                        <Shield className="w-4 h-4" />
                    </div>
                </div>
                <div className="text-center w-full">
                    <button className="flex items-center justify-center gap-1 mx-auto mb-1 group">
                        <span className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                            {user?.fullName || 'Vendor'}
                        </span>
                        <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-transform group-hover:translate-y-0.5" />
                    </button>
                    <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center justify-center gap-1.5 px-3 py-1 bg-blue-50/50 rounded-full w-fit mx-auto border border-blue-100/50">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                            <span className="text-[9px] text-blue-600 font-black uppercase tracking-widest">{user?.role || 'vendor account'}</span>
                        </div>
                        {user?.role === 'vendor' && (
                            <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">{planName} Plan</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-grow space-y-2">
                {filteredItems.map(item => {
                    const isActive = pathname === item.href;
                    const isEnquiries = item.name === 'Queries';
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center justify-between px-5 py-4 rounded-[3px] group transition-all duration-300 ${isActive
                                ? 'bg-white text-slate-900 shadow-slate-200/40 translate-x-1'
                                : 'text-slate-500 hover:text-slate-900 hover:bg-white/60'
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                <item.icon className={`w-5 h-5 transition-all duration-300 ${isActive
                                    ? isEnquiries ? 'text-violet-600 scale-110' : 'text-blue-600 scale-110'
                                    : (item as any).iconColor && !isActive ? `${(item as any).iconColor} group-hover:scale-110` : 'text-slate-400 group-hover:text-slate-900 group-hover:scale-110'
                                    }`} />
                                <span className={`text-[15px] tracking-tight transition-all ${isActive ? 'font-black' : 'font-bold'}`}>{item.name}</span>
                            </div>
                            {item.badge && (
                                <span className={`flex items-center justify-center px-2 min-w-[20px] h-5 rounded-lg text-white text-[10px] font-black shadow-lg ${isEnquiries ? 'bg-violet-600 shadow-violet-500/20' : 'bg-[#FF7A30] shadow-orange-500/20'}`}>
                                    {item.badge}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Logout */}
            <div className="mt-10 pt-6 border-t border-slate-200/60">
                <button
                    onClick={logout}
                    className="flex items-center gap-4 px-5 py-4 w-full rounded-[3px] text-slate-500 hover:text-red-500 hover:bg-red-50/50 transition-all group active:scale-95"
                >
                    <LogOut className="w-5 h-5 text-slate-400 group-hover:text-red-500 group-hover:-translate-x-1 transition-all" />
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
            <aside className="w-72 bg-[#F8FAFC] border-r border-slate-200 h-[calc(100vh-80px)] sticky top-20 flex-col p-6 overflow-y-auto hidden lg:flex shrink-0">
                <SidebarInner />
            </aside>

            {/* ── Mobile sidebar (slide-in drawer) ── */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#F8FAFC] border-r border-slate-200 flex flex-col p-6 overflow-y-auto transition-transform duration-300 ease-in-out lg:hidden ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
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
