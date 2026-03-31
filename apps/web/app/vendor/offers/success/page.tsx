'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    CheckCircle2, 
    ArrowRight, 
    Calendar, 
    Tag, 
    ChevronRight,
    Loader2,
    AlertCircle,
    PartyPopper,
    Zap,
    Rocket
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '@/lib/api';

function OfferSuccessContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [details, setDetails] = useState<any>(null);

    useEffect(() => {
        if (sessionId) {
            verifyPayment();
        } else {
            setStatus('error');
        }
    }, [sessionId]);

    const verifyPayment = async () => {
        try {
            const response = await api.subscriptions.verify(sessionId!);
            if (response.success) {
                setDetails(response);
                setStatus('success');
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#3b82f6', '#22c55e', '#f59e0b']
                });
            } else {
                setStatus('error');
            }
        } catch (error) {
            console.error('Verification error:', error);
            setStatus('error');
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { 
            opacity: 1, 
            scale: 1,
            transition: { duration: 0.5, staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0 }
    };

    if (status === 'loading') {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-6">
                <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                <p className="text-muted-foreground font-medium">Activating your feature boost...</p>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
                <AlertCircle className="w-16 h-16 text-destructive mb-6" />
                <h1 className="text-2xl font-bold mb-2">Activation Pending</h1>
                <p className="text-muted-foreground mb-8 max-w-sm">
                    We're still processing your payment. It should appear in your active promotions shortly.
                </p>
                <Link href="/vendor/dashboard" className="px-6 py-3 bg-primary text-white rounded-full font-semibold">
                    Go to Dashboard
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto py-12 px-6">
            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="text-center"
            >
                <motion.div variants={itemVariants} className="relative inline-block mb-8">
                    <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center shadow-2xl shadow-primary/30">
                        <Rocket className="w-12 h-12 text-white animate-bounce" />
                    </div>
                </motion.div>

                <motion.h1 variants={itemVariants} className="text-4xl font-extrabold mb-4">
                    Feature Boost Active!
                </motion.h1>
                <motion.p variants={itemVariants} className="text-lg text-muted-foreground mb-12">
                    Your offer is now being prioritized in search results and featured sections.
                </motion.p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    <motion.div 
                        variants={itemVariants}
                        className="p-8 rounded-3xl border bg-white/40 dark:bg-slate-900/40 backdrop-blur-md text-left"
                    >
                        <h3 className="text-sm font-bold text-primary uppercase mb-6 flex items-center gap-2">
                            <Tag className="w-4 h-4" /> Boost Details
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center pb-2 border-b">
                                <span className="text-muted-foreground">Promotion</span>
                                <span className="font-bold">{details?.planName || 'Offer Boost'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground text-sm flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5" /> Valid Until
                                </span>
                                <span className="font-medium text-sm">
                                    {details?.endDate ? new Date(details.endDate).toLocaleDateString() : 'N/A'}
                                </span>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div 
                        variants={itemVariants}
                        className="p-8 rounded-3xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-left relative overflow-hidden"
                    >
                        <h3 className="text-lg font-bold mb-4">What happens now?</h3>
                        <ul className="space-y-3 text-sm opacity-80 mb-6">
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                                Your offer is tagged as "Featured"
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                                Boosted placement in categories
                            </li>
                        </ul>
                        <Link href="/vendor/offers" className="inline-flex items-center gap-2 font-bold hover:gap-3 transition-all duration-300">
                            Manage Offers <ChevronRight className="w-4 h-4" />
                        </Link>
                    </motion.div>
                </div>

                <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/vendor/dashboard" className="px-8 py-4 bg-primary text-white rounded-2xl font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                        Back to Dashboard
                    </Link>
                    <Link href="/vendor/listings" className="px-8 py-4 border rounded-2xl font-bold hover:bg-muted transition-all">
                        View Listings
                    </Link>
                </motion.div>
            </motion.div>
        </div>
    );
}

export default function OfferFeatureSuccessPage() {
    return (
        <main className="min-h-[70vh] flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
            <Suspense fallback={<div>Loading...</div>}>
                <OfferSuccessContent />
            </Suspense>
        </main>
    );
}
