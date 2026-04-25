"use client";

import { useState, useEffect, useCallback } from 'react';

/** Converts a base64 URL-safe string to a Uint8Array (for VAPID key) */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

import { api } from './api';

async function fetchVapidPublicKey(): Promise<string> {
    const data = await api.notifications.getVapidPublicKey() as any;
    return data.publicKey;
}

async function sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    await api.notifications.subscribePush(subscription.toJSON());
}

export type PushPermission = 'default' | 'granted' | 'denied';

interface UsePushNotificationsReturn {
    /** Whether the browser supports Web Push */
    supported: boolean;
    /** Current browser permission state */
    permission: PushPermission;
    /** Whether a subscription is already active */
    isSubscribed: boolean;
    /** Subscribe the user to push notifications */
    subscribe: () => Promise<void>;
    /** True while the subscription request is in progress */
    loading: boolean;
    /** Error message if subscription failed */
    error: string | null;
}

export function usePushNotifications(userId?: string, shouldAutoSubscribe: boolean = false): UsePushNotificationsReturn {
    const supported =
        typeof window !== 'undefined' &&
        'serviceWorker' in navigator &&
        'PushManager' in window;

    const [permission, setPermission] = useState<PushPermission>('default');
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Read initial permission state
    useEffect(() => {
        if (!supported) return;
        setPermission(Notification.permission as PushPermission);
    }, [supported]);

    // Register service worker and check existing subscription
    useEffect(() => {
        if (!supported || !userId) return;

        (async () => {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
                await navigator.serviceWorker.ready;
                const existing = await registration.pushManager.getSubscription();
                if (existing) {
                    setIsSubscribed(true);
                    setPermission('granted');
                }
            } catch (err) {
                // SW registration failed (e.g., insecure context) – silent
            }
        })();
    }, [supported, userId]);

    const subscribe = useCallback(async () => {
        if (!supported) {
            setError('Push notifications are not supported in this browser.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // 1. Register (or get existing) service worker
            const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
            await navigator.serviceWorker.ready;

            // 2. Request permission
            const result = await Notification.requestPermission();
            setPermission(result as PushPermission);
            if (result !== 'granted') {
                setError('Notification permission was denied.');
                setLoading(false);
                return;
            }

            // 3. Get VAPID public key from server
            const vapidPublicKey = await fetchVapidPublicKey();
            const convertedKey = urlBase64ToUint8Array(vapidPublicKey);

            // 4. Subscribe with browser's PushManager
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: convertedKey.buffer as ArrayBuffer,
            });

            // 5. Send subscription to backend
            await sendSubscriptionToServer(subscription);
            setIsSubscribed(true);
        } catch (err: any) {
            setError(err?.message || 'Failed to subscribe to push notifications.');
        } finally {
            setLoading(false);
        }
    }, [supported]);

    // Auto-subscribe if requested and permission is still default
    useEffect(() => {
        if (shouldAutoSubscribe && supported && userId && permission === 'default' && !loading && !isSubscribed) {
            subscribe();
        }
    }, [shouldAutoSubscribe, supported, userId, permission, loading, isSubscribed, subscribe]);

    return { supported, permission, isSubscribed, subscribe, loading, error };
}
