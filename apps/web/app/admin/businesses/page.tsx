"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
    Briefcase, Search, RefreshCw, Loader2, CheckCircle2, XCircle,
    AlertCircle, Clock, MoreVertical, Trash2, MapPin, Tag,
    ExternalLink, ChevronLeft, ChevronRight, Store, Filter
} from 'lucide-react';
import { api, getImageUrl } from '../../../lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';

type BusinessStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

const STATUS_CONFIG: Record<BusinessStatus, { label: string; cls: string; Icon: any }> = {
    pending: { label: 'Pending', cls: 'bg-amber-50 text-amber-700 border-amber-200', Icon: Clock },
    approved: { label: 'Approved', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', Icon: CheckCircle2 },
    rejected: { label: 'Rejected', cls: 'bg-red-50 text-red-700 border-red-200', Icon: XCircle },
    suspended: { label: 'Suspended', cls: 'bg-slate-100 text-slate-600 border-slate-200', Icon: AlertCircle },
};

const StatusBadge = ({ status }: { status: BusinessStatus }) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${config.cls}`}>
            <config.Icon className="w-3 h-3" /> {config.label}
        </span>
    );
};

export default function AdminBusinessesPage() {
    const { user: currentUser } = useAuth();
    const [businesses, setBusinesses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | BusinessStatus>('all');
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState<any>({ total: 0, totalPages: 1 });
    const [openMenu, setOpenMenu] = useState<string | null>(null);
    const LIMIT = 10;

    const fetchBusinesses = useCallback(async (p = page, s = statusFilter, q = search) => {
        setLoading(true);
        try {
            const res = await api.admin.getBusinesses(p, LIMIT, s === 'all' ? undefined : s, q);
            setBusinesses(res.data || []);
            setMeta(res.meta || { total: 0, totalPages: 1 });
        } catch (err) {
            console.error('Failed to fetch businesses', err);
        } finally {
            setLoading(false);
        }
    }, [page, statusFilter, search]);

    useEffect(() => {
        const timer = setTimeout(() => fetchBusinesses(), 300);
        return () => clearTimeout(timer);
    }, [page, statusFilter, search, fetchBusinesses]);

    const handleModerate = async (id: string, status: BusinessStatus) => {
        setActionLoading(id + '-moderate');
        try {
            await api.admin.moderateBusiness(id, status);
            setBusinesses(prev => prev.map(b => b.id === id ? { ...b, status } : b));
        } catch (err: any) {
            alert(err.message || 'Failed to moderate business');
        } finally {
            setActionLoading(null);
            setOpenMenu(null);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to PERMANENTLY delete this business listing? This action cannot be undone.')) {
            return;
        }

        setActionLoading(id + '-delete');
        try {
            await api.admin.deleteBusiness(id);
            setBusinesses(prev => prev.filter(b => b.id !== id));
            setMeta((m: any) => ({ ...m, total: m.total - 1 }));
        } catch (err: any) {
            alert(err.message || 'Failed to delete business');
        } finally {
            setActionLoading(null);
            setOpenMenu(null);
        }
    };

    return (
        <div className="space-y-8 pb-20" onClick={() => setOpenMenu(null)}>
            {/* Header */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Business Management</h1>
                    <p className="text-slate-400 font-medium mt-1">
                        {meta.total} total listings — review, moderate, and manage business records.
                    </p>
                </div>
                <button
                    onClick={() => fetchBusinesses()}
                    className="flex items-center gap-2 px-5 py-3 bg-slate-100 hover:bg-slate-200 rounded-2xl font-bold text-slate-600 transition-all"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
                </button>
            </div>

            {/* Quick Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by business name, city, address..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-slate-300 placeholder:text-slate-400 text-sm shadow-sm transition-all"
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                    {(['all', 'pending', 'approved', 'rejected'] as const).map(s => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`px-5 py-3.5 rounded-2xl font-bold text-sm transition-all border whitespace-nowrap ${statusFilter === s
                                ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/20'
                                : 'bg-white border-slate-200 text-slate-500 hover:border-slate-400'
                                }`}
                        >
                            {s === 'all' ? 'All Listings' : s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            {loading && businesses.length === 0 ? (
                <div className="flex items-center justify-center py-32">
                    <Loader2 className="w-10 h-10 animate-spin text-slate-300" />
                </div>
            ) : businesses.length === 0 ? (
                <div className="bg-white rounded-[2.5rem] p-20 flex flex-col items-center text-center border-2 border-dashed border-slate-100">
                    <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6">
                        <Store className="w-10 h-10 text-slate-200" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900">No businesses found</h3>
                    <p className="text-slate-400 font-medium mt-2 max-w-xs">Try adjusting your search or filters to find what you're looking for.</p>
                </div>
            ) : (
                <div className="bg-white rounded-[2.5rem] border border-slate-100  shadow-slate-200/50 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-50">
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Business Listing</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Owner / Vendor</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Category</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence mode='popLayout'>
                                    {businesses.map((b, idx) => (
                                        <motion.tr
                                            key={b.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ delay: idx * 0.03 }}
                                            className="group border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors"
                                        >
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-14 h-14 rounded-2xl bg-slate-100 flex-shrink-0 overflow-hidden shadow-inner flex items-center justify-center">
                                                        {b.logoUrl ? (
                                                            <img src={getImageUrl(b.logoUrl) || ''} alt={b.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <Store className="w-6 h-6 text-slate-300" />
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-black text-slate-900 text-sm truncate group-hover:text-blue-600 transition-colors">{b.title}</p>
                                                        <p className="text-[11px] text-slate-400 font-bold flex items-center gap-1 mt-1">
                                                            <MapPin className="w-3 h-3" /> {b.city}, {b.state}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-slate-700">{b.vendor?.businessName || 'Individual Vendor'}</span>
                                                    <span className="text-[11px] text-slate-400 font-medium">{b.vendor?.businessEmail || 'No Email'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-600 rounded-xl text-[11px] font-bold border border-slate-100">
                                                    <Tag className="w-3 h-3" /> {b.category?.name || 'Uncategorized'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <StatusBadge status={b.status} />
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <div className="relative inline-block text-left" onClick={e => e.stopPropagation()}>
                                                    <button
                                                        onClick={() => setOpenMenu(openMenu === b.id ? null : b.id)}
                                                        className="w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-900 border border-transparent hover:border-slate-200"
                                                    >
                                                        {actionLoading?.startsWith(b.id) ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <MoreVertical className="w-4 h-4" />
                                                        )}
                                                    </button>

                                                    <AnimatePresence>
                                                        {openMenu === b.id && (
                                                            <motion.div
                                                                initial={{ opacity: 0, scale: 0.9, y: -10, x: 10 }}
                                                                animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                                                                exit={{ opacity: 0, scale: 0.9, y: -10, x: 10 }}
                                                                className="absolute right-0 top-12 z-50 bg-white rounded-3xl shadow-2xl shadow-slate-900/10 border border-slate-100 py-3 w-56 overflow-hidden"
                                                            >
                                                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-5 pb-2 border-b border-slate-50 mb-2">Moderate Listing</p>

                                                                {b.status !== 'approved' && (
                                                                    <button
                                                                        onClick={() => handleModerate(b.id, 'approved')}
                                                                        className="flex items-center gap-3 w-full px-5 py-3 text-sm font-bold text-emerald-600 hover:bg-emerald-50 transition-colors"
                                                                    >
                                                                        <CheckCircle2 className="w-4 h-4" /> Approve Listing
                                                                    </button>
                                                                )}

                                                                {b.status !== 'pending' && (
                                                                    <button
                                                                        onClick={() => handleModerate(b.id, 'pending')}
                                                                        className="flex items-center gap-3 w-full px-5 py-3 text-sm font-bold text-amber-600 hover:bg-amber-50 transition-colors"
                                                                    >
                                                                        <Clock className="w-4 h-4" /> Move to Pending
                                                                    </button>
                                                                )}

                                                                {b.status !== 'rejected' && (
                                                                    <button
                                                                        onClick={() => handleModerate(b.id, 'rejected')}
                                                                        className="flex items-center gap-3 w-full px-5 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
                                                                    >
                                                                        <XCircle className="w-4 h-4" /> Reject Listing
                                                                    </button>
                                                                )}

                                                                <div className="h-px bg-slate-50 my-2" />

                                                                <button
                                                                    onClick={() => window.open(`/listing/${b.slug}`, '_blank')}
                                                                    className="flex items-center gap-3 w-full px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                                                                >
                                                                    <ExternalLink className="w-4 h-4" /> View Public Page
                                                                </button>

                                                                {currentUser?.role === 'superadmin' && (
                                                                    <button
                                                                        onClick={() => handleDelete(b.id)}
                                                                        className="flex items-center gap-3 w-full px-5 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors mt-1"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" /> Delete Permanently
                                                                    </button>
                                                                )}
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>

                    {/* Footer / Pagination */}
                    {meta.totalPages > 1 && (
                        <div className="px-6 py-6 bg-slate-50/30 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <p className="text-xs text-slate-400 font-black uppercase tracking-widest">
                                Showing <span className="text-slate-900">{businesses.length}</span> of <span className="text-slate-900">{meta.total}</span> Listings
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    disabled={page === 1}
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    className="p-2.5 rounded-2xl border border-slate-200 bg-white text-slate-600 hover:border-slate-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <div className="flex items-center gap-1.5">
                                    {Array.from({ length: Math.min(5, meta.totalPages) }, (_, i) => {
                                        const p = Math.max(1, Math.min(meta.totalPages - 4, page - 2)) + i;
                                        if (p < 1 || p > meta.totalPages) return null;
                                        return (
                                            <button
                                                key={p}
                                                onClick={() => setPage(p)}
                                                className={`w-10 h-10 rounded-2xl font-black text-xs transition-all border ${page === p
                                                    ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/20'
                                                    : 'bg-white border-slate-200 text-slate-400 hover:border-slate-400 shadow-sm'
                                                    }`}
                                            >
                                                {p}
                                            </button>
                                        );
                                    })}
                                </div>
                                <button
                                    disabled={page === meta.totalPages}
                                    onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                                    className="p-2.5 rounded-2xl border border-slate-200 bg-white text-slate-600 hover:border-slate-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
