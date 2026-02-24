"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, ArrowRight, TrendingUp, Compass, Sliders, Users, Heart, Phone, ShieldCheck, Star, ChefHat, Stethoscope, Sparkles, Wrench, ChevronDown } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BusinessCard from '../components/BusinessCard';
import { api } from '../lib/api';
import Link from 'next/link';
import { Category, Business, City } from '../types/api';

export default function HomePage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [featuredBusinesses, setFeaturedBusinesses] = useState<Business[]>([]);
    const [popularCities, setPopularCities] = useState<City[]>([]);
    const [categoriesList, setCategoriesList] = useState<Category[]>([]);
    const [citiesList, setCitiesList] = useState<City[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [selectedCity, setSelectedCity] = useState<string>('');
    const [isCatOpen, setIsCatOpen] = useState(false);
    const [isCityOpen, setIsCityOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                console.log('Fetching homepage data...');
                const [cats, featured, cities, allCats, allCities] = await Promise.all([
                    api.categories.getPopular(8),
                    api.businesses.getFeatured(),
                    api.cities.getPopular(),
                    api.categories.getAll(),
                    api.cities.getAll()
                ]);
                console.log('Homepage data loaded successfully:', { cats: cats?.length, featured: featured?.data?.length, cities: cities?.length });
                setCategories(cats || []);
                setFeaturedBusinesses(featured?.data || []);
                setPopularCities(cities || []);
                setCategoriesList(allCats || []);
                setCitiesList(allCities || []);
            } catch (err) {
                console.error('CRITICAL: Failed to load homepage data:', err);
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, []);

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (selectedCategory) params.append('category', selectedCategory);
        if (selectedCity) params.append('city', selectedCity);
        window.location.href = `/search?${params.toString()}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#FF7A30]" />
                    <p className="text-slate-500 font-bold animate-pulse">Loading Trusted </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900">
            <Navbar />

            {/* Hero Section */}
            <section className="relative h-[650px] flex items-center justify-center overflow-hidden">
                <div
                    className="absolute inset-0 z-0 scale-105"
                    style={{
                        backgroundImage: 'url("https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=2000")',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        filter: 'blur(3px) brightness(0.45)'
                    }}
                />

                <div className="max-w-7xl mx-auto px-4 relative z-10 text-center text-white">
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
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="max-w-5xl mx-auto bg-white/10 backdrop-blur-md p-1.5 rounded-2xl md:rounded-full shadow-2xl border border-white/20 flex flex-col md:flex-row items-stretch"
                    >
                        {/* Category Dropdown */}
                        <div className="flex-1 relative group">
                            <button
                                onClick={() => { setIsCatOpen(!isCatOpen); setIsCityOpen(false); }}
                                className="w-full flex items-center justify-between px-8 py-5 bg-white rounded-t-2xl md:rounded-l-full md:rounded-r-none border-b md:border-b-0 md:border-r border-slate-100 text-left"
                            >
                                <span className={`text-lg font-semibold ${selectedCategory ? 'text-slate-900' : 'text-slate-400'}`}>
                                    {selectedCategory ? categoriesList.find(c => c.slug === selectedCategory)?.name : 'What are you looking for?'}
                                </span>
                                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isCatOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isCatOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 max-h-64 overflow-y-auto"
                                >
                                    {categoriesList.map(cat => (
                                        <button
                                            key={cat.id}
                                            onClick={() => { setSelectedCategory(cat.slug); setIsCatOpen(false); }}
                                            className="w-full px-6 py-3 text-left hover:bg-slate-50 text-slate-700 font-bold transition-colors flex items-center gap-3"
                                        >
                                            <TrendingUp className="w-4 h-4 text-slate-300" />
                                            {cat.name}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </div>

                        {/* City Dropdown */}
                        <div className="w-full md:w-80 relative">
                            <button
                                onClick={() => { setIsCityOpen(!isCityOpen); setIsCatOpen(false); }}
                                className="w-full flex items-center justify-between px-8 py-5 bg-white md:rounded-none text-left"
                            >
                                <span className={`text-lg font-semibold ${selectedCity ? 'text-slate-900' : 'text-slate-400'}`}>
                                    {selectedCity || 'Enter City or Area'}
                                </span>
                                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isCityOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isCityOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 max-h-64 overflow-y-auto"
                                >
                                    {citiesList.map(city => (
                                        <button
                                            key={city.id}
                                            onClick={() => { setSelectedCity(city.name); setIsCityOpen(false); }}
                                            className="w-full px-6 py-3 text-left hover:bg-slate-50 text-slate-700 font-bold transition-colors flex items-center gap-3"
                                        >
                                            <MapPin className="w-4 h-4 text-slate-300" />
                                            {city.name}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </div>

                        <button
                            onClick={handleSearch}
                            className="bg-[#FF7A30] hover:bg-[#E86920] text-white px-16 py-5 rounded-b-2xl md:rounded-r-full md:rounded-l-none font-black text-xl transition-all shadow-xl active:scale-95 flex items-center justify-center"
                        >
                            Search
                        </button>
                    </motion.div>

                    {/* Quick Category Icons */}
                    <div className="mt-12 flex flex-wrap justify-center gap-6 md:gap-12 text-white/95">
                        <Link href="/search?category=doctors" className="flex items-center gap-3 hover:text-white transition-all transform hover:-translate-y-1 group">
                            <div className="p-2.5 bg-white/10 rounded-xl group-hover:bg-white/20 transition-all backdrop-blur-sm"><Stethoscope className="w-5 h-5" /></div>
                            <span className="text-base font-bold tracking-wide">Doctors</span>
                        </Link>
                        <Link href="/search?category=restaurants-food" className="flex items-center gap-3 hover:text-white transition-all transform hover:-translate-y-1 group">
                            <div className="p-2.5 bg-white/10 rounded-xl group-hover:bg-white/20 transition-all backdrop-blur-sm"><ChefHat className="w-5 h-5" /></div>
                            <span className="text-base font-bold tracking-wide">Restaurants</span>
                        </Link>
                        <Link href="/search?category=beauty-spa" className="flex items-center gap-3 hover:text-white transition-all transform hover:-translate-y-1 group">
                            <div className="p-2.5 bg-white/10 rounded-xl group-hover:bg-white/20 transition-all backdrop-blur-sm"><Sparkles className="w-5 h-5" /></div>
                            <span className="text-base font-bold tracking-wide">Salon & Spa</span>
                        </Link>
                        <Link href="/search?category=home-services-maintenance" className="flex items-center gap-3 hover:text-white transition-all transform hover:-translate-y-1 group">
                            <div className="p-2.5 bg-white/10 rounded-xl group-hover:bg-white/20 transition-all backdrop-blur-sm"><Wrench className="w-5 h-5" /></div>
                            <span className="text-base font-bold tracking-wide">Repair Services</span>
                        </Link>
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
                        {categories.map((cat, idx) => {
                            const iconMap: Record<string, React.ReactNode> = {
                                'restaurants-food': <ChefHat className="w-8 h-8 text-[#FF7A30]" />,
                                'doctors': <Stethoscope className="w-8 h-8 text-blue-600" />,
                                'beauty-spa': <Sparkles className="w-8 h-8 text-pink-500" />,
                                'real-estate': <Compass className="w-8 h-8 text-green-600" />,
                                'education': <Star className="w-8 h-8 text-indigo-600" />,
                                'home-services-maintenance': <Wrench className="w-8 h-8 text-amber-600" />,
                                'automobile': <Compass className="w-8 h-8 text-blue-400" />,
                                'it-repair-maintenance': <Sliders className="w-8 h-8 text-slate-700" />
                            };
                            return (
                                <motion.div
                                    key={cat.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.05 }}
                                >
                                    <Link href={`/categories/${cat.slug}`} className="group block">
                                        <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 flex items-center gap-6 hover:bg-white hover:shadow-2xl hover:shadow-blue-500/5 hover:-translate-y-1 transition-all duration-500">
                                            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center group-hover:border-blue-200 group-hover:bg-blue-50/30 transition-all">
                                                {iconMap[cat.slug] || <TrendingUp className="w-8 h-8 text-blue-600" />}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-xl text-slate-900 mb-1 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{cat.name}</h3>
                                                <p className="text-sm text-slate-500 font-bold uppercase tracking-widest opacity-80">
                                                    {cat.businessCount || 150}+ Listings
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            );
                        })}
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
                        {featuredBusinesses.length > 0 ? featuredBusinesses.slice(0, 4).map((biz, idx) => (
                            <motion.div
                                key={biz.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <BusinessCard
                                    business={biz}
                                    variant={idx === 0 ? 'green' : idx === 1 ? 'blue' : idx === 2 ? 'white' : 'dark'}
                                />
                            </motion.div>
                        )) : (
                            Array(4).fill(0).map((_, i) => (
                                <div key={i} className="bg-white h-[400px] rounded-3xl shadow-sm animate-pulse border border-slate-100" />
                            ))
                        )}
                    </div>
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
                                        src={city.imageUrl || 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&q=80&w=400'}
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
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center justify-center gap-6 mb-20 text-center">
                        <div className="h-[1px] bg-slate-200 w-24 md:w-48" />
                        <h2 className="text-4xl font-extrabold text-[#112D4E] tracking-tight whitespace-nowrap">What People Are Saying</h2>
                        <div className="h-[1px] bg-slate-200 w-24 md:w-48" />
                    </div>

                    <div className="grid md:grid-cols-3 gap-10">
                        {[
                            { name: 'Ahmed S.', location: 'Karachi', text: '“Found a great plumber in Karachi in minutes. Highly recommend!”', img: 'https://i.pravatar.cc/150?u=ahmed' },
                            { name: 'Zainab R.', location: 'Lahore', text: '“Excellent service. Easy to find and contact businesses in Lahore.”', img: 'https://i.pravatar.cc/150?u=zainab' },
                            { name: 'Bilal K.', location: 'Islamabad', text: '“Trusted and reliable listings. Best platform for Pakistan.”', img: 'https://i.pravatar.cc/150?u=bilal' }
                        ].map((rev, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="bg-[#F8FAFC] p-10 rounded-3xl border border-slate-100 flex items-start gap-6 hover:shadow-xl transition-all"
                            >
                                <img src={rev.img} alt={rev.name} className="w-16 h-16 rounded-full border-4 border-white shadow-sm" />
                                <div>
                                    <h4 className="font-black text-slate-900 text-lg mb-0.5">{rev.name}, {rev.location}</h4>
                                    <p className="text-slate-600 font-medium italic leading-relaxed">{rev.text}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Business Recruitment CTA */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="bg-gradient-to-r from-[#0B2244] to-[#0D2E61] rounded-xl p-8 md:px-12 md:py-10 relative overflow-hidden shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 border border-white/5">
                        {/* Subtle Mesh Pattern */}
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
