import { api } from '@/lib/api';
import BusinessDetailClient from './BusinessDetailClient';



export async function generateStaticParams() {
    try {
        // Robust search with basic fallback
        const response = await api.listings.search({ limit: 1000 });
        const businesses = (response && Array.isArray(response.data)) ? response.data : [];
        
        const params = businesses
            .filter((b: any) => b && b.slug)
            .map((business: any) => ({
                businessSlug: String(business.slug),
            }));
            
        // Include 'template' for SPA fallback and ensure at least one param exists
        return [...params, { businessSlug: 'template' }];
    } catch (error) {
        console.error('Failed to generate static params for businesses:', error);
        // Fallback for build phase if API is unreachable
        return [{ businessSlug: 'template' }];
    }
}

// Ensure pages that weren't pre-generated are still accessible on-demand
// Standard dynamic build support
// Disable dynamicParams for static export
export const dynamicParams = false;

export default async function BusinessPage({ params }: { params: Promise<{ businessSlug: string }> }) {
    const { businessSlug } = await params;
    return <BusinessDetailClient slug={businessSlug} />;
}
