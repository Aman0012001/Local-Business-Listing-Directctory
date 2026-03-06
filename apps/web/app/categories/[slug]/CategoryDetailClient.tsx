"use client";

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Business, Category, City } from '@/types/api';
import BusinessCard from '@/components/BusinessCard';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { LayoutGrid, List, Filter, ChevronRight, Star, ShieldCheck, Search, MapPin } from 'lucide-react';
import Link from 'next/link';

interface CategoryDetailClientProps {
    slug: string;
}

export default function CategoryDetailClient({ slug }: CategoryDetailClientProps) {
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
                    const searchRes = await api.listings.search(searchParams);
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
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF7A30] mb-4" />
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
                    <Link href="/" className="px-10 py-4 bg-[#FF7A30] text-white rounded-2xl font-bold hover:bg-[#E86920]  shadow-orange-500/20 transition-all active:scale-95">
                        Return to Homepage
                    </Link>

                    {debugInfo && (
                        <div className="mt-12 p-6 bg-slate-50 rounded-2xl border border-slate-100 text-left max-w-2xl mx-auto">
                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Debug Information</h4>
                            <pre className="text-[10px] text-slate-500 overflow-auto max-h-40">
                                {JSON.stringify(debugInfo, null, 2)}
                            </pre>
                        </div>
                    )}
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
                <div className="max-w-7xl mx-auto px-4 py-12">
                    <div className="flex items-center gap-2 text-sm text-slate-400 mb-8">
                        <Link href="/" className="hover:text-[#FF7A30] transition-colors">Home</Link>
                        <ChevronRight className="w-4 h-4" />
                        <Link href="/categories" className="hover:text-[#FF7A30] transition-colors">Categories</Link>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-slate-900 font-bold">{category.name}</span>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="px-4 py-1.5 bg-orange-50 text-[#FF7A30] rounded-full text-[10px] font-black uppercase tracking-widest border border-orange-100">
                                    Industry Specialist
                                </div>
                                {businesses.some(b => b.isVerified) && (
                                    <div className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                                        <ShieldCheck className="w-3.5 h-3.5" /> Trusted Network
                                    </div>
                                )}
                            </div>
                            <h1 className="text-5xl md:text-6xl font-black text-[#112D4E] mb-6 tracking-tight">
                                Best {category.name} <br />
                                <span className="text-[#3F72AF]">in Pakistan</span>
                            </h1>
                            <p className="text-xl text-slate-500 max-w-2xl leading-relaxed">
                                {category.description || `Discover and connect with top-rated ${category.name.toLowerCase()} services near you.`}
                            </p>
                        </div>
                        <div className="flex flex-col items-end gap-4">
                            <div className="bg-white px-8 py-5 rounded-3xl border border-slate-100 text-slate-900 shadow-sm flex items-center gap-4">
                                <div className="text-right">
                                    <div className="text-2xl font-black">{businesses.length}</div>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Listings</div>
                                </div>
                                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                                    <LayoutGrid className="w-6 h-6" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 py-16">
                <div className="flex flex-col lg:grid lg:grid-cols-12 gap-12">
                    {/* Filters Sidebar */}
                    <aside className="lg:col-span-3 space-y-8">
                        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-10 sticky top-28">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                                    <Filter className="w-6 h-6 text-[#FF7A30]" /> Filters
                                </h3>
                                {(filters.city || filters.minRating > 0 || filters.verifiedOnly || filters.featuredOnly || filters.openNow) && (
                                    <button
                                        onClick={() => setFilters({ city: '', minRating: 0, priceRange: '', verifiedOnly: false, featuredOnly: false, openNow: false })}
                                        className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700"
                                    >
                                        Reset
                                    </button>
                                )}
                            </div>

                            {/* City Filter */}
                            <div className="space-y-5">
                                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                    <MapPin className="w-3 h-3" /> Location
                                </h4>
                                <select
                                    value={filters.city}
                                    onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all appearance-none cursor-pointer"
                                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.25rem center', backgroundSize: '1rem' }}
                                >
                                    <option value="">All Regions</option>
                                    {cities.map(city => (
                                        <option key={city.id} value={city.name}>{city.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Ratings Filter */}
                            <div className="space-y-5">
                                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                    <Star className="w-3 h-3" /> Reviews
                                </h4>
                                <div className="grid grid-cols-2 gap-3">
                                    {[0, 3, 4, 4.5].map(rating => (
                                        <button
                                            key={rating}
                                            onClick={() => setFilters(prev => ({ ...prev, minRating: rating }))}
                                            className={`px-4 py-3.5 rounded-2xl text-xs font-bold transition-all border flex items-center justify-center gap-2 ${filters.minRating === rating ? 'bg-[#112D4E] text-white border-[#112D4E] shadow-lg shadow-blue-900/20' : 'bg-slate-50 text-slate-600 border-transparent hover:bg-white hover:border-slate-200'}`}
                                        >
                                            {rating === 0 ? 'Any' : `${rating}+`}
                                            {rating !== 0 && <Star className={`w-3 h-3 ${filters.minRating === rating ? 'fill-white' : 'fill-amber-400'}`} />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Feature Toggles */}
                            <div className="space-y-5">
                                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Availability</h4>
                                <div className="space-y-4">
                                    {[
                                        { key: 'verifiedOnly', label: 'Verified Listing', icon: ShieldCheck, color: 'emerald' },
                                        { key: 'featuredOnly', label: 'Recommended', icon: Star, color: 'blue' },
                                        { key: 'openNow', label: 'Currently Open', icon: Search, color: 'orange' }
                                    ].map(item => (
                                        <label key={item.key} className="flex items-center justify-between group cursor-pointer p-1">
                                            <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors flex items-center gap-2">
                                                <item.icon className="w-4 h-4 opacity-50" />
                                                {item.label}
                                            </span>
                                            <div className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={filters[item.key as keyof typeof filters] as boolean}
                                                    onChange={() => toggleFilter(item.key as keyof typeof filters)}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-slate-100 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    setFilters({ city: '', minRating: 0, priceRange: '', verifiedOnly: false, featuredOnly: false, openNow: false });
                                    setSortBy('relevance');
                                }}
                                className="w-full py-5 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all border border-transparent hover:border-red-100"
                            >
                                Clear All Parameters
                            </button>
                        </div>
                    </aside>

                    {/* Content Area */}
                    <div className="lg:col-span-9">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                                    {loading ? (
                                        <span className="flex items-center gap-4">
                                            <div className="w-6 h-6 border-3 border-[#FF7A30] border-t-transparent rounded-full animate-spin" />
                                            Refreshing database...
                                        </span>
                                    ) : (
                                        <span className="italic">
                                            {businesses.length === 0 ? 'No listings found' : `${businesses.length} Premium Results Found`}
                                        </span>
                                    )}
                                </h2>
                                {!loading && businesses.length > 0 && (
                                    <p className="text-sm text-slate-400 mt-2 font-medium">Sorted by {sortBy.replace('-', ' ')}</p>
                                )}
                            </div>

                            <div className="flex items-center gap-4">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="bg-white border border-slate-100 rounded-2xl px-6 py-3.5 text-xs font-black uppercase tracking-widest text-slate-600 outline-none shadow-sm focus:ring-4 focus:ring-blue-500/5 transition-all cursor-pointer"
                                >
                                    <option value="relevance">Relevance</option>
                                    <option value="rating">Top Rated</option>
                                    <option value="newest">Recent</option>
                                </select>

                                <div className="flex items-center gap-2 p-1.5 bg-white rounded-2xl border border-slate-100 shadow-sm">
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
                        </div>

                        {businesses.length > 0 ? (
                            <div className={viewMode === 'grid' ? "grid sm:grid-cols-2 gap-10" : "space-y-10"}>
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
                            <div className="bg-white rounded-[60px] p-32 text-center border border-slate-100 shadow-sm">
                                <div className="w-32 h-32 bg-slate-50 rounded-[40px] flex items-center justify-center mx-auto mb-10 rotate-3">
                                    <Search className="w-16 h-16 text-slate-200" />
                                </div>
                                <h3 className="text-4xl font-black text-slate-900 mb-6 tracking-tight">Zero matches found</h3>
                                <p className="text-slate-500 mb-12 max-w-md mx-auto leading-relaxed text-xl">
                                    We couldn't find any listings that match your current filters. Adjust your criteria and try again.
                                </p>
                                <button
                                    onClick={() => {
                                        setFilters({ city: '', minRating: 0, priceRange: '', verifiedOnly: false, featuredOnly: false, openNow: false });
                                    }}
                                    className="px-12 py-5 bg-[#FF7A30] text-white rounded-[24px] font-black text-sm hover:bg-[#E86920] transition-all shadow-xl shadow-orange-500/20 active:scale-95"
                                >
                                    Reset All Parameters
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
