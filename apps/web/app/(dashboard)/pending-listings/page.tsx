"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Filter, MoreVertical, Star, MapPin, Eye, MessageSquare, Loader2, ChevronLeft, ChevronRight, X, Lock, Clock } from 'lucide-react';
import Link from 'next/link';
import AddBusinessModal from '../../../components/vendor/AddBusinessModal';
import { useAuth } from '../../../context/AuthContext';
import { api, getImageUrl } from '../../../lib/api';
import { ListingImage } from '../../../components/ListingImage';
import { Business } from '../../../types/api';
import { FeatureGate } from '../../../components/vendor/FeatureGate';

const PAGE_SIZE = 9;

export default function VendorPendingListings() {
    const { user } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);
    const [listings, setListings] = useState<Business[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOrder, setSortOrder] = useState<'newest' | 'rated' | 'views'>('newest');
    // Default to 'pending' for this dedicated page
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
    
    const isAuthorized = user?.role === 'vendor' || user?.role === 'admin' || user?.role === 'superadmin';
    const isVendor = user?.role === 'vendor';
    const activeSub = user?.vendor?.subscriptions?.find((sub: any) => sub.status === 'active');
    const features = activeSub?.plan?.dashboardFeatures || {};

    const fetchListings = async () => {
        try {
            setLoading(true);
            const response = await api.listings.getMyListings();
            setListings(response.data || []);
            setCurrentPage(1);
        } catch (error) {
            console.error('Error fetching listings:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchListings();
    }, [user]);

    const handleEdit = (biz: Business) => {
        setEditingBusiness(biz);
        setIsModalOpen(true);
    };

    const filteredListings = useMemo(() => {
        let result = [...listings];

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(b =>
                (b as any).title?.toLowerCase().includes(q) ||
                (b as any).city?.toLowerCase().includes(q) ||
                (b as any).category?.name?.toLowerCase().includes(q) ||
                (b as any).description?.toLowerCase().includes(q)
            );
        }

        if (statusFilter !== 'all') {
            result = result.filter(b => ((b as any).status || '').toLowerCase() === statusFilter);
        }

        if (sortOrder === 'rated') {
            result.sort((a, b) => parseFloat((b as any).averageRating || '0') - parseFloat((a as any).averageRating || '0'));
        } else if (sortOrder === 'views') {
            result.sort((a, b) => Number((b as any).totalViews || 0) - Number((a as any).totalViews || 0));
        } else {
            result.sort((a, b) => new Date((b as any).createdAt || 0).getTime() - new Date((a as any).createdAt || 0).getTime());
        }

        return result;
    }, [listings, searchQuery, sortOrder, statusFilter]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, sortOrder, statusFilter]);

    const totalPages = Math.ceil(filteredListings.length / PAGE_SIZE);
    const paginatedListings = filteredListings.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    return (
        <FeatureGate feature="showListings" title="Pending Listings" description="Accessing and managing your business listings is not included in your current plan. Upgrade to see and manage your listings!">
            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl lg:text-5xl font-black text-slate-900 mb-2 tracking-tight flex items-center gap-4">
                            <Clock className="w-8 h-8 text-amber-500" />
                            Pending Approval
                        </h1>
                        <p className="text-slate-400 font-bold tracking-tight text-lg">Listings waiting for admin verification</p>
                    </div>
                    <Link href="/listings" className="text-sm font-black text-blue-600 hover:text-blue-700 bg-blue-50 px-6 py-3 rounded-2xl transition-all">
                        View All Listings
                    </Link>
                </div>

                <AddBusinessModal
                    isOpen={isModalOpen}
                    business={editingBusiness}
                    onClose={() => { setIsModalOpen(false); setEditingBusiness(null); }}
                    onSuccess={() => { fetchListings(); }}
                />

                {/* Filters Bar */}
                <div className="bg-white p-4 rounded-[20px] border border-slate-100 shadow-sm space-y-3">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-grow relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Search pending listings..."
                                className="w-full pl-12 pr-10 py-3 bg-slate-50 border-transparent focus:border-blue-500/20 focus:bg-white rounded-2xl text-sm font-bold transition-all outline-none"
                            />
                        </div>

                        {/* Status Filter Pills */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <Filter className="w-4 h-4 text-slate-400" />
                            {(['all', 'pending', 'approved', 'rejected'] as const).map(s => (
                                <button
                                    key={s}
                                    onClick={() => setStatusFilter(s)}
                                    className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${statusFilter === s
                                        ? 'bg-slate-900 text-white'
                                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                        }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Listings Grid */}
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {loading ? (
                        <div className="col-span-full flex flex-col items-center justify-center py-20">
                            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                            <p className="text-slate-400 font-bold uppercase tracking-widest">Loading...</p>
                        </div>
                    ) : paginatedListings.length > 0 ? (
                        paginatedListings.map((biz: any) => (
                            <div key={biz.id} className="group bg-white rounded-[20px] overflow-hidden border border-black shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 flex flex-col">
                                <div className="relative h-56 overflow-hidden">
                                    <ListingImage 
                                        src={biz.coverImageUrl || biz.images?.[0]} 
                                        alt={biz.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute top-4 left-4">
                                        <span className="px-4 py-1.5 bg-amber-500/90 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-sm flex items-center gap-2">
                                            <Clock className="w-3 h-3" /> {biz.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-8 flex-grow flex flex-col">
                                    <div className="flex items-start justify-between mb-2">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-2 block">{biz.category?.name || 'Business'}</span>
                                        <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-50 rounded-lg">
                                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                            <span className="text-xs font-black text-amber-600">{biz.averageRating || 0}</span>
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 mb-3 group-hover:text-blue-600 transition-colors leading-tight">{biz.title}</h3>
                                    <div className="flex items-center gap-2 text-slate-400 font-bold text-sm mb-6">
                                        <MapPin className="w-4 h-4" />
                                        <span>{biz.city || biz.location || 'Location'}</span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mt-auto">
                                        <button onClick={() => handleEdit(biz)} className="py-3.5 px-4 bg-slate-900 text-white rounded-xl font-black text-xs hover:bg-slate-800 transition-all active:scale-95">
                                            Edit Listing
                                        </button>
                                        <Link href={`/business/${biz.slug}`} className="py-3.5 px-4 bg-white text-slate-900 border border-black rounded-xl font-black text-xs hover:bg-slate-50 transition-all active:scale-95 text-center">
                                            Preview Page
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-20 bg-slate-50 rounded-[20px] border-2 border-dashed border-slate-200">
                            <Clock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-400 font-bold italic text-lg">
                                No pending listings found.
                            </p>
                            <p className="text-slate-300 text-sm font-medium mt-2">Check back later or click "View All" to manage approved items.</p>
                        </div>
                    )}
                </div>

                {/* Pagination Bar */}
                {!loading && totalPages > 1 && (
                    <div className="flex items-center justify-between bg-white border border-slate-100 rounded-2xl px-6 py-4 shadow-sm">
                        <p className="text-sm font-bold text-slate-500">
                            Showing <span className="text-slate-900">{(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filteredListings.length)}</span> of <span className="text-slate-900">{filteredListings.length}</span>
                        </p>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                                className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                                className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </FeatureGate>
    );
}
