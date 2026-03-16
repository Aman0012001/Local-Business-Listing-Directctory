"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, MapPin, Sliders, Star, X, Filter, Navigation, CheckCircle2, Clock } from 'lucide-react';
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
    const minRating = searchParams.get('minRating') || '';
    const radius = searchParams.get('radius') || '';
    const latitude = searchParams.get('latitude') || '';
    const longitude = searchParams.get('longitude') || '';
    const openNow = searchParams.get('openNow') === 'true';
    const verifiedOnly = searchParams.get('verifiedOnly') === 'true';

    const [results, setResults] = useState<Business[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [geoLoading, setGeoLoading] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [searchRes, cats] = await Promise.all([
                    api.listings.search({
                        query: query,
                        city: city,
                        categorySlug: categorySlug,
                        minRating: minRating,
                        radius: radius ? Number(radius) : undefined,
                        latitude: latitude ? Number(latitude) : undefined,
                        longitude: longitude ? Number(longitude) : undefined,
                        openNow: openNow || undefined,
                        verifiedOnly: verifiedOnly || undefined,
                        limit: 20
                    }),
                    api.categories.getAll()
                ]);
                setResults(searchRes.data);
                setCategories(cats);

                // Log demand if there's a query or category
                if (query || categorySlug) {
                    api.demand.logSearch({
                        keyword: query || categorySlug,
                        city: city || undefined,
                        latitude: latitude ? Number(latitude) : undefined,
                        longitude: longitude ? Number(longitude) : undefined,
                    }).catch(err => console.error('Demand logging failed:', err));
                }
            } catch (err) {
                console.error('Search failed:', err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [query, city, categorySlug, minRating, radius, latitude, longitude, openNow, verifiedOnly]);

    const handleNearMe = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }

        setGeoLoading(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const params = new URLSearchParams(searchParams.toString());
                params.set('latitude', String(latitude));
                params.set('longitude', String(longitude));
                if (!params.has('radius')) params.set('radius', '10');
                router.push(`/search?${params.toString()}`);
                setGeoLoading(false);
            },
            (error) => {
                console.error('Geolocation error:', error);
                alert('Could not get your location. Please check your browser permissions.');
                setGeoLoading(false);
            }
        );
    };

    const updateFilter = (key: string, value: string | boolean | null) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value === null || value === false || value === '') {
            params.delete(key);
        } else {
            params.set(key, String(value));
        }
        router.push(`/search?${params.toString()}`);
    };

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
                                        <label key={cat.id} className="flex items-center group cursor-pointer py-1">
                                            <input
                                                type="checkbox"
                                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 mr-3 transition-all cursor-pointer"
                                                checked={categorySlug === cat.slug}
                                                onChange={() => {
                                                    const params = new URLSearchParams(searchParams.toString());
                                                    if (categorySlug === cat.slug) {
                                                        params.delete('category');
                                                    } else {
                                                        params.set('category', cat.slug);
                                                    }
                                                    router.push(`/search?${params.toString()}`);
                                                }}
                                            />
                                            <span className={`text-sm font-bold transition-all ${categorySlug === cat.slug ? 'text-blue-600' : 'text-slate-500 group-hover:text-slate-900'}`}>{cat.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Rating Filter */}
                            <div>
                                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4">Min. Rating</h4>
                                <div className="flex gap-2">
                                    {[4, 3, 2, 1].map(star => (
                                        <button
                                            key={star}
                                            onClick={() => updateFilter('minRating', minRating === String(star) ? null : String(star))}
                                            className={`flex-1 py-2 rounded-xl border transition-all font-bold text-xs flex items-center justify-center gap-1 ${minRating === String(star) ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20' : 'border-slate-200 text-slate-600 hover:border-blue-500 hover:text-blue-600'}`}
                                        >
                                            {star}<Star className={`w-3 h-3 ${minRating === String(star) ? 'fill-current' : ''}`} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Distance Filter */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Radius</h4>
                                    <button 
                                        onClick={handleNearMe}
                                        disabled={geoLoading}
                                        className={`p-1.5 rounded-lg border transition-all ${latitude ? 'bg-orange-50 border-orange-200 text-orange-600' : 'bg-white border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200'}`}
                                        title="Use my current location"
                                    >
                                        <Navigation className={`w-4 h-4 ${geoLoading ? 'animate-spin' : ''}`} />
                                    </button>
                                </div>
                                {latitude ? (
                                    <>
                                        <input 
                                            type="range" 
                                            min="1" 
                                            max="50" 
                                            value={radius || 10} 
                                            onChange={(e) => updateFilter('radius', e.target.value)}
                                            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                        />
                                        <div className="flex justify-between mt-2">
                                            <span className="text-[10px] font-bold text-slate-400">1km</span>
                                            <span className="text-sm font-black text-blue-600">{radius || 10}km</span>
                                            <span className="text-[10px] font-bold text-slate-400">50km</span>
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-[11px] text-slate-400 font-medium italic">Click the arrow icon to search near you</p>
                                )}
                            </div>

                            {/* Status Filters */}
                            <div className="space-y-4 pt-4 border-t border-slate-100">
                                <label className="flex items-center justify-between cursor-pointer group">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg transition-colors ${openNow ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'}`}>
                                            <Clock className="w-4 h-4" />
                                        </div>
                                        <span className={`text-sm font-bold ${openNow ? 'text-slate-900' : 'text-slate-600'}`}>Open Now</span>
                                    </div>
                                    <input 
                                        type="checkbox" 
                                        checked={openNow} 
                                        onChange={(e) => updateFilter('openNow', e.target.checked)}
                                        className="sr-only"
                                    />
                                    <div className={`w-10 h-5 rounded-full relative transition-colors ${openNow ? 'bg-green-500' : 'bg-slate-300'}`}>
                                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${openNow ? 'right-1' : 'left-1'}`} />
                                    </div>
                                </label>

                                <label className="flex items-center justify-between cursor-pointer group">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg transition-colors ${verifiedOnly ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'}`}>
                                            <CheckCircle2 className="w-4 h-4" />
                                        </div>
                                        <span className={`text-sm font-bold ${verifiedOnly ? 'text-slate-900' : 'text-slate-600'}`}>Verified Only</span>
                                    </div>
                                    <input 
                                        type="checkbox" 
                                        checked={verifiedOnly} 
                                        onChange={(e) => updateFilter('verifiedOnly', e.target.checked)}
                                        className="sr-only"
                                    />
                                    <div className={`w-10 h-5 rounded-full relative transition-colors ${verifiedOnly ? 'bg-blue-500' : 'bg-slate-300'}`}>
                                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${verifiedOnly ? 'right-1' : 'left-1'}`} />
                                    </div>
                                </label>
                            </div>
                        </div>
                    </aside>

                    {/* Results Area */}
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                {city && (
                                    <div className="flex items-center gap-2 mb-2">
                                        <a href="/cities" className="text-xs font-bold text-slate-400 hover:text-orange-500 transition-colors">Cities</a>
                                        <span className="text-slate-300 text-xs">›</span>
                                        <span className="text-xs font-bold text-orange-500">{city}</span>
                                    </div>
                                )}
                                <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3 tracking-tight">
                                    {city ? (
                                        <>
                                            <MapPin className="w-8 h-8 text-orange-500 flex-shrink-0" />
                                            Businesses in <span className="text-orange-500">{city}</span>
                                        </>
                                    ) : query ? (
                                        `Results for "${query}"`
                                    ) : categorySlug ? (
                                        <>
                                            <Filter className="w-8 h-8 text-blue-600" />
                                            {categories.find(c => c.slug === categorySlug)?.name || categorySlug}
                                        </>
                                    ) : (
                                        'All Businesses'
                                    )}
                                </h1>
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2">
                                    {results.length} {results.length === 1 ? 'business' : 'businesses'} found
                                    {city ? ` in ${city}` : ''}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowFilters(true)}
                                className="md:hidden flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-black shadow-sm active:scale-95"
                            >
                                <Filter className="w-4 h-4 text-blue-600" /> Filters
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
                            <div className="bg-white rounded-[20px] p-16 text-center border border-slate-100">
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
