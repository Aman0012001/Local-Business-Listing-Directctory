"use client";

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { MapPin, ChevronDown, Check, Search, Navigation, Loader2, Signal } from 'lucide-react';
import { City } from '../types/api';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
    cities: City[];
    value: string;
    onChange: (cityName: string) => void;
    placeholder?: string;
}

export default function CitySearchSelect({ cities, value, onChange, placeholder = "Select City" }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [isLocating, setIsLocating] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const filteredCities = useMemo(() => {
        if (!search.trim()) return cities;
        const q = search.toLowerCase();
        return cities.filter(c => c.name.toLowerCase().includes(q));
    }, [cities, search]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleAutoDetect = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                
                if ((window as any).google && (window as any).google.maps && (window as any).google.maps.Geocoder) {
                    const geocoder = new (window as any).google.maps.Geocoder();
                    geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results: any, status: any) => {
                        if (status === "OK" && results[0]) {
                            const place = results[0];
                            let detectedCity = '';
                            place.address_components?.forEach((component: any) => {
                                if (component.types.includes("locality")) {
                                    detectedCity = component.long_name;
                                } else if (component.types.includes("administrative_area_level_2") && !detectedCity) {
                                    detectedCity = component.long_name;
                                }
                            });

                            if (detectedCity) {
                                const matched = cities.find(c => 
                                    c.name.toLowerCase() === detectedCity.toLowerCase() ||
                                    c.name.toLowerCase().includes(detectedCity.toLowerCase())
                                );
                                if (matched) {
                                    onChange(matched.name);
                                } else {
                                    onChange(detectedCity);
                                }
                            }
                        }
                        setIsLocating(false);
                        setIsOpen(false);
                    });
                } else {
                    setIsLocating(false);
                }
            },
            (error) => {
                console.error("Error getting location:", error);
                setIsLocating(false);
                alert("Could not get your location. Please select manually.");
            },
            { enableHighAccuracy: true }
        );
    };

    return (
        <div className="relative w-full" ref={containerRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between px-6 py-4 bg-white transition-all duration-300 group shadow-sm ${
                    isOpen ? 'rounded-t-[12px] ring-2 ring-orange-500' : 'rounded-[12px] hover:shadow-md'
                }`}
            >
                <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-xl transition-colors ${value ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-300'}`}>
                        <MapPin className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                        <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0">Your Area</span>
                        <span className={`text-lg font-bold truncate block leading-tight ${!value ? 'text-slate-300' : 'text-slate-900'}`}>
                            {value || placeholder}
                        </span>
                    </div>
                </div>
                <ChevronDown className={`w-5 h-5 text-slate-300 transition-transform duration-500 ${isOpen ? 'rotate-180 text-orange-500' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 4, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                        className="absolute z-[100] top-full left-0 right-0 bg-white border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[400px] rounded-b-[12px]"
                    >
                        {/* Auto-detect button */}
                        <div className="p-6 pb-2">
                            <button
                                onClick={handleAutoDetect}
                                disabled={isLocating}
                                className="w-full relative group overflow-hidden py-5 px-6 bg-slate-900 hover:bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-500 disabled:opacity-50 flex items-center justify-center gap-3 shadow-lg hover:shadow-blue-200"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                                {isLocating ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <div className="relative">
                                        <Navigation className="w-4 h-4" />
                                        <motion.div 
                                            animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
                                            transition={{ repeat: Infinity, duration: 2 }}
                                            className="absolute inset-0 bg-white rounded-full -z-10"
                                        />
                                    </div>
                                )}
                                {isLocating ? 'Scanning Area...' : 'Auto-Detect Location'}
                            </button>
                        </div>

                        {/* Search input */}
                        <div className="p-6 pb-4">
                            <div className="relative">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Which city are you in?"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="w-full pl-14 pr-6 py-5 bg-slate-50 border-none rounded-2xl text-base font-bold text-slate-900 focus:ring-4 focus:ring-blue-100 placeholder:text-slate-300 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex-grow overflow-y-auto px-4 pb-6 custom-scrollbar">
                            {filteredCities.length === 0 ? (
                                <div className="py-12 text-center">
                                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <Signal className="w-8 h-8 text-slate-200" />
                                    </div>
                                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">No city found</p>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {filteredCities.map(city => {
                                        const isSelected = city.name === value;
                                        return (
                                            <button
                                                key={city.id}
                                                type="button"
                                                onClick={() => {
                                                    onChange(city.name);
                                                    setIsOpen(false);
                                                    setSearch('');
                                                }}
                                                className={`w-full flex items-center justify-between px-6 py-4 rounded-xl transition-all duration-300 ${
                                                    isSelected 
                                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
                                                        : 'hover:bg-slate-50 text-slate-600 font-bold'
                                                }`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <MapPin className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-300'}`} />
                                                    <span className="text-base font-bold tracking-tight">{city.name}</span>
                                                </div>
                                                {isSelected && <Check className="w-5 h-5 animate-in zoom-in" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
