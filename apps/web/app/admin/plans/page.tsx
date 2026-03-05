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
    features: string[];
    maxListings: number;
    isFeatured: boolean;
    isSponsored: boolean;
    isActive: boolean;
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
        features: [''],
        maxListings: 1,
        isFeatured: false,
        isSponsored: false,
        isActive: true
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
                features: plan.features.length > 0 ? plan.features : [''],
                maxListings: plan.maxListings,
                isFeatured: plan.isFeatured,
                isSponsored: plan.isSponsored,
                isActive: plan.isActive
            });
        } else {
            setEditingPlan(null);
            setFormData({
                name: '',
                planType: 'basic',
                description: '',
                price: 0,
                billingCycle: 'monthly',
                features: [''],
                maxListings: 1,
                isFeatured: false,
                isSponsored: false,
                isActive: true
            });
        }
        setModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const filteredFeatures = formData.features.filter(f => f.trim() !== '');
        const payload = { ...formData, features: filteredFeatures };

        try {
            if (editingPlan) {
                await api.admin.plans.update(editingPlan.id, payload);
            } else {
                await api.admin.plans.create(payload);
            }
            await fetchPlans();
            setModalOpen(false);
        } catch (err) {
            console.error('Save failed', err);
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

    const handleAddFeature = () => {
        setFormData(prev => ({ ...prev, features: [...prev.features, ''] }));
    };

    const handleRemoveFeature = (index: number) => {
        setFormData(prev => ({
            ...prev,
            features: prev.features.filter((_, i) => i !== index)
        }));
    };

    const handleFeatureChange = (index: number, value: string) => {
        const newFeatures = [...formData.features];
        newFeatures[index] = value;
        setFormData(prev => ({ ...prev, features: newFeatures }));
    };

    const getPlanIcon = (type: string) => {
        switch (type) {
            case 'free': return <Clock className="w-5 h-5 text-slate-400" />;
            case 'basic': return <Zap className="w-5 h-5 text-blue-500" />;
            case 'premium': return <Crown className="w-5 h-5 text-amber-500" />;
            case 'enterprise': return <Building2 className="w-5 h-5 text-red-500" />;
            default: return <CreditCard className="w-5 h-5 text-slate-400" />;
        }
    };

    if (loading && plans.length === 0) {
        return (
            <div className="flex items-center justify-center py-24">
                <Loader2 className="w-10 h-10 animate-spin text-slate-300" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Subscription Plans</h1>
                    <p className="text-slate-400 font-bold mt-2 flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-red-500" />
                        Manage business listing tiers and monetization.
                    </p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="px-8 py-4 bg-slate-900 hover:bg-black text-white rounded-[16px] font-black text-sm flex items-center justify-center gap-3 shadow-2xl shadow-slate-900/10 transition-all active:scale-95 whitespace-nowrap"
                >
                    <Plus className="w-5 h-5" />
                    Create New Plan
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
                        className={`group relative bg-white rounded-[32px] p-8 border-2 transition-all flex flex-col h-full ${plan.isActive
                            ? 'border-slate-50 shadow-xl shadow-slate-200/40'
                            : 'border-slate-100 opacity-75 grayscale-[0.5]'
                            }`}
                    >
                        {!plan.isActive && (
                            <div className="absolute top-6 right-6 px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500">
                                Inactive
                            </div>
                        )}

                        <div className="flex items-center gap-4 mb-6">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${plan.planType === 'premium' ? 'bg-amber-50' :
                                plan.planType === 'basic' ? 'bg-blue-50' :
                                    plan.planType === 'enterprise' ? 'bg-red-50' : 'bg-slate-50'
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
                                <span className="text-4xl font-black text-slate-900">${plan.price}</span>
                                <span className="text-slate-400 font-bold text-sm">/{plan.billingCycle}</span>
                            </div>
                            <p className="text-slate-500 font-bold text-sm mt-3 leading-relaxed">
                                {plan.description || 'Flexible plan for growing businesses.'}
                            </p>
                        </div>

                        <div className="space-y-3 mb-8 flex-grow">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 pb-2 border-b border-slate-50">Included Features</p>
                            {plan.features.map((feature, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <div className="mt-1 w-4 h-4 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                                        <Check className="w-2.5 h-2.5 text-emerald-500 stroke-[3]" />
                                    </div>
                                    <span className="text-slate-600 font-bold text-sm leading-tight">{feature}</span>
                                </div>
                            ))}
                            <div className="flex items-center gap-3 pt-2">
                                <div className="w-4 h-4 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                                    <Layers className="w-2.5 h-2.5 text-blue-500" />
                                </div>
                                <span className="text-slate-900 font-black text-sm">{plan.maxListings} Listings Allowed</span>
                            </div>
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
                                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all active:scale-95 ${plan.isActive
                                    ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-500'
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
                <button
                    onClick={() => handleOpenModal()}
                    className="group border-4 border-dashed border-slate-100 rounded-[32px] flex flex-col items-center justify-center p-12 hover:border-slate-200 hover:bg-slate-50/50 transition-all min-h-[400px]"
                >
                    <div className="w-20 h-20 rounded-[28px] bg-white shadow-xl shadow-slate-200/50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <Plus className="w-10 h-10 text-slate-400" />
                    </div>
                    <span className="text-lg font-black text-slate-900">Add Another Tier</span>
                    <p className="text-slate-400 font-bold text-sm mt-2 text-center">New monetization strategy?</p>
                </button>
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
                            <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900">
                                        {editingPlan ? 'Edit Plan' : 'Create New Plan'}
                                    </h2>
                                    <p className="text-sm font-bold text-slate-400 mt-1">Configure your subscription tier details.</p>
                                </div>
                                <button
                                    onClick={() => setModalOpen(false)}
                                    className="w-12 h-12 rounded-2xl hover:bg-slate-50 text-slate-400 flex items-center justify-center transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-10 overflow-y-auto max-h-[70vh]">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Plan Name</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.name}
                                            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-200 font-bold text-slate-900"
                                            placeholder="Monthly Starter"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Plan Type</label>
                                        <select
                                            value={formData.planType}
                                            onChange={e => setFormData(prev => ({ ...prev, planType: e.target.value }))}
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-200 font-bold text-slate-900"
                                        >
                                            <option value="free">Free</option>
                                            <option value="basic">Basic</option>
                                            <option value="premium">Premium</option>
                                            <option value="enterprise">Enterprise</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Price ($)</label>
                                        <input
                                            required
                                            type="number"
                                            value={formData.price}
                                            onChange={e => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-200 font-bold text-slate-900"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Max Listings</label>
                                        <input
                                            required
                                            type="number"
                                            value={formData.maxListings}
                                            onChange={e => setFormData(prev => ({ ...prev, maxListings: Number(e.target.value) }))}
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-200 font-bold text-slate-900"
                                            placeholder="1"
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Description</label>
                                        <textarea
                                            rows={2}
                                            value={formData.description}
                                            onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-200 font-bold text-slate-900 resize-none"
                                            placeholder="Short catchy description..."
                                        />
                                    </div>

                                    <div className="md:col-span-2 space-y-4 pt-4 border-t border-slate-50">
                                        <div className="flex items-center justify-between">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Plan Features</label>
                                            <button
                                                type="button"
                                                onClick={handleAddFeature}
                                                className="text-xs font-black text-rose-500 hover:text-rose-600 flex items-center gap-1"
                                            >
                                                <Plus className="w-3 h-3" /> Add Feature
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-1 gap-3">
                                            {formData.features.map((feature, index) => (
                                                <div key={index} className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={feature}
                                                        onChange={e => handleFeatureChange(index, e.target.value)}
                                                        className="flex-grow px-6 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-200 font-bold text-sm"
                                                        placeholder="e.g. Priority Support"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveFeature(index)}
                                                        className="w-12 h-12 rounded-xl bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 flex items-center justify-center transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="md:col-span-2 flex flex-wrap gap-6 pt-6 border-t border-slate-50">
                                        <label className="flex items-center gap-3 cursor-pointer group">
                                            <div className="relative">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only"
                                                    checked={formData.isFeatured}
                                                    onChange={e => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                                                />
                                                <div className={`w-10 h-6 rounded-full transition-colors ${formData.isFeatured ? 'bg-red-500' : 'bg-slate-200'}`} />
                                                <div className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform ${formData.isFeatured ? 'translate-x-4' : ''}`} />
                                            </div>
                                            <span className="text-xs font-black text-slate-600 uppercase tracking-widest">Featured Plan</span>
                                        </label>

                                        <label className="flex items-center gap-3 cursor-pointer group">
                                            <div className="relative">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only"
                                                    checked={formData.isSponsored}
                                                    onChange={e => setFormData(prev => ({ ...prev, isSponsored: e.target.checked }))}
                                                />
                                                <div className={`w-10 h-6 rounded-full transition-colors ${formData.isSponsored ? 'bg-amber-500' : 'bg-slate-200'}`} />
                                                <div className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform ${formData.isSponsored ? 'translate-x-4' : ''}`} />
                                            </div>
                                            <span className="text-xs font-black text-slate-600 uppercase tracking-widest">Sponsored</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="mt-12 flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setModalOpen(false)}
                                        className="flex-grow py-5 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-2xl font-black text-sm transition-all active:scale-95"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex-[2] py-5 bg-slate-900 hover:bg-black text-white rounded-2xl font-black text-sm shadow-xl shadow-slate-900/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                                    >
                                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                        {editingPlan ? 'Update Plan' : 'Create Plan'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
