"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Business, Category, City } from '@/types/api';
import BusinessCard from '@/components/BusinessCard';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { LayoutGrid, List, Filter, ChevronRight, Star, ShieldCheck, Search, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function CategoryDetailPage() {
    const { slug } = useParams();
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [category, setCategory] = useState<Category | null>(null);
    const [cities, setCities] = useState<City[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [sortBy, setSortBy] = useState<string>('relevance');

    // Advanced Filters
    const [error, setError] = useState<string | null>(null);
    const [debugInfo, setDebugInfo] = useState<any>(null);
    const [filters, setFilters] = useState({
        city: '',
        minRating: 0,
        priceRange: '',
        verifiedOnly: false,
        featuredOnly: false,
        openNow: false
    });

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const citiesData = await api.cities.getAll();
                setCities(citiesData || []);
            } catch (err) {
                console.error('Failed to load cities:', err);
                setCities([]);
            }
        };
        loadInitialData();
    }, []);

    useEffect(() => {
        const loadCategoryData = async () => {
            if (!slug) return;
            const normalizedSlug = (slug as string).toLowerCase();
            setLoading(true);
            setError(null);

            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
                console.log(`[CategoryDetail] Full Fetch URL: ${apiUrl}/categories/slug/${normalizedSlug}`);
                const catData = await api.categories.getBySlug(normalizedSlug);
                console.log(`[CategoryDetail] Category found:`, catData.name);
                setCategory(catData);

                // Separate business fetch so it doesn't break category view if search fails
                try {
                    const searchParams = {
                        categoryId: catData.id,
                        limit: 50,
                        sortBy: sortBy === 'relevance' ? undefined : sortBy,
                        city: filters.city,
                        minRating: filters.minRating || undefined,
                        priceRange: filters.priceRange,
                        verifiedOnly: filters.verifiedOnly,
                        featuredOnly: filters.featuredOnly,
                        openNow: filters.openNow
                    };
                    console.log(`[CategoryDetail] Fetching businesses...`);
                    const searchRes = await api.businesses.search(searchParams);
                    setBusinesses(searchRes.data);
                } catch (searchErr: any) {
                    console.error('[CategoryDetail] Search error:', searchErr);
                    // Don't nullify category here
                }
            } catch (err: any) {
                console.error('[CategoryDetail] Category fetch error:', err);
                setError(err.message || 'Failed to fetch category');
                setDebugInfo({
                    message: err.message,
                    stack: err.stack,
                    slug: normalizedSlug
                });
                setCategory(null);
            } finally {
                setLoading(false);
            }
        };
        loadCategoryData();
    }, [slug, filters, sortBy]);

    const toggleFilter = (key: keyof typeof filters) => {
        if (typeof filters[key] === 'boolean') {
            setFilters(prev => ({ ...prev, [key]: !prev[key] }));
        }
    };

    if (loading && !category) {
        return (
            <div className="min-h-screen bg-white">
                <Navbar />
                <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4" />
                    <p className="text-slate-500 font-medium">Loading category...</p>
                </div>
                <Footer />
            </div>
        );
    }

    if (!category && !loading) {
        return (
            <div className="min-h-screen bg-white">
                <Navbar />
                <div className="max-w-7xl mx-auto px-4 py-32 text-center">
                    <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8">
                        <Search className="w-12 h-12 text-red-500" />
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 mb-4">Category Not Found</h1>
                    <p className="text-slate-500 mb-10 max-w-md mx-auto font-medium leading-relaxed">
                        The category <code className="bg-slate-100 px-2 py-1 rounded text-[#FF7A30]">{slug}</code> doesn't exist or has been removed.
                    </p>
                    <Link href="/" className="px-10 py-4 bg-[#FF7A30] text-white rounded-2xl font-bold hover:bg-[#E86920] shadow-xl shadow-orange-500/20 transition-all active:scale-95">
                        Return to Homepage
                    </Link>
                </div>
                <Footer />
            </div>
        );
    }

    if (!category) return null;

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />

            {/* Header / Breadcrumbs */}
            <div className="bg-white border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
                        <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
                        <ChevronRight className="w-4 h-4" />
                        <Link href="/categories" className="hover:text-blue-600 transition-colors">Categories</Link>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-slate-900 font-bold">{category.name}</span>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black text-[#112D4E] mb-4">
                                Best {category.name} in Pakistan
                            </h1>
                            <p className="text-lg text-slate-500 max-w-2xl">
                                {category.description || `Discover and connect with top-rated ${category.name.toLowerCase()} services near you.`}
                            </p>
                        </div>
                        <div className="flex flex-col items-end gap-3">
                            <div className="bg-blue-50 px-6 py-3 rounded-2xl border border-blue-100 text-blue-600 font-bold">
                                {businesses.length} Verified Listings
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 py-12">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Filters Sidebar */}
                    <aside className="w-full md:w-80 space-y-6">
                        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-8">
                            <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                                <Filter className="w-6 h-6 text-blue-600" /> Filter Results
                            </h3>

                            {/* City Filter */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Location</h4>
                                <select
                                    value={filters.city}
                                    onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20"
                                >
                                    <option value="">All Cities</option>
                                    {cities.map(city => (
                                        <option key={city.id} value={city.name}>{city.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Ratings Filter */}
                            <div className="space-y-4 pt-6 border-t border-slate-50">
                                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Minimum Rating</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    {[0, 3, 4, 4.5].map(rating => (
                                        <button
                                            key={rating}
                                            onClick={() => setFilters(prev => ({ ...prev, minRating: rating }))}
                                            className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 ${filters.minRating === rating ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-600 border-transparent hover:bg-blue-50 hover:border-blue-100'}`}
                                        >
                                            {rating === 0 ? 'Any' : `${rating}+`}
                                            {rating !== 0 && <Star className={`w-3 h-3 ${filters.minRating === rating ? 'fill-white' : 'fill-amber-400'}`} />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Price Filter */}
                            {/* <div className="space-y-4 pt-6 border-t border-slate-50">
                                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Price Range</h4>
                                <div className="grid grid-cols-4 gap-2">
                                    {['$', '$$', '$$$', '$$$$'].map(price => (
                                        <button
                                            key={price}
                                            onClick={() => setFilters(prev => ({ ...prev, priceRange: prev.priceRange === price ? '' : price }))}
                                            className={`py-2.5 rounded-xl text-xs font-bold transition-all border ${filters.priceRange === price ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-600 border-transparent hover:bg-blue-50 hover:border-blue-100'}`}
                                        >
                                            {price}
                                        </button>
                                    ))}
                                </div>
                            </div> */}

                            {/* Feature Toggles */}
                            <div className="space-y-4 pt-6 border-t border-slate-50">
                                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Quick Filters</h4>
                                <div className="space-y-3">
                                    {[
                                        { key: 'verifiedOnly', label: 'Verified Only', icon: ShieldCheck },
                                        { key: 'featuredOnly', label: 'Featured Only', icon: Star },
                                        { key: 'openNow', label: 'Open Now', icon: Search }
                                    ].map(item => (
                                        <label key={item.key} className="flex items-center justify-between group cursor-pointer">
                                            <span className="text-sm font-bold text-slate-600 group-hover:text-blue-600 transition-colors">{item.label}</span>
                                            <input
                                                type="checkbox"
                                                checked={filters[item.key as keyof typeof filters] as boolean}
                                                onChange={() => toggleFilter(item.key as keyof typeof filters)}
                                                className="w-5 h-5 rounded-lg border-slate-200 text-blue-600 focus:ring-blue-500/20"
                                            />
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Sort By */}
                            <div className="space-y-4 pt-6 border-t border-slate-50">
                                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Sort By</h4>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20"
                                >
                                    <option value="relevance">Most Relevant</option>
                                    <option value="rating">Highest Rated</option>
                                    <option value="newest">Recently Added</option>
                                </select>
                            </div>

                            {/* Clear All */}
                            <button
                                onClick={() => {
                                    setFilters({
                                        city: '',
                                        minRating: 0,
                                        priceRange: '',
                                        verifiedOnly: false,
                                        featuredOnly: false,
                                        openNow: false
                                    });
                                    setSortBy('relevance');
                                }}
                                className="w-full py-4 text-blue-600 font-bold text-sm hover:bg-blue-50 rounded-2xl transition-all border border-transparent hover:border-blue-100"
                            >
                                Clear All Filters
                            </button>
                        </div>
                    </aside>

                    {/* Content Area */}
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-black text-slate-900 italic">
                                {loading ? (
                                    <span className="flex items-center gap-3">
                                        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                        Updating results...
                                    </span>
                                ) : (
                                    `Found ${businesses.length} ${category?.name || ''} businesses`
                                )}
                            </h2>
                            <div className="flex items-center gap-2 p-1 bg-white rounded-2xl border border-slate-100 shadow-sm">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                                >
                                    <LayoutGrid className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                                >
                                    <List className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {businesses.length > 0 ? (
                            <div className={viewMode === 'grid' ? "grid sm:grid-cols-2 gap-8" : "space-y-8"}>
                                {businesses.map((biz) => (
                                    <BusinessCard
                                        key={biz.id}
                                        business={biz}
                                        layout={viewMode}
                                        variant={viewMode === 'list' ? 'white' : 'blue'}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-[48px] p-24 text-center border border-slate-100 shadow-sm">
                                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8">
                                    <Search className="w-10 h-10 text-slate-200" />
                                </div>
                                <h3 className="text-3xl font-black text-slate-900 mb-4">No matching results</h3>
                                <p className="text-slate-500 mb-10 max-w-sm mx-auto leading-relaxed text-lg">
                                    We couldn't find any listings that match your current filters. Try relaxing your criteria.
                                </p>
                                <button
                                    onClick={() => {
                                        setFilters({
                                            city: '',
                                            minRating: 0,
                                            priceRange: '',
                                            verifiedOnly: false,
                                            featuredOnly: false,
                                            openNow: false
                                        });
                                    }}
                                    className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20"
                                >
                                    Reset Filters
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
