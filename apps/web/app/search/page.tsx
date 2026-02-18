"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, MapPin, Sliders, Star, X, Filter } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import BusinessCard from '../../components/BusinessCard';
import { api } from '../../lib/api';
import { Business, Category } from '../../types/api';

function SearchResults() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const query = searchParams.get('q') || '';
    const city = searchParams.get('city') || '';
    const categorySlug = searchParams.get('category') || '';

    const [results, setResults] = useState<Business[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [searchRes, cats] = await Promise.all([
                    api.businesses.search({
                        query: query,
                        city: city,
                        categorySlug: categorySlug,
                        limit: 20
                    }),
                    api.categories.getAll()
                ]);
                setResults(searchRes.data);
                setCategories(cats);
            } catch (err) {
                console.error('Search failed:', err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [query, city, categorySlug]);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />

            <main className="flex-grow max-w-7xl mx-auto px-4 w-full py-12">
                <div className="flex flex-col md:flex-row gap-8 items-start">

                    {/* Filters Sidebar (Mobile Drawer / Desktop Static) */}
                    <aside className={`fixed inset-0 z-50 md:relative md:z-0 md:inset-auto md:w-64 bg-white md:bg-transparent p-6 md:p-0 transition-transform ${showFilters ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
                        <div className="flex items-center justify-between mb-8 md:hidden">
                            <h3 className="text-xl font-bold">Filters</h3>
                            <button onClick={() => setShowFilters(false)}><X className="w-6 h-6" /></button>
                        </div>

                        <div className="space-y-10">
                            {/* Category Filter */}
                            <div>
                                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4">Categories</h4>
                                <div className="space-y-2">
                                    {categories.map(cat => (
                                        <label key={cat.id} className="flex items-center group cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="rounded-md border-slate-200 text-blue-600 focus:ring-blue-500 w-4 h-4 mr-3"
                                                checked={categorySlug === cat.slug}
                                                onChange={() => router.push(`/search?category=${cat.slug}`)}
                                            />
                                            <span className="text-sm text-slate-600 group-hover:text-blue-600 transition-colors">{cat.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Rating Filter */}
                            <div>
                                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4">Min. Rating</h4>
                                <div className="flex gap-2">
                                    {[4, 3, 2, 1].map(star => (
                                        <button key={star} className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 hover:border-blue-500 hover:text-blue-600 transition-all font-bold text-xs flex items-center justify-center gap-1">
                                            {star}<Star className="w-3 h-3 fill-current" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Results Area */}
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">
                                    {query ? `Results for "${query}"` : categorySlug ? `Service: ${categorySlug}` : 'All Businesses'}
                                </h1>
                                <p className="text-slate-500 text-sm mt-1">{results.length} properties found</p>
                            </div>
                            <button
                                onClick={() => setShowFilters(true)}
                                className="md:hidden flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold"
                            >
                                <Filter className="w-4 h-4" /> Filters
                            </button>
                        </div>

                        {loading ? (
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {Array(6).fill(0).map((_, i) => (
                                    <div key={i} className="bg-white h-72 rounded-3xl animate-pulse border border-slate-100" />
                                ))}
                            </div>
                        ) : results.length > 0 ? (
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {results.map(biz => (
                                    <BusinessCard key={biz.id} business={biz} />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-[40px] p-16 text-center border border-slate-100">
                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Search className="w-8 h-8 text-slate-300" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">No results found</h3>
                                <p className="text-slate-500 mb-8 max-w-xs mx-auto text-sm">We couldn't find anything matching your search. Try adjusting your filters or search term.</p>
                                <button onClick={() => router.push('/search')} className="text-blue-600 font-bold underline underline-offset-4">
                                    Clear all filters
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SearchResults />
        </Suspense>
    );
}
