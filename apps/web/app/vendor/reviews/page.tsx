"use client";

import React, { useEffect, useState } from 'react';
import { Star, Calendar, Building2, User as UserIcon, MessageCircle, Quote, ThumbsUp, ChevronLeft, ChevronRight, Send, X, MessageSquareQuote } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { api, getImageUrl } from '../../../lib/api';
import { Review } from '../../../types/api';
import { motion, AnimatePresence } from 'framer-motion';

export default function VendorReviews() {
    const { user } = useAuth();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        average: 0
    });

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 9;

    // Response Modal State
    const [respondingTo, setRespondingTo] = useState<Review | null>(null);
    const [responseText, setResponseText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const formatDate = (dateString: string) => {
        try {
            return new Intl.DateTimeFormat('en-US', {
                month: 'short',
                day: '2-digit',
                year: 'numeric'
            }).format(new Date(dateString));
        } catch (e) {
            return dateString;
        }
    };

    const fetchReviews = async () => {
        if (!user) return;
        try {
            setLoading(true);
            const params: any = {
                page: 1,
                limit: 100
            };

            if (user.role === 'vendor' && user.vendor?.id) {
                params.vendorId = user.vendor.id;
            } else {
                params.userId = user.id;
            }

            const response = await api.reviews.findAll(params);
            setReviews(response.data);

            if (response.data.length > 0) {
                const total = response.data.length;
                const sum = response.data.reduce((acc: number, curr: Review) => acc + curr.rating, 0);
                setStats({
                    total,
                    average: Math.round((sum / total) * 10) / 10
                });
            }
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [user]);

    const handleRespond = async () => {
        if (!respondingTo || !responseText.trim()) return;
        try {
            setIsSubmitting(true);
            await api.reviews.respond(respondingTo.id, responseText);
            setRespondingTo(null);
            setResponseText('');
            await fetchReviews();
        } catch (error) {
            console.error('Failed to submit response:', error);
            alert('Failed to submit response. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Pagination Logic
    const totalPages = Math.ceil(reviews.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentReviews = reviews.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber: number) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (loading && reviews.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-blue-600/20 rounded-full"></div>
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                </div>
            </div>
        );
    }

    if (reviews.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4"
            >
                <div className="w-24 h-24 bg-gradient-to-tr from-amber-50 to-amber-100 rounded-3xl flex items-center justify-center mb-8 shadow-xl shadow-amber-200/20 rotate-3">
                    <Star className="w-12 h-12 text-amber-500 fill-amber-500 animate-pulse" />
                </div>
                <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Your Review Hub</h1>
                <p className="text-slate-400 font-bold max-w-sm text-lg leading-relaxed">
                    {user?.role === 'vendor'
                        ? "Currently, there are no reviews for your listings. Encourage your customers to share their feedback!"
                        : "You haven't voiced your opinion yet. Start exploring and sharing your experiences with others!"}
                </p>
                <button className="mt-8 px-8 py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl shadow-slate-200 hover:scale-105 active:scale-95 transition-all">
                    Explore Businesses
                </button>
            </motion.div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-10 pb-32">
            {/* Header / Stats Section */}
            <div className="relative overflow-hidden bg-slate-900 rounded-[40px] p-8 sm:p-12 mb-12 shadow-2xl shadow-slate-900/20">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-[100px] rounded-full -mr-32 -mt-32"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-400/10 blur-[100px] rounded-full -ml-32 -mb-32"></div>

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="text-center md:text-left">
                        <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tighter">
                            {user?.role === 'vendor' ? 'Business Reputation' : 'Review History'}
                        </h1>
                        <p className="text-slate-400 font-bold text-lg max-w-md">
                            Insight into {user?.role === 'vendor' ? 'how customers perceive your brand' : 'the feedback you\'ve shared with the community'}.
                        </p>
                    </div>

                    <div className="flex items-center gap-6 sm:gap-12 bg-white/5 backdrop-blur-xl p-8 rounded-[32px] border border-white/10">
                        <div className="text-center">
                            <div className="text-5xl font-black text-white tabular-nums mb-2">{stats.average}</div>
                            <div className="flex items-center justify-center gap-1">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <Star
                                        key={s}
                                        className={`w-4 h-4 ${s <= Math.round(stats.average) ? 'text-amber-400 fill-amber-400' : 'text-white/20'}`}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="w-px h-16 bg-white/10"></div>
                        <div className="text-center">
                            <div className="text-5xl font-black text-white tabular-nums mb-2">{stats.total}</div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Reviews</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reviews Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence mode="popLayout">
                    {currentReviews.map((review, idx) => (
                        <motion.div
                            key={review.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: idx * 0.05 }}
                            className="bg-white rounded-[16px] p-8 border border-black shadow-xl shadow-slate-200/30 hover:shadow-2xl hover:shadow-slate-300/40 transition-all duration-500 group relative flex flex-col items-center text-center h-full"
                        >

                            {/* Business Info Header */}
                            <div className="flex flex-col items-center gap-4 mb-6">
                                <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-md ring-4 ring-slate-50 flex-shrink-0 bg-white">
                                    {review.business?.coverImageUrl ? (
                                        <img
                                            src={getImageUrl(review.business.coverImageUrl)}
                                            alt={review.business.title || review.business.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                                            <Building2 className="w-8 h-8" />
                                        </div>
                                    )}
                                </div>
                                <div className="overflow-hidden">
                                    <h3 className="font-black text-xl text-slate-900 leading-tight">
                                        {review.business?.title || review.business?.name || 'Local Favorite'}
                                    </h3>
                                    <div className="flex items-center justify-center gap-1 text-[9px] font-black uppercase tracking-widest text-slate-400 mt-2">
                                        <Calendar className="w-3 h-3 text-blue-500" />
                                        {formatDate(review.createdAt)}
                                    </div>
                                </div>
                            </div>

                            {/* Rating */}
                            <div className="flex items-center gap-0.5 mb-6 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <Star
                                        key={s}
                                        className={`w-4 h-4 ${s <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`}
                                    />
                                ))}
                            </div>

                            {/* Review Content */}
                            <div className="relative mb-8 flex-grow">
                                <Quote className="absolute -top-6 left-1/2 -translate-x-1/2 w-10 h-10 text-slate-50 -z-10" />
                                <p className="text-slate-600 font-bold text-lg leading-relaxed italic px-4 line-clamp-4">
                                    "{review.comment}"
                                </p>
                            </div>

                            {/* User Info & Actions */}
                            <div className="mt-auto pt-6 border-t border-slate-50 w-full">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white flex-shrink-0">
                                            <UserIcon className="w-4 h-4" />
                                        </div>
                                        <div className="text-[10px] font-black text-slate-900 uppercase tracking-widest">
                                            {user?.id === (review as any).userId ? 'Me' : review.user?.fullName}
                                        </div>
                                    </div>

                                    {user?.role === 'vendor' && !review.vendorResponse && (
                                        <button
                                            onClick={() => setRespondingTo(review)}
                                            className="w-full py-3 bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Send className="w-3.5 h-3.5" />
                                            Reply
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Vendor Response Tag/Preview */}
                            {review.vendorResponse && (
                                <div className="mt-6 p-5 bg-blue-50/50 rounded-[24px] border border-blue-100/30">
                                    <div className="flex items-center gap-2 mb-2">
                                        <MessageCircle className="w-3 h-3 text-blue-600" />
                                        <span className="text-[8px] font-black uppercase tracking-widest text-blue-600">Official Reply</span>
                                    </div>
                                    <p className="text-slate-500 font-bold text-xs leading-relaxed line-clamp-2 italic">
                                        {review.vendorResponse}
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-20 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm w-fit mx-auto">
                    <button
                        disabled={currentPage === 1}
                        onClick={() => paginate(currentPage - 1)}
                        className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30 disabled:hover:bg-slate-50 disabled:hover:text-slate-400 transition-all border border-slate-200"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>

                    <div className="flex items-center gap-2">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                            <button
                                key={number}
                                onClick={() => paginate(number)}
                                className={`w-12 h-12 flex items-center justify-center rounded-2xl font-black text-sm transition-all border ${currentPage === number
                                    ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-200'
                                    : 'bg-white text-slate-400 border-slate-200 hover:border-slate-400 hover:text-slate-900'
                                    }`}
                            >
                                {number}
                            </button>
                        ))}
                    </div>

                    <button
                        disabled={currentPage === totalPages}
                        onClick={() => paginate(currentPage + 1)}
                        className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30 disabled:hover:bg-slate-50 disabled:hover:text-slate-400 transition-all border border-slate-200"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </div>
            )}

            {/* Vendor Response Modal - Remains Same */}
            <AnimatePresence>
                {respondingTo && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setRespondingTo(null)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
                        ></motion.div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white rounded-[40px] w-full max-w-xl p-8 sm:p-10 shadow-2xl relative z-10 border border-slate-100"
                        >
                            <button
                                onClick={() => setRespondingTo(null)}
                                className="absolute top-6 right-6 p-2 hover:bg-slate-50 rounded-full transition-colors"
                            >
                                <X className="w-6 h-6 text-slate-400" />
                            </button>

                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                                    <MessageSquareQuote className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Post Response</h2>
                                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Replying to {respondingTo.user?.fullName}</p>
                                </div>
                            </div>

                            <div className="bg-slate-50 rounded-3xl p-6 mb-8 border border-slate-100">
                                <p className="text-slate-500 font-bold italic text-sm">
                                    "{respondingTo.comment}"
                                </p>
                            </div>

                            <textarea
                                value={responseText}
                                onChange={(e) => setResponseText(e.target.value)}
                                placeholder="Type your professional response here..."
                                className="w-full h-40 bg-white border border-slate-200 rounded-[32px] p-6 text-slate-700 font-bold focus:outline-none focus:ring-8 focus:ring-blue-600/5 transition-all resize-none"
                            ></textarea>

                            <div className="flex gap-4 mt-8">
                                <button
                                    onClick={() => setRespondingTo(null)}
                                    className="flex-1 py-4 bg-slate-100 text-slate-500 font-black rounded-2xl hover:bg-slate-200 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    disabled={isSubmitting || !responseText.trim()}
                                    onClick={handleRespond}
                                    className="flex-[2] py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-200 hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 transition-all flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4" />
                                            Submit Response
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
