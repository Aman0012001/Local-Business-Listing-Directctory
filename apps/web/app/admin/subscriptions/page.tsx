"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Receipt, Users, CreditCard, Check, X, Search, Loader2,
    AlertTriangle, CheckCircle2, XCircle, Clock, Zap, Crown,
    Building2, RefreshCw, ChevronRight, Plus, Calendar, Eye,
    TrendingUp, Bell
} from 'lucide-react';
import { api } from '../../../lib/api';

/* ─── Types ─────────────────────────────────────────────────────────────── */
interface Subscription {
    id: string;
    status: string;
    startDate: string;
    endDate: string;
    amount: number;
    currency: string;
    createdAt: string;
    vendor?: {
        id: string;
        businessName: string;
        user?: { fullName: string; email: string };
    };
    plan?: { name: string; planType: string; price: number };
}

interface Transaction {
    id: string;
    invoiceNumber: string;
    amount: number;
    currency: string;
    status: string;
    paymentGateway: string;
    createdAt: string;
    paidAt?: string;
    vendor?: { businessName: string; user?: { fullName: string; email: string } };
    subscription?: { plan?: { name: string } };
}

/* ─── Status Badge ───────────────────────────────────────────────────────── */
const StatusBadge = ({ status }: { status: string }) => {
    const map: Record<string, { label: string; cls: string; Icon: any }> = {
        active: { label: 'Active', cls: 'bg-emerald-50 text-emerald-700', Icon: CheckCircle2 },
        cancelled: { label: 'Cancelled', cls: 'bg-slate-100 text-slate-500', Icon: XCircle },
        expired: { label: 'Expired', cls: 'bg-red-50 text-red-600', Icon: AlertTriangle },
        suspended: { label: 'Suspended', cls: 'bg-amber-50 text-amber-600', Icon: Clock },
        completed: { label: 'Paid', cls: 'bg-emerald-50 text-emerald-700', Icon: Check },
        pending: { label: 'Pending', cls: 'bg-amber-50 text-amber-600', Icon: Clock },
        failed: { label: 'Failed', cls: 'bg-red-50 text-red-600', Icon: XCircle },
    };
    const cfg = map[status] || { label: status, cls: 'bg-slate-100 text-slate-500', Icon: Clock };
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black ${cfg.cls}`}>
            <cfg.Icon className="w-3 h-3" />
            {cfg.label}
        </span>
    );
};

/* ─── Assign Plan Modal ──────────────────────────────────────────────────── */
function AssignPlanModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
    const [vendors, setVendors] = useState<any[]>([]);
    const [plans, setPlans] = useState<any[]>([]);
    const [selectedVendor, setSelectedVendor] = useState('');
    const [selectedPlan, setSelectedPlan] = useState('');
    const [durationDays, setDurationDays] = useState(30);
    const [vendorSearch, setVendorSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        Promise.all([
            api.admin.getVendors(1, 100),
            api.subscriptions.getPlans(),
        ]).then(([v, p]) => {
            setVendors(v?.data || []);
            setPlans(Array.isArray(p) ? p : []);
        }).catch(console.error).finally(() => setFetching(false));
    }, []);

    const filteredVendors = vendors.filter(v =>
        (v.user?.fullName || '').toLowerCase().includes(vendorSearch.toLowerCase()) ||
        (v.user?.email || '').toLowerCase().includes(vendorSearch.toLowerCase()) ||
        (v.businessName || '').toLowerCase().includes(vendorSearch.toLowerCase())
    );

    const handleAssign = async () => {
        if (!selectedVendor || !selectedPlan) {
            setError('Please select both a vendor and a plan.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await api.subscriptions.adminAssign({ vendorId: selectedVendor, planId: selectedPlan, durationDays });
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to assign plan');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-black text-slate-900">Assign Plan to Vendor</h2>
                        <p className="text-sm font-bold text-slate-400 mt-0.5">Manually activate a subscription</p>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-xl hover:bg-slate-50 flex items-center justify-center text-slate-400">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-8 space-y-5">
                    {fetching ? (
                        <div className="flex items-center justify-center py-10">
                            <Loader2 className="w-7 h-7 animate-spin text-slate-300" />
                        </div>
                    ) : (
                        <>
                            {/* Vendor Search */}
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Select Vendor</label>
                                <div className="relative mb-2">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        value={vendorSearch}
                                        onChange={e => setVendorSearch(e.target.value)}
                                        placeholder="Search by name or email..."
                                        className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200"
                                    />
                                </div>
                                <select
                                    value={selectedVendor}
                                    onChange={e => setSelectedVendor(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200"
                                >
                                    <option value="">-- Select Vendor --</option>
                                    {filteredVendors.map(v => (
                                        <option key={v.id} value={v.id}>
                                            {v.businessName || v.user?.fullName || v.user?.email}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Plan */}
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Select Plan</label>
                                <select
                                    value={selectedPlan}
                                    onChange={e => setSelectedPlan(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200"
                                >
                                    <option value="">-- Select Plan --</option>
                                    {plans.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.name} — PKR {Number(p.price).toLocaleString()}/{p.billingCycle}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Duration */}
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Duration (Days)</label>
                                <input
                                    type="number"
                                    min={1}
                                    max={365}
                                    value={durationDays}
                                    onChange={e => setDurationDays(Number(e.target.value))}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200"
                                />
                            </div>

                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-bold">
                                    {error}
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={onClose}
                                    className="flex-1 py-3 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-xl font-black text-sm transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAssign}
                                    disabled={loading}
                                    className="flex-[2] py-3 bg-slate-900 hover:bg-black text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                    Assign Plan
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}

/* ─── Main Page ─────────────────────────────────────────────────────────── */
export default function AdminSubscriptionsPage() {
    const [tab, setTab] = useState<'subscriptions' | 'transactions'>('subscriptions');
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [totalSubs, setTotalSubs] = useState(0);
    const [totalTxns, setTotalTxns] = useState(0);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [assignModal, setAssignModal] = useState(false);
    const [triggeringCron, setTriggeringCron] = useState(false);
    const [cronResult, setCronResult] = useState<{ notified: number; errors: number } | null>(null);
    const LIMIT = 15;

    const fetchData = async () => {
        setLoading(true);
        try {
            if (tab === 'subscriptions') {
                const r = await api.subscriptions.adminGetAll(page, LIMIT);
                setSubscriptions(r.data || []);
                setTotalSubs(r.total || 0);
            } else {
                const r = await api.subscriptions.adminGetTransactions(page, LIMIT);
                setTransactions(r.data || []);
                setTotalTxns(r.total || 0);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [tab, page]);

    const handleCancelSub = async (subId: string, vendorName: string) => {
        if (!confirm(`Cancel subscription for ${vendorName}? This cannot be undone easily.`)) return;
        try {
            await api.subscriptions.adminCancel(subId);
            fetchData();
        } catch (err: any) {
            alert(err.message || 'Failed to cancel');
        }
    };

    const handleTriggerExpiryCheck = async () => {
        setTriggeringCron(true);
        setCronResult(null);
        try {
            const res = await api.subscriptions.adminTriggerExpiryCheck();
            setCronResult({ notified: res.notified, errors: res.errors });
        } catch (err: any) {
            alert(err.message || 'Failed to trigger');
        } finally {
            setTriggeringCron(false);
        }
    };

    const daysLeft = (endDate: string) => {
        const d = Math.ceil((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return d;
    };

    const totalPages = Math.ceil((tab === 'subscriptions' ? totalSubs : totalTxns) / LIMIT);

    return (
        <div className="max-w-7xl mx-auto pb-20 space-y-8">
            {/* ── Header ── */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Subscriptions</h1>
                    <p className="text-slate-400 font-bold mt-2 flex items-center gap-2">
                        <Receipt className="w-4 h-4 text-orange-500" />
                        Manage vendor plans, invoices, and expiry notifications.
                    </p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                    {/* Trigger Expiry Check */}
                    <button
                        onClick={handleTriggerExpiryCheck}
                        disabled={triggeringCron}
                        className="flex items-center gap-2 px-5 py-3 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-2xl font-black text-sm border border-amber-200 transition-colors disabled:opacity-60"
                    >
                        {triggeringCron ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />}
                        Send Expiry Reminders
                    </button>
                    {/* Assign Plan */}
                    <button
                        onClick={() => setAssignModal(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-black text-white rounded-2xl font-black text-sm transition-colors shadow-lg shadow-slate-900/10"
                    >
                        <Plus className="w-4 h-4" />
                        Assign Plan to Vendor
                    </button>
                </div>
            </div>

            {/* ── Cron Result ── */}
            <AnimatePresence>
                {cronResult && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-700 font-bold text-sm flex items-center gap-3"
                    >
                        <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                        Expiry check complete. <strong>{cronResult.notified}</strong> vendors notified, <strong>{cronResult.errors}</strong> errors.
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Stats Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                    { label: 'Total Subscriptions', value: totalSubs, icon: CreditCard, color: 'blue' },
                    { label: 'Total Transactions', value: totalTxns, icon: Receipt, color: 'emerald' },
                    {
                        label: 'Active Now',
                        value: subscriptions.filter(s => s.status === 'active').length,
                        icon: CheckCircle2,
                        color: 'orange'
                    },
                ].map((card) => (
                    <div key={card.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl bg-${card.color}-50 flex items-center justify-center flex-shrink-0`}>
                            <card.icon className={`w-6 h-6 text-${card.color}-500`} />
                        </div>
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest text-slate-400">{card.label}</p>
                            <p className="text-3xl font-black text-slate-900 mt-0.5">{card.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Tabs ── */}
            <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl w-fit">
                {[
                    { key: 'subscriptions', label: '📋 Subscriptions' },
                    { key: 'transactions', label: '💳 Transactions' },
                ].map(t => (
                    <button
                        key={t.key}
                        onClick={() => { setTab(t.key as any); setPage(1); }}
                        className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all ${tab === t.key ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* ── Content ── */}
            <AnimatePresence mode="wait">
                {tab === 'subscriptions' && (
                    <motion.div key="subs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                            <div className="border-b border-slate-100 px-6 py-4 flex items-center gap-3">
                                <CreditCard className="w-4 h-4 text-slate-400" />
                                <h3 className="font-black text-slate-900">All Vendor Subscriptions</h3>
                                <span className="ml-auto text-xs font-black text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">{totalSubs} total</span>
                            </div>

                            {loading ? (
                                <div className="flex items-center justify-center py-16">
                                    <Loader2 className="w-8 h-8 animate-spin text-slate-200" />
                                </div>
                            ) : subscriptions.length === 0 ? (
                                <div className="text-center py-16 text-slate-400 font-bold">No subscriptions found.</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-slate-50">
                                                {['Vendor', 'Plan', 'Status', 'Start', 'Expires', 'Amount', 'Actions'].map(h => (
                                                    <th key={h} className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-300">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {subscriptions.map((sub, i) => {
                                                const days = daysLeft(sub.endDate);
                                                const isWarn = sub.status === 'active' && days <= 4 && days >= 0;
                                                const vendorName = sub.vendor?.businessName || sub.vendor?.user?.fullName || '—';
                                                return (
                                                    <motion.tr
                                                        key={sub.id}
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        transition={{ delay: i * 0.03 }}
                                                        className={`border-b border-slate-50 hover:bg-slate-50/30 transition-colors ${isWarn ? 'bg-amber-50/30' : ''}`}
                                                    >
                                                        <td className="px-5 py-4">
                                                            <p className="font-black text-slate-900 text-sm">{vendorName}</p>
                                                            <p className="text-xs text-slate-400 font-bold">{sub.vendor?.user?.email || '—'}</p>
                                                        </td>
                                                        <td className="px-5 py-4 text-sm font-bold text-slate-600">{sub.plan?.name || '—'}</td>
                                                        <td className="px-5 py-4"><StatusBadge status={sub.status} /></td>
                                                        <td className="px-5 py-4 text-xs font-bold text-slate-400">
                                                            {new Date(sub.startDate).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                        </td>
                                                        <td className="px-5 py-4">
                                                            <p className="text-xs font-bold text-slate-600">
                                                                {new Date(sub.endDate).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                            </p>
                                                            {isWarn && (
                                                                <p className="text-[10px] font-black text-amber-600 mt-0.5">⚠ {days}d left</p>
                                                            )}
                                                        </td>
                                                        <td className="px-5 py-4 font-black text-slate-900 text-sm">
                                                            PKR {Number(sub.amount).toLocaleString()}
                                                        </td>
                                                        <td className="px-5 py-4">
                                                            {sub.status === 'active' && (
                                                                <button
                                                                    onClick={() => handleCancelSub(sub.id, vendorName)}
                                                                    className="flex items-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-black text-xs transition-colors"
                                                                >
                                                                    <XCircle className="w-3.5 h-3.5" /> Cancel
                                                                </button>
                                                            )}
                                                        </td>
                                                    </motion.tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {tab === 'transactions' && (
                    <motion.div key="txns" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                            <div className="border-b border-slate-100 px-6 py-4 flex items-center gap-3">
                                <Receipt className="w-4 h-4 text-slate-400" />
                                <h3 className="font-black text-slate-900">All Transactions</h3>
                                <span className="ml-auto text-xs font-black text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">{totalTxns} total</span>
                            </div>

                            {loading ? (
                                <div className="flex items-center justify-center py-16">
                                    <Loader2 className="w-8 h-8 animate-spin text-slate-200" />
                                </div>
                            ) : transactions.length === 0 ? (
                                <div className="text-center py-16 text-slate-400 font-bold">No transactions found.</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-slate-50">
                                                {['Invoice #', 'Vendor', 'Plan', 'Amount', 'Gateway', 'Status', 'Date'].map(h => (
                                                    <th key={h} className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-300">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {transactions.map((txn, i) => (
                                                <motion.tr
                                                    key={txn.id}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ delay: i * 0.03 }}
                                                    className="border-b border-slate-50 hover:bg-slate-50/30 transition-colors"
                                                >
                                                    <td className="px-5 py-4">
                                                        <p className="font-black text-slate-900 text-sm">{txn.invoiceNumber || `INV-${txn.id.slice(0, 8).toUpperCase()}`}</p>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <p className="font-bold text-slate-700 text-sm">{txn.vendor?.businessName || txn.vendor?.user?.fullName || '—'}</p>
                                                        <p className="text-xs text-slate-400 font-bold">{txn.vendor?.user?.email || ''}</p>
                                                    </td>
                                                    <td className="px-5 py-4 text-sm font-bold text-slate-500">{txn.subscription?.plan?.name || '—'}</td>
                                                    <td className="px-5 py-4 font-black text-slate-900">PKR {Number(txn.amount).toLocaleString()}</td>
                                                    <td className="px-5 py-4 text-sm font-bold text-slate-400">{txn.paymentGateway || '—'}</td>
                                                    <td className="px-5 py-4"><StatusBadge status={txn.status} /></td>
                                                    <td className="px-5 py-4 text-xs font-bold text-slate-400">
                                                        {new Date(txn.paidAt || txn.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Pagination ── */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 font-black text-sm text-slate-500 disabled:opacity-40 transition-colors"
                    >
                        ← Prev
                    </button>
                    <span className="font-black text-slate-600 text-sm">Page {page} of {totalPages}</span>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 font-black text-sm text-slate-500 disabled:opacity-40 transition-colors"
                    >
                        Next →
                    </button>
                </div>
            )}

            {/* ── Assign Plan Modal ── */}
            <AnimatePresence>
                {assignModal && (
                    <AssignPlanModal
                        onClose={() => setAssignModal(false)}
                        onSuccess={fetchData}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
