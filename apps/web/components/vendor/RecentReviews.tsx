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
            <div className="bg-white rounded-[16px] border border-black p-8 shadow-sm animate-pulse">
                <div className="h-8 bg-slate-100 rounded-lg w-1/3 mb-8" />
                <div className="space-y-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex gap-5">
                            <div className="w-14 h-14 rounded-[20px] bg-slate-100 flex-shrink-0" />
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
        <div className="bg-white rounded-[24px] border border-slate-100 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-xl font-black text-slate-800">{title}</h3>
                    <p className="text-xs text-slate-400 font-bold mt-1">Latest feedback from your customers</p>
                </div>
                <Link href="/reviews" className="flex items-center gap-1.5 px-4 py-2 bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-900 hover:text-white rounded-xl transition-all active:scale-95">
                    View All <ChevronRight className="w-4 h-4" />
                </Link>
            </div>

            <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {reviews.length > 0 ? (
                    reviews.map((review, i) => (
                        <div key={review.id} className={`flex gap-5 group ${i !== reviews.length - 1 ? 'pb-8 border-b border-slate-50' : ''}`}>
                            <div className="relative flex-shrink-0">
                                <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-lg group-hover:scale-105 transition-transform duration-500 ring-2 ring-white ring-offset-2 ring-offset-slate-100">
                                    <img src={getImageUrl(review.avatar) || `https://ui-avatars.com/api/?name=${review.user}&background=random`} alt={review.user} className="w-full h-full object-cover" />
                                </div>
                            </div>
                            <div className="flex-grow">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex flex-col">
                                        <span className="font-black text-slate-900 leading-none mb-1 group-hover:text-blue-600 transition-colors">{review.user}</span>
                                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{review.location}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-50 rounded-xl border border-amber-100/50">
                                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                        <span className="text-xs font-black text-amber-600">{review.rating}</span>
                                    </div>
                                </div>
                                <div className="relative">
                                    <p className="text-[13px] text-slate-500 leading-relaxed font-medium italic group-hover:text-slate-600 transition-colors">"{review.comment}"</p>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100">
                        <p className="text-slate-400 font-bold">No reviews yet.</p>
                        <p className="text-xs text-slate-300 mt-1">Feedback will appear here once customers rate your business.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
