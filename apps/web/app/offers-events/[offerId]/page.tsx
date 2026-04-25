import React from 'react';
import OfferEventDetailClient from './OfferEventDetailClient';

export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
    return [{ offerId: 'placeholder' }];
}

export default async function OfferEventDetailPage({ params }: { params: Promise<{ offerId: string }> }) {
    const { offerId } = await params;
    
    return <OfferEventDetailClient />;
}
