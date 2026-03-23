"use client";

import React from 'react';
import MyJobLeads from '../../../components/leads/MyJobLeads';
import { motion } from 'framer-motion';

export default function MyBroadcastsPage() {
    return (
        <div className="min-h-screen pb-20 max-w-7xl mx-auto">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-10 lg:mb-14 pt-8"
            >
                <h1 className="text-4xl lg:text-6xl font-black text-slate-900 mb-3 tracking-tighter">
                    My <span className="text-blue-600">Broadcasts</span>
                </h1>
                <p className="text-lg text-slate-400 font-bold tracking-tight">
                    Manage all your active service requests and track expert responses in real-time.
                </p>
            </motion.div>

            {/* Content */}
            <div className="bg-white rounded-[32px] p-8 sm:p-12 border-2 border-slate-50 shadow-xl shadow-slate-200/20">
                <MyJobLeads />
            </div>
        </div>
    );
}
