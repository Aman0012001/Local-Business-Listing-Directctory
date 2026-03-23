'use client';

import React from 'react';
import { JobLead } from '../../types/api';
import { formatDistanceToNow } from 'date-fns';
import { MapPin, Clock, DollarSign, Megaphone, Send } from 'lucide-react';

interface BroadcastCardProps {
    lead: JobLead;
    onRespond: (lead: JobLead) => void;
}

export default function BroadcastCard({ lead, onRespond }: BroadcastCardProps) {
    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:scale-[1.01] transition-all group relative overflow-hidden">
            {/* Proximity Indicator */}
            {lead.latitude && lead.longitude && (
                <div className="absolute top-0 right-0 px-3 py-1 bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest rounded-bl-xl shadow-sm z-10 flex items-center gap-1">
                    <MapPin className="w-2.5 h-2.5" /> Nearest Expert
                </div>
            )}

            <div className="flex justify-between items-start mb-5">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-black uppercase tracking-widest">
                            {lead.category?.name || 'General'}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
                            <Clock className="w-3 h-3" />
                            {formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })}
                        </span>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-tight mb-2 tracking-tight">
                        {lead.title}
                    </h3>
                    <div className="flex items-center gap-3 text-slate-500 font-bold text-xs">
                        <span className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded-lg">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {lead.city || 'Anywhere'}
                        </span>
                        {lead.budget && (
                            <span className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg">
                                <DollarSign className="w-3 h-3" />
                                {lead.budget.toLocaleString()}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <p className="text-slate-500 text-sm font-medium leading-relaxed mb-6 line-clamp-3">
                {lead.description}
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${lead.hasResponded ? 'bg-indigo-500' : lead.status === 'open' ? 'bg-emerald-500 animate-pulse' : 'bg-blue-500'}`} />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {lead.hasResponded ? 'Proposal Sent' : lead.status === 'open' ? 'Live Broadcast' : lead.status}
                    </span>
                </div>
                <button
                    onClick={() => onRespond(lead)}
                    disabled={lead.hasResponded}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-xs transition-all active:scale-95 shadow-lg ${
                        lead.hasResponded 
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none' 
                        : 'bg-slate-900 text-white hover:bg-blue-600 shadow-slate-200'
                    }`}
                >
                    <span>{lead.hasResponded ? 'Response Sent' : 'Send Proposal'}</span>
                    {!lead.hasResponded && <Send className="w-3.5 h-3.5" />}
                </button>
            </div>
        </div>
    );
}
