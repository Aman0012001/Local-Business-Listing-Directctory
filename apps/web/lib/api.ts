import { Business, Category, City, SearchResponse, Review } from '../types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

async function fetcher<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const headers = new Headers(options?.headers);

    if (!headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }

    // Add Authorization header if token exists
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
        throw new Error(error.message || 'API request failed');
    }

    return response.json();
}

export const api = {
    categories: {
        getAll: () => fetcher<Category[]>('/categories'),
        getPopular: (limit = 8) => fetcher<Category[]>(`/categories/popular?limit=${limit}`),
        getBySlug: (slug: string) => fetcher<Category>(`/categories/slug/${slug}`),
    },
    businesses: {
        search: (params: Record<string, string | number | boolean | undefined | null>) => {
            const sanitizedParams: Record<string, string> = {};

            Object.entries(params).forEach(([key, value]) => {
                // Only include if value is truthy (non-empty string, number > 0, or true)
                // We exclude false, null, undefined, and empty string
                if (value !== undefined && value !== null && value !== '' && value !== false) {
                    sanitizedParams[key] = String(value);
                }
            });

            const query = new URLSearchParams(sanitizedParams).toString();
            return fetcher<SearchResponse>(`/businesses/search?${query}`);
        },
        getBySlug: (slug: string) => fetcher<Business>(`/businesses/slug/${slug}`),
        getFeatured: () => fetcher<SearchResponse>('/businesses/search?featuredOnly=true&limit=6'),
    },
    cities: {
        getPopular: () => fetcher<City[]>('/cities/popular'),
        getAll: () => fetcher<City[]>('/cities'),
    },
    reviews: {
        getByBusiness: (idOrSlug: string) => fetcher<Review[]>(`/reviews/business/${idOrSlug}`),
        create: (reviewData: any) => fetcher<Review>('/reviews', {
            method: 'POST',
            body: JSON.stringify(reviewData),
        }),
    },
    users: {
        getFavorites: () => fetcher<{ data: Business[] }>('/users/favorites'),
        addFavorite: (businessId: string) => fetcher<void>(`/users/favorites/${businessId}`, {
            method: 'POST',
        }),
        removeFavorite: (businessId: string) => fetcher<void>(`/users/favorites/${businessId}`, {
            method: 'DELETE',
        }),
    },
    auth: {
        login: (credentials: any) => fetcher<any>('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        }),
        register: (userData: any) => fetcher<any>('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        }),
    }
};
