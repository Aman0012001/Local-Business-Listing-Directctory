"use client";

import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Users } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

interface FollowButtonProps {
    businessId: string;
    initialFollowersCount?: number;
    /** compact = icon-only pill; full = icon + text + count */
    variant?: 'compact' | 'full';
    className?: string;
    /** If true, uses a minimal style for card overlays */
    isMinimal?: boolean;
}

export default function FollowButton({
    businessId,
    initialFollowersCount = 0,
    variant = 'full',
    className = '',
}: FollowButtonProps) {
    const { user } = useAuth();
    const [isFollowing, setIsFollowing] = useState(false);
    const [followersCount, setFollowersCount] = useState(initialFollowersCount);
    const [loading, setLoading] = useState(false);
    const [checked, setChecked] = useState(false);

    // Fetch initial follow status when user is logged in
    useEffect(() => {
        if (!user || !businessId) {
            setChecked(true);
            return;
        }
        api.follows.check(businessId)
            .then(data => {
                setIsFollowing(data.isFollowing);
                setFollowersCount(data.followersCount);
            })
            .catch(() => {})
            .finally(() => setChecked(true));
    }, [user, businessId]);

    const handleToggle = async () => {
        if (!user) {
            // Redirect to login
            window.location.href = '/login';
            return;
        }
        if (!businessId || loading) return;

        setLoading(true);
        // Optimistic update
        const wasFollowing = isFollowing;
        setIsFollowing(!wasFollowing);
        setFollowersCount(c => wasFollowing ? Math.max(0, c - 1) : c + 1);

        try {
            const result = wasFollowing
                ? await api.follows.unfollow(businessId)
                : await api.follows.follow(businessId);
            setFollowersCount(result.followersCount);
        } catch (err) {
            // Rollback on error
            setIsFollowing(wasFollowing);
            setFollowersCount(c => wasFollowing ? c + 1 : Math.max(0, c - 1));
        } finally {
            setLoading(false);
        }
    };

    if (!checked) return null; // avoid flicker until status is known

    if (variant === 'compact') {
        return (
            <button
                onClick={handleToggle}
                disabled={loading}
                title={isFollowing ? 'Unfollow' : 'Follow'}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                    isFollowing
                        ? 'bg-violet-600 text-white border-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-500/20'
                        : 'bg-white/80 backdrop-blur-sm text-slate-700 border-slate-200 hover:border-violet-400 hover:text-violet-600'
                } ${loading ? 'opacity-60 cursor-not-allowed' : 'active:scale-95'} ${className}`}
            >
                {isFollowing ? <BellOff className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5" />}
                {isFollowing ? 'Following' : 'Follow'}
            </button>
        );
    }

    return (
        <div className={`flex flex-col gap-2.5 ${className}`}>
            <button
                onClick={handleToggle}
                disabled={loading}
                className={`group inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl font-black text-sm transition-all duration-500 shadow-xl w-full border-2 ${
                    isFollowing
                        ? 'bg-violet-600 text-white border-violet-500 hover:bg-violet-700 shadow-violet-500/20'
                        : 'bg-white text-slate-900 border-white hover:border-violet-400 hover:text-violet-600 shadow-white/5'
                } ${loading ? 'opacity-60 cursor-not-allowed' : 'active:scale-[0.97]'}`}
            >
                <div className={`transition-all duration-500 ${loading ? 'animate-pulse' : 'group-hover:scale-110'}`}>
                    {isFollowing
                        ? <BellOff className="w-4.5 h-4.5" />
                        : <Bell className="w-4.5 h-4.5 group-hover:rotate-12 transition-transform" />
                    }
                </div>
                <span className="tracking-tight uppercase text-xs">{isFollowing ? 'Following' : 'Follow Business'}</span>
            </button>
            {followersCount > 0 && (
                <div className="flex items-center gap-2 px-1">
                    <div className="w-6 h-6 rounded-full border border-white/20 bg-black flex items-center justify-center">
                        <Users className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">
                        {followersCount.toLocaleString()} {followersCount === 1 ? 'follower' : 'followers'}
                    </span>
                </div>
            )}
        </div>
    );
}
