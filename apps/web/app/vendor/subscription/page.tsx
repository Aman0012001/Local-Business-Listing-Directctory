"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CreditCard, CheckCircle2, Clock, Zap, Crown, Building2, Check,
    AlertTriangle, FileText, Download, X, ChevronRight, Loader2,
    Calendar, Receipt, BadgeCheck, Sparkles, RefreshCw, Eye, ChevronLeft
} from 'lucide-react';
import { api } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';

/* ─── Types ─────────────────────────────────────────────────────────────── */
interface Plan {
    id: string;
    name: string;
    planType: string;
    description: string;
    price: number | string;
    billingCycle: string;
    maxListings: number;
    isFeatured: boolean;
    isActive: boolean;
    dashboardFeatures: Record<string, boolean>;
}

interface Subscription {
    id: string;
    status: string;
    startDate: string;
    endDate: string;
    amount: number;
    plan: Plan;
    autoRenew: boolean;
}

interface Invoice {
    id: string;
    invoiceNumber: string;
    amount: number;
    currency: string;
    status: string;
    paidAt: string;
    createdAt: string;
    paymentGateway: string;
    subscription?: { plan?: Plan };
}

/* ─── Invoice Modal ─────────────────────────────────────────────────────── */
function InvoiceModal({ invoiceId, onClose, user }: { invoiceId: string; onClose: () => void; user: any }) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const printRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        api.subscriptions.getInvoice(invoiceId).then(setData).catch(console.error).finally(() => setLoading(false));
    }, [invoiceId]);

    const handlePrint = () => {
        if (!printRef.current) return;
        const content = printRef.current.innerHTML;
        const w = window.open('', '_blank');
        if (!w) return;
        w.document.write(`<html><head><title>Invoice</title>
            <style>
                body { font-family: system-ui, sans-serif; padding: 40px; color: #0f172a; }
                .logo { font-size: 24px; font-weight: 900; color: #f97316; }
                table { width: 100%; border-collapse: collapse; }
                th, td { padding: 12px 16px; text-align: left; }
                th { background: #f8fafc; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8; }
                .badge { display: inline-block; padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 700; background: #dcfce7; color: #16a34a; }
                .total-row { border-top: 2px solid #f1f5f9; font-weight: 900; }
            </style>
        </head><body>${content}</body></html>`);
        w.document.close();
        w.print();
    };

    const txn = data?.transaction;
    const vendor = data?.vendor;
    const userInfo = data?.user;
    const plan = txn?.subscription?.plan;
    const invDate = txn?.paidAt ? new Date(txn.paidAt) : new Date(txn?.createdAt);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.9, y: 20, opacity: 0 }}
                className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-orange-50 flex items-center justify-center">
                            <Receipt className="w-5 h-5 text-orange-500" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-slate-900">Invoice</h2>
                            {txn && <p className="text-xs text-slate-400 font-bold">{txn.invoiceNumber || txn.id}</p>}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {!loading && txn && (
                            <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black hover:bg-black transition-colors">
                                <Download className="w-3.5 h-3.5" /> Print / Save PDF
                            </button>
                        )}
                        <button onClick={onClose} className="w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="overflow-y-auto max-h-[75vh]">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
                        </div>
                    ) : !txn ? (
                        <div className="text-center py-16 text-slate-400 font-bold">Invoice not found</div>
                    ) : (
                        <div ref={printRef} className="p-8">
                            {/* Invoice Header */}
                            <div className="flex items-start justify-between mb-10">
                                <div>
                                    <div className="logo text-2xl font-black text-orange-500 mb-1">naampata</div>
                                    <p className="text-xs text-slate-400 font-bold">Business Listings Platform</p>
                                </div>
                                <div className="text-right">
                                    <div className="inline-block px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-black uppercase tracking-wider mb-2">
                                        {txn.status === 'completed' ? '✓ Paid' : txn.status}
                                    </div>
                                    <p className="text-sm font-black text-slate-900">{txn.invoiceNumber || `INV-${txn.id.slice(0, 8).toUpperCase()}`}</p>
                                    <p className="text-xs text-slate-400 font-bold mt-0.5">
                                        {invDate.toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </p>
                                </div>
                            </div>

                            {/* Billed To */}
                            <div className="grid grid-cols-2 gap-8 mb-10 pb-8 border-b border-slate-100">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-2">Billed To</p>
                                    <p className="font-black text-slate-900">{vendor?.businessName || userInfo?.fullName}</p>
                                    <p className="text-sm text-slate-500 font-bold mt-1">{userInfo?.email}</p>
                                    {userInfo?.phone && <p className="text-sm text-slate-500 font-bold">{userInfo?.phone}</p>}
                                    {vendor?.ntnNumber && <p className="text-xs text-slate-400 font-bold mt-1">NTN: {vendor.ntnNumber}</p>}
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-2">Payment Details</p>
                                    <p className="text-sm font-black text-slate-900">Method: {txn.paymentGateway || 'Online'}</p>
                                    <p className="text-sm text-slate-500 font-bold mt-1">
                                        Billing: {txn.subscription?.plan?.billingCycle || 'Monthly'}
                                    </p>
                                    {txn.paidAt && (
                                        <p className="text-xs text-slate-400 font-bold mt-1">
                                            Paid: {new Date(txn.paidAt).toLocaleDateString('en-PK')}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Items Table */}
                            <table className="w-full mb-6">
                                <thead>
                                    <tr className="bg-slate-50 rounded-xl">
                                        <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-400 rounded-l-xl">Description</th>
                                        <th className="px-4 py-3 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Period</th>
                                        <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-widest text-slate-400 rounded-r-xl">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-slate-50">
                                        <td className="px-4 py-4">
                                            <p className="font-black text-slate-900">{plan?.name || 'Subscription Plan'}</p>
                                            <p className="text-xs text-slate-400 font-bold mt-0.5">
                                                {plan?.planType?.toUpperCase()} · Up to {plan?.maxListings || 1} listing(s)
                                            </p>
                                        </td>
                                        <td className="px-4 py-4 text-center text-sm text-slate-500 font-bold">
                                            {plan?.billingCycle || 'Monthly'}
                                        </td>
                                        <td className="px-4 py-4 text-right font-black text-slate-900">
                                            PKR {Number(txn.amount).toLocaleString()}
                                        </td>
                                    </tr>
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colSpan={2} className="px-4 py-4 text-right text-sm font-black text-slate-500 uppercase tracking-wider">Total</td>
                                        <td className="px-4 py-4 text-right text-xl font-black text-slate-900">
                                            PKR {Number(txn.amount).toLocaleString()}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>

                            {/* Footer note */}
                            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                                <p className="text-xs text-slate-400 font-bold">Thank you for your business! For queries, contact support@naampata.com</p>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}

/* ─── Plan Card ─────────────────────────────────────────────────────────── */
function PlanCard({ plan, isActive, currentPrice, onSelect, loading }: { plan: Plan; isActive: boolean; currentPrice?: number; onSelect: () => void; loading: boolean }) {
    const getColor = (type: string) => {
        const colors: Record<string, { bg: string; text: string; border: string; icon: string; accent: string }> = {
            free: { bg: 'bg-slate-50', text: 'text-slate-500', border: 'border-slate-200', icon: 'text-slate-400', accent: 'bg-slate-100' },
            basic: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', icon: 'text-blue-500', accent: 'bg-blue-100' },
            premium: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', icon: 'text-amber-500', accent: 'bg-amber-100' },
            enterprise: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200', icon: 'text-rose-500', accent: 'bg-rose-50' },
        };
        return colors[type] || colors.basic;
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'free': return <Clock className="w-5 h-5" />;
            case 'basic': return <Zap className="w-5 h-5" />;
            case 'premium': return <Crown className="w-5 h-5" />;
            case 'enterprise': return <Building2 className="w-5 h-5" />;
            default: return <CreditCard className="w-5 h-5" />;
        }
    };

    const clr = getColor(plan.planType);
    const planPrice = Number(plan.price);
    const isUpgrade = currentPrice !== undefined && planPrice > currentPrice;
    const isDowngrade = currentPrice !== undefined && planPrice < currentPrice;

    return (
        <motion.div
            whileHover={{ y: -4 }}
            className={`relative rounded-2xl border-2 p-6 flex flex-col transition-all ${isActive
                ? 'border-orange-400 bg-gradient-to-b from-orange-50 to-white shadow-lg shadow-orange-100'
                : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-md'
                }`}
        >
            {isActive && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full whitespace-nowrap">
                    ✓ Current Plan
                </div>
            )}
            {plan.isFeatured && !isActive && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-full whitespace-nowrap">
                    ⭐ Most Popular
                </div>
            )}

            <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl ${clr.accent} ${clr.icon} flex items-center justify-center`}>
                    {getIcon(plan.planType)}
                </div>
                <div>
                    <h3 className="font-black text-slate-900 text-base">{plan.name}</h3>
                    <p className={`text-[10px] font-black uppercase tracking-widest ${clr.text}`}>{plan.planType}</p>
                </div>
            </div>

            <div className="mb-5">
                <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-slate-900">PKR {planPrice.toLocaleString()}</span>
                    <span className="text-slate-400 font-bold text-sm">/{plan.billingCycle}</span>
                </div>
                <p className="text-slate-500 font-bold text-sm mt-2 leading-relaxed">{plan.description || 'Grow your business visibility'}</p>
            </div>

            <div className="space-y-2.5 flex-1 mb-6">
                {plan.dashboardFeatures && Object.entries(plan.dashboardFeatures).map(([key, enabled]) => (
                    enabled && (
                        <div key={key} className="flex items-start gap-2.5">
                            <div className="mt-0.5 w-4 h-4 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                                <Check className="w-2.5 h-2.5 text-emerald-500 stroke-[3]" />
                            </div>
                            <span className="text-slate-600 font-bold text-sm leading-tight text-capitalize">
                                {key.replace('show', '').replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                        </div>
                    )
                ))}
                <div className="flex items-center gap-2.5 pt-1">
                    <div className="w-4 h-4 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-2.5 h-2.5 text-blue-500" />
                    </div>
                    <span className="font-black text-slate-700 text-sm">{plan.maxListings} Listing{plan.maxListings !== 1 ? 's' : ''}</span>
                </div>
            </div>

            <button
                onClick={onSelect}
                disabled={isActive || loading}
                className={`w-full py-3 rounded-xl font-black text-sm transition-all active:scale-[0.97] flex items-center justify-center gap-2 ${isActive
                    ? 'bg-orange-50 text-orange-500 cursor-default'
                    : isUpgrade
                        ? 'bg-[#FF7A30] hover:bg-[#E86920] text-white shadow-lg shadow-orange-900/10'
                        : 'bg-slate-900 hover:bg-black text-white shadow-lg shadow-slate-900/10'
                    } disabled:opacity-60`}
            >
                {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : isActive ? (
                    <><CheckCircle2 className="w-4 h-4" /> Active</>
                ) : isUpgrade ? (
                    <><Sparkles className="w-4 h-4" /> Upgrade Plan</>
                ) : isDowngrade ? (
                    <><RefreshCw className="w-4 h-4" /> Downgrade Plan</>
                ) : (
                    <>Activate Plan <ChevronRight className="w-4 h-4" /></>
                )}
            </button>
        </motion.div>
    );
}


/* ─── Main Page ─────────────────────────────────────────────────────────── */
export default function VendorSubscriptionPage() {
    const { user, syncProfile } = useAuth();
    const [plans, setPlans] = useState<Plan[]>([]);
    const [activeSub, setActiveSub] = useState<Subscription | null>(null);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loadingPage, setLoadingPage] = useState(true);
    const [checkingOut, setCheckingOut] = useState<string | null>(null);
    const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
    const [tab, setTab] = useState<'plan' | 'invoices'>('plan');
    const [successMsg, setSuccessMsg] = useState('');

    const fetchAll = async () => {
        setLoadingPage(true);
        try {
            const [p, s, inv] = await Promise.all([
                api.subscriptions.getPlans(),
                api.subscriptions.getActive().catch(() => null),
                api.subscriptions.getMyInvoices().catch(() => []),
            ]);
            setPlans(Array.isArray(p) ? p : []);
            setActiveSub(s);
            setInvoices(Array.isArray(inv) ? inv : []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingPage(false);
        }
    };

    useEffect(() => { fetchAll(); }, []);

    const handleSelectPlan = async (plan: Plan) => {
        const isUpgrade = activeSub && Number(plan.price) > Number(activeSub.plan.price);
        const isDowngrade = activeSub && Number(plan.price) < Number(activeSub.plan.price);

        let confirmMsg = 'Activate this plan?';
        if (isUpgrade) confirmMsg = `Are you sure you want to upgrade to ${plan.name}? Your features will be expanded immediately.`;
        if (isDowngrade) confirmMsg = `Are you sure you want to downgrade to ${plan.name}? Some features might be restricted.`;
        if (activeSub && !isUpgrade && !isDowngrade) confirmMsg = `Switch to ${plan.name}? Current plan will be replaced.`;

        if (!confirm(confirmMsg)) return;

        setCheckingOut(plan.id);
        try {
            if (activeSub) {
                // Use the new changePlan endpoint
                await api.subscriptions.changePlan(plan.id);
                setSuccessMsg(`🎉 Successfully switched to ${plan.name}!`);
            } else {
                // Initial activation
                await api.subscriptions.mockCheckout(plan.id);
                setSuccessMsg('🎉 Plan activated successfully!');
            }
            setTimeout(() => setSuccessMsg(''), 4000);
            await fetchAll();
            await syncProfile();
        } catch (err: any) {
            alert(err.message || 'Failed to switch plan');
        } finally {
            setCheckingOut(null);
        }
    };

    // Days until expiry
    const daysLeft = activeSub ? Math.ceil((new Date(activeSub.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;
    const isExpiringSoon = daysLeft !== null && daysLeft <= 4;

    const statusBadge = (status: string) => {
        const map: Record<string, string> = {
            completed: 'bg-emerald-50 text-emerald-700',
            pending: 'bg-amber-50 text-amber-700',
            failed: 'bg-red-50 text-red-700',
            refunded: 'bg-slate-100 text-slate-500',
        };
        return map[status] || 'bg-slate-100 text-slate-500';
    };

    if (loadingPage) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-slate-200" />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto pb-20 space-y-8">
            {/* ── Header ── */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#0B2244] via-[#0D2E61] to-[#1a3a70] p-8 shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                <div className="relative">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-2xl bg-orange-500/20 flex items-center justify-center">
                            <CreditCard className="w-5 h-5 text-orange-400" />
                        </div>
                        <h1 className="text-2xl font-black text-white">Subscription & Billing</h1>
                    </div>
                    <p className="text-blue-200 font-bold text-sm">Manage your listing plan, view invoices, and upgrade anytime.</p>
                </div>
            </div>

            {/* ── Success Banner ── */}
            <AnimatePresence>
                {successMsg && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-700 font-black flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                        {successMsg}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Active Plan Banner ── */}
            {activeSub ? (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-2xl p-6 border-2 ${isExpiringSoon
                        ? 'bg-red-50 border-red-200'
                        : 'bg-gradient-to-r from-slate-900 to-slate-800 border-transparent'
                        }`}
                >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isExpiringSoon ? 'bg-red-100' : 'bg-white/10'}`}>
                                {isExpiringSoon
                                    ? <AlertTriangle className="w-6 h-6 text-red-500" />
                                    : <BadgeCheck className="w-6 h-6 text-emerald-400" />
                                }
                            </div>
                            <div>
                                <p className={`text-xs font-black uppercase tracking-widest mb-1 ${isExpiringSoon ? 'text-red-400' : 'text-slate-400'}`}>
                                    {isExpiringSoon ? '⚠ Expiring Soon' : 'Active Plan'}
                                </p>
                                <h2 className={`text-xl font-black ${isExpiringSoon ? 'text-red-700' : 'text-white'}`}>
                                    {activeSub.plan?.name}
                                </h2>
                                <p className={`text-sm font-bold mt-0.5 ${isExpiringSoon ? 'text-red-500' : 'text-slate-400'}`}>
                                    {daysLeft !== null && daysLeft > 0
                                        ? `Expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''} · ${new Date(activeSub.endDate).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' })}`
                                        : `Expires: ${new Date(activeSub.endDate).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' })}`
                                    }
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className={`text-center px-5 py-3 rounded-xl ${isExpiringSoon ? 'bg-red-100' : 'bg-white/10'}`}>
                                <p className={`text-xs font-black uppercase tracking-wider ${isExpiringSoon ? 'text-red-400' : 'text-slate-400'}`}>Amount</p>
                                <p className={`text-lg font-black ${isExpiringSoon ? 'text-red-700' : 'text-white'}`}>PKR {Number(activeSub.amount).toLocaleString()}</p>
                            </div>
                            {isExpiringSoon && (
                                <button
                                    onClick={() => setTab('plan')}
                                    className="flex items-center gap-2 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-black text-sm transition-colors"
                                >
                                    <RefreshCw className="w-4 h-4" /> Renew Now
                                </button>
                            )}
                        </div>
                    </div>
                </motion.div>
            ) : (
                <div className="rounded-2xl p-6 bg-amber-50 border-2 border-amber-200 flex items-center gap-4">
                    <AlertTriangle className="w-8 h-8 text-amber-500 flex-shrink-0" />
                    <div>
                        <h3 className="font-black text-amber-900">No Active Subscription</h3>
                        <p className="text-amber-700 font-bold text-sm mt-0.5">Choose a plan below to start listing your business.</p>
                    </div>
                </div>
            )}

            {/* ── Tabs ── */}
            <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl w-fit">
                {['plan', 'invoices'].map(t => (
                    <button
                        key={t}
                        onClick={() => setTab(t as any)}
                        className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all capitalize ${tab === t ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        {t === 'plan' ? '📦 Plans' : '🧾 Invoices'}
                    </button>
                ))}
            </div>

            {/* ── Tab Content ── */}
            <AnimatePresence mode="wait">
                {tab === 'plan' && (
                    <motion.div key="plan" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }}>
                        {plans.length === 0 ? (
                            <div className="text-center py-20 text-slate-400 font-bold">No plans available yet. Please check back later.</div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {plans.map(plan => (
                                    <PlanCard
                                        key={plan.id}
                                        plan={plan}
                                        isActive={activeSub?.plan?.id === plan.id}
                                        currentPrice={activeSub ? Number(activeSub.plan.price) : undefined}
                                        onSelect={() => handleSelectPlan(plan)}
                                        loading={checkingOut === plan.id}
                                    />
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}

                {tab === 'invoices' && (
                    <motion.div key="invoices" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }}>
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                            <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                                    <Receipt className="w-4 h-4 text-orange-500" />
                                </div>
                                <h3 className="font-black text-slate-900">Invoice History</h3>
                                <span className="ml-auto text-xs font-black text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">{invoices.length} records</span>
                            </div>
                            {invoices.length === 0 ? (
                                <div className="text-center py-16 text-slate-400">
                                    <Receipt className="w-10 h-10 mx-auto mb-3 opacity-30" />
                                    <p className="font-bold">No invoices yet</p>
                                    <p className="text-sm mt-1">Invoices will appear here after plan activation.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-slate-50">
                                                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-300">Invoice #</th>
                                                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-300">Plan</th>
                                                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-300">Amount</th>
                                                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-300">Date</th>
                                                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-300">Status</th>
                                                <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-300">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {invoices.map((inv, i) => (
                                                <motion.tr
                                                    key={inv.id}
                                                    initial={{ opacity: 0, y: 5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: i * 0.04 }}
                                                    className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                                                >
                                                    <td className="px-6 py-4">
                                                        <p className="font-black text-slate-900 text-sm">{inv.invoiceNumber || `INV-${inv.id.slice(0, 8).toUpperCase()}`}</p>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-bold text-slate-600">
                                                        {inv.subscription?.plan?.name || '—'}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="font-black text-slate-900">PKR {Number(inv.amount).toLocaleString()}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-bold text-slate-400">
                                                        {new Date(inv.paidAt || inv.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-black ${statusBadge(inv.status)}`}>
                                                            {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button
                                                            onClick={() => setSelectedInvoiceId(inv.id)}
                                                            className="flex items-center gap-1.5 ml-auto px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl font-black text-xs transition-colors"
                                                        >
                                                            <Eye className="w-3.5 h-3.5" /> View
                                                        </button>
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

            {/* ── Invoice Modal ── */}
            <AnimatePresence>
                {selectedInvoiceId && (
                    <InvoiceModal
                        invoiceId={selectedInvoiceId}
                        onClose={() => setSelectedInvoiceId(null)}
                        user={user}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
