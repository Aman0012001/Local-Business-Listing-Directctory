import React from 'react';
import OfferEventDetailClient from './OfferEventDetailClient';

export const dynamic = 'force-static';
export const dynamicParams = true;

export function generateStaticParams() {
    return [
        { offerId: 'placeholder' },
        { offerId: 'template' }
    ];
}

export default async function OfferEventDetailPage({ params }: { params: Promise<{ offerId: string }> }) {
    const { offerId } = await params;
    
    return <OfferEventDetailClient />;
}
