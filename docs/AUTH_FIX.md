# Authentication State Management Fix

## Problem
After login, the user profile was not displayed until the page was refreshed. This was because:
1. The `fetcher` function didn't automatically include the auth token from localStorage
2. The login/register functions didn't trigger SWR cache revalidation
3. The `useProfile` hook wasn't listening for authentication state changes

## Solution

### 1. Enhanced `fetcher` Function (`src/lib/api.ts`)
```typescript
export async function fetcher(url: string, token?: string) {
    // Auto-fetch token from localStorage if not provided
    const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
    return apiRequest(url, { token: authToken || undefined });
}
```
**What it does**: Automatically includes the auth token from localStorage in all API requests, so authenticated endpoints work immediately after login.

### 2. Updated `useAuth` Hook (`src/hooks/useApi.ts`)
```typescript
const login = async (email: string, password: string) => {
    // ... login logic ...
    
    // Store tokens
    localStorage.setItem('token', tokens.accessToken || tokens.token);
    if (tokens.refreshToken) {
        localStorage.setItem('refreshToken', tokens.refreshToken);
    }
    
    // Trigger profile refresh by dispatching storage event
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('storage'));
    }
    
    return data;
};
```
**What it does**: After successful login/register, dispatches a storage event that triggers profile revalidation.

### 3. Enhanced `useProfile` Hook (`src/hooks/useUser.ts`)
```typescript
export function useProfile() {
    const { data, error, mutate, isLoading } = useSWR('/users/profile', fetcher, {
        shouldRetryOnError: false,
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
    });

    // Listen for storage events to revalidate profile
    useEffect(() => {
        const handleStorageChange = () => {
            mutate();
        };

        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [mutate]);

    return {
        user: data?.user || data,
        isLoading,
        isError: error,
        mutate,
        isAuthenticated: !!data && !error,
    };
}
```
**What it does**: Listens for storage events and automatically revalidates the profile when authentication state changes.

## How It Works

### Login Flow:
1. User submits login credentials
2. `useAuth().login()` calls the backend API
3. Backend returns user data and tokens
4. Tokens are stored in localStorage
5. Storage event is dispatched
6. `useProfile` hook listens for the event
7. Profile is immediately revalidated via SWR
8. UI updates with user data **without page refresh**

### Logout Flow:
1. User clicks logout
2. `useAuth().logout()` removes tokens from localStorage
3. Storage event is dispatched
4. `useProfile` hook revalidates (returns null/error)
5. UI updates to logged-out state

## Benefits

1. **Immediate UI Updates**: Profile appears instantly after login
2. **No Page Refresh Required**: Smooth user experience
3. **Automatic Token Inclusion**: All authenticated requests work immediately
4. **Proper Cleanup**: Event listeners are properly removed to prevent memory leaks
5. **SWR Integration**: Leverages SWR's caching and revalidation features

## Testing

To test the fix:
1. Navigate to login page
2. Enter credentials and submit
3. **Expected**: Profile should appear immediately after successful login
4. **No refresh needed**: User data should be visible right away

Test accounts (password: `Password123!`):
- admin@example.com
- joy-cafe@example.com
- spa-owner@example.com
- customer@example.com
