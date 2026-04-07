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



            <div className="max-w-6xl mx-auto px-4 py-20 md:py-20">




                <motion.div

                    viewport={{ once: true }}
                    className="max-w-4xl mx-auto bg-white/70 backdrop-blur-3xl p-4 md:p-12 rounded-[24px] border border-white shadow-[0_64px_128px_-32px_rgba(0,0,0,0.08)] relative"
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
