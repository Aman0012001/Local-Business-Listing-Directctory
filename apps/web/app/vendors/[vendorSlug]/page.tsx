import React from 'react';
import VendorProfileClient from './VendorProfileClient';

export default async function VendorProfilePage({ params }: { params: Promise<{ vendorSlug: string }> }) {
    const { vendorSlug } = await params;
    return <VendorProfileClient slugOrId={vendorSlug} />;
}
