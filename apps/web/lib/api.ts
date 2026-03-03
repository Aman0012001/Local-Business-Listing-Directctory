import { Business, Category, City, SearchResponse, Review } from '../types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const API_ROOT = API_BASE_URL.split('/api')[0];

export const getImageUrl = (path: string | null | undefined) => {
    if (!path) return null;
    if (path.startsWith('data:')) return path; // Base64 preview
    if (path.startsWith('http')) return path; // Cloudinary or full URL

    // If it's a relative path (old local upload), we don't serve it anymore
    // This prevents 404s to localhost:3000/uploads/...
    if (path.includes('/') || path.includes('\\')) {
        return null;
    }

    return path;
};

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

    const text = await response.text();
    return text ? JSON.parse(text) : (undefined as any);
}

export const api = {
    categories: {
        getAll: () => fetcher<Category[]>('/categories'),
        getPopular: (limit = 8) => fetcher<Category[]>(`/categories/popular?limit=${limit}`),
        getBySlug: (slug: string) => fetcher<Category>(`/categories/slug/${slug}`),
    },
    listings: {
        create: (listingData: any) => fetcher<Business>('/businesses', {
            method: 'POST',
            body: JSON.stringify(listingData),
        }),
        search: (params: Record<string, string | number | boolean | undefined | null>) => {
            const sanitizedParams: Record<string, string> = {};

            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '' && value !== false) {
                    sanitizedParams[key] = String(value);
                }
            });

            const query = new URLSearchParams(sanitizedParams).toString();
            return fetcher<SearchResponse>(`/businesses/search?${query}`);
        },
        getBySlug: (slug: string) => fetcher<Business>(`/businesses/slug/${slug}`),
        getFeatured: () => fetcher<SearchResponse>('/businesses/search?featuredOnly=true&limit=6'),
        uploadImage: async (file: File) => {
            const result = await api.cloudinary.uploadToCloudinary(file, 'listings');
            return { url: result.secure_url };
        },
        getMyListings: (params: any = {}) => {
            const query = new URLSearchParams(params).toString();
            return fetcher<{ data: Business[], meta: any }>(`/businesses/vendor/my-listings?${query}`);
        },
        update: (id: string, listingData: any) => fetcher<Business>(`/businesses/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(listingData),
        }),
        getAmenities: () => fetcher<any[]>('/businesses/amenities/all'),
        createAmenity: (data: { name: string, icon?: string }) => fetcher<any>('/businesses/amenities', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
    },
    cities: {
        getPopular: () => fetcher<City[]>('/cities/popular'),
        getAll: () => fetcher<City[]>('/cities'),
    },
    reviews: {
        findAll: (params: any = {}) => {
            const query = new URLSearchParams(params).toString();
            return fetcher<{ data: Review[], meta: any }>(`/reviews?${query}`);
        },
        getByBusiness: (idOrSlug: string) => fetcher<{ data: Review[] }>(`/reviews/business/${idOrSlug}`),
        getByVendor: (vendorId: string) => fetcher<{ data: Review[] }>(`/reviews?vendorId=${vendorId}`),
        getPopular: (limit = 3) => fetcher<{ data: Review[] }>(`/reviews?rating=5&limit=${limit}`),
        create: (reviewData: any) => fetcher<Review>('/reviews', {
            method: 'POST',
            body: JSON.stringify(reviewData),
        }),
        respond: (reviewId: string, response: string) => fetcher<Review>(`/reviews/${reviewId}/response`, {
            method: 'POST',
            body: JSON.stringify({ response }),
        }),
    },
    cloudinary: {
        getSignature: () => fetcher<{ timestamp: number, signature: string, apiKey: string, cloudName: string }>('/cloudinary/sign', {
            method: 'POST',
        }),
        uploadToCloudinary: async (file: File, folder: string) => {
            // 1. Get signature from backend
            const { timestamp, signature, apiKey, cloudName } = await api.cloudinary.getSignature();

            console.log('[api.ts] UPLOAD DEBUG: Sending EXACTLY these params to Cloudinary:', {
                cloudName,
                api_key: apiKey,
                timestamp,
                signature,
                file: file.name
            });

            // 2. Upload directly to Cloudinary
            const formData = new FormData();
            formData.append('file', file);
            formData.append('api_key', apiKey);
            formData.append('timestamp', timestamp.toString());
            formData.append('signature', signature);

            // STRICT RULE: Do NOT append folder, upload_preset, or any other params.

            const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({ message: 'Cloudinary upload failed' }));
                throw new Error(error.message || 'Direct upload to Cloudinary failed');
            }

            return response.json(); // Returns { secure_url, ... }
        }
    },
    users: {
        getProfile: () => fetcher<any>('/users/profile'),
        updateProfile: (profileData: any) => fetcher<any>('/users/profile', {
            method: 'PATCH',
            body: JSON.stringify(profileData),
        }),
        uploadAvatar: async (file: File) => {
            // 1. Upload to Cloudinary directly from client
            const result = await api.cloudinary.uploadToCloudinary(file, 'avatars');

            // 2. Update backend with the new URL
            return fetcher<any>('/users/profile/avatar', {
                method: 'PATCH',
                body: JSON.stringify({ avatarUrl: result.secure_url }),
            });
        },
        changePassword: (passwordData: any) => fetcher<void>('/users/password', {
            method: 'PATCH',
            body: JSON.stringify(passwordData),
        }),
        getFavorites: () => fetcher<{ data: Business[] }>('/users/favorites'),
        addFavorite: (businessId: string) => fetcher<void>(`/users/favorites/${businessId}`, {
            method: 'POST',
        }),
        removeFavorite: (businessId: string) => fetcher<void>(`/users/favorites/${businessId}`, {
            method: 'DELETE',
        }),
        getNotifications: (params: any = {}) => {
            const query = new URLSearchParams(params).toString();
            return fetcher<{ data: any[], meta: any }>(`/users/notifications?${query}`);
        },
        markNotificationRead: (id: string) => fetcher<void>(`/users/notifications/${id}/read`, {
            method: 'PATCH',
        }),
    },
    vendors: {
        getStats: () => fetcher<any>('/vendors/dashboard-stats'),
        getProfile: () => fetcher<any>('/vendors/profile'),
        updateProfile: (profileData: any) => fetcher<any>('/vendors/profile', {
            method: 'PATCH',
            body: JSON.stringify(profileData),
        }),
    },
    leads: {
        getForVendor: (params: any = {}) => {
            const query = new URLSearchParams(params).toString();
            return fetcher<any>(`/leads/vendor?${query}`);
        },
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
    },
    admin: {
        getStats: () => fetcher<any>('/admin/stats'),
        getUsers: (page = 1, limit = 10) => fetcher<any>(`/admin/users?page=${page}&limit=${limit}`),
        moderateBusiness: (id: string, action: 'approve' | 'reject' | 'suspend') => fetcher<any>(`/admin/business/${id}/moderate`, {
            method: 'PATCH',
            body: JSON.stringify({ action }),
        }),
        verifyVendor: (id: string, status: boolean) => fetcher<any>(`/admin/vendor/${id}/verify?status=${status}`, {
            method: 'POST',
        }),
    }
};
