"use client";

import React, { useState, useEffect } from 'react';
import {
    Users,
    ListTree,
    Star,
    CheckCircle,
    Trash2,
    ShieldAlert,
    TrendingUp,
    Briefcase,
    MessageSquare,
    ChevronRight
} from 'lucide-react';
import { api } from '../../lib/api';
import StatsGrid from '../../components/vendor/StatsGrid';

export default function AdminDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await api.admin.getStats();
                setStats(data);
            } catch (err) {
                console.error('Failed to fetch admin stats:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const mappedStats = [
        {
            label: 'Total Users',
            value: stats?.totalUsers || '0',
            icon: Users,
            color: 'bg-gradient-to-br from-[#EE4444] to-[#CC2222]',
            shadow: 'shadow-red-500/20'
        },
        {
            label: 'Total Businesses',
            value: stats?.totalBusinesses || '0',
            icon: Briefcase,
            color: 'bg-gradient-to-br from-[#3366CC] to-[#1144AA]',
            shadow: 'shadow-blue-500/20'
        },
        {
            label: 'Total Reviews',
            value: stats?.totalReviews || '0',
            icon: MessageSquare,
            color: 'bg-gradient-to-br from-[#33AA88] to-[#118866]',
            shadow: 'shadow-emerald-500/20'
        },
        {
            label: 'Pending Verification',
            value: stats?.pendingBusinesses || '0',
            icon: ShieldAlert,
            color: 'bg-gradient-to-br from-[#FFAA33] to-[#FF8811]',
            shadow: 'shadow-orange-500/20'
        },
    ];

    if (loading) return <div className="p-10 text-slate-400 font-bold uppercase tracking-widest text-center">Loading Admin Dashboard...</div>;

    return (
        <div className="space-y-12 pb-20">
            {/* Admin Header */}
            <div>
                <h1 className="text-4xl lg:text-5xl font-black text-slate-900 mb-3 tracking-tight">System Administration</h1>
                <p className="text-slate-400 font-bold tracking-tight text-lg">Manage users, businesses, and platform health.</p>
            </div>

            {/* Global Stats */}
            <StatsGrid stats={mappedStats} />

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Recent Registrations Placeholder */}
                <div className="bg-white rounded-[48px] p-8 border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Recent Businesses</h3>
                        <button className="text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-red-600 transition-colors flex items-center gap-2">
                            View All <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="space-y-4">
                        <div className="p-6 bg-slate-50 rounded-3xl flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                                    <ListTree className="w-6 h-6 text-blue-500" />
                                </div>
                                <div>
                                    <p className="font-black text-slate-900">Sunshine Spa</p>
                                    <p className="text-xs text-slate-400 font-bold">Category: Beauty · 2 mins ago</p>
                                </div>
                            </div>
                            <span className="px-3 py-1 bg-amber-100 text-amber-600 rounded-full text-[10px] font-black uppercase">Pending</span>
                        </div>
                        <div className="p-6 bg-slate-50 rounded-3xl flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                                    <ListTree className="w-6 h-6 text-blue-500" />
                                </div>
                                <div>
                                    <p className="font-black text-slate-900">Elite Fitness</p>
                                    <p className="text-xs text-slate-400 font-bold">Category: Gym · 1 hour ago</p>
                                </div>
                            </div>
                            <span className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-[10px] font-black uppercase">Active</span>
                        </div>
                    </div>
                </div>

                {/* System Tasks Placeholder */}
                <div className="bg-slate-900 rounded-[48px] p-8 text-white shadow-2xl shadow-red-500/10">
                    <h3 className="text-2xl font-black mb-8 tracking-tight">Critical Actions</h3>
                    <div className="space-y-4">
                        <button className="w-full p-6 bg-white/5 rounded-3xl flex items-center gap-4 hover:bg-white/10 transition-all text-left">
                            <div className="w-12 h-12 bg-red-500/20 rounded-2xl flex items-center justify-center">
                                <ShieldAlert className="w-6 h-6 text-red-500" />
                            </div>
                            <div>
                                <p className="font-bold">Moderate Reported Content</p>
                                <p className="text-xs text-slate-400">3 reviews pending review</p>
                            </div>
                        </button>
                        <button className="w-full p-6 bg-white/5 rounded-3xl flex items-center gap-4 hover:bg-white/10 transition-all text-left">
                            <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center">
                                <Users className="w-6 h-6 text-blue-500" />
                            </div>
                            <div>
                                <p className="font-bold">Verify New Vendors</p>
                                <p className="text-xs text-slate-400">8 application(s) awaiting</p>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
