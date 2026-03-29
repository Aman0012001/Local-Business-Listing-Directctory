"use client";

import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Sidebar from '../../components/vendor/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function VendorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        if (!loading) {
            if (!user) {
                // Not logged in — send to login
                router.replace('/login');
                // Don't keep spinner after redirect
                setIsChecking(false);
            } else if (user.role === 'vendor') {
                const activeSubscription = user?.vendor?.subscriptions?.find((sub: any) => sub.status === 'active');
                
                // If no ACTIVE sub and NOT already on a free/essential page, redirect to subscription
                const freePages = [
                    '/vendor/dashboard',    // The central hub, degrades gracefully
                    '/vendor/subscription', // The billing/plan selection page
                    '/vendor/offer-plans',  // Offer/event plan purchase page (always free to view)
                    '/vendor/affiliate',    // Explicitly requested as free
                    '/vendor/settings',     // Account profile management
                    '/vendor/notifications', // System alerts
                    '/vendor/leads',        // Has internal lock screen
                    '/vendor/messages',      // Has internal lock screen
                    '/vendor/analytics'     // Has internal lock screen
                ];
                
                // Account for Next.js trailing slash variations 
                const normalizedPathname = pathname.endsWith('/') && pathname !== '/' 
                    ? pathname.slice(0, -1) 
                    : pathname;
                    
                const isFreePage = freePages.includes(normalizedPathname);
                
                if (!activeSubscription && !isFreePage && user.role === 'vendor') {
                    router.replace('/vendor/subscription');
                    // KEEP isChecking true to prevent rendering the restricted page
                } else {
                    // Either they have a plan, are on a free page, or are a regular user (who has limited dashboard access)
                    setIsChecking(false);
                }
            } else if (user.role === 'user' || user.role === 'customer') {
                // Regular users are allowed in the "vendor" shell for their own dashboard/chat
                setIsChecking(false);
            } else if (user.role === 'admin' || user.role === 'superadmin') {
                setIsChecking(false);
            } else {
                // Not a recognized role - send to home
                router.replace('/');
            }
        }
    }, [user, loading, pathname, router]);

    if (loading || isChecking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />

            <div className="flex flex-grow">
                <Sidebar />

                <main className="flex-grow p-4 lg:p-10 max-w-[1400px]">
                    {children}
                </main>
            </div>

            <Footer />
        </div>
    );
}
