"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Megaphone, Plus, Pencil, Trash2, X, CheckCircle2,
    Loader2, Tag, Calendar, Clock, ImagePlus, Store,
    AlertTriangle, ChevronLeft, ChevronRight, Sparkles, Lock, Star
} from 'lucide-react';
import { api } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import Link from 'next/link';

type OfferType = 'offer' | 'event';
type OfferStatus = 'active' | 'scheduled' | 'expired';

interface OfferItem {
    id: string;
    title: string;
    description?: string;
    type: OfferType;
    offerBadge?: string;
    imageUrl?: string;
    startDate?: string;
    endDate?: string;
    expiryDate?: string;
    highlights?: string[];
    terms?: string[];
    status: OfferStatus;
    businessId: string;
    business?: { id: string; title: string };
    createdAt: string;
    isFeatured?: boolean;
    featuredUntil?: string;
    pricingId?: string;
}

const inputClass = "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all placeholder:text-slate-400";
const labelClass = "block text-xs font-black uppercase tracking-widest text-slate-400 mb-2";

const STATUS_CONFIG: Record<OfferStatus, { label: string; cls: string }> = {
    active: { label: 'Active', cls: 'bg-green-50 text-green-700 border border-green-200' },
    scheduled: { label: 'Scheduled', cls: 'bg-blue-50 text-blue-700 border border-blue-200' },
    expired: { label: 'Expired', cls: 'bg-slate-100 text-slate-500 border border-slate-200' },
};

const emptyForm = {
    title: '',
    description: '',
    type: 'offer' as OfferType,
    offerBadge: '',
    imageUrl: '',
    businessId: '',
    startDate: '',
    endDate: '',
    expiryDate: '',
    highlights: [] as string[],
    terms: [] as string[],
    pricingId: '',
};

export default function VendorOffersPage() {
    const { user } = useAuth();
    const [offers, setOffers] = useState<OfferItem[]>([]);
    const [businesses, setBusinesses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [imageUploading, setImageUploading] = useState(false);
    const [form, setForm] = useState<typeof emptyForm>(emptyForm);
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState<any>(null);
    const [pricingOptions, setPricingOptions] = useState<any[]>([]);
    const fileRef = useRef<HTMLInputElement>(null);

    const activeSub = user?.vendor?.subscriptions?.find((sub: any) => sub.status === 'active');
    const features = activeSub?.plan?.dashboardFeatures || {};
    const isVendor = user?.role === 'vendor';

    const loadOffers = async (p = 1) => {
        if (isVendor && !features.showOffers) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const res = await api.offers.getMy(p, 10);
            setOffers(res.data);
            setMeta(res.meta);
        } catch (err: any) {
            setError(err.message || 'Failed to load offers');
        } finally {
            setLoading(false);
        }
    };

    const loadBusinesses = async () => {
        if (isVendor && !features.showOffers) return;
        try {
            const res = await api.listings.getMyListings({ limit: 100 });
            setBusinesses(res.data || []);
        } catch { }
    };

    const loadPricing = async () => {
        try {
            const res = await api.offers.getPublicPricing();
            setPricingOptions(res || []);
        } catch { }
    };

    useEffect(() => {
        if (user && isVendor && !features.showOffers) {
            setLoading(false);
            return;
        }
        loadOffers(1);
        loadBusinesses();
        loadPricing();
    }, [user, isVendor, features.showOffers]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
        );
    }

    if (isVendor && !features.showOffers) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-white rounded-3xl border-2 border-dashed border-slate-100 mt-10">
                <div className="w-20 h-20 bg-orange-50 text-orange-600 rounded-3xl flex items-center justify-center mb-6">
                    <Lock className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-3">Offers & Events</h2>
                <p className="text-slate-500 max-w-md mx-auto mb-8 font-bold leading-relaxed">
                    Promoting your business with special offers and events is a Basic feature. Upgrade your plan to reach more customers!
                </p>
                <Link href="/vendor/subscription" className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black tracking-tight hover:bg-black transition-all active:scale-95 shadow-xl shadow-slate-200">
                    Upgrade My Plan
                </Link>
            </div>
        );
    }

    const openCreate = () => {
        setForm(emptyForm);
        setEditingId(null);
        setShowModal(true);
        setError(null);
    };

    const openEdit = (offer: OfferItem) => {
        setForm({
            title: offer.title || '',
            description: offer.description || '',
            type: offer.type || 'offer',
            offerBadge: offer.offerBadge || '',
            imageUrl: offer.imageUrl || '',
            businessId: offer.businessId || '',
            startDate: offer.startDate ? offer.startDate.slice(0, 16) : '',
            endDate: offer.endDate ? offer.endDate.slice(0, 16) : '',
            expiryDate: offer.expiryDate ? offer.expiryDate.slice(0, 16) : '',
            highlights: offer.highlights || [],
            terms: offer.terms || [],
            pricingId: offer.pricingId || '',
        });
        setEditingId(offer.id);
        setShowModal(true);
        setError(null);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImageUploading(true);
        try {
            const res = await api.listings.uploadImage(file);
            setForm(prev => ({ ...prev, imageUrl: res.url }));
        } catch (err: any) {
            setError(err.message || 'Image upload failed');
        } finally {
            setImageUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.businessId) { setError('Please select a business'); return; }
        setSaving(true);
        setError(null);
        try {
            const payload: any = {
                ...form,
                startDate: form.startDate || undefined,
                endDate: form.endDate || undefined,
                expiryDate: form.expiryDate || undefined,
                imageUrl: form.imageUrl || undefined,
                offerBadge: form.offerBadge || undefined,
                description: form.description || undefined,
                highlights: form.highlights.filter(h => h.trim() !== ''),
                terms: form.terms.filter(t => t.trim() !== ''),
            };
            
            let offerId = editingId;
            if (editingId) {
                await api.offers.update(editingId, payload);
                setSuccess('Offer updated successfully!');
            } else {
                const res = await api.offers.create(payload);
                offerId = res.id;
                setSuccess('Offer created successfully!');
            }

            // Handle checkout if pricing was selected
            if (form.pricingId && offerId) {
                setSaving(true);
                const featureRes = await api.offers.feature(offerId, form.pricingId);
                if (featureRes.checkoutUrl) {
                    window.location.href = featureRes.checkoutUrl;
                    return; // Don't hide modal or reload, let page redirect
                }
            }

            setShowModal(false);
            await loadOffers(page);
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to save offer');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        setDeleting(true);
        try {
            await api.offers.remove(deleteId);
            setDeleteId(null);
            setSuccess('Offer deleted.');
            await loadOffers(page);
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to delete offer');
        } finally {
            setDeleting(false);
        }
    };

    const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

    return (
        <div className="max-w-6xl mx-auto pb-16">
            {/* Header */}
            <div className="relative mb-8 rounded-3xl overflow-hidden bg-gradient-to-br from-[#0B2244] via-[#0D2E61] to-[#1a3a70] p-8 shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
                            <Megaphone className="w-7 h-7 text-orange-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-white tracking-tight">Offers & Events</h1>
                            <p className="text-white/60 text-sm font-medium mt-0.5">Create promotions and events for your listings</p>
                        </div>
                    </div>
                    <button
                        onClick={openCreate}
                        className="flex items-center gap-2 px-5 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-black text-sm transition-all shadow-lg shadow-orange-500/30 active:scale-95"
                    >
                        <Plus className="w-4 h-4" /> Create New
                    </button>
                </div>
            </div>

            {/* Alerts */}
            <AnimatePresence>
                {success && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl text-green-700 font-bold flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />{success}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Offers Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="font-black text-slate-900">Your Offers & Events</h2>
                    {meta && (
                        <span className="text-xs font-black text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                            {meta.total} total
                        </span>
                    )}
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
                    </div>
                ) : offers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-400">
                        <div className="w-20 h-20 rounded-3xl bg-orange-50 flex items-center justify-center">
                            <Megaphone className="w-10 h-10 text-orange-200" />
                        </div>
                        <div className="text-center">
                            <p className="font-black text-slate-700 text-lg">No offers yet</p>
                            <p className="text-sm mt-1">Create your first promotional offer or event</p>
                        </div>
                        <button onClick={openCreate}
                            className="flex items-center gap-2 px-5 py-3 bg-orange-500 text-white rounded-xl font-black text-sm hover:bg-orange-600 transition-colors">
                            <Plus className="w-4 h-4" /> Create Offer
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-100">
                                        {['Title', 'Type', 'Badge', 'Business', 'Start Date', 'Expiry Date', 'Status', 'Actions'].map(h => (
                                            <th key={h} className="px-5 py-3.5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {offers.map(offer => {
                                        const sc = STATUS_CONFIG[offer.status] || STATUS_CONFIG.expired;
                                        return (
                                            <tr key={offer.id} className="hover:bg-slate-50/60 transition-colors">
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        {offer.imageUrl ? (
                                                            <img src={offer.imageUrl} alt="" className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                                                        ) : (
                                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${offer.type === 'event' ? 'bg-blue-50' : 'bg-orange-50'}`}>
                                                                {offer.type === 'event' ? <Calendar className="w-5 h-5 text-blue-400" /> : <Tag className="w-5 h-5 text-orange-400" />}
                                                            </div>
                                                        )}
                                                        <div>
                                                            <p className="font-black text-slate-900 text-sm">{offer.title}</p>
                                                            {offer.description && <p className="text-xs text-slate-400 truncate max-w-[180px]">{offer.description}</p>}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black ${offer.type === 'event' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                                                        {offer.type === 'event' ? <Calendar className="w-3 h-3" /> : <Tag className="w-3 h-3" />}
                                                        {offer.type.charAt(0).toUpperCase() + offer.type.slice(1)}
                                                    </span>
                                                    {offer.isFeatured && (
                                                        <span className="ml-2 inline-flex items-center gap-1.5 px-2 py-1 bg-amber-100 text-amber-700 rounded-lg text-[10px] font-black uppercase">
                                                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                                            Featured
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-5 py-4">
                                                    {offer.offerBadge ? (
                                                        <span className="inline-block px-2.5 py-1 bg-gradient-to-r from-orange-500 to-rose-500 text-white text-xs font-black rounded-lg">
                                                            {offer.offerBadge}
                                                        </span>
                                                    ) : <span className="text-slate-300 text-sm">—</span>}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <p className="text-sm font-semibold text-slate-700 truncate max-w-[140px]">
                                                        {offer.business?.title || '—'}
                                                    </p>
                                                </td>
                                                <td className="px-5 py-4 text-sm text-slate-600 font-semibold">{fmtDate(offer.startDate)}</td>
                                                <td className="px-5 py-4 text-sm text-slate-600 font-semibold">{fmtDate(offer.expiryDate)}</td>
                                                <td className="px-5 py-4">
                                                    <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-black ${sc.cls}`}>
                                                        {sc.label}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <button onClick={() => openEdit(offer)}
                                                            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center transition-colors text-slate-500">
                                                            <Pencil className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button onClick={() => setDeleteId(offer.id)}
                                                            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-colors text-slate-500">
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {meta && meta.totalPages > 1 && (
                            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                                <p className="text-sm text-slate-500 font-medium">
                                    Page {meta.page} of {meta.totalPages}
                                </p>
                                <div className="flex gap-2">
                                    <button disabled={meta.page <= 1}
                                        onClick={() => { const p = page - 1; setPage(p); loadOffers(p); }}
                                        className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition-colors">
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <button disabled={meta.page >= meta.totalPages}
                                        onClick={() => { const p = page + 1; setPage(p); loadOffers(p); }}
                                        className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition-colors">
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Boost Plans Banner */}
            {pricingOptions.length > 0 && (
                <div className="rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-5 flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl">🔥</span>
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                        <p className="font-black text-slate-900">Boost Your Offers & Events</p>
                        <p className="text-sm font-bold text-slate-500 mt-0.5">
                            Feature your offer on the homepage and search results starting from PKR {Math.min(...pricingOptions.map((p: any) => Number(p.price))).toLocaleString('en-PK')}
                        </p>
                    </div>
                    <Link href="/vendor/offer-plans"
                        className="flex-shrink-0 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-black text-sm transition-colors whitespace-nowrap">
                        View Plans →
                    </Link>
                </div>
            )}

            {/* ── Create / Edit Modal ───────────────────────────────────────── */}
            <AnimatePresence>
                {showModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => setShowModal(false)}>
                        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

                            {/* Modal Header */}
                            <div className="sticky top-0 bg-white px-8 py-5 border-b border-slate-100 flex items-center justify-between rounded-t-3xl z-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center">
                                        <Megaphone className="w-5 h-5 text-orange-500" />
                                    </div>
                                    <h2 className="font-black text-slate-900 text-lg">
                                        {editingId ? 'Edit Offer / Event' : 'Create Offer / Event'}
                                    </h2>
                                </div>
                                <button onClick={() => setShowModal(false)}
                                    className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
                                    <X className="w-4 h-4 text-slate-600" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                {error && (
                                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-bold flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4 flex-shrink-0" />{error}
                                    </div>
                                )}

                                {/* Type Toggle */}
                                <div>
                                    <label className={labelClass}>Type *</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {(['offer', 'event'] as OfferType[]).map(t => (
                                            <button key={t} type="button"
                                                onClick={() => setForm(p => ({ ...p, type: t }))}
                                                className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-black text-sm transition-all ${form.type === t
                                                    ? t === 'event'
                                                        ? 'border-blue-400 bg-blue-50 text-blue-700'
                                                        : 'border-orange-400 bg-orange-50 text-orange-700'
                                                    : 'border-slate-200 text-slate-500 hover:border-slate-300'
                                                    }`}>
                                                {t === 'event' ? <Calendar className="w-4 h-4" /> : <Tag className="w-4 h-4" />}
                                                {t.charAt(0).toUpperCase() + t.slice(1)}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Business selector */}
                                <div>
                                    <label className={labelClass}>Business *</label>
                                    {businesses.length === 0 ? (
                                        <div className="px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm font-bold flex items-center gap-2">
                                            <Store className="w-4 h-4" /> You have no listings yet. Create a listing first.
                                        </div>
                                    ) : (
                                        <select required value={form.businessId}
                                            onChange={e => setForm(p => ({ ...p, businessId: e.target.value }))}
                                            className={inputClass}>
                                            <option value="">-- Select a Business --</option>
                                            {businesses.map((b: any) => (
                                                <option key={b.id} value={b.id}>{b.title}</option>
                                            ))}
                                        </select>
                                    )}
                                </div>

                                {/* Title */}
                                <div>
                                    <label className={labelClass}>Title *</label>
                                    <input required value={form.title}
                                        onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                                        placeholder="e.g. Grand Opening Sale"
                                        className={inputClass} maxLength={200} />
                                </div>

                                {/* Offer Badge */}
                                <div>
                                    <label className={labelClass}>Offer Badge</label>
                                    <input value={form.offerBadge}
                                        onChange={e => setForm(p => ({ ...p, offerBadge: e.target.value }))}
                                        placeholder='e.g. "30% OFF" · "Free Delivery" · "Grand Opening"'
                                        className={inputClass} maxLength={60} />
                                    {form.offerBadge && (
                                        <div className="mt-2 inline-flex items-center gap-2">
                                            <span className="text-xs text-slate-400 font-bold">Preview:</span>
                                            <span className="px-3 py-1 bg-gradient-to-r from-orange-500 to-rose-500 text-white text-xs font-black rounded-lg">
                                                {form.offerBadge}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Description */}
                                <div>
                                    <label className={labelClass}>Description</label>
                                    <textarea rows={3} value={form.description}
                                        onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                                        placeholder="Describe the deal, terms, or event details..."
                                        className={`${inputClass} resize-none leading-relaxed`} />
                                </div>

                                {/* Dates */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                        <label className={labelClass}>Start Date</label>
                                        <input type="datetime-local" value={form.startDate}
                                            onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))}
                                            className={inputClass} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>End Date</label>
                                        <input type="datetime-local" value={form.endDate}
                                            onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))}
                                            className={inputClass} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Expiry Date</label>
                                        <input type="datetime-local" value={form.expiryDate}
                                            onChange={e => setForm(p => ({ ...p, expiryDate: e.target.value }))}
                                            className={inputClass} />
                                    </div>
                                </div>

                                {/* Highlights */}
                                <div className="pt-4 border-t border-slate-50">
                                    <div className="flex items-center justify-between mb-4">
                                        <label className={labelClass + " !mb-0"}>Offer Highlights</label>
                                        <button type="button" 
                                            onClick={() => setForm(p => ({ ...p, highlights: [...(p.highlights || []), ''] }))}
                                            className="text-xs font-black text-orange-500 hover:text-orange-600 flex items-center gap-1"
                                        >
                                            <Plus className="w-3.5 h-3.5" /> Add Highlight
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        {(form.highlights || []).map((h: string, i: number) => (
                                            <div key={i} className="flex gap-2">
                                                <input value={h}
                                                    onChange={e => {
                                                        const nh = [...(form.highlights || [])];
                                                        nh[i] = e.target.value;
                                                        setForm(p => ({ ...p, highlights: nh }));
                                                    }}
                                                    placeholder="e.g. Free Welcome Drink"
                                                    className={inputClass} />
                                                <button type="button" 
                                                    onClick={() => setForm(p => ({ ...p, highlights: (form.highlights || []).filter((_, idx) => idx !== i) }))}
                                                    className="w-11 h-11 shrink-0 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                        {(form.highlights || []).length === 0 && (
                                            <p className="text-xs text-slate-400 italic">No highlights added. These appear as a checklist on the details page.</p>
                                        )}
                                    </div>
                                </div>

                                {/* Terms & Conditions */}
                                <div className="pt-4 border-t border-slate-50">
                                    <div className="flex items-center justify-between mb-4">
                                        <label className={labelClass + " !mb-0"}>Terms & Conditions</label>
                                        <button type="button" 
                                            onClick={() => setForm(p => ({ ...p, terms: [...(p.terms || []), ''] }))}
                                            className="text-xs font-black text-orange-500 hover:text-orange-600 flex items-center gap-1"
                                        >
                                            <Plus className="w-3.5 h-3.5" /> Add Term
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        {(form.terms || []).map((t: string, i: number) => (
                                            <div key={i} className="flex gap-2">
                                                <input value={t}
                                                    onChange={e => {
                                                        const nt = [...(form.terms || [])];
                                                        nt[i] = e.target.value;
                                                        setForm(p => ({ ...p, terms: nt }));
                                                    }}
                                                    placeholder="e.g. Valid on dine-in only"
                                                    className={inputClass} />
                                                <button type="button" 
                                                    onClick={() => setForm(p => ({ ...p, terms: (form.terms || []).filter((_, idx) => idx !== i) }))}
                                                    className="w-11 h-11 shrink-0 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                        {(form.terms || []).length === 0 && (
                                            <p className="text-xs text-slate-400 italic">No specific terms added.</p>
                                        )}
                                    </div>
                                </div>

                                {/* Promote Offer Selection */}
                                <div className="pt-4 border-t border-slate-50">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                                        <label className={labelClass + " !mb-0"}>Promote this {form.type === 'event' ? 'Event' : 'Offer'} (Optional)</label>
                                    </div>
                                    <p className="text-sm font-semibold text-slate-500 mb-4">
                                        Get more views by featuring your {form.type} on the homepage and search results.
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <button type="button"
                                            onClick={() => setForm(p => ({ ...p, pricingId: '' }))}
                                            className={`p-4 rounded-2xl border-2 text-left transition-all ${!form.pricingId
                                                ? 'border-slate-800 bg-slate-50 shadow-sm'
                                                : 'border-slate-200 hover:border-slate-300 bg-white'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <span className={`font-black uppercase tracking-widest text-xs ${!form.pricingId ? 'text-slate-800' : 'text-slate-400'}`}>Standard</span>
                                            </div>
                                            <p className={`font-black text-xl ${!form.pricingId ? 'text-slate-900' : 'text-slate-700'}`}>Free</p>
                                        </button>
                                        {pricingOptions.map(plan => (
                                            <button key={plan.id} type="button"
                                                onClick={() => setForm(p => ({ ...p, pricingId: plan.id }))}
                                                className={`p-4 rounded-2xl border-2 text-left transition-all ${form.pricingId === plan.id
                                                    ? 'border-amber-400 bg-amber-50 shadow-sm'
                                                    : 'border-slate-200 hover:border-amber-200 bg-white'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className={`font-black uppercase tracking-widest text-xs ${form.pricingId === plan.id ? 'text-amber-700' : 'text-slate-500'}`}>{plan.name}</span>
                                                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{plan.duration} {plan.unit}</span>
                                                </div>
                                                <p className={`font-black text-xl ${form.pricingId === plan.id ? 'text-slate-900' : 'text-slate-700'}`}>
                                                    PKR {Number(plan.price).toLocaleString('en-PK')}
                                                </p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Image Upload */}
                                <div className="pt-4 border-t border-slate-50">
                                    <label className={labelClass}>Offer Image (optional)</label>
                                    {form.imageUrl ? (
                                        <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 aspect-[3/1]">
                                            <img src={form.imageUrl} alt="Offer" className="w-full h-full object-cover" />
                                            <button type="button" onClick={() => setForm(p => ({ ...p, imageUrl: '' }))}
                                                className="absolute top-3 right-3 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="block cursor-pointer group">
                                            <div className="rounded-2xl border-2 border-dashed border-slate-200 hover:border-orange-300 bg-slate-50 hover:bg-orange-50/20 transition-all p-8 flex flex-col items-center gap-3">
                                                {imageUploading ? (
                                                    <><Loader2 className="w-8 h-8 animate-spin text-orange-400" /><p className="text-sm font-bold text-orange-400">Uploading...</p></>
                                                ) : (
                                                    <><ImagePlus className="w-8 h-8 text-slate-300 group-hover:text-orange-400 transition-colors" />
                                                        <div className="text-center">
                                                            <p className="font-black text-sm text-slate-400 group-hover:text-orange-500">Click to upload banner image</p>
                                                            <p className="text-xs text-slate-300 mt-0.5">PNG, JPG · Recommended 1200×400</p>
                                                        </div></>
                                                )}
                                            </div>
                                            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                        </label>
                                    )}
                                </div>

                                {/* Submit Buttons */}
                                <div className="flex gap-3 pt-2">
                                    <button type="button" onClick={() => setShowModal(false)}
                                        className="flex-1 py-3.5 bg-slate-100 text-slate-700 rounded-xl font-black text-sm hover:bg-slate-200 transition-colors">
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={saving || imageUploading}
                                        className="flex-[2] py-3.5 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-xl font-black text-sm shadow-lg shadow-orange-500/20 hover:from-orange-600 hover:to-rose-600 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                        {editingId ? 'Save Changes' : 'Create Offer'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteId && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => setDeleteId(null)}>
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center">
                            <div className="w-16 h-16 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-5">
                                <Trash2 className="w-8 h-8 text-red-400" />
                            </div>
                            <h3 className="font-black text-slate-900 text-xl mb-2">Delete Offer?</h3>
                            <p className="text-slate-500 text-sm mb-6">This action cannot be undone. The offer will be permanently removed.</p>
                            <div className="flex gap-3">
                                <button onClick={() => setDeleteId(null)}
                                    className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-black text-sm hover:bg-slate-200 transition-colors">
                                    Cancel
                                </button>
                                <button onClick={handleDelete} disabled={deleting}
                                    className="flex-1 py-3 bg-red-500 text-white rounded-xl font-black text-sm hover:bg-red-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                                    {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
