"use client";

import React from 'react';
import { ChevronRight, Inbox } from 'lucide-react';
import Link from 'next/link';

interface MessageCenterProps {
    leads?: any[];
}

export default function MessageCenter({ leads = [] }: MessageCenterProps) {
    const unreadCount = leads.filter(l => l.status === 'NEW').length;

    return (
        <div className="bg-white rounded-[24px] border border-[#e2e8f0] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-full flex flex-col relative overflow-hidden">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#f0f4ff] rounded-[16px] flex items-center justify-center text-[#004a99] shadow-inner border border-[#004a99]/10">
                        <Inbox className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-[#131b2e] tracking-tight">Active Inquiries</h3>
                        <p className="text-[10px] text-[#64748b] font-bold uppercase tracking-[0.2em] mt-0.5">Quick Response Center</p>
                    </div>
                </div>
                {unreadCount > 0 && (
                    <div className="px-3 py-1 bg-[#fff7ed] text-[#ff7a00] rounded-full text-[10px] font-black uppercase tracking-widest border border-[#ff7a00]/10">
                        {unreadCount} New
                    </div>
                )}
            </div>

            <div className="space-y-4 flex-grow">
                {leads.length > 0 ? (
                    leads.slice(0, 4).map((lead, i) => {
                        const isNew = lead.status === 'NEW';
                        const timeAgo = new Date(lead.createdAt).toLocaleDateString();

                        return (
                            <div
                                key={lead.id}
                                className={`flex items-center gap-4 p-4 rounded-[20px] hover:bg-[#faf8ff] transition-all cursor-pointer group relative overflow-hidden ${isNew ? 'bg-[#f0f4ff]/40 border border-[#004a99]/10' : 'bg-transparent border border-transparent'}`}
                            >
                                {isNew && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#004a99]" />
                                )}
                                <div className="relative flex-shrink-0">
                                    <div className="w-12 h-12 rounded-[14px] overflow-hidden shadow-sm group-hover:scale-110 transition-transform duration-500 bg-white border border-[#e2e8f0] flex items-center justify-center">
                                        <span className="text-base font-black text-[#004a99]">{lead.name[0]}</span>
                                    </div>
                                    {isNew && (
                                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#ff7a00] border-2 border-white rounded-full animate-pulse"></div>
                                    )}
                                </div>
                                <div className="flex-grow overflow-hidden">
                                    <div className="flex items-center justify-between mb-0.5">
                                        <span className={`text-sm font-black truncate tracking-tight ${isNew ? 'text-[#131b2e]' : 'text-[#64748b]'}`}>{lead.name}</span>
                                        <span className="text-[9px] text-[#94a3b8] font-black uppercase tracking-widest">{timeAgo}</span>
                                    </div>
                                    <p className="text-[12px] text-[#64748b] font-bold truncate group-hover:text-[#131b2e] transition-colors uppercase tracking-tight">
                                        {lead.type} • {lead.business?.name || 'Listing'}
                                    </p>
                                </div>
                                <ChevronRight className="w-4 h-4 text-[#cbd5e1] group-hover:text-[#004a99] group-hover:translate-x-1 transition-all" />
                            </div>
                        );
                    })
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 bg-[#faf8ff] rounded-[24px] border border-dashed border-[#e2e8f0]">
                        <Inbox className="w-10 h-10 text-[#e2e8f0]" />
                        <p className="text-[#64748b] font-bold italic text-sm">No recent inquiries found.</p>
                    </div>
                )}
            </div>

            <Link href="/vendor/messages" className="mt-8">
                <button className="w-full py-4 bg-[#faf8ff] text-[#64748b] text-[10px] font-black uppercase tracking-[0.2em] rounded-[18px] border border-[#e2e8f0] hover:bg-[#131b2e] hover:text-white hover:border-[#131b2e] hover:shadow-xl transition-all">
                    Message Center
                </button>
            </Link>
        </div>
    );
}
