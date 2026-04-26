import React from 'react';
import VendorProfileClient from './VendorProfileClient';

// ✅ Removed 'force-static' and 'generateStaticParams' to allow dynamic loading of any vendor
// This fixes the "missing param in generateStaticParams" error.

export default async function VendorProfilePage({ params }: { params: Promise<{ vendorSlug: string }> }) {
    const { vendorSlug } = await params;
    
    return <VendorProfileClient slugOrId={vendorSlug} />;
}
