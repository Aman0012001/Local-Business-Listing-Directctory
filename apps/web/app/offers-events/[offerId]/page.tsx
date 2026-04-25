import React from 'react';
import OfferEventDetailClient from './OfferEventDetailClient';

export default async function OfferEventDetailPage({ params }: { params: Promise<{ offerId: string }> }) {
    const { offerId } = await params;
    return <OfferEventDetailClient />;
}
