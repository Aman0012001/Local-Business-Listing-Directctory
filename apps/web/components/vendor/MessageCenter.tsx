"use client";

import React from 'react';
import { ChevronRight } from 'lucide-react';

const messages = [
    {
        id: 1,
        user: 'Sarah Williams',
        lastMessage: 'I have some questions regarding the service...',
        time: '2h ago',
        unread: true,
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100'
    },
    {
        id: 2,
        user: 'Dr. Anil Kumar',
        lastMessage: 'Does this service include follow-up...',
        time: '5h ago',
        unread: false,
        avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=100'
    },
    {
        id: 3,
        user: 'Ravi Sharma',
        lastMessage: 'Thank you for the recommendation!',
        time: '1d ago',
        unread: false,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100'
    }
];

export default function MessageCenter() {
    return (
        <div className="bg-white rounded-[40px] border border-slate-100 p-8 shadow-sm h-full flex flex-col">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-[10px] font-black">2</div>
                    <h3 className="text-xl font-black text-slate-800">Messages</h3>
                </div>
                <button className="flex items-center gap-1 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">
                    2 Unread
                </button>
            </div>

            <div className="space-y-4 flex-grow">
                {messages.map((msg, i) => (
                    <div
                        key={msg.id}
                        className={`flex items-center gap-4 p-4 rounded-[28px] hover:bg-slate-50 transition-all cursor-pointer group relative overflow-hidden ${msg.unread ? 'bg-blue-50/40 border border-blue-100/50' : 'border border-transparent'}`}
                    >
                        {msg.unread && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600" />
                        )}
                        <div className="relative flex-shrink-0">
                            <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-md group-hover:scale-110 transition-transform duration-500">
                                <img src={msg.avatar} alt={msg.user} className="w-full h-full object-cover" />
                            </div>
                        </div>
                        <div className="flex-grow overflow-hidden">
                            <div className="flex items-center justify-between mb-1">
                                <span className={`text-sm font-black truncate tracking-tight ${msg.unread ? 'text-blue-600 font-black' : 'text-slate-700 font-bold'}`}>{msg.user}</span>
                                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{msg.time}</span>
                            </div>
                            <p className="text-[13px] text-slate-500 font-medium truncate group-hover:text-slate-700 transition-colors">{msg.lastMessage}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                    </div>
                ))}
            </div>

            <button className="mt-8 w-full py-4 bg-slate-50 text-slate-400 text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-slate-100 hover:text-slate-600 transition-all">
                Go to Messenger
            </button>
        </div>
    );
}
