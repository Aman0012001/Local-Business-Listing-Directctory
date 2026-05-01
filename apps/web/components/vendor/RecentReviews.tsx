"use client";

import React from 'react';
import { Star, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { getImageUrl } from '../../lib/api';

interface ReviewItem {
    id: string | number;
    user: string;
    location: string;
    rating: number;
    comment: string;
    avatar: string;
}

interface RecentReviewsProps {
    reviews?: ReviewItem[];
    loading?: boolean;
    title?: string;
}

export default function RecentReviews({ reviews = [], loading = false, title = "Recent Reviews" }: RecentReviewsProps) {
    if (loading) {
        return (
            <div className="bg-white rounded-[24px] border border-[#e5e7eb] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] animate-pulse">
                <div className="h-8 bg-slate-100 rounded-lg w-1/3 mb-8" />
                <div className="space-y-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex gap-5">
                            <div className="w-14 h-14 rounded-[18px] bg-slate-100 flex-shrink-0" />
                            <div className="flex-grow space-y-3">
                                <div className="h-4 bg-slate-100 rounded w-1/4" />
                                <div className="h-3 bg-slate-100 rounded w-full" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-[24px] border border-[#e5e7eb] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="flex items-center justify-between mb-10">
                <h3 className="text-2xl font-black text-[#131b2e] tracking-tight">{title}</h3>
                <Link href="/vendor/reviews" className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.1em] text-[#004a99] hover:text-[#ff7a00] transition-colors group">
                    View All <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
            </div>

            <div className="space-y-8">
                {reviews.length > 0 ? (
                    reviews.map((review, i) => (
                        <div key={review.id} className={`flex gap-6 group ${i !== reviews.length - 1 ? 'pb-8 border-b border-[#f1f5f9]' : ''}`}>
                            <div className="relative flex-shrink-0">
                                <div className="w-16 h-16 rounded-[20px] overflow-hidden shadow-[0_10px_25px_rgb(0,0,0,0.1)] group-hover:scale-105 transition-transform duration-500">
                                    <img src={getImageUrl(review.avatar) || `https://ui-avatars.com/api/?name=${review.user}&background=random`} alt={review.user} className="w-full h-full object-cover" />
                                </div>
                            </div>
                            <div className="flex-grow">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-[#131b2e] text-lg group-hover:text-[#004a99] transition-colors">{review.user}</span>
                                        <span className="text-[10px] text-[#64748b] font-black uppercase tracking-widest">{review.location}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#faf8ff] rounded-xl border border-[#e5e7eb]">
                                        <Star className="w-3.5 h-3.5 text-[#ff7a00] fill-[#ff7a00]" />
                                        <span className="text-[12px] font-black text-[#131b2e]">{review.rating}</span>
                                    </div>
                                </div>
                                <p className="text-[14px] text-[#475569] leading-relaxed font-medium italic">"{review.comment}"</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12">
                        <div className="w-20 h-20 bg-[#faf8ff] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#e5e7eb]">
                             <Star className="w-8 h-8 text-[#cbd5e1]" />
                        </div>
                        <p className="text-[#64748b] font-bold text-sm">No reviews yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
