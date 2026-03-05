"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, ArrowRight, TrendingUp, Compass, Sliders, Users, Heart, Phone, ShieldCheck, Star, ChefHat, Stethoscope, Sparkles, Wrench, ChevronDown } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BusinessCard from '../components/BusinessCard';
import { api, getImageUrl } from '../lib/api';
import Link from 'next/link';
import { Category, Business, City, Review } from '../types/api';

export default function HomePage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [featuredBusinesses, setFeaturedBusinesses] = useState<Business[]>([]);
    const [paginationMetadata, setPaginationMetadata] = useState({
        total: 0,
        page: 1,
        limit: 12,
        totalPages: 0,
        hasMore: false
    });
    const [popularCities, setPopularCities] = useState<City[]>([]);
    const [categoriesList, setCategoriesList] = useState<Category[]>([]);
    const [citiesList, setCitiesList] = useState<City[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);

    const [loading, setLoading] = useState(true);
    const [statsReviews, setStatsReviews] = useState<Review[]>([]);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setLoading(true);
                console.log(`Fetching homepage data for page ${paginationMetadata.page}...`);
                const results = await Promise.allSettled([
                    api.categories.getPopular(8),
                    api.listings.getFeatured(paginationMetadata.page, 12),
                    api.cities.getPopular(),
                    api.categories.getAll(),
                    api.cities.getAll(),
                    api.reviews.getPopular(3)
                ]);

                const getValue = (result: PromiseSettledResult<any>, fallback: any) =>
                    result.status === 'fulfilled' ? result.value : fallback;

                const cats = getValue(results[0], []);
                const featured = getValue(results[1], { data: [], meta: {} });
                const cities = getValue(results[2], []);
                const allCats = getValue(results[3], []);
                const allCities = getValue(results[4], []);
                const reviewsData = getValue(results[5], { data: [] });

                setCategories(cats || []);
                setFeaturedBusinesses(featured?.data || []);
                if (featured?.meta) {
                    setPaginationMetadata(prev => ({ ...prev, ...featured.meta }));
                }
                setPopularCities(cities || []);
                setCategoriesList(allCats || []);
                setCitiesList(allCities || []);
                setStatsReviews(reviewsData?.data || []);

            } catch (err) {
                console.error('CRITICAL: Unexpected error in loadInitialData:', err);
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, [paginationMetadata.page]);

    const searchRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setIsSuggestionsOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleSearch = () => {
        if (!searchQuery.trim()) return;
        window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#FF7A30]" />
                    <p className="text-slate-500 font-bold animate-pulse">Loading Trusted</p>
                </div>
            </div>
        );
    }

    const filteredCategories = categoriesList.filter(cat =>
        cat.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5);

    const filteredCities = citiesList.filter(city =>
        city.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5);

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 overflow-x-hidden">
            <Navbar />

            {/* Hero Section */}
            <section className="relative pt-32 pb-44 px-4 overflow-visible z-[60]">
                <div
                    className="absolute inset-0 z-0 scale-105"
                    style={{
                        backgroundImage: 'url("https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=2000")',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        filter: 'blur(3px) brightness(0.45)'
                    }}
                />

                <div className="max-w-7xl mx-auto relative z-10 text-center text-white">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-4xl md:text-7xl font-extrabold mb-6 tracking-tight drop-shadow-xl">
                            Discover Trusted Local Businesses Instantly
                        </h1>
                        <p className="text-lg md:text-2xl text-white/95 mb-12 max-w-3xl mx-auto font-medium drop-shadow-lg">
                            Search, compare & contact the best services near you — fast and reliable.
                        </p>
                    </motion.div>

                    {/* Search Bar Container */}
                    <motion.div
                        ref={searchRef}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="relative z-[70] max-w-4xl mx-auto bg-white/10 backdrop-blur-md p-2 rounded-2xl md:rounded-full shadow-2xl border border-white/20 flex flex-col md:flex-row items-stretch gap-2"
                    >
                        <div className="flex-1 relative z-50">
                            <div className="relative h-full">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400 z-10" />
                                <input
                                    type="text"
                                    placeholder="Search categories, cities, or businesses..."
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setIsSuggestionsOpen(true);
                                    }}
                                    onFocus={() => setIsSuggestionsOpen(true)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    className="w-full pl-16 pr-8 py-6 bg-white text-slate-900 placeholder-slate-400 rounded-2xl md:rounded-full border-0 focus:ring-2 focus:ring-[#FF7A30] text-xl font-semibold outline-none transition-all shadow-inner"
                                />
                            </div>

                            {isSuggestionsOpen && (filteredCategories.length > 0 || filteredCities.length > 0) && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="absolute top-full left-0 right-0 mt-3 bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 py-4 z-[100] max-h-[500px] overflow-y-auto"
                                >
                                    {filteredCategories.length > 0 && (
                                        <div className="px-6 py-2">
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Categories</p>
                                            {filteredCategories.map(cat => (
                                                <button
                                                    key={cat.id}
                                                    onClick={() => {
                                                        setSearchQuery(cat.name);
                                                        setIsSuggestionsOpen(false);
                                                        window.location.href = `/search?category=${cat.slug}`;
                                                    }}
                                                    className="w-full px-4 py-3 text-left hover:bg-blue-50/50 rounded-xl text-slate-700 font-bold transition-all flex items-center justify-between group"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-[#FF7A30] group-hover:scale-110 transition-transform">
                                                            <TrendingUp className="w-5 h-5" />
                                                        </div>
                                                        <span className="group-hover:text-[#FF7A30] transition-colors">{cat.name}</span>
                                                    </div>
                                                    <ChevronDown className="w-4 h-4 opacity-0 group-hover:opacity-100 -rotate-90 transition-all" />
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {filteredCities.length > 0 && (
                                        <div className="px-6 py-2 border-t border-slate-50 mt-2">
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 mt-2">Locations</p>
                                            {filteredCities.map(city => (
                                                <button
                                                    key={city.id}
                                                    onClick={() => {
                                                        setSearchQuery(city.name);
                                                        setIsSuggestionsOpen(false);
                                                        window.location.href = `/search?city=${encodeURIComponent(city.name)}`;
                                                    }}
                                                    className="w-full px-4 py-3 text-left hover:bg-blue-50/50 rounded-xl text-slate-700 font-bold transition-all flex items-center justify-between group"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                                                            <MapPin className="w-5 h-5" />
                                                        </div>
                                                        <span className="group-hover:text-blue-600 transition-colors">{city.name}</span>
                                                    </div>
                                                    <ChevronDown className="w-4 h-4 opacity-0 group-hover:opacity-100 -rotate-90 transition-all" />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </div>

                        <button
                            onClick={handleSearch}
                            className="bg-[#FF7A30] hover:bg-[#E86920] text-white px-12 py-5 rounded-2xl md:rounded-full font-black text-xl transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 group shrink-0"
                        >
                            <Search className="w-6 h-6 group-hover:scale-110 transition-transform" />
                            Search
                        </button>
                    </motion.div>

                    <div className="mt-12 flex flex-wrap justify-center gap-4 md:gap-8 text-white/95">
                        {categories.slice(0, 4).map(cat => (
                            <Link key={cat.id} href={`/search?category=${cat.slug}`} className="flex items-center gap-3 px-4 py-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all backdrop-blur-sm border border-white/10 group">
                                <span className="text-xl">{cat.icon || '📁'}</span>
                                <span className="text-base font-bold tracking-wide">{cat.name}</span>
                            </Link>
                        ))}
                    </div>

                </div>
            </section>

            {/* Popular Categories */}
            <section className="py-24 bg-white relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center justify-center gap-6 mb-16">
                        <div className="h-[1px] bg-slate-200 w-24 md:w-48" />
                        <h2 className="text-4xl font-extrabold text-[#112D4E] tracking-tight whitespace-nowrap">Popular Categories</h2>
                        <div className="h-[1px] bg-slate-200 w-24 md:w-48" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {categories.map((cat, idx) => (
                            <motion.div
                                key={cat.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <Link href={`/search?category=${cat.slug}`} className="group block">
                                    <div className="bg-slate-50 p-8 rounded-2xl border border-black flex items-center gap-6 hover:bg-white hover:shadow-2xl hover:shadow-blue-500/5 hover:-translate-y-1 transition-all duration-500">
                                        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center group-hover:border-blue-200 group-hover:bg-blue-50/30 transition-all">
                                            <span className="text-3xl">{cat.icon || '📁'}</span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-xl text-slate-900 mb-1 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{cat.name}</h3>
                                            <p className="text-sm text-slate-500 font-bold uppercase tracking-widest opacity-80">
                                                {cat.businessCount || 0}+ Listings
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Businesses */}
            <section className="py-24 bg-slate-50/50">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center justify-center gap-6 mb-16 text-center">
                        <div className="h-[1px] bg-slate-200 w-24 md:w-48" />
                        <h2 className="text-4xl font-extrabold text-[#112D4E] tracking-tight whitespace-nowrap">Featured Businesses</h2>
                        <div className="h-[1px] bg-slate-200 w-24 md:w-48" />
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {featuredBusinesses.length > 0 ? featuredBusinesses.map((biz, idx) => (
                            <motion.div
                                key={biz.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: (idx % 4) * 0.1 }}
                            >
                                <BusinessCard
                                    business={biz}
                                    variant={idx % 4 === 0 ? 'green' : idx % 4 === 1 ? 'blue' : idx % 4 === 2 ? 'white' : 'dark'}
                                />
                            </motion.div>
                        )) : (
                            Array(12).fill(0).map((_, i) => (
                                <div key={i} className="bg-white h-[400px] rounded-3xl shadow-sm animate-pulse border border-slate-100" />
                            ))
                        )}
                    </div>

                    {/* Pagination Bar */}
                    {paginationMetadata.totalPages > 1 && (
                        <div className="mt-16 flex justify-center items-center gap-4">
                            <button
                                onClick={() => setPaginationMetadata(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                                disabled={paginationMetadata.page === 1}
                                className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center hover:bg-white hover:shadow-lg transition-all disabled:opacity-30 disabled:hover:shadow-none"
                            >
                                <ChevronDown className="w-6 h-6 rotate-90" />
                            </button>

                            <div className="flex items-center gap-2">
                                {[...Array(paginationMetadata.totalPages)].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setPaginationMetadata(prev => ({ ...prev, page: i + 1 }))}
                                        className={`w-12 h-12 rounded-full font-black transition-all ${paginationMetadata.page === i + 1
                                            ? 'bg-[#FF7A30] text-white shadow-lg'
                                            : 'hover:bg-white hover:shadow-md text-slate-600'
                                            }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => setPaginationMetadata(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
                                disabled={paginationMetadata.page === paginationMetadata.totalPages}
                                className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center hover:bg-white hover:shadow-lg transition-all disabled:opacity-30 disabled:hover:shadow-none"
                            >
                                <ChevronDown className="w-6 h-6 -rotate-90" />
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center justify-center gap-6 mb-20 text-center">
                        <div className="h-[1px] bg-slate-200 w-24 md:w-48" />
                        <h2 className="text-4xl font-extrabold text-[#112D4E] tracking-tight whitespace-nowrap">How It Works</h2>
                        <div className="h-[1px] bg-slate-200 w-24 md:w-48" />
                    </div>

                    <div className="grid md:grid-cols-3 gap-16 md:gap-8 max-w-5xl mx-auto">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-8 relative">
                                <div className="absolute top-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold border-4 border-white">1</div>
                                <Search className="w-10 h-10 text-blue-600" />
                            </div>
                            <h3 className="text-2xl font-black mb-4">1. Search & Find</h3>
                            <p className="text-slate-500 font-medium leading-relaxed">Choose the service you need from our verified categories.</p>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-8 relative">
                                <div className="absolute top-0 right-0 w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold border-4 border-white">2</div>
                                <Heart className="w-10 h-10 text-red-600" />
                            </div>
                            <h3 className="text-2xl font-black mb-4">2. Compare & Review</h3>
                            <p className="text-slate-500 font-medium leading-relaxed">Read reviews & select the best local providers.</p>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mb-8 relative">
                                <div className="absolute top-0 right-0 w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold border-4 border-white">3</div>
                                <Phone className="w-10 h-10 text-orange-600" />
                            </div>
                            <h3 className="text-2xl font-black mb-4">3. Contact & Connect</h3>
                            <p className="text-slate-500 font-medium leading-relaxed">Reach out directly to your chosen business in seconds.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Top Cities We Serve */}
            <section className="py-24 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center justify-center gap-6 mb-16 text-center">
                        <div className="h-[1px] bg-slate-200 w-24 md:w-48" />
                        <h2 className="text-4xl font-extrabold text-[#112D4E] tracking-tight whitespace-nowrap">Top Cities We Serve</h2>
                        <div className="h-[1px] bg-slate-200 w-24 md:w-48" />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                        {popularCities.slice(0, 5).map((city, idx) => (
                            <motion.div
                                key={city.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <Link href={`/search?city=${city.name}`} className="relative h-48 rounded-2xl overflow-hidden block group shadow-lg">
                                    <img
                                        src={getImageUrl(city.imageUrl) || 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&q=80&w=400'}
                                        alt={city.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 brightness-75 group-hover:brightness-90"
                                    />
                                    <div className="absolute inset-x-0 bottom-6 text-center">
                                        <span className="text-white text-xl font-black drop-shadow-lg tracking-tight">{city.name}</span>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                    <div className="mt-12 text-center">
                        <Link href="/cities" className="text-blue-600 font-bold hover:gap-4 transition-all inline-flex items-center gap-2 text-lg">
                            View All Cities <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Testimonials - What People Are Saying */}
            <section className="py-24 bg-white overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 mb-16">
                    <div className="flex items-center justify-center gap-6 text-center">
                        <div className="h-[1px] bg-slate-200 w-24 md:w-48" />
                        <h2 className="text-4xl font-extrabold text-[#112D4E] tracking-tight whitespace-nowrap">What People Are Saying</h2>
                        <div className="h-[1px] bg-slate-200 w-24 md:w-48" />
                    </div>
                </div>

                {(() => {
                    const fallbackReviews = [
                        { id: 'f1', name: 'Ahmed S.', location: 'Karachi', text: 'Found a great plumber in Karachi in minutes. Highly recommend!', rating: 5, img: 'https://i.pravatar.cc/150?u=ahmed' },
                        { id: 'f2', name: 'Zainab R.', location: 'Lahore', text: 'Excellent service. Easy to find and contact businesses in Lahore.', rating: 5, img: 'https://i.pravatar.cc/150?u=zainab' },
                        { id: 'f3', name: 'Bilal K.', location: 'Islamabad', text: 'Trusted and reliable listings. Best platform for Pakistan.', rating: 5, img: 'https://i.pravatar.cc/150?u=bilal' },
                        { id: 'f4', name: 'Sara M.', location: 'Faisalabad', text: 'Booking appointments has never been so easy. Love this platform!', rating: 4, img: 'https://i.pravatar.cc/150?u=sara' },
                        { id: 'f5', name: 'Usman T.', location: 'Rawalpindi', text: 'Great variety of businesses listed. Found exactly what I needed.', rating: 5, img: 'https://i.pravatar.cc/150?u=usman' },
                        { id: 'f6', name: 'Hina N.', location: 'Multan', text: 'Very user-friendly! Found a top doctor in my area within seconds.', rating: 5, img: 'https://i.pravatar.cc/150?u=hina' },
                    ];

                    const cards = statsReviews.length > 0
                        ? statsReviews.map(rev => ({
                            id: rev.id,
                            name: rev.user?.fullName || 'Anonymous',
                            location: '',
                            text: rev.comment,
                            rating: rev.rating,
                            img: rev.user?.avatarUrl ? getImageUrl(rev.user.avatarUrl) as string : null,
                        }))
                        : fallbackReviews;

                    const row1 = [...cards, ...cards, ...cards];
                    const row2 = [...cards, ...cards, ...cards];

                    const ReviewCard = ({ card, idx }: { card: typeof row1[0], idx: number }) => (
                        <div
                            key={`${card.id}-${idx}`}
                            className="flex-shrink-0 w-80 bg-[#F8FAFC] p-6 rounded-2xl border border-slate-100 flex items-start gap-4 shadow-sm mx-3"
                        >
                            <div className="w-12 h-12 rounded-full border-2 border-white shadow bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-base uppercase overflow-hidden flex-shrink-0">
                                {card.img
                                    ? <img src={card.img} alt={card.name} className="w-full h-full object-cover" />
                                    : card.name[0].toUpperCase()
                                }
                            </div>
                            <div className="min-w-0">
                                <h4 className="font-bold text-slate-900 text-sm mb-0.5 truncate">
                                    {card.name}{card.location ? `, ${card.location}` : ''}
                                </h4>
                                <div className="flex gap-0.5 mb-1.5">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`w-3 h-3 ${i < (card.rating || 5) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                                    ))}
                                </div>
                                <p className="text-slate-600 text-sm italic leading-relaxed line-clamp-3">"{card.text}"</p>
                            </div>
                        </div>
                    );

                    return (
                        <div className="max-w-7xl mx-auto px-4 overflow-hidden">
                            <div className="space-y-4">
                                <div className="relative">
                                    <div
                                        className="flex"
                                        style={{
                                            animation: 'marquee-rtl 35s linear infinite',
                                            width: 'max-content',
                                        }}
                                        onMouseEnter={e => (e.currentTarget.style.animationPlayState = 'paused')}
                                        onMouseLeave={e => (e.currentTarget.style.animationPlayState = 'running')}
                                    >
                                        {row1.map((card, idx) => <ReviewCard key={idx} card={card} idx={idx} />)}
                                    </div>
                                </div>

                                <div className="relative">
                                    <div
                                        className="flex"
                                        style={{
                                            animation: 'marquee-ltr 35s linear infinite',
                                            width: 'max-content',
                                        }}
                                        onMouseEnter={e => (e.currentTarget.style.animationPlayState = 'paused')}
                                        onMouseLeave={e => (e.currentTarget.style.animationPlayState = 'running')}
                                    >
                                        {row2.map((card, idx) => <ReviewCard key={idx} card={card} idx={idx} />)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })()}

                <style>{`
                    @keyframes marquee-rtl {
                        0%   { transform: translateX(0); }
                        100% { transform: translateX(-33.333%); }
                    }
                    @keyframes marquee-ltr {
                        0%   { transform: translateX(-33.333%); }
                        100% { transform: translateX(0); }
                    }
                `}</style>
            </section>

            {/* Business Recruitment CTA */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="bg-gradient-to-r from-[#0B2244] to-[#0D2E61] rounded-xl p-8 md:px-12 md:py-10 relative overflow-hidden shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 border border-white/5">
                        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/carbon-fibre.png")', opacity: 0.1 }} />
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent pointer-events-none" />

                        <div className="relative z-10 text-center md:text-left">
                            <h2 className="text-2xl md:text-4xl font-bold text-white mb-2 tracking-tight">
                                Own a Business? Get More Customers Today!
                            </h2>
                            <p className="text-white/80 text-lg md:text-xl font-medium">
                                List your business for free and grow your reach.
                            </p>
                        </div>

                        <div className="relative z-10 shrink-0">
                            <Link href="/register?role=vendor" className="bg-gradient-to-r from-[#FF7A30] to-[#FF9050] hover:from-[#E86920] hover:to-[#FF7A30] text-white px-10 py-4 rounded-xl font-bold text-lg md:text-xl transition-all shadow-[0_10px_20px_-5px_rgba(255,122,48,0.4)] active:scale-95 whitespace-nowrap flex items-center justify-center border border-white/10">
                                Add Your Business
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
