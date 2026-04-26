import React from 'react';
import VendorProfileClient from './VendorProfileClient';

export const dynamic = 'force-static';

export async function generateStaticParams() {
    return [
        { slug: 'sample-vendor' },
        { slug: 'test-vendor' }
    ];
}

export default async function VendorProfilePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    return <VendorProfileClient slugOrId={slug} />;
}
