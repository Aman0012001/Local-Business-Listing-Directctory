'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function RedirectContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const params = searchParams.toString();
        router.replace(`/subscription/${params ? `?${params}` : ''}`);
    }, [router, searchParams]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <p className="text-sm font-black text-slate-400 uppercase tracking-widest animate-pulse">Redirecting...</p>
            </div>
        </div>
    );
}

export default function VendorSubscriptionRedirect() {
    return (
        <Suspense fallback={null}>
            <RedirectContent />
        </Suspense>
    );
}
