import React from 'react';
import CityVendorsClient from './CityVendorsClient';

export default async function CityPage({ params }: { params: Promise<{ cityName: string }> }) {
    const { cityName } = await params;
    return <CityVendorsClient city={cityName} />;
}
