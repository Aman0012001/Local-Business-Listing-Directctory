"use client";

import React from 'react';
import { Star } from 'lucide-react';

export default function VendorReviews() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center mb-6">
                <Star className="w-10 h-10 text-amber-500 fill-amber-500" />
            </div>
            <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Reviews Management</h1>
            <p className="text-slate-400 font-bold max-w-md text-lg">Manage all reviews received on your listings in one place. Respond to your customers and improve your reputation.</p>
        </div>
    );
}
