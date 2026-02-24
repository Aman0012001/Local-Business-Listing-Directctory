"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
    Star, MapPin, Globe, Phone, Mail, Clock, ShieldCheck,
    Share2, Heart, MessageSquare, ChevronRight, CheckCircle2
} from 'lucide-react';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import Link from 'next/link';
import { api } from '../../../lib/api';
import { Business, Review } from '../../../types/api';
import { useAuth } from '../../../context/AuthContext';

export default function BusinessDetailsPage() {
    const { slug } = useParams();
    const { user } = useAuth();
    const [business, setBusiness] = useState<Business | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Overview');
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isFavorite, setIsFavorite] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);

    useEffect(() => {
        const loadBusiness = async () => {
            try {
                const data = await api.businesses.getBySlug(slug as string);
                setBusiness(data);

                // Load reviews
                const reviewsData = await api.reviews.getByBusiness(slug as string);
                setReviews(reviewsData);

                // Check if favorite
                if (user) {
                    const favs = await api.users.getFavorites();
                    setIsFavorite(favs.data.some(fav => fav.id === data.id));
                }
            } catch (err) {
                console.error('Failed to load business details:', err);
            } finally {
                setLoading(false);
            }
        };
        if (slug) loadBusiness();
    }, [slug, user]);

    const handleLike = async () => {
        if (!user) {
            alert('Please login to add to favorites');
            return;
        }
        if (!business) return;

        try {
            if (isFavorite) {
                await api.users.removeFavorite(business.id);
                setIsFavorite(false);
            } else {
                await api.users.addFavorite(business.id);
                setIsFavorite(true);
            }
        } catch (err) {
            console.error('Failed to toggle favorite:', err);
        }
    };

    const handleShare = async () => {
        const shareData = {
            title: business?.name,
            text: business?.shortDescription || business?.description,
            url: window.location.href,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.error('Share failed:', err);
            }
        } else {
            try {
                await navigator.clipboard.writeText(window.location.href);
                setCopySuccess(true);
                setTimeout(() => setCopySuccess(false), 2000);
            } catch (err) {
                console.error('Clipboard copy failed:', err);
            }
        }
    };

    const handleReviewSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            alert('Please login to write a review');
            return;
        }
        if (!business) return;

        setSubmittingReview(true);
        try {
            await api.reviews.create({
                businessId: business.id,
                rating: reviewRating,
                comment: reviewComment
            });
            // Refresh reviews
            const reviewsData = await api.reviews.getByBusiness(slug as string);
            setReviews(reviewsData);
            setShowReviewModal(false);
            setReviewComment('');
            setReviewRating(5);
        } catch (err: any) {
            alert(err.message || 'Failed to submit review');
        } finally {
            setSubmittingReview(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-white"><Navbar /><div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-400">Loading business details...</div></div>;
    if (!business) return <div className="min-h-screen bg-white"><Navbar /><div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-400">Business not found.</div></div>;

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            {/* Breadcrumbs */}
            <div className="max-w-7xl mx-auto px-4 py-6 border-b border-slate-100 flex items-center gap-2 text-sm text-slate-400">
                <Link href="/" className="hover:text-blue-600">Home</Link>
                <ChevronRight className="w-4 h-4" />
                <Link href={`/search?category=${business.category?.slug || ''}`} className="hover:text-blue-600">{business.category?.name || 'Category'}</Link>
                <ChevronRight className="w-4 h-4" />
                <span className="text-slate-900 font-medium">{business.name}</span>
            </div>

            <main className="max-w-7xl mx-auto px-4 py-12">
                <div className="grid lg:grid-cols-3 gap-12">

                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    {business.isVerified && (
                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                            <ShieldCheck className="w-3.5 h-3.5" /> Verified Listing
                                        </div>
                                    )}
                                    <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                        {business.category?.name || 'Business'}
                                    </div>
                                </div>
                                <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">{business.name}</h1>
                                <div className="flex flex-wrap items-center gap-6 text-slate-600">
                                    <div className="flex items-center gap-1.5">
                                        <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                                        <span className="font-bold text-slate-900">{business.averageRating || 'New'}</span>
                                        <span className="text-sm">({business.totalReviews || 0} reviews)</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-sm">
                                        <MapPin className="w-4 h-4 text-slate-400" /> {business.address}, {business.city}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleLike}
                                    className={`p-3 border rounded-2xl transition-all ${isFavorite ? 'bg-rose-50 border-rose-100 text-rose-500' : 'border-slate-200 text-slate-400 hover:bg-slate-50'}`}
                                >
                                    <Heart className={`w-5 h-5 ${isFavorite ? 'fill-rose-500' : ''}`} />
                                </button>
                                <button
                                    onClick={handleShare}
                                    className="p-3 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors relative"
                                >
                                    <Share2 className="w-5 h-5 text-slate-400" />
                                    {copySuccess && (
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-slate-900 text-white text-[10px] rounded-lg whitespace-nowrap animate-in fade-in slide-in-from-bottom-2">
                                            Link Copied!
                                        </div>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Gallery */}
                        <div className="grid grid-cols-4 grid-rows-2 h-[500px] gap-4 mb-16">
                            <div className="col-span-2 row-span-2 rounded-[40px] overflow-hidden border border-slate-100 bg-slate-50">
                                <img
                                    src={(business.images && business.images[0]) || business.coverImageUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1200'}
                                    className="w-full h-full object-cover"
                                    alt={business.name}
                                />
                            </div>
                            <div className="col-span-2 row-span-1 rounded-[40px] overflow-hidden border border-slate-100 bg-slate-50">
                                <img
                                    src={(business.images && business.images[1]) || 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=80&w=800'}
                                    className="w-full h-full object-cover"
                                    alt="Business interior"
                                />
                            </div>
                            <div className="col-span-1 row-span-1 rounded-[32px] overflow-hidden border border-slate-100 bg-slate-50">
                                <img
                                    src={(business.images && business.images[2]) || 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=600'}
                                    className="w-full h-full object-cover"
                                    alt="Business storefront"
                                />
                            </div>
                            <div className="col-span-1 row-span-1 rounded-[32px] bg-slate-100 flex items-center justify-center cursor-pointer hover:bg-slate-200 transition-colors">
                                <span className="text-slate-900 font-bold">View +{Math.max(0, (business.images?.length || 0) - 3)}</span>
                            </div>
                        </div>

                        {/* Tabs / Content */}
                        <div className="border-b border-slate-100 flex items-center gap-12 mb-10 overflow-x-auto scrollbar-hide">
                            {['Overview', 'Reviews', 'Amenities', 'Offers'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`pb-4 text-sm font-bold tracking-wide border-b-2 transition-all whitespace-nowrap ${activeTab === tab ? 'text-blue-600 border-blue-600' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        <div className="min-h-[400px]">
                            {activeTab === 'Overview' && (
                                <div className="prose prose-slate max-w-none animate-in fade-in duration-500">
                                    <h3 className="text-2xl font-bold text-slate-900 mb-6 italic">About {business.name}</h3>
                                    <p className="text-lg text-slate-600 leading-relaxed mb-8">
                                        {business.description}
                                    </p>

                                    <div className="grid sm:grid-cols-2 gap-4 mt-12">
                                        {['Fast Delivery', 'Premium Support', 'Genuine Products', '100% Satisfaction'].map(check => (
                                            <div key={check} className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                                <span className="font-medium text-slate-800">{check}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'Reviews' && (
                                <div className="space-y-8 animate-in fade-in duration-500">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-2xl font-bold text-slate-900">Customer Reviews</h3>
                                        <button
                                            onClick={() => setShowReviewModal(true)}
                                            className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all"
                                        >
                                            Write a Review
                                        </button>
                                    </div>

                                    {reviews.length > 0 ? (
                                        <div className="space-y-6">
                                            {reviews.map((review) => (
                                                <div key={review.id} className="p-8 bg-white rounded-[32px] border border-slate-100 shadow-sm transition-all hover:shadow-md">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 font-bold">
                                                                {review.user?.firstName?.[0]}{review.user?.lastName?.[0]}
                                                            </div>
                                                            <div>
                                                                <h4 className="font-bold text-slate-900">{review.user?.firstName} {review.user?.lastName}</h4>
                                                                <div className="flex items-center gap-1 mt-0.5">
                                                                    {[...Array(5)].map((_, i) => (
                                                                        <Star
                                                                            key={i}
                                                                            className={`w-3.5 h-3.5 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`}
                                                                        />
                                                                    ))}
                                                                    <span className="text-[10px] text-slate-400 ml-2">{new Date(review.createdAt).toLocaleDateString()}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <p className="text-slate-600 leading-relaxed italic">"{review.comment}"</p>

                                                    {review.vendorResponse && (
                                                        <div className="mt-6 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                                                <span className="text-xs font-bold text-emerald-700">Response from Business</span>
                                                            </div>
                                                            <p className="text-sm text-emerald-600 italic">{review.vendorResponse}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-12 bg-slate-50 rounded-[40px] text-center border border-dashed border-slate-200">
                                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                                                <MessageSquare className="w-8 h-8 text-slate-300" />
                                            </div>
                                            <h4 className="font-bold text-slate-900 mb-2">No reviews yet</h4>
                                            <p className="text-sm text-slate-500">Be the first to share your experience with {business.name}.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'Amenities' && (
                                <div className="animate-in fade-in duration-500">
                                    <h3 className="text-2xl font-bold text-slate-900 mb-8">Business Amenities</h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                                        {['Free WiFi', 'Parking Space', 'Accepts Cards', 'Air Conditioned', 'Wheelchair Access', 'Outdoor Seating'].map(item => (
                                            <div key={item} className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                                                    <CheckCircle2 className="w-5 h-5" />
                                                </div>
                                                <span className="font-bold text-slate-700">{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'Offers' && (
                                <div className="animate-in fade-in duration-500">
                                    <h3 className="text-2xl font-bold text-slate-900 mb-8">Exclusive Offers</h3>
                                    <div className="p-8 bg-orange-50 rounded-[40px] border border-orange-100 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100 rotate-45 translate-x-16 -translate-y-16 rounded-full group-hover:scale-110 transition-transform duration-500" />
                                        <div className="relative z-10">
                                            <span className="inline-block px-3 py-1 bg-white text-orange-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 shadow-sm">Hot Deal</span>
                                            <h4 className="text-3xl font-black text-slate-900 mb-2">15% Discount on First Visit</h4>
                                            <p className="text-slate-600 mb-6 font-medium">Mention "LocalFind15" at checkout to redeem this exclusive offer.</p>
                                            <button className="px-8 py-3 bg-[#FF7A30] text-white rounded-xl font-bold hover:bg-[#E86920] shadow-lg shadow-orange-500/20 transition-all active:scale-95">Claim Offer</button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar Area */}
                    <aside>
                        <div className="sticky top-28 space-y-8">

                            {/* Actions/Contact Card */}
                            <div className="bg-slate-900 rounded-[48px] p-8 text-white shadow-2xl shadow-blue-500/20">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Available Now</div>
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                </div>

                                <h4 className="text-xl font-bold mb-6">Connect with Business</h4>

                                <div className="space-y-4 mb-8">
                                    <button className="w-full py-4 bg-white text-slate-900 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-100 transition-all">
                                        <Phone className="w-5 h-5" /> Call Now
                                    </button>
                                    <button className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-blue-700 transition-all">
                                        <MessageSquare className="w-5 h-5" /> WhatsApp Express
                                    </button>
                                </div>

                                <div className="pt-8 border-t border-white/10 space-y-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-3 text-slate-400"><Clock className="w-4 h-4" /> Open Today</div>
                                        <span className="font-bold">09:00 - 21:00</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-3 text-slate-400"><Globe className="w-4 h-4" /> Website</div>
                                        <a href={business.website} target="_blank" className="font-bold border-b border-blue-400 text-blue-400">Visit Site</a>
                                    </div>
                                </div>
                            </div>

                            {/* Location Card */}
                            <div className="bg-white rounded-[40px] border border-slate-100 p-8">
                                <h4 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-blue-600" /> Business Location
                                </h4>
                                <div className="aspect-video bg-slate-100 rounded-3xl mb-4 overflow-hidden relative">
                                    {/* Placeholder for Map */}
                                    <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-xs italic text-center px-6">
                                        Interactive Map Loading... <br /> (Long: {business.longitude}, Lat: {business.latitude})
                                    </div>
                                </div>
                                <p className="text-slate-500 text-sm">{business.address}, {business.city}, {business.state} - {business.pincode}</p>
                            </div>

                        </div>
                    </aside>

                </div>
            </main>

            <Footer />

            {/* Review Modal */}
            {showReviewModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-lg rounded-[48px] p-8 shadow-2xl relative animate-in zoom-in-95 duration-300">
                        <button
                            onClick={() => setShowReviewModal(false)}
                            className="absolute top-8 right-8 text-slate-400 hover:text-slate-900 transition-colors"
                        >
                            <span className="sr-only">Close</span>
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>

                        <div className="text-center mb-8">
                            <h3 className="text-3xl font-black text-slate-900 mb-2">Write a Review</h3>
                            <p className="text-slate-500">Share your experience with {business.name}</p>
                        </div>

                        <form onSubmit={handleReviewSubmit} className="space-y-6">
                            <div className="flex flex-col items-center">
                                <label className="block text-sm font-bold text-slate-700 mb-4">How was your experience?</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setReviewRating(star)}
                                            className="p-1 transition-transform hover:scale-110 active:scale-90"
                                        >
                                            <Star
                                                className={`w-10 h-10 ${star <= reviewRating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Your review</label>
                                <textarea
                                    required
                                    value={reviewComment}
                                    onChange={(e) => setReviewComment(e.target.value)}
                                    rows={4}
                                    placeholder="Tell others what you liked or disliked..."
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-3xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300 text-slate-600"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submittingReview}
                                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                            >
                                {submittingReview ? 'Submitting...' : 'Submit Review'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

