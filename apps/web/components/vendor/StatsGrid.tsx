"use client";

import React from 'react';
import {
    ListTree,
    Heart,
    MessageSquare,
    Star
} from 'lucide-react';

const stats = [
    {
        label: 'Total Listings',
        value: '3',
        icon: ListTree,
        color: 'bg-gradient-to-br from-[#3366CC] to-[#1144AA]',
        shadow: 'shadow-blue-500/20'
    },
    {
        label: 'Saved Businesses',
        value: '5',
        icon: Heart,
        color: 'bg-gradient-to-br from-[#33AA88] to-[#118866]',
        shadow: 'shadow-emerald-500/20'
    },
    {
        label: 'New Messages',
        value: '2',
        icon: MessageSquare,
        color: 'bg-gradient-to-br from-[#FFAA33] to-[#FF8811]',
        shadow: 'shadow-orange-500/20'
    },
    {
        label: 'New Reviews',
        value: '3',
        icon: Star,
        color: 'bg-gradient-to-br from-[#FF6644] to-[#EE4422]',
        shadow: 'shadow-red-500/20'
    },
];

export default function StatsGrid() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {stats.map((stat) => (
                <div
                    key={stat.label}
                    className={`${stat.color} rounded-[24px] p-6 text-white shadow-xl ${stat.shadow} flex items-center gap-5 group hover:scale-[1.02] transition-all duration-300 cursor-pointer`}
                >
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center transition-transform group-hover:rotate-6">
                        <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <p className="text-white/80 text-[10px] font-black uppercase tracking-widest leading-none mb-1.5">{stat.label}</p>
                        <h4 className="text-3xl font-black leading-none">{stat.value}</h4>
                    </div>
                </div>
            ))}
        </div>
    );
}
