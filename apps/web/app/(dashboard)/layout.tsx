"use client";

import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Sidebar from '../../components/vendor/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        if (!loading) {
            if (!user) {
                // Not logged in — send to login
                router.replace('/login');
                setIsChecking(false);
            } else if (
                user.role === 'vendor' ||
                user.role === 'user' ||
                user.role === 'customer' ||
                user.role === 'admin' ||
                user.role === 'superadmin'
            ) {
                // Layout only ensures the user is authenticated with a valid role.
                setIsChecking(false);
            } else {
                // Unknown role — send to home
                router.replace('/');
            }
        }
    }, [user, loading, router]);

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
