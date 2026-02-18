"use client";

import React from 'react';
import Link from 'next/link';
import { Star, MapPin, ShieldCheck } from 'lucide-react';
import { Business } from '../types/api';

interface BusinessCardProps {
    business: Business;
    variant?: 'green' | 'blue' | 'white' | 'dark';
}

export default function BusinessCard({ business, variant = 'blue' }: BusinessCardProps) {
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
