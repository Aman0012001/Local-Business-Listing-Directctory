"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Loader2, Store, MapPin, Phone, TextQuote, Layers,
    ArrowLeft, CheckCircle, ImagePlus, Building2, Tag,
    FileText, Navigation, Sparkles, X, Images, Check, Plus
} from 'lucide-react';
import { api, getImageUrl } from '../../../lib/api';
import { Category, City } from '../../../types/api';
import { motion } from 'framer-motion';

const steps = [
    { id: 1, label: 'Business Info', icon: Building2 },
    { id: 2, label: 'Location', icon: Navigation },
    { id: 3, label: 'Details', icon: FileText },
];

const inputClass =
    "w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all placeholder:text-slate-400";

const selectClass =
    "w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all appearance-none cursor-pointer pr-10";

const labelClass = "block text-xs font-black uppercase tracking-widest text-slate-400 mb-2";

export default function AddListingPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [catsLoading, setCatsLoading] = useState(true);
    const [catsError, setCatsError] = useState<string | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [activeStep, setActiveStep] = useState(1);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [countryCode, setCountryCode] = useState('+92');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
    const [galleryUploading, setGalleryUploading] = useState(false);
    const [amenities, setAmenities] = useState<any[]>([]);
    const [amenitiesLoading, setAmenitiesLoading] = useState(true);
    const [showAddAmenity, setShowAddAmenity] = useState(false);
    const [newAmenityName, setNewAmenityName] = useState('');
    const [creatingAmenity, setCreatingAmenity] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        categoryId: '',
        description: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        latitude: 30.3753,
        longitude: 69.3451,
        coverImageUrl: '',
        images: [] as string[],
        hasOffer: false,
        offerTitle: '',
        offerDescription: '',
        offerBadge: '',
        offerExpiresAt: '',
        offerBannerUrl: '',
        country: 'Pakistan',
        amenityIds: [] as string[],
    });

    useEffect(() => {
        const fetchInitialData = async () => {
            setCatsLoading(true);
            setCatsError(null);
            try {
                const [cats, cityList, amenityList] = await Promise.all([
                    api.categories.getAll(),
                    api.cities.getAll(),
                    api.listings.getAmenities()
                ]);
                // Normalise in case API wraps response
                const catArray = Array.isArray(cats) ? cats : (cats as any)?.data ?? [];
                const cityArray = Array.isArray(cityList) ? cityList : (cityList as any)?.data ?? [];
                setCategories(catArray);
                setCities(cityArray);
                setAmenities(amenityList || []);
                setFormData(prev => ({
                    ...prev,
                    categoryId: catArray[0]?.id || '',
                    city: cityArray[0]?.name || ''
                }));
            } catch (err: any) {
                console.error('Failed to fetch initial data:', err);
                setCatsError(err.message || 'Failed to load categories from server');
            } finally {
                setCatsLoading(false);
                setAmenitiesLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await api.listings.create(formData);
            setSuccess(true);
            setTimeout(() => router.push('/vendor/listings'), 2000);
        } catch (err: any) {
            setError(err.message || 'Failed to create listing');
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
        setImagePreview(URL.createObjectURL(file));
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

    const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;
        const remaining = 8 - galleryPreviews.length;
        const toUpload = files.slice(0, remaining);
        setGalleryUploading(true);
        setError(null);
        try {
            const localPreviews = toUpload.map(f => URL.createObjectURL(f));
            setGalleryPreviews(prev => [...prev, ...localPreviews]);
            const uploaded: string[] = [];
            for (const file of toUpload) {
                const res = await api.listings.uploadImage(file);
                uploaded.push(res.url);
            }
            setFormData(prev => ({ ...prev, images: [...prev.images, ...uploaded] }));
            // Replace local previews with real URLs
            setGalleryPreviews(prev => {
                const without = prev.filter(p => !p.startsWith('blob:'));
                return [...without, ...uploaded];
            });
        } catch (err: any) {
            setError(err.message || 'Failed to upload gallery image');
        } finally {
            setGalleryUploading(false);
        }
    };

    const removeGalleryImage = (index: number) => {
        setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
        setFormData(prev => ({ ...prev, images: prev.images.filter((_: string, i: number) => i !== index) }));
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

    if (success) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6">
                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    className="w-24 h-24 rounded-full bg-green-50 border-4 border-green-200 flex items-center justify-center"
                >
                    <CheckCircle className="w-12 h-12 text-green-500" />
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-center"
                >
                    <h2 className="text-3xl font-black text-slate-900 mb-2">Listing Published! 🎉</h2>
                    <p className="text-slate-500 font-medium">Your business is now live. Redirecting...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto pb-16">
            {/* Hero Header */}
            <div className="relative mb-10 rounded-3xl overflow-hidden bg-gradient-to-br from-[#0B2244] via-[#0D2E61] to-[#1a3a70] p-8 md:p-10 shadow-2xl">
                {/* Decorative blobs */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/10 rounded-full blur-2xl -ml-16 -mb-16 pointer-events-none" />

                <div className="relative flex items-center gap-4 mb-6">
                    {/* <button
                        onClick={() => router.back()}
                        className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-colors border border-white/10"
                    >
                        <ArrowLeft className="w-5 h-5 text-white" />
                    </button> */}
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            {/* <Sparkles className="w-4 h-4 text-orange-400" /> */}
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Add Your Business</h1>
                    </div>
                </div>

                {/* Step Indicator */}
                <div className="relative flex items-center gap-0">
                    {steps.map((step, idx) => {
                        const Icon = step.icon;
                        const isActive = activeStep === step.id;
                        const isDone = activeStep > step.id;
                        return (
                            <React.Fragment key={step.id}>
                                <button
                                    type="button"
                                    onClick={() => setActiveStep(step.id)}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all font-bold text-sm ${isActive
                                        ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                                        : isDone
                                            ? 'bg-white/20 text-white'
                                            : 'bg-white/5 text-white/40'
                                        }`}
                                >
                                    {isDone
                                        ? <CheckCircle className="w-4 h-4" />
                                        : <Icon className="w-4 h-4" />
                                    }
                                    <span className="hidden md:inline">{step.label}</span>
                                </button>
                                {idx < steps.length - 1 && (
                                    <div className={`h-[2px] flex-1 mx-1 rounded-full transition-all ${isDone ? 'bg-orange-400' : 'bg-white/10'}`} />
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>

            {/* Error Banner */}
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm font-bold flex items-center gap-3"
                >
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 text-red-500 font-black">!</div>
                    {error}
                </motion.div>
            )}

            <form onSubmit={handleSubmit}>
                {/* ── STEP 1: Business Info ── */}
                {activeStep === 1 && (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        {/* Cover Image Upload */}
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                                    <ImagePlus className="w-4 h-4 text-orange-500" />
                                </div>
                                <h3 className="font-black text-slate-900">Cover Image</h3>
                            </div>
                            <div className="p-6">
                                <label className="block cursor-pointer group">
                                    <div className={`relative rounded-2xl border-2 border-dashed transition-all overflow-hidden ${imagePreview ? 'border-orange-300' : 'border-slate-200 hover:border-orange-300 bg-slate-50 hover:bg-orange-50/30'}`}>
                                        {imagePreview ? (
                                            <img src={imagePreview} alt="Preview" className="w-full h-56 object-cover" />
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-14 gap-3 text-slate-400 group-hover:text-orange-400 transition-colors">
                                                <ImagePlus className="w-10 h-10" />
                                                <div className="text-center">
                                                    <p className="font-black text-sm">Click to upload cover image</p>
                                                    <p className="text-xs mt-0.5">PNG, JPG up to 5MB</p>
                                                </div>
                                            </div>
                                        )}
                                        {imagePreview && (
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="text-white font-black text-sm bg-orange-500 px-4 py-2 rounded-xl">Change Image</span>
                                            </div>
                                        )}
                                    </div>
                                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                                </label>
                            </div>
                        </div>

                        {/* Business Details */}
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                                    <Store className="w-4 h-4 text-blue-500" />
                                </div>
                                <h3 className="font-black text-slate-900">Business Details</h3>
                            </div>
                            <div className="p-6 space-y-5">
                                <div>
                                    <label className={labelClass}>
                                        Business Title <span className="text-orange-500">*</span>
                                    </label>
                                    <input
                                        required
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        placeholder="e.g. The Artisanal Coffee"
                                        className={inputClass}
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>
                                        <Tag className="w-3 h-3 inline mr-1.5 text-orange-500" />
                                        Category <span className="text-orange-500">*</span>
                                    </label>
                                    <div className="relative">
                                        {catsLoading ? (
                                            <div className="flex items-center gap-2 px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 text-sm">
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Loading categories...
                                            </div>
                                        ) : catsError ? (
                                            <div className="px-4 py-3.5 bg-red-50 border border-red-200 rounded-xl text-red-500 text-sm font-semibold">
                                                ⚠ {catsError}
                                            </div>
                                        ) : (
                                            <>
                                                <select
                                                    required
                                                    name="categoryId"
                                                    value={formData.categoryId}
                                                    onChange={handleChange}
                                                    className={selectClass}
                                                >
                                                    <option value="" disabled>-- Select Category --</option>
                                                    {categories.map(cat => (
                                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                    ))}
                                                    <option value="other">Other</option>
                                                </select>
                                                <Layers className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className={labelClass}>
                                        <Phone className="w-3 h-3 inline mr-1.5 text-orange-500" />
                                        Contact Number <span className="text-orange-500">*</span>
                                    </label>
                                    <div className="flex gap-2">
                                        {/* Country Code */}
                                        <div className="relative flex-shrink-0">
                                            <select
                                                value={countryCode}
                                                onChange={e => {
                                                    setCountryCode(e.target.value);
                                                    setFormData(prev => ({ ...prev, phone: e.target.value + phoneNumber }));
                                                }}
                                                className="h-full px-3 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 appearance-none cursor-pointer pr-8 min-w-[100px]"
                                            >
                                                {[
                                                    { code: '+93', label: '🇦🇫 AF +93' },
                                                    { code: '+355', label: '🇦🇱 AL +355' },
                                                    { code: '+213', label: '🇩🇿 DZ +213' },
                                                    { code: '+376', label: '🇦🇩 AD +376' },
                                                    { code: '+244', label: '🇦🇴 AO +244' },
                                                    { code: '+54', label: '🇦🇷 AR +54' },
                                                    { code: '+374', label: '🇦🇲 AM +374' },
                                                    { code: '+61', label: '🇦🇺 AU +61' },
                                                    { code: '+43', label: '🇦🇹 AT +43' },
                                                    { code: '+994', label: '🇦🇿 AZ +994' },
                                                    { code: '+973', label: '🇧🇭 BH +973' },
                                                    { code: '+880', label: '🇧🇩 BD +880' },
                                                    { code: '+32', label: '🇧🇪 BE +32' },
                                                    { code: '+55', label: '🇧🇷 BR +55' },
                                                    { code: '+359', label: '🇧🇬 BG +359' },
                                                    { code: '+1', label: '🇨🇦 CA +1' },
                                                    { code: '+86', label: '🇨🇳 CN +86' },
                                                    { code: '+57', label: '🇨🇴 CO +57' },
                                                    { code: '+385', label: '🇭🇷 HR +385' },
                                                    { code: '+357', label: '🇨🇾 CY +357' },
                                                    { code: '+420', label: '🇨🇿 CZ +420' },
                                                    { code: '+45', label: '🇩🇰 DK +45' },
                                                    { code: '+20', label: '🇪🇬 EG +20' },
                                                    { code: '+358', label: '🇫🇮 FI +358' },
                                                    { code: '+33', label: '🇫🇷 FR +33' },
                                                    { code: '+995', label: '🇬🇪 GE +995' },
                                                    { code: '+49', label: '🇩🇪 DE +49' },
                                                    { code: '+30', label: '🇬🇷 GR +30' },
                                                    { code: '+852', label: '🇭🇰 HK +852' },
                                                    { code: '+36', label: '🇭🇺 HU +36' },
                                                    { code: '+91', label: '🇮🇳 IN +91' },
                                                    { code: '+62', label: '🇮🇩 ID +62' },
                                                    { code: '+98', label: '🇮🇷 IR +98' },
                                                    { code: '+964', label: '🇮🇶 IQ +964' },
                                                    { code: '+353', label: '🇮🇪 IE +353' },
                                                    { code: '+972', label: '🇮🇱 IL +972' },
                                                    { code: '+39', label: '🇮🇹 IT +39' },
                                                    { code: '+81', label: '🇯🇵 JP +81' },
                                                    { code: '+962', label: '🇯🇴 JO +962' },
                                                    { code: '+7', label: '🇰🇿 KZ +7' },
                                                    { code: '+254', label: '🇰🇪 KE +254' },
                                                    { code: '+82', label: '🇰🇷 KR +82' },
                                                    { code: '+965', label: '🇰🇼 KW +965' },
                                                    { code: '+996', label: '🇰🇬 KG +996' },
                                                    { code: '+856', label: '🇱🇦 LA +856' },
                                                    { code: '+961', label: '🇱🇧 LB +961' },
                                                    { code: '+60', label: '🇲🇾 MY +60' },
                                                    { code: '+960', label: '🇲🇻 MV +960' },
                                                    { code: '+223', label: '🇲🇱 ML +223' },
                                                    { code: '+356', label: '🇲🇹 MT +356' },
                                                    { code: '+52', label: '🇲🇽 MX +52' },
                                                    { code: '+373', label: '🇲🇩 MD +373' },
                                                    { code: '+976', label: '🇲🇳 MN +976' },
                                                    { code: '+212', label: '🇲🇦 MA +212' },
                                                    { code: '+258', label: '🇲🇿 MZ +258' },
                                                    { code: '+977', label: '🇳🇵 NP +977' },
                                                    { code: '+31', label: '🇳🇱 NL +31' },
                                                    { code: '+64', label: '🇳🇿 NZ +64' },
                                                    { code: '+234', label: '🇳🇬 NG +234' },
                                                    { code: '+47', label: '🇳🇴 NO +47' },
                                                    { code: '+968', label: '🇴🇲 OM +968' },
                                                    { code: '+92', label: '🇵🇰 PK +92' },
                                                    { code: '+507', label: '🇵🇦 PA +507' },
                                                    { code: '+63', label: '🇵🇭 PH +63' },
                                                    { code: '+48', label: '🇵🇱 PL +48' },
                                                    { code: '+351', label: '🇵🇹 PT +351' },
                                                    { code: '+974', label: '🇶🇦 QA +974' },
                                                    { code: '+40', label: '🇷🇴 RO +40' },
                                                    { code: '+7', label: '🇷🇺 RU +7' },
                                                    { code: '+966', label: '🇸🇦 SA +966' },
                                                    { code: '+65', label: '🇸🇬 SG +65' },
                                                    { code: '+27', label: '🇿🇦 ZA +27' },
                                                    { code: '+34', label: '🇪🇸 ES +34' },
                                                    { code: '+94', label: '🇱🇰 LK +94' },
                                                    { code: '+46', label: '🇸🇪 SE +46' },
                                                    { code: '+41', label: '🇨🇭 CH +41' },
                                                    { code: '+886', label: '🇹🇼 TW +886' },
                                                    { code: '+255', label: '🇹🇿 TZ +255' },
                                                    { code: '+66', label: '🇹🇭 TH +66' },
                                                    { code: '+216', label: '🇹🇳 TN +216' },
                                                    { code: '+90', label: '🇹🇷 TR +90' },
                                                    { code: '+380', label: '🇺🇦 UA +380' },
                                                    { code: '+971', label: '🇦🇪 AE +971' },
                                                    { code: '+44', label: '🇬🇧 GB +44' },
                                                    { code: '+1', label: '🇺🇸 US +1' },
                                                    { code: '+998', label: '🇺🇿 UZ +998' },
                                                    { code: '+58', label: '🇻🇪 VE +58' },
                                                    { code: '+84', label: '🇻🇳 VN +84' },
                                                    { code: '+967', label: '🇾🇪 YE +967' },
                                                    { code: '+263', label: '🇿🇼 ZW +263' },
                                                ].map(c => (
                                                    <option key={c.code + c.label} value={c.code}>{c.label}</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                                                <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>

                                        {/* Number Input */}
                                        <input
                                            required
                                            type="tel"
                                            inputMode="numeric"
                                            maxLength={10}
                                            pattern="[0-9]{10}"
                                            value={phoneNumber}
                                            onChange={e => {
                                                const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                                                setPhoneNumber(digits);
                                                setFormData(prev => ({ ...prev, phone: countryCode + digits }));
                                            }}
                                            placeholder="3001234567"
                                            className={`${inputClass} flex-1`}
                                        />
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1.5 font-medium">
                                        {phoneNumber.length}/10 digits &nbsp;·&nbsp; Full number: <span className="text-slate-600 font-bold">{countryCode}{phoneNumber || '—'}</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Media Gallery */}
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                                        <Images className="w-4 h-4 text-purple-500" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-slate-900">Media Gallery</h3>
                                        <p className="text-[11px] text-slate-400 font-medium">Up to 8 photos · PNG, JPG</p>
                                    </div>
                                </div>
                                <span className="text-xs font-black text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">{galleryPreviews.length}/8</span>
                            </div>
                            <div className="p-6">
                                {/* Preview Grid */}
                                {galleryPreviews.length > 0 && (
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                                        {galleryPreviews.map((src, i) => (
                                            <div key={i} className="relative group rounded-xl overflow-hidden aspect-square bg-slate-100">
                                                <img src={src} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeGalleryImage(i)}
                                                        className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white hover:bg-red-600 transition-colors shadow-lg"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                {src.startsWith('blob:') && (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                                        <Loader2 className="w-5 h-5 text-white animate-spin" />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        {/* Add More slot */}
                                        {galleryPreviews.length < 8 && (
                                            <label className="cursor-pointer rounded-xl border-2 border-dashed border-slate-200 hover:border-purple-300 hover:bg-purple-50/30 transition-all flex flex-col items-center justify-center aspect-square gap-1">
                                                <input type="file" accept="image/*" multiple onChange={handleGalleryUpload} className="hidden" />
                                                <ImagePlus className="w-5 h-5 text-slate-300" />
                                                <span className="text-[10px] font-bold text-slate-400">Add More</span>
                                            </label>
                                        )}
                                    </div>
                                )}

                                {/* Empty Upload Zone */}
                                {galleryPreviews.length === 0 && (
                                    <label className="block cursor-pointer group">
                                        <div className="rounded-2xl border-2 border-dashed border-slate-200 hover:border-purple-300 bg-slate-50 hover:bg-purple-50/20 transition-all p-10">
                                            <div className="flex flex-col items-center gap-4 text-slate-400 group-hover:text-purple-500 transition-colors">
                                                <div className="flex -space-x-3">
                                                    {[0, 1, 2].map(i => (
                                                        <div key={i} className={`w-12 h-12 rounded-2xl border-2 border-white flex items-center justify-center transition-colors shadow-sm ${i === 0 ? 'bg-purple-100' : i === 1 ? 'bg-purple-50' : 'bg-slate-200 group-hover:bg-purple-50'}`}>
                                                            <ImagePlus className="w-5 h-5" />
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="text-center">
                                                    <p className="font-black text-sm">Click to upload gallery photos</p>
                                                    <p className="text-xs mt-1 text-slate-400">Select multiple images at once · Max 8</p>
                                                </div>
                                            </div>
                                        </div>
                                        <input type="file" accept="image/*" multiple onChange={handleGalleryUpload} className="hidden" />
                                    </label>
                                )}

                                {galleryUploading && (
                                    <div className="flex items-center gap-2 mt-3 text-purple-500 text-sm font-bold">
                                        <Loader2 className="w-4 h-4 animate-spin" /> Uploading photos to cloud...
                                    </div>
                                )}
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => setActiveStep(2)}
                            className="w-full py-4 bg-gradient-to-r from-[#0B2244] to-[#0D2E61] text-white rounded-2xl font-black text-base shadow-xl hover:shadow-blue-900/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            Continue to Location
                            <Navigation className="w-4 h-4" />
                        </button>
                    </motion.div>
                )}

                {/* ── STEP 2: Location ── */}
                {activeStep === 2 && (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                                    <MapPin className="w-4 h-4 text-green-500" />
                                </div>
                                <h3 className="font-black text-slate-900">Location Details</h3>
                            </div>
                            <div className="p-6 space-y-5">

                                {/* COUNTRY */}
                                <div>
                                    <label className={labelClass}>Country <span className="text-orange-500">*</span></label>
                                    <div className="relative">
                                        <select
                                            required
                                            name="country"
                                            value={formData.country}
                                            onChange={e => {
                                                setFormData(prev => ({ ...prev, country: e.target.value, state: '', city: '', address: '' }));
                                            }}
                                            className={selectClass}
                                        >
                                            <option value="">-- Select Country --</option>
                                            {[
                                                '🇵🇰 Pakistan', '🇮🇳 India', '🇦🇪 United Arab Emirates', '🇸🇦 Saudi Arabia',
                                                '🇬🇧 United Kingdom', '🇺🇸 United States', '🇨🇦 Canada', '🇦🇺 Australia',
                                                '🇧🇩 Bangladesh', '🇱🇰 Sri Lanka', '🇳🇵 Nepal', '🇲🇾 Malaysia',
                                                '🇸🇬 Singapore', '🇶🇦 Qatar', '🇰🇼 Kuwait', '🇧🇭 Bahrain', '🇴🇲 Oman',
                                                '🌍 Other'
                                            ].map(c => <option key={c} value={c.replace(/^[^ ]+ /, '')}>{c}</option>)}
                                        </select>
                                        <MapPin className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>

                                {/* STATE / PROVINCE */}
                                {formData.country && (() => {
                                    const STATES: Record<string, string[]> = {
                                        'Pakistan': ['Punjab', 'Sindh', 'Khyber Pakhtunkhwa (KPK)', 'Balochistan', 'Islamabad Capital Territory (ICT)', 'Gilgit-Baltistan', 'Azad Jammu & Kashmir (AJK)', 'Lahore Division', 'Rawalpindi Division', 'Faisalabad Division', 'Multan Division', 'Gujranwala Division', 'Sargodha Division', 'Bahawalpur Division', 'Sahiwal Division', 'Dera Ghazi Khan Division', 'Karachi Division', 'Hyderabad Division', 'Sukkur Division', 'Larkana Division', 'Peshawar Division', 'Mardan Division', 'Hazara Division', 'Malakand Division', 'Kohat Division', 'Bannu Division', 'Dera Ismail Khan Division', 'Quetta Division', 'Kalat Division', 'Makran Division'],
                                        'India': ['Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu & Kashmir', 'Ladakh'],
                                        'United Arab Emirates': ['Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Fujairah', 'Ras Al Khaimah', 'Umm Al Quwain'],
                                        'Saudi Arabia': ['Riyadh', 'Makkah', 'Madinah', 'Eastern Province', 'Asir', 'Tabuk', 'Qassim', 'Hail', 'Jizan', 'Najran', 'Al Jawf', 'Al Bahah', 'Northern Borders'],
                                        'United Kingdom': ['England', 'Scotland', 'Wales', 'Northern Ireland', 'Greater London', 'West Midlands', 'Greater Manchester', 'West Yorkshire'],
                                        'United States': ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'],
                                        'Canada': ['Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Newfoundland and Labrador', 'Nova Scotia', 'Ontario', 'Prince Edward Island', 'Quebec', 'Saskatchewan', 'Northwest Territories', 'Nunavut', 'Yukon'],
                                        'Australia': ['New South Wales', 'Victoria', 'Queensland', 'South Australia', 'Western Australia', 'Tasmania', 'Australian Capital Territory', 'Northern Territory'],
                                    };
                                    const opts = STATES[formData.country] || [];
                                    return (
                                        <div>
                                            <label className={labelClass}>State / Province <span className="text-orange-500">*</span></label>
                                            <div className="relative">
                                                <select
                                                    required
                                                    name="state"
                                                    value={formData.state}
                                                    onChange={e => setFormData(prev => ({ ...prev, state: e.target.value, city: '', address: '' }))}
                                                    className={selectClass}
                                                >
                                                    <option value="">-- Select State / Province --</option>
                                                    {opts.length > 0
                                                        ? opts.map(s => <option key={s} value={s}>{s}</option>)
                                                        : <option value="Other">Other / Not Listed</option>
                                                    }
                                                    {opts.length > 0 && <option value="Other">Other</option>}
                                                </select>
                                                <MapPin className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                            </div>
                                            {formData.state === 'Other' && (
                                                <input type="text" placeholder="Type state / province" className={`${inputClass} mt-2`}
                                                    onChange={e => setFormData(prev => ({ ...prev, state: e.target.value }))} />
                                            )}
                                        </div>
                                    );
                                })()}

                                {/* CITY */}
                                {formData.state && (() => {
                                    const CITIES: Record<string, string[]> = {
                                        'Punjab': ['Lahore', 'Rawalpindi', 'Faisalabad', 'Multan', 'Gujranwala', 'Sialkot', 'Bahawalpur', 'Sargodha', 'Sheikhupura', 'Jhang', 'Rahim Yar Khan', 'Gujrat', 'Kasur', 'Sahiwal', 'Okara', 'Wah Cantonment', 'Dera Ghazi Khan', 'Chiniot', 'Khanewal', 'Hafizabad', 'Muzaffargarh', 'Jhelum', 'Attock', 'Narowal', 'Mianwali', 'Chakwal', 'Khushab', 'Rajanpur', 'Bahawalnagar'],
                                        'Lahore Division': ['Lahore', 'Sheikhupura', 'Nankana Sahib', 'Kasur'],
                                        'Rawalpindi Division': ['Rawalpindi', 'Islamabad', 'Attock', 'Chakwal', 'Jhelum', 'Taxila', 'Wah Cantt', 'Murree'],
                                        'Faisalabad Division': ['Faisalabad', 'Chiniot', 'Toba Tek Singh', 'Jhang'],
                                        'Multan Division': ['Multan', 'Khanewal', 'Lodhran', 'Muzaffargarh', 'Vehari'],
                                        'Gujranwala Division': ['Gujranwala', 'Sialkot', 'Gujrat', 'Hafizabad', 'Narowal', 'Wazirabad', 'Kamoke', 'Mandi Bahauddin'],
                                        'Bahawalpur Division': ['Bahawalpur', 'Rahim Yar Khan', 'Bahawalnagar', 'Sadiqabad', 'Hasilpur', 'Ahmadpur East'],
                                        'Sahiwal Division': ['Sahiwal', 'Okara', 'Pakpattan'],
                                        'Dera Ghazi Khan Division': ['Dera Ghazi Khan', 'Rajanpur', 'Layyah', 'Muzaffargarh'],
                                        'Sindh': ['Karachi', 'Hyderabad', 'Sukkur', 'Larkana', 'Nawabshah', 'Mirpurkhas', 'Jacobabad', 'Shikarpur', 'Khairpur', 'Dadu'],
                                        'Karachi Division': ['Karachi', 'Malir', 'Korangi', 'Landhi', 'Gadap'],
                                        'Hyderabad Division': ['Hyderabad', 'Matiari', 'Jamshoro', 'Tando Allahyar', 'Tando Muhammad Khan'],
                                        'Sukkur Division': ['Sukkur', 'Khairpur', 'Ghotki', 'Shikarpur', 'Kashmore'],
                                        'Larkana Division': ['Larkana', 'Shahdadkot', 'Kamber', 'Jacobabad', 'Qambar'],
                                        'Khyber Pakhtunkhwa (KPK)': ['Peshawar', 'Mardan', 'Kohat', 'Abbottabad', 'Mansehra', 'Swat', 'Dera Ismail Khan', 'Nowshera', 'Charsadda', 'Bannu'],
                                        'Peshawar Division': ['Peshawar', 'Nowshera', 'Charsadda', 'Khyber'],
                                        'Mardan Division': ['Mardan', 'Swabi'],
                                        'Hazara Division': ['Abbottabad', 'Mansehra', 'Haripur', 'Battagram', 'Kohistan'],
                                        'Malakand Division': ['Swat', 'Dir Lower', 'Dir Upper', 'Chitral', 'Malakand', 'Bajur', 'Shangla', 'Buner'],
                                        'Kohat Division': ['Kohat', 'Hangu', 'Karak', 'Orakzai', 'Kurram'],
                                        'Bannu Division': ['Bannu', 'Lakki Marwat', 'North Waziristan', 'South Waziristan'],
                                        'Dera Ismail Khan Division': ['Dera Ismail Khan', 'Tank'],
                                        'Balochistan': ['Quetta', 'Turbat', 'Khuzdar', 'Gwadar', 'Hub', 'Chaman', 'Zhob'],
                                        'Quetta Division': ['Quetta', 'Nushki', 'Mastung', 'Kalat'],
                                        'Kalat Division': ['Kalat', 'Khuzdar', 'Kharan', 'Washuk'],
                                        'Makran Division': ['Turbat', 'Gwadar', 'Pasni', 'Ormara'],
                                        'Sibi Division': ['Sibi', 'Dera Bugti', 'Kohlu', 'Ziarat'],
                                        'Zhob Division': ['Zhob', 'Qila Saifullah', 'Musakhel', 'Barkhan', 'Sherani'],
                                        'Nasirabad Division': ['Dera Murad Jamali', 'Jaffarabad', 'Sohbatpur', 'Nasirabad'],
                                        'Islamabad Capital Territory (ICT)': ['Islamabad'],
                                        'Gilgit-Baltistan': ['Gilgit', 'Skardu', 'Hunza', 'Ghanche', 'Ghizer', 'Astore', 'Diamer', 'Nagar'],
                                        'Azad Jammu & Kashmir (AJK)': ['Muzaffarabad', 'Mirpur', 'Rawalakot', 'Bagh', 'Kotli', 'Bhimber', 'Poonch', 'Neelum'],
                                        'United Arab Emirates': ['Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Fujairah', 'Ras Al Khaimah', 'Umm Al Quwain'],
                                        'Delhi': ['New Delhi', 'Old Delhi', 'Gurugram', 'Noida', 'Faridabad', 'Ghaziabad'],
                                    };
                                    const opts = CITIES[formData.state] || cities.map(c => c.name);
                                    return (
                                        <div>
                                            <label className={labelClass}>City <span className="text-orange-500">*</span></label>
                                            <div className="relative">
                                                <select
                                                    required
                                                    name="city"
                                                    value={formData.city}
                                                    onChange={e => setFormData(prev => ({ ...prev, city: e.target.value, address: '' }))}
                                                    className={selectClass}
                                                >
                                                    <option value="">-- Select City --</option>
                                                    {opts.map(c => <option key={c} value={c}>{c}</option>)}
                                                    <option value="Other">Other</option>
                                                </select>
                                                <MapPin className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                            </div>
                                            {formData.city === 'Other' && (
                                                <input type="text" placeholder="Type city name" className={`${inputClass} mt-2`}
                                                    onChange={e => setFormData(prev => ({ ...prev, city: e.target.value }))} />
                                            )}
                                        </div>
                                    );
                                })()}

                                {/* AREA / STREET */}
                                {formData.city && (() => {
                                    const AREAS: Record<string, string[]> = {
                                        'Lahore': ['DHA Phase 1', 'DHA Phase 2', 'DHA Phase 3', 'DHA Phase 4', 'DHA Phase 5', 'DHA Phase 6', 'Gulberg I', 'Gulberg II', 'Gulberg III', 'Model Town', 'Johar Town', 'Bahria Town Lahore', 'Cavalry Ground', 'Cantt', 'Iqbal Town', 'Garden Town', 'Shadman', 'Samanabad', 'Faisal Town', 'Wapda Town', 'Township', 'Raiwind Road', 'Bedian Road', 'Ferozpur Road', 'Mall Road', 'Liberty Market', 'M.M. Alam Road', 'Canal Road', 'Thokar Niaz Baig', 'Halloki', 'Bahria Orchard'],
                                        'Karachi': ['Clifton', 'DHA Phase 1', 'DHA Phase 2', 'DHA Phase 5', 'DHA Phase 6', 'DHA Phase 7', 'DHA Phase 8', 'Gulshan-e-Iqbal', 'Gulistan-e-Jauhar', 'PECHS', 'Bahadurabad', 'Defence View', 'North Nazimabad', 'Federal B Area', 'Nazimabad', 'Korangi', 'Landhi', 'Malir', 'Shah Faisal Colony', 'Scheme 33', 'Scheme 45', 'North Karachi', 'Surjani Town', 'Orangi Town', 'Liaquatabad', 'Kemari', 'Saddar', 'Garden', 'Lyari', 'Gulberg', 'Baldia'],
                                        'Islamabad': ['Blue Area', 'F-6 Markaz', 'F-7 Markaz', 'F-8 Markaz', 'F-10 Markaz', 'F-11', 'G-6', 'G-7', 'G-8', 'G-9', 'G-10', 'G-11', 'G-13', 'G-14', 'H-8', 'H-9', 'I-8', 'I-9', 'I-10', 'I-14', 'I-15', 'E-7', 'E-11', 'DHA Phase 1', 'DHA Phase 2', 'Bahria Town', 'PWD Colony', 'Gulshan-e-Sehat', 'Saidpur Village', 'Bani Gala', 'Golra Sharif', 'Rawat', 'Koral', 'Tarlai'],
                                        'Rawalpindi': ['DHA Rawalpindi', 'Bahria Town', 'Saddar', 'Satellite Town', 'Westridge', 'Chaklala', 'Rajah Bazaar', 'Murree Road', 'GT Road', 'Taxila', 'Wah Cantt', 'Adiala Road', 'Peshawar Road', 'Chakri Road', '6th Road', 'Commercial Market'],
                                        'Faisalabad': ['Canal Road', 'D-Ground', 'Gulberg', 'Jinnah Colony', 'Madina Town', 'Peoples Colony', 'Samanabad', 'Satiana Road', 'Sargodha Road', 'Susan Road', 'Millat Road', 'Jaranwala Road', 'Sheikhupura Road'],
                                        'Multan': ['Cantt', 'Shah Rukn-e-Alam', 'New Multan', 'Gulgasht Colony', 'Model Town', 'Bosan Road', 'Nawabpur Road', 'Khanewal Road', 'Abu Baker Block', 'Shah Shams'],
                                        'Gujranwala': ['Cantt', 'Civil Lines', 'Satellite Town', 'GT Road Gujranwala', 'Saidpur Road', 'People Colony', 'Gulshan Iqbal'],
                                        'Sialkot': ['Cantt', 'Iqbal Road', 'Kashmir Road', 'Paris Road', 'Industrial Area', 'Sambrial'],
                                        'Peshawar': ['University Road', 'Hayatabad Phase 1', 'Hayatabad Phase 2', 'Hayatabad Phase 3', 'Hayatabad Phase 4', 'DHA Peshawar', 'Gulbahar', 'Saddar', 'Cantt', 'Warsak Road', 'Ring Road', 'Board Bazar', 'Qissa Khwani', 'Charsadda Road'],
                                        'Quetta': ['Cantt', 'Satellite Town', 'Jinnah Town', 'Sariab Road', 'Brewery Road', 'Airport Road', 'Zarghoon Road', 'Jinnah Road', 'Liaquat Bazaar'],
                                        'Hyderabad': ['Latifabad', 'Qasimabad', 'Hirabad', 'Auto Bhan Road', 'Bypass', 'Kotri', 'Jamshoro Road', 'Court Road'],
                                        'Abbottabad': ['Cantt', 'Mandian', 'Jinnahabad', 'Kaghan Road', 'Supply Bazar', 'Nawan Shehr'],
                                        'Gwadar': ['Port Area', 'New Gwadar', 'Satellite Town Gwadar', 'MDA Chowk', 'East Bay', 'West Bay'],
                                        'Gilgit': ['City Center', 'Jutial', 'Konodas', 'Danyore', 'Barmas', 'Sakwar'],
                                        'Dubai': ['Downtown Dubai', 'Deira', 'Bur Dubai', 'Jumeirah', 'Marina', 'JLT', 'Business Bay', 'DIFC', 'Al Quoz', 'Al Barsha', 'Mirdif', 'Silicon Oasis'],
                                        'Abu Dhabi': ['Al Reem Island', 'Khalifa City', 'Al Ain', 'Mushrif', 'Corniche', 'Tourist Club Area', 'Mohammed Bin Zayed City'],
                                        'Riyadh': ['Olaya', 'Al Malaz', 'Al Rawdah', 'Al Sulaimaniyah', 'Al Muraba', 'Diplomatic Quarter', 'King Fahd District'],
                                    };
                                    const areas = AREAS[formData.city] || [];
                                    return (
                                        <div>
                                            <label className={labelClass}>Area / Street <span className="text-orange-500">*</span></label>
                                            <div className="relative">
                                                <select
                                                    required
                                                    name="address"
                                                    value={formData.address}
                                                    onChange={handleChange}
                                                    className={selectClass}
                                                >
                                                    <option value="">-- Select Area / Street --</option>
                                                    {areas.length > 0
                                                        ? areas.map(a => <option key={a} value={a}>{a}</option>)
                                                        : null
                                                    }
                                                    <option value="Other">Other (type manually)</option>
                                                </select>
                                                <MapPin className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                            </div>
                                            {formData.address === 'Other' && (
                                                <input type="text" placeholder="Type area / street name" className={`${inputClass} mt-2`}
                                                    onChange={e => setFormData(prev => ({ ...prev, address: e.target.value }))} />
                                            )}
                                        </div>
                                    );
                                })()}

                                {/* PINCODE */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClass}>Pincode <span className="text-orange-500">*</span></label>
                                        <input
                                            required
                                            name="pincode"
                                            value={formData.pincode}
                                            onChange={handleChange}
                                            placeholder="e.g. 54000"
                                            className={inputClass}
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Latitude / Longitude</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="number"
                                                step="any"
                                                name="latitude"
                                                value={formData.latitude}
                                                onChange={handleChange}
                                                placeholder="Lat"
                                                className={inputClass}
                                            />
                                            <input
                                                type="number"
                                                step="any"
                                                name="longitude"
                                                value={formData.longitude}
                                                onChange={handleChange}
                                                placeholder="Long"
                                                className={inputClass}
                                            />
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setActiveStep(1)}
                                className="flex-1 py-4 bg-slate-100 text-slate-700 rounded-2xl font-black text-base hover:bg-slate-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                <ArrowLeft className="w-4 h-4" /> Back
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveStep(3)}
                                className="flex-[2] py-4 bg-gradient-to-r from-[#0B2244] to-[#0D2E61] text-white rounded-2xl font-black text-base shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                Continue to Details <FileText className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* ── STEP 3: Description + Publish ── */}
                {activeStep === 3 && (
                    <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                                    <TextQuote className="w-4 h-4 text-purple-500" />
                                </div>
                                <h3 className="font-black text-slate-900">About Your Business</h3>
                            </div>
                            <div className="p-6">
                                <label className={labelClass}>
                                    Short Description <span className="text-orange-500">*</span>
                                </label>
                                <textarea
                                    required
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={6}
                                    placeholder="Briefly describe what makes your business unique, your services, working hours..."
                                    className={`${inputClass} resize-none leading-relaxed`}
                                />
                                <p className="text-xs text-slate-400 font-medium mt-2">{formData.description.length} characters</p>
                            </div>
                        </div>

                        {/* Business Amenities Section */}
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                                        <Sparkles className="w-4 h-4 text-blue-500" />
                                    </div>
                                    <h3 className="font-black text-slate-900">Business Amenities</h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowAddAmenity(!showAddAmenity)}
                                    className="text-xs font-black uppercase tracking-widest text-[#FF7A30] hover:text-[#E86920] transition-colors flex items-center gap-1"
                                >
                                    <Plus className="w-3 h-3" /> Add Option
                                </button>
                            </div>
                            <div className="p-6">
                                {showAddAmenity && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mb-6 p-4 bg-orange-50/50 rounded-xl border border-orange-100 flex gap-2"
                                    >
                                        <input
                                            type="text"
                                            placeholder="Enter new amenity name..."
                                            value={newAmenityName}
                                            onChange={(e) => setNewAmenityName(e.target.value)}
                                            className="flex-1 px-4 py-2 bg-white border border-orange-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAmenity())}
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddAmenity}
                                            disabled={creatingAmenity || !newAmenityName.trim()}
                                            className="px-4 py-2 bg-[#FF7A30] text-white rounded-lg text-sm font-bold disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {creatingAmenity ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add'}
                                        </button>
                                    </motion.div>
                                )}

                                {amenitiesLoading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {amenities.map((amenity) => {
                                            const isSelected = formData.amenityIds.includes(amenity.id);
                                            return (
                                                <button
                                                    key={amenity.id}
                                                    type="button"
                                                    onClick={() => toggleAmenity(amenity.id)}
                                                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${isSelected
                                                        ? 'bg-orange-50 border-orange-200 text-orange-700 ring-1 ring-orange-200'
                                                        : 'bg-slate-50 border-slate-100 text-slate-600 hover:border-slate-200'
                                                        }`}
                                                >
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isSelected ? 'bg-orange-500 text-white' : 'bg-white text-slate-400'
                                                        }`}>
                                                        {isSelected ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                                    </div>
                                                    <span className="text-sm font-bold truncate">{amenity.name}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                                {amenities.length === 0 && !amenitiesLoading && !showAddAmenity && (
                                    <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                        <p className="text-sm text-slate-400 font-medium">No amenities found. Click "Add Option" to create one.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Offer / Banner Ads */}
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                                        <Tag className="w-4 h-4 text-orange-500" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-slate-900">Offer / Banner Ad</h3>
                                        <p className="text-[11px] text-slate-400 font-medium">Promote a special deal on your listing</p>
                                    </div>
                                </div>
                                {/* Toggle Switch */}
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, hasOffer: !prev.hasOffer }))}
                                    className={`relative w-12 h-6 rounded-full transition-colors ${formData.hasOffer ? 'bg-orange-500' : 'bg-slate-200'}`}
                                >
                                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${formData.hasOffer ? 'translate-x-6' : 'translate-x-0'}`} />
                                </button>
                            </div>

                            {formData.hasOffer ? (
                                <div className="p-6 space-y-5">
                                    {/* Offer Badge */}
                                    <div>
                                        <label className={labelClass}>
                                            <Tag className="w-3 h-3 inline mr-1.5 text-orange-500" />
                                            Offer Badge <span className="text-orange-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="offerBadge"
                                            value={formData.offerBadge}
                                            onChange={handleChange}
                                            placeholder="e.g. 30% OFF · Free Delivery · Grand Opening"
                                            maxLength={60}
                                            className={inputClass}
                                        />
                                        <p className="text-xs text-slate-400 mt-1">Short promo label shown on the listing card</p>
                                    </div>

                                    {/* Offer Title */}
                                    <div>
                                        <label className={labelClass}>Offer Title</label>
                                        <input
                                            type="text"
                                            name="offerTitle"
                                            value={formData.offerTitle}
                                            onChange={handleChange}
                                            placeholder="e.g. Grand Opening Sale — This Weekend Only!"
                                            maxLength={150}
                                            className={inputClass}
                                        />
                                    </div>

                                    {/* Offer Description */}
                                    <div>
                                        <label className={labelClass}>Offer Description</label>
                                        <textarea
                                            name="offerDescription"
                                            value={formData.offerDescription}
                                            onChange={handleChange}
                                            rows={3}
                                            placeholder="Details about the deal — terms, conditions, what's included..."
                                            className={`${inputClass} resize-none`}
                                        />
                                    </div>

                                    {/* Expiry Date */}
                                    <div>
                                        <label className={labelClass}>Offer Expiry Date</label>
                                        <input
                                            type="date"
                                            name="offerExpiresAt"
                                            value={formData.offerExpiresAt}
                                            onChange={handleChange}
                                            min={new Date().toISOString().split('T')[0]}
                                            className={inputClass}
                                        />
                                    </div>

                                    {/* Banner Image Upload */}
                                    <div>
                                        <label className={labelClass}>
                                            <ImagePlus className="w-3 h-3 inline mr-1.5 text-orange-500" />
                                            Banner Image <span className="text-slate-400 font-medium text-xs">(optional)</span>
                                        </label>
                                        {formData.offerBannerUrl ? (
                                            <div className="relative rounded-2xl overflow-hidden bg-slate-100 aspect-[3/1]">
                                                <img src={formData.offerBannerUrl} alt="Offer banner" className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, offerBannerUrl: '' }))}
                                                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 shadow-lg"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <label className="block cursor-pointer group">
                                                <div className="rounded-2xl border-2 border-dashed border-slate-200 hover:border-orange-300 bg-slate-50 hover:bg-orange-50/20 transition-all p-8 flex flex-col items-center gap-3">
                                                    <ImagePlus className="w-8 h-8 text-slate-300 group-hover:text-orange-400 transition-colors" />
                                                    <div className="text-center">
                                                        <p className="font-black text-sm text-slate-400 group-hover:text-orange-500">Upload Banner Image</p>
                                                        <p className="text-xs text-slate-300 mt-0.5">Recommended 1200×400 · PNG, JPG</p>
                                                    </div>
                                                </div>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={async e => {
                                                        const file = e.target.files?.[0];
                                                        if (!file) return;
                                                        setLoading(true);
                                                        try {
                                                            const res = await api.listings.uploadImage(file);
                                                            setFormData(prev => ({ ...prev, offerBannerUrl: res.url }));
                                                        } catch { setError('Banner upload failed'); } finally { setLoading(false); }
                                                    }}
                                                />
                                            </label>
                                        )}
                                    </div>

                                    {/* Live Preview Card */}
                                    {(formData.offerBadge || formData.offerTitle) && (
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Preview</p>
                                            <div className="bg-gradient-to-r from-orange-500 to-rose-500 rounded-2xl p-5 text-white shadow-lg shadow-orange-500/20">
                                                {formData.offerBannerUrl && (
                                                    <img src={formData.offerBannerUrl} className="w-full rounded-xl mb-4 object-cover max-h-28" alt="banner" />
                                                )}
                                                <div>
                                                    {formData.offerBadge && (
                                                        <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur rounded-full text-xs font-black uppercase tracking-wider mb-2">
                                                            🏷️ {formData.offerBadge}
                                                        </span>
                                                    )}
                                                    {formData.offerTitle && <h4 className="font-black text-lg leading-tight mb-1">{formData.offerTitle}</h4>}
                                                    {formData.offerDescription && <p className="text-sm text-white/80">{formData.offerDescription}</p>}
                                                    {formData.offerExpiresAt && (
                                                        <p className="text-xs text-white/60 mt-2 font-bold">⏳ Expires: {new Date(formData.offerExpiresAt).toLocaleDateString()}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="px-6 py-8 text-center text-slate-400">
                                    <Tag className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                    <p className="text-sm font-bold">Toggle on to add a special offer or promo banner</p>
                                </div>
                            )}
                        </div>

                        {/* Summary Preview */}
                        <div className="bg-gradient-to-br from-slate-50 to-orange-50/30 rounded-2xl border border-orange-100 p-6">
                            <h3 className="font-black text-slate-700 text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-orange-500" /> Listing Summary
                            </h3>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                {[
                                    { label: 'Title', value: formData.title || '—' },
                                    { label: 'Phone', value: formData.phone || '—' },
                                    { label: 'City', value: formData.city || '—' },
                                    { label: 'Pincode', value: formData.pincode || '—' },
                                ].map(item => (
                                    <div key={item.label} className="bg-white rounded-xl px-4 py-3 border border-slate-100">
                                        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black mb-0.5">{item.label}</p>
                                        <p className="font-bold text-slate-800 truncate">{item.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setActiveStep(2)}
                                className="flex-1 py-4 bg-slate-100 text-slate-700 rounded-2xl font-black text-base hover:bg-slate-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                <ArrowLeft className="w-4 h-4" /> Back
                            </button>
                            <button
                                disabled={loading}
                                type="submit"
                                className="flex-[2] py-4 bg-gradient-to-r from-[#FF7A30] to-[#FF9050] text-white rounded-2xl font-black text-base shadow-xl shadow-orange-500/20 hover:from-[#E86920] hover:to-[#FF7A30] transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <Store className="w-5 h-5" /> Publish Listing
                                    </>
                                )}
                            </button>
                        </div>

                        <p className="text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                            By listing, you agree to our <span className="text-slate-600 underline cursor-pointer">Terms of Service</span>
                        </p>
                    </motion.div>
                )}
            </form>
        </div>
    );
}
