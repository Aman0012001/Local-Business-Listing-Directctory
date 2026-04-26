import React from 'react';
import CityVendorsClient from './CityVendorsClient';

// ✅ Removed 'force-static' and 'generateStaticParams' to allow dynamic loading of any city
// This fixes the "missing param in generateStaticParams" error.

export default async function CityPage({ params }: { params: Promise<{ cityName: string }> }) {
    const { cityName } = await params;
    
    return <CityVendorsClient city={cityName} />;
}
