import { api } from '@/lib/api';
import OfferEventDetailClient from './OfferEventDetailClient';



export async function generateStaticParams() {
    try {
        const response = await api.offers.search({ limit: 50 });
        const offers = (response && Array.isArray(response.data)) ? response.data : [];
        
        const params = offers
            .filter((o: any) => o && (o.id || o._id))
            .map((offer: any) => ({
                id: String(offer.id || offer._id),
            }));
            
        return params.length > 0 ? params : [{ id: 'sample-offer' }];
    } catch (error) {
        console.error('Failed to generate static params for offers:', error);
        return [{ id: 'sample-offer' }];
    }
}

export default async function OfferEventDetailPage({ params }: { params: Promise<{ id: string }> }) {
    // We can also extract ID here and pass it down, but the client component uses useParams.
    // Just rendering the client component is fine.
    return <OfferEventDetailClient />;
}
