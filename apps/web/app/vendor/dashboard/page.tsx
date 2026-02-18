"use client";

import React from 'react';
import StatsGrid from '../../../components/vendor/StatsGrid';
import PerformanceChart from '../../../components/vendor/PerformanceChart';
import RecentReviews from '../../../components/vendor/RecentReviews';
import MessageCenter from '../../../components/vendor/MessageCenter';
import { Star, Phone, ChevronRight } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import Link from 'next/link';

const savedBusinesses = [
    {
        id: 1,
        name: 'Cityscape Cafe',
        rating: 5,
        location: 'New York',
        phone: '(+1) 123-456-7890',
        image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=400'
    },
    {
        id: 2,
        name: 'Elite Fitness Gym',
        rating: 4.5,
        location: 'Brooklyn',
        phone: '(+1) 123-456-7890',
        image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=400'
    },
    {
        id: 3,
        name: 'Greenwood Dental',
        rating: 4.8,
        location: 'Manhattan',
        phone: '(+1) 123-456-7890',
        image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=400'
    }
];

export default function VendorDashboard() {
    const { user } = useAuth();

    return (
        <>
            {/* Welcome Header */}
            <div className="mb-10 lg:mb-14">
                <h1 className="text-3xl lg:text-5xl font-black text-slate-900 mb-3 tracking-tight">
                    Welcome, {user?.fullName || 'Mak Smith'}!
                </h1>
                <p className="text-base lg:text-lg text-slate-400 font-bold tracking-tight">
                    Access your account or create a new one.
                </p>
            </div>

            {/* Stats Overview */}
            <StatsGrid />

            <div className="grid lg:grid-cols-12 gap-8 items-start">
                {/* Left Column - 8/12 width */}
                <div className="lg:col-span-8 space-y-10">

                    {/* Saved Businesses Section */}
                    <section className="bg-white rounded-[40px] p-6 lg:p-10 border border-slate-100 shadow-sm relative overflow-hidden">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight">Businesses Saved For Later</h3>
                            <button className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-blue-600 transition-all group">
                                View All <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            {savedBusinesses.map((biz) => (
                                <div key={biz.id} className="group flex flex-col sm:flex-row items-center gap-6 p-5 rounded-[32px] border border-slate-50 hover:border-slate-100 hover:bg-slate-50/50 transition-all">
                                    <div className="w-full sm:w-28 h-28 sm:h-28 rounded-2xl overflow-hidden flex-shrink-0 shadow-md">
                                        <img src={biz.image} alt={biz.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    </div>
                                    <div className="flex-grow text-center sm:text-left">
                                        <h4 className="text-xl font-black text-slate-900 mb-1.5 group-hover:text-blue-600 transition-colors">{biz.name}</h4>
                                        <div className="flex items-center justify-center sm:justify-start gap-4 text-xs font-bold mb-3">
                                            <div className="flex items-center gap-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(biz.rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                                                ))}
                                                <span className="ml-1 text-slate-900">{biz.rating}</span>
                                            </div>
                                            <span className="text-slate-200">|</span>
                                            <span className="text-slate-400 uppercase tracking-widest">{biz.location}</span>
                                        </div>
                                        <p className="text-[13px] text-slate-400 font-bold">{biz.phone}</p>
                                    </div>
                                    <button className={`w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-black text-sm transition-all shadow-xl active:scale-95 whitespace-nowrap ${biz.id === 3
                                        ? 'bg-blue-600 text-white shadow-blue-500/20 hover:bg-blue-700'
                                        : 'bg-[#1D8E66] text-white shadow-emerald-500/20 hover:bg-emerald-700'
                                        }`}>
                                        <Phone className="w-4 h-4" /> Call Now
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight">Overview of Listing Performance</h3>
                            <button className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-blue-600 transition-all group">
                                View All <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </button>
                        </div>
                        {/* Performance Chart */}
                        <PerformanceChart />
                    </div>

                </div>

                {/* Right Column - 4/12 width */}
                <div className="lg:col-span-4 space-y-8 h-full">
                    <RecentReviews />
                    <MessageCenter />
                </div>
            </div>
        </>
    );
}
