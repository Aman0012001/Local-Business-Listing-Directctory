"use client";

import React from 'react';
import Link from 'next/link';
import { Star, MapPin, ShieldCheck, Clock, CheckCircle2, Users } from 'lucide-react';
import { Business } from '../types/api';
import { getImageUrl } from '../lib/api';
import { getBusinessOpenStatus } from '../lib/business-status';
// Simple Online/Offline badge — green when vendor is logged in, red when not
const VendorOnlineBadge = ({ isOnline }: { isOnline?: boolean }) => {
    if (isOnline) {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Online
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-600 border border-red-200">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            Offline
        </span>
    );
};

// Open / Closed badge based on business hours
// Falls back to vendor.businessHours (Record) if listing.businessHours (Array) is empty
const BusinessOpenBadge = ({ business }: { business: Business }) => {
    const hoursData = (business.businessHours && business.businessHours.length > 0)
        ? business.businessHours
        : business.vendor?.businessHours;

    const { status, label, todayHours } = getBusinessOpenStatus(hoursData);
    if (status === 'UNKNOWN') return null;

    const isOpen = status === 'OPEN';
    return (
        <span
            title={todayHours ? `Today: ${todayHours}` : undefined}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                isOpen
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : 'bg-slate-100 text-slate-500 border-slate-200'
            }`}
        >
            <Clock className="w-3 h-3" />
            {label}
            {todayHours && <span className="hidden sm:inline font-normal normal-case">&middot; {todayHours}</span>}
        </span>
    );
};

const StatusBadge = ({ status }: { status?: string }) => {
    if (!status || status === 'approved') {
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3 h-3" /> Approved
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3" /> Pending
        </span>
    );
};

interface BusinessCardProps {
    business: Business;
    variant?: 'green' | 'blue' | 'white' | 'dark' | 'minimal';
    layout?: 'grid' | 'list';
}

export default function BusinessCard({ business, variant = 'blue', layout = 'grid' }: BusinessCardProps) {
    const getButtonStyles = () => {
        switch (variant) {
            case 'green':
                return 'bg-[#00B67A] hover:bg-[#009665] text-white';
            case 'blue':
                return 'bg-[#3C82F6] hover:bg-[#2563EB] text-white';
            case 'white':
                return 'bg-white border-2 border-slate-200 text-slate-600 hover:bg-slate-50';
            case 'dark':
                return 'bg-[#112D4E] hover:bg-black text-white';
            case 'minimal':
                return 'bg-slate-900 hover:bg-blue-600 text-white';
            default:
                return 'bg-[#3C82F6] hover:bg-[#2563EB] text-white';
        }
    };

    const getButtonText = () => {
        return variant === 'green' ? 'Call Now' : 'View Details';
    };

    if (variant === 'minimal') {
        const isList = layout === 'list';
        return (
            <Link href={`/business/${business.slug}`} className={`group block ${isList ? 'w-full' : ''}`}>
                <div className={`flex ${isList ? 'flex-row gap-8 items-center' : 'flex-col gap-6'} transition-all duration-700`}>
                    {/* Minimalist Image container */}
                    <div className={`relative overflow-hidden rounded-[20px] bg-slate-50 border border-slate-100/50 ${isList ? 'w-64 h-48 shrink-0' : 'aspect-[4/3] w-full'}`}>
                        <img
                            src={getImageUrl(business.coverImageUrl) || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800'}
                            alt={business.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s] grayscale-[0.2] group-hover:grayscale-0"
                        />
                        {business.isVerified && (
                            <div className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-md rounded-full shadow-sm text-blue-600 border border-white">
                                <ShieldCheck className="w-4 h-4 fill-blue-600/10" />
                            </div>
                        )}
                    </div>

                    {/* Minimalist Content */}
                    <div className="flex-grow">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">
                                {business.category?.name || 'Selection'}
                            </span>
                            <div className="h-px w-4 bg-slate-200" />
                            <div className="flex items-center gap-1.5 font-black text-slate-900 text-xs">
                                <Star className="w-3.5 h-3.5 fill-slate-900" />
                                {business.averageRating || '4.5'}
                            </div>
                        </div>

                        <h3 className="text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors mb-2 tracking-tight">
                            {business.title}.
                        </h3>

                        <p className="text-slate-400 text-sm font-bold leading-relaxed mb-6 line-clamp-2 max-w-lg">
                            {business.shortDescription || business.description || 'Premium listing with exceptional service quality and local commitment.'}
                        </p>

                        <div className="flex items-center gap-4 text-xs font-black text-slate-900 uppercase tracking-widest group-hover:gap-6 transition-all">
                            Explore Details
                            <div className="w-8 h-[2px] bg-slate-100 group-hover:bg-blue-600 group-hover:w-16 transition-all duration-500" />
                        </div>
                    </div>
                </div>
            </Link>
        );
    }

    if (layout === 'list') {
        return (
            <Link href={`/business/${business.slug}`} className="group block">
                <div className="bg-white rounded-2xl border border-black overflow-hidden hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-500 flex flex-col md:flex-row h-full md:h-64">
                    {/* Image Container */}
                    <div className="relative w-full md:w-80 h-48 md:h-full overflow-hidden">
                        <img
                            src={getImageUrl(business.coverImageUrl) || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800'}
                            alt={business.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        {business.isFeatured && (
                            <div className="absolute top-4 left-4 px-3 py-1 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-lg">
                                Featured
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    <div className="p-8 flex flex-col flex-grow">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                                        {business.title}
                                    </h3>
                                    {business.isVerified && (
                                        <ShieldCheck className="w-5 h-5 text-amber-500" />
                                    )}
                                </div>
                                <div className="flex items-center gap-2 mb-1">
                                    <StatusBadge status={(business as any).status} />
                                </div>
                                <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                                    <MapPin className="w-4 h-4 text-blue-600" />
                                    {business.address}, {business.city}
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1 rounded-full text-amber-600 font-bold border border-amber-100">
                                    <Star className="w-4 h-4 fill-amber-500" />
                                    <span>{business.averageRating || '4.5'}</span>
                                    <span className="text-xs text-amber-400 font-medium">({business.totalReviews || 0})</span>
                                </div>
                                {business.followersCount !== undefined && business.followersCount > 0 && (
                                    <div className="flex items-center gap-1.5 bg-violet-50 px-3 py-1 rounded-full text-violet-600 font-bold border border-violet-100 mt-2">
                                        <Users className="w-3.5 h-3.5" />
                                        <span className="text-xs">{business.followersCount} followers</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <p className="text-slate-500 text-sm line-clamp-2 mb-6 leading-relaxed">
                            {business.shortDescription || business.description}
                        </p>

                        <div className="mt-auto flex items-center justify-between gap-6">
                            <div className="flex items-center gap-2 flex-wrap">
                                <div className="px-3 py-1 bg-slate-50 text-slate-500 rounded-lg text-xs font-bold border border-slate-100 uppercase tracking-widest">
                                    {business.category?.name || 'Service'}
                                </div>
                                <VendorOnlineBadge isOnline={business.vendor?.user?.isOnline} />
                                <BusinessOpenBadge business={business} />
                            </div>
                            <div className={`px-8 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95 text-sm ${getButtonStyles()}`}>
                                {getButtonText()}
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        );
    }

    return (
        <Link href={`/business/${business.slug}`} className="group h-full">
            <div className="bg-white rounded-2xl border  overflow-hidden hover: hover:shadow-blue-500/5 transition-all duration-500 flex flex-col h-full">
                {/* Image Container */}
                <div className="relative h-48 overflow-hidden">
                    <img
                        src={getImageUrl(business.coverImageUrl) || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800'}
                        alt={business.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    {business.isVerified && (
                        <div className="absolute top-4 right-4 px-3 py-1 bg-amber-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg">
                            Verified
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-7 flex flex-col flex-grow">
                    <div className="flex items-start justify-between mb-1">
                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                            {business.title}
                        </h3>
                        <div className="flex items-center gap-1 text-amber-500 font-bold">
                            <Star className="w-4 h-4 fill-amber-400" />
                            <span>{business.averageRating || '4.5'}</span>
                        </div>
                        {business.followersCount !== undefined && business.followersCount > 0 && (
                            <div className="flex items-center gap-1 text-[10px] font-bold text-violet-500 bg-violet-50 px-2 py-0.5 rounded-full border border-violet-100">
                                <Users className="w-3 h-3" />
                                {business.followersCount}
                            </div>
                        )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                        <StatusBadge status={(business as any).status} />
                        <VendorOnlineBadge isOnline={business.vendor?.user?.isOnline} />
                        <BusinessOpenBadge business={business} />
                    </div>
                    <div className="flex items-center gap-2 mb-6 text-slate-500">
                        <div className="flex text-amber-500">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(Number(business.averageRating || 4.5)) ? 'fill-amber-500' : 'text-slate-200'}`} />
                            ))}
                        </div>
                    </div>

                    <div className="mt-auto">
                        <div className={`block w-full text-center py-2  font-bold transition-all s active:scale-95`} style={{ backgroundColor: "#eff6ff", borderRadius: "10px" }}>
                            {/* {getButtonText()} */} View Details
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
