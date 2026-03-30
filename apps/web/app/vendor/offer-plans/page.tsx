"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
    Gift, Tag, Calendar, Flame, Star, 
    CheckCircle2, Loader2, ShoppingCart, Eye, 
    TrendingUp, Info, XCircle, FileText, Sparkles,
    Clock, Download, ArrowRight, Wallet
} from 'lucide-react';
import { api } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import Link from 'next/link';
import { format } from 'date-fns';

interface OfferPlan {
    id: string;
    type: 'offer' | 'event';
    name: string;
    price: number;
    unit: 'hours' | 'days' | 'minutes';
    duration: number;
    isActive: boolean;
}

const OFFER_FEATURES = [
    { icon: Flame, label: 'Featured badge on listing card' },
    { icon: TrendingUp, label: 'Boosted in search & category results' },
    { icon: Star, label: 'Highlighted on business page' },
    { icon: Eye, label: 'More visibility to potential customers' },
];

const EVENT_FEATURES = [
    { icon: Calendar, label: 'Event listed on homepage highlights' },
    { icon: TrendingUp, label: 'Boosted in category & city pages' },
    { icon: Star, label: 'Event badge on listing details' },
    { icon: Eye, label: 'Priority placement in event search' },
];

function PlanCard({
    plan,
    onPurchase,
    purchasing,
}: {
    plan: OfferPlan;
    onPurchase: (plan: OfferPlan) => void;
    purchasing: string | null;
}) {
    const isBuying = purchasing === plan.id;
    const features = plan.type === 'offer' ? OFFER_FEATURES : EVENT_FEATURES;
    const durationLabel = `${plan.duration} ${plan.unit === 'hours'
        ? plan.duration > 1 ? 'Hours' : 'Hour'
        : plan.unit === 'days'
            ? plan.duration > 1 ? 'Days' : 'Day'
            : plan.duration + ' Min'}`;
    const unitIcon = plan.unit === 'hours' ? '⏰' : plan.unit === 'days' ? '📅' : '⚡';
    const isOffer = plan.type === 'offer';

    return (
        <div className={`relative flex flex-col rounded-3xl border-2 p-7 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white ${isOffer ? 'border-slate-100 hover:border-orange-200' : 'border-slate-100 hover:border-violet-200'}`}>
            {/* Header */}
            <div className="flex items-center gap-4 mb-5">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm ${isOffer ? 'bg-orange-50' : 'bg-violet-50'}`}>
                    {unitIcon}
                </div>
                <div>
                    <h3 className="text-xl font-black text-slate-900 leading-tight">{plan.name}</h3>
                    <p className={`text-[10px] font-black uppercase tracking-widest mt-0.5 ${isOffer ? 'text-orange-400' : 'text-violet-400'}`}>
                        {plan.type} plan · {durationLabel}
                    </p>
                </div>
            </div>

            {/* Price */}
            <div className="mb-5">
                <div className="flex items-baseline gap-1">
                    <span className="text-sm font-black text-slate-400">PKR</span>
                    <span className="text-4xl font-black text-slate-900">{Number(plan.price).toLocaleString('en-PK')}</span>
                </div>
                <p className="text-sm font-bold text-slate-400 mt-1">
                    per {plan.duration > 1 ? `${plan.duration} ${plan.unit}` : plan.unit.slice(0, -1)}
                </p>
            </div>

            {/* Features */}
            <div className="space-y-2.5 mb-6 flex-grow">
                {features.map((f, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${isOffer ? 'bg-orange-100 text-orange-500' : 'bg-violet-100 text-violet-500'}`}>
                            <f.icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-sm font-bold text-slate-600">{f.label}</span>
                    </div>
                ))}
            </div>

            {/* Duration note */}
            <div className={`px-4 py-2.5 rounded-xl mb-5 text-sm font-bold ${isOffer ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'bg-violet-50 text-violet-600 border border-violet-100'}`}>
                {unitIcon} Featured for {durationLabel}
            </div>

            {/* CTA */}
            <button
                onClick={() => onPurchase(plan)}
                disabled={isBuying}
                className={`w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 ${isOffer
                    ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20'
                    : 'bg-violet-500 hover:bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                    }`}
            >
                {isBuying ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                ) : (
                    <><ShoppingCart className="w-4 h-4" /> Purchase — PKR {Number(plan.price).toLocaleString('en-PK')}</>
                )}
            </button>
        </div>
    );
}

function VendorOfferPlansPageInner() {
    const { user } = useAuth();
    const searchParams = useSearchParams();
    const [plans, setPlans] = useState<OfferPlan[]>([]);
    const [invoices, setInvoices] = useState<any[]>([]);
    const [promotionsData, setPromotionsData] = useState<any>({ plans: [], boosts: [] });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'offer' | 'event' | 'trajection'>('offer');
    const [purchasing, setPurchasing] = useState<string | null>(null);
    const [successPlan, setSuccessPlan] = useState<OfferPlan | null>(null);
    const [error, setError] = useState('');
    const [hasActivePromos, setHasActivePromos] = useState(false);
    const canceled = searchParams?.get('canceled') === 'true';

    useEffect(() => { fetchPlans(); }, []);

    const fetchPlans = async () => {
        setLoading(true);
        try {
            const [plansData, promosData, invoicesData] = await Promise.all([
                api.offers.getOfferPlans(),
                api.subscriptions.getActivePromotions(),
                api.subscriptions.getMyInvoices()
            ]);
            
            setPlans(plansData || []);
            setPromotionsData(promosData || { plans: [], boosts: [] });
            setInvoices(invoicesData || []);
            
            if (promosData?.plans?.length > 0 || promosData?.boosts?.length > 0) {
                setHasActivePromos(true);
            }
        } catch (err) {
            console.error('Failed to fetch offer plans data', err);
        } finally {
            setLoading(false);
        }
    };

    const handlePurchase = async (plan: OfferPlan) => {
        setError('');
        setPurchasing(plan.id);
        try {
            if (!user) { setError('Please log in to purchase a plan.'); return; }
            const result = await api.post<{ checkoutUrl: string; sessionId: string }>(
                `/subscriptions/offer-plan-checkout/${plan.id}`
            );
            if (result?.checkoutUrl) {
                // Redirect to Stripe Checkout
                window.location.href = result.checkoutUrl;
            } else {
                setError('Could not get checkout URL. Please try again.');
                setPurchasing(null);
            }
        } catch (err: any) {
            setError(err.message || 'Purchase failed. Please try again.');
            setPurchasing(null);
        }
    };



    const filteredPlans = plans.filter(p => p.type === activeTab);
    const offerCount = plans.filter(p => p.type === 'offer').length;
    const eventCount = plans.filter(p => p.type === 'event').length;

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-16">

            {/* Page Header */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-orange-600 to-rose-500 p-8 text-white shadow-xl shadow-orange-500/20">
                <div className="absolute top-0 right-0 w-56 h-56 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10 flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <Gift className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black">Offer & Event Plans</h1>
                        <p className="text-orange-100 font-bold text-sm mt-1">
                            Purchase a plan to feature your offers & events and get more visibility
                        </p>
                    </div>
                    <div className="ml-auto flex flex-col items-end gap-3">
                        <Link 
                            href="/vendor/offer-plans/invoices"
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-orange-600 rounded-xl font-black text-sm hover:bg-orange-50 transition-all hover:scale-[1.05] active:scale-[0.95] shadow-lg shadow-black/10"
                        >
                            <FileText className="w-4 h-4" />
                            Billing & History
                        </Link>
                        {hasActivePromos && (
                            <div className="flex items-center gap-2 px-3 py-1 bg-white/20 rounded-lg backdrop-blur-sm border border-white/10">
                                <Sparkles className="w-3.5 h-3.5 text-white" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-white">Active Boosts</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Success Banner */}
            {successPlan && (
                <div className="flex items-center gap-4 px-6 py-4 bg-emerald-50 border-2 border-emerald-200 rounded-2xl">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                    <div className="flex-1">
                        <p className="font-black text-emerald-800">🎉 Plan Activated!</p>
                        <p className="text-sm font-bold text-emerald-600 mt-0.5">
                            "{successPlan.name}" is now active — your {successPlan.type}s will be featured for {successPlan.duration} {successPlan.unit}.
                        </p>
                    </div>
                    <button onClick={() => setSuccessPlan(null)} className="text-emerald-400 hover:text-emerald-600 font-black text-sm">✕</button>
                </div>
            )}

            {/* Canceled Banner */}
            {canceled && (
                <div className="flex items-center gap-4 px-6 py-4 bg-amber-50 border-2 border-amber-200 rounded-2xl">
                    <XCircle className="w-6 h-6 text-amber-500 flex-shrink-0" />
                    <div className="flex-1">
                        <p className="font-black text-amber-800">Payment Cancelled</p>
                        <p className="text-sm font-bold text-amber-600 mt-0.5">
                            Your payment was not completed. No charge was made. You can try again anytime.
                        </p>
                    </div>
                </div>
            )}

            {/* Error Banner */}
            {error && (
                <div className="flex items-center gap-3 px-5 py-4 bg-red-50 border border-red-200 rounded-2xl">
                    <Info className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <p className="text-sm font-bold text-red-600 flex-1">{error}</p>
                    <button onClick={() => setError('')} className="text-red-400 hover:text-red-600">✕</button>
                </div>
            )}

            {/* Tabs */}
            <div>
                <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl w-fit mb-6">
                    {(['offer', 'event', 'trajection'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2.5 rounded-xl font-black text-sm transition-all capitalize flex items-center gap-2 ${activeTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            {tab === 'offer' ? <Tag className="w-4 h-4" /> : tab === 'event' ? <Calendar className="w-4 h-4" /> : <Wallet className="w-4 h-4" />}
                            {tab === 'trajection' ? 'My Trajection' : `${tab} Plans`}
                            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${activeTab === tab ? 'bg-orange-100 text-orange-600' : 'bg-slate-200 text-slate-500'}`}>
                                {tab === 'offer' ? offerCount : tab === 'event' ? eventCount : (promotionsData.plans?.length || 0) + (promotionsData.boosts?.length || 0)}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Plans Grid */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-10 h-10 animate-spin text-orange-400 mb-3" />
                        <p className="font-bold text-slate-400">Loading plans...</p>
                    </div>
                ) : activeTab === 'trajection' ? (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Active Boosts */}
                        <section>
                            <div className="flex items-center gap-2 mb-4">
                                <Sparkles className="w-5 h-5 text-orange-500" />
                                <h2 className="text-xl font-black text-slate-900">Active Boosts</h2>
                            </div>
                            
                            {(!hasActivePromos) ? (
                                <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-10 text-center">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Sparkles className="w-8 h-8 text-slate-300" />
                                    </div>
                                    <h3 className="text-lg font-black text-slate-900 mb-1">No active boosts</h3>
                                    <p className="text-slate-400 font-bold mb-6 max-w-sm mx-auto text-sm">
                                        You don't have any active promotions at the moment.
                                    </p>
                                    <button 
                                        onClick={() => setActiveTab('offer')}
                                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-orange-500 text-white rounded-xl font-black text-sm hover:bg-orange-600 transition-all shadow-lg shadow-orange-200"
                                    >
                                        Explore Plans
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
                                                        {Math.max(0, Math.ceil((new Date(plan.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} days
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-slate-400 font-bold flex items-center gap-2"><Calendar className="w-4 h-4" /> Valid until</span>
                                                    <span className="text-slate-900 font-black">{format(new Date(plan.endDate), 'MMM d, yyyy')}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {promotionsData.boosts?.map((boost: any) => (
                                        <div key={boost.id} className="bg-white border-2 border-slate-100 rounded-3xl p-6 relative overflow-hidden group hover:border-orange-200 transition-all shadow-sm">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="w-10 h-10 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600">
                                                    <Sparkles className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h3 className="font-black text-slate-900 line-clamp-1">{boost.target}</h3>
                                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{boost.type} Boost</p>
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between text-sm py-2 border-b border-slate-50">
                                                    <span className="text-slate-400 font-bold flex items-center gap-2"><Clock className="w-4 h-4" /> Expires in</span>
                                                    <span className="font-black text-orange-600">
                                                        {Math.max(0, Math.ceil((new Date(boost.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} days
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-slate-400 font-bold flex items-center gap-2"><Calendar className="w-4 h-4" /> Active until</span>
                                                    <span className="text-slate-900 font-black">{format(new Date(boost.endDate), 'MMM d, yyyy')}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Recent Transactions */}
                        <section>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-orange-500" />
                                    <h2 className="text-xl font-black text-slate-900">Purchase History</h2>
                                </div>
                                <Link 
                                    href="/vendor/offer-plans/invoices"
                                    className="text-orange-500 font-black text-xs hover:underline flex items-center gap-1"
                                >
                                    View All <Download className="w-3 h-3" />
                                </Link>
                            </div>

                            <div className="bg-white border-2 border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-50 border-b border-slate-200">
                                            <tr>
                                                <th className="px-6 py-4 font-black text-slate-400 uppercase tracking-widest text-[10px]">Date</th>
                                                <th className="px-6 py-4 font-black text-slate-400 uppercase tracking-widest text-[10px]">Description</th>
                                                <th className="px-6 py-4 font-black text-slate-400 uppercase tracking-widest text-[10px] text-right">Amount</th>
                                                <th className="px-6 py-4 font-black text-slate-400 uppercase tracking-widest text-[10px] text-center">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {invoices.length === 0 ? (
                                                <tr>
                                                    <td colSpan={4} className="px-6 py-10 text-center text-slate-400 font-bold">
                                                        No transactions found.
                                                    </td>
                                                </tr>
                                            ) : (
                                                invoices.slice(0, 5).map((invoice: any) => (
                                                    <tr key={invoice.id} className="hover:bg-slate-50/50 transition-colors">
                                                        <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-900">
                                                            {format(new Date(invoice.createdAt), 'MMM d, yyyy')}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="font-bold text-slate-900">
                                                                {invoice.subscription?.plan?.name || invoice.metadata?.planName || 'Feature Upgrade'}
                                                            </div>
                                                            <div className="text-[10px] text-orange-500 font-black uppercase tracking-tighter">
                                                                {invoice.subscription ? 'Plan Subscription' : 'Promotion Boost'}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-right font-black text-slate-900">
                                                            {invoice.currency} {parseFloat(invoice.amount).toLocaleString()}
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                                                                invoice.status === 'completed' 
                                                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                                                    : 'bg-amber-50 text-amber-600 border-amber-100'
                                                            }`}>
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
                    </div>
                ) : filteredPlans.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                        <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center mb-4">
                            {activeTab === 'offer' ? <Tag className="w-8 h-8 text-slate-300" /> : <Calendar className="w-8 h-8 text-slate-300" />}
                        </div>
                        <p className="font-black text-slate-900">No {activeTab} plans available yet</p>
                        <p className="text-slate-400 text-sm font-bold mt-1">Check back soon</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredPlans.map(plan => (
                            <PlanCard
                                key={plan.id}
                                plan={plan}
                                onPurchase={handlePurchase}
                                purchasing={purchasing}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function VendorOfferPlansPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-64">
                <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <VendorOfferPlansPageInner />
        </Suspense>
    );
}
