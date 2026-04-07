"use client";

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { MapPin, ChevronDown, Check, Search, Navigation, Loader2 } from 'lucide-react';
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

    const selectedCity = useMemo(() => 
        cities.find(c => c.name === value), 
    [cities, value]);

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
                
                // Use Google Maps Geocoding if script is loaded
                if ((window as any).google && (window as any).google.maps) {
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
                                // Try to match with existing cities in our list
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
        <div className="relative h-full" ref={containerRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full h-full flex items-center justify-between px-6 py-6 bg-white text-slate-900 border-0 focus:outline-none focus:ring-2 focus:ring-[#FF7A30] transition-all shadow-inner"
                style={{ borderRadius: "10px" }}
            >
                <div className="flex items-center gap-3">
                    <MapPin className={`w-6 h-6 ${value ? 'text-[#FF7A30]' : 'text-slate-400'}`} />
                    <span className={`text-xl font-semibold truncate ${!value ? 'text-slate-400' : 'text-slate-900'}`}>
                        {value || placeholder}
                    </span>
                </div>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute z-[100] top-full left-0 right-0 mt-3 bg-white border border-slate-100 py-4 shadow-2xl overflow-hidden flex flex-col max-h-[450px]"
                        style={{ borderRadius: "10px" }}
                    >
                        {/* Auto-detect button */}
                        <div className="px-6 pb-4 border-b border-slate-50">
                            <button
                                onClick={handleAutoDetect}
                                disabled={isLocating}
                                className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-orange-50 hover:bg-orange-100 text-[#FF7A30] rounded-xl font-black text-sm transition-all disabled:opacity-50"
                            >
                                {isLocating ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Navigation className="w-4 h-4" />
                                )}
                                {isLocating ? 'Locating...' : 'Use Current Location'}
                            </button>
                        </div>

                        {/* Search input */}
                        <div className="p-4 px-6 border-b border-slate-50">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Search city..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#FF7A30]"
                                />
                            </div>
                        </div>

                        <div className="flex-grow overflow-y-auto p-2">
                            {filteredCities.length === 0 ? (
                                <div className="p-8 text-center">
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">No cities found</p>
                                </div>
                            ) : (
                                filteredCities.map(city => {
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
                                            className={`w-full flex items-center justify-between px-6 py-3.5 rounded-xl transition-all ${isSelected ? 'bg-orange-50 text-[#FF7A30]' : 'hover:bg-slate-50 text-slate-700'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <MapPin className="w-4 h-4" />
                                                <span className="text-base font-bold">{city.name}</span>
                                            </div>
                                            {isSelected && <Check className="w-4 h-4" />}
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
