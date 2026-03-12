import React from 'react';
import { api } from '@/lib/api';
import CategoryDetailClient from './CategoryDetailClient';

export const dynamic = 'force-static';
export const dynamicParams = true;

export async function generateStaticParams() {
    try {
        const categories = await api.categories.getAll();
        return categories.map((category: any) => ({
            slug: category.slug,
        }));
    } catch (error) {
        console.error('Failed to generate static params for categories:', error);
        return [];
    }
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    return <CategoryDetailClient slug={slug} />;
}
