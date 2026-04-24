import { api } from '@/lib/api';
import BusinessDetailClient from './BusinessDetailClient';



// Dynamic page for SSR
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function BusinessPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    return <BusinessDetailClient slug={slug} />;
}
