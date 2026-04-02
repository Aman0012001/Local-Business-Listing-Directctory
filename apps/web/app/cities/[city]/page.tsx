import CityVendorsClient from './CityVendorsClient';



// For static export
export async function generateStaticParams() {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://local-business-listing-directctory-production.up.railway.app/api/v1';
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

// Ensure pages that weren't pre-generated are still accessible on-demand
export const dynamicParams = true;

export default async function CityVendorsPage({ params }: { params: Promise<{ city: string }> }) {
    const { city } = await params;
    return <CityVendorsClient city={city} />;
}
