import CityVendorsClient from './CityVendorsClient';



// For static export
// Dynamic page for SSR
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function CityVendorsPage({ params }: { params: Promise<{ city: string }> }) {
    const { city } = await params;
    return <CityVendorsClient city={city} />;
}
