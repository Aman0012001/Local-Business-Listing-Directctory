"use client";

import React, { useState, useEffect, useRef } from 'react';
import { X, Loader2, Store, MapPin, Phone, TextQuote, Layers, Sparkles, Plus, Check, Hash, Share2, Globe, MessageSquare, Navigation, ChevronDown, Tag, ImagePlus, HelpCircle, Trash2 } from 'lucide-react';
import { api, getImageUrl } from '../../lib/api';
import { Category, Business, City } from '../../types/api';
import { motion, AnimatePresence } from 'framer-motion';
import CategorySearchSelect from '../CategorySearchSelect';
import { useAuth } from '../../context/AuthContext';
import { usePlanFeature } from '../../hooks/usePlanFeature';
import { Lock } from 'lucide-react';
import Link from 'next/link';

const SOCIAL_PLATFORMS = [
    { key: 'facebook', label: 'Facebook', emoji: '📘', color: '#1877F2', placeholder: 'https://facebook.com/yourbusiness' },
    { key: 'instagram', label: 'Instagram', emoji: '📸', color: '#E1306C', placeholder: 'https://instagram.com/yourbusiness' },
    { key: 'twitter', label: 'Twitter / X', emoji: '🐦', color: '#1DA1F2', placeholder: 'https://twitter.com/yourbusiness' },
    { key: 'linkedin', label: 'LinkedIn', emoji: '💼', color: '#0A66C2', placeholder: 'https://linkedin.com/company/yourbusiness' },
    { key: 'youtube', label: 'YouTube', emoji: '▶️', color: '#FF0000', placeholder: 'https://youtube.com/@yourbusiness' },
];

interface AddBusinessModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    business?: Business | null;
}

const TABS = [
    { id: 'general', label: 'General', icon: Store },
    { id: 'location', label: 'Location', icon: MapPin },
    { id: 'media', label: 'Media & Amenities', icon: ImagePlus },
    { id: 'social', label: 'Contact & Social', icon: Share2 },
    { id: 'faqs', label: 'FAQs', icon: HelpCircle },
];

export default function AddBusinessModal({ isOpen, onClose, onSuccess, business }: AddBusinessModalProps) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('general');

    const [formData, setFormData] = useState({
        title: '',
        categoryId: '',
        description: '',
        phone: '',
        whatsapp: '',
        website: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        latitude: 40.7128,
        longitude: -74.0060,
        coverImageUrl: '',
        images: [] as string[],
        amenityIds: [] as string[],
        metaKeywords: '',
        hasOffer: false,
        offerTitle: '',
        offerDescription: '',
        offerBadge: '',
        offerExpiresAt: '',
        offerBannerUrl: '',
        faqs: [] as { question: string; answer: string }[]
    });

    const activeSub = user?.vendor?.subscriptions?.find((sub: any) => sub.status === 'active');
    const { getFeatureValue, planName } = usePlanFeature();
    const maxKeywords = getFeatureValue('maxKeywords') || 0;
    const maxListings = getFeatureValue('maxListings') || 1;
    
    const [myListingsCount, setMyListingsCount] = useState<number | null>(null);
    const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
    const canAddListing = isAdmin || (myListingsCount !== null && myListingsCount < maxListings);

    const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
    const [galleryUploading, setGalleryUploading] = useState(false);

    // Keywords tag state
    const [keywords, setKeywords] = useState<string[]>([]);
    const [keywordInput, setKeywordInput] = useState('');
    const keywordInputRef = useRef<HTMLInputElement>(null);

    const addKeyword = (raw: string) => {
        const tag = raw.trim().toLowerCase().replace(/[,]+$/, '');
        if (tag && !keywords.includes(tag) && keywords.length < maxKeywords) {
            const updated = [...keywords, tag];
            setKeywords(updated);
            setFormData(prev => ({ ...prev, metaKeywords: updated.join(',') }));
        }
        setKeywordInput('');
    };

    const removeKeyword = (kw: string) => {
        const updated = keywords.filter(k => k !== kw);
        setKeywords(updated);
        setFormData(prev => ({ ...prev, metaKeywords: updated.join(',') }));
    };

    const handleKeywordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addKeyword(keywordInput);
        } else if (e.key === 'Backspace' && !keywordInput && keywords.length > 0) {
            removeKeyword(keywords[keywords.length - 1]);
        }
    };

    const [socialLinks, setSocialLinks] = useState<{ platform: string; url: string }[]>([]);

    const addSocialLink = (platform: string) => {
        if (!socialLinks.find(s => s.platform === platform)) {
            setSocialLinks(prev => [...prev, { platform, url: '' }]);
        }
    };

    const removeSocialLink = (platform: string) => {
        setSocialLinks(prev => prev.filter(s => s.platform !== platform));
    };

    const updateSocialUrl = (platform: string, url: string) => {
        setSocialLinks(prev => prev.map(s => s.platform === platform ? { ...s, url } : s));
    };

    const [amenities, setAmenities] = useState<any[]>([]);
    const [amenitiesLoading, setAmenitiesLoading] = useState(false);
    const [showAddAmenity, setShowAddAmenity] = useState(false);
    const [newAmenityName, setNewAmenityName] = useState('');
    const [creatingAmenity, setCreatingAmenity] = useState(false);

    const [newFaq, setNewFaq] = useState({ question: '', answer: '' });

    const addFaq = () => {
        if (!newFaq.question.trim() || !newFaq.answer.trim()) return;
        setFormData(prev => ({
            ...prev,
            faqs: [...(prev.faqs || []), newFaq]
        }));
        setNewFaq({ question: '', answer: '' });
    };

    const removeFaq = (index: number) => {
        setFormData(prev => ({
            ...prev,
            faqs: (prev.faqs || []).filter((_, i) => i !== index)
        }));
    };

    // Google Maps State & Refs
    const [mapError, setMapError] = useState(false);
    const [mapLoaded, setMapLoaded] = useState(false);
    const autoCompleteRef = useRef<any>(null);
    const addressInputRef = useRef<HTMLInputElement>(null);
    const mapRef = useRef<any>(null);
    const markerRef = useRef<any>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const initInProgress = useRef(false);
    const formDataRef = useRef(formData);

    useEffect(() => {
        formDataRef.current = formData;
    }, [formData]);

    useEffect(() => {
        if (typeof window !== 'undefined' && (window as any).google?.maps?.importLibrary) {
            setMapLoaded(true);
            return;
        }

        const interval = setInterval(() => {
            if (typeof window !== 'undefined' && (window as any).google?.maps?.importLibrary) {
                setMapLoaded(true);
                clearInterval(interval);
            }
        }, 1000);

        (window as any).gm_authFailure = () => {
            console.error('[AddBusiness] Google Maps auth failure');
            setMapError(true);
        };

        return () => {
            if (interval) clearInterval(interval);
        };
    }, []);

    const updateLocationFromCoords = async (lat: number, lng: number) => {
        setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
        
        try {
            if (!(window as any).google || !(window as any).google.maps || !(window as any).google.maps.Geocoder) return;
            const geocoder = new (window as any).google.maps.Geocoder();
            const response = await geocoder.geocode({ location: { lat, lng } });

            if (response.results?.[0]) {
                const place = response.results[0];
                let city = '';
                let state = '';
                let pincode = '';
                let address = place.formatted_address || '';

                place.address_components?.forEach((component: any) => {
                    const types = component.types;
                    if (types.includes("locality")) city = component.long_name;
                    else if (types.includes("administrative_area_level_2") && !city) city = component.long_name;
                    else if (types.includes("administrative_area_level_1")) state = component.long_name;
                    else if (types.includes("postal_code")) pincode = component.long_name;
                });

                let cleanAddress = address;
                [city, state, "Pakistan", pincode].forEach(term => {
                    if (term) {
                        const regex = new RegExp(`,?\\s*${term}\\s*,?`, 'gi');
                        cleanAddress = cleanAddress.replace(regex, '').trim();
                    }
                });
                cleanAddress = cleanAddress.replace(/,$/, '').trim();

                setFormData(prev => ({
                    ...prev,
                    address: cleanAddress || address,
                    city: city || prev.city,
                    state: state || prev.state,
                    pincode: pincode || prev.pincode,
                }));
            }
        } catch (error) {
            console.error("Geocoding failed:", error);
        }
    };

    const initAutocomplete = async () => {
        if (!mapContainerRef.current || !addressInputRef.current || initInProgress.current) return;

        try {
            initInProgress.current = true;
            const defaultCenter = { lat: formData.latitude, lng: formData.longitude };
            
            if (!(window as any).google?.maps?.importLibrary) {
                console.warn('[AddBusiness] Google Maps importLibrary not available yet');
                initInProgress.current = false;
                return;
            }

            const { Map } = await (window as any).google.maps.importLibrary("maps");
            const { Autocomplete } = await (window as any).google.maps.importLibrary("places");

            if (!mapRef.current) {
                mapRef.current = new Map(mapContainerRef.current, {
                    center: defaultCenter,
                    zoom: 15,
                    mapTypeId: 'roadmap',
                    mapTypeControl: false,
                    streetViewControl: false,
                    fullscreenControl: false,
                });

                console.log('[AddBusiness] Map instance created');

                try {
                    const { Marker } = await (window as any).google.maps.importLibrary("marker");
                    markerRef.current = new Marker({
                        position: defaultCenter,
                        map: mapRef.current,
                        draggable: true,
                        title: "Drag to set location",
                        animation: (window as any).google?.maps?.Animation?.DROP
                    });
                    console.log('[AddBusiness] Legacy Marker initialized');
                } catch (markerErr) {
                    console.warn('[AddBusiness] Marker failure:', markerErr);
                }

                if (markerRef.current) {
                    markerRef.current.addListener("dragend", (e: any) => {
                        let lat: number, lng: number;
                        if (e && e.latLng) {
                            lat = typeof e.latLng.lat === 'function' ? e.latLng.lat() : e.latLng.lat;
                            lng = typeof e.latLng.lng === 'function' ? e.latLng.lng() : e.latLng.lng;
                        } else {
                            const pos = markerRef.current.position;
                            if (!pos) return;
                            lat = typeof pos.lat === 'function' ? pos.lat() : pos.lat;
                            lng = typeof pos.lng === 'function' ? pos.lng() : pos.lng;
                        }
                        updateLocationFromCoords(lat, lng);
                    });
                }

                mapRef.current.addListener("click", (e: any) => {
                    if (e.latLng) {
                        const pos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
                        if (markerRef.current) {
                            if (markerRef.current.setPosition) {
                                markerRef.current.setPosition(pos);
                            } else {
                                markerRef.current.position = pos;
                            }
                        }
                        updateLocationFromCoords(pos.lat, pos.lng);
                    }
                });
            } else {
                // Handle map resize if container was hidden
                if ((window as any).google?.maps?.event) {
                    (window as any).google.maps.event.trigger(mapRef.current, 'resize');
                }
            }

            if (!autoCompleteRef.current) {
                autoCompleteRef.current = new Autocomplete(
                    addressInputRef.current,
                    {
                        componentRestrictions: { country: "pk" },
                        fields: ["address_components", "geometry", "formatted_address"],
                    }
                );

                autoCompleteRef.current.addListener("place_changed", () => {
                    try {
                        const place = autoCompleteRef.current.getPlace();
                        if (!place.geometry) return;

                        const lat = place.geometry.location.lat();
                        const lng = place.geometry.location.lng();
                        const pos = { lat, lng };

                        mapRef.current.setCenter(pos);
                        mapRef.current.setZoom(17);
                        if (markerRef.current.setPosition) {
                            markerRef.current.setPosition(pos);
                        } else {
                            markerRef.current.position = pos;
                        }

                        let city = '';
                        let state = '';
                        let pincode = '';
                        let address = place.formatted_address || '';

                        place.address_components?.forEach((component: any) => {
                            const types = component.types;
                            if (types.includes("locality")) city = component.long_name;
                            else if (types.includes("administrative_area_level_2") && !city) city = component.long_name;
                            else if (types.includes("administrative_area_level_1")) state = component.long_name;
                            else if (types.includes("postal_code")) pincode = component.long_name;
                        });

                        let cleanAddress = address;
                        [city, state, "Pakistan", pincode].forEach(term => {
                            if (term) {
                                const regex = new RegExp(`,?\\s*${term}\\s*,?`, 'gi');
                                cleanAddress = cleanAddress.replace(regex, '').trim();
                            }
                        });
                        cleanAddress = cleanAddress.replace(/,$/, '').trim();

                        setFormData(prev => ({
                            ...prev,
                            address: cleanAddress || address || prev.address,
                            city: city || prev.city,
                            state: state || prev.state,
                            pincode: pincode || prev.pincode,
                            latitude: lat,
                            longitude: lng,
                        }));
                    } catch (err) {
                        console.error("Error in place_changed handler:", err);
                    }
                });
            }
        } catch (err) {
            console.error('[AddBusiness] Map initialization error:', err);
            setMapError(true);
        } finally {
            initInProgress.current = false;
        }
    };

    const handleGetCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                if (mapRef.current && markerRef.current) {
                    const pos = { lat: latitude, lng: longitude };
                    mapRef.current.setCenter(pos);
                    mapRef.current.setZoom(17);
                    markerRef.current.position = pos;
                    updateLocationFromCoords(latitude, longitude);
                }
            },
            (error) => {
                console.error("Error getting location:", error);
                alert("Could not get your current location. Please check your browser permissions.");
            },
            { enableHighAccuracy: true }
        );
    };

    useEffect(() => {
        if (activeTab === 'location' && mapLoaded) {
            setTimeout(initAutocomplete, 100);
        }
    }, [activeTab, mapLoaded]);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [cats, cityList, amenityList, vendorProfile, businessesRes] = await Promise.all([
                    api.categories.getAll(),
                    api.cities.getAll(),
                    api.listings.getAmenities(),
                    api.vendors.getProfile().catch(() => null),
                    api.listings.getMyListings()
                ]);
                setCategories(cats);
                setCities(cityList);
                setAmenities(amenityList || []);
                setMyListingsCount(businessesRes?.data?.length || 0);

                if (vendorProfile?.socialLinks) {
                    setSocialLinks(vendorProfile.socialLinks);
                }

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
            const initialAmenityIds = ((business as any).businessAmenities || []).map((ba: any) => {
                const id = ba.amenityId || ba.amenity?.id;
                return id ? String(id) : '';
            }).filter((id: string) => id !== '');

            console.log("[AddBusinessModal] Initial Mapping Amenities:", {
                businessAmenities: (business as any).businessAmenities,
                mappedIds: initialAmenityIds
            });

            setFormData({
                title: business.title || '',
                categoryId: business.category?.id || '',
                description: business.description || '',
                phone: business.phone || '',
                whatsapp: business.whatsapp || '',
                website: business.website || '',
                address: business.address || '',
                city: business.city || '',
                state: business.state || '',
                pincode: business.pincode || '',
                latitude: Number(business.latitude) || 40.7128,
                longitude: Number(business.longitude) || -74.0060,
                coverImageUrl: business.coverImageUrl || '',
                images: business.images || [],
                amenityIds: initialAmenityIds,
                metaKeywords: business.metaKeywords || '',
                hasOffer: business.hasOffer || false,
                offerTitle: business.offerTitle || '',
                offerDescription: business.offerDescription || '',
                offerBadge: business.offerBadge || '',
                offerExpiresAt: (() => {
                    try {
                        return business.offerExpiresAt ? new Date(business.offerExpiresAt).toISOString().split('T')[0] : '';
                    } catch (e) {
                        console.error("Invalid date for offerExpiresAt:", business.offerExpiresAt);
                        return '';
                    }
                })(),
                offerBannerUrl: business.offerBannerUrl || '',
                faqs: (business.faqs || []).filter(f => f && f.question && f.answer)
            });
            // Pre-fill gallery previews
            setGalleryPreviews(business.images || []);
            // Pre-fill keyword pills from saved metaKeywords
            const saved = ((business as any).metaKeywords || '').split(',').map((k: string) => k.trim()).filter(Boolean);
            setKeywords(saved);

            // Pre-fill social links from vendor profile if available (fallback, usually fetchInitialData handles it)
            if (business.vendor?.socialLinks) {
                setSocialLinks(business.vendor.socialLinks);
            }
        } else if (!business && isOpen && cities.length > 0 && categories.length > 0) {
            setFormData(prev => ({
                ...prev,
                categoryId: categories[0]?.id || '',
                city: cities[0]?.name || ''
            }));
            setKeywords([]);
        }
    }, [business, isOpen, categories, cities]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            // Handle empty strings for optional URL/Email fields (send null to clear them in backend)
            const submissionData = { ...formData };
            const fieldsToPrune: string[] = ['coverImageUrl', 'website', 'metaKeywords', 'whatsapp', 'offerExpiresAt'];
            fieldsToPrune.forEach(field => {
                const val = (submissionData as any)[field];
                if (val === '' || (typeof val === 'string' && val.includes('NaN'))) {
                    (submissionData as any)[field] = null;
                }
            });

            // Filter out empty FAQs
            submissionData.faqs = (submissionData.faqs || []).filter(f => f.question.trim() && f.answer.trim());
            console.log("[AddBusinessModal] Submitting data:", submissionData);
        
            try {
                if (business) {
                    await api.listings.update(business.id, submissionData);
                    console.log("[AddBusinessModal] Update success");
                } else {
                    await api.listings.create(submissionData);
                }
            } catch (err) {
                console.error("[AddBusinessModal] Submission error:", err);
                throw err;
            }

            // Save social links to vendor profile
            const linksToSave = socialLinks.filter(s => s.url?.trim());
            try {
                await api.vendors.updateProfile({ socialLinks: linksToSave });
            } catch (socialErr) {
                console.error('Failed to update social links:', socialErr);
                // Don't block the main flow if social links fail
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

    const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        const remaining = 24 - galleryPreviews.length;
        const toUpload = files.slice(0, remaining);

        if (toUpload.length === 0) return;

        setGalleryUploading(true);
        setError(null);
        try {
            // Create local previews with temporary IDs to track them
            const newUploads = toUpload.map(file => ({
                id: Math.random().toString(36).substring(7),
                file,
                preview: URL.createObjectURL(file)
            }));

            // Add previews immediately
            setGalleryPreviews(prev => [...prev, ...newUploads.map(u => u.preview)]);

            // Parallelized upload using Promise.all
            const uploadPromises = newUploads.map(async (upload) => {
                const res = await api.listings.uploadImage(upload.file);
                return { preview: upload.preview, url: res.url };
            });

            const results = await Promise.all(uploadPromises);
            const uploadedUrls = results.map(r => r.url);

            setFormData(prev => ({ ...prev, images: [...prev.images, ...uploadedUrls] }));

            // Replace local previews with real URLs safely
            setGalleryPreviews(prev => {
                const updated = [...prev];
                results.forEach(res => {
                    const idx = updated.indexOf(res.preview);
                    if (idx !== -1) {
                        updated[idx] = res.url;
                    }
                });
                return updated;
            });
        } catch (err: any) {
            setError(err.message || 'Failed to upload gallery images');
        } finally {
            setGalleryUploading(false);
        }
    };

    const removeGalleryImage = (index: number) => {
        setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
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
            const targetId = String(id);
            const exists = prev.amenityIds.some(aid => String(aid) === targetId);
            if (exists) {
                return { ...prev, amenityIds: prev.amenityIds.filter(a => String(a) !== targetId) };
            }
            return { ...prev, amenityIds: [...prev.amenityIds, targetId] };
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
        <>
            <AnimatePresence>
                {isOpen && (
                    <div key="add-business-modal" className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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
                            className="bg-white rounded-[16px] w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-premium relative flex flex-col border border-white/20"
                        >
                            {/* Header */}
                            <div className="p-8 pb-4 border-b border-slate-100 flex items-center justify-between relative overflow-hidden bg-slate-50/50">
                                <div className="relative z-10">
                                    <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                                            <Store className="w-5 h-5" />
                                        </div>
                                        {business ? 'Edit Business' : 'Add New Listing'}
                                    </h2>
                                    {business && <p className="text-slate-500 font-bold text-xs mt-1 ml-13 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                        {business.title}
                                    </p>}
                                </div>
                                <button
                                    onClick={onClose}
                                    className="relative z-10 p-2 hover:bg-white rounded-xl transition-all group active:scale-95 shadow-sm border border-transparent hover:border-slate-200"
                                >
                                    <X className="w-5 h-5 text-slate-400 group-hover:text-slate-900 transition-colors" />
                                </button>
                            </div>

                            {/* Tabs Navigation */}
                            <div className="flex items-center gap-1 px-8 py-3 bg-white border-b border-slate-100 overflow-x-auto no-scrollbar">
                                {TABS.map(tab => {
                                    const Icon = tab.icon;
                                    const isActive = activeTab === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            type="button"
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${isActive
                                                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20 active:scale-95'
                                                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                                                }`}
                                        >
                                            <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                                            {tab.label}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Form Body */}
                            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
                                <div className="p-8 space-y-8 flex-1">
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-xs font-black flex items-center gap-3 shadow-sm"
                                        >
                                            <div className="w-7 h-7 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                                                <X className="w-3.5 h-3.5" />
                                            </div>
                                            {error}
                                        </motion.div>
                                    )}

                                    {/* Limit Gate for NEW listings */}
                                    {!business && !canAddListing && myListingsCount !== null && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden mb-8"
                                        >
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                                            <div className="relative z-10 flex flex-col items-center text-center">
                                                <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-6">
                                                    <Lock className="w-8 h-8 text-orange-500" />
                                                </div>
                                                <h3 className="text-xl font-black text-white mb-2">Limit Reached</h3>
                                                <p className="text-slate-400 text-sm font-bold mb-6 italic leading-relaxed">
                                                    Your <span className="text-orange-400 font-black">{planName}</span> plan allows for <span className="text-white">{maxListings}</span> business listing{maxListings > 1 ? 's' : ''}. 
                                                    Please upgrade your plan to increase this limit.
                                                </p>
                                                <Link
                                                    href="/vendor/subscription"
                                                    className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-orange-500/20 active:scale-[0.98]"
                                                >
                                                    Upgrade Plan Now
                                                </Link>
                                            </div>
                                        </motion.div>
                                    )}

                                    <AnimatePresence mode="wait">
                                        {activeTab === 'general' && (
                                            <motion.div
                                                key="general"
                                                initial={{ opacity: 0, x: 10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -10 }}
                                                className="space-y-6"
                                            >
                                                <div className="space-y-4">
                                                    <div className="space-y-2.5">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Business Title</label>
                                                        <div className="relative group">
                                                            <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                                                            <input
                                                                required
                                                                name="title"
                                                                value={formData.title}
                                                                onChange={handleChange}
                                                                placeholder="Enter business name..."
                                                                className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:bg-white transition-all shadow-sm"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2.5">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Category</label>
                                                        <CategorySearchSelect
                                                            categories={categories}
                                                            value={formData.categoryId}
                                                            onChange={(val) => setFormData(prev => ({ ...prev, categoryId: val }))}
                                                            loading={false}
                                                        />
                                                    </div>

                                                    <div className="space-y-2.5">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Short Description</label>
                                                        <div className="relative group">
                                                            <TextQuote className="absolute left-4 top-5 w-4 h-4 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                                                            <textarea
                                                                required
                                                                name="description"
                                                                value={formData.description}
                                                                onChange={handleChange}
                                                                rows={6}
                                                                placeholder="Tell us about your business..."
                                                                className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-3xl text-slate-900 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:bg-white transition-all shadow-sm resize-none leading-relaxed"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2.5">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center justify-between">
                                                            Cover Image
                                                            <span className="text-[9px] text-slate-300 normal-case tracking-normal">Best for first impressions</span>
                                                        </label>
                                                        <div className="flex gap-4 items-start">
                                                            {formData.coverImageUrl && (
                                                                <div className="relative w-32 h-32 rounded-2xl overflow-hidden border-2 border-slate-100 flex-shrink-0 group">
                                                                    <img src={getImageUrl(formData.coverImageUrl) || ""} className="w-full h-full object-cover" />
                                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                        <label className="cursor-pointer">
                                                                            <ImagePlus className="w-5 h-5 text-white" />
                                                                            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                                                                        </label>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            <label className={`flex-1 flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-2xl transition-all cursor-pointer ${formData.coverImageUrl ? 'bg-slate-50/50 border-slate-200' : 'bg-orange-50/30 border-orange-200 hover:bg-orange-50/50'}`}>
                                                                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                                                                <div className="flex flex-col items-center gap-2 text-slate-400 group">
                                                                    <div className="p-3 rounded-xl bg-white border border-slate-100 text-orange-500 shadow-sm group-hover:scale-110 transition-transform">
                                                                        <ImagePlus className="w-4 h-4" />
                                                                    </div>
                                                                    <p className="text-[10px] font-black uppercase text-slate-500 mt-1">
                                                                        {formData.coverImageUrl ? 'Change Cover' : 'Upload Cover Photo'}
                                                                    </p>
                                                                </div>
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                        {activeTab === 'location' && (
                                            <motion.div key="location" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2.5">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">City</label>
                                                        <div className="relative group">
                                                            <select required name="city" value={formData.city} onChange={handleChange} className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:bg-white transition-all appearance-none cursor-pointer pr-10 shadow-sm">
                                                                {cities.map(city => (<option key={city.id} value={city.name}>{city.name}</option>))}
                                                            </select>
                                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg></div>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2.5">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">State</label>
                                                        <input required name="state" value={formData.state} onChange={handleChange} placeholder="State" className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:bg-white transition-all shadow-sm" />
                                                    </div>
                                                </div>

                                                <div className="space-y-2.5">
                                                    <div className="flex items-center justify-between">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Street Address / Area</label>
                                                        <button
                                                            type="button"
                                                            onClick={handleGetCurrentLocation}
                                                            className="flex items-center gap-1.5 text-[9px] font-black text-orange-600 uppercase tracking-widest hover:text-orange-700 transition-colors"
                                                        >
                                                            <MapPin className="w-3 h-3" /> Get Current Location
                                                        </button>
                                                    </div>
                                                    <div className="relative group">
                                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                                                        <input required ref={addressInputRef} name="address" value={formData.address} onChange={handleChange} placeholder="Search area or drag marker..." className="w-full pl-11 pr-10 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:bg-white transition-all shadow-sm" />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2.5">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Pincode</label>
                                                        <input required name="pincode" value={formData.pincode} onChange={handleChange} placeholder="50000" className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:bg-white transition-all shadow-sm" />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div className="space-y-2.5">
                                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Lat</label>
                                                            <input type="number" step="any" name="latitude" value={formData.latitude} onChange={handleChange} className="w-full px-3 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:bg-white transition-all shadow-sm" />
                                                        </div>
                                                        <div className="space-y-2.5">
                                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Long</label>
                                                            <input type="number" step="any" name="longitude" value={formData.longitude} onChange={handleChange} className="w-full px-3 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:bg-white transition-all shadow-sm" />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="h-48 rounded-2xl border-2 border-slate-200 overflow-hidden relative shadow-sm">
                                                    {mapError ? (
                                                        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-red-50 text-red-500">
                                                            <p className="text-sm font-bold">Google Maps failed to load.</p>
                                                            <p className="text-xs mt-1">Please check your API key geometry tracking.</p>
                                                        </div>
                                                    ) : !mapLoaded ? (
                                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50">
                                                            <Loader2 className="w-6 h-6 animate-spin text-orange-500 mb-2" />
                                                            <p className="text-xs font-bold text-slate-500">Loading Map...</p>
                                                        </div>
                                                    ) : null}
                                                    <div ref={mapContainerRef} className="w-full h-full bg-slate-100" />
                                                </div>
                                            </motion.div>
                                        )}

                                        {activeTab === 'media' && (
                                            <motion.div key="media" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-8">
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center justify-between">Gallery Images<span className="text-[9px] text-slate-300 normal-case tracking-normal">Showcase your business</span></label>
                                                    <div className="grid grid-cols-4 gap-3">
                                                        {galleryPreviews.map((url, idx) => (
                                                            <div key={idx} className="relative group aspect-square rounded-2xl overflow-hidden border-2 border-slate-100">
                                                                <img src={getImageUrl(url) || ""} className={`w-full h-full object-cover ${url.startsWith('blob:') ? 'opacity-50 grayscale' : ''}`} />
                                                                <button type="button" onClick={() => removeGalleryImage(idx)} className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:scale-110"><X className="w-3.5 h-3.5" /></button>
                                                            </div>
                                                        ))}
                                                        <label className="aspect-square border-2 border-dashed bg-orange-50/30 border-orange-200 hover:bg-orange-50/50 rounded-2xl transition-all cursor-pointer flex flex-col items-center justify-center gap-2 text-slate-400 group">
                                                            <input type="file" multiple accept="image/*" onChange={handleGalleryUpload} className="hidden" />
                                                            <div className="p-2 rounded-xl bg-white border border-slate-100 text-orange-500 shadow-sm group-hover:scale-110 transition-transform"><Plus className="w-4 h-4" /></div>
                                                            <span className="text-[9px] font-black uppercase text-slate-500">Add Photos</span>
                                                        </label>
                                                    </div>
                                                </div>

                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Business Amenities</label>
                                                        <button type="button" onClick={() => setShowAddAmenity(!showAddAmenity)} className="text-[10px] font-black uppercase tracking-widest text-orange-500 hover:text-orange-600 transition-colors flex items-center gap-1 bg-orange-50 px-2 py-1 rounded-lg"><Plus className="w-3 h-3" /> Add New</button>
                                                    </div>
                                                    {showAddAmenity && (
                                                        <div className="flex gap-2">
                                                            <input type="text" placeholder="e.g. Free WiFi" value={newAmenityName} onChange={(e) => setNewAmenityName(e.target.value)} className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold" onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAmenity())} />
                                                            <button type="button" onClick={handleAddAmenity} disabled={creatingAmenity || !newAmenityName.trim()} className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold">{creatingAmenity ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}</button>
                                                        </div>
                                                    )}
                                                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                                        {amenities.map((amenity) => {
                                                            const isSelected = formData.amenityIds.includes(String(amenity.id));
                                                            return (
                                                                <button key={amenity.id} type="button" onClick={() => toggleAmenity(amenity.id)} className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left group ${isSelected ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
                                                                    <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${isSelected ? 'bg-orange-500 text-white' : 'bg-white border'}`}>{isSelected && <Check className="w-3.5 h-3.5" />}</div>
                                                                    <span className="text-xs font-bold truncate">{amenity.name}</span>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>

                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center justify-between">
                                                        Search Keywords
                                                        <span className="text-[9px] text-slate-300 normal-case tracking-normal">max {maxKeywords} tags</span>
                                                    </label>
                                                    <div
                                                        onClick={() => keywordInputRef.current?.focus()}
                                                        className="min-h-[52px] flex flex-wrap gap-2 cursor-text p-3 bg-slate-50 border border-slate-200 rounded-2xl transition-all focus-within:ring-2 focus-within:ring-orange-400 focus-within:bg-white"
                                                    >
                                                        {keywords.map(kw => (
                                                            <span
                                                                key={kw}
                                                                className="inline-flex items-center gap-1.5 px-3 py-1 bg-white text-slate-700 border border-slate-200 shadow-sm rounded-lg text-xs font-bold transition-all hover:pr-1 group"
                                                            >
                                                                #{kw}
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => { e.stopPropagation(); removeKeyword(kw); }}
                                                                    className="w-0 overflow-hidden group-hover:w-4 transition-all flex items-center justify-center text-slate-400 hover:text-red-500"
                                                                >
                                                                    <X className="w-3 h-3" />
                                                                </button>
                                                            </span>
                                                        ))}
                                                        <input
                                                            ref={keywordInputRef}
                                                            type="text"
                                                            value={keywordInput}
                                                            onChange={e => setKeywordInput(e.target.value)}
                                                            onKeyDown={handleKeywordKeyDown}
                                                            onBlur={() => { if (keywordInput.trim()) addKeyword(keywordInput); }}
                                                            placeholder={keywords.length === 0 ? 'Type a keyword, press Enter…' : ''}
                                                            className="flex-1 min-w-[140px] bg-transparent outline-none text-sm font-semibold text-slate-700 placeholder:text-slate-400"
                                                        />
                                                    </div>
                                                </div>

                                            </motion.div>
                                        )}

                                        {activeTab === 'social' && (
                                            <motion.div key="social" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-8">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2.5">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Phone Number (*)</label>
                                                        <div className="relative group">
                                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                                                            <input required name="phone" value={formData.phone} onChange={handleChange} placeholder="+60..." className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:bg-white transition-all shadow-sm" />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2.5">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">WhatsApp Number</label>
                                                        <div className="relative group">
                                                            <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#25D366] transition-colors" />
                                                            <input name="whatsapp" value={formData.whatsapp} onChange={handleChange} placeholder="+60..." className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:bg-white transition-all shadow-sm" />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2.5 col-span-2">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Business Website</label>
                                                        <div className="relative group">
                                                            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                                            <input name="website" value={formData.website} onChange={handleChange} placeholder="https://..." className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all shadow-sm" />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-4 pt-4 border-t border-slate-100">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Social Media Profiles</label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {SOCIAL_PLATFORMS.map(p => {
                                                            const isSelected = !!socialLinks.find(s => s.platform === p.key);
                                                            return (
                                                                <button key={p.key} type="button" onClick={() => isSelected ? removeSocialLink(p.key) : addSocialLink(p.key)} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black transition-all ${isSelected ? 'text-white' : 'bg-slate-50 text-slate-500'}`} style={isSelected ? { backgroundColor: p.color } : {}}>
                                                                    <span className="text-[10px]">{isSelected ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}</span> {p.label}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>

                                                    <div className="space-y-3 pt-2">
                                                        {socialLinks.map(link => {
                                                            const platform = SOCIAL_PLATFORMS.find(p => p.key === link.platform);
                                                            if (!platform) return null;
                                                            return (
                                                                <div key={link.platform} className="flex items-center gap-2 group/link">
                                                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: platform.color }}>{platform.emoji}</div>
                                                                    <input type="url" value={link.url || ''} onChange={e => updateSocialUrl(link.platform, e.target.value)} placeholder={platform.placeholder} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                                                                    <button type="button" onClick={() => removeSocialLink(link.platform)} className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-red-50 text-slate-400 flex items-center justify-center"><X className="w-4 h-4" /></button>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}

                                        {activeTab === 'faqs' && (
                                            <motion.div key="faqs" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                                                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Question</label>
                                                        <input
                                                            type="text"
                                                            value={newFaq.question}
                                                            onChange={(e) => setNewFaq(prev => ({ ...prev, question: e.target.value }))}
                                                            placeholder="e.g. Do you offer home delivery?"
                                                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-orange-400 outline-none"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Answer</label>
                                                        <textarea
                                                            value={newFaq.answer}
                                                            onChange={(e) => setNewFaq(prev => ({ ...prev, answer: e.target.value }))}
                                                            placeholder="e.g. Yes, we offer free home delivery..."
                                                            rows={3}
                                                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-orange-400 outline-none resize-none"
                                                        />
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={addFaq}
                                                        disabled={!newFaq.question.trim() || !newFaq.answer.trim()}
                                                        className="w-full py-3 bg-white border-2 border-orange-500 text-orange-600 rounded-xl font-black text-sm hover:bg-orange-500 hover:text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                                    >
                                                        <Plus className="w-4 h-4" /> Add FAQ Item
                                                    </button>
                                                </div>

                                                <div className="space-y-3">
                                                    {(formData.faqs || []).map((faq, idx) => (
                                                        <div key={idx} className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm group">
                                                            <div className="flex justify-between gap-4">
                                                                <div className="flex-1 space-y-1">
                                                                    <h4 className="text-sm font-black text-slate-900 flex items-start gap-2">
                                                                        <span className="text-orange-500">Q.</span> {faq.question}
                                                                    </h4>
                                                                    <p className="text-xs text-slate-500 font-medium">
                                                                        <span className="text-blue-500 font-black">A.</span> {faq.answer}
                                                                    </p>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeFaq(idx)}
                                                                    className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {(!formData.faqs || formData.faqs.length === 0) && (
                                                        <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-2xl">
                                                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">No FAQs added yet</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <div className="p-6 border-t border-slate-100 bg-white/80 backdrop-blur-md">
                                    <button 
                                        disabled={loading || galleryUploading || (!business && !canAddListing)} 
                                        type="submit" 
                                        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-orange-500 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                                    >
                                        {loading || galleryUploading ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>
                                                <Store className="w-4 h-4" />
                                                {business ? 'Save Changes' : 'Publish Listing'}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
