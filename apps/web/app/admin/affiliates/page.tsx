"use client";

import React, { useState, useEffect } from 'react';
import { 
    Users, Wallet, TrendingUp, AlertCircle, 
    CheckCircle2, XCircle, Search, Clock,
    Filter, MoreVertical, LayoutDashboard,
    ArrowUpRight, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../../lib/api';

export default function AdminAffiliatesPage() {
    const [stats, setStats] = useState<any>(null);
    const [affiliates, setAffiliates] = useState<any[]>([]);
    const [payouts, setPayouts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<'payouts' | 'affiliates'>('payouts');
    
    // Admin Action States
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [notes, setNotes] = useState('');
    const [showNotesModal, setShowNotesModal] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [statsData, affiliatesData, payoutsData] = await Promise.all([
                api.affiliate.adminGetStats(),
                api.affiliate.adminGetAffiliates(),
                api.affiliate.adminGetPayouts()
            ]);
            setStats(statsData);
            setAffiliates(affiliatesData as any[]);
            setPayouts(payoutsData as any[]);
        } catch (err) {
            console.error('Failed to load admin affiliate data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id: string, status: string) => {
        setProcessingId(id);
        try {
            await api.affiliate.adminUpdatePayout(id, { 
                status, 
                notes: notes || undefined 
            });
            setShowNotesModal(null);
            setNotes('');
            await loadData();
        } catch (err: any) {
            alert(err.message || 'Failed to update payout status');
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20">
            <div>
                <h1 className="text-4xl font-black text-slate-900 mb-2">Affiliate Management</h1>
                <p className="text-slate-500 font-medium italic">Monitor performance and manage payout requests</p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-8 bg-white rounded-[32px] border border-slate-200 shadow-sm relative overflow-hidden group">
                    <TrendingUp className="absolute -right-4 -top-4 w-24 h-24 text-slate-50 group-hover:scale-110 transition-transform duration-500" />
                    <div className="relative z-10 space-y-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Affiliates</p>
                        <h3 className="text-4xl font-black text-slate-900">{stats?.totalAffiliates}</h3>
                    </div>
                </div>
                <div className="p-8 bg-white rounded-[32px] border border-slate-200 shadow-sm relative overflow-hidden group">
                    <Wallet className="absolute -right-4 -top-4 w-24 h-24 text-slate-50 group-hover:scale-110 transition-transform duration-500" />
                    <div className="relative z-10 space-y-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total System Earnings</p>
                        <h3 className="text-4xl font-black text-slate-900">Rs. {stats?.totalEarnings}</h3>
                    </div>
                </div>
                <div className="p-8 bg-slate-900 rounded-[32px] text-white shadow-xl relative overflow-hidden group">
                    <Clock className="absolute -right-4 -top-4 w-24 h-24 text-white/5 group-hover:scale-110 transition-transform duration-500" />
                    <div className="relative z-10 space-y-2">
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Pending Payouts</p>
                        <h3 className="text-4xl font-black">{stats?.pendingPayouts}</h3>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden min-h-[600px]">
                <div className="flex border-b border-slate-100 p-2 gap-2 bg-slate-50/50">
                    <button 
                        onClick={() => setTab('payouts')}
                        className={`flex-1 py-4 rounded-[24px] text-sm font-black transition-all ${tab === 'payouts' ? 'bg-white text-slate-900 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Payout Requests <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full text-[10px]">{payouts.filter(p => p.status === 'pending').length}</span>
                    </button>
                    <button 
                        onClick={() => setTab('affiliates')}
                        className={`flex-1 py-4 rounded-[24px] text-sm font-black transition-all ${tab === 'affiliates' ? 'bg-white text-slate-900 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        All Affiliates
                    </button>
                </div>

                <div className="p-4">
                    {tab === 'payouts' ? (
                        <div className="space-y-4">
                            {payouts.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-6">
                                                <th className="px-6 py-4">Status</th>
                                                <th className="px-6 py-4">Affiliate</th>
                                                <th className="px-6 py-4">Amount</th>
                                                <th className="px-6 py-4">Method/Details</th>
                                                <th className="px-6 py-4">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {payouts.map((payout) => (
                                                <tr key={payout.id} className="group hover:bg-slate-50/50 transition-all">
                                                    <td className="px-6 py-6">
                                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                                            payout.status === 'paid' ? 'bg-emerald-100 text-emerald-600' :
                                                            payout.status === 'rejected' ? 'bg-red-100 text-red-600' :
                                                            'bg-orange-100 text-orange-600'
                                                        }`}>
                                                            {payout.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-6">
                                                        <div>
                                                            <div className="font-black text-slate-900">{payout.affiliate?.user?.fullName || 'Unknown'}</div>
                                                            <div className="text-[10px] text-slate-400 font-bold uppercase">{payout.affiliate?.referralCode}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-6 text-lg font-black text-slate-900">Rs. {payout.amount}</td>
                                                    <td className="px-6 py-6">
                                                        <div className="text-xs font-black text-slate-700">{payout.paymentMethod}</div>
                                                        <div className="text-[10px] text-slate-400 font-medium truncate max-w-[200px]">{payout.paymentDetails}</div>
                                                    </td>
                                                    <td className="px-6 py-6">
                                                        {payout.status === 'pending' || payout.status === 'approved' ? (
                                                            <div className="flex gap-2">
                                                                {payout.status === 'pending' && (
                                                                    <button 
                                                                        onClick={() => handleUpdateStatus(payout.id, 'approved')}
                                                                        disabled={processingId === payout.id}
                                                                        className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                                                        title="Approve"
                                                                    >
                                                                        <CheckCircle2 className="w-5 h-5" />
                                                                    </button>
                                                                )}
                                                                <button 
                                                                    onClick={() => handleUpdateStatus(payout.id, 'paid')}
                                                                    disabled={processingId === payout.id}
                                                                    className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                                                                    title="Mark as Paid"
                                                                >
                                                                    <Wallet className="w-5 h-5" />
                                                                </button>
                                                                <button 
                                                                    onClick={() => {
                                                                        setShowNotesModal(payout.id);
                                                                        setNotes(payout.adminNotes || '');
                                                                    }}
                                                                    className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                                                    title="Reject"
                                                                >
                                                                    <XCircle className="w-5 h-5" />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="text-xs font-bold text-slate-400 italic">No actions available</div>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="py-20 text-center">
                                    <Clock className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                                    <p className="text-sm font-black text-slate-300 uppercase tracking-widest">No payout requests found</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {affiliates.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-6">
                                                <th className="px-6 py-4">Affiliate</th>
                                                <th className="px-6 py-4">Total Earnings</th>
                                                <th className="px-6 py-4">Balance</th>
                                                <th className="px-6 py-4">Withdrawals</th>
                                                <th className="px-6 py-4">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {affiliates.map((aff) => (
                                                <tr key={aff.id} className="group hover:bg-slate-50/50 transition-all">
                                                    <td className="px-6 py-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-black text-slate-300 uppercase">
                                                                {aff.user?.fullName?.[0] || 'A'}
                                                            </div>
                                                            <div>
                                                                <div className="font-black text-slate-900">{aff.user?.fullName || 'Unknown'}</div>
                                                                <div className="text-[10px] text-slate-400 font-bold uppercase">{aff.referralCode}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-6 font-black text-slate-900">Rs. {aff.totalEarnings}</td>
                                                    <td className="px-6 py-6 font-black text-emerald-600">Rs. {aff.balance}</td>
                                                    <td className="px-6 py-6 text-slate-500 font-bold">Rs. {aff.totalWithdrawals}</td>
                                                    <td className="px-6 py-6">
                                                        <span className="px-2 py-1 bg-slate-100 text-slate-500 rounded-full text-[9px] font-black uppercase tracking-widest">{aff.status}</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="py-20 text-center">
                                    <Users className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                                    <p className="text-sm font-black text-slate-300 uppercase tracking-widest">No affiliates found</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Notes Modal for Rejection */}
            <AnimatePresence>
                {showNotesModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowNotesModal(null)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                            className="relative w-full max-w-md bg-white rounded-[40px] shadow-2xl p-10"
                        >
                            <h3 className="text-2xl font-black text-slate-900 mb-2">Reject Request</h3>
                            <p className="text-slate-500 text-sm mb-6 font-medium">Please provide a reason for rejecting this payout request. This will be visible to the user.</p>
                            
                            <textarea 
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-red-500 outline-none font-bold mb-6"
                                placeholder="Reason for rejection..."
                                rows={4}
                            />

                            <div className="flex gap-4">
                                <button 
                                    onClick={() => setShowNotesModal(null)}
                                    className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-sm"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={() => handleUpdateStatus(showNotesModal, 'rejected')}
                                    disabled={processingId === showNotesModal}
                                    className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2"
                                >
                                    {processingId ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Reject Request'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
