import { Business, Category, City, SearchResponse } from '../types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

async function fetcher<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
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
        search: (params: Record<string, string | number | boolean>) => {
            const query = new URLSearchParams(params as any).toString();
            return fetcher<SearchResponse>(`/businesses/search?${query}`);
        },
        getBySlug: (slug: string) => fetcher<Business>(`/businesses/slug/${slug}`),
        getFeatured: () => fetcher<SearchResponse>('/businesses/search?featuredOnly=true&limit=6'),
    },
    cities: {
        getPopular: () => fetcher<City[]>('/cities/popular'),
        getAll: () => fetcher<City[]>('/cities/popular'),
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
