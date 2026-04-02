"use client";

import React, { useState, useEffect } from 'react';
import { 
    Gift, 
    Calendar, 
    Plus, 
    Search, 
    Filter, 
    MoreVertical, 
    Edit2, 
    Trash2, 
    CheckCircle2, 
    XCircle,
    Zap,
    Clock,
    LayoutGrid,
    Tag,
    Loader2,
    RefreshCcw,
    AlertCircle
} from 'lucide-react';
import { api } from '../../../lib/api';
import { toast } from 'react-hot-toast';
import { Badge } from '../../../components/ui/Badge';

interface PricingPlan {
    id: string;
    name: string;
    description: string;
    type: string;
    price: number;
    duration: number;
    unit: string;
    isActive: boolean;
    features: any;
}

const OfferEventPlansPage = () => {
    const [plans, setPlans] = useState<PricingPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState<'offer' | 'event'>('offer');

    // Form State
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        description: '',
        type: 'homepage_featured',
        boostType: 'offer', // Internal toggle for Offer vs Event
        price: '',
        duration: '',
        unit: 'hours',
        isActive: true,
        placements: {
            home: true,
            category: false,
            listing: false
        }
    });

    const fetchPlans = async () => {
        try {
            setLoading(true);
            const data = await api.admin.pricingPlans.getAll();
            setPlans(data);
        } catch (error) {
            console.error('Failed to fetch plans:', error);
            toast.error('Failed to load plans.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.name || !formData.price || !formData.duration) {
            toast.error('Please fill in all required fields.');
            return;
        }

        try {
            setIsSubmitting(true);
            
            // Map boostType and placements to the entity structure if needed
            // For now, we'll just send the flat object
            const payload = {
                name: formData.name,
                description: formData.description,
                type: formData.type, // e.g. 'homepage_featured'
                price: parseFloat(formData.price),
                duration: parseInt(formData.duration),
                unit: formData.unit,
                isActive: formData.isActive,
                features: {
                    placements: formData.placements,
                    boostType: formData.boostType // offer or event
                }
            };

            if (formData.id) {
                await api.admin.pricingPlans.update(formData.id, payload);
                toast.success('Plan updated successfully.');
            } else {
                await api.admin.pricingPlans.create(payload);
                toast.success('Plan created successfully.');
            }

            resetForm();
            fetchPlans();
        } catch (error) {
            console.error('Failed to save plan:', error);
            toast.error('Failed to save plan.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (plan: PricingPlan) => {
        setFormData({
            id: plan.id,
            name: plan.name,
            description: plan.description || '',
            type: plan.type,
            boostType: plan.features?.boostType || 'offer',
            price: plan.price.toString(),
            duration: plan.duration.toString(),
            unit: plan.unit,
            isActive: plan.isActive,
            placements: plan.features?.placements || { home: true, category: false, listing: false }
        });
        
        // Scroll to form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this plan?')) return;

        try {
            await api.admin.pricingPlans.delete(id);
            toast.success('Plan deleted successfully.');
            fetchPlans();
        } catch (error) {
            toast.error('Failed to delete plan.');
        }
    };

    const resetForm = () => {
        setFormData({
            id: '',
            name: '',
            description: '',
            type: 'homepage_featured',
            boostType: 'offer',
            price: '',
            duration: '',
            unit: 'hours',
            isActive: true,
            placements: {
                home: true,
                category: false,
                listing: false
            }
        });
    };

    const filteredPlans = plans.filter(p => (p.features?.boostType || 'offer') === activeTab);

    return (
        <div className="p-6 space-y-8 bg-[#0a0a0a] min-h-screen text-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                        <Gift className="w-8 h-8 text-indigo-500" />
                        Offer & Event Plans
                    </h1>
                    <p className="text-gray-400 mt-1">Manage monetization packages for promotional boosts.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={fetchPlans}
                        className="p-2 bg-gray-900 rounded-lg text-gray-400 hover:text-white transition-colors"
                    >
                        <RefreshCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-indigo-900/20 to-black p-6 rounded-2xl border border-indigo-500/20 shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-indigo-500/20 rounded-xl">
                            <Tag className="w-6 h-6 text-indigo-400" />
                        </div>
                        <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20">Total</Badge>
                    </div>
                    <div className="text-3xl font-bold">{plans.filter(p => (p.features?.boostType || 'offer') === 'offer').length}</div>
                    <p className="text-gray-400 text-sm mt-1">Offer Pricing Plans</p>
                </div>

                <div className="bg-gradient-to-br from-purple-900/20 to-black p-6 rounded-2xl border border-purple-500/20 shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-purple-500/20 rounded-xl">
                            <Calendar className="w-6 h-6 text-purple-400" />
                        </div>
                        <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20">Total</Badge>
                    </div>
                    <div className="text-3xl font-bold">{plans.filter(p => (p.features?.boostType || 'offer') === 'event').length}</div>
                    <p className="text-gray-400 text-sm mt-1">Event Pricing Plans</p>
                </div>

                <div className="bg-gradient-to-br from-emerald-900/20 to-black p-6 rounded-2xl border border-emerald-500/20 shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-emerald-500/20 rounded-xl">
                            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                        </div>
                        <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">Active</Badge>
                    </div>
                    <div className="text-3xl font-bold">{plans.filter(p => p.isActive).length}</div>
                    <p className="text-gray-400 text-sm mt-1">Active Packages</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Package Form */}
                <div className="lg:col-span-1">
                    <div className="bg-[#111111] p-8 rounded-2xl border border-gray-800 shadow-2xl sticky top-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                {formData.id ? <Edit2 className="w-5 h-5 text-indigo-400" /> : <Plus className="w-5 h-5 text-indigo-400" />}
                                {formData.id ? 'Edit Package' : 'New Package'}
                            </h2>
                            {formData.id && (
                                <button 
                                    onClick={resetForm}
                                    className="text-xs text-gray-500 hover:text-white underline"
                                >
                                    Cancel Edit
                                </button>
                            )}
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Type Toggle */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400 uppercase tracking-wider">Package Target</label>
                                <div className="grid grid-cols-2 gap-2 p-1 bg-black rounded-xl border border-gray-800">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({...formData, boostType: 'offer'})}
                                        className={`py-2 px-4 rounded-lg text-sm font-medium transition-all ${formData.boostType === 'offer' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                                    >
                                        Offers
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({...formData, boostType: 'event'})}
                                        className={`py-2 px-4 rounded-lg text-sm font-medium transition-all ${formData.boostType === 'event' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                                    >
                                        Events
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400">Package Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    placeholder="e.g. 24 Hour Flash Boost"
                                    className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400">Price (PKR)</label>
                                    <input
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                                        placeholder="0.00"
                                        className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400">Status</label>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({...formData, isActive: !formData.isActive})}
                                        className={`w-full py-3 px-4 rounded-xl text-sm font-medium border transition-all flex items-center justify-center gap-2 ${formData.isActive ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}
                                    >
                                        {formData.isActive ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                        {formData.isActive ? 'Enabled' : 'Disabled'}
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400">Duration</label>
                                    <input
                                        type="number"
                                        value={formData.duration}
                                        onChange={(e) => setFormData({...formData, duration: e.target.value})}
                                        placeholder="1"
                                        className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400">Unit</label>
                                    <select
                                        value={formData.unit}
                                        onChange={(e) => setFormData({...formData, unit: e.target.value})}
                                        className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none"
                                    >
                                        <option value="hours">Hours</option>
                                        <option value="days">Days</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-medium text-gray-400">Placements Included</label>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-3 p-3 bg-black/50 border border-gray-800 rounded-xl cursor-pointer hover:border-gray-700 transition-all">
                                        <input
                                            type="checkbox"
                                            checked={formData.placements.home}
                                            onChange={(e) => setFormData({...formData, placements: {...formData.placements, home: e.target.checked}})}
                                            className="w-5 h-5 rounded border-gray-800 text-indigo-600 focus:ring-indigo-500 bg-gray-900"
                                        />
                                        <span className="text-sm">Home Page Spotlight</span>
                                    </label>
                                    <label className="flex items-center gap-3 p-3 bg-black/50 border border-gray-800 rounded-xl cursor-pointer hover:border-gray-700 transition-all">
                                        <input
                                            type="checkbox"
                                            checked={formData.placements.category}
                                            onChange={(e) => setFormData({...formData, placements: {...formData.placements, category: e.target.checked}})}
                                            className="w-5 h-5 rounded border-gray-800 text-indigo-600 focus:ring-indigo-500 bg-gray-900"
                                        />
                                        <span className="text-sm">Category Dominance</span>
                                    </label>
                                    <label className="flex items-center gap-3 p-3 bg-black/50 border border-gray-800 rounded-xl cursor-pointer hover:border-gray-700 transition-all">
                                        <input
                                            type="checkbox"
                                            checked={formData.placements.listing}
                                            onChange={(e) => setFormData({...formData, placements: {...formData.placements, listing: e.target.checked}})}
                                            className="w-5 h-5 rounded border-gray-800 text-indigo-600 focus:ring-indigo-500 bg-gray-900"
                                        />
                                        <span className="text-sm">Related Listings Boost</span>
                                    </label>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
                            >
                                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                                {formData.id ? 'Update Package' : 'Create Package'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Plans List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-[#111111] rounded-2xl border border-gray-800 overflow-hidden">
                        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
                            <div className="flex bg-black p-1 rounded-xl border border-gray-800">
                                <button
                                    onClick={() => setActiveTab('offer')}
                                    className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'offer' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                                >
                                    Offer Plans
                                </button>
                                <button
                                    onClick={() => setActiveTab('event')}
                                    className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'event' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                                >
                                    Event Plans
                                </button>
                            </div>
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Search plans..."
                                    className="bg-black border border-gray-800 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 w-48 md:w-64"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-black/50 text-gray-400 text-xs uppercase tracking-wider">
                                        <th className="px-6 py-4 font-medium">Package Info</th>
                                        <th className="px-6 py-4 font-medium">Type</th>
                                        <th className="px-6 py-4 font-medium">Price</th>
                                        <th className="px-6 py-4 font-medium">Duration</th>
                                        <th className="px-6 py-4 font-medium">Status</th>
                                        <th className="px-6 py-4 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800/50">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-indigo-500" />
                                                Loading packages...
                                            </td>
                                        </tr>
                                    ) : filteredPlans.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                                <div className="flex flex-col items-center gap-2">
                                                    <AlertCircle className="w-12 h-12 text-gray-700" />
                                                    <p>No {activeTab} plans found.</p>
                                                    <p className="text-xs">Use the form to create your first boost package.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredPlans.map((plan) => (
                                            <tr key={plan.id} className="hover:bg-white/[0.02] transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-white group-hover:text-indigo-400 transition-colors">{plan.name}</div>
                                                    <div className="text-xs text-gray-500 truncate max-w-xs">{plan.description || 'No description'}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge className="bg-gray-900 border-gray-800 text-gray-300 capitalize">
                                                        {plan.type?.replace('_', ' ')}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="font-semibold text-emerald-400">Rs. {plan.price.toLocaleString()}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-gray-300">
                                                        <Clock className="w-4 h-4 text-gray-500" />
                                                        {plan.duration} {plan.unit}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge className={plan.isActive ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}>
                                                        {plan.isActive ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button 
                                                            onClick={() => handleEdit(plan)}
                                                            className="p-2 hover:bg-indigo-500/10 rounded-lg text-gray-400 hover:text-indigo-400 transition-all border border-transparent hover:border-indigo-500/20"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDelete(plan.id)}
                                                            className="p-2 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-500 transition-all border border-transparent hover:border-red-500/20"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="bg-indigo-500/5 rounded-2xl border border-indigo-500/10 p-6 flex gap-4 items-start">
                        <Zap className="w-6 h-6 text-indigo-400 shrink-0 mt-1" />
                        <div>
                            <h3 className="font-semibold text-indigo-300">Boost Engine Note</h3>
                            <p className="text-sm text-gray-400 mt-1 leading-relaxed">
                                Packages defined here will be available to vendors when booking promotions. 
                                Each package includes specific placements and a fixed duration. 
                                Prices are in PKR and handled via Stripe.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OfferEventPlansPage;
