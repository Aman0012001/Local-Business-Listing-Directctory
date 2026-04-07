"use client";

import React, { useState, useEffect } from 'react';
import { TrendingUp, Flame, MapPin, Search, ArrowUpRight, ArrowDownRight, Users, Activity, Loader2, Sparkles, BrainCircuit, Zap, Clock } from 'lucide-react';
import { api } from '../../../lib/api';
import { motion } from 'framer-motion';

export default function AdminDemandDashboard() {
    const [insights, setInsights] = useState<any[]>([]);
    const [aiSummary, setAiSummary] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedCity, setSelectedCity] = useState('');

    useEffect(() => {
        const fetchInsights = async () => {
            try {
                setLoading(true);
                const [data, summaryData] = await Promise.all([
                    api.demand.getInsights(selectedCity),
                    api.demand.getAISummary(selectedCity)
                ]);
                setInsights(data || []);
                setAiSummary(summaryData?.summary || null);
            } catch (error) {
                console.error('Error fetching demand insights:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchInsights();
    }, [selectedCity]);

    const hotKeywords = insights.slice(0, 5);
    const risingKeywords = insights.sort((a, b) => b.growth - a.growth).slice(0, 5);

    const trendingInsights = insights.filter(i => i.isTrending);
    const avgTrendingGrowth = trendingInsights.length > 0
        ? Math.round(trendingInsights.reduce((acc, i) => acc + i.growth, 0) / trendingInsights.length)
        : 0;

    return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-10">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-4">
                        <Activity className="w-10 h-10 text-blue-600" />
                        AI Demand Insights
                    </h1>
                    <p className="text-slate-400 font-bold mt-2">Predictive analytics based on user search patterns and service spikes.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <select
                            value={selectedCity}
                            onChange={(e) => setSelectedCity(e.target.value)}
                            className="pl-11 pr-10 py-4 bg-white border border-slate-200 rounded-[16px] font-black  text-slate-900 outline-none focus:border-blue-500 transition-all appearance-none"
                        >
                            <option value="">All Regions</option>
                            <option value="Delhi">Delhi</option>
                            <option value="Mumbai">Mumbai</option>
                            <option value="Bangalore">Bangalore</option>
                            <option value="Karachi">Karachi</option>
                        </select>
                    </div>
                </div>
            </header>

            {/* AI Summary Section */}
            {/* {!loading && aiSummary && (
                <div className="mb-8 p-6 bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-2xl shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Sparkles className="w-24 h-24 text-indigo-600" />
                    </div>
                    <div className="flex items-start gap-4 relative z-10">
                        <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-lg border border-indigo-500">
                            <BrainCircuit className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-indigo-900 font-bold">AI Deep Analysis</h3>
                                <div className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-full uppercase tracking-wider animate-pulse">Live</div>
                            </div>
                            <div className="text-slate-700 text-sm leading-relaxed max-w-4xl whitespace-pre-wrap">
                                {aiSummary}
                            </div>
                            <div className="mt-4 flex items-center gap-4 text-[11px] text-slate-400 font-medium">
                                <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> Powered by Gemini 1.5 Flash</span>
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Updated just now</span>
                            </div>
                        </div>
                    </div>
                </div>
            )} */}

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-[24px] border border-black  shadow-slate-200/20">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Active Trending Service</p>
                    <div className="flex items-end justify-between">
                        <h4 className="text-3xl font-black text-slate-900">{trendingInsights.length}</h4>
                        <div className={`px-2 py-1 ${avgTrendingGrowth >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'} rounded-lg text-[10px] font-black`}>
                            {avgTrendingGrowth > 0 ? '+' : ''}{avgTrendingGrowth}% this week
                        </div>
                    </div>
                </div>
                <div className="bg-white p-8 rounded-[24px] border border-black  shadow-slate-200/20">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Top Searched Category</p>
                    <h4 className="text-3xl font-black text-slate-900 capitalize">{insights[0]?.keyword || 'None'}</h4>
                </div>
                <div className="bg-white p-8 rounded-[24px] border border-black  shadow-slate-200/20">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Global Demand Score</p>
                    <h4 className="text-3xl font-black text-blue-600 font-black">
                        {Math.round(insights.reduce((acc, i) => acc + i.score, 0) / (insights.length || 1))}
                    </h4>
                </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-10">
                {/* Ranking Table */}
                <div className="lg:col-span-8 bg-white rounded-[24px] border border-black  shadow-slate-200/20 overflow-hidden">
                    <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="text-xl font-black text-slate-900">Service Demand Rankings</h3>
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <Activity className="w-3 h-3" /> Updated Live
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Keyword</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Demand Score</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Growth (1h)</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Volume (24h)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-20 text-center">
                                            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
                                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Analyzing Logs...</p>
                                        </td>
                                    </tr>
                                ) : insights.length > 0 ? (
                                    insights.map((item) => (
                                        <tr key={item.normalizedKeyword} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-black text-slate-600 transition-colors group-hover:bg-blue-600 group-hover:text-white capitalize">
                                                        {item.keyword.charAt(0)}
                                                    </div>
                                                    <span className="font-black text-slate-900 group-hover:text-blue-600 transition-colors capitalize">{item.keyword}</span>
                                                    {item.isTrending && (
                                                        <span className="px-2 py-0.5 bg-orange-50 text-orange-600 rounded-full text-[8px] font-black uppercase border border-orange-100">Hot</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-blue-600 transition-all duration-1000"
                                                            style={{ width: `${Math.min(100, item.score)}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-xs font-black text-slate-900">{Math.round(item.score)}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className={`flex items-center gap-1 text-xs font-black ${item.growth > 0 ? 'text-emerald-500' : 'text-slate-400'}`}>
                                                    {item.growth > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                                    {Math.abs(Math.round(item.growth))}%
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right font-black text-slate-900 text-sm">
                                                {item.count24h.toLocaleString()}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-20 text-center text-slate-400 italic">No demand data found for this region.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Hot List Sidebar */}
                {/* <div className="lg:col-span-4 space-y-8">
                    <section className="bg-slate-900 rounded-[16px] p-8 text-white  shadow-slate-300">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-white/10 rounded-[16px] flex items-center justify-center text-orange-400">
                                <Flame className="w-6 h-6 fill-orange-400" />
                            </div>
                            <h3 className="text-xl font-black tracking-tight">Top Hot Demand</h3>
                        </div>
                        <div className="space-y-6">
                            {hotKeywords.map((item, idx) => (
                                <div key={item.normalizedKeyword} className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <span className="text-xs font-black text-white/20 italic">0{idx + 1}</span>
                                        <span className="font-black text-sm capitalize">{item.keyword}</span>
                                    </div>
                                    <div className="text-orange-400 font-black text-xs">+{Math.round(item.growth)}% Spike</div>
                                </div>
                            ))}
                            {hotKeywords.length === 0 && <p className="text-white/40 italic text-sm">No hot keywords yet.</p>}
                        </div>
                    </section>
                </div> */}
            </div>
        </div>
    );
}
