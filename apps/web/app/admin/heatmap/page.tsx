"use client";

import React, { useEffect, useState, useRef } from 'react';
import { api } from '../../../lib/api';
import { Map as MapIcon, RefreshCcw, Navigation, Search } from 'lucide-react';
import { MarkerClusterer } from '@googlemaps/markerclusterer';

export default function SearchHeatmapPage() {
    const [heatmapData, setHeatmapData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [mapLoaded, setMapLoaded] = useState(false);

    const mapRef = useRef<HTMLDivElement>(null);
    const googleMapRef = useRef<google.maps.Map | null>(null);
    const markerClustererRef = useRef<MarkerClusterer | null>(null);

    const fetchHeatmapData = async () => {
        setLoading(true);
        try {
            const data = await api.admin.getHeatmapData(startDate || undefined, endDate || undefined);
            setHeatmapData(data);
        } catch (error) {
            console.error('Failed to fetch heatmap data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Check if Google Maps API is loaded
    useEffect(() => {
        const checkMap = () => {
            if (typeof window !== 'undefined' && window.google?.maps?.marker) {
                setMapLoaded(true);
            } else {
                const timer = setTimeout(checkMap, 500);
                return () => clearTimeout(timer);
            }
        };
        return checkMap();
    }, []);

    useEffect(() => {
        fetchHeatmapData();
    }, []);

    useEffect(() => {
        if (mapLoaded && mapRef.current && !googleMapRef.current) {
            const map = new google.maps.Map(mapRef.current, {
                zoom: 5,
                center: { lat: 30.3753, lng: 69.3451 },
                mapId: '9bbf977755b39e6a', // Re-using the styling from the Analytics page
            });
            googleMapRef.current = map;
        }
    }, [mapLoaded]);

    useEffect(() => {
        if (googleMapRef.current && heatmapData.length > 0) {
            if (markerClustererRef.current) {
                markerClustererRef.current.clearMarkers();
            }

            const markers = heatmapData.map((point) => {
                const position = { lat: point.latitude, lng: point.longitude };

                const markerContainer = document.createElement('div');
                markerContainer.className = 'w-3 h-3 rounded-full bg-blue-600/70 border border-white shadow-sm';
                
                return new google.maps.marker.AdvancedMarkerElement({
                    map: googleMapRef.current,
                    position,
                    content: markerContainer,
                    title: `Searched: ${point.keyword} (Count: ${point.weight})`
                });
            });

            markerClustererRef.current = new MarkerClusterer({
                map: googleMapRef.current,
                markers,
                renderer: {
                    render: ({ count, position }) => {
                        // Intensity-based colors specifically for heatmap styling
                        const color = count > 50 ? '#ef4444' : count > 20 ? '#eab308' : '#3b82f6';
                        const size = 30 + Math.min(count, 40);
                        
                        const div = document.createElement('div');
                        div.style.backgroundColor = color;
                        div.style.color = 'white';
                        div.style.borderRadius = '50%';
                        div.style.width = `${size}px`;
                        div.style.height = `${size}px`;
                        div.style.display = 'flex';
                        div.style.alignItems = 'center';
                        div.style.justifyContent = 'center';
                        div.style.fontSize = '12px';
                        div.style.fontWeight = 'bold';
                        div.style.opacity = '0.9';
                        div.style.border = '2px solid rgba(255,255,255,0.8)';
                        div.style.boxShadow = '0 4px 10px rgba(0,0,0,0.2)';
                        div.textContent = count.toString();
                        
                        return new google.maps.marker.AdvancedMarkerElement({
                            position,
                            content: div,
                        });
                    }
                }
            });
        } else if (googleMapRef.current && heatmapData.length === 0) {
            if (markerClustererRef.current) {
                markerClustererRef.current.clearMarkers();
            }
        }
    }, [heatmapData, mapLoaded]);

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        fetchHeatmapData();
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
                        Search <span className="text-red-500">Heatmap</span>
                    </h1>
                    <p className="text-slate-500 font-medium flex items-center gap-2">
                        <MapIcon className="w-4 h-4 text-red-500" />
                        Super Admin view for regional search origins and keyword densities.
                    </p>
                </div>

                <form onSubmit={handleFilter} className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl p-2 px-4 shadow-sm">
                        <span className="text-sm font-bold text-slate-500">From:</span>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="bg-transparent border-none focus:ring-0 text-sm font-semibold outline-none text-slate-700"
                        />
                    </div>
                    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl p-2 px-4 shadow-sm">
                        <span className="text-sm font-bold text-slate-500">To:</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="bg-transparent border-none focus:ring-0 text-sm font-semibold outline-none text-slate-700"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="p-3 bg-red-500 text-white rounded-2xl hover:bg-red-600 disabled:opacity-50 transition-all active:scale-95 shadow-lg shadow-red-200 min-w-[50px] flex items-center justify-center"
                    >
                        <RefreshCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </form>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm relative">
                <div
                    ref={mapRef}
                    className="w-full h-[600px] rounded-3xl overflow-hidden bg-slate-100 border-4 border-slate-50 relative"
                />

                {loading && (
                    <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center rounded-[2rem] z-10">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
                            <p className="font-bold text-slate-900 tracking-tight">Fetching Coordinates...</p>
                        </div>
                    </div>
                )}

                {!loading && heatmapData.length === 0 && (
                    <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none z-10">
                        <div className="bg-white/95 backdrop-blur-xl px-10 py-12 rounded-[2.5rem] shadow-2xl border border-slate-100/50 text-center max-w-sm pointer-events-auto">
                            <div className="w-16 h-16 bg-red-50/50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                <Search className="w-8 h-8 text-red-500/50" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 mb-2">No Searches Found</h3>
                            <p className="text-slate-500 font-bold text-sm leading-relaxed">
                                No search location data is available for the selected dates.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
