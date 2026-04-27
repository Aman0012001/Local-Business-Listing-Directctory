"use client";

import React from 'react';
import { Flame, TrendingUp, MapPin, ChevronRight, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

export interface DemandInsight {
    keyword: string;
    normalizedKeyword: string;
    score: number;
    count1h: number;
    count6h: number;
    count24h: number;
    isTrending: boolean;
    growth: number;
    type: 'keyword' | 'category';
}

interface VendorHotDemandWidgetProps {
    insights: DemandInsight[];
    loading?: boolean;
}

export default function VendorHotDemandWidget({ insights, loading }: VendorHotDemandWidgetProps) {
    if (loading) {
        return (
            <div className="bg-white rounded-[16px] p-6 border border-black shadow-slate-200/20 animate-pulse">
                <div className="h-6 w-32 bg-slate-100 rounded mb-4"></div>
                <div className="space-y-3">
                    <div className="h-10 bg-slate-50 rounded-xl"></div>
                    <div className="h-10 bg-slate-50 rounded-xl"></div>
                </div>
            </div>
        );
    }

    const trending = insights.filter(i => i.isTrending || i.score > 20);

    return (
        <section className="bg-white rounded-[16px] p-8 border border-black shadow-slate-200/20">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-50 rounded-[16px] flex items-center justify-center text-orange-500 shadow-inner">
                        <Flame className="w-6 h-6 fill-orange-500" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">Hot Demand Alerts</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Trending Services Near You</p>
                    </div>
                </div>
                {trending.length > 0 && (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-orange-100">
                        <TrendingUp className="w-3 h-3" /> Live
                    </div>
                )}
            </div>

            <div className="space-y-4">
                {trending.length > 0 ? (
                    trending.slice(0, 5).map((item, idx) => (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            key={item.normalizedKeyword}
                            className={`group p-4 rounded-[16px] border transition-all cursor-pointer ${item.isTrending
                                    ? 'bg-orange-50/50 border-orange-200 hover:border-orange-300'
                                    : 'bg-slate-50 border-slate-100 hover:border-blue-200'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${
                                        item.type === 'category' 
                                            ? 'bg-blue-100 text-blue-600' 
                                            : item.isTrending 
                                                ? 'bg-orange-100 text-orange-600' 
                                                : 'bg-white text-slate-600 border border-slate-200'
                                        }`}>
                                        {item.type === 'category' ? <TrendingUp className="w-5 h-5" /> : item.keyword.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-black text-slate-900 group-hover:text-blue-600 transition-colors capitalize">
                                                {item.keyword}
                                            </h4>
                                            <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-widest ${
                                                item.type === 'category' ? 'bg-blue-50 text-blue-500 border border-blue-100' : 'bg-slate-100 text-slate-500'
                                            }`}>
                                                {item.type}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className={`text-[10px] font-black uppercase tracking-tighter ${item.growth > 0 ? 'text-emerald-500' : 'text-slate-400'
                                                }`}>
                                                {item.growth > 0 ? `+${Math.round(item.growth)}%` : 'Stable'} Search Spike
                                            </span>
                                            <span className="text-slate-200 text-[10px]">•</span>
                                            <span className="text-[10px] text-slate-400 font-bold">
                                                {item.count1h} searches/hr
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <div className="flex items-center gap-1 text-xs font-black text-slate-900 group-hover:translate-x-1 transition-transform">
                                        {item.score > 50 ? 'High' : 'Moderate'} <ArrowUpRight className="w-3 h-3" />
                                    </div>
                                    <div className="w-16 h-1 bg-slate-200 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-1000 ${item.score > 50 ? 'bg-orange-500' : 'bg-blue-500'}`}
                                            style={{ width: `${Math.min(100, item.score)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="text-center py-10 bg-slate-25 rounded-[16px] border border-dashed border-slate-200">
                        <TrendingUp className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                        <p className="text-slate-400 font-bold italic text-sm">No trending demand in your category yet.</p>
                        <p className="text-[10px] text-slate-300 font-black uppercase tracking-widest mt-2">Check back in 15 minutes</p>
                    </div>
                )}
            </div>

            <button className="w-full mt-6 py-4 rounded-[16px] bg-slate-50 border border-slate-100 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all group">
                Deep Insights Dashboard <ChevronRight className="w-3 h-3 inline-block ml-1 group-hover:translate-x-1 transition-transform" />
            </button>
        </section>
    );
}
