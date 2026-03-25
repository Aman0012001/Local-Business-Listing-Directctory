"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SubscriptionSuccessPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const sessionId = searchParams.get('session_id');
    const canceled = searchParams.get('canceled');
    
    const [status, setStatus] = useState<'loading' | 'success' | 'canceled'>('loading');

    useEffect(() => {
        if (canceled) {
            setStatus('canceled');
            setTimeout(() => router.push('/vendor/subscription'), 3000);
        } else if (sessionId) {
            setStatus('success');
            setTimeout(() => router.push('/vendor/subscription'), 4000);
        } else {
            router.push('/vendor/subscription');
        }
    }, [sessionId, canceled, router]);

    return (
        <div className="min-h-[70vh] flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-8 text-center"
            >
                {status === 'loading' && (
                    <div className="flex flex-col items-center">
                        <Loader2 className="w-16 h-16 animate-spin text-orange-500 mb-6" />
                        <h2 className="text-2xl font-black text-slate-900 mb-2">Verifying Payment...</h2>
                        <p className="text-slate-500 font-bold">Please wait while we confirm your subscription.</p>
                    </div>
                )}
                
                {status === 'success' && (
                    <div className="flex flex-col items-center">
                        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 mb-2">Payment Successful!</h2>
                        <p className="text-slate-500 font-bold mb-8">Thank you for subscribing. Your plan is being activated.</p>
                        
                        <button 
                            onClick={() => router.push('/vendor/subscription')}
                            className="bg-slate-900 text-white font-black py-3 px-8 rounded-xl hover:bg-black transition-colors flex items-center gap-2"
                        >
                            Go to Dashboard <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {status === 'canceled' && (
                    <div className="flex flex-col items-center">
                        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-6">
                            <span className="text-3xl">⚠️</span>
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 mb-2">Payment Cancelled</h2>
                        <p className="text-slate-500 font-bold mb-8">You haven't been charged. Redirecting you back to plans...</p>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
