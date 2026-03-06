console.log('DEBUG: Loading business page.tsx');
import React from 'react';
import { api } from '@/lib/api';
import BusinessDetailClient from './BusinessDetailClient';

export const dynamic = 'force-static';
export const dynamicParams = true;

export async function generateStaticParams() {
    try {
        const response = await api.listings.search({ limit: 100 });
        const businesses = response.data || [];
        return businesses.map((business: any) => ({
            slug: business.slug,
        }));
    } catch (error) {
        console.error('Failed to generate static params for businesses:', error);
        return [];
    }
}

export default function BusinessPage({ params }: { params: { slug: string } }) {
    return <BusinessDetailClient slug={params.slug} />;
}
