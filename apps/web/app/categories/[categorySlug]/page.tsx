import React from 'react';
import { api } from '@/lib/api';
import CategoryDetailClient from './CategoryDetailClient';



export async function generateStaticParams() {
    try {
        const categories = await api.categories.getAll();
        const params = (Array.isArray(categories) ? categories : [])
            .filter((c: any) => c && c.slug)
            .map((category: any) => ({
                categorySlug: String(category.slug),
            }));
        return params.length > 0 ? params : [{ categorySlug: 'general' }];
    } catch (error) {
        console.error('Failed to generate static params for categories:', error);
        return [{ categorySlug: 'general' }];
    }
}

// Ensure pages that weren't pre-generated are still accessible on-demand
// Standard dynamic build support
export const dynamicParams = true;

export default async function CategoryPage({ params }: { params: Promise<{ categorySlug: string }> }) {
    const { categorySlug } = await params;
    return <CategoryDetailClient slug={categorySlug} />;
}
