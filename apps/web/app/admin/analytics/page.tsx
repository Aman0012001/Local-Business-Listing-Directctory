"use client";

import React, { useEffect, useState, useRef } from 'react';
import { api } from '../../../lib/api';
import Script from 'next/script';
import { 
    Search, 
    TrendingUp, 
    Map as MapIcon, 
    Filter, 
    RefreshCcw,
    MapPin,
    MousePointer2,
    BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SearchAnalyticsPage() {
    const [heatmapData, setHeatmapData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [keyword, setKeyword] = useState('');
    const [mapLoaded, setMapLoaded] = useState(false);
    const [stats, setStats] = useState({
        totalSearches: 0,
        uniqueLocations: 0,
        topKeyword: 'N/A'
    });
    
    const mapRef = useRef<HTMLDivElement>(null);
    const googleMapRef = useRef<google.maps.Map | null>(null);
    const heatmapLayerRef = useRef<google.maps.visualization.HeatmapLayer | null>(null);

    const fetchHeatmapData = async () => {
        setLoading(true);
        try {
            const data = await api.demand.getHeatmap(keyword);
            setHeatmapData(data);
            
            // Calculate some basic stats from the heatmap data
            const total = data.reduce((acc, curr) => acc + parseInt(curr.intensity), 0);
            const top = data.length > 0 ? data.sort((a,b) => parseInt(b.intensity) - parseInt(a.intensity))[0].keyword : 'N/A';
            
            setStats({
                totalSearches: total,
                uniqueLocations: data.length,
                topKeyword: top || 'N/A'
            });
        } catch (error) {
            console.error('Failed to fetch heatmap data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHeatmapData();
    }, []);

    useEffect(() => {
        if (mapLoaded && mapRef.current && !googleMapRef.current) {
            const map = new google.maps.Map(mapRef.current, {
                zoom: 5,
                center: { lat: 30.3753, lng: 69.3451 }, // Center on Pakistan as default base
                mapId: '9bbf977755b39e6a', // Use a custom Map ID for advanced styling if available
                styles: [
                    { "elementType": "geometry", "stylers": [{ "color": "#242f3e" }] },
                    { "elementType": "labels.text.stroke", "stylers": [{ "color": "#242f3e" }] },
                    { "elementType": "labels.text.fill", "stylers": [{ "color": "#746855" }] },
                    {
                        "featureType": "administrative.locality",
                        "elementType": "labels.text.fill",
                        "stylers": [{ "color": "#d59563" }]
                    },
                    {
                        "featureType": "poi",
                        "elementType": "labels.text.fill",
                        "stylers": [{ "color": "#d59563" }]
                    },
                    {
                        "featureType": "poi.park",
                        "elementType": "geometry",
                        "stylers": [{ "color": "#263c3f" }]
                    },
                    {
                        "featureType": "poi.park",
                        "elementType": "labels.text.fill",
                        "stylers": [{ "color": "#6b9a76" }]
                    },
                    {
                        "featureType": "road",
                        "elementType": "geometry",
                        "stylers": [{ "color": "#38414e" }]
                    },
                    {
                        "featureType": "road",
                        "elementType": "geometry.stroke",
                        "stylers": [{ "color": "#212a37" }]
                    },
                    {
                        "featureType": "road",
                        "elementType": "labels.text.fill",
                        "stylers": [{ "color": "#9ca5b3" }]
                    },
                    {
                        "featureType": "road.highway",
                        "elementType": "geometry",
                        "stylers": [{ "color": "#746855" }]
                    },
                    {
                        "featureType": "road.highway",
                        "elementType": "geometry.stroke",
                        "stylers": [{ "color": "#1f2835" }]
                    },
                    {
                        "featureType": "road.highway",
                        "elementType": "labels.text.fill",
                        "stylers": [{ "color": "#f3d19c" }]
                    },
                    {
                        "featureType": "water",
                        "elementType": "geometry",
                        "stylers": [{ "color": "#17263c" }]
                    },
                    {
                        "featureType": "water",
                        "elementType": "labels.text.fill",
                        "stylers": [{ "color": "#515c6d" }]
                    },
                    {
                        "featureType": "water",
                        "elementType": "labels.text.stroke",
                        "stylers": [{ "color": "#17263c" }]
                    }
                ]
            });
            googleMapRef.current = map;
        }
    }, [mapLoaded]);

    useEffect(() => {
        if (googleMapRef.current && heatmapData.length > 0) {
            const points = heatmapData.map(point => ({
                location: new google.maps.LatLng(parseFloat(point.lat), parseFloat(point.lng)),
                weight: parseInt(point.intensity)
            }));

            if (heatmapLayerRef.current) {
                heatmapLayerRef.current.setMap(null);
            }

            const heatmap = new google.maps.visualization.HeatmapLayer({
                data: points,
                map: googleMapRef.current,
                radius: 30, // Adjust density radius
                opacity: 0.8,
                gradient: [
                    'rgba(0, 255, 255, 0)',
                    'rgba(0, 255, 255, 1)',
                    'rgba(0, 191, 255, 1)',
                    'rgba(0, 127, 255, 1)',
                    'rgba(0, 63, 255, 1)',
                    'rgba(0, 0, 255, 1)',
                    'rgba(0, 0, 223, 1)',
                    'rgba(0, 0, 191, 1)',
                    'rgba(0, 0, 159, 1)',
                    'rgba(0, 0, 127, 1)',
                    'rgba(63, 0, 91, 1)',
                    'rgba(127, 0, 63, 1)',
                    'rgba(191, 0, 31, 1)',
                    'rgba(255, 0, 0, 1)'
                ]
            });
            heatmapLayerRef.current = heatmap;
        }
    }, [heatmapData, mapLoaded]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchHeatmapData();
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
                        Search <span className="text-red-600">Analytics</span>
                    </h1>
                    <p className="text-slate-500 font-medium flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                        Visualizing geographic search trends and platform demand.
                    </p>
                </div>

                <form onSubmit={handleSearch} className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-red-600 transition-colors" />
                        <input
                            type="text"
                            placeholder="Filter by keyword..."
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            className="pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl w-full lg:w-72 focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all font-medium"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="p-3 bg-red-600 text-white rounded-2xl hover:bg-red-700 disabled:opacity-50 transition-all active:scale-95 shadow-lg shadow-red-200"
                    >
                        <RefreshCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </form>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Total Searches', value: stats.totalSearches, icon: MousePointer2, color: 'bg-blue-500' },
                    { label: 'Unique Locations', value: stats.uniqueLocations, icon: MapPin, color: 'bg-emerald-500' },
                    { label: 'Peak Keyword', value: stats.topKeyword, icon: BarChart3, color: 'bg-orange-500' },
                ].map((stat, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={i}
                        className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6"
                    >
                        <div className={`${stat.color} p-4 rounded-3xl text-white shadow-lg`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                            <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Map Container */}
            <div className="relative">
                <div 
                    ref={mapRef} 
                    className="w-full h-[600px] rounded-[3rem] overflow-hidden border-8 border-white shadow-2xl bg-slate-100"
                />
                
                {loading && (
                    <div className="absolute inset-0 bg-white/40 backdrop-blur-sm flex items-center justify-center rounded-[3rem]">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
                            <p className="font-bold text-slate-900 tracking-tight">Updating Heatmap...</p>
                        </div>
                    </div>
                )}

                {/* Legend */}
                <div className="absolute bottom-10 left-10 bg-white/90 backdrop-blur-md p-6 rounded-[2rem] border border-white/20 shadow-xl max-w-xs">
                    <h3 className="font-black text-slate-900 mb-3 flex items-center gap-2">
                        <MapIcon className="w-5 h-5 text-red-600" />
                        Heatmap Intensity
                    </h3>
                    <div className="h-4 w-full bg-gradient-to-r from-blue-500 via-green-500 to-red-600 rounded-full mb-2" />
                    <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                        <span>Low Volume</span>
                        <span>Medium</span>
                        <span>High Demand</span>
                    </div>
                </div>
            </div>

            <Script
                src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=visualization`}
                onLoad={() => setMapLoaded(true)}
            />
        </div>
    );
}
