import CityVendorsClient from './CityVendorsClient';

export const dynamic = 'force-static';
export const dynamicParams = true;

// For static export
export async function generateStaticParams() {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://local-business-listing-directctory-production.up.railway.app/api/v1';
        const res = await fetch(`${apiUrl}/cities`);
        const cities = await res.json();
        const params = (Array.isArray(cities) ? cities : []).map((city: any) => ({
            city: (city.name || city.city || city).toString().toLowerCase(),
        }));
        return params.length > 0 ? params : [{ city: 'default-city' }];
    } catch (error) {
        console.error('Failed to fetch cities for static params:', error);
        return [{ city: 'default-city' }];
    }
}

export default function CityVendorsPage({ params }: { params: { city: string } }) {
    return <CityVendorsClient city={params.city} />;
}
