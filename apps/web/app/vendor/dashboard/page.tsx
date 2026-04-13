"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StatsGrid from '../../../components/vendor/StatsGrid';
import PerformanceChart from '../../../components/vendor/PerformanceChart';
import RecentReviews from '../../../components/vendor/RecentReviews';
import MessageCenter from '../../../components/vendor/MessageCenter';
import { Star, ChevronRight, ListTree, Heart, MessageSquare, Plus, TrendingUp, Loader2, Bell, CheckCircle2, Sparkles, Share2, Copy, Gift, Mail, Clock, BadgeCheck } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import Link from 'next/link';
import { api, getImageUrl } from '../../../lib/api';
import { ListingImage } from '../../../components/ListingImage';
import { Business, Review } from '../../../types/api';
import { motion, AnimatePresence } from 'framer-motion';
import VendorHotDemandWidget from '../../components/vendor/VendorHotDemandWidget';
import VendorLeadsInbox from '../../../components/leads/VendorLeadsInbox';
import MyJobLeads from '../../../components/leads/MyJobLeads';
import MyInquiries from '../../../components/leads/MyInquiries';
import { chatApi } from '../../../services/chat.service';
import { useChatSocket } from '../../../hooks/useChat';
import { usePlanFeature } from '../../../hooks/usePlanFeature';

export default function GenericDashboard() {
    const router = useRouter();
    const { user, updateUser } = useAuth();
    const { hasFeature, planName, isFree, loading: planLoading } = usePlanFeature();
    const [stats, setStats] = useState<any>(null);
    const [savedBusinesses, setSavedBusinesses] = useState<Business[]>([]);
    const [recentReviews, setRecentReviews] = useState<any[]>([]);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [leads, setLeads] = useState<any[]>([]);
    const [newLeadsCount, setNewLeadsCount] = useState(0);
    const [enquiries, setEnquiries] = useState<any[]>([]);
    const [followedBusinesses, setFollowedBusinesses] = useState<Business[]>([]);
    const [demandInsights, setDemandInsights] = useState<any[]>([]);
    const [affiliateStats, setAffiliateStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [copySuccess, setCopySuccess] = useState(false);
    const [referralInput, setReferralInput] = useState('');
    const [isApplying, setIsApplying] = useState(false);
    const [applyStatus, setApplyStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [conversations, setConversations] = useState<any[]>([]);
    const { socket } = useChatSocket();

    const isVendor = user?.role === 'vendor';
    const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!user) return;
            try {
                setLoading(true);

                // Common data for everyone
                const [userProfile, favoritesData, followsData] = await Promise.all([
                    api.users.getProfile(),
                    api.users.getFavorites(),
                    api.follows.myFollows()
                ]);

                setSavedBusinesses(favoritesData.data || []);
                setFollowedBusinesses(followsData.data || []);

                if (isVendor || isAdmin) {
                    // Vendor/Admin specific data
                    const [statsData, vendorProfile, affiliateData] = await Promise.all([
                        api.vendors.getStats(),
                        api.vendors.getProfile(),
                        api.affiliate.getStats().catch(() => null)
                    ]);
                    setStats(statsData);
                    setAffiliateStats(affiliateData);

                    if (vendorProfile?.id) {
                        const [reviewsData, leadsData, enquiriesData] = await Promise.all([
                            api.reviews.findAll({ vendorId: vendorProfile.id, limit: 5 }),
                            api.leads.getForVendor({ limit: 5 }),
                            api.leads.getForVendor({ limit: 5, type: 'chat' })
                        ]);
                        setRecentReviews(reviewsData.data || []);
                        setLeads(leadsData.data || []);
                        setNewLeadsCount(leadsData.meta?.total || 0);
                        setEnquiries(enquiriesData.data || []);
                    }

                    const demandData = await api.demand.getNearby();
                    setDemandInsights(demandData || []);
                } else {
                    // Regular User specific data
                    const [reviewsData, notifsData] = await Promise.all([
                        api.reviews.findAll({ userId: user.id, limit: 5 }),
                        api.users.getNotifications({ limit: 5 })
                    ]);
                    setRecentReviews(reviewsData.data || []);
                    setNotifications(notifsData.data || []);

                    // Simple stats for users
                    setStats({
                        savedCount: favoritesData.data?.length || 0,
                        reviewsCount: reviewsData.data?.length || 0,
                        unreadNotifs: notifsData.data?.filter((n: any) => !n.isRead).length || 0
                    });
                }

                if (isVendor || isAdmin) {
                    const convs = await chatApi.getVendorConversations() as any[];
                    setConversations(convs.slice(0, 5));
                } else if (user) {
                    const convs = await chatApi.getUserConversations() as any[];
                    setConversations(convs.slice(0, 5));
                }

            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user, isVendor, isAdmin]);

    // Real-time chat updates
    useEffect(() => {
        if (!socket) return;

        const onNewConversation = (conv: any) => {
            setConversations(prev => {
                if (prev.find(c => c.id === conv.id)) return prev;
                return [conv, ...prev].slice(0, 5);
            });
        };

        const onConversationUpdated = (update: any) => {
            setConversations(prev => {
                const existing = prev.find(c => c.id === update.conversationId);
                if (existing) {
                    return prev.map(c =>
                        c.id === update.conversationId
                            ? { ...c, lastMessage: update.lastMessage, lastMessageAt: update.lastMessageAt }
                            : c
                    ).sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
                } else {
                    // If not in list, maybe it's a new one that just got updated
                    chatApi.getVendorConversations().then((convs: any) => {
                        setConversations(convs.slice(0, 5));
                    });
                    return prev;
                }
            });
        };

        socket.on('newConversation', onNewConversation);
        socket.on('conversationUpdated', onConversationUpdated);

        return () => {
            socket.off('newConversation', onNewConversation);
            socket.off('conversationUpdated', onConversationUpdated);
        };
    }, [socket]);



    const vendorStats = [
        {
            label: 'Total Listings',
            value: stats?.businessCount || '0',
            icon: ListTree,
            color: 'bg-gradient-to-br from-[#3366CC] to-[#1144AA]',
            shadow: 'shadow-blue-500/20',
            onClick: () => router.push('/vendor/listings'),
            show: hasFeature('showListings')
        },
        {
            label: 'Pending Approval',
            value: stats?.pendingCount || '0',
            icon: Clock,
            color: 'bg-gradient-to-br from-amber-400 to-amber-600',
            shadow: 'shadow-amber-500/20',
            onClick: () => router.push('/vendor/pending-listings'),
            show: hasFeature('showListings')
        },
        {
            label: 'Total Views',
            value: stats?.totalViews || '0',
            icon: TrendingUp,
            color: 'bg-gradient-to-br from-[#33AA88] to-[#118866]',
            shadow: 'shadow-emerald-500/20',
            show: hasFeature('showAnalytics')
        },
        {
            label: 'Live Chat',
            value: String(conversations.length),
            icon: MessageSquare,
            color: 'bg-gradient-to-br from-indigo-500 to-indigo-700',
            shadow: 'shadow-indigo-500/20',
            onClick: () => router.push('/vendor/chat'),
            show: hasFeature('showChat')
        },
        {
            label: 'New Leads',
            value: String(newLeadsCount),
            icon: Sparkles,
            color: 'bg-gradient-to-br from-[#FFAA33] to-[#FF8811]',
            shadow: 'shadow-orange-500/20',
            show: hasFeature('showLeads')
        },
        {
            label: 'Total Reviews',
            value: stats?.totalReviews || recentReviews.length || '0',
            icon: Star,
            color: 'bg-gradient-to-br from-[#FF6644] to-[#EE4422]',
            shadow: 'shadow-red-500/20',
            show: hasFeature('showReviews')
        },
    ].filter(s => (s as any).show !== false);

    const userStats = [
        {
            label: 'Saved Businesses',
            value: String(stats?.savedCount || 0),
            icon: Heart,
            color: 'bg-gradient-to-br from-rose-500 to-rose-700',
            shadow: 'shadow-rose-500/20',
            onClick: () => router.push('/vendor/saved')
        },
        {
            label: 'Messages',
            value: String(conversations.length),
            icon: MessageSquare,
            color: 'bg-gradient-to-br from-indigo-500 to-indigo-700',
            shadow: 'shadow-indigo-500/20',
            onClick: () => router.push('/vendor/chat')
        },
        {
            label: 'Your Reviews',
            value: String(stats?.reviewsCount || 0),
            icon: Star,
            color: 'bg-gradient-to-br from-amber-400 to-amber-600',
            shadow: 'shadow-amber-500/20'
        },
        {
            label: 'Notifications',
            value: String(stats?.unreadNotifs || 0),
            icon: Bell,
            color: 'bg-gradient-to-br from-blue-500 to-blue-700',
            shadow: 'shadow-blue-500/20'
        },
        {
            label: 'Profile Status',
            value: 'Active',
            icon: CheckCircle2,
            color: 'bg-gradient-to-br from-emerald-500 to-emerald-700',
            shadow: 'shadow-emerald-500/20'
        },
    ];

    const mappedReviews = recentReviews.map(r => ({
        id: r.id,
        user: r.user?.fullName || 'Anonymous',
        location: r.business?.title || r.business?.name || 'Business',
        rating: r.rating,
        comment: r.comment,
        avatar: r.user?.avatarUrl
    }));

    const copyReferralLink = () => {
        if (!affiliateStats?.referralCode) return;
        const link = `${window.location.origin}/?ref=${affiliateStats.referralCode}`;
        navigator.clipboard.writeText(link);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    };

    const handleApplyReferral = async () => {
        if (!referralInput.trim()) return;
        setIsApplying(true);
        setApplyStatus(null);
        try {
            const result = await api.affiliate.applyReferral(referralInput.trim());
            setApplyStatus({ type: 'success', message: result.message });
            setReferralInput('');
            // Refresh affiliate stats
            const updatedStats = await api.affiliate.getStats();
            setAffiliateStats(updatedStats);
        } catch (error: any) {
            setApplyStatus({ type: 'error', message: error.message || 'Invalid referral code' });
        } finally {
            setIsApplying(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-blue-600/20 rounded-full"></div>
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                </div>
                <p className="mt-6 text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse">Synchronizing Data...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Welcome Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-10 lg:mb-14 pt-8"
            >
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-4xl lg:text-6xl font-black text-slate-900 mb-3 tracking-tighter">
                            Welcome, <span className="text-blue-600 font-black">{user?.fullName?.split(' ')[0] || 'Member'}!</span>
                        </h1>
                        <p className="text-lg text-slate-400 font-bold tracking-tight">
                            {isVendor ? "Here's what's happening with your business today." : "Everything you need to manage your favorite places and feedback."}
                        </p>
                    </div>
                    {((isVendor || isAdmin) ? hasFeature('canAddListing') : false) && (
                        <Link href="/vendor/add-listing" className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-[16px] font-black  shadow-slate-200 hover:scale-105 active:scale-95 transition-all w-fit">
                            <Plus className="w-5 h-5" /> New Listing
                        </Link>
                    )}
                </div>
            </motion.div>

            {/* Active Subscription Status Banner */}
            {(isVendor || isAdmin) && user?.vendor?.activeSubscription && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-8 overflow-hidden rounded-[20px] bg-slate-900 border border-slate-800 shadow-2xl relative"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 flex-shrink-0">
                                <BadgeCheck className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <p className="text-[10px] sm:text-xs font-black text-emerald-400/80 uppercase tracking-[0.2em] mb-1">
                                    Active Plan
                                </p>
                                <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight mb-2">
                                    {planName}
                                </h2>
                                <p className="text-slate-400 font-bold text-xs sm:text-sm flex items-center gap-2">
                                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                                    {(() => {
                                        const end = new Date(user?.vendor?.activeSubscription.endDate);
                                        const days = Math.ceil((end.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                                        
                                        if (days > 3000) {
                                            return <span className="text-emerald-400">Lifetime Plan</span>;
                                        }

                                        return (
                                            <span className={days <= 4 ? "text-rose-400" : "text-emerald-400"}>
                                                {days > 0 ? `Expires in ${days} day${days !== 1 ? 's' : ''}` : 'Expired'} · {end.toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </span>
                                        );
                                    })()}

                                </p>
                            </div>
                        </div>
                        <Link 
                            href="/vendor/subscription" 
                            className="flex items-center gap-2 px-8 py-3.5 bg-white/5 hover:bg-white/10 text-white rounded-xl font-black text-sm transition-all border border-white/10 shadow-xl"
                        >
                            Manage Plan
                            <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                </motion.div>
            )}

            {/* Stats Overview */}
            <div className="mb-14">
                <StatsGrid stats={isVendor || isAdmin ? vendorStats : userStats} />
            </div>

            <div className="grid lg:grid-cols-12 gap-10 items-start">
                {/* Left Column - 8/12 width */}
                <div className="lg:col-span-8 space-y-10">

                    {/* Job Leads Section */}
                    {(isVendor || isAdmin) ? (
                        hasFeature('showLeads') && (
                            <div className="bg-white rounded-[16px] p-8 sm:p-10 border border-black shadow-slate-200/20">
                                <VendorLeadsInbox />
                            </div>
                        )
                    ) : (
                        <div className="space-y-10">
                            {/* Upgrade to Vendor CTA - Only for non-vendors who might want to upgrade */}
                            {!isVendor && !isAdmin && user?.role !== 'user' && (
                                <div className="bg-gradient-to-br from-[#0B2244] to-[#1a3a70] rounded-[16px] p-8 sm:p-10 shadow-2xl relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6 border-2 border-orange-500/20">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                                    <div className="relative z-10">
                                        <h3 className="text-2xl font-black text-white mb-2">Own a Business?</h3>
                                        <p className="text-blue-200 font-bold max-w-md">
                                            Upgrade to a Business Account to list your services, track performance, and connect with your local community.
                                        </p>
                                    </div>
                                    <Link 
                                        href="/vendor/upgrade" 
                                        className="relative z-10 flex items-center justify-center gap-2 px-8 py-4 bg-[#FF7A30] hover:bg-[#E86920] text-white rounded-[16px] font-black transition-all shadow-xl shadow-orange-900/20 whitespace-nowrap active:scale-95"
                                    >
                                        <Sparkles className="w-5 h-5 flex-shrink-0" />
                                        Become a Vendor
                                    </Link>
                                </div>
                            )}

                            <div className="bg-white rounded-[16px] p-8 sm:p-10 border border-black shadow-slate-200/20">
                                <MyInquiries />
                            </div>
                            <div className="bg-white rounded-[16px] p-8 sm:p-10 border border-black shadow-slate-200/20">
                                <MyJobLeads />
                            </div>
                        </div>
                    )}

                    {/* Performance Insights (Vendor Only) */}
                    {(isVendor || isAdmin) && hasFeature('showAnalytics') && (
                        <div className="space-y-6 mb-12">
                            <div className="flex items-center justify-between px-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                                        <TrendingUp className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                                        Analytics Dashboard
                                    </h3>
                                </div>
                            </div>
                            <PerformanceChart stats={stats} />
                        </div>
                    )}

                    {/* Saved Businesses Section (Common) */}
                    {((isVendor || isAdmin) ? hasFeature('showSaved') : true) && (
                        <section className="bg-white rounded-[16px] p-8 sm:p-10 border border-black  shadow-slate-200/20 relative overflow-hidden group">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-rose-50 rounded-[16px] flex items-center justify-center text-rose-500 shadow-inner">
                                    <Heart className="w-6 h-6 fill-rose-500" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">My Saved Places</h3>
                            </div>
                            <Link href="/vendor/saved" className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-blue-600 transition-all group/link">
                                View Collection <ChevronRight className="w-4 h-4 transition-transform group-hover/link:translate-x-1" />
                            </Link>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-6">
                            {savedBusinesses.length > 0 ? (
                                savedBusinesses.slice(0, 4).map((biz) => (
                                    <Link key={biz.id} href={`/business/${biz.slug}`} className="flex items-center gap-5 p-4 rounded-[16px] bg-slate-50 border border-transparent hover:border-blue-500/20 hover:bg-white hover: transition-all group/item">
                                        <div className="w-16 h-16 rounded-[16px] overflow-hidden flex-shrink-0 shadow-md">
                                            <ListingImage 
                                                src={(biz as any).coverImageUrl || (biz as any).images?.[0]} 
                                                alt={biz.title} 
                                                className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-500" 
                                            />
                                        </div>
                                        <div className="overflow-hidden">
                                            <h4 className="font-black text-slate-900 truncate group-hover/item:text-blue-600 transition-colors">{biz.title}</h4>
                                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                                                <span className="truncate">{biz.category?.name || 'Local'}</span>
                                                <span className="text-slate-200">•</span>
                                                <span className="truncate">{biz.city || 'Location'}</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className="col-span-full text-center py-10 bg-slate-50 rounded-[16px] border border-dashed border-slate-200">
                                    <p className="text-slate-400 font-bold italic">You haven't saved any businesses yet.</p>
                                    <Link href="/search" className="inline-block mt-4 text-xs font-black text-blue-600 uppercase tracking-widest">Start Exploring</Link>
                                </div>
                            )}
                        </div>
                    </section>
                    )}

                    {/* Followed Businesses Section */}
                    {((isVendor || isAdmin) ? hasFeature('showFollowing') : true) && (
                        <section className="bg-white rounded-[16px] p-8 sm:p-10 border border-black  shadow-slate-200/20 relative overflow-hidden group">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-50 rounded-[16px] flex items-center justify-center text-blue-600 shadow-inner border border-blue-100/50">
                                    <Bell className="w-6 h-6" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Following</h3>
                            </div>
                            <Link href="/vendor/following" className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-blue-600 transition-all group/link">
                                Manage Alerts <ChevronRight className="w-4 h-4 transition-transform group-hover/link:translate-x-1" />
                            </Link>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-6">
                            {followedBusinesses.length > 0 ? (
                                followedBusinesses.slice(0, 4).map((biz) => (
                                    <Link key={biz.id} href={`/business/${biz.slug}`} className="flex items-center gap-5 p-4 rounded-[16px] bg-slate-50 border border-transparent hover:border-blue-500/20 hover:bg-white hover: transition-all group/item">
                                        <div className="w-16 h-16 rounded-[16px] overflow-hidden flex-shrink-0 shadow-md">
                                            <ListingImage 
                                                src={(biz as any).coverImageUrl || (biz as any).images?.[0]} 
                                                alt={biz.title} 
                                                className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-500" 
                                            />
                                        </div>
                                        <div className="overflow-hidden">
                                            <h4 className="font-black text-slate-900 truncate group-hover/item:text-blue-600 transition-colors">{(biz as any).title}</h4>
                                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                                                <span className="truncate">{biz.category?.name || 'Local'}</span>
                                                <span className="text-slate-200">•</span>
                                                <span className="truncate">{biz.city || 'Location'}</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className="col-span-full text-center py-10 bg-slate-50 rounded-[16px] border border-dashed border-slate-200">
                                    <p className="text-slate-400 font-bold italic">You aren't following any businesses yet.</p>
                                    <Link href="/search" className="inline-block mt-4 text-xs font-black text-blue-600 uppercase tracking-widest">Discover Now</Link>
                                </div>
                            )}
                        </div>
                    </section>
                    )}


                    {/* Pending Vendor CTA if no stats (Admin Only?) - Skipping for now to focus on User Dashboard */}
                </div>

                {/* Right Column - 4/12 width */}
                <div className="lg:col-span-4 space-y-10">
                    {/* User Notifications (User Only) */}
                    {!isVendor && !isAdmin && (
                        <div className="bg-white rounded-[16px] p-8 sm:p-10 border border-black  shadow-slate-200/20">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                                    <Bell className="w-6 h-6 text-blue-600" />
                                    Alerts
                                </h3>
                                <Link href="/vendor/notifications" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600">See All</Link>
                            </div>
                            <div className="space-y-6">
                                {notifications.length > 0 ? (
                                    notifications.slice(0, 4).map((notif) => (
                                        <div key={notif.id} className="flex gap-4 group cursor-pointer">
                                            <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${notif.isRead ? 'bg-slate-200' : 'bg-blue-600 animate-pulse'}`}></div>
                                            <div>
                                                <h4 className={`text-sm font-black mb-1 ${notif.isRead ? 'text-slate-600' : 'text-slate-900'}`}>{notif.title}</h4>
                                                <p className="text-xs text-slate-400 font-medium line-clamp-2 leading-relaxed">{notif.message}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-6">
                                        <p className="text-slate-300 font-bold italic text-sm">No new notifications</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <RecentReviews
                        reviews={mappedReviews}
                        loading={loading}
                        title={isVendor || isAdmin ? "Recent Reviews" : "My Recent Reviews"}
                    />

                    {isVendor && hasFeature('showDemand') && (
                        <VendorHotDemandWidget insights={demandInsights} loading={loading} />
                    )}

                    {((isVendor || isAdmin) && hasFeature('showChat')) && (
                        <section className="bg-white rounded-[16px] p-8 border border-black shadow-slate-200/20">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-[14px] flex items-center justify-center">
                                        <MessageSquare className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-slate-900 tracking-tight">Recent Chats</h3>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Live Conversations</p>
                                    </div>
                                </div>
                                <Link href="/vendor/chat" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-blue-600 transition-all flex items-center gap-1">
                                    {isVendor ? 'Open Inbox' : 'My Messages'} <ChevronRight className="w-3 h-3" />
                                </Link>
                            </div>
                            <div className="space-y-3">
                                {conversations.length > 0 ? (
                                    conversations.map((conv) => (
                                        <Link 
                                            key={conv.id} 
                                            href={`/vendor/chat?id=${conv.id}`}
                                            className="block p-4 rounded-[14px] bg-slate-50 border border-slate-100 hover:border-blue-200 hover:bg-white transition-all group"
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                                                        {isVendor ? (
                                                            conv.user?.avatarUrl ? (
                                                                <img src={getImageUrl(conv.user.avatarUrl) as string} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-600 font-black text-xs">
                                                                    {(conv.user?.fullName?.[0] || 'U').toUpperCase()}
                                                                </div>
                                                            )
                                                        ) : (
                                                            conv.business?.logoUrl ? (
                                                                <img src={getImageUrl(conv.business.logoUrl) as string} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center bg-orange-50 text-orange-600 font-black text-xs">
                                                                    {(conv.business?.title?.[0] || 'B').toUpperCase()}
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-900 leading-none">
                                                            {isVendor ? (conv.user?.fullName || 'User') : (conv.business?.title || 'Business')}
                                                        </p>
                                                        {isVendor && <p className="text-[10px] text-slate-400 font-medium mt-1 italic">on {conv.business?.title || 'Listing'}</p>}
                                                    </div>
                                                </div>
                                                <span className="text-[9px] text-slate-300 font-medium">{new Date(conv.lastMessageAt || conv.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-xs text-slate-500 line-clamp-1 mt-2 pl-10">
                                                {conv.lastMessage || 'Start the conversation...'}
                                            </p>
                                        </Link>
                                    ))
                                ) : (
                                    <div className="py-8 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-100">
                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm transform -rotate-6">
                                            <MessageSquare className="w-6 h-6 text-slate-300" />
                                        </div>
                                        <p className="text-sm text-slate-400 font-bold italic">No active chats yet</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}

                    {isVendor && hasFeature('showQueries') && (
                        <section className="bg-white rounded-[16px] p-8 border border-black  shadow-slate-200/20 opacity-60 grayscale-[0.5] scale-95 origin-top">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-slate-100 rounded-[14px] flex items-center justify-center text-slate-400">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-slate-400 tracking-tight">Form Enquiries</h3>
                                    </div>
                                </div>
                                <Link href="/vendor/messages" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-600">
                                    Full Leads Inbox →
                                </Link>
                            </div>
                            <p className="text-[11px] text-slate-400 font-bold text-center py-4">
                                Most customers use the Live Chat now. Older form-based queries can be accessed in the full inbox.
                            </p>
                        </section>
                    )}

                    {/* Referral Section */}
                    {isVendor && (
                        <section className="bg-slate-900 rounded-[16px] p-8 border border-slate-800 shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
                            
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-600/20 rounded-[14px] flex items-center justify-center text-blue-400 border border-blue-500/20">
                                            <Share2 className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-white tracking-tight">Refer & Earn</h3>
                                            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Get 30 Days Free Plan</p>
                                        </div>
                                    </div>
                                    <Link href="/vendor/affiliate" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-all flex items-center gap-1">
                                        View Stats <ChevronRight className="w-3 h-3" />
                                    </Link>
                                </div>

                                {/* Apply Referrer Section (If not referred) */}
                                {!affiliateStats?.hasReferrer && (
                                    <div className="mb-6 p-4 bg-blue-600/5 border border-blue-500/20 rounded-xl space-y-3">
                                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Were you referred by someone?</p>
                                        <div className="flex gap-2">
                                            <input 
                                                type="text"
                                                value={referralInput}
                                                onChange={(e) => setReferralInput(e.target.value)}
                                                placeholder="Enter Expert Code"
                                                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-all"
                                            />
                                            <button 
                                                onClick={handleApplyReferral}
                                                disabled={isApplying || !referralInput}
                                                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white text-xs font-black rounded-xl transition-all active:scale-95 flex items-center gap-2"
                                            >
                                                {isApplying ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Apply'}
                                            </button>
                                        </div>
                                        {applyStatus && (
                                            <p className={`text-[10px] font-bold ${applyStatus.type === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                {applyStatus.message}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {affiliateStats?.hasReferrer && (
                                    <div className="mb-6 px-4 py-2 bg-emerald-500/5 border border-emerald-500/20 rounded-xl flex items-center gap-2">
                                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                        <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                                            Referred by: <span className="text-white ml-1">{affiliateStats.referrerName || 'Community Expert'}</span>
                                        </p>
                                    </div>
                                )}

                                {affiliateStats?.isAffiliate ? (
                                    <div className="space-y-4">
                                        <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="overflow-hidden">
                                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Your Referral Link</p>
                                                    <p className="text-xs font-bold text-slate-300 truncate">
                                                        {typeof window !== 'undefined' ? `${window.location.origin}/?ref=${affiliateStats.referralCode}` : 'Loading...'}
                                                    </p>
                                                </div>
                                                <button 
                                                    onClick={copyReferralLink}
                                                    className="flex-shrink-0 p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all active:scale-95"
                                                >
                                                    {copySuccess ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 px-1">
                                            <Gift className="w-4 h-4 text-blue-400" />
                                            <p className="text-[11px] text-slate-400 font-medium">
                                                Earn <span className="text-white font-black italic">1 month plan extension</span> for every vendor you refer!
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <p className="text-sm text-slate-400 font-medium leading-relaxed">
                                            Invite other businesses to join and get rewarded with free subscription extensions.
                                        </p>
                                        <Link 
                                            href="/vendor/affiliate"
                                            className="inline-flex items-center justify-center w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-[14px] font-black text-sm transition-all active:scale-95 shadow-xl shadow-blue-900/20"
                                        >
                                            Join Referral Program
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
}
