"use client";

import React from 'react';
import { Flame, TrendingUp, ChevronRight, ArrowUpRight } from 'lucide-react';
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
}

interface VendorHotDemandWidgetProps {
    insights: DemandInsight[];
    loading?: boolean;
}

export default function VendorHotDemandWidget({ insights, loading }: VendorHotDemandWidgetProps) {
    if (loading) {
        return (
            <div className="bg-white rounded-[24px] p-8 border border-[#e2e8f0] shadow-[0_8px_30px_rgb(0,0,0,0.04)] animate-pulse">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-slate-100 rounded-[16px]"></div>
                    <div className="space-y-2">
                        <div className="h-5 w-32 bg-slate-100 rounded"></div>
                        <div className="h-3 w-48 bg-slate-50 rounded"></div>
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="h-20 bg-slate-50 rounded-[20px]"></div>
                    <div className="h-20 bg-slate-50 rounded-[20px]"></div>
                </div>
            </div>
        );
    }

    const trending = insights.filter(i => i.isTrending || i.score > 20);

    return (
        <section className="bg-white rounded-[24px] p-8 border border-[#e2e8f0] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden relative">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#fff7ed] rounded-[16px] flex items-center justify-center text-[#ff7a00] shadow-inner border border-[#ff7a00]/10">
                        <Flame className="w-6 h-6 fill-[#ff7a00]" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-[#131b2e] tracking-tight">Hot Demand</h3>
                        <p className="text-[10px] text-[#64748b] font-bold uppercase tracking-[0.15em] mt-0.5">Real-time Spikes</p>
                    </div>
                </div>
                {trending.length > 0 && (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-[#f0f4ff] text-[#004a99] rounded-full text-[10px] font-black uppercase tracking-widest border border-[#004a99]/10">
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
                            className={`group p-4 rounded-[20px] border transition-all cursor-pointer ${item.isTrending
                                    ? 'bg-[#fff7ed]/50 border-[#ff7a00]/20 hover:border-[#ff7a00]/40'
                                    : 'bg-[#faf8ff] border-[#e2e8f0] hover:border-[#004a99]/20 hover:bg-white hover:shadow-lg'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${item.isTrending ? 'bg-[#ff7a00] text-white shadow-lg shadow-[#ff7a00]/20' : 'bg-white text-[#131b2e] border border-[#e2e8f0]'
                                        }`}>
                                        {item.keyword.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h4 className="font-black text-[#131b2e] group-hover:text-[#004a99] transition-colors capitalize">
                                            {item.keyword}
                                        </h4>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className={`text-[10px] font-black uppercase tracking-tight ${item.growth > 0 ? 'text-[#10b981]' : 'text-[#64748b]'
                                                }`}>
                                                {item.growth > 0 ? `+${Math.round(item.growth)}%` : 'Stable'} Spike
                                            </span>
                                            <span className="text-slate-200 text-[10px]">•</span>
                                            <span className="text-[10px] text-[#64748b] font-bold">
                                                {item.count1h} req/hr
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1.5">
                                    <div className="flex items-center gap-1 text-[11px] font-black text-[#131b2e] group-hover:translate-x-0.5 transition-transform">
                                        <ArrowUpRight className={`w-3.5 h-3.5 ${item.score > 50 ? 'text-[#ff7a00]' : 'text-[#004a99]'}`} />
                                    </div>
                                    <div className="w-12 h-1 bg-[#e2e8f0] rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min(100, item.score)}%` }}
                                            className={`h-full ${item.score > 50 ? 'bg-[#ff7a00]' : 'bg-[#004a99]'}`}
                                        ></motion.div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="text-center py-10 bg-[#faf8ff] rounded-[24px] border border-dashed border-[#e2e8f0]">
                        <TrendingUp className="w-10 h-10 text-[#e2e8f0] mx-auto mb-3" />
                        <p className="text-[#64748b] font-bold italic text-sm px-4">No trending demand in your category currently.</p>
                        <p className="text-[10px] text-[#94a3b8] font-black uppercase tracking-widest mt-2">Checking again in 5m</p>
                    </div>
                )}
            </div>

            <button className="w-full mt-6 py-4 rounded-[18px] bg-[#faf8ff] border border-[#e2e8f0] text-[10px] font-black uppercase tracking-[0.2em] text-[#64748b] hover:bg-[#131b2e] hover:text-white hover:border-[#131b2e] hover:shadow-xl transition-all group">
                Demand Analytics <ChevronRight className="w-3 h-3 inline-block ml-1 group-hover:translate-x-1 transition-transform" />
            </button>
        </section>
    );
}
