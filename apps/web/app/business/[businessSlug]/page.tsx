import { api } from '../../../lib/api';
import BusinessDetailClient from './BusinessDetailClient';

export const dynamic = 'force-static';
export const dynamicParams = false;

export async function generateStaticParams() {
    try {
        const response = await api.listings.search({ limit: 100 });
        const businesses = response.data || [];
        
        const params = businesses
            .filter((b: any) => b && b.slug)
            .map((business: any) => ({
                businessSlug: String(business.slug),
            }));
            
        return params.length > 0 ? params : [{ businessSlug: 'test-business' }];
    } catch (error) {
        console.error('Failed to generate static params for businesses:', error);
        return [{ businessSlug: 'test-business' }];
    }
}

export default async function BusinessPage({ params }: { params: Promise<{ businessSlug: string }> }) {
    const { businessSlug } = await params;
    return <BusinessDetailClient slug={businessSlug} />;
}
