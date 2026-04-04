"use client";

import React, { useState, useEffect } from 'react';
import { Search, ChevronRight, TrendingUp, Compass, Sliders, Star, ChefHat, Stethoscope, Sparkles, Wrench } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { api } from '../../lib/api';
import { Category } from '../../types/api';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const data = await api.categories.getAll();
                setCategories(data || []);
            } catch (err) {
                console.error('Failed to load categories:', err);
            } finally {
                setLoading(false);
            }
        };
        loadCategories();
    }, []);

    const iconMap: Record<string, React.ReactNode> = {
        'restaurants-food': <ChefHat className="w-10 h-10 text-slate-900" />,
        'doctors': <Stethoscope className="w-10 h-10 text-slate-900" />,
        'beauty-spa': <Sparkles className="w-10 h-10 text-slate-900" />,
        'real-estate': <Compass className="w-10 h-10 text-slate-900" />,
        'education': <Star className="w-10 h-10 text-slate-900" />,
        'home-services-maintenance': <Wrench className="w-10 h-10 text-slate-900" />,
        'automobile': <Compass className="w-10 h-10 text-slate-900" />,
        'it-repair-maintenance': <Sliders className="w-10 h-10 text-slate-900" />
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white">
                <Navbar />
                <div className="max-w-7xl mx-auto px-4 py-32 flex flex-col items-center justify-center">
                    <div className="w-12 h-12 border-t-2 border-blue-600 rounded-full animate-spin mb-6" />
                    <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">Synchronizing Collections</p>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            {/* Premium Header Section */}
            <div className="pt-24 pb-16  border-b border-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Breadcrumbs */}
                    <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 mb-10">
                        <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
                        <ChevronRight className="w-3 h-3 text-slate-200" />
                        <span className="text-slate-900">Categories</span>
                    </div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-3xl"
                    >
                        <h1 className="text-5xl lg:text-7xl font-black text-slate-900  tracking-tighter leading-[0.9]">
                            Discover <span className="text-blue-600">Extraordinary</span> Local Services.
                        </h1>
                        {/* <p className="text-xl text-slate-400 font-bold leading-relaxed max-w-xl">
                            A curated index of Pakistan's finest businesses, categorized for effortless discovery and reliable results.
                        </p> */}
                    </motion.div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-10 gap-y-16">
                    {categories.map((cat, idx) => (
                        <motion.div
                            key={cat.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05, ease: "circOut", duration: 0.8 }}
                            className="h-full"
                        >
                            <Link href={`/categories/${cat.slug}`} className="group block h-full">
                                <div className="relative border border-black rounded-[16px] p-[10px] h-full transition-all duration-500 hover:shadow-xl hover:shadow-slate-200/50">
                                    {/* Icon Box - Minimalist & Large */}
                                    <div className="w-full aspect-[4/3] bg-[#F8FAFC] rounded-[12px] mb-6 flex items-center justify-center group-hover:bg-[#F1F5F9] transition-all duration-500 overflow-hidden border border-slate-100/50 group-hover:scale-[1.01]">
                                        <div className="transform group-hover:scale-110 group-hover:-rotate-2 transition-all duration-700 opacity-80 group-hover:opacity-100">
                                            {iconMap[cat.slug] || <TrendingUp className="w-12 h-12 text-slate-900" />}
                                        </div>
                                    </div>

                                    {/* Content Area */}
                                    <div className="px-2 pb-2">
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors tracking-tight">
                                                {cat.name}
                                            </h3>
                                            <div className="p-1.5 rounded-full opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-500 bg-blue-50 text-blue-600">
                                                <ChevronRight className="w-4 h-4" />
                                            </div>
                                        </div>

                                        <p className="text-slate-400 text-xs font-bold leading-relaxed mb-6 line-clamp-2">
                                            {cat.description || `Superior listings specialized in ${cat.name.toLowerCase()}.`}
                                        </p>

                                        <div className="flex items-center gap-3 mt-auto">
                                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-300">
                                                {cat.businessCount || 100}+ Curated Listings
                                            </span>
                                            <div className="flex-1 h-px bg-slate-50" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </main>

            <Footer />
        </div>
    );
}
