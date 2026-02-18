"use client";

import React from 'react';
import { MessageSquare } from 'lucide-react';

export default function VendorMessages() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mb-6">
                <MessageSquare className="w-10 h-10 text-blue-500" />
            </div>
            <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Message Center</h1>
            <p className="text-slate-400 font-bold max-w-md text-lg">Communicate directly with your leads and customers. Build trust through real-time conversations.</p>
        </div>
    );
}
