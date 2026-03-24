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
            // Check if vendor has active subscription
            if (user?.role === 'vendor') {
                const activeSub = user?.vendor?.subscriptions?.find((sub: any) => sub.status === 'active');
                
                // If no active sub and NOT already on subscription page, redirect
                if (!activeSub && pathname !== '/vendor/subscription') {
                    router.replace('/vendor/subscription');
                } else {
                    setIsChecking(false);
                }
            } else {
                // Not a vendor (maybe regular user), let them pass
                setIsChecking(false);
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
