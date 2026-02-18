"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    ListTree,
    Heart,
    Star,
    MessageSquare,
    Bell,
    Settings,
    LogOut,
    ChevronDown,
    ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/vendor/dashboard', badge: null },
    { name: 'My Listings', icon: ListTree, href: '/vendor/listings', badge: null },
    { name: 'Saved', icon: Heart, href: '/vendor/saved', badge: null },
    { name: 'Reviews', icon: Star, href: '/vendor/reviews', badge: null },
    { name: 'Messages', icon: MessageSquare, href: '/vendor/messages', badge: '2' },
    { name: 'Notifications', icon: Bell, href: '/vendor/notifications', badge: null },
    { name: 'Settings', icon: Settings, href: '/vendor/settings', badge: null },
];

export default function Sidebar() {
    const { user, logout } = useAuth();
    const pathname = usePathname();

    return (
        <aside className="w-72 bg-[#F8FAFC] border-r border-slate-200 h-[calc(100vh-80px)] sticky top-20 flex flex-col p-6 overflow-y-auto hidden lg:flex">
            {/* Profile Info */}
            <div className="flex flex-col items-center mb-10 pt-4">
                <div className="relative mb-4 group cursor-pointer">
                    <div className="w-24 h-24 rounded-[32px] overflow-hidden border-4 border-white shadow-2xl transition-transform duration-500 group-hover:scale-105">
                        <img
                            src={user?.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200"}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 rounded-xl border-4 border-[#F8FAFC] flex items-center justify-center text-white shadow-lg">
                        <ShieldCheck className="w-4 h-4" />
                    </div>
                </div>

                <div className="text-center w-full">
                    <button className="flex items-center justify-center gap-1 mx-auto mb-1 group">
                        <span className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                            {user?.fullName || 'Mak Smith'}
                        </span>
                        <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-transform group-hover:translate-y-0.5" />
                    </button>
                    <div className="flex items-center justify-center gap-1.5 px-3 py-1 bg-blue-50/50 rounded-full w-fit mx-auto border border-blue-100/50">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                        <span className="text-[9px] text-blue-600 font-black uppercase tracking-widest">{user?.role || 'vendor account'}</span>
                    </div>
                </div>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-grow space-y-2">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center justify-between px-5 py-4 rounded-[24px] group transition-all duration-300 ${isActive
                                    ? 'bg-white text-slate-900 shadow-xl shadow-slate-200/40 translate-x-1'
                                    : 'text-slate-500 hover:text-slate-900 hover:bg-white/60'
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                <item.icon className={`w-5 h-5 transition-all duration-300 ${isActive ? 'text-blue-600 scale-110' : 'text-slate-400 group-hover:text-slate-900 group-hover:scale-110'
                                    }`} />
                                <span className={`text-[15px] tracking-tight transition-all ${isActive ? 'font-black' : 'font-bold'}`}>{item.name}</span>
                            </div>
                            {item.badge && (
                                <span className="flex items-center justify-center px-2 min-w-[20px] h-5 rounded-lg bg-[#FF7A30] text-white text-[10px] font-black shadow-lg shadow-orange-500/20">
                                    {item.badge}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Logout Action */}
            <div className="mt-10 pt-6 border-t border-slate-200/60">
                <button
                    onClick={logout}
                    className="flex items-center gap-4 px-5 py-4 w-full rounded-[24px] text-slate-500 hover:text-red-500 hover:bg-red-50/50 transition-all group active:scale-95"
                >
                    <LogOut className="w-5 h-5 text-slate-400 group-hover:text-red-500 group-hover:-translate-x-1 transition-all" />
                    <span className="font-bold text-[15px] tracking-tight">Log Out</span>
                </button>
            </div>
        </aside>
    );
}
