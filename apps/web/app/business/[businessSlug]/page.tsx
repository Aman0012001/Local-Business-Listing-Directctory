import { api } from '@/lib/api';
import BusinessDetailClient from './BusinessDetailClient';



export async function generateStaticParams() {
    try {
        // Robust search with basic fallback
        const response = await api.listings.search({ limit: 100 });
        const businesses = (response && Array.isArray(response.data)) ? response.data : [];
        
        const params = businesses
            .filter((b: any) => b && b.slug)
            .map((business: any) => ({
                businessSlug: String(business.slug),
            }));
            
        // If no businesses found, provide at least one valid-looking slug to satisfy Next.js static export
        return params.length > 0 ? params : [{ businessSlug: 'sample-business' }];
    } catch (error) {
        console.error('Failed to generate static params for businesses:', error);
        // Fallback for build phase if API is unreachable
        return [{ businessSlug: 'sample-business' }];
    }
}

// Ensure pages that weren't pre-generated are still accessible on-demand
// Standard dynamic build support
// Disable dynamicParams for static export
export const dynamicParams = true;

export default async function BusinessPage({ params }: { params: Promise<{ businessSlug: string }> }) {
    const { businessSlug } = await params;
    return <BusinessDetailClient slug={businessSlug} />;
}
