"use client";

import React from 'react';
import { Images } from 'lucide-react';
import { getImageUrl } from '../lib/api';

interface ListingImageProps {
    src?: string | null;
    alt: string;
    className?: string;
    iconSize?: number;
    aspectRatio?: string;
}

export function ListingImage({ 
    src, 
    alt, 
    className = "w-full h-full object-cover", 
    iconSize = 24,
    aspectRatio
}: ListingImageProps) {
    const [error, setError] = React.useState(false);
    const imageUrl = getImageUrl(src);

    if (imageUrl && !error) {
        return (
            <img
                src={imageUrl}
                alt={alt}
                className={className}
                style={aspectRatio ? { aspectRatio } : undefined}
                onError={() => setError(true)}
            />
        );
    }

    return (
        <div 
            className={`flex flex-col items-center justify-center bg-slate-100 text-slate-300 gap-2 ${className}`}
            style={aspectRatio ? { aspectRatio } : undefined}
        >
            <Images style={{ width: iconSize, height: iconSize }} className="opacity-20" />
            <span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-40">No Image</span>
        </div>
    );
}
