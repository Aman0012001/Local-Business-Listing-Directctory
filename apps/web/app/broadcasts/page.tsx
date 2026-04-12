"use client";

import React from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import BroadcastRequestForm from '../../components/leads/BroadcastRequestForm';
import { Megaphone, Sparkles, CheckCircle2, Zap, Target, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function BroadcastsPage() {
    return (
        <main className="min-h-screen bg-[#FDFDFF]">
            <Navbar />

            {/* Premium Header Container */}
            <div className="bg-white border-b border-slate-50 pt-24 pb-12 lg:pt-32 lg:pb-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Breadcrumbs */}
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-300 mb-10">
                        <Link href="/" className="hover:text-blue-600">Home</Link>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-slate-900">Broadcast Request</span>
                    </div>

                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
                        <div className="max-w-2xl">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100 flex items-center gap-2">
                                    <Target className="w-3 h-3" /> Instant Matching
                                </div>
                                <div className="px-4 py-1.5 bg-orange-50 text-orange-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-orange-100 flex items-center gap-2">
                                    <Zap className="w-3 h-3" /> Real-time Signals
                                </div>
                            </div>
                            <h1 className="text-5xl lg:text-7xl font-black text-slate-900 mb-8 tracking-tighter leading-[0.9]">
                                Broadcast Your <br />
                                <span className="text-blue-600">Requirements.</span>
                            </h1>
                            <p className="text-xl text-slate-400 font-bold leading-relaxed max-w-xl">
                                Reach out to hundreds of verified local experts instantly. Describe your needs and receive tailored responses in minutes.
                            </p>
                        </div>

                        <div className="hidden lg:flex items-center gap-8 bg-[#F8FAFC] p-8 rounded-[20px] border border-slate-100/50">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
                                <Megaphone className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="text-4xl font-black text-slate-900 leading-none mb-1">2k+</div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Verified Vendors</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-20 -mt-20 lg:-mt-24 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="max-w-4xl mx-auto bg-white/70 backdrop-blur-3xl p-4 md:p-12 rounded-[32px] border border-white shadow-[0_64px_128px_-32px_rgba(0,0,0,0.08)] relative"
                >
                    <div className="absolute -top-12 -left-12 w-32 h-32 bg-blue-600 rounded-full blur-[70px] opacity-10" />
                    <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-orange-600 rounded-full blur-[70px] opacity-10" />

                    <div className="relative">
                        <BroadcastRequestForm />
                    </div>
                </motion.div>
            </div>

            <Footer />
        </main>
    );
}
