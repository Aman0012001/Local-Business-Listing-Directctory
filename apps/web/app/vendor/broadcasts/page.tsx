"use client";

import React from 'react';
import BroadcastFeed from '../../../components/leads/BroadcastFeed';
import { Megaphone, ChevronRight, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';

export default function VendorBroadcastsPage() {
    const { user } = useAuth();
    const activeSub = user?.vendor?.subscriptions?.find((sub: any) => sub.status === 'active');
    const features = activeSub?.plan?.dashboardFeatures || {};
    const isVendor = user?.role === 'vendor';

    // Lock screen: only if vendor has a PAID subscription that explicitly disables showBroadcast.
    // Free plan vendors (no active sub) always have access.
    if (isVendor && activeSub && features.showBroadcast === false) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-white rounded-3xl border-2 border-dashed border-slate-100 mt-20">
                <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mb-6">
                    <Lock className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-3">Live Broadcast Feed</h2>
                <p className="text-slate-500 max-w-md mx-auto mb-8 font-bold leading-relaxed">
                    Accessing the live broadcast feed to find immediate customer requests is a Basic feature. Upgrade your plan to grow your business faster!
                </p>
                <Link href="/vendor/subscription" className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black tracking-tight hover:bg-black transition-all active:scale-95 shadow-xl shadow-slate-200">
                    Upgrade My Plan
                </Link>
            </div>
        );
    }
    return (
        <div className="min-h-screen pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-10 lg:mb-14 pt-8"
            >
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">
                    <Link href="/vendor/dashboard" className="hover:text-blue-600 transition-colors">Dashboard</Link>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-slate-900 font-black">Broadcast Feed</span>
                </div>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-4xl lg:text-6xl font-black text-slate-900 mb-3 tracking-tighter flex items-center gap-4">
                            Live <span className="text-blue-600 font-black">Broadcasts</span>
                            <Megaphone className="w-10 h-10 text-blue-600 hidden sm:block" />
                        </h1>
                        <p className="text-lg text-slate-400 font-bold tracking-tight leading-none">
                            Instant service requests from customers near you.
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Main Content */}
            <div className="bg-slate-50/30 rounded-[24px] p-8 sm:p-12 border-2 border-slate-50">
                <BroadcastFeed />
            </div>
        </div>
    );
}
