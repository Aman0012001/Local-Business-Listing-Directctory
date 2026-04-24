import React from 'react';
import { api } from '@/lib/api';
import CategoryDetailClient from './CategoryDetailClient';



// Dynamic page for SSR
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function CategoryPage({ params }: { params: Promise<{ categorySlug: string }> }) {
    const { categorySlug } = await params;
    return <CategoryDetailClient slug={categorySlug} />;
}
