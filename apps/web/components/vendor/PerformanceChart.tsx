"use client";

import React from 'react';
import { motion } from 'framer-motion';

const data = [
    { day: 'Apr 1', views: 400, calls: 240 },
    { day: 'Apr 7', views: 700, calls: 350 },
    { day: 'Apr 11', views: 850, calls: 480 },
    { day: 'Apr 18', views: 650, calls: 400 },
    { day: 'Apr 25', views: 1200, calls: 600 },
];

export default function PerformanceChart() {
    const maxVal = 1500;
    const width = 600;
    const height = 300;

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
        <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h3 className="text-xl font-black text-slate-800 mb-1">Views & Calls</h3>
                    <p className="text-xs text-slate-400 font-bold tracking-wide">Listing performance over time</p>
                </div>
                <div className="flex bg-slate-50 p-1.5 rounded-2xl gap-1">
                    {['7 days', '1 month', '3 months'].map(tab => (
                        <button
                            key={tab}
                            className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${tab === '1 month' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 mt-10">
                {/* Chart Area */}
                <div className="flex-grow relative h-[300px]">
                    {/* Grid Lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map(v => (
                        <div
                            key={v}
                            className="absolute left-0 right-0 border-t border-slate-50 flex items-center"
                            style={{ top: `${v * 100}%` }}
                        >
                            <span className="text-[10px] text-slate-300 font-bold -translate-y-2 pr-4 bg-white z-10">
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
                            transition={{ duration: 1 }}
                            d={`M 0 ${height} L ${viewPoints} L ${width} ${height} Z`}
                            fill="url(#viewsGradient)"
                            fillOpacity="0.08"
                        />

                        {/* Calls Area Fill */}
                        <motion.path
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1, delay: 0.2 }}
                            d={`M 0 ${height} L ${callPoints} L ${width} ${height} Z`}
                            fill="url(#callsGradient)"
                            fillOpacity="0.12"
                        />

                        {/* Views Line */}
                        <motion.polyline
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1.5, ease: "easeInOut" }}
                            fill="none"
                            stroke="#3B82F6"
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            points={viewPoints}
                        />

                        {/* Calls Line */}
                        <motion.polyline
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1.5, ease: "easeInOut", delay: 0.3 }}
                            fill="none"
                            stroke="#FF7A30"
                            strokeWidth="4"
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
                                    <circle cx={x} cy={vy} r="5" fill="white" stroke="#3B82F6" strokeWidth="3" className="drop-shadow-sm" />
                                    <circle cx={x} cy={cy} r="5" fill="white" stroke="#FF7A30" strokeWidth="3" className="drop-shadow-sm" />
                                </React.Fragment>
                            );
                        })}

                        <defs>
                            <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#3B82F6" />
                                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                            </linearGradient>
                            <linearGradient id="callsGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#FF7A30" />
                                <stop offset="100%" stopColor="#FF7A30" stopOpacity="0" />
                            </linearGradient>
                        </defs>
                    </svg>

                    {/* X-Axis Labels */}
                    <div className="absolute -bottom-8 left-0 right-0 flex justify-between px-2">
                        {data.map(d => (
                            <span key={d.day} className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{d.day}</span>
                        ))}
                    </div>
                </div>

                {/* Stats Cards - Right Side */}
                <div className="lg:w-48 flex flex-col gap-4">
                    <div className="bg-[#3B82F6] rounded-3xl p-5 text-white shadow-xl shadow-blue-500/20 group hover:scale-[1.02] transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 leading-none">Total Views</p>
                            <span className="w-1.5 h-1.5 bg-blue-300 rounded-full animate-pulse" />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-3xl font-black leading-none">1,200</span>
                            <div className="bg-white/20 px-1.5 py-0.5 rounded-lg text-[10px] font-black uppercase">↑</div>
                        </div>
                    </div>
                    <div className="bg-[#FF7A30] rounded-3xl p-5 text-white shadow-xl shadow-orange-500/20 group hover:scale-[1.02] transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 leading-none">Total Calls</p>
                            <span className="w-1.5 h-1.5 bg-orange-300 rounded-full animate-pulse" />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-3xl font-black leading-none">350</span>
                            <div className="bg-white/20 px-1.5 py-0.5 rounded-lg text-[10px] font-black uppercase">↑</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
