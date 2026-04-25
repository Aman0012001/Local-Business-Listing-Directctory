import React from 'react';
import CategoryDetailClient from './CategoryDetailClient';

export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
    return [{ categorySlug: 'placeholder' }];
}

export default async function CategoryPage({ params }: { params: Promise<{ categorySlug: string }> }) {
    const { categorySlug } = await params;
    
    return <CategoryDetailClient slug={categorySlug} />;
}

