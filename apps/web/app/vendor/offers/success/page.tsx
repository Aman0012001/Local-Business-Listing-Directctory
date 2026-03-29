"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2, Sparkles, ArrowRight, AlertTriangle } from 'lucide-react';
import { api } from '../../../../lib/api';
import Link from 'next/link';

export default function OfferFeatureSuccessPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const sessionId = searchParams?.get('session_id');
    const offerId = searchParams?.get('offer_id');

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (!sessionId || !offerId) {
            setStatus('error');
            setErrorMessage('Missing Session ID or Offer ID.');
            return;
        }

        const verifySession = async () => {
            try {
                const res = await api.offers.verifyFeature(offerId, sessionId);
                if (res.success) {
                    setStatus('success');
                } else {
                    setStatus('error');
                    setErrorMessage('Payment verification failed. Please contact support if you were charged.');
                }
            } catch (err: any) {
                setStatus('error');
                setErrorMessage(err.message || 'Verification encountered an error.');
            }
        };

        verifySession();
    }, [sessionId, offerId]);

    return (
        <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[70vh] pb-16">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white rounded-3xl border border-slate-100 shadow-2xl overflow-hidden w-full max-w-lg relative"
            >
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

                <div className="relative p-10 flex flex-col items-center justify-center text-center">
                    {status === 'loading' && (
                        <>
                            <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center mb-6">
                                <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
                            </div>
                            <h1 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">
                                Verifying Payment
                            </h1>
                            <p className="text-slate-500 font-medium leading-relaxed">
                                Please wait while we confirm your payment block...
                            </p>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <div className="w-24 h-24 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-6 relative">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", bounce: 0.5 }}
                                >
                                    <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                                </motion.div>
                                <motion.div 
                                    className="absolute -top-1 -right-1"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                >
                                    <Sparkles className="w-6 h-6 text-amber-400" />
                                </motion.div>
                            </div>
                            <h1 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">
                                Offer Promoted!
                            </h1>
                            <p className="text-slate-500 font-medium leading-relaxed mb-8">
                                Payment successful. Your offer is now featured prominently across the platform. Watch your views and leads grow!
                            </p>
                            <Link
                                href="/vendor/offers"
                                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-slate-900 hover:bg-black text-white rounded-xl font-black transition-all active:scale-95 group shadow-lg shadow-slate-200"
                            >
                                Back to Offers
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </>
                    )}

                    {status === 'error' && (
                        <>
                            <div className="w-24 h-24 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mb-6">
                                <AlertTriangle className="w-12 h-12 text-red-500" />
                            </div>
                            <h1 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">
                                Payment Issue
                            </h1>
                            <p className="text-red-500 font-bold leading-relaxed mb-6">
                                {errorMessage}
                            </p>
                            <Link
                                href="/vendor/offers"
                                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-black transition-all active:scale-95"
                            >
                                Return to Offers
                            </Link>
                        </>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
