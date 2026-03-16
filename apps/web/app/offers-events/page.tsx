'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
    Search, 
    MapPin, 
    Filter, 
    Megaphone, 
    ChevronDown, 
    Navigation,
    Type,
    ArrowRight,
    Loader2,
    Tag,
    Calendar
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import OfferCard from '../../components/OfferCard';
import { api } from '../../lib/api';
import { OfferType } from '../../types/api';

// Inner component to use useSearchParams
const OffersEventsContent = () => {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [offers, setOffers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Filter states
    const [query, setQuery] = useState(searchParams.get('query') || '');
    const [city, setCity] = useState(searchParams.get('city') || '');
    const [type, setType] = useState<OfferType | ''>((searchParams.get('type') as OfferType) || '');
    const [radius, setRadius] = useState(searchParams.get('radius') || '10');
    const [lat, setLat] = useState(searchParams.get('latitude') || '');
    const [lng, setLng] = useState(searchParams.get('longitude') || '');
    
    // UI states
    const [isLocating, setIsLocating] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedOffer, setSelectedOffer] = useState<any>(null);
    const [showEnquiryModal, setShowEnquiryModal] = useState(false);

    const fetchOffers = async () => {
        setLoading(true);
        try {
            const params = {
                query,
                city,
                type: type || undefined,
                radius: lat && lng ? radius : undefined,
                latitude: lat || undefined,
                longitude: lng || undefined,
                page,
                limit: 12
            };
            const response = await api.offers.search(params);
            setOffers(response.data);
            setTotal(response.meta.total);
            setTotalPages(response.meta.totalPages);
        } catch (error) {
            console.error('Failed to fetch offers:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOffers();
    }, [page]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchOffers();
        
        // Update URL
        const params = new URLSearchParams();
        if (query) params.set('query', query);
        if (city) params.set('city', city);
        if (type) params.set('type', type);
        if (lat) params.set('latitude', lat);
        if (lng) params.set('longitude', lng);
        if (radius) params.set('radius', radius);
        
        router.push(`/offers-events?${params.toString()}`);
    };

    const handleGetLocation = () => {
        setIsLocating(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLat(position.coords.latitude.toString());
                    setLng(position.coords.longitude.toString());
                    setIsLocating(false);
                },
                (error) => {
                    console.error('Geolocation error:', error);
                    setIsLocating(false);
                    alert('Could not get your location. Please check your browser permissions.');
                }
            );
        } else {
            setIsLocating(false);
            alert('Geolocation is not supported by your browser.');
        }
    };

    const clearLocation = () => {
        setLat('');
        setLng('');
    };

    const openEnquiry = (offer: any) => {
        setSelectedOffer(offer);
        setShowEnquiryModal(true);
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />

            {/* Hero & Search Header */}
            <div className="bg-white border-b border-slate-100 pt-32 pb-12">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-xs font-black uppercase tracking-widest mb-4">
                                <Megaphone className="w-3.5 h-3.5" />
                                Exclusive Deals
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Offers & Events</h1>
                            <p className="text-slate-500 mt-2 text-lg font-medium">Discover the best deals and upcoming events in your city</p>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <div className="text-2xl font-black text-slate-900">{total}</div>
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Found</div>
                            </div>
                            <button 
                                onClick={() => setShowFilters(!showFilters)}
                                className={`p-4 rounded-2xl flex items-center gap-2 transition-all ${showFilters ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                            >
                                <Filter className="w-5 h-5" />
                                <span className="text-sm font-bold">Filters</span>
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleSearch} className="relative z-10">
                        <div className="flex flex-col lg:flex-row gap-3 p-3 bg-white rounded-[24px] shadow-2xl shadow-slate-200/50 border border-slate-100">
                            <div className="flex-1 relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-orange-500 transition-colors" />
                                <input 
                                    type="text" 
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search for offers or events..."
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all placeholder:text-slate-300"
                                />
                            </div>

                            <div className="w-full lg:w-64 relative group">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-orange-500 transition-colors" />
                                <input 
                                    type="text" 
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    placeholder="City or location"
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all placeholder:text-slate-300"
                                />
                            </div>

                            <button 
                                type="submit"
                                className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-orange-500 transition-all shadow-xl shadow-slate-900/10 active:scale-95"
                            >
                                Search Now
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Expandable Filters */}
                        {showFilters && (
                            <div className="mt-4 p-8 bg-white rounded-[24px] shadow-xl border border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-8 animate-in slide-in-from-top-4 duration-300">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Filter by Type</label>
                                    <div className="flex gap-2">
                                        {[
                                            { id: '', label: 'All', icon: Megaphone },
                                            { id: 'offer', label: 'Offers', icon: Tag },
                                            { id: 'event', label: 'Events', icon: Calendar }
                                        ].map((t) => (
                                            <button
                                                key={t.id}
                                                type="button"
                                                onClick={() => setType(t.id as any)}
                                                className={`flex-1 flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all ${type === t.id ? 'bg-orange-50 border-orange-500 text-orange-600' : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-slate-200'}`}
                                            >
                                                <t.icon className="w-5 h-5" />
                                                <span className="text-xs font-black uppercase tracking-tight">{t.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Radial Search</label>
                                    <div className="flex items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={handleGetLocation}
                                            disabled={isLocating}
                                            className={`flex-1 p-4 rounded-2xl border flex items-center justify-center gap-2 transition-all ${lat ? 'bg-emerald-50 border-emerald-500 text-emerald-600' : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-slate-200'}`}
                                        >
                                            {isLocating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Navigation className="w-5 h-5" />}
                                            <span className="text-xs font-black uppercase tracking-tight">{lat ? 'Located' : 'Near Me'}</span>
                                        </button>
                                        {lat && (
                                            <button 
                                                type="button" 
                                                onClick={clearLocation}
                                                className="p-4 bg-slate-50 border border-slate-100 text-slate-400 rounded-2xl hover:text-rose-500 hover:border-rose-200"
                                            >
                                                Clear
                                            </button>
                                        )}
                                    </div>
                                    <div className="mt-4">
                                        <div className="flex justify-between mb-2">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Radius: {radius}km</span>
                                        </div>
                                        <input 
                                            type="range" 
                                            min="1" 
                                            max="100" 
                                            value={radius}
                                            onChange={(e) => setRadius(e.target.value)}
                                            className="w-full accent-orange-500"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col justify-end">
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            setQuery('');
                                            setCity('');
                                            setType('');
                                            setLat('');
                                            setLng('');
                                            setRadius('10');
                                        }}
                                        className="w-full p-4 bg-slate-50 text-slate-500 rounded-2xl font-bold text-sm hover:bg-slate-100 transition-colors"
                                    >
                                        Reset All Filters
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </div>

            {/* Results Grid */}
            <div className="max-w-7xl mx-auto px-4 py-16">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="w-12 h-12 text-slate-200 animate-spin" />
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Finding matches...</p>
                    </div>
                ) : offers.length > 0 ? (
                    <>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {offers.map((offer) => (
                                <OfferCard 
                                    key={offer.id} 
                                    offer={offer} 
                                    onEnquire={() => openEnquiry(offer)}
                                />
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-16 flex justify-center gap-2">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => setPage(p)}
                                        className={`w-12 h-12 rounded-2xl font-black transition-all ${page === p ? 'bg-slate-900 text-white shadow-xl' : 'bg-white text-slate-600 border border-slate-100 hover:border-slate-300'}`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                            <Search className="w-10 h-10 text-slate-300" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-2">No results found</h3>
                        <p className="text-slate-500 max-w-sm font-medium">Try adjusting your filters or searching in a different location.</p>
                        <button 
                            onClick={() => {
                                setQuery('');
                                setCity('');
                                setType('');
                                setLat('');
                                setLng('');
                                router.push('/offers-events');
                                fetchOffers();
                            }}
                            className="mt-8 px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-orange-500 transition-all"
                        >
                            Reset everything
                        </button>
                    </div>
                )}
            </div>

            {/* Footer */}
            <Footer />
        </div>
    );
};

const OffersEventsPage = () => {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-10 h-10 text-slate-300 animate-spin" />
            </div>
        }>
            <OffersEventsContent />
        </Suspense>
    );
};

export default OffersEventsPage;
