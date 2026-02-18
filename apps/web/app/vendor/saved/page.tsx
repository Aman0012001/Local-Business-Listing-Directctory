"use client";

import React from 'react';
import { Heart } from 'lucide-react';

export default function VendorSaved() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <div className="w-20 h-20 bg-pink-50 rounded-3xl flex items-center justify-center mb-6">
                <Heart className="w-10 h-10 text-pink-500 fill-pink-500" />
            </div>
            <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Saved Businesses</h1>
            <p className="text-slate-400 font-bold max-w-md text-lg">You haven't saved any businesses for later yet. Browse the directory to find partners or inspirations.</p>
        </div>
    );
}
