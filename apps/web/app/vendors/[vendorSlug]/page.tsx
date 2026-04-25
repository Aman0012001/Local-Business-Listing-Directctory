import React from 'react';
import VendorProfileClient from './VendorProfileClient';

import { api } from '../../../lib/api';

export default async function VendorProfilePage({ params }: { params: Promise<{ vendorSlug: string }> }) {
    const { vendorSlug } = await params;
    
    let initialData = null;
    try {
        initialData = await api.vendors.getPublicProfile(vendorSlug);
    } catch (error) {
        console.error(`[VendorProfilePage] SSR Fetch failed for ${vendorSlug}:`, error);
    }

    return <VendorProfileClient slugOrId={vendorSlug} initialData={initialData} />;
}
