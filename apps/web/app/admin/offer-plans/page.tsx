"use client";

import React, { useState, useEffect } from 'react';
import {
    Gift, Plus, Edit2, Trash2, CheckCircle2, XCircle,
    Tag, Calendar, Save, X, Loader2, Eye, Home, LayoutGrid,
    FileText, Flame, TrendingUp, Megaphone
} from 'lucide-react';
import { api } from '../../../lib/api';

interface OfferPlan {
    id: string;
    type: 'offer' | 'event';
    name: string;
    price: number;
    unit: 'hours' | 'days' | 'minutes';
    duration: number;
    isActive: boolean;
    showOnHome: boolean;
    showOnCategory: boolean;
    showOnListing: boolean;
    showOnOfferPage: boolean;
    showOnEventPage: boolean;
}

const blankForm = {
    type: 'offer' as 'offer' | 'event',
    name: '',
    price: '',
    duration: '1',
    unit: 'hours' as 'hours' | 'days' | 'minutes',
    showOnHome: true,
    showOnCategory: true,
    showOnListing: true,
    showOnOfferPage: true,
    showOnEventPage: false,
};

// ── Tiny preview components ────────────────────────────────────────────────────
function PreviewHomeCard({ plan }: { plan: OfferPlan | null }) {
    return (
        <div className="relative bg-white rounded-xl overflow-hidden shadow border border-slate-100">
            {plan?.showOnHome && (
                <div className="absolute top-2 left-2 z-10 flex items-center gap-1 px-2 py-0.5 bg-orange-500 text-white rounded-full text-[9px] font-black uppercase tracking-widest">
                    <Flame className="w-2.5 h-2.5" /> Featured
                </div>
            )}
            <div className="h-20 bg-gradient-to-br from-slate-100 to-orange-50 flex items-center justify-center text-xl">🏪</div>
            <div className="p-2.5">
                <p className="text-[10px] font-black text-slate-400 uppercase">Restaurant</p>
                <p className="font-black text-slate-900 text-xs">Sample Business</p>
                {plan?.showOnHome && <p className="text-[9px] text-orange-500 font-bold mt-0.5">🔥 {plan.duration}{plan.unit[0]} boost</p>}
            </div>
        </div>
    );
}
function PreviewCategoryRow({ plan }: { plan: OfferPlan | null }) {
    return (
        <div className={`flex items-center gap-3 p-3 rounded-xl border ${plan?.showOnCategory ? 'border-orange-200 bg-orange-50/30' : 'border-slate-100 bg-white'}`}>
            <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center text-base flex-shrink-0">🏪</div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                    <p className="font-black text-slate-900 text-xs">Sample Business</p>
                    {plan?.showOnCategory && <span className="flex items-center gap-0.5 px-1 py-0.5 bg-orange-500 text-white rounded-full text-[8px] font-black"><TrendingUp className="w-2 h-2" /> Boosted</span>}
                </div>
                <p className="text-[10px] text-slate-400">Karachi • ⭐ 4.8</p>
                {plan?.showOnCategory && <p className="text-[9px] text-orange-500 font-bold">🔥 {plan.type === 'offer' ? 'Special Offer' : 'Upcoming Event'} inside</p>}
            </div>
        </div>
    );
}
function PreviewListing({ plan }: { plan: OfferPlan | null }) {
    return (
        <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="h-14 bg-gradient-to-br from-slate-200 to-slate-100 relative">
                {plan?.showOnListing && <div className="absolute inset-0 bg-orange-500/20" />}
                <div className="absolute -bottom-3 left-2">
                    <div className="w-7 h-7 bg-white rounded-lg shadow flex items-center justify-center text-sm border border-white">🏪</div>
                </div>
            </div>
            <div className="pt-5 px-2.5 pb-2.5">
                <p className="font-black text-slate-900 text-xs">Sample Business</p>
                <p className="text-[10px] text-slate-400">Karachi</p>
                {plan?.showOnListing && (
                    <div className={`mt-1.5 flex items-center gap-1 px-2 py-1 rounded-lg ${plan.type === 'offer' ? 'bg-orange-50 border border-orange-200' : 'bg-violet-50 border border-violet-200'}`}>
                        {plan.type === 'offer' ? <Tag className="w-2.5 h-2.5 text-orange-500" /> : <Calendar className="w-2.5 h-2.5 text-violet-500" />}
                        <p className={`text-[8px] font-black ${plan.type === 'offer' ? 'text-orange-700' : 'text-violet-700'}`}>
                            {plan.type === 'offer' ? '🎉 Special Offer' : '📅 Upcoming Event'}
                        </p>
                    </div>
                )}
                {!plan?.showOnListing && <div className="mt-1.5 px-2 py-1 bg-slate-50 rounded-lg"><p className="text-[9px] text-slate-400 text-center">No plan</p></div>}
            </div>
        </div>
    );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function AdminOfferPlansPage() {
    const [plans, setPlans] = useState<OfferPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({ ...blankForm });
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [previewPlan, setPreviewPlan] = useState<OfferPlan | null>(null);
    const [previewPage, setPreviewPage] = useState<'home' | 'category' | 'listing'>('home');
    const [activeTab, setActiveTab] = useState<'offer' | 'event'>('offer');

    useEffect(() => { fetchPlans(); }, []);

    const fetchPlans = async () => {
        setLoading(true);
        try { setPlans((await api.admin.offerPlans.getAll()) || []); }
        catch { } finally { setLoading(false); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim()) { setError('Plan name required'); return; }
        if (!form.price || Number(form.price) < 1) { setError('Price must be greater than 0'); return; }
        setSaving(true); setError('');
        try {
            const payload = {
                type: form.type,
                name: form.name.trim(),
                price: Number(form.price),
                duration: Number(form.duration),
                unit: form.unit,
                isActive: true,
                showOnHome: form.showOnHome,
                showOnCategory: form.showOnCategory,
                showOnListing: form.showOnListing,
                showOnOfferPage: form.showOnOfferPage,
                showOnEventPage: form.showOnEventPage,
            };
            if (editingId) { await api.admin.offerPlans.update(editingId, payload); }
            else { await api.admin.offerPlans.create(payload); }
            setForm({ ...blankForm }); setEditingId(null);
            await fetchPlans();
        } catch (err: any) { setError(err.message || 'Failed to save'); }
        finally { setSaving(false); }
    };

    const startEdit = (p: OfferPlan) => {
        setForm({
            type: p.type, name: p.name, price: String(p.price),
            duration: String(p.duration), unit: p.unit,
            showOnHome: p.showOnHome ?? true,
            showOnCategory: p.showOnCategory ?? true,
            showOnListing: p.showOnListing ?? true,
            showOnOfferPage: p.showOnOfferPage ?? true,
            showOnEventPage: p.showOnEventPage ?? false,
        });
        setEditingId(p.id); setError('');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => { setForm({ ...blankForm }); setEditingId(null); setError(''); };

    const handleDelete = async (p: OfferPlan) => {
        if (!confirm(`Delete "${p.name}"?`)) return;
        setDeletingId(p.id);
        try { await api.admin.offerPlans.delete(p.id); await fetchPlans(); if (previewPlan?.id === p.id) setPreviewPlan(null); }
        catch (err: any) { alert(err.message || 'Delete failed'); }
        finally { setDeletingId(null); }
    };

    const toggleActive = async (p: OfferPlan) => {
        try { await api.admin.offerPlans.update(p.id, { isActive: !p.isActive }); await fetchPlans(); }
        catch { }
    };

    const filtered = plans.filter(p => p.type === activeTab);
    const inp = "px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-300 placeholder:text-slate-300";

    // Placement options config
    const placements = [
        { key: 'showOnHome' as const, label: 'Home Page', icon: '🏠', desc: 'Featured on homepage listing cards' },
        { key: 'showOnCategory' as const, label: 'Category Page', icon: '📋', desc: 'Boosted in category/search results' },
        { key: 'showOnListing' as const, label: 'Listing Details', icon: '📄', desc: 'Highlighted on the listing detail page' },
        { key: 'showOnOfferPage' as const, label: 'Offer Page', icon: '🏷️', desc: 'Shown on offer/deals pages' },
        { key: 'showOnEventPage' as const, label: 'Event Page', icon: '📅', desc: 'Shown on event pages' },
    ];

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-16">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-2xl flex items-center justify-center">
                        <Gift className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900">Offer & Event Plans</h1>
                        <p className="text-slate-400 text-sm font-bold">Set pricing and placement visibility for vendor boost plans</p>
                    </div>
                </div>
                <div className="flex gap-3 text-center">
                    <div className="bg-white border border-slate-100 rounded-2xl px-4 py-2 shadow-sm">
                        <p className="text-xs font-black text-slate-400">Offer Plans</p>
                        <p className="text-xl font-black text-orange-500">{plans.filter(p => p.type === 'offer').length}</p>
                    </div>
                    <div className="bg-white border border-slate-100 rounded-2xl px-4 py-2 shadow-sm">
                        <p className="text-xs font-black text-slate-400">Event Plans</p>
                        <p className="text-xl font-black text-violet-500">{plans.filter(p => p.type === 'event').length}</p>
                    </div>
                    <div className="bg-white border border-slate-100 rounded-2xl px-4 py-2 shadow-sm">
                        <p className="text-xs font-black text-slate-400">Active</p>
                        <p className="text-xl font-black text-emerald-500">{plans.filter(p => p.isActive).length}</p>
                    </div>
                </div>
            </div>

            {/* ── Create / Edit Form ──────────────────────────────────── */}
            <div className={`bg-white border-2 rounded-3xl shadow-sm p-6 ${editingId ? 'border-orange-300 shadow-orange-100' : 'border-slate-100'}`}>
                <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-5">
                    {editingId ? '✏️ Editing Plan' : '➕ New Plan'}
                </p>

                {error && (
                    <div className="mb-4 px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-bold">⚠️ {error}</div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Row 1: core fields */}
                    <div className="flex flex-wrap gap-3 items-end">
                        {/* Type */}
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Type</label>
                            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                                {(['offer', 'event'] as const).map(t => (
                                    <button key={t} type="button"
                                        onClick={() => setForm(f => ({ ...f, type: t, showOnEventPage: t === 'event' }))}
                                        className={`px-4 py-2 rounded-lg font-black text-sm capitalize transition-all ${form.type === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                                        {t === 'offer' ? '🏷️' : '📅'} {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Name */}
                        <div className="flex-1 min-w-[180px]">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Plan Name</label>
                            <input required value={form.name}
                                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                placeholder={form.type === 'offer' ? 'e.g. 1-Hour Spotlight' : 'e.g. 1-Day Event Boost'}
                                className={`${inp} w-full`} />
                        </div>

                        {/* Price */}
                        <div className="w-36">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Price (PKR)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">Rs</span>
                                <input required type="number" min={1} value={form.price}
                                    onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                                    placeholder="500" className={`${inp} pl-8 w-full`} />
                            </div>
                        </div>

                        {/* Duration */}
                        <div className="w-24">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Duration</label>
                            <input required type="number" min={1} value={form.duration}
                                onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
                                className={`${inp} w-full`} />
                        </div>

                        {/* Unit */}
                        <div className="w-32">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Unit</label>
                            <select value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value as any }))} className={`${inp} w-full`}>
                                <option value="minutes">⚡ Minutes</option>
                                <option value="hours">⏰ Hours</option>
                                <option value="days">📅 Days</option>
                            </select>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-2 pb-0.5">
                            {editingId && (
                                <button type="button" onClick={cancelEdit}
                                    className="h-[42px] px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-black text-sm flex items-center gap-1.5 transition-all">
                                    <X className="w-4 h-4" /> Cancel
                                </button>
                            )}
                            <button type="submit" disabled={saving}
                                className="h-[42px] px-5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-black text-sm flex items-center gap-1.5 shadow-lg shadow-orange-500/20 transition-all active:scale-95 disabled:opacity-50">
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                {editingId ? 'Update' : 'Create'}
                            </button>
                        </div>
                    </div>

                    {/* Row 2: Placement visibility */}
                    <div className="border-t border-slate-100 pt-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                            <Megaphone className="w-3.5 h-3.5" /> Where will this plan boost be visible?
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                            {placements.map(p => {
                                const checked = form[p.key];
                                return (
                                    <button key={p.key} type="button"
                                        onClick={() => setForm(f => ({ ...f, [p.key]: !f[p.key] }))}
                                        className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-2xl border-2 font-black text-xs transition-all ${checked
                                            ? 'border-orange-400 bg-orange-50 text-orange-700'
                                            : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'
                                            }`}>
                                        <span className="text-xl">{p.icon}</span>
                                        <span className="text-center leading-tight">{p.label}</span>
                                        <span className={`text-[9px] font-bold ${checked ? 'text-orange-500' : 'text-slate-300'}`}>
                                            {checked ? '✓ ON' : 'OFF'}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Live summary */}
                    {form.name && Number(form.price) > 0 && (
                        <div className="px-4 py-3 bg-orange-50 border border-orange-200 rounded-xl">
                            <p className="text-xs font-black text-orange-700">
                                📋 <strong>{form.name}</strong> — PKR {Number(form.price).toLocaleString('en-PK')} / {form.duration} {form.unit}
                                {' · '}Visible on: {placements.filter(p => form[p.key]).map(p => p.label).join(', ') || 'None'}
                            </p>
                        </div>
                    )}
                </form>
            </div>

            {/* ── Plans List ──────────────────────────────────────────── */}
            <div>
                <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl w-fit mb-4">
                    {(['offer', 'event'] as const).map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`px-5 py-2.5 rounded-xl font-black text-sm capitalize flex items-center gap-2 transition-all ${activeTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                            {tab === 'offer' ? <Tag className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
                            {tab} Plans
                            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${activeTab === tab ? 'bg-orange-100 text-orange-600' : 'bg-slate-200 text-slate-500'}`}>
                                {plans.filter(p => p.type === tab).length}
                            </span>
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-16 bg-white rounded-3xl border border-slate-100">
                        <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                        <Gift className="w-10 h-10 text-slate-200 mb-3" />
                        <p className="font-black text-slate-400">No {activeTab} plans yet</p>
                        <p className="text-sm text-slate-300 mt-1">Use the form above to create one</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="divide-y divide-slate-50">
                            {filtered.map(plan => {
                                const activePlacements = placements.filter(p => plan[p.key]);
                                return (
                                    <div key={plan.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/60 transition-colors group">
                                        {/* Icon */}
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${plan.type === 'offer' ? 'bg-orange-50' : 'bg-violet-50'}`}>
                                            {plan.type === 'offer' ? <Tag className="w-4 h-4 text-orange-500" /> : <Calendar className="w-4 h-4 text-violet-500" />}
                                        </div>

                                        {/* Name & placements */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <p className="font-black text-slate-900">{plan.name}</p>
                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${plan.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                                    {plan.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                            <p className="text-xs font-bold text-slate-400 mt-0.5">
                                                {plan.duration} {plan.unit} · {plan.unit === 'hours' ? '⏰' : plan.unit === 'days' ? '📅' : '⚡'}
                                                {activePlacements.length > 0 && (
                                                    <span className="ml-2 text-slate-300">
                                                        Shows on: {activePlacements.map(p => p.icon + ' ' + p.label).join(' · ')}
                                                    </span>
                                                )}
                                            </p>
                                        </div>

                                        {/* Price */}
                                        <div className="text-right mr-2 flex-shrink-0">
                                            <p className="text-base font-black text-slate-900">PKR {Number(plan.price).toLocaleString('en-PK')}</p>
                                            <p className="text-[10px] font-bold text-slate-400">per {plan.duration > 1 ? plan.duration + ' ' : ''}{plan.unit}</p>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => { setPreviewPlan(plan); setPreviewPage('home'); }} title="Preview"
                                                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-400 hover:text-blue-500 flex items-center justify-center transition-all">
                                                <Eye className="w-3.5 h-3.5" />
                                            </button>
                                            <button onClick={() => startEdit(plan)} title="Edit"
                                                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-orange-50 text-slate-400 hover:text-orange-500 flex items-center justify-center transition-all">
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </button>
                                            <button onClick={() => toggleActive(plan)} title={plan.isActive ? 'Deactivate' : 'Activate'}
                                                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${plan.isActive ? 'bg-emerald-50 text-emerald-500 hover:bg-red-50 hover:text-red-400' : 'bg-slate-100 text-slate-400 hover:bg-emerald-50 hover:text-emerald-500'}`}>
                                                {plan.isActive ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                                            </button>
                                            <button onClick={() => handleDelete(plan)} disabled={deletingId === plan.id}
                                                className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-400 hover:text-red-600 flex items-center justify-center transition-all disabled:opacity-50">
                                                {deletingId === plan.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* ── Preview Modal ──────────────────────────────────────── */}
            {previewPlan && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setPreviewPlan(null)} />
                    <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-orange-50">
                            <div>
                                <p className="font-black text-slate-900 flex items-center gap-2"><Eye className="w-4 h-4 text-orange-500" /> Preview: "{previewPlan.name}"</p>
                                <p className="text-xs font-bold text-slate-400 mt-0.5">PKR {Number(previewPlan.price).toLocaleString('en-PK')} / {previewPlan.duration} {previewPlan.unit}</p>
                            </div>
                            <button onClick={() => setPreviewPlan(null)} className="w-8 h-8 rounded-xl hover:bg-white flex items-center justify-center text-slate-400">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex gap-1 px-6 pt-4">
                            {[{ id: 'home', label: 'Home', icon: Home, enabled: previewPlan.showOnHome },
                            { id: 'category', label: 'Category', icon: LayoutGrid, enabled: previewPlan.showOnCategory },
                            { id: 'listing', label: 'Listing', icon: FileText, enabled: previewPlan.showOnListing }].map(p => (
                                <button key={p.id} onClick={() => setPreviewPage(p.id as any)}
                                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-black text-xs transition-all ${previewPage === p.id ? 'bg-orange-500 text-white' : p.enabled ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-300 hover:bg-slate-50'}`}>
                                    <p.icon className="w-3 h-3" /> {p.label}
                                    {!p.enabled && <span className="text-[8px] font-bold text-slate-300">(off)</span>}
                                </button>
                            ))}
                        </div>

                        <div className="px-6 py-5">
                            <div className="grid grid-cols-2 gap-4 bg-slate-50 rounded-2xl p-4">
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 mb-2">Without Plan</p>
                                    {previewPage === 'home' && <PreviewHomeCard plan={null} />}
                                    {previewPage === 'category' && <PreviewCategoryRow plan={null} />}
                                    {previewPage === 'listing' && <PreviewListing plan={null} />}
                                </div>
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-orange-400 mb-2">✨ With This Plan</p>
                                    {previewPage === 'home' && <PreviewHomeCard plan={previewPlan} />}
                                    {previewPage === 'category' && <PreviewCategoryRow plan={previewPlan} />}
                                    {previewPage === 'listing' && <PreviewListing plan={previewPlan} />}
                                </div>
                            </div>

                            {/* Placement summary */}
                            <div className="mt-4 px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl">
                                <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2">Visibility Settings</p>
                                <div className="flex flex-wrap gap-2">
                                    {placements.map(p => (
                                        <span key={p.key} className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black ${previewPlan[p.key]
                                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                                            : 'bg-slate-100 text-slate-300 line-through'}`}>
                                            {p.icon} {p.label}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
