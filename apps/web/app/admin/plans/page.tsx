"use client";

import React, { useState, useEffect } from 'react';
import {
    CreditCard, Plus, Edit2, Trash2, CheckCircle2,
    XCircle, Clock, Zap, Crown, Building2,
    MoreVertical, Save, X, Loader2, AlertCircle,
    Check, Info, ChevronRight, Layers
} from 'lucide-react';
import { api } from '../../../lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';

interface Plan {
    id: string;
    name: string;
    planType: string;
    description: string;
    price: string | number;
    billingCycle: string;
    isFeatured: boolean;
    isActive: boolean;
    dashboardFeatures: Record<string, boolean>;
}

export default function AdminPlansPage() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        planType: 'basic',
        description: '',
        price: 0,
        billingCycle: 'monthly',
        isFeatured: false,
        isActive: true,
        dashboardFeatures: {
            showAnalytics: false,
            showOffers: false,
            showLeads: false,
            showDemand: false,
            showQueries: false,
            showReviews: false,
            showChat: false,
            showBroadcast: false,
            showSaved: false,
            showFollowing: false,
            showListings: true,
            canAddListing: true,
        }
    });

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        setLoading(true);
        try {
            const data = await api.admin.plans.getAll();
            setPlans(data);
        } catch (err) {
            console.error('Failed to fetch plans', err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (plan?: Plan) => {
        if (plan) {
            setEditingPlan(plan);
            setFormData({
                name: plan.name,
                planType: plan.planType,
                description: plan.description || '',
                price: Number(plan.price),
                billingCycle: plan.billingCycle,
                isFeatured: plan.isFeatured,
                isActive: plan.isActive,
                dashboardFeatures: (plan.dashboardFeatures as any) || {
                    showAnalytics: false,
                    showOffers: false,
                    showLeads: false,
                    showDemand: false,
                    showQueries: false,
                    showReviews: false,
                    showChat: false,
                    showBroadcast: false,
                    showSaved: false,
                    showFollowing: false,
                    showListings: true,
                    canAddListing: true,
                }
            });
        } else {
            setEditingPlan(null);
            setFormData({
                name: '',
                planType: 'free',
                description: '',
                price: 0,
                billingCycle: 'monthly',
                isFeatured: false,
                isActive: true,
                dashboardFeatures: {
                    showAnalytics: false,
                    showLeads: false,
                    showOffers: false,
                    showDemand: false,
                    showQueries: false,
                    showReviews: false,
                    showChat: false,
                    showBroadcast: false,
                    showSaved: false,
                    showFollowing: false,
                    showListings: true,
                    canAddListing: true,
                }
            });
        }
        setModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const payload = {
            ...formData,
            price: Number(formData.price),
        };

        try {
            if (editingPlan) {
                await api.admin.plans.update(editingPlan.id, payload);
            } else {
                await api.admin.plans.create(payload);
            }
            await fetchPlans();
            setModalOpen(false);
        } catch (err: any) {
            console.error('Save failed', err);
            alert(`Failed to save plan: ${err.message || 'Unknown error'}`);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this plan? Data for active subscribers might be affected.')) return;
        setDeletingId(id);
        try {
            await api.admin.plans.delete(id);
            await fetchPlans();
        } catch (err: any) {
            alert(err.message || 'Failed to delete plan');
        } finally {
            setDeletingId(null);
        }
    };

    const toggleStatus = async (plan: Plan) => {
        try {
            await api.admin.plans.update(plan.id, { isActive: !plan.isActive });
            await fetchPlans();
        } catch (err) {
            console.error('Toggle failed', err);
        }
    };

    const getPlanIcon = (type: string) => {
        switch (type) {
            case 'free': return <Clock className="w-5 h-5 text-slate-400" />;
            case 'basic': return <Zap className="w-5 h-5 text-blue-500" />;
            case 'premium': return <Crown className="w-5 h-5 text-amber-500" />;
            case 'enterprise': return <Building2 className="w-5 h-5 text-indigo-600" />;
            default: return <CreditCard className="w-5 h-5 text-slate-400" />;
        }
    };

    if (loading && plans.length === 0) {
        return (
            <div className="flex items-center justify-center py-24">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-red-500" />
                    <p className="text-slate-400 font-bold animate-pulse">Loading specialized tiers...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-12 pb-32">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 py-6">
                <div>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center">
                            <CreditCard className="w-6 h-6 text-red-600" />
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Subscription Engine</h1>
                    </div>
                    <p className="text-slate-400 font-bold text-lg max-w-xl leading-relaxed">
                        Master your revenue streams. Define dashboard permissions and plan feature sets.
                    </p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="px-8 py-5 bg-slate-900 hover:bg-black text-white rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-2xl shadow-slate-900/20 transition-all active:scale-95 whitespace-nowrap group"
                >
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                    Forge New Plan
                </button>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {plans.map((plan) => (
                    <motion.div
                        layout
                        key={plan.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`group relative bg-white rounded-[20px] p-8 border-2 transition-all flex flex-col h-full ${plan.isActive
                            ? 'border-slate-50  shadow-slate-200/40'
                            : 'border-slate-100 opacity-75 grayscale-[0.5]'
                            }`}
                    >
                        {!plan.isActive && (
                            <div className="absolute top-6 right-6 px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500">
                                Inactive
                            </div>
                        )}

                        <div className="flex items-center gap-4 mb-6">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${plan.planType === 'basic' ? 'bg-blue-50' : 'bg-slate-50'
                                }`}>
                                {getPlanIcon(plan.planType)}
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 leading-tight">{plan.name}</h3>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-0.5">{plan.planType}</p>
                            </div>
                        </div>

                        <div className="mb-8">
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-black text-slate-900">PKR {plan.price}</span>
                                <span className="text-slate-400 font-bold text-sm">/{plan.billingCycle}</span>
                            </div>
                            <p className="text-slate-500 font-bold text-sm mt-3 leading-relaxed">
                                {plan.description || 'Flexible plan for growing businesses.'}
                            </p>
                        </div>

                        <div className="space-y-4 mb-8 flex-grow">
                        </div>

                        <div className="flex items-center gap-3 pt-6 border-t border-slate-50 mt-auto">
                            <button
                                onClick={() => handleOpenModal(plan)}
                                className="flex-grow py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
                            >
                                <Edit2 className="w-3.5 h-3.5" />
                                Edit Plan
                            </button>
                                <button
                                    onClick={() => toggleStatus(plan)}
                                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all active:scale-95 shadow-sm ${plan.isActive
                                        ? 'bg-emerald-50 hover:bg-emerald-500 hover:text-white text-emerald-600'
                                        : 'bg-slate-100 hover:bg-slate-200 text-slate-400'
                                        }`}
                                    title={plan.isActive ? 'Deactivate Plan' : 'Activate Plan'}
                                >
                                    {plan.isActive ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                                </button>
                            <button
                                onClick={() => handleDelete(plan.id)}
                                disabled={deletingId === plan.id}
                                className="w-12 h-12 bg-red-50 hover:bg-red-100 text-red-500 rounded-2xl flex items-center justify-center transition-all active:scale-95 disabled:opacity-50"
                            >
                                {deletingId === plan.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                            </button>
                        </div>
                    </motion.div>
                ))}

                {/* Create Card Prompt */}
                {/* <button
                    onClick={() => handleOpenModal()}
                    className="group border-4 border-dashed border-slate-100 rounded-[20px] flex flex-col items-center justify-center p-12 hover:border-slate-200 hover:bg-slate-50/50 transition-all min-h-[400px]"
                >
                    <div className="w-20 h-20 rounded-[28px] bg-white  shadow-slate-200/50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <Plus className="w-10 h-10 text-slate-400" />
                    </div>
                    <span className="text-lg font-black text-slate-900">Add Another Tier</span>
                    <p className="text-slate-400 font-bold text-sm mt-2 text-center">New monetization strategy?</p>
                </button> */}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {modalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-2xl bg-white rounded-[16px] "
                        >
                            <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10">
                                <div>
                                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                                        {editingPlan ? 'Refine Tier' : 'Construct New Tier'}
                                    </h2>
                                    <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">Monetization Configuration</p>
                                </div>
                                <button
                                    onClick={() => setModalOpen(false)}
                                    className="w-12 h-12 rounded-2xl hover:bg-red-50 hover:text-red-500 text-slate-400 flex items-center justify-center transition-all duration-300"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[80vh] p-10 custom-scrollbar">
                                <div className="space-y-10">
                                    {/* Section 1: Core Pricing */}
                                    <section>
                                        <div className="flex items-center gap-2 mb-6">
                                            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                                                <Zap className="w-4 h-4 text-blue-500" />
                                            </div>
                                            <h3 className="text-base font-black text-slate-900 uppercase tracking-wider">Core Pricing & Identity</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Plan Name</label>
                                                <input required type="text" value={formData.name} onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all font-bold text-slate-900 placeholder:text-slate-200"
                                                    placeholder="e.g. Platinum Plus" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Plan Type</label>
                                                <select value={formData.planType} onChange={e => setFormData(prev => ({ ...prev, planType: e.target.value }))}
                                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all font-bold text-slate-900">
                                                    <option value="free">Free Tier</option>
                                                    <option value="basic">Basic Business</option>
                                                    <option value="premium">Premium Growth</option>
                                                    <option value="enterprise">Enterprise Elite</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Base Price (PKR)</label>
                                                <div className="relative">
                                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 font-black">Rs</span>
                                                    <input required type="number" value={formData.price} onChange={e => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                                                        className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all font-bold text-slate-900"
                                                        placeholder="0" />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Billing Cycle</label>
                                                <select value={formData.billingCycle} onChange={e => setFormData(prev => ({ ...prev, billingCycle: e.target.value }))}
                                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all font-bold text-slate-900">
                                                    <option value="monthly">Every Month</option>
                                                    <option value="quarterly">Every 3 Months</option>
                                                    <option value="yearly">Every Year</option>
                                                </select>
                                            </div>
                                        </div>
                                    </section>


                                    {/* Section 3: Features */}
                                    <section>
                                        <div className="flex items-center gap-2 mb-6">
                                            <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-base font-black text-slate-900 uppercase tracking-wider">Dashboard Ecosystem</h3>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Toggle vendor-side interface capabilities</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {[
                                                { id: 'showAnalytics', label: 'Analytics Hub' },
                                                { id: 'showLeads', label: 'Sales Leads' },
                                                { id: 'showOffers', label: 'Boost Engine' },
                                                { id: 'showDemand', label: 'Hot Insights' },
                                                { id: 'showQueries', label: 'Direct Mail' },
                                                { id: 'showReviews', label: 'Reputation' },
                                                { id: 'showChat', label: 'Live Messaging' },
                                                { id: 'showBroadcast', label: 'Global Feed' },
                                                { id: 'showListings', label: 'Inventory' },
                                                { id: 'canAddListing', label: 'Creation access' },
                                            ].map((feature) => {
                                                const isActive = formData.dashboardFeatures[feature.id as keyof typeof formData.dashboardFeatures];
                                                return (
                                                    <button key={feature.id} type="button"
                                                        onClick={() => setFormData(prev => ({
                                                            ...prev,
                                                            dashboardFeatures: { ...prev.dashboardFeatures, [feature.id]: !isActive }
                                                        }))}
                                                        className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all group ${isActive
                                                                ? 'border-emerald-500 bg-emerald-50/30 text-slate-900'
                                                                : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200'
                                                            }`}>
                                                        <span className={`text-[10px] font-black uppercase tracking-tight ${isActive ? 'text-emerald-700' : ''}`}>{feature.label}</span>
                                                        <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${isActive ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-transparent'}`}>
                                                            <Check className="w-3.5 h-3.5" />
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </section>

                                    {/* Descriptions & Toggles */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6 border-t border-slate-50">
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Marketing Summary</label>
                                            <textarea rows={3} value={formData.description} onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all font-bold text-slate-900 resize-none placeholder:text-slate-200"
                                                placeholder="What makes this plan special?" />
                                        </div>
                                        <div className="flex flex-col gap-4">
                                            <label className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl cursor-pointer group">
                                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Featured</span>
                                                <div className="relative">
                                                    <input type="checkbox" className="sr-only" checked={formData.isFeatured} onChange={e => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))} />
                                                    <div className={`w-8 h-4 rounded-full transition-colors ${formData.isFeatured ? 'bg-red-500' : 'bg-slate-300'}`} />
                                                    <div className={`absolute left-0.5 top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${formData.isFeatured ? 'translate-x-4' : ''}`} />
                                                </div>
                                            </label>
                                            <label className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl cursor-pointer group">
                                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Live Status</span>
                                                <div className="relative">
                                                    <input type="checkbox" className="sr-only" checked={formData.isActive} onChange={e => setFormData(prev => ({ ...prev, isActive: e.target.checked }))} />
                                                    <div className={`w-8 h-4 rounded-full transition-colors ${formData.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                                    <div className={`absolute left-0.5 top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${formData.isActive ? 'translate-x-4' : ''}`} />
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-14 flex gap-4 sticky bottom-0 bg-white pt-6 border-t border-slate-50">
                                    <button
                                        type="button"
                                        onClick={() => setModalOpen(false)}
                                        className="flex-grow py-5 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-2xl font-black text-sm transition-all active:scale-95"
                                    >
                                        Discard Changes
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex-[2] py-5 bg-slate-900 hover:bg-black text-white rounded-2xl font-black text-sm shadow-xl shadow-slate-900/10 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                                    >
                                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                        {editingPlan ? 'Lock In Updates' : 'Initialize Plan'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #E2E8F0;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #CBD5E1;
                }
            `}</style>
        </div>
    );
}
