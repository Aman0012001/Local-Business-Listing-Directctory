import React from 'react';
import VendorProfileClient from './VendorProfileClient';

import { api } from '../../../lib/api';

export const dynamicParams = false;

// ✅ Added generateStaticParams for static export support
export async function generateStaticParams() {
    // Return a placeholder or fetch vendors if needed. 
    // Static export requires at least one path or dynamicParams = false.
    return [{ vendorSlug: 'sample-vendor' }];
}

export default async function VendorProfilePage({ params }: { params: Promise<{ vendorSlug: string }> }) {
    const { vendorSlug } = await params;
    
    return <VendorProfileClient slugOrId={vendorSlug} />;
}
