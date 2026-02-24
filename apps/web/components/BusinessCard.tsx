"use client";

import React from 'react';
import Link from 'next/link';
import { Star, MapPin, ShieldCheck } from 'lucide-react';
import { Business } from '../types/api';

interface BusinessCardProps {
    business: Business;
    variant?: 'green' | 'blue' | 'white' | 'dark';
    layout?: 'grid' | 'list';
}

export default function BusinessCard({ business, variant = 'blue', layout = 'grid' }: BusinessCardProps) {
    const getButtonStyles = () => {
        switch (variant) {
            case 'green':
                return 'bg-[#00B67A] hover:bg-[#009665] text-white';
            case 'blue':
                return 'bg-[#3C82F6] hover:bg-[#2563EB] text-white';
            case 'white':
                return 'bg-white border-2 border-slate-200 text-slate-600 hover:bg-slate-50';
            case 'dark':
                return 'bg-[#112D4E] hover:bg-black text-white';
            default:
                return 'bg-[#3C82F6] hover:bg-[#2563EB] text-white';
        }
    };

    const getButtonText = () => {
        return variant === 'green' ? 'Call Now' : 'View Details';
    };

    if (layout === 'list') {
        return (
            <Link href={`/business/${business.slug}`} className="group block">
                <div className="bg-white rounded-[32px] border border-slate-100 overflow-hidden hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-500 flex flex-col md:flex-row h-full md:h-64">
                    {/* Image Container */}
                    <div className="relative w-full md:w-80 h-48 md:h-full overflow-hidden">
                        <img
                            src={business.coverImageUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800'}
                            alt={business.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        {business.isFeatured && (
                            <div className="absolute top-4 left-4 px-3 py-1 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-lg">
                                Featured
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    <div className="p-8 flex flex-col flex-grow">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                                        {business.name}
                                    </h3>
                                    {business.isVerified && (
                                        <ShieldCheck className="w-5 h-5 text-amber-500" />
                                    )}
                                </div>
                                <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                                    <MapPin className="w-4 h-4 text-blue-600" />
                                    {business.address}, {business.city}
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1 rounded-full text-amber-600 font-bold border border-amber-100">
                                    <Star className="w-4 h-4 fill-amber-500" />
                                    <span>{business.averageRating || '4.5'}</span>
                                    <span className="text-xs text-amber-400 font-medium">({business.totalReviews || 0})</span>
                                </div>
                            </div>
                        </div>

                        <p className="text-slate-500 text-sm line-clamp-2 mb-6 leading-relaxed">
                            {business.shortDescription || business.description}
                        </p>

                        <div className="mt-auto flex items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="px-3 py-1 bg-slate-50 text-slate-500 rounded-lg text-xs font-bold border border-slate-100 uppercase tracking-widest">
                                    {business.category?.name || 'Service'}
                                </div>
                                <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold border border-emerald-100 uppercase tracking-widest">
                                    Open Now
                                </div>
                            </div>
                            <div className={`px-8 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95 text-sm ${getButtonStyles()}`}>
                                {getButtonText()}
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        );
    }

    return (
        <Link href={`/business/${business.slug}`} className="group h-full">
            <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-500 flex flex-col h-full">
                {/* Image Container */}
                <div className="relative h-48 overflow-hidden">
                    <img
                        src={business.coverImageUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800'}
                        alt={business.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    {business.isFeatured && (
                        <div className="absolute top-4 left-4 px-3 py-1 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-lg">
                            Featured
                        </div>
                    )}
                    {business.isVerified && (
                        <div className="absolute top-4 right-4 px-3 py-1 bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                            Verified
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-7 flex flex-col flex-grow">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                            {business.name}
                        </h3>
                        <div className="flex items-center gap-1 text-amber-500 font-bold">
                            <Star className="w-4 h-4 fill-amber-400" />
                            <span>{business.averageRating || '4.5'}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 mb-6 text-slate-500">
                        <div className="flex text-amber-500">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(Number(business.averageRating || 4.5)) ? 'fill-amber-500' : 'text-slate-200'}`} />
                            ))}
                        </div>
                    </div>

                    <div className="mt-auto">
                        <div className={`block w-full text-center py-4 rounded-2xl font-bold transition-all shadow-lg active:scale-95 ${getButtonStyles()}`}>
                            {getButtonText()}
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
