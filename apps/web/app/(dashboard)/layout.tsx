"use client";

import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/vendor/Sidebar';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { api } from '../../lib/api';
import { chatApi } from '../../services/chat.service';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [unreadNotifs, setUnreadNotifs] = useState(0);
    const [unreadMessages, setUnreadMessages] = useState(0);

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.replace('/login');
                setIsChecking(false);
            } else {
                setIsChecking(false);
                fetchCounts();
            }
        }
    }, [user, loading, router]);

    const fetchCounts = async () => {
        if (!user) return;
        try {
            const [notifRes, chatRes] = await Promise.all([
                api.notifications.getAll() as any,
                chatApi.getUnreadCount() as any
            ]);
            setUnreadNotifs(notifRes.unreadCount || 0);
            setUnreadMessages(chatRes.count || 0);
        } catch (err) {
            console.error('Failed to fetch counts in layout', err);
        }
    };

    if (loading || isChecking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <div className="w-12 h-12 border-4 border-blue-600/20 rounded-full" />
                        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0" />
                    </div>
                    <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] animate-pulse">Initializing Portal</span>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
            {/* Sidebar Component handles its own desktop vs mobile visibility */}
            {/* We pass isSidebarOpen and setIsSidebarOpen to control it from the header/hamburger */}
            <Sidebar 
                isOpen={isSidebarOpen} 
                onClose={() => setIsSidebarOpen(false)} 
            />

            <div className="flex-grow flex flex-col min-w-0 bg-[#F8FAFC]">
                {/* Scrollable area that contains both header and main content for unified centering */}
                <div className="flex-grow overflow-y-auto scroll-smooth relative">
                    {/* Background decorative elements */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-50/30 rounded-full blur-[120px] -mr-64 -mt-64" />
                        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-50/20 rounded-full blur-[120px] -ml-64 -mb-64" />
                    </div>

                    <div className="relative z-10">
                        <DashboardHeader 
                            toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
                            unreadNotifications={unreadNotifs}
                            unreadMessages={unreadMessages}
                        />

                        <main className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pb-12">
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
                                {children}
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        </div>
    );
}

