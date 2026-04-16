"use client";

import React from 'react';
import BroadcastFeed from '../../../components/leads/BroadcastFeed';
import { Megaphone, ChevronRight, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import { usePlanFeature } from '../../../hooks/usePlanFeature';
import { FeatureGate } from '../../../components/vendor/FeatureGate';

export default function VendorBroadcastsPage() {
    const { user } = useAuth();
    const isVendor = user?.role === 'vendor';

    
    return (
        <FeatureGate feature="showBroadcast" title="Unlock Live Broadcasts" description="See real-time service requests from customers in your area. Respond instantly and grow your business today.">
            <div className="min-h-screen pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-10 lg:mb-14 pt-8"
            >
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">
                    <Link href="/dashboard" className="hover:text-blue-600 transition-colors">Dashboard</Link>
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
        </FeatureGate>
    );
}
