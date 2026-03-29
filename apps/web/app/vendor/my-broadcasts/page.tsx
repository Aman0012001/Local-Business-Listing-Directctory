"use client";

import React from 'react';
import MyJobLeads from '../../../components/leads/MyJobLeads';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default function MyBroadcastsPage() {
    return (
        <div className="min-h-screen pb-20 max-w-7xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-10 lg:mb-14 pt-8 flex flex-col md:flex-row md:items-end justify-between gap-6"
            >
                <div>
                    <h1 className="text-4xl lg:text-6xl font-black text-slate-900 mb-3 tracking-tighter">
                        My <span className="text-blue-600">Broadcasts</span>
                    </h1>
                    <p className="text-lg text-slate-400 font-bold tracking-tight">
                        Manage all your active service requests and track expert responses in real-time.
                    </p>
                </div>
                <Link 
                    href="/broadcasts" 
                    className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 transition-all active:scale-95 shadow-xl shadow-blue-500/20 w-fit"
                >
                    <Plus className="w-5 h-5" /> Start New Broadcast
                </Link>
            </motion.div>

            {/* Content */}
            <div className="bg-white rounded-[32px] p-8 sm:p-12 border-2 border-slate-50 shadow-xl shadow-slate-200/20">
                <MyJobLeads />
            </div>
        </div>
    );
}
