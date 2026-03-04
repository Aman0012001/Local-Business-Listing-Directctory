"use client";

import React, { useState, useEffect } from 'react';
import StatsGrid from '../../../components/vendor/StatsGrid';
import PerformanceChart from '../../../components/vendor/PerformanceChart';
import RecentReviews from '../../../components/vendor/RecentReviews';
import MessageCenter from '../../../components/vendor/MessageCenter';
import { Star, Phone, ChevronRight, ListTree, Heart, MessageSquare, Plus, TrendingUp, Loader2, Bell, CheckCircle2, Send, Clock } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import Link from 'next/link';
import { api, getImageUrl } from '../../../lib/api';
import { Business, Review } from '../../../types/api';
import { motion, AnimatePresence } from 'framer-motion';

export default function GenericDashboard() {
    const { user, updateUser } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [savedBusinesses, setSavedBusinesses] = useState<Business[]>([]);
    const [recentReviews, setRecentReviews] = useState<any[]>([]);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [leads, setLeads] = useState<any[]>([]);
    const [newLeadsCount, setNewLeadsCount] = useState(0);
    const [enquiries, setEnquiries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const isVendor = user?.role === 'vendor';
    const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!user) return;
            try {
                setLoading(true);

                // Common data for everyone
                const [userProfile, favoritesData] = await Promise.all([
                    api.users.getProfile(),
                    api.users.getFavorites()
                ]);

                setSavedBusinesses(favoritesData.data || []);

                if (isVendor || isAdmin) {
                    // Vendor/Admin specific data
                    const [statsData, vendorProfile] = await Promise.all([
                        api.vendors.getStats(),
                        api.vendors.getProfile()
                    ]);
                    setStats(statsData);

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

            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user, isVendor, isAdmin]);

    const vendorStats = [
        {
            label: 'Total Listings',
            value: stats?.businessCount || '0',
            icon: ListTree,
            color: 'bg-gradient-to-br from-[#3366CC] to-[#1144AA]',
            shadow: 'shadow-blue-500/20'
        },
        {
            label: 'Total Views',
            value: stats?.totalViews || '0',
            icon: Heart,
            color: 'bg-gradient-to-br from-[#33AA88] to-[#118866]',
            shadow: 'shadow-emerald-500/20'
        },
        {
            label: 'New Leads',
            value: String(newLeadsCount),
            icon: MessageSquare,
            color: 'bg-gradient-to-br from-[#FFAA33] to-[#FF8811]',
            shadow: 'shadow-orange-500/20'
        },
        {
            label: 'Total Reviews',
            value: stats?.totalReviews || recentReviews.length || '0',
            icon: Star,
            color: 'bg-gradient-to-br from-[#FF6644] to-[#EE4422]',
            shadow: 'shadow-red-500/20'
        },
    ];

    const userStats = [
        {
            label: 'Saved Businesses',
            value: String(stats?.savedCount || 0),
            icon: Heart,
            color: 'bg-gradient-to-br from-rose-500 to-rose-700',
            shadow: 'shadow-rose-500/20'
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
                    {isVendor && (
                        <Link href="/vendor/add-listing" className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-[16px] font-black shadow-xl shadow-slate-200 hover:scale-105 active:scale-95 transition-all w-fit">
                            <Plus className="w-5 h-5" /> New Listing
                        </Link>
                    )}
                </div>
            </motion.div>

            {/* Stats Overview */}
            <div className="mb-14">
                <StatsGrid stats={isVendor || isAdmin ? vendorStats : userStats} />
            </div>

            <div className="grid lg:grid-cols-12 gap-10 items-start">
                {/* Left Column - 8/12 width */}
                <div className="lg:col-span-8 space-y-10">

                    {/* Performance Insights (Vendor Only) */}
                    {(isVendor || isAdmin) && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between px-2">
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                    <TrendingUp className="w-7 h-7 text-blue-600" />
                                    Performance Analytics
                                </h3>
                            </div>
                            <div className="bg-white rounded-[16px] p-8 sm:p-10 border border-black shadow-xl shadow-slate-200/20">
                                <PerformanceChart stats={stats} />
                            </div>
                        </div>
                    )}

                    {/* Saved Businesses Section (Common) */}
                    <section className="bg-white rounded-[16px] p-8 sm:p-10 border border-black shadow-xl shadow-slate-200/20 relative overflow-hidden group">
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
                                    <Link key={biz.id} href={`/business/${biz.slug}`} className="flex items-center gap-5 p-4 rounded-[16px] bg-slate-50 border border-transparent hover:border-blue-500/20 hover:bg-white hover:shadow-xl transition-all group/item">
                                        <div className="w-16 h-16 rounded-[16px] overflow-hidden flex-shrink-0 shadow-md">
                                            <img src={getImageUrl((biz as any).coverImageUrl || (biz as any).images?.[0]) || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=400'} alt={biz.title} className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-500" />
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

                    {/* Pending Vendor CTA if no stats (Admin Only?) - Skipping for now to focus on User Dashboard */}
                </div>

                {/* Right Column - 4/12 width */}
                <div className="lg:col-span-4 space-y-10">
                    {/* User Notifications (User Only) */}
                    {!isVendor && !isAdmin && (
                        <div className="bg-white rounded-[16px] p-8 sm:p-10 border border-black shadow-xl shadow-slate-200/20">
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

                    {isVendor && (
                        <section className="bg-white rounded-[16px] p-8 border border-black shadow-xl shadow-slate-200/20">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-violet-100 to-blue-100 rounded-[14px] flex items-center justify-center">
                                        <Send className="w-5 h-5 text-violet-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-slate-900 tracking-tight">Enquiries</h3>
                                        {enquiries.filter(e => e.status === 'new').length > 0 && (
                                            <span className="text-xs font-black text-violet-600">
                                                {enquiries.filter(e => e.status === 'new').length} new
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <Link href="/vendor/leads" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-violet-600 transition-all flex items-center gap-1">
                                    View All <ChevronRight className="w-3 h-3" />
                                </Link>
                            </div>
                            <div className="space-y-3">
                                {enquiries.length > 0 ? (
                                    enquiries.slice(0, 4).map((enq) => (
                                        <div key={enq.id} className={`p-4 rounded-[14px] border transition-all hover:shadow-sm ${enq.status === 'new' ? 'bg-violet-50/60 border-violet-100' : 'bg-slate-50 border-slate-100'
                                            }`}>
                                            <div className="flex items-start justify-between gap-2 mb-1">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-violet-200 to-blue-200 flex items-center justify-center text-violet-700 font-black text-xs flex-shrink-0">
                                                        {(enq.name?.[0] || '?').toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-900 leading-none">{enq.name || 'Guest'}</p>
                                                        {enq.email && <p className="text-[10px] text-slate-400 font-medium mt-0.5">{enq.email}</p>}
                                                    </div>
                                                </div>
                                                {enq.status === 'new' && (
                                                    <span className="flex-shrink-0 px-2 py-0.5 bg-violet-600 text-white text-[10px] font-black rounded-full uppercase">New</span>
                                                )}
                                            </div>
                                            {enq.message && (
                                                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mt-2 pl-9">{enq.message}</p>
                                            )}
                                            <div className="flex items-center gap-1 text-[10px] text-slate-300 font-medium mt-2 pl-9">
                                                <Clock className="w-3 h-3" />
                                                {new Date(enq.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short' })}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-8 text-center">
                                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                            <Send className="w-6 h-6 text-slate-300" />
                                        </div>
                                        <p className="text-sm text-slate-400 font-bold">No enquiries yet</p>
                                        <p className="text-xs text-slate-300 mt-1">Customers can enquire from your listing page</p>
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
