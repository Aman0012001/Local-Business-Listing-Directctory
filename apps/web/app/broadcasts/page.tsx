"use client";

import React from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import BroadcastRequestForm from '../../components/leads/BroadcastRequestForm';
import { Megaphone, Sparkles, CheckCircle2, Zap, Target } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BroadcastsPage() {
    return (
        <main className="min-h-screen bg-[#FDFDFF]">
            <Navbar />
            
            {/* Animated Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/30 blur-[120px] rounded-full" />
                <div className="absolute bottom-[20%] right-[-5%] w-[30%] h-[30%] bg-orange-50/50 blur-[100px] rounded-full" />
            </div>

            <div className="max-w-6xl mx-auto px-4 py-20 md:py-32">
                <div className="text-center mb-24 relative">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-3 px-5 py-2 bg-white border border-slate-100 shadow-sm text-blue-600 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-10"
                    >
                        <Zap className="w-4 h-4 fill-blue-600" /> Advanced Neural Matching
                    </motion.div>
                    
                    <motion.h1 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-6xl md:text-[110px] font-black text-slate-900 mb-10 tracking-tight leading-[0.85]"
                    >
                        Beam Your <span className="text-blue-600">Signal.</span>
                    </motion.h1>
                    
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-xl md:text-2xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed"
                    >
                        Connect with top-tier local experts instantly. Our real-time broadcast system handles the search so you don't have to.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
                    {[
                        { step: "01", title: "Define Need", desc: "Tell us exactly what service you're looking for.", icon: Target, color: "blue" },
                        { step: "02", title: "Broadcast Live", desc: "We ping verified experts in your immediate radius.", icon: Megaphone, color: "orange" },
                        { step: "03", title: "Instant Quotes", desc: "Compare responses and hire the perfect professional.", icon: CheckCircle2, color: "emerald" },
                    ].map((item, idx) => (
                        <motion.div 
                            key={idx}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                            className="group bg-white p-12 rounded-[48px] border-2 border-slate-50 shadow-xl shadow-slate-200/20 transition-all hover:shadow-2xl hover:border-blue-100 relative overflow-hidden"
                        >
                            <div className={`w-16 h-16 bg-${item.color}-500 text-white rounded-[24px] flex items-center justify-center font-black text-xl mb-10 shadow-lg shadow-${item.color}-200 relative z-10`}>
                                <item.icon className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight relative z-10">{item.title}</h3>
                            <p className="text-slate-400 font-bold leading-relaxed relative z-10">{item.desc}</p>
                            <span className="absolute top-8 right-12 text-7xl font-black text-slate-50 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                                {item.step}
                            </span>
                        </motion.div>
                    ))}
                </div>

                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="max-w-4xl mx-auto bg-white/70 backdrop-blur-3xl p-4 md:p-12 rounded-[64px] border border-white shadow-[0_64px_128px_-32px_rgba(0,0,0,0.08)] relative"
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
