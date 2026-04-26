import React from 'react';
import VendorProfileClient from './VendorProfileClient';
import { api } from '../../../lib/api';

export const dynamic = 'force-static';
export const dynamicParams = false;

export async function generateStaticParams() {
    try {
        const slugs = await api.vendors.getAllSlugs();
        if (!slugs || slugs.length === 0) {
            return [{ vendorSlug: 'sample-vendor' }];
        }
        return slugs.map(slug => ({ vendorSlug: slug }));
    } catch (error) {
        console.error('[generateStaticParams] Error fetching vendor slugs:', error);
        return [{ vendorSlug: 'sample-vendor' }];
    }
}

export default async function VendorProfilePage({ params }: { params: Promise<{ vendorSlug: string }> }) {
    const { vendorSlug } = await params;
    return <VendorProfileClient slugOrId={vendorSlug} />;
}
