"use client";

import React from 'react';
interface StatItem {
    label: string;
    value: string | number;
    icon: any;
    color: string;
    shadow: string;
    onClick?: () => void;
}

interface StatsGridProps {
    stats?: StatItem[];
}

import {
    ListTree,
    Heart,
    MessageSquare,
    Star
} from 'lucide-react';

const defaultStats = [
    {
        label: 'Total Listings',
        value: '0',
        icon: ListTree,
        color: 'bg-gradient-to-br from-[#3366CC] to-[#1144AA]',
        shadow: 'shadow-blue-500/20'
    },
    {
        label: 'Saved Businesses',
        value: '0',
        icon: Heart,
        color: 'bg-gradient-to-br from-[#33AA88] to-[#118866]',
        shadow: 'shadow-emerald-500/20'
    },
    {
        label: 'New Messages',
        value: '0',
        icon: MessageSquare,
        color: 'bg-gradient-to-br from-[#FFAA33] to-[#FF8811]',
        shadow: 'shadow-orange-500/20'
    },
    {
        label: 'New Reviews',
        value: '0',
        icon: Star,
        color: 'bg-gradient-to-br from-[#FF6644] to-[#EE4422]',
        shadow: 'shadow-red-500/20'
    },
];

export default function StatsGrid({ stats = defaultStats }: StatsGridProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-6 mb-12">
            {stats.map((stat) => (
                <div
                    key={stat.label}
                    onClick={stat.onClick}
                    className={`${stat.color} rounded-[24px] p-6 text-white ${stat.shadow} flex flex-col items-start gap-5 group hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 ${stat.onClick ? 'cursor-pointer active:scale-95' : 'cursor-default'} relative overflow-hidden`}
                >
                    {/* Decorative Background Icon */}
                    <stat.icon className="absolute -right-4 -bottom-4 w-24 h-24 text-white/10 rotate-12 group-hover:rotate-6 transition-transform duration-500" />
                    
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-6 relative z-10">
                        <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-white/70 text-[10px] font-black uppercase tracking-widest leading-none mb-2">{stat.label}</p>
                        <h4 className="text-3xl font-black leading-none tracking-tight text-white">{stat.value}</h4>
                    </div>
                </div>
            ))}
        </div>
    );
}
