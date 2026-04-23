"use client";

import React from 'react';
import { Menu, Bell, Search, User, LogOut, MessageSquare, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import VendorAvatar from '../VendorAvatar';

interface DashboardHeaderProps {
    toggleSidebar: () => void;
    unreadNotifications?: number;
    unreadMessages?: number;
}

export default function DashboardHeader({ toggleSidebar, unreadNotifications = 0, unreadMessages = 0 }: DashboardHeaderProps) {
    const { user } = useAuth();

    return (
        <header className="sticky top-0 z-30 py-4 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
                <div className="bg-white/80 border border-slate-100/60 backdrop-blur-xl rounded-[24px] h-20 shadow-sm flex items-center justify-between px-6 transition-all">
                    <div className="flex items-center gap-6">
                        {/* Mobile Hamburger */}
                        <button
                            onClick={toggleSidebar}
                            className="p-2.5 -ml-2 bg-white border border-slate-100 text-slate-600 hover:text-slate-900 hover:shadow-sm rounded-xl lg:hidden transition-all active:scale-90"
                        >
                            <Menu className="w-5 h-5" />
                        </button>

                        <div className="hidden lg:flex items-center gap-6">
                            <div className="flex flex-col">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-1.5 ml-0.5">System Status</p>
                                <div className="flex items-center gap-2.5 px-3.5 py-1.5 bg-emerald-50/50 rounded-2xl border border-emerald-100/50 hover:bg-emerald-50 transition-colors cursor-default">
                                    <div className="relative">
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping absolute inset-0 opacity-75" />
                                    </div>
                                    <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-widest">Global Network Online</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 sm:gap-8">
                        {/* Search Bar (Desktop) */}


                        <div className="flex items-center gap-2 sm:gap-4">
                            {/* Chat */}
                            <Link
                                href="/chat"
                                className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50/50 rounded-xl transition-all relative group"
                            >
                                <MessageSquare className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                {unreadMessages > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 text-white text-[10px] font-black rounded-lg flex items-center justify-center border-2 border-white shadow-xl shadow-indigo-200">
                                        {unreadMessages > 9 ? '9+' : unreadMessages}
                                    </span>
                                )}
                            </Link>

                            {/* Notifications */}
                            <Link
                                href="/notifications"
                                className="p-2.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50/50 rounded-xl transition-all relative group"
                            >
                                <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                {unreadNotifications > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#FF7A30] text-white text-[10px] font-black rounded-lg flex items-center justify-center border-2 border-white shadow-xl shadow-orange-200">
                                        {unreadNotifications > 9 ? '9+' : unreadNotifications}
                                    </span>
                                )}
                            </Link>
                        </div>

                        <div className="h-8 w-px bg-slate-200/60 mx-1 hidden sm:block" />

                        {/* User Dropdown / Profile */}
                        <div className="flex items-center gap-3 sm:gap-4 group cursor-pointer pl-2">

                            {/* Text */}
                            <div className="hidden sm:flex flex-col items-end leading-tight">
                                <span className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                                    {user?.fullName?.split(' ')[0] || 'User'}
                                </span>

                                <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                                    <span>Verified</span>
                                    <Shield className="w-3 h-3 text-blue-500" />
                                </div>
                            </div>

                            {/* Avatar */}
                            <div className="w-10 h-10 rounded-xl overflow-hidden ring-2 ring-white shadow-sm 
flex items-center justify-center bg-slate-100 group-hover:ring-indigo-100 transition-all">

                                <VendorAvatar
                                    src={user?.avatarUrl}
                                    alt={user?.fullName || 'User'}
                                    size="sm"
                                    className="w-full h-full object-cover"
                                />

                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
