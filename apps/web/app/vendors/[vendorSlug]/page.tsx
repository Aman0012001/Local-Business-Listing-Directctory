import React from 'react';
import VendorProfileClient from './VendorProfileClient';
import { api } from '../../../lib/api';

export const dynamic = 'force-static';
export const dynamicParams = false;

export async function generateStaticParams() {
    try {
        const slugs = await api.vendors.getAllSlugs();
        const params = (slugs || []).map(slug => ({ vendorSlug: slug }));
        
        // Ensure template and sample-vendor are included for fallbacks
        const essentials = ['sample-vendor', 'template'];
        essentials.forEach(slug => {
            if (!params.some(p => p.vendorSlug === slug)) {
                params.push({ vendorSlug: slug });
            }
        });
        
        return params;
    } catch (error) {
        console.error('[generateStaticParams] Error fetching vendor slugs:', error);
        return [
            { vendorSlug: 'sample-vendor' },
            { vendorSlug: 'template' }
        ];
    }
}

export default async function VendorProfilePage({ params }: { params: Promise<{ vendorSlug: string }> }) {
    const { vendorSlug } = await params;
    return <VendorProfileClient slugOrId={vendorSlug} />;
}
