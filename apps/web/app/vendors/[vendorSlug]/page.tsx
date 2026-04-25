import React from 'react';
import VendorProfileClient from './VendorProfileClient';

export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
    return [{ vendorSlug: 'placeholder' }];
}

export default async function VendorProfilePage({ params }: { params: Promise<{ vendorSlug: string }> }) {
    const { vendorSlug } = await params;
    
    return <VendorProfileClient slugOrId={vendorSlug} />;
}
