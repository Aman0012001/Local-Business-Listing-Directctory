import React from 'react';
import { Metadata } from 'next';
import CategoryDetailClient from './CategoryDetailClient';
import { api } from '../../../lib/api';

export const dynamic = 'force-static';
export const dynamicParams = false;

// Dynamic route handling for categories
export async function generateStaticParams() {
    try {
        const categories = await api.categories.getAll({ silent: true });
        const params = (categories || []).map(cat => ({
            categorySlug: cat.slug
        }));
        
        if (params.length === 0) {
            return [{ categorySlug: 'sample-category' }];
        }
        return params;
    } catch (error) {
        console.error('Error generating category static params:', error);
        return [{ categorySlug: 'sample-category' }];
    }
}

export async function generateMetadata({ 
    params 
}: { 
    params: Promise<{ categorySlug: string }> 
}): Promise<Metadata> {
    const { categorySlug } = await params;
    
    try {
        const category = await api.categories.getBySlug(categorySlug, { silent: true });
        
        if (!category) {
            return {
                title: 'Category Not Found | naampata',
            };
        }

        return {
            title: `${category.name} | Local Businesses in Pakistan | naampata`,
            description: category.description || `Browse the best ${category.name} in Pakistan. Find contact details, reviews, and more.`,
        };
    } catch (error) {
        return {
            title: 'Browse Categories | naampata',
        };
    }
}

export default async function CategoryPage({ 
    params 
}: { 
    params: Promise<{ categorySlug: string }> 
}) {
    const { categorySlug } = await params;
    
    return <CategoryDetailClient slug={categorySlug} />;
}
