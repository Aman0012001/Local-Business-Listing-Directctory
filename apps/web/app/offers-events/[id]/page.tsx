import { api } from '@/lib/api';
import OfferEventDetailClient from './OfferEventDetailClient';



// Dynamic page for SSR
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function OfferEventDetailPage({ params }: { params: Promise<{ id: string }> }) {
    // We can also extract ID here and pass it down, but the client component uses useParams.
    // Just rendering the client component is fine.
    return <OfferEventDetailClient />;
}
