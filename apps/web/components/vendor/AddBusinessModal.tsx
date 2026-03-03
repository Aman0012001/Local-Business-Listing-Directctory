"use client";

import React, { useState, useEffect } from 'react';
import { X, Loader2, Store, MapPin, Phone, TextQuote, Layers, Sparkles, Plus, Check } from 'lucide-react';
import { api, getImageUrl } from '../../lib/api';

import { Category, Business, City } from '../../types/api';
import { motion, AnimatePresence } from 'framer-motion';

interface AddBusinessModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    business?: Business | null;
}

export default function AddBusinessModal({ isOpen, onClose, onSuccess, business }: AddBusinessModalProps) {
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        categoryId: '',
        description: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        latitude: 40.7128,
        longitude: -74.0060,
        coverImageUrl: '',
        amenityIds: [] as string[]
    });

    const [amenities, setAmenities] = useState<any[]>([]);
    const [amenitiesLoading, setAmenitiesLoading] = useState(false);
    const [showAddAmenity, setShowAddAmenity] = useState(false);
    const [newAmenityName, setNewAmenityName] = useState('');
    const [creatingAmenity, setCreatingAmenity] = useState(false);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [cats, cityList, amenityList] = await Promise.all([
                    api.categories.getAll(),
                    api.cities.getAll(),
                    api.listings.getAmenities()
                ]);
                setCategories(cats);
                setCities(cityList);
                setAmenities(amenityList || []);

                if (!business) {
                    setFormData(prev => ({
                        ...prev,
                        categoryId: cats[0]?.id || '',
                        city: cityList[0]?.name || ''
                    }));
                }
            } catch (err) {
                console.error('Failed to fetch initial data:', err);
            }
        };
        if (isOpen) fetchInitialData();
    }, [isOpen, business]);

    useEffect(() => {
        if (business && isOpen) {
            setFormData({
                title: business?.title || '',
                categoryId: business.category?.id || '',
                description: business.description || '',
                phone: business.phone || '',
                address: business.address || '',
                city: business.city || '',
                state: business.state || '',
                pincode: business.pincode || '',
                latitude: Number(business.latitude) || 40.7128,
                longitude: Number(business.longitude) || -74.0060,
                coverImageUrl: business.coverImageUrl || '',
                amenityIds: business.businessAmenities?.map(ba => ba.amenity.id) || []
            });
        } else if (!business && isOpen && cities.length > 0 && categories.length > 0) {
            setFormData(prev => ({
                ...prev,
                categoryId: categories[0]?.id || '',
                city: cities[0]?.name || ''
            }));
        }
    }, [business, isOpen, categories, cities]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            if (business) {
                await api.listings.update(business.id, formData);
            } else {
                await api.listings.create(formData);
            }
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || `Failed to ${business ? 'update' : 'create'} listing`);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'latitude' || name === 'longitude' ? parseFloat(value) : value
        }));
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        setError(null);
        try {
            const response = await api.listings.uploadImage(file);
            setFormData(prev => ({ ...prev, coverImageUrl: response.url }));
        } catch (err: any) {
            setError(err.message || 'Failed to upload image');
        } finally {
            setLoading(false);
        }
    };

    const toggleAmenity = (id: string) => {
        setFormData(prev => {
            const exists = prev.amenityIds.includes(id);
            if (exists) {
                return { ...prev, amenityIds: prev.amenityIds.filter(a => a !== id) };
            }
            return { ...prev, amenityIds: [...prev.amenityIds, id] };
        });
    };

    const handleAddAmenity = async () => {
        if (!newAmenityName.trim()) return;
        setCreatingAmenity(true);
        try {
            const res = await api.listings.createAmenity({ name: newAmenityName });
            setAmenities(prev => [...prev, res]);
            toggleAmenity(res.id);
            setNewAmenityName('');
            setShowAddAmenity(false);
        } catch (err: any) {
            setError(err.message || 'Failed to create amenity');
        } finally {
            setCreatingAmenity(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="bg-white rounded-[48px] w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-premium relative flex flex-col border border-white/20"
                    >
                        {/* Header */}
                        <div className="p-10 pb-6 flex items-center justify-between relative overflow-hidden">
                            <div className="relative z-10">
                                <h2 className="text-3xl font-black text-slate-900 mb-2">{business ? 'Edit' : 'Add New'} Listing</h2>
                                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">{(business as any)?.title || 'Fill in the details below'}</p>
                                <p className="text-slate-400 font-bold text-sm uppercase tracking-widest flex items-center gap-2">
                                    <span className="w-8 h-[2px] bg-orange-500 rounded-full" />
                                    Property details & Location
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="relative z-10 p-3 hover:bg-slate-50 rounded-2xl transition-all group active:scale-95"
                            >
                                <X className="w-6 h-6 text-slate-400 group-hover:text-slate-900 transition-colors" />
                            </button>

                            {/* Decorative Background Element */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl -mr-32 -mt-32" />
                        </div>

                        {/* Form Body */}
                        <form onSubmit={handleSubmit} className="p-10 pt-4 overflow-y-auto space-y-8 custom-scrollbar">
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="p-5 bg-red-50 border border-red-100 rounded-3xl text-red-600 text-sm font-black flex items-center gap-3 shadow-sm"
                                >
                                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                                        <X className="w-4 h-4" />
                                    </div>
                                    {error}
                                </motion.div>
                            )}

                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                                        <Store className="w-3.5 h-3.5 text-orange-500" />
                                        Business Title
                                    </label>
                                    <input
                                        required
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        placeholder="e.g. The Artisanal Coffee"
                                        className="input-premium font-bold"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                                        Cover Image
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="input-premium font-bold file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                                    />
                                    {formData.coverImageUrl && (
                                        <img src={getImageUrl(formData.coverImageUrl) || ""} alt="Cover Preview" className="w-full h-32 object-cover rounded-xl mt-2" />
                                    )}
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                                        <Layers className="w-3.5 h-3.5 text-orange-500" />
                                        Business Category
                                    </label>
                                    <div className="relative">
                                        <select
                                            required
                                            name="categoryId"
                                            value={formData.categoryId}
                                            onChange={handleChange}
                                            className="input-premium appearance-none font-bold cursor-pointer pr-12"
                                        >
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                                    <TextQuote className="w-3.5 h-3.5 text-orange-500" />
                                    Short Description
                                </label>
                                <textarea
                                    required
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={4}
                                    placeholder="Briefly describe what makes your business unique..."
                                    className="input-premium resize-none font-medium leading-relaxed"
                                />
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                                        <Phone className="w-3.5 h-3.5 text-orange-500" />
                                        Contact Number
                                    </label>
                                    <input
                                        required
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="+60..."
                                        className="input-premium font-bold"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                                        <MapPin className="w-3.5 h-3.5 text-orange-500" />
                                        Pincode & Coordinates
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            required
                                            name="pincode"
                                            value={formData.pincode}
                                            onChange={handleChange}
                                            placeholder="50000"
                                            className="input-premium font-bold flex-[2]"
                                        />
                                        <input
                                            type="number"
                                            step="any"
                                            name="latitude"
                                            value={formData.latitude}
                                            onChange={handleChange}
                                            placeholder="Lat"
                                            className="input-premium font-bold flex-1"
                                        />
                                        <input
                                            type="number"
                                            step="any"
                                            name="longitude"
                                            value={formData.longitude}
                                            onChange={handleChange}
                                            placeholder="Long"
                                            className="input-premium font-bold flex-1"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                                    <MapPin className="w-3.5 h-3.5 text-orange-500" />
                                    Street Address / Area
                                </label>
                                <div className="relative">
                                    <select
                                        required
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        className="input-premium appearance-none font-bold cursor-pointer pr-12"
                                    >
                                        <option value="">Select Area</option>
                                        <option value="DHA Phase 6">DHA Phase 6</option>
                                        <option value="DHA Phase 5">DHA Phase 5</option>
                                        <option value="Gulberg III">Gulberg III</option>
                                        <option value="Gulberg II">Gulberg II</option>
                                        <option value="Model Town">Model Town</option>
                                        <option value="Johar Town">Johar Town</option>
                                        <option value="Bahria Town">Bahria Town</option>
                                        <option value="Clifton Block 5">Clifton Block 5</option>
                                        <option value="F-6 Markaz">F-6 Markaz</option>
                                        <option value="F-7 Markaz">F-7 Markaz</option>
                                        <option value="Blue Area">Blue Area</option>
                                        <option value="Main Street">Main Street</option>
                                        <option value="Downtown District">Downtown District</option>
                                        <option value="Others">Others</option>
                                    </select>
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">City</label>
                                    <div className="relative">
                                        <select
                                            required
                                            name="city"
                                            value={formData.city}
                                            onChange={handleChange}
                                            className="input-premium appearance-none font-bold cursor-pointer pr-12"
                                        >
                                            {cities.map(city => (
                                                <option key={city.id} value={city.name}>{city.name}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">State</label>
                                    <input
                                        required
                                        name="state"
                                        value={formData.state}
                                        onChange={handleChange}
                                        className="input-premium font-bold"
                                    />
                                </div>
                            </div>

                            {/* Business Amenities Section */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                                        <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                                        Business Amenities
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setShowAddAmenity(!showAddAmenity)}
                                        className="text-[10px] font-black uppercase tracking-widest text-[#FF7A30] hover:text-[#E86920] transition-colors flex items-center gap-1"
                                    >
                                        <Plus className="w-2.5 h-2.5" /> Add Option
                                    </button>
                                </div>

                                {showAddAmenity && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-4 bg-orange-50/50 rounded-3xl border border-orange-100 flex gap-2"
                                    >
                                        <input
                                            type="text"
                                            placeholder="New amenity name..."
                                            value={newAmenityName}
                                            onChange={(e) => setNewAmenityName(e.target.value)}
                                            className="flex-1 px-4 py-2 bg-white border border-orange-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAmenity())}
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddAmenity}
                                            disabled={creatingAmenity || !newAmenityName.trim()}
                                            className="px-4 py-2 bg-[#FF7A30] text-white rounded-2xl text-xs font-bold disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {creatingAmenity ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add'}
                                        </button>
                                    </motion.div>
                                )}

                                <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                    {amenities.map((amenity) => {
                                        const isSelected = formData.amenityIds.includes(amenity.id);
                                        return (
                                            <button
                                                key={amenity.id}
                                                type="button"
                                                onClick={() => toggleAmenity(amenity.id)}
                                                className={`flex items-center gap-2.5 p-2.5 rounded-2xl border transition-all text-left ${isSelected
                                                    ? 'bg-orange-50 border-orange-200 text-orange-700'
                                                    : 'bg-slate-50 border-slate-100 text-slate-600 hover:border-slate-200'
                                                    }`}
                                            >
                                                <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${isSelected ? 'bg-orange-500 text-white' : 'bg-white text-slate-400'
                                                    }`}>
                                                    {isSelected ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                                                </div>
                                                <span className="text-xs font-bold truncate">{amenity.name}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="pt-8 mb-4">
                                <button
                                    disabled={loading}
                                    type="submit"
                                    className="w-full py-5 bg-slate-900 text-white rounded-[28px] font-black text-lg shadow-2xl hover:bg-orange-600 transition-all duration-500 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 group"
                                >
                                    {loading ? (
                                        <Loader2 className="w-6 h-6 animate-spin text-white" />
                                    ) : (
                                        <>
                                            Publish Business Listing
                                            <motion.span
                                                animate={{ x: [0, 5, 0] }}
                                                transition={{ repeat: Infinity, duration: 1.5 }}
                                            >
                                                <Store className="w-5 h-5 group-hover:text-white" />
                                            </motion.span>
                                        </>
                                    )}
                                </button>
                                <p className="text-center text-slate-400 text-[10px] font-bold mt-4 uppercase tracking-[0.2em]">
                                    By listing, you agree to our <span className="text-slate-900 underline cursor-pointer">Terms of Service</span>
                                </p>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

