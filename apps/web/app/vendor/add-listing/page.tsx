"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
    Loader2, Store, MapPin, Phone, TextQuote, Layers,
    ArrowLeft, CheckCircle, ImagePlus, Building2, Tag,
    FileText, Navigation, Sparkles, X, Images, Check, Plus,
    ChevronLeft, ChevronRight, Hash, Share2, Globe, Search, ChevronDown, HelpCircle, Trash2, Lock
} from 'lucide-react';
import { api, getImageUrl } from '../../../lib/api';
import { Category, City } from '../../../types/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';
import Link from 'next/link';

const steps = [
    { id: 1, label: 'Business Info', icon: Building2 },
    { id: 2, label: 'Location', icon: Navigation },
    { id: 3, label: 'Details', icon: FileText },
    { id: 4, label: 'FAQs', icon: HelpCircle },
];

const inputClass =
    "w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all placeholder:text-slate-400";

const selectClass =
    "w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all appearance-none cursor-pointer pr-10";

const labelClass = "block text-xs font-black uppercase tracking-widest text-slate-400 mb-2";

const SOCIAL_PLATFORMS = [
    { key: 'facebook', label: 'Facebook', emoji: '📘', color: '#1877F2', placeholder: 'https://facebook.com/yourbusiness' },
    { key: 'instagram', label: 'Instagram', emoji: '📸', color: '#E1306C', placeholder: 'https://instagram.com/yourbusiness' },
    { key: 'twitter', label: 'Twitter / X', emoji: '🐦', color: '#1DA1F2', placeholder: 'https://twitter.com/yourbusiness' },
    { key: 'linkedin', label: 'LinkedIn', emoji: '💼', color: '#0A66C2', placeholder: 'https://linkedin.com/company/yourbusiness' },
    { key: 'youtube', label: 'YouTube', emoji: '▶️', color: '#FF0000', placeholder: 'https://youtube.com/@yourbusiness' },
];

export default function AddListingPage() {
    const { user } = useAuth();
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
    const [mapError, setMapError] = useState(false);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [suggestions, setSuggestions] = useState<Category[]>([]);
    const [suggestionsLoading, setSuggestionsLoading] = useState(false);
    
    const activeSub = user?.vendor?.subscriptions?.find((sub: any) => sub.status === 'active');
    const features = activeSub?.plan?.dashboardFeatures || {};
    const isVendor = user?.role === 'vendor';

    useEffect(() => {
        if (typeof window !== 'undefined' && (window as any).google && (window as any).google.maps && (window as any).google.maps.marker && (window as any).google.maps.places) {
            setMapLoaded(true);
            return;
        }

        const interval = setInterval(() => {
            if (typeof window !== 'undefined' && (window as any).google && (window as any).google.maps && (window as any).google.maps.marker && (window as any).google.maps.places) {
                setMapLoaded(true);
                clearInterval(interval);
            }
        }, 500);

        return () => clearInterval(interval);
    }, []);

    // Handle Google Maps Authentication Failure (Invalid API Key)
    useEffect(() => {
        (window as any).gm_authFailure = () => {
            console.error('Google Maps authentication failed - check API Key.');
            setMapError(true);
        };
        return () => {
            delete (window as any).gm_authFailure;
        };
    }, []);

    // ── Social Links ─────────────────────────────────────────────────
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

    // ── Keywords ────────────────────────────────────────────────────
    const [keywords, setKeywords] = useState<string[]>([]);
    const [keywordInput, setKeywordInput] = useState('');
    const keywordInputRef = useRef<HTMLInputElement>(null);

    const addKeyword = (raw: string) => {
        const tag = raw.trim().toLowerCase().replace(/[,]+$/, '');
        if (tag && !keywords.includes(tag) && keywords.length < 20) {
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

    // Lightbox state
    const [showLightbox, setShowLightbox] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

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
        metaKeywords: '',
        whatsapp: '',
        website: '',
        suggestedCategoryName: '',
        faqs: [] as { question: string; answer: string }[],
    });

    const [newFaq, setNewFaq] = useState({ question: '', answer: '' });

    const addFaq = () => {
        if (!newFaq.question.trim() || !newFaq.answer.trim()) return;
        setFormData(prev => ({
            ...prev,
            faqs: [...prev.faqs, { ...newFaq }]
        }));
        setNewFaq({ question: '', answer: '' });
    };

    const removeFaq = (index: number) => {
        setFormData(prev => ({
            ...prev,
            faqs: prev.faqs.filter((_, i) => i !== index)
        }));
    };

    const autoCompleteRef = useRef<any>(null);
    const addressInputRef = useRef<HTMLInputElement>(null);
    const mapRef = useRef<any>(null);
    const markerRef = useRef<any>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const formDataRef = useRef(formData);

    // Keep ref in sync
    useEffect(() => {
        formDataRef.current = formData;
    }, [formData]);

    const updateLocationFromCoords = (lat: number, lng: number) => {
        setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));

        if (!(window as any).google || !(window as any).google.maps || !(window as any).google.maps.Geocoder) return;
        const geocoder = new (window as any).google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
            if (status === "OK" && results[0]) {
                const place = results[0];
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

                // Auto-sync category from Google types
                if (place.types && place.types.length > 0) {
                    handlePlaceTypes(place.types);
                }

                // Clean up address: try to remove city, state, country and pincode from the formatted address
                // to get just the "Area / Street" part.
                let cleanAddress = address;
                [city, state, "Pakistan", pincode].forEach(term => {
                    if (term) {
                        const regex = new RegExp(`,?\\s*${term}\\s*,?`, 'gi');
                        cleanAddress = cleanAddress.replace(regex, '').trim();
                    }
                });
                // Remove trailing commas
                cleanAddress = cleanAddress.replace(/,$/, '').trim();

                setFormData(prev => ({
                    ...prev,
                    address: cleanAddress || address,
                    city: city || prev.city,
                    state: state || prev.state,
                    pincode: pincode || prev.pincode,
                }));
            }
        });
    };

    const handlePlaceTypes = async (types: string[]) => {
        // Filter out generic types like 'establishment', 'point_of_interest'
        const excludedTypes = ['establishment', 'point_of_interest', 'political', 'street_address', 'premise'];
        const validTypes = types.filter(t => !excludedTypes.includes(t));

        if (validTypes.length === 0) return;

        const googleType = validTypes[0]; // e.g. "restaurant"

        try {
            const syncedCategory = await api.categories.syncGoogle(googleType);

            // Add to categories list if not already there
            setCategories(prev => {
                if (prev.find(c => c.id === syncedCategory.id)) return prev;
                return [...prev, syncedCategory];
            });

            // Auto-select the category
            setFormData(prev => ({ ...prev, categoryId: syncedCategory.id }));
        } catch (err) {
            console.error('Failed to sync Google category:', err);
        }
    };

    const initAutocomplete = () => {
        if (!mapLoaded || !(window as any).google || !(window as any).google.maps || !(window as any).google.maps.Map || !addressInputRef.current || !mapContainerRef.current) return;

        const defaultCenter = { lat: formData.latitude, lng: formData.longitude };

        if (!mapRef.current) {
            mapRef.current = new (window as any).google.maps.Map(mapContainerRef.current, {
                center: defaultCenter,
                zoom: 15,
                mapId: 'DEMO_MAP_ID',
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: false,
            });

            markerRef.current = new (window as any).google.maps.marker.AdvancedMarkerElement({
                position: defaultCenter,
                map: mapRef.current,
                gmpDraggable: true,
                title: "Drag to set location",
            });

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

            mapRef.current.addListener("click", (e: any) => {
                if (e.latLng) {
                    markerRef.current.position = e.latLng;
                    updateLocationFromCoords(e.latLng.lat(), e.latLng.lng());
                }
            });
        }

        if (!autoCompleteRef.current) {
            autoCompleteRef.current = new (window as any).google.maps.places.Autocomplete(
                addressInputRef.current,
                {
                    componentRestrictions: { country: "pk" },
                    fields: ["address_components", "geometry", "formatted_address", "types"],
                }
            );

            autoCompleteRef.current.addListener("place_changed", () => {
                try {
                    const place = autoCompleteRef.current.getPlace();
                    if (!place.geometry) return;

                    const lat = place.geometry.location.lat();
                    const lng = place.geometry.location.lng();

                    mapRef.current.setCenter({ lat, lng });
                    mapRef.current.setZoom(17);
                    markerRef.current.position = { lat, lng };

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

                    // Auto-sync category from Google types
                    if (place.types && place.types.length > 0) {
                        handlePlaceTypes(place.types);
                    }

                    // Clean up address
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
                    setMapError(true);
                }
            });
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
        if (activeStep === 2 && mapLoaded) {
            setTimeout(initAutocomplete, 100);
        }
    }, [activeStep, mapLoaded]);

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

    const getAISuggestion = async () => {
        if (!formData.title.trim()) {
            setError("Please enter a business title first for AI suggestion");
            return;
        }
        setSuggestionsLoading(true);
        try {
            const res = await api.categories.suggest(formData.title, formData.description);
            setSuggestions(res);
            if (res.length === 0) {
                setError("No specific categories found. Try adding more details to the description.");
            }
        } catch (err: any) {
            console.error('AI Suggestion failed:', err);
        } finally {
            setSuggestionsLoading(false);
        }
    };

    const validateStep1 = () => {
        if (!formData.title.trim() || formData.title.length < 2) return 'Business Title requires at least 2 characters';
        if (!formData.categoryId && !formData.suggestedCategoryName) return 'Please select a Business Category';
        if (formData.categoryId === 'other' && !formData.suggestedCategoryName.trim()) return 'Please enter the suggested category name';
        if (!phoneNumber || phoneNumber.length < 5) return 'A valid Phone Number is required';
        return null;
    };

    const validateStep2 = () => {
        if (!formData.state || formData.state === 'Other') return 'Please select a valid State';
        if (!formData.city || formData.city === 'Other') return 'Please select a valid City';
        if (!formData.address.trim() || formData.address.length < 5) return 'A detailed Area/Street address is required';
        if (!formData.pincode.trim()) return 'Pincode is required';
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Use the latest ref value to avoid stale closures
        const rawData = formDataRef.current;
        const submissionData: any = {
            ...rawData,
            phone: countryCode + phoneNumber
        };

        // Handle category suggestion
        if (submissionData.categoryId === 'other') {
            submissionData.categoryId = undefined;
        } else {
            submissionData.suggestedCategoryName = undefined;
        }

        // Filter out empty FAQs
        submissionData.faqs = (submissionData.faqs || []).filter((f: any) => f.question.trim() && f.answer.trim());

        // Clean up empty strings for optional URL/Email fields that might fail validation
        // class-validator @IsUrl() fails on empty strings even if @IsOptional()
        const fieldsToPrune = ['coverImageUrl', 'logoUrl', 'website', 'email', 'offerBannerUrl', 'whatsapp'];
        fieldsToPrune.forEach(field => {
            if (submissionData[field] === '') {
                delete submissionData[field];
            }
        });

        // Omit offer fields if no offer is enabled
        if (!submissionData.hasOffer) {
            delete submissionData.offerTitle;
            delete submissionData.offerDescription;
            delete submissionData.offerBadge;
            delete submissionData.offerExpiresAt;
            delete submissionData.offerBannerUrl;
        }

        console.log('[AddListing] Submitting listing data:', submissionData);

        try {
            await api.listings.create(submissionData);
            // Save social links to vendor profile
            const linksToSave = socialLinks.filter(s => s.url.trim());
            await api.vendors.updateProfile({ socialLinks: linksToSave });
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

            // Sequential upload but parallelized using Promise.all for the batch
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
        setFormData(prev => ({ ...prev, images: prev.images.filter((_: string, i: number) => i !== index) }));
    };

    const openLightbox = (index: number) => {
        setCurrentImageIndex(index);
        setShowLightbox(true);
    };

    const nextImage = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setCurrentImageIndex((prev) => (prev + 1) % galleryPreviews.length);
    };

    const prevImage = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setCurrentImageIndex((prev) => (prev - 1 + galleryPreviews.length) % galleryPreviews.length);
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

    if (isVendor && !features.canAddListing) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-white rounded-3xl border-2 border-dashed border-slate-100 mt-20">
                <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mb-6">
                    <Lock className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-3">Add New Listing</h2>
                <p className="text-slate-500 max-w-md mx-auto mb-8 font-bold leading-relaxed">
                    Expanding your business presence by adding new listings is a premium feature. Upgrade your plan to list more branches or services!
                </p>
                <Link href="/vendor/subscription" className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black tracking-tight hover:bg-black transition-all active:scale-95 shadow-xl shadow-slate-200">
                    Upgrade My Plan
                </Link>
            </div>
        );
    }

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

            <form onSubmit={handleSubmit} autoComplete="off">
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

                                    {/* AI Suggestions Display */}
                                    <AnimatePresence>
                                        {(suggestions.length > 0 || suggestionsLoading) && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="mt-3"
                                            >
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">AI Suggested Categories</span>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {suggestionsLoading ? (
                                                        [1, 2, 3].map(i => (
                                                            <div key={i} className="h-8 w-24 bg-slate-100 animate-pulse rounded-full" />
                                                        ))
                                                    ) : (
                                                        suggestions.map(cat => (
                                                            <button
                                                                key={cat.id}
                                                                type="button"
                                                                onClick={() => setFormData(prev => ({ ...prev, categoryId: cat.id }))}
                                                                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                                                                    formData.categoryId === cat.id
                                                                        ? 'bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-500/20'
                                                                        : 'bg-white border-slate-200 text-slate-600 hover:border-orange-300 hover:text-orange-500'
                                                                }`}
                                                            >
                                                                {cat.name}
                                                            </button>
                                                        ))
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <button
                                        type="button"
                                        onClick={getAISuggestion}
                                        disabled={suggestionsLoading || !formData.title.trim()}
                                        className="mt-3 flex items-center gap-2 text-xs font-bold text-orange-500 hover:text-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
                                    >
                                        <div className="w-6 h-6 rounded-lg bg-orange-50 flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                                            {suggestionsLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                                        </div>
                                        {suggestionsLoading ? 'AI is thinking...' : 'Get AI Category Suggestions'}
                                    </button>
                                </div>

                                {formData.categoryId === 'other' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                    >
                                        <label className={labelClass}>
                                            <Sparkles className="w-3 h-3 inline mr-1.5 text-orange-500" />
                                            Suggested Category Name <span className="text-orange-500">*</span>
                                        </label>
                                        <input
                                            name="suggestedCategoryName"
                                            value={formData.suggestedCategoryName}
                                            onChange={handleChange}
                                            placeholder="e.g. Pet Grooming, Yoga Studio"
                                            className={inputClass}
                                        />
                                        <p className="mt-2 text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                                            Admin will review and create this category if appropriate.
                                        </p>
                                    </motion.div>
                                )}

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

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className={labelClass}>
                                            <Globe className="w-3 h-3 inline mr-1.5 text-orange-500" />
                                            WhatsApp Number
                                        </label>
                                        <input
                                            type="tel"
                                            name="whatsapp"
                                            value={formData.whatsapp}
                                            onChange={handleChange}
                                            placeholder="e.g. +60123456789"
                                            className={inputClass}
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClass}>
                                            <Globe className="w-3 h-3 inline mr-1.5 text-orange-500" />
                                            Business Website
                                        </label>
                                        <input
                                            type="url"
                                            name="website"
                                            value={formData.website}
                                            onChange={handleChange}
                                            placeholder="https://..."
                                            className={inputClass}
                                        />
                                    </div>
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
                                        <p className="text-[11px] text-slate-400 font-medium">Up to 24 photos · PNG, JPG</p>
                                    </div>
                                </div>
                                <span className="text-xs font-black text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">{galleryPreviews.length}/24</span>
                            </div>
                            <div className="p-6">
                                {/* Preview Grid */}
                                {galleryPreviews.length > 0 && (
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                                        {galleryPreviews.map((src, i) => (
                                            <div
                                                key={i}
                                                onClick={() => openLightbox(i)}
                                                className="relative group rounded-xl overflow-hidden aspect-square bg-slate-100 cursor-pointer"
                                            >
                                                <img src={src} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            removeGalleryImage(i);
                                                        }}
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
                                        {galleryPreviews.length < 24 && (
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
                                                    <p className="text-xs mt-1 text-slate-400">Select multiple images at once · Max 24</p>
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
                            onClick={() => {
                                const err = validateStep1();
                                if (err) {
                                    setError(err);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                    return;
                                }
                                setError(null);
                                setActiveStep(2);
                            }}
                            className="w-full py-4 bg-gradient-to-r from-[#0B2244] to-[#0D2E61] text-white rounded-2xl font-black text-base  hover:shadow-blue-900/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
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
                        {/* Location Details */}
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                                        <MapPin className="w-4 h-4 text-orange-500" />
                                    </div>
                                    <h3 className="font-black text-slate-900">Location Details</h3>
                                </div>
                                {mapError && (
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                        ⚠ Map Limited
                                    </div>
                                )}
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Left: Form Fields */}
                                    <div className="space-y-5">
                                        {/* Address Search */}
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <label className={labelClass + " mb-0"}>
                                                    <Navigation className="w-3 h-3 inline mr-1.5 text-orange-500" />
                                                    Search Address (Google Maps) <span className="text-orange-500">*</span>
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={handleGetCurrentLocation}
                                                    className="flex items-center gap-1.5 text-[10px] font-black text-orange-600 uppercase tracking-widest hover:text-orange-700 transition-colors"
                                                >
                                                    <MapPin className="w-3 h-3" /> Get Current Location
                                                </button>
                                            </div>
                                            <div className="relative">
                                                <input
                                                    ref={addressInputRef}
                                                    type="text"
                                                    placeholder="Start typing your address..."
                                                    className={inputClass}
                                                />
                                                <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                            </div>
                                            <p className="text-[10px] text-slate-400 mt-1 font-medium italic">
                                                Select from suggestions to move map
                                            </p>
                                        </div>

                                        {/* State Selection */}
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
                                                    <option value="">-- Select State --</option>
                                                    {cities.length > 0 ? (
                                                        Array.from(new Set(cities.filter(c => c.state).map(c => c.state)))
                                                            .sort()
                                                            .map(s => <option key={s} value={s!}>{s}</option>)
                                                    ) : (
                                                        <>
                                                            <option value="Punjab">Punjab</option>
                                                            <option value="Sindh">Sindh</option>
                                                            <option value="KPK">KPK</option>
                                                            <option value="Balochistan">Balochistan</option>
                                                            <option value="Islamabad">Islamabad</option>
                                                        </>
                                                    )}
                                                    <option value="Other">Other</option>
                                                </select>
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                                    <ChevronDown className="w-4 h-4 text-slate-400" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* City Selection */}
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
                                                    {cities
                                                        .filter(c => !formData.state || c.state === formData.state)
                                                        .sort((a, b) => a.name.localeCompare(b.name))
                                                        .map(c => <option key={c.id} value={c.name}>{c.name}</option>)
                                                    }
                                                    <option value="Other">Other</option>
                                                </select>
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                                    <ChevronDown className="w-4 h-4 text-slate-400" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Area / Street */}
                                        <div>
                                            <label className={labelClass}>Area / Street <span className="text-orange-500">*</span></label>
                                            <input
                                                required
                                                name="address"
                                                value={formData.address}
                                                onChange={handleChange}
                                                placeholder="e.g. 123 Street name, Area"
                                                className={inputClass}
                                            />
                                        </div>

                                        {/* Pincode & Coordinates */}
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
                                                <label className={labelClass}>Coordinates {mapError && <span className="text-amber-500 font-bold ml-1">(Manual Entry)</span>}</label>
                                                <div className="flex gap-2">
                                                    <input
                                                        name="latitude"
                                                        type={mapError ? "number" : "text"}
                                                        step="any"
                                                        readOnly={!mapError}
                                                        value={mapError ? formData.latitude : (formData.latitude ? formData.latitude.toFixed(4) : '')}
                                                        onChange={handleChange}
                                                        placeholder="Lat"
                                                        className={`${inputClass} ${mapError ? 'bg-white ring-1 ring-amber-100' : 'bg-slate-50'} text-[10px] px-2`}
                                                    />
                                                    <input
                                                        name="longitude"
                                                        type={mapError ? "number" : "text"}
                                                        step="any"
                                                        readOnly={!mapError}
                                                        value={mapError ? formData.longitude : (formData.longitude ? formData.longitude.toFixed(4) : '')}
                                                        onChange={handleChange}
                                                        placeholder="Long"
                                                        className={`${inputClass} ${mapError ? 'bg-white ring-1 ring-amber-100' : 'bg-slate-50'} text-[10px] px-2`}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Map Preview */}
                                    <div className="relative min-h-[350px] lg:min-h-full rounded-2xl overflow-hidden border border-slate-100 bg-slate-50">
                                        <div ref={mapContainerRef} className={`absolute inset-0 w-full h-full ${mapError ? 'opacity-20 blur-sm grayscale pointer-events-none' : ''}`} />

                                        {mapError && (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-white/40 backdrop-blur-[2px]">
                                                <div className="w-12 h-12 bg-white rounded-2xl shadow-lg flex items-center justify-center mb-3">
                                                    <MapPin className="w-6 h-6 text-amber-500" />
                                                </div>
                                                <h4 className="text-sm font-black text-slate-900 mb-1">Interactive Map Preview Restricted</h4>
                                                <p className="text-[10px] text-slate-500 font-medium max-w-[200px] mb-4">
                                                    API configuration issue prevents the map from loading. You can still enter your address manually.
                                                </p>
                                                <a
                                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${formData.address} ${formData.city} ${formData.state}`.trim() || 'Pakistan')}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-[10px] flex items-center gap-2 hover:bg-slate-800 transition-all shadow-md"
                                                >
                                                    <Globe className="w-3 h-3" /> View On Maps
                                                </a>
                                            </div>
                                        )}

                                        {!mapError && (
                                            <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                                                <p className="text-[10px] font-black text-slate-600 uppercase tracking-tighter flex items-center gap-1.5">
                                                    <Navigation className="w-3 h-3 text-orange-500" />
                                                    Drag marker to adjust location
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setActiveStep(1)}
                                className="flex-1 py-4 bg-slate-100 text-slate-700 rounded-2xl font-black text-base hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                            >
                                <ArrowLeft className="w-4 h-4" /> Back
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    const err = validateStep2();
                                    if (err) {
                                        setError(err);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                        return;
                                    }
                                    setError(null);
                                    setActiveStep(3);
                                }}
                                className="flex-[2] py-4 bg-gradient-to-r from-[#0B2244] to-[#0D2E61] text-white rounded-2xl font-black text-base transition-all flex items-center justify-center gap-2"
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


                        {/* ── Social Media Links ───────────────────────────── */}
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center">
                                    <Share2 className="w-4 h-4 text-pink-500" />
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-900">Social Media Links</h3>
                                    <p className="text-[11px] text-slate-400 font-medium">Connect your social profiles · optional</p>
                                </div>
                            </div>
                            <div className="p-6">
                                {/* Platform picker */}
                                <p className={labelClass}>Select platforms</p>
                                <div className="flex flex-wrap gap-2 mb-5">
                                    {SOCIAL_PLATFORMS.map(p => {
                                        const isSelected = !!socialLinks.find(s => s.platform === p.key);
                                        return (
                                            <button
                                                key={p.key}
                                                type="button"
                                                onClick={() => isSelected ? removeSocialLink(p.key) : addSocialLink(p.key)}
                                                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black border transition-all ${isSelected
                                                    ? 'text-white border-transparent shadow-sm'
                                                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                                                    }`}
                                                style={isSelected ? { backgroundColor: p.color, borderColor: p.color } : {}}
                                            >
                                                <span className="text-sm">{p.emoji}</span>
                                                {p.label}
                                                {isSelected && <X className="w-3 h-3 ml-0.5 opacity-80" />}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* URL inputs for selected platforms */}
                                {socialLinks.length > 0 && (
                                    <div className="space-y-3">
                                        <p className={labelClass}>Enter your profile URLs</p>
                                        {socialLinks.map(link => {
                                            const platform = SOCIAL_PLATFORMS.find(p => p.key === link.platform)!;
                                            return (
                                                <div key={link.platform} className="flex items-center gap-3">
                                                    <div
                                                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-base shadow-sm"
                                                        style={{ backgroundColor: platform.color + '18', border: `1.5px solid ${platform.color}30` }}
                                                    >
                                                        {platform.emoji}
                                                    </div>
                                                    <input
                                                        type="url"
                                                        value={link.url}
                                                        onChange={e => updateSocialUrl(link.platform, e.target.value)}
                                                        placeholder={platform.placeholder}
                                                        className={`${inputClass} flex-1`}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeSocialLink(link.platform)}
                                                        className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-400 flex items-center justify-center transition-colors flex-shrink-0"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {socialLinks.length === 0 && (
                                    <div className="flex flex-col items-center gap-2 py-6 text-slate-400">
                                        <Globe className="w-8 h-8 opacity-20" />
                                        <p className="text-xs font-bold">Click a platform above to add your social links</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ── Search Keywords ──────────────────────────────── */}
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                                    <Hash className="w-4 h-4 text-orange-500" />
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-900">Search Keywords</h3>
                                    <p className="text-[11px] text-slate-400 font-medium">Help customers find you · max 20 keywords</p>
                                </div>
                            </div>
                            <div className="p-6 space-y-3">
                                {/* Tag input box */}
                                <div
                                    onClick={() => keywordInputRef.current?.focus()}
                                    className="min-h-[56px] flex flex-wrap gap-2 cursor-text p-3 bg-slate-50 border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-orange-400 focus-within:border-transparent transition-all"
                                >
                                    {keywords.map(kw => (
                                        <span
                                            key={kw}
                                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-orange-700 border border-orange-200 rounded-full text-xs font-black"
                                        >
                                            #{kw}
                                            <button
                                                type="button"
                                                onClick={e => { e.stopPropagation(); removeKeyword(kw); }}
                                                className="w-3.5 h-3.5 rounded-full bg-orange-200 hover:bg-orange-400 flex items-center justify-center transition-colors"
                                            >
                                                <X className="w-2 h-2" />
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
                                        placeholder={keywords.length === 0 ? 'Type keyword, press Enter or comma to add…' : ''}
                                        className="flex-1 min-w-[160px] bg-transparent outline-none text-sm font-semibold text-slate-700 placeholder:text-slate-300"
                                    />
                                </div>
                                <p className="text-[11px] text-slate-400 font-medium">
                                    ✨ Keywords boost your listing to the <strong>top of search results</strong> when customers search for those terms.
                                </p>
                                <p className="text-[11px] text-slate-400">
                                    e.g. <span className="italic">home delivery · open 24 hours · best biryani · bridal makeup · free wifi</span>
                                </p>
                            </div>
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
                                type="button"
                                onClick={() => {
                                    if (!formData.description.trim() || formData.description.length < 10) {
                                        setError('Please provide a description with at least 10 characters');
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                        return;
                                    }
                                    setError(null);
                                    setActiveStep(4);
                                }}
                                className="flex-[2] py-4 bg-gradient-to-r from-[#0B2244] to-[#0D2E61] text-white rounded-2xl font-black text-base transition-all flex items-center justify-center gap-2"
                            >
                                Continue to FAQs <HelpCircle className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* ── STEP 4: FAQs & Publish ── */}
                {activeStep === 4 && (
                    <motion.div
                        key="step4"
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                                    <HelpCircle className="w-4 h-4 text-orange-500" />
                                </div>
                                <h3 className="font-black text-slate-900">Frequently Asked Questions</h3>
                            </div>
                            <div className="p-6 space-y-6">
                                {/* FAQ Form */}
                                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                                    <div className="space-y-2">
                                        <label className={labelClass}>Question</label>
                                        <input
                                            type="text"
                                            value={newFaq.question}
                                            onChange={(e) => setNewFaq(prev => ({ ...prev, question: e.target.value }))}
                                            placeholder="e.g. Do you offer home delivery?"
                                            className={inputClass}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className={labelClass}>Answer</label>
                                        <textarea
                                            value={newFaq.answer}
                                            onChange={(e) => setNewFaq(prev => ({ ...prev, answer: e.target.value }))}
                                            placeholder="e.g. Yes, we offer free home delivery within 5km radius."
                                            rows={3}
                                            className={`${inputClass} resize-none`}
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={addFaq}
                                        disabled={!newFaq.question.trim() || !newFaq.answer.trim()}
                                        className="w-full py-3 bg-white border-2 border-orange-500 text-orange-600 rounded-xl font-black text-sm hover:bg-orange-500 hover:text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Plus className="w-4 h-4" /> Add FAQ Item
                                    </button>
                                </div>

                                {/* FAQ List */}
                                <div className="space-y-3">
                                    <AnimatePresence>
                                        {formData.faqs.map((faq, idx) => (
                                            <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-slate-200 transition-all group"
                                            >
                                                <div className="flex justify-between gap-4">
                                                    <div className="flex-1 space-y-1">
                                                        <h4 className="text-sm font-black text-slate-900 flex items-start gap-2">
                                                            <span className="text-orange-500">Q.</span> {faq.question}
                                                        </h4>
                                                        <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                                            <span className="text-blue-500 font-black">A.</span> {faq.answer}
                                                        </p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFaq(idx)}
                                                        className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>

                                    {formData.faqs.length === 0 && (
                                        <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-2xl">
                                            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                                <HelpCircle className="w-6 h-6 text-slate-300" />
                                            </div>
                                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">No FAQs added yet</p>
                                            <p className="text-[10px] text-slate-400 mt-1">Help your customers by answering common questions.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setActiveStep(3)}
                                className="flex-1 py-4 bg-slate-100 text-slate-700 rounded-2xl font-black text-base hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                            >
                                <ArrowLeft className="w-4 h-4" /> Back
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-[2] py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl font-black text-base hover:shadow-orange-500/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 shadow-xl"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Publishing Listing...
                                    </>
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

            <AnimatePresence>
                {showLightbox && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-10"
                        onClick={() => setShowLightbox(false)}
                    >
                        <button
                            className="absolute top-6 right-6 z-[110] w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-all border border-white/10"
                            onClick={() => setShowLightbox(false)}
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="relative w-full max-w-5xl aspect-video md:aspect-[16/9] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                            <button
                                type="button"
                                className="absolute left-0 -translate-x-full md:-translate-x-20 z-[110] w-14 h-14 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-all border border-white/10"
                                onClick={prevImage}
                            >
                                <ChevronLeft className="w-8 h-8" />
                            </button>

                            <motion.div
                                key={currentImageIndex}
                                initial={{ opacity: 0, scale: 0.95, x: 20 }}
                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.95, x: -20 }}
                                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                className="w-full h-full rounded-[20px] overflow-hidden border border-white/10 shadow-2xl"
                            >
                                <img
                                    src={galleryPreviews[currentImageIndex]}
                                    className="w-full h-full object-contain bg-black/50"
                                    alt="Gallery selection"
                                />
                            </motion.div>

                            <button
                                type="button"
                                className="absolute right-0 translate-x-full md:translate-x-20 z-[110] w-14 h-14 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-all border border-white/10"
                                onClick={nextImage}
                            >
                                <ChevronRight className="w-8 h-8" />
                            </button>

                            {/* Thumbnails Indicator */}
                            <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 flex gap-3">
                                {galleryPreviews.map((_, i) => (
                                    <button
                                        type="button"
                                        key={i}
                                        onClick={() => setCurrentImageIndex(i)}
                                        className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${i === currentImageIndex ? 'bg-orange-500 w-8' : 'bg-white/20 hover:bg-white/40'}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
