import React from 'react';
import CityVendorsClient from './CityVendorsClient';

import { api } from '../../../lib/api';

export const dynamic = 'force-static';
export const dynamicParams = false;

// ✅ Added generateStaticParams for static export support
export async function generateStaticParams() {
    try {
        const response = await api.cities.getAll({ silent: true });
        // Handle both direct array and { data: [...] } formats
        const cities = Array.isArray(response) ? response : (response as any)?.data ?? [];
        
        const params = cities.map((city: any) => ({
            cityName: city.slug || encodeURIComponent(city.name.toLowerCase())
        }));
        
        // Add common fallbacks and placeholders used in the app
        const fallbacks = [
            { cityName: 'lahore' },
            { cityName: 'karachi' },
            { cityName: 'islamabad' },
            { cityName: 'template' },
            { cityName: 'default' }
        ];

        // Deduplicate
        const allParams = [...params, ...fallbacks];
        const uniqueParams = Array.from(new Set(allParams.map(p => p.cityName)))
            .map(cityName => ({ cityName }));

        return uniqueParams;
    } catch (error) {
        console.error('Error generating city static params:', error);
        return [
            { cityName: 'lahore' },
            { cityName: 'template' },
            { cityName: 'default' }
        ];
    }
}

export default async function CityPage({ params }: { params: Promise<{ cityName: string }> }) {
    const { cityName } = await params;
    
    return <CityVendorsClient city={cityName} />;
}
