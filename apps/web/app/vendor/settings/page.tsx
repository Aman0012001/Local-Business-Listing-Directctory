"use client";

import React from 'react';
import { Settings } from 'lucide-react';

export default function VendorSettings() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mb-6">
                <Settings className="w-10 h-10 text-slate-600" />
            </div>
            <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Account Settings</h1>
            <p className="text-slate-400 font-bold max-w-md text-lg">Update your profile, change security settings, and manage your billing information.</p>
        </div>
    );
}
