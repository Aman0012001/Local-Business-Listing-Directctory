"use client";

import React from 'react';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface MessageCenterProps {
    leads?: any[];
}

export default function MessageCenter({ leads = [] }: MessageCenterProps) {
    const unreadCount = leads.filter(l => l.status === 'NEW').length;

    return (
        <div className="bg-white rounded-[16px] border border-black p-8 shadow-sm h-full flex flex-col">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-[10px] font-black">
                        {unreadCount}
                    </div>
                    <h3 className="text-xl font-black text-slate-800">Inquiries</h3>
                </div>
                <button className="flex items-center gap-1 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">
                    {unreadCount} New
                </button>
            </div>

            <div className="space-y-4 flex-grow">
                {leads.length > 0 ? (
                    leads.map((lead, i) => {
                        const isNew = lead.status === 'NEW';
                        const timeAgo = new Date(lead.createdAt).toLocaleDateString();

                        return (
                            <div
                                key={lead.id}
                                className={`flex items-center gap-4 p-4 rounded-[16px] hover:bg-slate-50 transition-all cursor-pointer group relative overflow-hidden ${isNew ? 'bg-blue-50/40 border border-blue-100/50' : 'border border-transparent'}`}
                            >
                                {isNew && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600" />
                                )}
                                <div className="relative flex-shrink-0">
                                    <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-md group-hover:scale-110 transition-transform duration-500 bg-slate-100 flex items-center justify-center">
                                        <span className="text-sm font-black text-slate-400">{lead.name[0]}</span>
                                    </div>
                                </div>
                                <div className="flex-grow overflow-hidden">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className={`text-sm font-black truncate tracking-tight ${isNew ? 'text-blue-600' : 'text-slate-700'}`}>{lead.name}</span>
                                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{timeAgo}</span>
                                    </div>
                                    <p className="text-[13px] text-slate-500 font-medium truncate group-hover:text-slate-700 transition-colors">
                                        {lead.type} inquiry via {lead.business?.name || 'Listing'}
                                    </p>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                            </div>
                        );
                    })
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-slate-50/50 rounded-[16px]">
                        <p className="text-slate-400 font-bold italic">No inquiries yet.</p>
                    </div>
                )}
            </div>

            <Link href="/vendor/messages" className="mt-8">
                <button className="w-full py-4 bg-slate-50 text-slate-400 text-xs font-black uppercase tracking-widest rounded-[16px] hover:bg-slate-100 hover:text-slate-600 transition-all">
                    View All Inquiries
                </button>
            </Link>
        </div>
    );
}
