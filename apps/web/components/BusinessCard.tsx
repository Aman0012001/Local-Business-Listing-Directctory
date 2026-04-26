"use client";

import React from 'react';
import Link from 'next/link';
import { Star, CheckCircle2 } from 'lucide-react';
import { Business } from '../types/api';
import { ListingImage } from './ListingImage';

// ⭐ Rating Component
const RatingStars = ({ rating }: { rating: number }) => {
    return (
        <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium text-[#70757a]">
                {Number(rating || 0).toFixed(1)}
            </span>
            <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                    <Star 
                        key={i} 
                        className={`w-3.5 h-3.5 ${i < Math.round(rating || 0) ? 'fill-[#fbbc04] text-[#fbbc04]' : 'text-gray-200'}`} 
                    />
                ))}
            </div>
        </div>
    );
};

interface BusinessCardProps {
    business: Business;
}

export default function BusinessCard({ business }: BusinessCardProps) {

    const isApproved = business.status === 'approved';
    const isOffline = !business.vendor?.user?.isOnline;

    // ✅ SAFE URL (IMPORTANT FIX)
    const businessUrl = business.slug
        ? `/business/${business.slug}`
        : `/business/${business.id}`; // fallback

    return (
        <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full hover:shadow-md transition">

            {/* Image */}
            <div className="relative h-[220px] w-full overflow-hidden">
                <ListingImage
                    src={business.coverImageUrl}
                    alt={business.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                />
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col gap-4 flex-grow">

                {/* Title */}
                <h3 className="text-lg font-medium text-[#1a0dab] group-hover:underline line-clamp-1">
                    {business.title}
                </h3>

                {/* Status */}
                <div className="flex gap-2 flex-wrap">
                    {isApproved && (
                        <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-600">
                            <CheckCircle2 className="w-4 h-4" />
                            Approved
                        </span>
                    )}

                    {isOffline && (
                        <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-600">
                            <span className="w-2 h-2 bg-red-600 rounded-full" />
                            Offline
                        </span>
                    )}
                </div>

                {/* Rating */}
                <RatingStars rating={business.averageRating || 0} />

                {/* Button */}
                <Link
                    href={businessUrl}
                    className="mt-auto w-full text-center py-2 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-[#3c4043] font-medium rounded-md text-sm transition"
                >
                    View Details
                </Link>

            </div>
        </div>
    );
}