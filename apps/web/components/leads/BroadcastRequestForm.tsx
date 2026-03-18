'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Category, City } from '../../types/api';
import CategorySearchSelect from '../CategorySearchSelect';
import CitySearchSelect from '../CitySearchSelect';
import { MapPin, Megaphone, Loader2, Navigation } from 'lucide-react';

interface BroadcastRequestFormProps {
    onSuccess?: () => void;
}

export default function BroadcastRequestForm({ onSuccess }: BroadcastRequestFormProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [gettingLocation, setGettingLocation] = useState(false);

    const [categories, setCategories] = useState<Category[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        categoryId: '',
        city: '',
        budget: '',
        latitude: null as number | null,
        longitude: null as number | null,
    });

    useEffect(() => {
        const loadSearchData = async () => {
            try {
                const [catsData, citiesData] = await Promise.all([
                    api.categories.getAll(),
                    api.cities.getAll()
                ]);
                setCategories(catsData || []);
                setCities(citiesData || []);
            } catch (err) {
                console.error('Failed to load form data', err);
            }
        };
        loadSearchData();
    }, []);

    const detectLocation = () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            return;
        }

        setGettingLocation(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setFormData(prev => ({
                    ...prev,
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                }));
                setGettingLocation(false);
            },
            (err) => {
                console.error('Geolocation error:', err);
                setError('Could not detect location. Please select your city manually.');
                setGettingLocation(false);
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await api.broadcasts.create({
                ...formData,
                budget: formData.budget ? parseFloat(formData.budget) : undefined,
                latitude: formData.latitude ?? undefined,
                longitude: formData.longitude ?? undefined,
            });
            setSuccess(true);
            setFormData({
                title: '',
                description: '',
                categoryId: '',
                city: '',
                budget: '',
                latitude: null,
                longitude: null,
            });
            if (onSuccess) onSuccess();
        } catch (err: any) {
            setError(err.message || 'Failed to broadcast request');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="bg-emerald-50 p-8 rounded-3xl border border-emerald-100 text-center animate-in fade-in zoom-in duration-300">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                    <Megaphone className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Broadcast Sent!</h3>
                <p className="text-slate-500 font-medium mb-8 max-w-sm mx-auto">Your request has been broadcasted to nearby experts. You will be notified as soon as they respond.</p>
                <button
                    onClick={() => setSuccess(false)}
                    className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
                >
                    New Broadcast
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8 bg-white p-2">
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-black text-slate-700 mb-3 uppercase tracking-widest text-[10px]">What do you need?</label>
                    <div className="relative group">
                        <input
                            type="text"
                            required
                            placeholder="e.g. Urgent Plumber, Electrician near me"
                            className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none transition-all font-bold text-slate-900 placeholder:text-slate-300"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white rounded-lg shadow-sm opacity-0 group-focus-within:opacity-100 transition-opacity">
                            <Megaphone className="w-4 h-4 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-black text-slate-700 mb-3 uppercase tracking-widest text-[10px]">Service Category</label>
                        <CategorySearchSelect
                            categories={categories}
                            value={formData.categoryId}
                            onChange={(id) => setFormData({ ...formData, categoryId: id })}
                        />
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="block text-sm font-black text-slate-700 uppercase tracking-widest text-[10px]">Your Location</label>
                            <button
                                type="button"
                                onClick={detectLocation}
                                disabled={gettingLocation}
                                className="flex items-center gap-1.5 text-[10px] font-black text-blue-600 hover:text-blue-700 transition-colors"
                            >
                                {gettingLocation ? <Loader2 className="w-3 h-3 animate-spin" /> : <Navigation className="w-3 h-3" />}
                                {formData.latitude ? 'Location Detected' : 'Detect My Location'}
                            </button>
                        </div>
                        <CitySearchSelect
                            cities={cities}
                            value={formData.city}
                            onChange={(cityName) => setFormData({ ...formData, city: cityName })}
                        />
                        {formData.latitude && (
                            <p className="mt-2 text-[10px] text-emerald-600 font-black flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> GPS Coordinates Attached
                            </p>
                        )}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-black text-slate-700 mb-3 uppercase tracking-widest text-[10px]">Tell us more</label>
                    <textarea
                        required
                        rows={4}
                        placeholder="Describe your issue and requirements. The more detail, the better experts can help you..."
                        className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none transition-all font-bold text-slate-900 placeholder:text-slate-300 resize-none"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-black text-slate-700 mb-3 uppercase tracking-widest text-[10px]">Max Budget (Optional)</label>
                    <div className="relative group">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 font-black text-xs">PKR</span>
                        <input
                            type="number"
                            placeholder="0.00"
                            className="w-full pl-14 pr-5 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none transition-all font-black text-slate-900 placeholder:text-slate-200"
                            value={formData.budget}
                            onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                        />
                    </div>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-[11px] font-black border border-red-100 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" />
                    {error}
                </div>
            )}

            <button
                type="submit"
                disabled={loading || gettingLocation}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center space-x-3 disabled:opacity-50 active:scale-[0.98]"
            >
                {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                    <>
                        <span className="uppercase tracking-widest text-sm">Send Broadcast</span>
                        <Megaphone className="w-5 h-5" />
                    </>
                )}
            </button>
        </form>
    );
}
