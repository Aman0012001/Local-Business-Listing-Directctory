"use client";

import React from 'react';
import { Plus, Search, Filter, MoreVertical, Star, MapPin, Eye, MessageSquare } from 'lucide-react';
import Link from 'next/link';

const myListings = [
    {
        id: 1,
        name: 'Cityscape Cafe',
        category: 'Restaurant',
        status: 'Active',
        rating: 5,
        reviews: 24,
        views: 1240,
        location: 'New York',
        image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=400'
    },
    {
        id: 2,
        name: 'Elite Fitness Gym',
        category: 'Fitness',
        status: 'Active',
        rating: 4.5,
        reviews: 18,
        views: 840,
        location: 'Brooklyn',
        image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=400'
    }
];

export default function VendorListings() {
    return (
        <div className="space-y-8">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl lg:text-5xl font-black text-slate-900 mb-2 tracking-tight">Your Listings</h1>
                    <p className="text-slate-400 font-bold tracking-tight text-lg">Manage and track your business performances</p>
                </div>
                <button className="flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95 whitespace-nowrap">
                    <Plus className="w-5 h-5" /> Add New Listing
                </button>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-[32px] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="flex-grow relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search your listings..."
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-transparent focus:border-blue-500/20 focus:bg-white rounded-2xl text-sm font-bold transition-all outline-none"
                    />
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-6 py-3 bg-slate-50 text-slate-600 rounded-2xl font-bold border border-transparent hover:border-slate-200 transition-all">
                        <Filter className="w-4 h-4" /> Filters
                    </button>
                    <select className="px-6 py-3 bg-slate-50 text-slate-600 rounded-2xl font-bold border border-transparent hover:border-slate-200 transition-all outline-none">
                        <option>Newest First</option>
                        <option>Highest Rated</option>
                        <option>Most Views</option>
                    </select>
                </div>
            </div>

            {/* Listings Grid */}
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
                {myListings.map((biz) => (
                    <div key={biz.id} className="group bg-white rounded-[40px] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 flex flex-col">
                        {/* Image Container */}
                        <div className="relative h-56 overflow-hidden">
                            <img
                                src={biz.image}
                                alt={biz.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute top-4 left-4">
                                <span className="px-4 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-[#1D8E66] shadow-sm">
                                    {biz.status}
                                </span>
                            </div>
                            <div className="absolute top-4 right-4">
                                <button className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-xl flex items-center justify-center text-slate-700 hover:bg-white transition-all shadow-sm">
                                    <MoreVertical className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-8 flex-grow flex flex-col">
                            <div className="flex items-start justify-between mb-2">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-2 block">{biz.category}</span>
                                <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-50 rounded-lg">
                                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                    <span className="text-xs font-black text-amber-600">{biz.rating}</span>
                                </div>
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-3 group-hover:text-blue-600 transition-colors leading-tight">
                                {biz.name}
                            </h3>
                            <div className="flex items-center gap-2 text-slate-400 font-bold text-sm mb-6">
                                <MapPin className="w-4 h-4" />
                                <span>{biz.location}</span>
                            </div>

                            {/* Stats Mini Grid */}
                            <div className="grid grid-cols-2 gap-4 mt-auto">
                                <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3">
                                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                                        <Eye className="w-4 h-4 text-blue-500" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">Views</p>
                                        <p className="text-sm font-black text-slate-900">{biz.views}</p>
                                    </div>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3">
                                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                                        <MessageSquare className="w-4 h-4 text-orange-500" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">Reviews</p>
                                        <p className="text-sm font-black text-slate-900">{biz.reviews}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="grid grid-cols-2 gap-3 mt-8">
                                <button className="py-3.5 px-4 bg-slate-900 text-white rounded-xl font-black text-xs hover:bg-slate-800 transition-all active:scale-95">
                                    Edit Listing
                                </button>
                                <button className="py-3.5 px-4 bg-white text-slate-900 border-2 border-slate-100 rounded-xl font-black text-xs hover:bg-slate-50 transition-all active:scale-95">
                                    View Page
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Create New Card */}
                <button className="group h-full min-h-[400px] border-4 border-dashed border-slate-100 rounded-[40px] flex flex-col items-center justify-center gap-6 hover:border-blue-100 hover:bg-blue-50/30 transition-all duration-500 cursor-pointer">
                    <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-slate-300 group-hover:text-blue-600 group-hover:scale-110 group-hover:rotate-90 transition-all duration-500 shadow-sm group-hover:shadow-xl group-hover:shadow-blue-500/10">
                        <Plus className="w-8 h-8" />
                    </div>
                    <div className="text-center px-8">
                        <p className="text-xl font-black text-slate-400 group-hover:text-blue-600 transition-colors mb-2">Create New Listing</p>
                        <p className="text-sm text-slate-300 font-bold max-w-[200px]">Add another business to your portfolio and start getting leads.</p>
                    </div>
                </button>
            </div>
        </div>
    );
}
