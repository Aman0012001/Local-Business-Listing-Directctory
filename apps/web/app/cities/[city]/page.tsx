import CityVendorsClient from './CityVendorsClient';

export const dynamic = 'force-static';
export const dynamicParams = false;

// For static export
export async function generateStaticParams() {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://process.env.NEXT_PUBLIC_API_URL/api/v1';
        const res = await fetch(`${apiUrl}/cities`);
        const cities = await res.json();
        const params = (Array.isArray(cities) ? cities : [])
            .filter((city: any) => city && (city.name || city.city || city))
            .map((city: any) => ({
                city: (city.slug || city.name || city.city || city).toString().toLowerCase(),
            }));
        return params.length > 0 ? params : [{ city: 'default-city' }];
    } catch (error) {
        console.error('Failed to fetch cities for static params:', error);
        return [{ city: 'default-city' }];
    }
}

export default async function CityVendorsPage({ params }: { params: Promise<{ city: string }> }) {
    const { city } = await params;
    return <CityVendorsClient city={city} />;
}
