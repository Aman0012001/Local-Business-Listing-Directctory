"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Plus, Search, RefreshCw, Loader2, Trash2,
    MapPin, Globe, Building2, Star, XCircle,
    CheckCircle2, Navigation, MapIcon, Globe2
} from 'lucide-react';
import { api } from '../../../lib/api';
import { City } from '../../../types/api';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminCitiesPage() {
    const [cities, setCities] = useState<City[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [limit] = useState(10);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedCity, setSelectedCity] = useState<City | null>(null);

    // Google Places Autocomplete refs
    const autocompleteInputRef = useRef<HTMLInputElement>(null);
    const [selectedPlace, setSelectedPlace] = useState<any>(null);
    const [importData, setImportData] = useState({
        isPopular: false,
        displayOrder: 0
    });

    const fetchCities = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.cities.adminList(page, limit, search) as any;
            setCities(response.data || []);
            setTotal(response.total || 0);
        } catch (err) {
            console.error('Failed to fetch cities', err);
        } finally {
            setLoading(false);
        }
    }, [page, limit, search]);

    useEffect(() => {
        fetchCities();
    }, [fetchCities]);

    // Initialize Google Places Autocomplete
    useEffect(() => {
        if (isImportModalOpen && typeof window !== 'undefined' && window.google) {
            const timer = setTimeout(() => {
                if (!autocompleteInputRef.current) return;

                const autocomplete = new window.google.maps.places.Autocomplete(autocompleteInputRef.current, {
                    types: ['(cities)'],
                });

                autocomplete.addListener('place_changed', () => {
                    const place = autocomplete.getPlace();
                    if (place.address_components) {
                        setSelectedPlace(place);
                    }
                });
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [isImportModalOpen]);

    const handleImport = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPlace) return;

        setActionLoading('import');
        try {
            const addressComponents = selectedPlace.address_components;
            const cityName = addressComponents.find((c: any) => c.types.includes('locality'))?.long_name || 
                           addressComponents.find((c: any) => c.types.includes('administrative_area_level_2'))?.long_name;
            const state = addressComponents.find((c: any) => c.types.includes('administrative_area_level_1'))?.long_name;
            const country = addressComponents.find((c: any) => c.types.includes('country'))?.long_name;

            if (!cityName) throw new Error('Could not determine city name from selection.');

            const cityData = {
                name: cityName,
                state: state || '',
                country: country || 'Pakistan',
                isPopular: importData.isPopular,
                displayOrder: importData.displayOrder,
                heroImageUrl: selectedPlace.photos?.[0]?.getUrl() || ''
            };

            await api.cities.adminCreate(cityData);
            await fetchCities();
            setIsImportModalOpen(false);
            setSelectedPlace(null);
            setImportData({ isPopular: false, displayOrder: 0 });
        } catch (err: any) {
            alert(err.message || 'Failed to import city');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async () => {
        if (!selectedCity) return;
        setActionLoading('delete');
        try {
            await api.cities.adminDelete(selectedCity.id);
            await fetchCities();
            setIsDeleteModalOpen(false);
            setSelectedCity(null);
        } catch (err: any) {
            alert(err.message || 'Failed to delete city');
        } finally {
            setActionLoading(null);
        }
    };

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Cities Management</h1>
                    <p className="text-slate-400 font-medium mt-1">
                        Import and manage cities available for business listings.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchCities}
                        className="flex items-center justify-center p-3 bg-slate-100 hover:bg-slate-200 rounded-2xl text-slate-600 transition-all"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={() => setIsImportModalOpen(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white hover:bg-red-700 rounded-2xl font-bold transition-all shadow-lg shadow-red-600/20 active:scale-95"
                    >
                        <Plus className="w-5 h-5" /> Import City
                    </button>
                </div>
            </div>

            {/* Search toolbar */}
            <div className="relative">
                <div className="absolute left-5 top-1/2 -translate-y-1/2">
                    <Search className="w-5 h-5 text-slate-400" />
                </div>
                <input
                    type="text"
                    placeholder="Search cities by name..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-14 pr-6 h-16 rounded-[24px] border border-slate-200 bg-white text-slate-900 font-medium focus:outline-none focus:ring-4 focus:ring-red-500/5 placeholder:text-slate-400 text-base shadow-sm transition-all"
                />
            </div>

            {/* Cities Table */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden text-sans">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-widest text-slate-400">City</th>
                                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-widest text-slate-400">State/Region</th>
                                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-widest text-slate-400">Country</th>
                                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-widest text-slate-400">Popular</th>
                                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence mode='popLayout'>
                                {loading && cities.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-24 text-center">
                                            <Loader2 className="w-10 h-10 animate-spin text-red-600 mx-auto" />
                                        </td>
                                    </tr>
                                ) : cities.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-24 text-center">
                                            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-sans">
                                                <MapPin className="w-10 h-10 text-slate-200" />
                                            </div>
                                            <h3 className="text-xl font-black text-slate-900 text-sans">No cities found</h3>
                                            <p className="text-slate-400 font-medium mt-2 text-sans">Import some cities to get started.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    cities.map((city, idx) => (
                                        <motion.tr
                                            key={city.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ delay: idx * 0.03 }}
                                            className="group border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors"
                                        >
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shadow-inner overflow-hidden flex-shrink-0">
                                                        {city.imageUrl ? (
                                                            <img src={city.imageUrl} className="w-full h-full object-cover" alt="" />
                                                        ) : (
                                                            <Building2 className="w-6 h-6" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-slate-900 text-base">{city.name}</p>
                                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-tight tracking-wider">{city.slug}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="text-sm text-slate-600 font-bold">{city.state || 'N/A'}</span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2">
                                                    <Globe className="w-4 h-4 text-slate-300" />
                                                    <span className="text-sm text-slate-600 font-bold">{city.country}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                {(city as any).isPopular ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-100 text-[10px] font-black uppercase tracking-wider">
                                                        <Star className="w-3 h-3 fill-current" /> Popular
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-slate-300 font-bold">—</span>
                                                )}
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <button
                                                    onClick={() => { setSelectedCity(city); setIsDeleteModalOpen(true); }}
                                                    className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-600 hover:border-red-600 transition-all shadow-sm group-hover:scale-105 active:scale-95"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-8 py-6 bg-slate-50/30 border-t border-slate-100 flex items-center justify-between">
                        <p className="text-sm text-slate-500 font-medium">
                            Showing <span className="text-slate-900 font-bold">{(page - 1) * limit + 1}</span> to <span className="text-slate-900 font-bold">{Math.min(page * limit, total)}</span> of <span className="text-slate-900 font-bold">{total}</span> cities
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-all font-sans"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-all font-sans"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Import City Modal */}
            <AnimatePresence>
                {isImportModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl relative overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600">
                                        <MapIcon className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Import New City</h2>
                                </div>
                                <button onClick={() => { setIsImportModalOpen(false); setSelectedPlace(null); }} className="text-slate-400 hover:text-slate-900 transition-colors">
                                    <XCircle className="w-8 h-8" />
                                </button>
                            </div>

                            <form onSubmit={handleImport} className="space-y-6">
                                {/* Google Places Search */}
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Search City (powered by Google)</label>
                                    <div className="relative">
                                        <input
                                            ref={autocompleteInputRef}
                                            required
                                            type="text"
                                            placeholder="Enter city name..."
                                            className="w-full h-16 pl-14 pr-6 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-red-500/5 font-bold transition-all text-base"
                                        />
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2">
                                            <Search className="w-5 h-5 text-slate-400" />
                                        </div>
                                    </div>
                                    {selectedPlace && (
                                        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3">
                                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                            <div>
                                                <p className="text-sm font-black text-emerald-900 leading-tight">Selected City Detected</p>
                                                <p className="text-xs font-bold text-emerald-600">{selectedPlace.formatted_address}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Display Order</label>
                                        <input
                                            type="number"
                                            value={importData.displayOrder}
                                            onChange={e => setImportData({ ...importData, displayOrder: Number(e.target.value) })}
                                            className="w-full h-14 px-5 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-red-500/5 font-bold transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Promote</label>
                                        <button
                                            type="button"
                                            onClick={() => setImportData({ ...importData, isPopular: !importData.isPopular })}
                                            className={`w-full h-14 px-5 rounded-2xl border flex items-center justify-center gap-2 font-bold transition-all ${importData.isPopular 
                                                ? 'bg-amber-50 border-amber-200 text-amber-600' 
                                                : 'bg-slate-50 border-slate-200 text-slate-400'}`}
                                        >
                                            <Star className={`w-4 h-4 ${importData.isPopular ? 'fill-current' : ''}`} />
                                            {importData.isPopular ? 'Popular City' : 'Mark Popular'}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={!selectedPlace || !!actionLoading}
                                    className="w-full h-16 bg-slate-900 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-slate-900/10"
                                >
                                    {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Navigation className="w-5 h-5" />}
                                    Import City to Database
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Delete Modal */}
            <AnimatePresence>
                {isDeleteModalOpen && selectedCity && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl text-center"
                        >
                            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                <XCircle className="w-10 h-10" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Remove City?</h3>
                            <p className="text-slate-500 font-medium mt-3 leading-relaxed">
                                Are you sure you want to remove <span className="text-slate-900 font-black">"{selectedCity.name}"</span>? 
                                Businesses listed in this city may become harder to find.
                            </p>
                            <div className="flex gap-4 mt-10">
                                <button
                                    onClick={() => { setIsDeleteModalOpen(false); setSelectedCity(null); }}
                                    className="flex-1 h-14 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all active:scale-95"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={!!actionLoading}
                                    className="flex-1 h-14 bg-red-600 text-white rounded-2xl font-black hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 active:scale-95 disabled:opacity-50"
                                >
                                    {actionLoading === 'delete' ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Yes, Delete'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
