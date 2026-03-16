"use client";

import React, { useEffect, useState } from 'react';
import { api } from '../../../lib/api';
import {
    ShieldAlert,
    CheckCircle,
    Trash2,
    Filter,
    Search,
    Clock,
    User as UserIcon,
    Store,
    AlertTriangle,
    Eye,
    MessageSquare,
    RefreshCcw,
    ChevronLeft,
    ChevronRight,
    Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

export default function ReviewModerationPage() {
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filter, setFilter] = useState({
        isSuspicious: 'all',
        isApproved: 'all',
        search: ''
    });
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const params: any = {
                page,
                limit: 10,
            };
            if (filter.isSuspicious !== 'all') params.isSuspicious = filter.isSuspicious;
            if (filter.isApproved !== 'all') params.isApproved = filter.isApproved;

            const response = await api.reviews.adminGetAll(params);
            setReviews(response.data);
            setTotalPages(Math.ceil(response.meta.total / 10));
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [page, filter.isSuspicious, filter.isApproved]);

    const handleModerate = async (id: string, action: { isApproved?: boolean; isSuspicious?: boolean }) => {
        setActionLoading(id);
        try {
            await api.reviews.adminModerate(id, action);
            // Refresh local state
            setReviews(prev => prev.map(r => r.id === id ? { ...r, ...action } : r));
        } catch (error) {
            console.error('Moderation failed:', error);
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to permanently delete this review?')) return;
        setActionLoading(id);
        try {
            // Use the standard delete endpoint (admin role check handled by backend)
            // Note: Our API controller has a standard DELETE :id endpoint already.
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/reviews/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            setReviews(prev => prev.filter(r => r.id !== id));
        } catch (error) {
            console.error('Deletion failed:', error);
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
                        Review <span className="text-red-600">Moderation</span>
                    </h1>
                    <p className="text-slate-500 font-medium flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-orange-500" />
                        Identify and manage suspicious or fraudulent reviews.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative group">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <select
                            value={filter.isSuspicious}
                            onChange={(e) => setFilter(prev => ({ ...prev, isSuspicious: e.target.value }))}
                            className="pl-11 pr-8 py-3 bg-white border border-slate-200 rounded-2xl appearance-none focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all font-bold text-slate-700"
                        >
                            <option value="all">All Status</option>
                            <option value="true">Suspicious Only</option>
                            <option value="false">Clean Only</option>
                        </select>
                    </div>

                    <div className="relative group">
                        <CheckCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <select
                            value={filter.isApproved}
                            onChange={(e) => setFilter(prev => ({ ...prev, isApproved: e.target.value }))}
                            className="pl-11 pr-8 py-3 bg-white border border-slate-200 rounded-2xl appearance-none focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all font-bold text-slate-700"
                        >
                            <option value="all">Any Approval</option>
                            <option value="true">Approved</option>
                            <option value="false">Pending/Rejected</option>
                        </select>
                    </div>

                    <button
                        onClick={fetchReviews}
                        className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all active:scale-95 text-slate-600 shadow-sm"
                    >
                        <RefreshCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-1 gap-6">
                {loading && reviews.length === 0 ? (
                    <div className="bg-white rounded-[28px] p-20 border border-slate-100 flex flex-col items-center justify-center gap-4">
                        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
                        <p className="font-bold text-slate-900">Loading reviews for moderation...</p>
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="bg-white rounded-[28px] p-20 border border-slate-100 flex flex-col items-center justify-center text-center gap-4">
                        <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-[2rem] flex items-center justify-center">
                            <MessageSquare className="w-10 h-10" />
                        </div>
                        <div>
                            <p className="text-xl font-black text-slate-900">No reviews found</p>
                            <p className="text-slate-500 font-medium">Try adjusting your filters.</p>
                        </div>
                    </div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        {reviews.map((review, i) => (
                            <motion.div
                                key={review.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: i * 0.05 }}
                                className={`bg-white rounded-[28px] border ${review.isSuspicious ? 'border-orange-200 bg-orange-50/10' : 'border-slate-100'} p-8 shadow-sm group hover:shadow-xl transition-all duration-500`}
                            >
                                <div className="flex flex-col lg:flex-row gap-8">
                                    {/* Left Side: Rating & Content */}
                                    <div className="flex-grow space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="flex gap-0.5">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`w-4 h-4 ${i < review.rating ? 'text-orange-400 fill-orange-400' : 'text-slate-200'}`}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                    <Clock className="w-3 h-3" />
                                                    {format(new Date(review.createdAt), 'MMM d, yyyy')}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {review.isSuspicious && (
                                                    <div className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-orange-200">
                                                        <AlertTriangle className="w-3 h-3" />
                                                        Suspicious ({Math.round(review.suspicionScore * 100)}%)
                                                    </div>
                                                )}
                                                {!review.isApproved && (
                                                    <div className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-200">
                                                        Unapproved
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <h3 className="text-lg font-black text-slate-900">{review.title}</h3>
                                            <p className="text-slate-600 font-medium leading-relaxed italic border-l-4 border-slate-100 pl-4">
                                                "{review.comment}"
                                            </p>
                                        </div>

                                        {/* Meta Data */}
                                        <div className="flex flex-wrap gap-6 pt-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-slate-50 rounded-xl">
                                                    <UserIcon className="w-4 h-4 text-slate-400" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reviewer</p>
                                                    <p className="text-sm font-black text-slate-900">{review.user?.fullName || 'Anonymous'}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-slate-50 rounded-xl">
                                                    <Store className="w-4 h-4 text-slate-400" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Business</p>
                                                    <p className="text-sm font-black text-slate-900">{review.business?.name || 'Unknown'}</p>
                                                </div>
                                            </div>

                                            {review.ipAddress && (
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-slate-50 rounded-xl">
                                                        <Search className="w-4 h-4 text-slate-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">IP Address</p>
                                                        <p className="text-sm font-black text-slate-900 font-mono">{review.ipAddress}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {review.suspicionReason && (
                                            <div className="mt-4 p-4 bg-orange-50 rounded-[1.5rem] border border-orange-100">
                                                <p className="text-xs font-black text-orange-600 uppercase tracking-widest mb-1">Detection Reason</p>
                                                <p className="text-sm font-bold text-orange-700">{review.suspicionReason}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Right Side: Actions */}
                                    <div className="flex lg:flex-col lg:w-48 gap-3 justify-center">
                                        <button
                                            disabled={!!actionLoading}
                                            onClick={() => handleModerate(review.id, { isApproved: true, isSuspicious: false })}
                                            className={`flex-grow flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-black text-sm transition-all active:scale-95 ${review.isApproved && !review.isSuspicious
                                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 cursor-default'
                                                : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200'}`}
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                            Approve
                                        </button>

                                        <button
                                            disabled={!!actionLoading}
                                            onClick={() => handleModerate(review.id, { isApproved: false, isSuspicious: true })}
                                            className={`flex-grow flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-black text-sm transition-all active:scale-95 ${review.isSuspicious
                                                ? 'bg-orange-50 text-orange-600 border border-orange-100 cursor-default'
                                                : 'bg-orange-100 text-orange-700 hover:bg-orange-200'}`}
                                        >
                                            <ShieldAlert className="w-4 h-4" />
                                            Flag
                                        </button>

                                        <button
                                            disabled={!!actionLoading}
                                            onClick={() => handleDelete(review.id)}
                                            className="flex-grow flex items-center justify-center gap-2 px-6 py-4 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-2xl font-black text-sm transition-all active:scale-95 border border-red-100 group"
                                        >
                                            <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-8">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="p-3 bg-white border border-slate-200 rounded-xl disabled:opacity-50 hover:bg-slate-50 transition-all font-bold"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="flex gap-2">
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setPage(i + 1)}
                                className={`w-10 h-10 rounded-xl font-black transition-all ${page === i + 1 ? 'bg-red-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="p-3 bg-white border border-slate-200 rounded-xl disabled:opacity-50 hover:bg-slate-50 transition-all font-bold"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            )}
        </div>
    );
}
