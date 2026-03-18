'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '../../../lib/api';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import { Calendar, Tag, MapPin, Loader2, ArrowLeft, Clock, ExternalLink, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function OfferEventDetailClient() {
    const { id } = useParams() as { id: string };
    const router = useRouter();
    const [offer, setOffer] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const data = await api.offers.getById(id);
                setOffer(data);
            } catch (err: any) {
                console.error(err);
                setError('Failed to load details. The offer may have expired or been removed.');
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
                </div>
            </div>
        );
    }

    if (error || !offer) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col">
                <Navbar />
                <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
                    <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
                        <Tag className="w-12 h-12" />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 mb-4">Offer Not Found</h1>
                    <p className="text-slate-500 max-w-md mx-auto mb-8">{error}</p>
                    <button onClick={() => router.back()} className="px-8 py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-orange-500 transition-colors">
                        Go Back
                    </button>
                </div>
                <Footer />
            </div>
        );
    }

    const isEvent = offer.type === 'event';
    const primaryColor = isEvent ? 'blue' : 'orange';
    const gradientClass = isEvent ? 'from-blue-500 to-indigo-500' : 'from-orange-500 to-rose-500';
    const badgeBgClass = isEvent ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600';
    const badgeBorderClass = isEvent ? 'border-blue-100' : 'border-orange-100';

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            {/* Hero Section */}
            <div className="relative pt-32 pb-20 bg-slate-50 border-b border-slate-100 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    {offer.imageUrl ? (
                        <>
                            <div className="absolute inset-0 bg-slate-900/60 z-10 mix-blend-multiply" />
                            <img src={offer.imageUrl} alt={offer.title} className="w-full h-full object-cover blur-sm opacity-50 scale-105" />
                        </>
                    ) : (
                        <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-10`} />
                    )}
                </div>

                <div className="max-w-4xl mx-auto px-4 relative z-10">
                    <button 
                        onClick={() => router.back()}
                        className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors bg-white/80 backdrop-blur-md px-4 py-2 rounded-xl shadow-sm border border-slate-200"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to browsing
                    </button>

                    <div className="flex items-center gap-3 mb-6">
                        <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest border shadow-sm ${badgeBgClass} ${badgeBorderClass}`}>
                            {isEvent ? <Calendar className="w-4 h-4" /> : <Tag className="w-4 h-4" />}
                            {offer.type}
                        </span>
                        {offer.offerBadge && (
                            <span className={`px-4 py-1.5 bg-gradient-to-r ${gradientClass} text-white text-xs font-black rounded-xl shadow-sm uppercase tracking-wider`}>
                                {offer.offerBadge}
                            </span>
                        )}
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight mb-6">
                        {offer.title}
                    </h1>

                    {offer.business && (
                        <div className="flex items-center gap-4 bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200 inline-flex shadow-sm">
                            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-xl font-bold text-slate-400">
                                {offer.business.title.charAt(0)}
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Presented By</p>
                                <Link href={`/business/${offer.business.slug}`} className="text-lg font-black text-slate-900 hover:text-orange-500 transition-colors flex items-center gap-1 group">
                                    {offer.business.title}
                                    <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-orange-500 transition-colors" />
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-4xl mx-auto px-4 py-20">
                <div className="grid md:grid-cols-3 gap-12">
                    
                    <div className="md:col-span-2 space-y-12">
                        {/* Main Image */}
                        {offer.imageUrl && (
                            <div className="rounded-3xl overflow-hidden border border-slate-100 shadow-2xl shadow-slate-200/50">
                                <img src={offer.imageUrl} alt={offer.title} className="w-full h-auto" />
                            </div>
                        )}

                        {/* Description */}
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${badgeBgClass}`}>
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                Details
                            </h2>
                            <div className="prose prose-slate prose-lg max-w-none text-slate-600">
                                {offer.description ? (
                                    <p className="whitespace-pre-wrap leading-relaxed">
                                        {offer.description}
                                    </p>
                                ) : (
                                    <p className="italic text-slate-400">No additional details provided.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar / Actions */}
                    <div className="md:col-span-1">
                        <div className="sticky top-32 bg-slate-50 rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/50">
                            
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Key Information</h3>
                            
                            <div className="space-y-6">
                                {offer.startDate && (
                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center shrink-0">
                                            <Calendar className={`w-5 h-5 text-${primaryColor}-500`} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Starts</p>
                                            <p className="text-slate-900 font-bold">{new Date(offer.startDate).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                        </div>
                                    </div>
                                )}

                                {offer.expiryDate && (
                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center shrink-0">
                                            <Clock className={`w-5 h-5 text-rose-500`} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{isEvent ? 'Ends' : 'Expires'}</p>
                                            <p className="text-slate-900 font-bold">{new Date(offer.expiryDate).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                        </div>
                                    </div>
                                )}

                                {offer.business?.city && (
                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center shrink-0">
                                            <MapPin className="w-5 h-5 text-emerald-500" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Location</p>
                                            <p className="text-slate-900 font-bold">{offer.business.city}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <hr className="my-8 border-slate-200" />

                            {offer.business && (
                                <Link 
                                    href={`/business/${offer.business.slug}`}
                                    className={`w-full py-4 bg-gradient-to-r ${gradientClass} text-white rounded-2xl font-black shadow-xl shadow-${primaryColor}-500/20 hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2`}
                                >
                                    Contact Business
                                </Link>
                            )}
                        </div>
                    </div>

                </div>
            </div>

            <Footer />
        </div>
    );
}
