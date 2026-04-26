import React from 'react';
import CityVendorsClient from './CityVendorsClient';

import { api } from '../../../lib/api';

export const dynamicParams = false;

// ✅ Added generateStaticParams for static export support
export async function generateStaticParams() {
    try {
        const cities = await api.cities.getAll({ silent: true });
        const params = (cities || []).map(city => ({
            cityName: city.name
        }));
        
        if (params.length === 0) {
            return [{ cityName: 'lahore' }];
        }
        return params;
    } catch (error) {
        console.error('Error generating city static params:', error);
        return [{ cityName: 'lahore' }];
    }
}

export default async function CityPage({ params }: { params: Promise<{ cityName: string }> }) {
    const { cityName } = await params;
    
    return <CityVendorsClient city={cityName} />;
}
