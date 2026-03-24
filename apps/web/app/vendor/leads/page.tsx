"use client";

import React from 'react';
import VendorLeadsInbox from '../../../components/leads/VendorLeadsInbox';
import { Phone, Lock } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import Link from 'next/link';

export default function VendorLeadsPage() {
    const { user } = useAuth();
    
    const activeSub = user?.vendor?.subscriptions?.find((sub: any) => sub.status === 'active');
    const features = activeSub?.plan?.dashboardFeatures || {};
    const isVendor = user?.role === 'vendor';

    // Premium check
    if (isVendor && !features.showLeads) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-white rounded-3xl border-2 border-dashed border-slate-100 mt-20">
                <div className="w-20 h-20 bg-orange-50 text-orange-600 rounded-3xl flex items-center justify-center mb-6">
                    <Lock className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-3">Job Leads & Broadcasts</h2>
                <p className="text-slate-500 max-w-md mx-auto mb-8 font-bold leading-relaxed">
                    Accessing real-time job leads and customer broadcasts is a premium feature. Upgrade your plan to see who is looking for your services!
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
            <div className="py-8">
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl flex items-center justify-center">
                        <Phone className="w-5 h-5 text-orange-600" />
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Job Leads</h1>
                </div>
                <p className="text-slate-400 font-bold mt-1 ml-[52px]">Customer requests and broadcasts matching your business</p>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                <VendorLeadsInbox />
            </div>
        </div>
    );
}
