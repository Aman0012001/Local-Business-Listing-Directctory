'use client';

import React, { useState, useEffect } from 'react';
import { api, getImageUrl } from '../../lib/api';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Clock, ArrowRight, Loader2, Phone, Mail, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function MyInquiries() {
    const [inquiries, setInquiries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMyInquiries();
    }, []);

    const fetchMyInquiries = async () => {
        try {
            setLoading(true);
            const response = await api.leads.getMyEnquiries();
            setInquiries(response.data || []);
        } catch (err: any) {
            console.error('Failed to fetch my inquiries', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-10">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Loading your inquiries...</p>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center px-1">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center text-violet-600">
                        <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">My Inquiries & Claims</h2>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Messages and offers you've claimed</p>
                    </div>
                </div>
            </div>

            {inquiries.length === 0 ? (
                <div className="bg-slate-50/50 p-12 rounded-[24px] border-2 border-dashed border-slate-100 text-center">
                    <p className="text-slate-400 font-bold italic text-sm">No recent inquiries or claims.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {inquiries.slice(0, 5).map(inq => (
                        <div key={inq.id} className="bg-white p-5 rounded-[20px] border border-slate-100 hover:border-violet-200 transition-all group">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 overflow-hidden flex-shrink-0">
                                        <img 
                                            src={getImageUrl(inq.business?.logoUrl || inq.business?.images?.[0]) || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'} 
                                            alt={inq.business?.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-slate-900 leading-none group-hover:text-violet-600 transition-colors">{inq.business?.title || 'Local Business'}</h3>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 inline-block">
                                            {inq.type === 'whatsapp' ? 'Offer Claim' : 'General Inquiry'}
                                        </span>
                                    </div>
                                </div>
                                <div className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                                    inq.status === 'new' ? 'bg-violet-50 text-violet-600' : 'bg-slate-100 text-slate-400'
                                }`}>
                                    {inq.status}
                                </div>
                            </div>

                            <p className="text-xs text-slate-600 line-clamp-2 mb-4 pl-1">
                                {inq.message}
                            </p>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold">
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {formatDistanceToNow(new Date(inq.createdAt), { addSuffix: true })}
                                    </div>
                                </div>
                                <Link 
                                    href={`/business/${inq.business?.slug}`}
                                    className="text-[9px] font-black uppercase tracking-widest text-violet-600 flex items-center gap-1 hover:gap-2 transition-all"
                                >
                                    Visit Listing <ArrowRight className="w-3 h-3" />
                                </Link>
                            </div>
                        </div>
                    ))}
                    {inquiries.length > 5 && (
                        <Link href="/vendor/messages" className="text-center py-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-violet-600 transition-all">
                            View All Inquiries
                        </Link>
                    )}
                </div>
            )}
        </div>
    );
}
