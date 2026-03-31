'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    CheckCircle2, 
    ArrowRight, 
    Calendar, 
    CreditCard, 
    ChevronRight,
    Loader2,
    AlertCircle,
    PartyPopper,
    ShieldCheck,
    Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '@/lib/api';

function SuccessContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [planDetails, setPlanDetails] = useState<any>(null);

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
                setPlanDetails(response);
                setStatus('success');
                // Trigger confetti
                const duration = 5 * 1000;
                const animationEnd = Date.now() + duration;
                const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

                const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

                const interval: any = setInterval(function() {
                    const timeLeft = animationEnd - Date.now();

                    if (timeLeft <= 0) {
                        return clearInterval(interval);
                    }

                    const particleCount = 50 * (timeLeft / duration);
                    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
                    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
                }, 250);
            } else {
                setStatus('error');
            }
        } catch (error) {
            console.error('Verification error:', error);
            setStatus('error');
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { 
                duration: 0.6,
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    };

    if (status === 'loading') {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-6">
                <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative"
                >
                    <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse" />
                    <Loader2 className="w-16 h-16 text-primary animate-spin relative z-10" />
                </motion.div>
                <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-8 text-xl font-medium text-muted-foreground animate-pulse"
                >
                    Verifying your premium activation...
                </motion.p>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
                <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mb-8"
                >
                    <AlertCircle className="w-10 h-10 text-destructive" />
                </motion.div>
                <h1 className="text-3xl font-bold mb-4">Something went wrong</h1>
                <p className="text-muted-foreground mb-8 max-w-md">
                    We couldn't verify your payment. If you've been charged, don't worry—it might take a few minutes to process.
                </p>
                <div className="flex gap-4">
                    <Link href="/vendor/subscription" className="px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:opacity-90 transition-all shadow-lg hover:shadow-primary/25">
                        Back to Subscriptions
                    </Link>
                    <Link href="/contact" className="px-6 py-3 border rounded-full font-medium hover:bg-muted transition-all">
                        Contact Support
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-12 px-6">
            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="text-center"
            >
                {/* Success Icon */}
                <motion.div variants={itemVariants} className="relative inline-block mb-8">
                    <div className="absolute inset-0 bg-green-500/20 blur-2xl rounded-full scale-150" />
                    <div className="relative w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-xl shadow-green-500/20">
                        <CheckCircle2 className="w-12 h-12 text-white" />
                    </div>
                    <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5, type: 'spring' }}
                        className="absolute -top-2 -right-2 w-10 h-10 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-lg"
                    >
                        <PartyPopper className="w-5 h-5 text-green-500" />
                    </motion.div>
                </motion.div>

                <motion.h1 variants={itemVariants} className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                    Subscription Activated!
                </motion.h1>
                <motion.p variants={itemVariants} className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
                    Welcome to the next level of business growth. Your premium features are now being provisioned.
                </motion.p>

                {/* Glassmorphic Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    {/* Plan Details Card */}
                    <motion.div 
                        variants={itemVariants}
                        className="relative group overflow-hidden rounded-3xl border bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl p-8 text-left transition-all hover:bg-white/80 dark:hover:bg-slate-900/80"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Zap className="w-16 h-16" />
                        </div>
                        <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-6 flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4" />
                            Plan Activation
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-2 border-b border-border/50">
                                <span className="text-muted-foreground flex items-center gap-2">
                                    <Zap className="w-4 h-4" /> Plan Name
                                </span>
                                <span className="font-bold text-lg">{planDetails?.planName || 'Premium Plan'}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-border/50">
                                <span className="text-muted-foreground flex items-center gap-2">
                                    <CreditCard className="w-4 h-4" /> Status
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-sm font-medium">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                    Active
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-muted-foreground flex items-center gap-2">
                                    <Calendar className="w-4 h-4" /> Renewal Date
                                </span>
                                <span className="font-medium">
                                    {planDetails?.endDate ? new Date(planDetails.endDate).toLocaleDateString('en-US', {
                                        month: 'long',
                                        day: 'numeric',
                                        year: 'numeric'
                                    }) : 'N/A'}
                                </span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Quick Access Card */}
                    <motion.div 
                        variants={itemVariants}
                        className="bg-primary rounded-3xl p-8 text-left text-primary-foreground relative overflow-hidden shadow-2xl shadow-primary/20"
                    >
                        <div className="absolute bottom-0 right-0 -mb-8 -mr-8 opacity-10">
                            <ArrowRight className="w-48 h-48 -rotate-45" />
                        </div>
                        <h3 className="text-lg font-bold mb-2">What's Next?</h3>
                        <p className="text-primary-foreground/80 mb-8 leading-relaxed">
                            Your dashboard is now upgraded with advanced analytics, better visibility, and lead generation tools.
                        </p>
                        <div className="space-y-3">
                            <Link 
                                href="/vendor/dashboard" 
                                className="flex items-center justify-between w-full p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all group"
                            >
                                <span className="font-semibold">Go to Dashboard</span>
                                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link 
                                href="/vendor/listings" 
                                className="flex items-center justify-between w-full p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all group"
                            >
                                <span className="font-semibold">Manage My Listings</span>
                                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </motion.div>
                </div>

                <motion.div variants={itemVariants} className="pt-8 border-t">
                    <p className="text-muted-foreground mb-6">
                        Need help with your subscription? Check our <Link href="/faq" className="text-primary hover:underline">FAQ</Link> or <Link href="/contact" className="text-primary hover:underline">Support</Link>.
                    </p>
                </motion.div>
            </motion.div>
        </div>
    );
}

export default function SubscriptionSuccessPage() {
    return (
        <main className="min-h-[70vh] flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
            <Suspense fallback={<div className="animate-pulse text-muted-foreground">Loading...</div>}>
                <SuccessContent />
            </Suspense>
        </main>
    );
}
