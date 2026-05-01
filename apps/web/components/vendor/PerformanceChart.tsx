"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, BarChart3 } from 'lucide-react';

const data = [
    { day: 'Apr 1', views: 400, calls: 240 },
    { day: 'Apr 7', views: 700, calls: 350 },
    { day: 'Apr 11', views: 850, calls: 480 },
    { day: 'Apr 18', views: 650, calls: 400 },
    { day: 'Apr 25', views: 1200, calls: 600 },
];

interface PerformanceChartProps {
    stats?: {
        totalViews: number;
        totalLeads: number;
    } | null;
}

export default function PerformanceChart({ stats }: PerformanceChartProps) {
    const maxVal = 1500;
    const width = 600;
    const height = 240;

    // Scale points to SVG coordinates
    const getPoints = (key: 'views' | 'calls') => {
        return data.map((d, i) => {
            const x = (i / (data.length - 1)) * width;
            const y = height - (d[key] / maxVal) * height;
            return `${x},${y}`;
        }).join(' ');
    };

    const viewPoints = getPoints('views');
    const callPoints = getPoints('calls');

    return (
        <div className="bg-white rounded-[24px] p-8 sm:p-10 border border-[#e2e8f0] shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#f0f4ff] rounded-[16px] flex items-center justify-center text-[#004a99] shadow-inner border border-[#004a99]/10">
                        <BarChart3 className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-[#131b2e] tracking-tight">Performance Matrix</h3>
                        <p className="text-[10px] text-[#64748b] font-bold uppercase tracking-[0.2em] mt-1">Global Interaction Trends</p>
                    </div>
                </div>
                <div className="flex bg-[#faf8ff] p-1.5 rounded-2xl gap-1 border border-[#e2e8f0]">
                    {['7 Days', '30 Days', '90 Days'].map(tab => (
                        <button
                            key={tab}
                            className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${tab === '30 Days' ? 'bg-[#004a99] text-white shadow-lg' : 'text-[#64748b] hover:text-[#131b2e]'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-12 mt-4">
                {/* Chart Area */}
                <div className="flex-grow relative h-[240px]">
                    {/* Grid Lines */}
                    {[0, 0.5, 1].map(v => (
                        <div
                            key={v}
                            className="absolute left-0 right-0 border-t border-[#f1f5f9] flex items-center"
                            style={{ top: `${v * 100}%` }}
                        >
                            <span className="text-[10px] text-[#cbd5e1] font-bold -translate-y-2.5 bg-white pr-4 z-10">
                                {Math.round(maxVal - v * maxVal)}
                            </span>
                        </div>
                    ))}

                    <svg
                        viewBox={`0 0 ${width} ${height}`}
                        className="absolute inset-0 w-full h-full overflow-visible"
                        preserveAspectRatio="none"
                    >
                        {/* Views Area Fill */}
                        <motion.path
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1.2 }}
                            d={`M 0 ${height} L ${viewPoints} L ${width} ${height} Z`}
                            fill="url(#viewsGradient)"
                            fillOpacity="0.1"
                        />

                        {/* Calls Area Fill */}
                        <motion.path
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1.2, delay: 0.3 }}
                            d={`M 0 ${height} L ${callPoints} L ${width} ${height} Z`}
                            fill="url(#callsGradient)"
                            fillOpacity="0.15"
                        />

                        {/* Views Line */}
                        <motion.polyline
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 2, ease: "easeInOut" }}
                            fill="none"
                            stroke="#004a99"
                            strokeWidth="5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            points={viewPoints}
                        />

                        {/* Calls Line */}
                        <motion.polyline
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 2, ease: "easeInOut", delay: 0.4 }}
                            fill="none"
                            stroke="#ff7a00"
                            strokeWidth="5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            points={callPoints}
                        />

                        {/* Data Points */}
                        {data.map((d, i) => {
                            const x = (i / (data.length - 1)) * width;
                            const vy = height - (d.views / maxVal) * height;
                            const cy = height - (d.calls / maxVal) * height;
                            return (
                                <React.Fragment key={i}>
                                    <circle cx={x} cy={vy} r="6" fill="white" stroke="#004a99" strokeWidth="4" className="drop-shadow-md" />
                                    <circle cx={x} cy={cy} r="6" fill="white" stroke="#ff7a00" strokeWidth="4" className="drop-shadow-md" />
                                </React.Fragment>
                            );
                        })}

                        <defs>
                            <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#004a99" />
                                <stop offset="100%" stopColor="#004a99" stopOpacity="0" />
                            </linearGradient>
                            <linearGradient id="callsGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#ff7a00" />
                                <stop offset="100%" stopColor="#ff7a00" stopOpacity="0" />
                            </linearGradient>
                        </defs>
                    </svg>

                    {/* X-Axis Labels */}
                    <div className="absolute -bottom-10 left-0 right-0 flex justify-between px-2">
                        {data.map(d => (
                            <span key={d.day} className="text-[10px] text-[#94a3b8] font-black uppercase tracking-widest">{d.day}</span>
                        ))}
                    </div>
                </div>

                {/* Stats Cards - Side */}
                <div className="lg:w-56 flex flex-col gap-5">
                    <div className="bg-[#004a99] rounded-[24px] p-6 text-white shadow-[0_15px_30px_rgb(0,74,153,0.15)] group hover:scale-[1.03] transition-all border border-white/10">
                        <div className="flex items-center justify-between mb-5">
                            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/60 leading-none">Total Views</p>
                            <TrendingUp className="w-4 h-4 text-white/40" />
                        </div>
                        <div className="flex items-end gap-3">
                            <span className="text-4xl font-black leading-none">{stats?.totalViews.toLocaleString() || '12.4K'}</span>
                            <div className="bg-white/20 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter mb-1">+12%</div>
                        </div>
                    </div>
                    <div className="bg-[#ff7a00] rounded-[24px] p-6 text-white shadow-[0_15px_30px_rgb(255,122,0,0.15)] group hover:scale-[1.03] transition-all border border-white/10">
                        <div className="flex items-center justify-between mb-5">
                            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/60 leading-none">Net Leads</p>
                            <TrendingUp className="w-4 h-4 text-white/40" />
                        </div>
                        <div className="flex items-end gap-3">
                            <span className="text-4xl font-black leading-none">{stats?.totalLeads.toLocaleString() || '842'}</span>
                            <div className="bg-white/20 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter mb-1">+8%</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
