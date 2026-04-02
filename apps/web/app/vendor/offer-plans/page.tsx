"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
    Gift, Tag, Calendar, Flame, Star, 
    CheckCircle2, Loader2, ShoppingCart, Eye, 
    TrendingUp, Info, XCircle, FileText, Sparkles,
    Clock, Download, ArrowRight, Wallet, Home, Layout, Search, Zap,
    ChevronRight, AlertTriangle, Plus
} from 'lucide-react';
import { api } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import Link from 'next/link';
import { format, isDate, isValid } from 'date-fns';

const safeFormat = (date: any, formatStr: string, fallback = '—') => {
    if (!date) return fallback;
    const d = new Date(date);
    if (!isValid(d)) return fallback;
    return format(d, formatStr);
};

interface OfferItem {
    id: string;
    title: string;
    type: 'offer' | 'event';
    businessId: string;
    business?: { title: string };
    status: string;
}

const labelClass = "block text-xs font-black uppercase tracking-widest text-slate-400 mb-2";
const inputClass = "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all placeholder:text-slate-400";

function VendorOfferPlansPageInner() {
    const { user } = useAuth();
    const searchParams = useSearchParams();
    
    // Core data
    const [invoices, setInvoices] = useState<any[]>([]);
    const [promotionsData, setPromotionsData] = useState<any>({ plans: [], boosts: [], dynamicBookings: [] });
    const [vendorOffers, setVendorOffers] = useState<OfferItem[]>([]);
    
    // UI state
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'booking' | 'trajection' | 'history'>('booking');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Booking form state
    const [selectedOfferId, setSelectedOfferId] = useState('');
    const [selectedPlacements, setSelectedPlacements] = useState<string[]>([]);
    const [promoStartTime, setPromoStartTime] = useState('');
    const [promoEndTime, setPromoEndTime] = useState('');
    const [estimatedPrice, setEstimatedPrice] = useState(0);
    const [priceBreakup, setPriceBreakup] = useState<any[]>([]);
    const [isCalculating, setIsCalculating] = useState(false);
    const [isBooking, setIsBooking] = useState(false);

    const canceled = searchParams?.get('canceled') === 'true';

    useEffect(() => {
        fetchData();
    }, [user]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [promosData, invoicesData, offersRes] = await Promise.all([
                api.subscriptions.getActivePromotions(),
                api.subscriptions.getMyInvoices(),
                api.offers.getMy(1, 100)
            ]);
            
            setPromotionsData(promosData || { plans: [], boosts: [], dynamicBookings: [] });
            setInvoices(invoicesData || []);
            setVendorOffers(offersRes.data || []);
        } catch (err) {
            console.error('Failed to fetch offer plans data', err);
        } finally {
            setLoading(false);
        }
    };

    // Real-time price calculation & smart end-time adjustment
    useEffect(() => {
        if (promoStartTime && (!promoEndTime || new Date(promoEndTime) <= new Date(promoStartTime))) {
            const newEnd = new Date(new Date(promoStartTime).getTime() + 60 * 60 * 1000);
            setPromoEndTime(newEnd.toISOString().slice(0, 16));
        }
    }, [promoStartTime]);

    useEffect(() => {
        const updatePrice = async () => {
            const start = promoStartTime ? new Date(promoStartTime) : null;
            const end = promoEndTime ? new Date(promoEndTime) : null;

            if (selectedPlacements.length > 0 && start && end && start < end) {
                setIsCalculating(true);
                try {
                    const selectedOffer = vendorOffers.find(o => o.id === selectedOfferId);
                    const offerType = selectedOffer?.type || 'offer';

                    const res = await api.promotions.calculatePrice({
                        placements: selectedPlacements,
                        startTime: promoStartTime,
                        endTime: promoEndTime,
                    }, offerType);
                    setEstimatedPrice(res.totalPrice);
                    setPriceBreakup(res.breakup || []);
                } catch (err) {
                    console.error('Price calculation failed:', err);
                } finally {
                    setIsCalculating(false);
                }
            } else {
                setEstimatedPrice(0);
                setPriceBreakup([]);
            }
        };

        const timer = setTimeout(updatePrice, 500);
        return () => clearTimeout(timer);
    }, [selectedPlacements, promoStartTime, promoEndTime]);

    const handleBooking = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedOfferId) { setError('Please select an offer or event to boost.'); return; }
        if (selectedPlacements.length === 0) { setError('Please select at least one placement.'); return; }
        if (!promoStartTime || !promoEndTime) { setError('Please select a valid time range.'); return; }
        if (new Date(promoStartTime) >= new Date(promoEndTime)) {
            setError('Promotion end time must be after the start time.');
            return;
        }

        setIsBooking(true);
        setError('');
        try {
            const res = await api.promotions.book({
                offerEventId: selectedOfferId,
                placements: selectedPlacements,
                startTime: promoStartTime,
                endTime: promoEndTime,
            });

            if (res.checkoutUrl) {
                window.location.href = res.checkoutUrl;
            } else {
                setSuccess('Booking created successfully!');
                await fetchData();
                setActiveTab('trajection');
            }
        } catch (err: any) {
            setError(err.message || 'Booking failed. Please try again.');
        } finally {
            setIsBooking(false);
        }
    };

    const hasActivePromos = (promotionsData?.plans?.length > 0) || 
                          (promotionsData?.boosts?.length > 0) || 
                          (promotionsData?.dynamicBookings?.length > 0);

    const activeBoostsCount = (promotionsData?.plans?.length || 0) + 
                             (promotionsData?.boosts?.length || 0) + 
                             (promotionsData?.dynamicBookings?.length || 0);

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-16">

            {/* Page Header */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B2244] via-[#0D2E61] to-[#1a3a70] p-8 text-white shadow-xl shadow-orange-500/20">
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center flex-shrink-0 backdrop-blur-md">
                            <Sparkles className="w-8 h-8 text-orange-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black tracking-tight">Boost & Promote</h1>
                            <p className="text-white/60 font-medium text-sm mt-0.5">
                                Increase visibility for your offers and events across the platform
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link 
                            href="/vendor/offer-plans/invoices"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl font-black text-sm transition-all backdrop-blur-md"
                        >
                            <FileText className="w-4 h-4" />
                            Billing History
                        </Link>
                    </div>
                </div>
            </div>

            {/* Status Banners */}
            {(success || canceled || error) && (
                <div className="space-y-4">
                    {success && (
                        <div className="flex items-center gap-4 px-6 py-4 bg-emerald-50 border-2 border-emerald-200 rounded-2xl">
                            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                            <p className="font-black text-emerald-800">{success}</p>
                        </div>
                    )}
                    {canceled && (
                        <div className="flex items-center gap-4 px-6 py-4 bg-amber-50 border-2 border-amber-200 rounded-2xl">
                            <XCircle className="w-6 h-6 text-amber-500" />
                            <div className="flex-1">
                                <p className="font-black text-amber-800">Payment Cancelled</p>
                                <p className="text-sm font-bold text-amber-600 mt-0.5">You can restart the booking anytime.</p>
                            </div>
                        </div>
                    )}
                    {error && (
                        <div className="flex items-center gap-3 px-5 py-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 font-bold">
                            <Info className="w-5 h-5 flex-shrink-0" />
                            <p className="text-sm">{error}</p>
                        </div>
                    )}
                </div>
            )}

            {/* Navigation Tabs */}
            <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl w-fit">
                {[
                    { id: 'booking', label: 'New Booking', icon: Plus },
                    { 
                        id: 'trajection', 
                        label: `Active Boosts ${activeBoostsCount > 0 ? `(${activeBoostsCount})` : ''}`, 
                        icon: Zap 
                    },
                    { id: 'history', label: 'History', icon: FileText },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-6 py-3 rounded-xl font-black text-sm transition-all flex items-center gap-2 ${
                            activeTab === tab.id 
                                ? 'bg-white text-slate-900 shadow-md' 
                                : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-orange-500' : ''}`} />
                        {tab.label}
                        {tab.id === 'trajection' && activeBoostsCount > 0 && (
                            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse ml-1" />
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-10 h-10 animate-spin text-orange-500 mb-4" />
                        <p className="font-black text-slate-400">Syncing dynamic data...</p>
                    </div>
                ) : activeTab === 'booking' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Booking Form */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
                                <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-orange-500" /> Configure Promotion
                                </h2>

                                <form onSubmit={handleBooking} className="space-y-8">
                                    {/* Offer Selection */}
                                    <div>
                                        <label className={labelClass}>Select Offer or Event</label>
                                        {vendorOffers.length === 0 ? (
                                            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                                                <p className="text-sm font-bold text-amber-700">You don't have any offers or events yet.</p>
                                                <Link href="/vendor/offers" className="text-xs font-black text-orange-600 mt-2 inline-block hover:underline">
                                                    Create an offer first →
                                                </Link>
                                            </div>
                                        ) : (
                                            <select 
                                                required 
                                                value={selectedOfferId}
                                                onChange={e => setSelectedOfferId(e.target.value)}
                                                className={inputClass}
                                            >
                                                <option value="">-- Choose your promotion --</option>
                                                {vendorOffers.map(offer => (
                                                    <option key={offer.id} value={offer.id}>
                                                        [{offer.type.toUpperCase()}] {offer.title} - {offer.business?.title}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    </div>

                                    {/* Placements */}
                                    <div>
                                        <label className={labelClass}>Choose Placements</label>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            {[
                                                { id: 'homepage', name: 'Main Homepage', desc: 'Top featured section', icon: Home },
                                                { id: 'category', name: 'Category Pages', desc: 'Above all results', icon: Layout },
                                                { id: 'listing', name: 'Search & Listing', desc: 'Boosted search position', icon: Search },
                                            ].map(place => (
                                                <button
                                                    key={place.id}
                                                    type="button"
                                                    onClick={() => {
                                                        const exists = selectedPlacements.includes(place.id);
                                                        setSelectedPlacements(exists 
                                                            ? selectedPlacements.filter(i => i !== place.id) 
                                                            : [...selectedPlacements, place.id]
                                                        );
                                                    }}
                                                    className={`group relative flex flex-col items-start gap-3 p-5 rounded-3xl border-2 transition-all text-left ${
                                                        selectedPlacements.includes(place.id)
                                                            ? 'border-orange-500 bg-orange-50/50 shadow-md ring-4 ring-orange-500/10'
                                                            : 'border-slate-100 bg-slate-50/50 hover:border-slate-200'
                                                    }`}
                                                >
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                                                        selectedPlacements.includes(place.id) ? 'bg-orange-500 text-white' : 'bg-white text-slate-400 group-hover:text-slate-600 shadow-sm'
                                                    }`}>
                                                        <place.icon className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-slate-900 text-sm leading-tight">{place.name}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 mt-0.5">{place.desc}</p>
                                                    </div>
                                                    {selectedPlacements.includes(place.id) && (
                                                        <div className="absolute top-4 right-4">
                                                            <CheckCircle2 className="w-4 h-4 text-orange-500" />
                                                        </div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Date Range */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div>
                                            <label className={labelClass}>Start Boosting From</label>
                                            <div className="relative">
                                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                <input 
                                                    type="datetime-local"
                                                    required
                                                    value={promoStartTime}
                                                    onChange={e => setPromoStartTime(e.target.value)}
                                                    className={`${inputClass} pl-10`}
                                                    min={new Date().toISOString().slice(0, 16)}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className={labelClass}>End Boosting At</label>
                                            <div className="relative">
                                                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                <input 
                                                    type="datetime-local"
                                                    required
                                                    value={promoEndTime}
                                                    onChange={e => setPromoEndTime(e.target.value)}
                                                    className={`${inputClass} pl-10`}
                                                    min={promoStartTime || new Date().toISOString().slice(0, 16)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <button 
                                        type="submit" 
                                        disabled={isBooking || !selectedOfferId || selectedPlacements.length === 0}
                                        className="hidden lg:block w-full"
                                    >
                                        {/* This button is visually hidden because the summary card handles the action */}
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Pricing Summary Sidebar */}
                        <div className="space-y-6">
                            <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden sticky top-8">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />
                                
                                <h3 className="text-lg font-black mb-6 flex items-center gap-2">
                                    <Wallet className="w-5 h-5 text-orange-400" /> Booking Summary
                                </h3>

                                <div className="space-y-4 mb-8">
                                    <div className="flex justify-between items-center text-sm py-2 border-b border-white/10 text-white/60">
                                        <span className="font-bold">Placements</span>
                                        <span className="font-black text-white">{selectedPlacements.length} selected</span>
                                    </div>
                                    
                                    {priceBreakup.length > 0 && (
                                        <div className="space-y-3 py-2">
                                            {priceBreakup.map((item, idx) => (
                                                <div key={idx} className="space-y-1">
                                                    <div className="flex justify-between text-[11px] font-black uppercase tracking-wider text-orange-400">
                                                        <span>{item.placement}</span>
                                                        <span>PKR {item.subtotal.toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex justify-between text-[10px] text-white/40 font-bold">
                                                        <span>Rate</span>
                                                        <span>PKR {item.hourRate}/{item.isCustomRate ? 'hr (Plan)' : 'hr'}</span>
                                                    </div>
                                                    <div className="flex justify-between text-[10px] text-white/40 font-bold">
                                                        <span>Duration</span>
                                                        <span>{item.days > 0 ? `${item.days}d ` : ''}{item.hours}h</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {!priceBreakup.length && selectedPlacements.map(p => (
                                        <div key={p} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/5 text-[10px] font-black uppercase tracking-wider">
                                            <TrendingUp className="w-3 h-3 text-orange-400" /> {p}
                                        </div>
                                    ))}
                                    
                                    <div className="pt-4 space-y-2 border-t border-white/10">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Total Price</p>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-xs font-black text-white/60">PKR</span>
                                            <span className={`text-4xl font-black ${isCalculating ? 'opacity-30' : 'opacity-100'}`}>
                                                {estimatedPrice.toLocaleString('en-PK')}
                                            </span>
                                            {isCalculating && <Loader2 className="w-5 h-5 animate-spin text-orange-400 inline-block mb-1 ml-2" />}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleBooking}
                                    disabled={isBooking || !selectedOfferId || selectedPlacements.length === 0 || !promoStartTime || !promoEndTime}
                                    className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-orange-500/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isBooking ? (
                                        <><Loader2 className="w-4 h-4 animate-spin" /> Finalizing...</>
                                    ) : (
                                        <>Proceed to Payment <ChevronRight className="w-4 h-4" /></>
                                    )}
                                </button>
                                
                                <div className="mt-6 flex items-center gap-3 px-4 py-3 bg-white/5 rounded-2xl border border-white/10">
                                    <Zap className="w-5 h-5 text-amber-400 animate-pulse" />
                                    <p className="text-[10px] font-bold text-white/60 leading-tight">
                                        Real-time dynamic pricing based on placement and duration rules.
                                    </p>
                                </div>
                            </div>

                            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
                                <h4 className="text-sm font-black text-slate-900 mb-4 flex items-center gap-2">
                                    <Info className="w-4 h-4 text-blue-500" /> Professional Boost Tips
                                </h4>
                                <ul className="space-y-3">
                                    {[
                                        'Homepage placement gets 10x more views.',
                                        'Weekend boosts drive 40% more conversion.',
                                        'Use high-quality banner images for better CTR.',
                                    ].map((tip, i) => (
                                        <li key={i} className="flex gap-2 text-xs font-bold text-slate-500">
                                            <span className="text-orange-500">•</span> {tip}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                ) : activeTab === 'trajection' ? (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Active Dynamic Bookings */}
                        <section>
                            <div className="flex items-center gap-2 mb-4">
                                <Sparkles className="w-5 h-5 text-orange-500" />
                                <h2 className="text-xl font-black text-slate-900">Active Dynamic Boosts</h2>
                            </div>
                            
                            {!hasActivePromos ? (
                                <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-16 text-center">
                                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Sparkles className="w-10 h-10 text-slate-300" />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 mb-2">No Active Boosts</h3>
                                    <p className="text-slate-400 font-bold mb-8 max-w-sm mx-auto">
                                        You don't have any active promotions at the moment. Start a new booking to boost your visibility!
                                    </p>
                                    <button 
                                        onClick={() => setActiveTab('booking')}
                                        className="inline-flex items-center gap-2 px-8 py-3.5 bg-orange-500 text-white rounded-2xl font-black text-sm hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20"
                                    >
                                        Create First Boost <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {/* Traditional Subscription Plans */}
                                    {promotionsData.plans?.map((plan: any) => (
                                        <div key={plan.id} className="bg-white border-2 border-slate-100 rounded-3xl p-6 relative overflow-hidden group hover:border-orange-200 transition-all shadow-sm">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="w-10 h-10 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600">
                                                    <TrendingUp className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h3 className="font-black text-slate-900 line-clamp-1">{plan.name}</h3>
                                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{plan.target || 'Business Listing'}</p>
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between text-sm py-2 border-b border-slate-50">
                                                    <span className="text-slate-400 font-bold flex items-center gap-2"><Clock className="w-4 h-4" /> Expires in</span>
                                                    <span className="font-black text-orange-600">
                                                        {plan.endDate ? Math.max(0, Math.ceil((new Date(plan.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : '—'} days
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-slate-400 font-bold flex items-center gap-2"><Calendar className="w-4 h-4" /> Valid until</span>
                                                    <span className="text-slate-900 font-black">{safeFormat(plan.endDate, 'MMM d, yyyy')}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Traditional Feature Boosts */}
                                    {promotionsData.boosts?.map((boost: any) => (
                                        <div key={boost.id} className="bg-white border-2 border-slate-100 rounded-3xl p-6 relative overflow-hidden group hover:border-amber-200 transition-all shadow-sm">
                                            <div className="absolute top-0 right-0 p-3">
                                                <span className="px-2 py-1 bg-amber-500 text-white text-[8px] font-black uppercase rounded-lg">Featured</span>
                                            </div>
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="w-10 h-10 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                                                    <Star className="w-5 h-5 fill-amber-500" />
                                                </div>
                                                <div>
                                                    <h3 className="font-black text-slate-900 line-clamp-1">{boost.title}</h3>
                                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{boost.business || 'Business Listing'}</p>
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between text-sm py-2 border-b border-slate-50">
                                                    <span className="text-slate-400 font-bold flex items-center gap-2"><Clock className="w-4 h-4" /> Expires in</span>
                                                    <span className="font-black text-amber-600">
                                                        {boost.endDate ? Math.max(0, Math.ceil((new Date(boost.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : '—'} days
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-slate-400 font-bold flex items-center gap-2"><Calendar className="w-4 h-4" /> Valid until</span>
                                                    <span className="text-slate-900 font-black">{safeFormat(boost.endDate, 'MMM d, yyyy')}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Dynamic Promotion Bookings */}
                                    {promotionsData.dynamicBookings?.map((booking: any) => (
                                        <div key={booking.id} className="bg-white border-2 border-slate-200 rounded-3xl p-6 relative overflow-hidden group hover:border-orange-400 transition-all shadow-md bg-gradient-to-br from-white to-orange-50/20">
                                            <div className="absolute top-0 right-0 p-3">
                                                <span className="px-2 py-1 bg-orange-500 text-white text-[8px] font-black uppercase rounded-lg">Dynamic</span>
                                            </div>
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="w-12 h-12 bg-orange-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                                                    <Sparkles className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h3 className="font-black text-slate-900 line-clamp-1">{booking.offerEvent?.title || 'Target Item'}</h3>
                                                    <p className="text-[10px] text-orange-500 font-black uppercase tracking-widest">Premium Boost</p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex flex-wrap gap-2 mb-6">
                                                {booking.placements?.map((p: string) => (
                                                    <span key={p} className="px-2 py-1 bg-slate-900 text-white text-[9px] font-black uppercase rounded-md tracking-wider">
                                                        {p}
                                                    </span>
                                                ))}
                                            </div>

                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between text-sm py-2 border-b border-slate-100">
                                                    <span className="text-slate-400 font-bold flex items-center gap-2"><Clock className="w-4 h-4" /> Status</span>
                                                    <span className={`font-black uppercase text-[10px] px-2 py-1 rounded-lg ${
                                                        booking.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                                                    }`}>
                                                        {booking.status}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-slate-400 font-bold flex items-center gap-2"><Calendar className="w-4 h-4" /> Ends At</span>
                                                    <span className="text-slate-900 font-black">{safeFormat(booking.endTime, 'MMM d, h:mm a')}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>
                ) : (
                    <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                            <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                                <h2 className="text-lg font-black text-slate-900">Purchase History</h2>
                                <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-black text-slate-400 uppercase">
                                    {invoices.length} entries
                                </span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-[#fcfdff] border-b border-slate-100 underline-offset-4 decoration-orange-200">
                                        <tr>
                                            <th className="px-8 py-5 font-black text-slate-400 uppercase tracking-widest text-[10px]">Date</th>
                                            <th className="px-8 py-5 font-black text-slate-400 uppercase tracking-widest text-[10px]">Description</th>
                                            <th className="px-8 py-5 font-black text-slate-400 uppercase tracking-widest text-[10px] text-right">Amount</th>
                                            <th className="px-8 py-5 font-black text-slate-400 uppercase tracking-widest text-[10px] text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {invoices.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="px-8 py-20 text-center">
                                                    <div className="flex flex-col items-center gap-3 grayscale opacity-40">
                                                        <FileText className="w-12 h-12 text-slate-300" />
                                                        <p className="font-bold text-slate-400 text-sm">No transaction records found</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            invoices.map((invoice: any) => (
                                                <tr key={invoice.id} className="group hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-8 py-5 whitespace-nowrap font-bold text-slate-900">
                                                        {safeFormat(invoice.createdAt, 'MMM d, yyyy')}
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <div className="font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                                                            {invoice.subscription?.plan?.name || invoice.metadata?.planName || 'Premium Promotion'}
                                                        </div>
                                                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-0.5">
                                                            ID: {invoice.invoiceNumber || invoice.id.slice(0, 8)}
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5 text-right">
                                                        <div className="font-black text-slate-900">{invoice.currency} {parseFloat(invoice.amount).toLocaleString()}</div>
                                                        <div className="text-[9px] font-black text-slate-400 uppercase">Paid via Stripe</div>
                                                    </td>
                                                    <td className="px-8 py-5 text-center">
                                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border-2 ${
                                                            invoice.status === 'completed' || invoice.status === 'paid'
                                                                ? 'bg-green-50 text-green-700 border-green-100' 
                                                                : 'bg-amber-50 text-amber-700 border-amber-100'
                                                        }`}>
                                                            {invoice.status === 'completed' || invoice.status === 'paid' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                                            {invoice.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}

export default function VendorOfferPlansPage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center min-vh-[60vh] gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-orange-500" />
                <p className="font-black text-slate-400 animate-pulse">Initializing platform modules...</p>
            </div>
        }>
            <VendorOfferPlansPageInner />
        </Suspense>
    );
}
