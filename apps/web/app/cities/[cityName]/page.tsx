import React from 'react';
import CityVendorsClient from './CityVendorsClient';

export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
    return [{ cityName: 'placeholder' }];
}

export default async function CityPage({ params }: { params: Promise<{ cityName: string }> }) {
    const { cityName } = await params;
    
    return <CityVendorsClient city={cityName} />;
}
