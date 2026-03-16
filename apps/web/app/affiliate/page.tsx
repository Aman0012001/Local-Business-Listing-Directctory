"use client";

import React, { useState, useEffect } from 'react';
import { 
    Users, TrendingUp, Wallet, Link as LinkIcon, 
    CheckCircle2, Copy, Share2, ArrowRight,
    Gift, Timer, AlertCircle, ChevronRight, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function AffiliateDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [referrals, setReferrals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);

    useEffect(() => {
        if (user) {
            loadData();
        }
    }, [user]);

    const loadData = async () => {
        try {
            const statsData = await api.affiliate.getStats();
            setStats(statsData);
            const refData = await api.affiliate.getReferrals() as any[];
            setReferrals(refData);
        } catch (err) {
            console.error('Failed to load affiliate data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async () => {
        setJoining(true);
        try {
            await api.affiliate.join({});
            await loadData();
        } catch (err: any) {
            alert(err.message || 'Failed to join affiliate program');
        } finally {
            setJoining(false);
        }
    };

    const copyLink = () => {
        if (!stats?.referralCode) return;
        const link = `${window.location.origin}/?ref=${stats.referralCode}`;
        navigator.clipboard.writeText(link);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    };

    if (loading && user) {
        return (
            <div className="min-h-screen bg-slate-50">
                <Navbar />
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                </div>
            </div>
        );
    }

    if (!stats && !loading) {
        return (
            <div className="min-h-screen bg-white">
                <Navbar />
                <main className="max-w-4xl mx-auto px-4 py-20 text-center">
                    <div className="w-24 h-24 bg-orange-50 rounded-[40px] flex items-center justify-center mx-auto mb-8">
                        <Gift className="w-12 h-12 text-orange-500" />
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 mb-4">Join Our Affiliate Program</h1>
                    <p className="text-slate-500 text-lg mb-10 max-w-2xl mx-auto font-medium">
                        Earn rewards for every business you refer and every visit you drive. Start earning today with Punjab's most premium business network.
                    </p>
                    <button 
                        onClick={handleJoin}
                        disabled={joining}
                        className="px-12 py-5 bg-slate-900 text-white rounded-3xl font-black text-lg hover:bg-orange-500 transition-all active:scale-95 flex items-center gap-3 mx-auto shadow-xl shadow-slate-200"
                    >
                        {joining ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Start Earning Now <ArrowRight className="w-5 h-5" /></>}
                    </button>
                    
                    <div className="grid md:grid-cols-3 gap-8 mt-20">
                        <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 text-left">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-orange-500 shadow-sm mb-6">
                                <Share2 className="w-6 h-6" />
                            </div>
                            <h3 className="font-black text-slate-900 mb-2">1. Share Link</h3>
                            <p className="text-sm text-slate-500 font-medium">Send your unique referral link to businesses or friends.</p>
                        </div>
                        <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 text-left">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-500 shadow-sm mb-6">
                                <Users className="w-6 h-6" />
                            </div>
                            <h3 className="font-black text-slate-900 mb-2">2. Track Visits</h3>
                            <p className="text-sm text-slate-500 font-medium">When they register or check-in, we track it instantly.</p>
                        </div>
                        <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 text-left">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm mb-6">
                                <Wallet className="w-6 h-6" />
                            </div>
                            <h3 className="font-black text-slate-900 mb-2">3. Get Paid</h3>
                            <p className="text-sm text-slate-500 font-medium">Earn credit directly into your wallet for every conversion.</p>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 py-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-[10px] font-black uppercase tracking-widest">Affiliate Program</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ID: {stats?.referralCode}</span>
                        </div>
                        <h1 className="text-4xl font-black text-slate-900">Your Dashboard</h1>
                    </div>
                    
                    <div className="p-1 bg-white rounded-2xl border border-slate-200 flex gap-2 w-full md:w-[450px]">
                        <div className="flex-1 px-4 py-3 text-sm font-bold text-slate-500 truncate">
                            {typeof window !== 'undefined' ? `${window.location.origin}/?ref=${stats?.referralCode}` : ''}
                        </div>
                        <button 
                            onClick={copyLink}
                            className="px-6 py-3 bg-slate-900 text-white rounded-[14px] text-xs font-black uppercase tracking-widest hover:bg-orange-500 transition-all flex items-center gap-2"
                        >
                            {copySuccess ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            {copySuccess ? 'Copied' : 'Copy Link'}
                        </button>
                    </div>
                </div>

                <div className="grid md:grid-cols-4 gap-6 mb-12">
                    <div className="p-8 bg-white rounded-[32px] border border-slate-200 shadow-sm">
                        <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 mb-6">
                            <Wallet className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Available Balance</p>
                            <h3 className="text-3xl font-black text-slate-900">Rs. {stats?.balance}</h3>
                        </div>
                    </div>
                    <div className="p-8 bg-white rounded-[32px] border border-slate-200 shadow-sm">
                        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 mb-6">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Earnings</p>
                            <h3 className="text-3xl font-black text-slate-900">Rs. {stats?.totalEarnings}</h3>
                        </div>
                    </div>
                    <div className="p-8 bg-white rounded-[32px] border border-slate-200 shadow-sm">
                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 mb-6">
                            <Users className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Referrals</p>
                            <h3 className="text-3xl font-black text-slate-900">{stats?.totalReferrals}</h3>
                        </div>
                    </div>
                    <div className="p-8 bg-white rounded-[32px] border border-slate-200 shadow-sm">
                        <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-500 mb-6">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Conversions</p>
                            <h3 className="text-3xl font-black text-slate-900">{stats?.convertedReferrals}</h3>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-[32px] border border-slate-200 overflow-hidden">
                            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                                <h3 className="text-xl font-black text-slate-900">Recent Activity</h3>
                                <button className="text-xs font-black uppercase tracking-widest text-blue-600 hover:text-blue-700">View All</button>
                            </div>
                            <div className="p-4">
                                {referrals.length > 0 ? (
                                    <div className="space-y-2">
                                        {referrals.map((ref, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 font-bold uppercase">
                                                        {ref.referredUser?.fullName?.[0] || 'U'}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-black text-slate-900">{ref.referredUser?.fullName || 'Anonymous User'}</h4>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{new Date(ref.createdAt).toLocaleDateString()} • {ref.type}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className={`text-sm font-black ${ref.status === 'converted' ? 'text-emerald-500' : 'text-slate-400'}`}>
                                                        {ref.status === 'converted' ? `+Rs. ${ref.commissionAmount}` : 'Pending'}
                                                    </div>
                                                    <span className={`text-[9px] font-black uppercase tracking-widest ${ref.status === 'converted' ? 'text-emerald-600/50' : 'text-slate-300'}`}>
                                                        {ref.status}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-20 text-center">
                                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                            <AlertCircle className="w-8 h-8 text-slate-200" />
                                        </div>
                                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No activity found yet</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="p-8 bg-slate-900 rounded-[32px] text-white">
                            <h3 className="text-xl font-black mb-4 italic">Earning Guide</h3>
                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-orange-400 shrink-0">1</div>
                                    <p className="text-sm text-slate-300 font-medium">Earn <span className="text-white font-black text-base">10% commission</span> on every premium subscription your referrals buy.</p>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-blue-400 shrink-0">2</div>
                                    <p className="text-sm text-slate-300 font-medium">Earn <span className="text-white font-black text-base">Rs. 5 fixed</span> reward for every unique business check-in.</p>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-emerald-400 shrink-0">3</div>
                                    <p className="text-sm text-slate-300 font-medium">Minimum payout is <span className="text-white font-black">Rs. 500</span>. Payments processed weekly.</p>
                                </div>
                            </div>
                            <button className="w-full mt-10 py-4 bg-orange-500 text-white rounded-2xl font-black text-sm hover:bg-orange-600 transition-all flex items-center justify-center gap-2">
                                Request Payout <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-8 bg-blue-600 rounded-[32px] text-white overflow-hidden relative group">
                            <Share2 className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10 group-hover:scale-110 transition-transform duration-500" />
                            <h3 className="text-xl font-black mb-2">Need Help?</h3>
                            <p className="text-sm text-blue-100 font-medium mb-6 relative z-10">Contact our affiliate support for tips on how to grow your earnings.</p>
                            <button className="px-6 py-3 bg-white text-blue-600 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-50 transition-all relative z-10 shadow-lg">Contact Support</button>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
