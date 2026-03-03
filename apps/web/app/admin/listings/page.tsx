"use client";

import React, { useState, useEffect } from 'react';
import {
    CheckCircle2, Clock, XCircle, Loader2, Store,
    MapPin, Phone, RefreshCw, ShieldCheck
} from 'lucide-react';
import { api, getImageUrl } from '../../../lib/api';
import { motion, AnimatePresence } from 'framer-motion';

type Status = 'pending' | 'approved' | 'rejected' | 'suspended';

const StatusPill = ({ status }: { status: Status }) => {
    const map: Record<Status, { label: string; cls: string; Icon: any }> = {
        pending: { label: 'Pending', cls: 'bg-amber-100 text-amber-700 border-amber-200', Icon: Clock },
        approved: { label: 'Approved', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200', Icon: CheckCircle2 },
        rejected: { label: 'Rejected', cls: 'bg-red-100 text-red-600 border-red-200', Icon: XCircle },
        suspended: { label: 'Suspended', cls: 'bg-slate-100 text-slate-500 border-slate-200', Icon: XCircle },
    };
    const s = map[status] || map.pending;
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border ${s.cls}`}>
            <s.Icon className="w-3.5 h-3.5" /> {s.label}
        </span>
    );
};

export default function AdminListingsPage() {
    const [listings, setListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | Status>('pending');

    const fetchListings = async () => {
        setLoading(true);
        try {
            const res = await api.listings.search({ limit: 100 });
            setListings(res.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchListings(); }, []);

    const moderate = async (id: string, action: 'approve' | 'reject' | 'suspend') => {
        setActionLoading(id + action);
        try {
            await api.admin.moderateBusiness(id, action);
            await fetchListings();
        } catch (err: any) {
            alert(err.message || 'Action failed');
        } finally {
            setActionLoading(null);
        }
    };

    const filtered = filter === 'all' ? listings : listings.filter(l => l.status === filter);

    const counts = {
        all: listings.length,
        pending: listings.filter(l => l.status === 'pending').length,
        approved: listings.filter(l => l.status === 'approved').length,
        rejected: listings.filter(l => l.status === 'rejected').length,
    };

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Listing Approvals</h1>
                    <p className="text-slate-400 font-medium mt-1">Review vendor submissions and approve or reject them.</p>
                </div>
                <button
                    onClick={fetchListings}
                    className="flex items-center gap-2 px-5 py-3 bg-slate-100 hover:bg-slate-200 rounded-2xl font-bold text-slate-600 transition-all"
                >
                    <RefreshCw className="w-4 h-4" /> Refresh
                </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-3 flex-wrap">
                {(['all', 'pending', 'approved', 'rejected'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setFilter(tab)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-sm transition-all border ${filter === tab
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white border-slate-200 text-slate-500 hover:border-slate-400'
                            }`}
                    >
                        <span className="capitalize">{tab}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${filter === tab ? 'bg-white/20' : 'bg-slate-100'}`}>
                            {counts[tab as keyof typeof counts] ?? 0}
                        </span>
                    </button>
                ))}
            </div>

            {/* Listings Table */}
            {loading ? (
                <div className="flex items-center justify-center py-24">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-3">
                    <Store className="w-12 h-12 opacity-30" />
                    <p className="font-black uppercase tracking-widest text-sm">No {filter} listings</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <AnimatePresence>
                        {filtered.map(listing => (
                            <motion.div
                                key={listing.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden"
                            >
                                <div className="flex flex-col md:flex-row md:items-center gap-6 p-6">
                                    {/* Cover Image */}
                                    <div className="w-full md:w-28 h-28 rounded-2xl overflow-hidden flex-shrink-0 bg-slate-100">
                                        <img
                                            src={getImageUrl(listing.coverImageUrl) || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=400'}
                                            alt={listing.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-1 flex-wrap">
                                            <h3 className="text-xl font-black text-slate-900 truncate">{listing.title}</h3>
                                            <StatusPill status={listing.status} />
                                        </div>
                                        <div className="flex flex-wrap gap-4 text-sm text-slate-500 font-medium mt-2">
                                            <span className="flex items-center gap-1.5">
                                                <MapPin className="w-3.5 h-3.5 text-blue-500" />
                                                {listing.city || 'N/A'}, {listing.state || 'N/A'}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <Phone className="w-3.5 h-3.5 text-green-500" />
                                                {listing.phone || 'N/A'}
                                            </span>
                                            {listing.category && (
                                                <span className="px-2 py-0.5 bg-slate-100 rounded-lg text-[11px] font-bold uppercase tracking-wider">
                                                    {listing.category.name}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-slate-400 text-sm mt-2 line-clamp-1">{listing.description || '—'}</p>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-col gap-2 flex-shrink-0">
                                        {listing.status !== 'approved' && (
                                            <button
                                                onClick={() => moderate(listing.id, 'approve')}
                                                disabled={!!actionLoading}
                                                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black text-sm transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/20"
                                            >
                                                {actionLoading === listing.id + 'approve'
                                                    ? <Loader2 className="w-4 h-4 animate-spin" />
                                                    : <CheckCircle2 className="w-4 h-4" />}
                                                Approve
                                            </button>
                                        )}
                                        {listing.status !== 'rejected' && (
                                            <button
                                                onClick={() => moderate(listing.id, 'reject')}
                                                disabled={!!actionLoading}
                                                className="flex items-center gap-2 px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl font-black text-sm transition-all disabled:opacity-50"
                                            >
                                                {actionLoading === listing.id + 'reject'
                                                    ? <Loader2 className="w-4 h-4 animate-spin" />
                                                    : <XCircle className="w-4 h-4" />}
                                                Reject
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
