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
        'restaurants-food': <ChefHat className="w-10 h-10 text-[#FF7A30]" />,
        'doctors': <Stethoscope className="w-10 h-10 text-blue-600" />,
        'beauty-spa': <Sparkles className="w-10 h-10 text-pink-500" />,
        'real-estate': <Compass className="w-10 h-10 text-green-600" />,
        'education': <Star className="w-10 h-10 text-indigo-600" />,
        'home-services-maintenance': <Wrench className="w-10 h-10 text-amber-600" />,
        'automobile': <Compass className="w-10 h-10 text-blue-400" />,
        'it-repair-maintenance': <Sliders className="w-10 h-10 text-slate-700" />
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white">
                <Navbar />
                <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4" />
                    <p className="text-slate-500 font-medium">Loading all categories...</p>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />

            {/* Header Section */}
            <div className="bg-white border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-4 py-16 text-center">
                    <h1 className="text-4xl md:text-6xl font-black text-[#112D4E] mb-6 tracking-tight">
                        Explore All Categories
                    </h1>
                    <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
                        Find the best trusted local businesses across various industries in Pakistan.
                    </p>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 py-20">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {categories.map((cat, idx) => (
                        <motion.div
                            key={cat.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.03 }}
                        >
                            <Link href={`/categories/${cat.slug}`} className="group block h-full">
                                <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2 transition-all duration-500 h-full flex flex-col">
                                    <div className="w-20 h-20 bg-slate-50 rounded-3xl mb-8 flex items-center justify-center group-hover:bg-blue-50 group-hover:rotate-6 transition-all duration-500">
                                        {iconMap[cat.slug] || <TrendingUp className="w-10 h-10 text-blue-600" />}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-black text-slate-900 mb-3 group-hover:text-blue-600 transition-colors uppercase tracking-tight">
                                            {cat.name}
                                        </h3>
                                        <p className="text-slate-500 text-sm mb-6 leading-relaxed font-medium">
                                            {cat.description || `Browse top-rated listings in ${cat.name.toLowerCase()} category.`}
                                        </p>
                                    </div>
                                    <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                                        <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                                            {cat.businessCount || 100}+ Listings
                                        </span>
                                        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-[#FF7A30] group-hover:text-white transition-all transform group-hover:translate-x-1">
                                            <ChevronRight className="w-5 h-5" />
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
