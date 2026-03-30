"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle2, ArrowRight, Gift, Tag, Calendar, Loader2, XCircle } from 'lucide-react';
import Link from 'next/link';
import { api } from '../../../../lib/api';

function SuccessContent() {
    const params = useSearchParams();
    const router = useRouter();
    const planName = params.get('plan') || 'Your Plan';
    const duration = params.get('duration') || '1';
    const unit = params.get('unit') || 'hour';
    const sessionId = params.get('session_id');

    const [countdown, setCountdown] = useState(8);
    const [verifying, setVerifying] = useState(!!sessionId);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!sessionId) return;

        const verifyPayment = async () => {
            try {
                const response: any = await api.post('/subscriptions/verify', { sessionId });
                if (response.success) {
                    console.log('Payment verified successfully');
                } else {
                    setError('Payment verification failed. Please contact support if your plan is not active.');
                }
            } catch (err) {
                console.error('Error verifying payment:', err);
                setError('Could not verify payment automatically. Our system will sync shortly.');
            } finally {
                setVerifying(false);
            }
        };

        verifyPayment();
    }, [sessionId]);

    useEffect(() => {
        if (verifying) return; // Wait during verification
        
        const t = setInterval(() => {
            setCountdown(c => (c > 0 ? c - 1 : 0));
        }, 1000);
        return () => clearInterval(t);
    }, [verifying]);

    useEffect(() => {
        if (countdown <= 0) {
            router.push('/vendor/offers');
        }
    }, [countdown, router]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center p-6">
            <div className="w-full max-w-lg text-center">
                {/* Success icon */}
                <div className="relative inline-flex mb-8">
                    <div className="w-24 h-24 bg-orange-500 rounded-full flex items-center justify-center shadow-2xl shadow-orange-500/30 animate-bounce">
                        <CheckCircle2 className="w-12 h-12 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-8 h-8 bg-emerald-400 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white text-sm font-black">✓</span>
                    </div>
                </div>

                {/* Heading */}
                <h1 className="text-4xl font-black text-slate-900 mb-3">
                    {verifying ? 'Verifying Payment...' : error ? 'Activation Pending' : 'Payment Successful! 🎉'}
                </h1>
                <p className="text-slate-500 font-bold mb-8 text-lg">
                    {verifying 
                        ? 'We are confirming your transaction with Stripe...' 
                        : error 
                            ? error 
                            : <>Your offer & event boost is now <span className="text-orange-500">active</span></>
                    }
                </p>

                {verifying && (
                    <div className="flex justify-center mb-12">
                        <div className="relative">
                            <div className="w-20 h-20 border-4 border-orange-100 rounded-full" />
                            <div className="absolute top-0 left-0 w-20 h-20 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                            <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-orange-500 animate-pulse" />
                        </div>
                    </div>
                )}

                {/* Plan card */}
                <div className="bg-white border-2 border-orange-200 rounded-3xl p-6 mb-8 shadow-xl shadow-orange-500/10">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
                            <Gift className="w-6 h-6 text-orange-500" />
                        </div>
                        <div className="text-left">
                            <p className="text-xs font-black text-orange-400 uppercase tracking-widest">Plan Activated</p>
                            <p className="text-xl font-black text-slate-900">{planName}</p>
                        </div>
                    </div>
                    <div className="flex items-center justify-center gap-6 pt-4 border-t border-slate-100">
                        <div className="text-center">
                            <p className="text-3xl font-black text-orange-500">{duration}</p>
                            <p className="text-xs font-bold text-slate-400 capitalize">{unit}s boost</p>
                        </div>
                        <div className="w-px h-10 bg-slate-100" />
                        <div className="text-center">
                            <p className="text-sm font-black text-emerald-500">✓ Active Now</p>
                            <p className="text-xs font-bold text-slate-400">Featuring your offers</p>
                        </div>
                    </div>
                </div>

                {/* What happens next */}
                <div className="bg-slate-50 rounded-2xl p-5 mb-8 text-left space-y-3">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">What happens now</p>
                    {[
                        { icon: Tag, text: 'Your offers will appear with a "Featured" badge on listing cards', color: 'text-orange-500' },
                        { icon: Calendar, text: 'Your events get boosted in category & search results', color: 'text-violet-500' },
                        { icon: CheckCircle2, text: 'A receipt has been recorded in your transaction history', color: 'text-emerald-500' },
                    ].map((item, i) => (
                        <div key={i} className="flex items-start gap-3">
                            <item.icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${item.color}`} />
                            <p className="text-sm font-bold text-slate-600">{item.text}</p>
                        </div>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <Link href="/vendor/offers"
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-orange-500/25 transition-all active:scale-95">
                        Go to My Offers <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link href="/vendor/offer-plans"
                        className="flex items-center justify-center px-5 py-4 bg-white border-2 border-slate-200 hover:border-orange-300 text-slate-700 rounded-2xl font-black text-sm transition-all">
                        View Plans
                    </Link>
                </div>

                {/* Auto redirect */}
                <p className="mt-6 text-xs text-slate-400 font-bold">
                    Redirecting to My Offers in <span className="text-orange-500">{countdown}s</span>...
                </p>
            </div>
        </div>
    );
}

export default function OfferPlanSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <SuccessContent />
        </Suspense>
    );
}
