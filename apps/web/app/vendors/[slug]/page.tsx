import { api } from '../../../lib/api';
import VendorProfileClient from './VendorProfileClient';



// Dynamic page for SSR
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function VendorProfilePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    return <VendorProfileClient slugOrId={slug} />;
}
