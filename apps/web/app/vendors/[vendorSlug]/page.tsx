import React from 'react';
import VendorProfileClient from './VendorProfileClient';

export const dynamic = 'force-static';
export const dynamicParams = true;

export async function generateStaticParams() {
    return [
        { vendorSlug: 'sample-vendor' },
        { vendorSlug: 'test-vendor' },
        { vendorSlug: 'template' }
    ];
}

export default async function VendorProfilePage({ params }: { params: Promise<{ vendorSlug: string }> }) {
    const { vendorSlug } = await params;
    return <VendorProfileClient slugOrId={vendorSlug} />;
}
