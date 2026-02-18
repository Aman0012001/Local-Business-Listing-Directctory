"use client";

import React from 'react';
import { Bell } from 'lucide-react';

export default function VendorNotifications() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mb-6">
                <Bell className="w-10 h-10 text-indigo-500" />
            </div>
            <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Notifications</h1>
            <p className="text-slate-400 font-bold max-w-md text-lg">Stay updated with the latest activities on your listings, new reviews, and system alerts.</p>
        </div>
    );
}
