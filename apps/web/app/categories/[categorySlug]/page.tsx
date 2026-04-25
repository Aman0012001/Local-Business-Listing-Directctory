import React from 'react';
import CategoryDetailClient from './CategoryDetailClient';

export default async function CategoryPage({ params }: { params: Promise<{ categorySlug: string }> }) {
    const { categorySlug } = await params;
    return <CategoryDetailClient slug={categorySlug} />;
}
