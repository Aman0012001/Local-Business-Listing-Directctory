"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, MousePointer2, TrendingUp } from 'lucide-react';

interface PerformanceDataPoint {
    day: string;
    views: number;
    leads: number;
}

interface PerformanceChartProps {
    stats?: {
        totalViews: number;
        totalLeads: number;
        analytics?: PerformanceDataPoint[];
    } | null;
}


export default function PerformanceChart({ stats }: PerformanceChartProps) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const chartData = useMemo(() =>
        stats?.analytics && stats.analytics.length > 0
            ? stats.analytics
            : []
        , [stats?.analytics]);

    // Calculate max value for scaling, ensure it's at least 10
    const maxVal = useMemo(() => {
        const maxViews = Math.max(...chartData.map(d => d.views), 0);
        const maxLeads = Math.max(...chartData.map(d => d.leads), 0);
        return Math.max(maxViews, maxLeads, 10) * 1.2;
    }, [chartData]);

    const width = 800; // Increased width for better resolution
    const height = 300;

    // Helper to generate a sharp, data-driven path
    const getPath = (key: 'views' | 'leads') => {
        if (chartData.length < 2) return "";

        const points = chartData.map((d, i) => ({
            x: (i / (chartData.length - 1)) * width,
            y: height - (d[key] / maxVal) * height
        }));

        let path = `M ${points[0].x} ${points[0].y}`;
        for (let i = 1; i < points.length; i++) {
            path += ` L ${points[i].x} ${points[i].y}`;
        }

        return path;
    };

    const viewPath = getPath('views');
    const leadPath = getPath('leads');

    return (
        <div className="relative group/chart">
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Main Chart Area */}
                <div className="flex-grow bg-white rounded-[24px] p-8 border border-slate-100 shadow-sm relative overflow-visible">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-xl font-bold text-slate-800">Visibility Insights</h3>
                                <div className="flex items-center px-2 py-0.5 bg-green-50 rounded-full border border-green-100 gap-1.5">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                    <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider">Live Tracking</span>
                                </div>
                            </div>
                            <p className="text-xs text-slate-400 font-medium">Daily views and lead conversion metrics</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest">
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                                    <span className="text-slate-500">Views</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-[#FF7A30]" />
                                    <span className="text-slate-500">Leads</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative h-[250px] mt-12 mb-8">
                        {chartData.length === 0 ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/50 rounded-[20px] border border-dashed border-slate-200 p-8 text-center">
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex flex-col items-center"
                                >
                                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm transform -rotate-6">
                                        <TrendingUp className="w-8 h-8 text-slate-300" />
                                    </div>
                                    <h4 className="text-slate-900 font-black text-lg mb-2">No data yet</h4>
                                    <p className="text-sm text-slate-500 font-medium max-w-[320px] leading-relaxed">
                                        No data yet. Insights will appear once your business starts getting views.
                                    </p>
                                </motion.div>
                            </div>
                        ) : (
                            <>
                                {/* Grid Lines */}
                                {[0, 0.5, 1].map((v, idx) => (
                                    <div
                                        key={idx}
                                        className="absolute left-0 right-0 border-t border-slate-50 flex items-center"
                                        style={{ top: `${v * 100}%` }}
                                    >
                                        <span className="absolute -left-10 text-[10px] text-slate-300 font-bold">
                                            {Math.round(maxVal - v * maxVal)}
                                        </span>
                                    </div>
                                ))}

                                <svg
                                    viewBox={`0 0 ${width} ${height}`}
                                    className="absolute inset-0 w-full h-full overflow-visible"
                                    preserveAspectRatio="none"
                                    onMouseLeave={() => setHoveredIndex(null)}
                                >
                            <defs>
                                <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.15" />
                                    <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.01" />
                                </linearGradient>
                                <linearGradient id="leadsGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#FF7A30" stopOpacity="0.15" />
                                    <stop offset="100%" stopColor="#FF7A30" stopOpacity="0.01" />
                                </linearGradient>
                            </defs>

                            {/* Fills */}
                            <motion.path
                                d={`${viewPath} L ${width} ${height} L 0 ${height} Z`}
                                fill="url(#viewsGrad)"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 1 }}
                            />
                            <motion.path
                                d={`${leadPath} L ${width} ${height} L 0 ${height} Z`}
                                fill="url(#leadsGrad)"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 1, delay: 0.2 }}
                            />

                            {/* Path Lines */}
                            <motion.path
                                d={viewPath}
                                fill="none"
                                stroke="#3B82F6"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 1 }}
                                transition={{ duration: 1.5, ease: "easeInOut" }}
                            />
                            <motion.path
                                d={leadPath}
                                fill="none"
                                stroke="#FF7A30"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 1 }}
                                transition={{ duration: 1.5, ease: "easeInOut", delay: 0.3 }}
                            />

                            {/* Interaction Areas */}
                            {chartData.map((d, i) => {
                                const x = (i / (chartData.length - 1)) * width;
                                return (
                                    <rect
                                        key={i}
                                        x={x - (width / (chartData.length - 1)) / 2}
                                        y={0}
                                        width={width / (chartData.length - 1)}
                                        height={height}
                                        fill="transparent"
                                        onMouseEnter={() => setHoveredIndex(i)}
                                        className="cursor-pointer"
                                    />
                                );
                            })}

                            {/* Active Point Highlight */}
                            {hoveredIndex !== null && (
                                <>
                                    <line
                                        x1={(hoveredIndex / (chartData.length - 1)) * width}
                                        y1={0}
                                        x2={(hoveredIndex / (chartData.length - 1)) * width}
                                        y2={height}
                                        stroke="#F1F5F9"
                                        strokeWidth="2"
                                        strokeDasharray="4 4"
                                    />
                                    <circle
                                        cx={(hoveredIndex / (chartData.length - 1)) * width}
                                        cy={height - (chartData[hoveredIndex].views / maxVal) * height}
                                        r="6"
                                        fill="white"
                                        stroke="#3B82F6"
                                        strokeWidth="3"
                                    />
                                    <circle
                                        cx={(hoveredIndex / (chartData.length - 1)) * width}
                                        cy={height - (chartData[hoveredIndex].leads / maxVal) * height}
                                        r="6"
                                        fill="white"
                                        stroke="#FF7A30"
                                        strokeWidth="3"
                                    />
                                </>
                            )}
                        </svg>

                        {/* Tooltip */}
                        <AnimatePresence>
                            {hoveredIndex !== null && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="absolute z-50 pointer-events-none bg-slate-900 text-white rounded-2xl p-4 shadow-2xl min-w-[140px]"
                                    style={{
                                        left: `${(hoveredIndex / (chartData.length - 1)) * 100}%`,
                                        top: '-40px',
                                        transform: 'translateX(-50%)'
                                    }}
                                >
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{chartData[hoveredIndex].day}</p>
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between gap-4">
                                            <span className="text-[11px] font-bold text-slate-200">Views</span>
                                            <span className="text-xs font-black text-blue-400">{chartData[hoveredIndex].views}</span>
                                        </div>
                                        <div className="flex items-center justify-between gap-4">
                                            <span className="text-[11px] font-bold text-slate-200">Leads</span>
                                            <span className="text-xs font-black text-orange-400">{chartData[hoveredIndex].leads}</span>
                                        </div>
                                    </div>
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-slate-900" />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* X-Axis Labels */}
                        <div className="absolute -bottom-8 left-0 right-0 flex justify-between px-2">
                            {chartData.map((d, i) => (
                                <span key={i} className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${hoveredIndex === i ? 'text-slate-800' : 'text-slate-300'}`}>
                                    {d.day}
                                </span>
                            ))}
                        </div>
                    </>
                )}
            </div>
                </div>

            </div>
        </div>
    );
}
