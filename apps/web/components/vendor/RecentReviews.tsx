"use client";

import React from 'react';
import { Star, ChevronRight } from 'lucide-react';

const reviews = [
    {
        id: 1,
        user: 'Rahul K.',
        location: 'Chandigarh',
        rating: 4.5,
        comment: 'Great service and friendly staff. Highly recommended!',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100'
    },
    {
        id: 2,
        user: 'Neha R.',
        location: 'Delhi',
        rating: 4.0,
        comment: 'Quick and reliable service. Very satisfied!',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100'
    },
    {
        id: 3,
        user: 'Amit S.',
        location: 'Mumbai',
        rating: 4.5,
        comment: 'I am happy with the professional service. Will use again.',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100'
    }
];

export default function RecentReviews() {
    return (
        <div className="bg-white rounded-[40px] border border-slate-100 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-slate-800">Recent Reviews</h3>
                <button className="flex items-center gap-1 text-xs font-black uppercase tracking-widest text-[#FF7A30] hover:text-[#E86920] transition-colors">
                    View All <ChevronRight className="w-4 h-4" />
                </button>
            </div>

            <div className="space-y-6">
                {reviews.map((review, i) => (
                    <div key={review.id} className={`flex gap-5 group ${i !== reviews.length - 1 ? 'pb-8 border-b border-slate-50' : ''}`}>
                        <div className="relative flex-shrink-0">
                            <div className="w-14 h-14 rounded-[20px] overflow-hidden shadow-lg group-hover:scale-105 transition-transform duration-500">
                                <img src={review.avatar} alt={review.user} className="w-full h-full object-cover" />
                            </div>
                        </div>
                        <div className="flex-grow">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex flex-col">
                                    <span className="font-black text-slate-900 leading-none mb-1 group-hover:text-blue-600 transition-colors">{review.user}</span>
                                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{review.location}</span>
                                </div>
                                <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-50 rounded-lg border border-amber-100/50">
                                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                    <span className="text-[11px] font-black text-amber-600">{review.rating}</span>
                                </div>
                            </div>
                            <p className="text-[13px] text-slate-500 leading-relaxed font-medium italic">"{review.comment}"</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
