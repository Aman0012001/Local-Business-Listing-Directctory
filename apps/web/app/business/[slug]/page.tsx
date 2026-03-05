"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
    Star, MapPin, Globe, Phone, Mail, Clock, ShieldCheck,
    Share2, Heart, MessageSquare, ChevronLeft, ChevronRight, CheckCircle2, X,
    Send, User, Tag, Zap, Calendar, Megaphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import Link from 'next/link';
import { api, getImageUrl } from '../../../lib/api';
import { Business, Review } from '../../../types/api';
import { useAuth } from '../../../context/AuthContext';

export default function BusinessDetailsPage() {
    const { slug } = useParams();
    const { user } = useAuth();
    const [business, setBusiness] = useState<Business | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Overview');
    const [comments, setComments] = useState<any[]>([]);
    const [isFavorite, setIsFavorite] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);

    // Enquiry modal state
    const [showEnquiryModal, setShowEnquiryModal] = useState(false);
    const [enquiryName, setEnquiryName] = useState('');
    const [enquiryEmail, setEnquiryEmail] = useState('');
    const [enquiryPhone, setEnquiryPhone] = useState('');
    const [enquiryMessage, setEnquiryMessage] = useState('');
    const [submittingEnquiry, setSubmittingEnquiry] = useState(false);
    const [enquirySuccess, setEnquirySuccess] = useState(false);
    const [enquiryError, setEnquiryError] = useState('');

    // Lightbox state
    const [showLightbox, setShowLightbox] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Offers & Events
    const [offers, setOffers] = useState<any[]>([]);

    useEffect(() => {
        const loadBusiness = async () => {
            try {
                const data = await api.listings.getBySlug(slug as string);
                setBusiness(data);

                // Load comments instead of legacy reviews
                const commentsData = await api.comments.getByBusiness(data.id);
                setComments(commentsData.data || []);

                // Check if favorite
                if (user) {
                    const favs = await api.users.getFavorites();
                    setIsFavorite(favs.data.some(fav => fav.id === data.id));
                }

                // Load public offers for this business
                try {
                    const offersData = await api.offers.getByBusiness(data.id);
                    setOffers(Array.isArray(offersData) ? offersData : []);
                } catch { }
            } catch (err) {
                console.error('Failed to load business details:', err);
            } finally {
                setLoading(false);
            }
        };
        if (slug) loadBusiness();
    }, [slug, user]);

    // Pre-fill enquiry form when user is available
    useEffect(() => {
        if (user) {
            setEnquiryName(user.fullName || '');
            setEnquiryEmail(user.email || '');
        }
    }, [user]);

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
            title: business?.title,
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

    const handleEnquirySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!business) return;
        if (!enquiryName.trim() || !enquiryEmail.trim() || !enquiryMessage.trim()) {
            setEnquiryError('Please fill in all required fields.');
            return;
        }
        setSubmittingEnquiry(true);
        setEnquiryError('');
        try {
            await api.leads.createEnquiry({
                businessId: business.id,
                name: enquiryName.trim(),
                email: enquiryEmail.trim(),
                phone: enquiryPhone.trim() || undefined,
                message: enquiryMessage.trim(),
                source: 'business-page',
            });
            setEnquirySuccess(true);
            setEnquiryMessage('');
            setTimeout(() => {
                setShowEnquiryModal(false);
                setEnquirySuccess(false);
            }, 2500);
        } catch (err: any) {
            setEnquiryError(err.message || 'Failed to send enquiry. Please try again.');
        } finally {
            setSubmittingEnquiry(false);
        }
    };

    const openEnquiryModal = () => {
        setEnquirySuccess(false);
        setEnquiryError('');
        setEnquiryMessage('');
        setShowEnquiryModal(true);
    };

    const handleReviewSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            alert('Please login to write a review');
            return;
        }
        if (!business) return;

        if (reviewComment.trim() && reviewComment.trim().length < 10) {
            alert('Review comment must be at least 10 characters long.');
            return;
        }

        setSubmittingReview(true);
        try {
            await api.comments.create({
                businessId: business.id,
                rating: reviewRating,
                content: reviewComment.trim()
            });
            // Refresh comments
            const commentsData = await api.comments.getByBusiness(business.id);
            setComments(commentsData.data || []);
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

    // Check if current logged-in user is the owner of this business
    const isOwner = !!user && !!business.vendor && (
        business.vendor.userId === user.id ||
        business.vendor.user?.id === user.id
    );

    const galleryImages = [
        getImageUrl(business.coverImageUrl || (business.images && business.images[0])),
        ...(business.images || []).map(img => getImageUrl(img))
    ].filter(Boolean) as string[];

    const openLightbox = (index: number) => {
        setCurrentImageIndex(index);
        setShowLightbox(true);
    };

    const nextImage = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
    };

    const prevImage = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setCurrentImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
    };

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            {/* Breadcrumbs */}
            <div className="max-w-7xl mx-auto px-4 py-6 border-b border-slate-100 flex items-center gap-2 text-sm text-slate-400">
                <Link href="/" className="hover:text-blue-600">Home</Link>
                <ChevronRight className="w-4 h-4" />
                <Link href={`/search?category=${business.category?.slug || ''}`} className="hover:text-blue-600">{business.category?.name || 'Category'}</Link>
                <ChevronRight className="w-4 h-4" />
                <span className="text-slate-900 font-medium">{business.title}</span>
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
                                <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">{business.title}</h1>
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
                            <div
                                onClick={() => openLightbox(0)}
                                className="col-span-2 row-span-2 rounded-[20px] overflow-hidden border border-slate-100 bg-slate-50 cursor-pointer group/outer"
                            >
                                <img
                                    src={galleryImages[0] || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1200'}
                                    className="w-full h-full object-cover group-hover/outer:scale-105 transition-transform duration-700"
                                    alt={business.title}
                                />
                            </div>
                            <div
                                onClick={() => openLightbox(1)}
                                className="col-span-2 row-span-1 rounded-[20px] overflow-hidden border border-slate-100 bg-slate-50 cursor-pointer group/outer"
                            >
                                <img
                                    src={galleryImages[1] || 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=80&w=800'}
                                    className="w-full h-full object-cover group-hover/outer:scale-105 transition-transform duration-700"
                                    alt="Business interior"
                                />
                            </div>
                            <div
                                onClick={() => openLightbox(2)}
                                className="col-span-1 row-span-1 rounded-[16px] overflow-hidden border border-slate-100 bg-slate-50 cursor-pointer group/outer"
                            >
                                <img
                                    src={galleryImages[2] || 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=600'}
                                    className="w-full h-full object-cover group-hover/outer:scale-105 transition-transform duration-700"
                                    alt="Business storefront"
                                />
                            </div>
                            <div
                                onClick={() => openLightbox(0)}
                                className="col-span-1 row-span-1 rounded-[16px] bg-slate-100 flex items-center justify-center cursor-pointer hover:bg-slate-200 transition-colors"
                            >
                                <span className="text-slate-900 font-bold uppercase tracking-widest text-[10px]">View +{Math.max(0, (galleryImages.length) - 3)}</span>
                            </div>
                        </div>

                        {/* Tabs / Content */}

                        <div className="border-b border-slate-100 flex items-center gap-12 mb-10 overflow-x-auto scrollbar-hide">
                            {['Overview', 'Reviews', 'Amenities', ...(business.hasOffer ? ['Offer / Deal'] : [])].map(tab => (
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
                                    <h3 className="text-2xl font-bold text-slate-900 mb-6 italic">About {business.title}</h3>
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
                                        {isOwner ? (
                                            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-xl">
                                                <ShieldCheck className="w-4 h-4 text-blue-500" />
                                                <span className="text-xs font-bold text-blue-600">Your Business</span>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setShowReviewModal(true)}
                                                className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all"
                                            >
                                                Write a Review
                                            </button>
                                        )}
                                    </div>

                                    {comments.length > 0 ? (
                                        <div className="space-y-6">
                                            {comments.map((comment: any) => (
                                                <div key={comment.id} className="p-8 bg-white rounded-[32px] border border-slate-100 shadow-sm transition-all hover:shadow-md">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 font-bold overflow-hidden shadow-inner">
                                                                {comment.user?.avatarUrl ? (
                                                                    <img src={getImageUrl(comment.user.avatarUrl) as string} alt={comment.user.fullName || 'User'} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    (comment.user?.fullName?.[0] || 'U').toUpperCase()
                                                                )}
                                                            </div>
                                                            <div>
                                                                <h4 className="font-bold text-slate-900">{comment.user?.fullName || 'Anonymous'}</h4>
                                                                <div className="flex items-center gap-1 mt-0.5">
                                                                    {[...Array(5)].map((_, i) => (
                                                                        <Star
                                                                            key={i}
                                                                            className={`w-3.5 h-3.5 ${i < (comment.rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`}
                                                                        />
                                                                    ))}
                                                                    <span className="text-[10px] text-slate-400 ml-2">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <p className="text-slate-600 leading-relaxed italic">"{comment.content}"</p>
                                                    {comment.reply && (
                                                        <div className="mt-6 p-5 bg-blue-50 rounded-3xl border border-blue-100 relative">
                                                            <div className="absolute -top-3 left-6 px-3 py-1 bg-white border border-blue-100 rounded-lg shadow-sm">
                                                                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Vendor Response</span>
                                                            </div>
                                                            <p className="text-sm text-slate-700 font-medium leading-relaxed italic">"{comment.reply.replyText}"</p>
                                                            <div className="mt-3 flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                                                <Clock className="w-3 h-3" />
                                                                {new Date(comment.reply.createdAt).toLocaleDateString()}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-12 bg-slate-50 rounded-[20px] text-center border border-dashed border-slate-200">
                                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                                                <MessageSquare className="w-8 h-8 text-slate-300" />
                                            </div>
                                            <h4 className="font-bold text-slate-900 mb-2">No reviews yet</h4>
                                            <p className="text-sm text-slate-500">Be the first to share your experience with {business.title}.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'Amenities' && (
                                <div className="animate-in fade-in duration-500">
                                    <h3 className="text-2xl font-bold text-slate-900 mb-8">Business Amenities</h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                                        {business.businessAmenities && business.businessAmenities.length > 0 ? (
                                            business.businessAmenities.map(item => (
                                                <div key={item.id} className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                                                        <CheckCircle2 className="w-5 h-5" />
                                                    </div>
                                                    <span className="font-bold text-slate-700">{item.amenity.name}</span>
                                                </div>
                                            ))
                                        ) : (
                                            ['Free WiFi', 'Parking Space', 'Accepts Cards', 'Air Conditioned', 'Wheelchair Access', 'Outdoor Seating'].map(item => (
                                                <div key={item} className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                                                        <CheckCircle2 className="w-5 h-5" />
                                                    </div>
                                                    <span className="font-bold text-slate-700">{item}</span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'Offer / Deal' && (
                                <div className="animate-in fade-in duration-500">
                                    <h3 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                                        <Tag className="w-6 h-6 text-orange-500" /> Offer / Banner Ad
                                    </h3>

                                    {/* Banner image */}
                                    {business.offerBannerUrl && (
                                        <div className="rounded-[20px] overflow-hidden mb-6 h-52 sm:h-72">
                                            <img src={business.offerBannerUrl} alt={business.offerTitle || 'Offer Banner'}
                                                className="w-full h-full object-cover" />
                                        </div>
                                    )}

                                    {/* Offer card */}
                                    <div className="relative p-8 bg-gradient-to-br from-orange-50 to-amber-50 rounded-[20px] border border-orange-100 overflow-hidden">
                                        {/* Decorative blob */}
                                        <div className="absolute -top-8 -right-8 w-40 h-40 bg-orange-100 rounded-full opacity-60" />
                                        <div className="relative z-10">
                                            {business.offerBadge && (
                                                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-orange-500 text-white rounded-full text-[11px] font-black uppercase tracking-widest mb-5 shadow-md shadow-orange-500/30">
                                                    <Zap className="w-3 h-3" /> {business.offerBadge}
                                                </span>
                                            )}
                                            <h4 className="text-3xl font-black text-slate-900 mb-3 leading-tight">
                                                {business.offerTitle || 'Special Offer'}
                                            </h4>
                                            {business.offerDescription && (
                                                <p className="text-slate-600 text-base leading-relaxed mb-6 max-w-2xl">
                                                    {business.offerDescription}
                                                </p>
                                            )}
                                            <div className="flex flex-wrap items-center gap-4">
                                                {!isOwner && (
                                                    <button
                                                        onClick={openEnquiryModal}
                                                        className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-2xl font-black text-sm hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-500/25 active:scale-95"
                                                    >
                                                        <Zap className="w-4 h-4" /> Enquire About This Offer
                                                    </button>
                                                )}
                                                {business.phone && (
                                                    <a href={`tel:${business.phone}`}
                                                        className="inline-flex items-center gap-2 px-6 py-3.5 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold text-sm hover:border-orange-400 hover:text-orange-600 transition-all"
                                                    >
                                                        <Phone className="w-4 h-4" /> Call to Claim
                                                    </a>
                                                )}
                                            </div>
                                            {business.offerExpiresAt && (
                                                <div className="flex items-center gap-2 mt-6 text-sm text-slate-500 font-medium">
                                                    <Calendar className="w-4 h-4 text-orange-400" />
                                                    <span>Offer valid until <strong className="text-orange-600">{new Date(business.offerExpiresAt).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</strong></span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>{/* end min-h-[400px] */}
                    </div>{/* end lg:col-span-2 */}

                    {/* Sidebar Area */}
                    <aside>
                        <div className="sticky top-28 space-y-8">

                            {/* Actions/Contact Card */}
                            <div className="bg-slate-900 rounded-[16px] p-8 text-white shadow-2xl shadow-blue-500/20">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Available Now</div>
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                </div>

                                <h4 className="text-xl font-bold mb-6">Connect with Business</h4>

                                <div className="space-y-4 mb-8">
                                    <a
                                        href={`tel:${business.phone}`}
                                        className="w-full py-4 bg-white text-slate-900 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-100 transition-all"
                                    >
                                        <Phone className="w-5 h-5" /> Call Now
                                    </a>
                                    <a
                                        href={`https://wa.me/${business.whatsapp || business.phone}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-blue-700 transition-all"
                                    >
                                        <MessageSquare className="w-5 h-5" /> WhatsApp Express
                                    </a>
                                </div>

                                {/* Enquiry Button - hidden for the owner */}
                                {!isOwner && (
                                    <button
                                        id="send-enquiry-btn"
                                        onClick={openEnquiryModal}
                                        className="w-full py-4 bg-gradient-to-r from-violet-600 to-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:from-violet-700 hover:to-blue-700 transition-all shadow-lg shadow-violet-500/20 active:scale-95"
                                    >
                                        <Send className="w-5 h-5" /> Send Enquiry
                                    </button>
                                )}
                                {isOwner && (
                                    <div className="w-full py-3 bg-blue-900/30 border border-blue-700/30 text-blue-300 rounded-2xl font-bold flex items-center justify-center gap-2 text-sm">
                                        <ShieldCheck className="w-4 h-4" /> You own this listing
                                    </div>
                                )}

                                <div className="pt-8 border-t border-white/10 space-y-4">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 text-slate-400 mb-2"><Clock className="w-4 h-4" /> Operating Hours</div>
                                        {business.businessHours && business.businessHours.length > 0 ? (
                                            business.businessHours.map((hour) => (
                                                <div key={hour.id} className="flex items-center justify-between text-xs">
                                                    <span className="capitalize text-slate-400">{hour.dayOfWeek}</span>
                                                    <span className={`font-bold ${hour.isOpen ? 'text-white' : 'text-rose-400'}`}>
                                                        {hour.isOpen ? `${hour.openTime} - ${hour.closeTime}` : 'Closed'}
                                                    </span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-3 text-slate-400"><Clock className="w-4 h-4" /> Open Today</div>
                                                <span className="font-bold">09:00 - 21:00</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between text-sm pt-4 border-t border-white/5">
                                        <div className="flex items-center gap-3 text-slate-400"><Globe className="w-4 h-4" /> Website</div>
                                        <a href={business.website} target="_blank" className="font-bold border-b border-blue-400 text-blue-400">Visit Site</a>
                                    </div>
                                </div>
                            </div>

                            {/* Location Card */}
                            <div className="bg-white rounded-[20px] border border-slate-100 p-8">
                                <h4 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-blue-600" /> Business Location
                                </h4>
                                <div className="aspect-video bg-slate-100 rounded-3xl mb-4 overflow-hidden relative">
                                    {/* Placeholder for Map - Linked to Google Maps */}
                                    <a
                                        href={`https://www.google.com/maps/search/?api=1&query=${business.latitude},${business.longitude}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 hover:bg-slate-200 transition-colors text-slate-400 text-xs italic text-center px-6"
                                    >
                                        <MapPin className="w-8 h-8 text-blue-600 mb-2 animate-bounce" />
                                        <span>Click to open in Google Maps</span>
                                        <span className="mt-1 opacity-50">(Long: {business.longitude}, Lat: {business.latitude})</span>
                                    </a>
                                </div>
                                <p className="text-slate-500 text-sm">{business.address}, {business.city}, {business.state} - {business.pincode}</p>
                            </div>

                        </div>
                    </aside >

                </div >
            </main>

            {/* ── Special Offers & Events ─────────────────────────────────────────── */}
            {offers.length > 0 && (
                <section className="max-w-7xl mx-auto px-4 pb-16">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
                            <Megaphone className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900">Special Offers & Events</h2>
                            <p className="text-sm text-slate-400 font-medium">Exclusive deals from {business.title}</p>
                        </div>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {offers.map((offer: any) => (
                            <div key={offer.id}
                                className="group relative bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-300 overflow-hidden flex flex-col">

                                {/* Offer Banner Image */}
                                {offer.imageUrl && (
                                    <div className="h-40 overflow-hidden bg-slate-100">
                                        <img src={offer.imageUrl} alt={offer.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    </div>
                                )}

                                {/* Top accent stripe */}
                                {!offer.imageUrl && (
                                    <div className={`h-1.5 w-full ${offer.type === 'event' ? 'bg-gradient-to-r from-blue-500 to-indigo-500' : 'bg-gradient-to-r from-orange-500 to-rose-500'}`} />
                                )}

                                <div className="p-6 flex flex-col flex-1 gap-3">
                                    {/* Badge */}
                                    {offer.offerBadge && (
                                        <span className="self-start px-3 py-1.5 bg-gradient-to-r from-orange-500 to-rose-500 text-white text-xs font-black rounded-xl shadow-sm shadow-orange-500/30">
                                            {offer.offerBadge}
                                        </span>
                                    )}

                                    {/* Type chip */}
                                    <span className={`self-start inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${offer.type === 'event' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'
                                        }`}>
                                        {offer.type === 'event' ? <Calendar className="w-3 h-3" /> : <Tag className="w-3 h-3" />}
                                        {offer.type}
                                    </span>

                                    <h3 className="font-black text-slate-900 text-lg leading-tight">{offer.title}</h3>

                                    {offer.description && (
                                        <p className="text-slate-500 text-sm leading-relaxed line-clamp-2">{offer.description}</p>
                                    )}

                                    <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                                        {offer.expiryDate ? (
                                            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                                                <Clock className="w-3.5 h-3.5" />
                                                Valid until {new Date(offer.expiryDate).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </div>
                                        ) : <span />}

                                        <button onClick={openEnquiryModal}
                                            className="px-4 py-2 bg-slate-900 text-white text-xs font-black rounded-xl hover:bg-orange-500 transition-all group-hover:scale-105 active:scale-95">
                                            Enquire
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <Footer />

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
                            <p className="text-slate-500">Share your experience with {business.title}</p>
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
            )
            }

            {/* Enquiry Modal */}
            <AnimatePresence>
                {showEnquiryModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl relative overflow-hidden"
                        >
                            {/* Header gradient bar */}
                            <div className="h-2 w-full bg-gradient-to-r from-violet-500 via-blue-500 to-indigo-500" />

                            <div className="p-8">
                                <button
                                    onClick={() => setShowEnquiryModal(false)}
                                    className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 transition-colors p-1 rounded-full hover:bg-slate-100"
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                {enquirySuccess ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="py-8 text-center"
                                    >
                                        <div className="w-20 h-20 bg-gradient-to-br from-violet-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <CheckCircle2 className="w-10 h-10 text-violet-600" />
                                        </div>
                                        <h3 className="text-2xl font-black text-slate-900 mb-2">Enquiry Sent!</h3>
                                        <p className="text-slate-500">The business owner will get back to you soon.</p>
                                    </motion.div>
                                ) : (
                                    <>
                                        <div className="mb-8">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-100 to-blue-100 flex items-center justify-center">
                                                    <Send className="w-5 h-5 text-violet-600" />
                                                </div>
                                                <div>
                                                    <h3 className="text-2xl font-black text-slate-900">Send Enquiry</h3>
                                                    <p className="text-sm text-slate-400">to {business?.title}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <form onSubmit={handleEnquirySubmit} className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Full Name *</label>
                                                    <div className="relative">
                                                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                                        <input
                                                            id="enquiry-name"
                                                            type="text"
                                                            required
                                                            value={enquiryName}
                                                            onChange={e => setEnquiryName(e.target.value)}
                                                            placeholder="Your name"
                                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none transition-all placeholder:text-slate-300"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Email *</label>
                                                    <div className="relative">
                                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                                        <input
                                                            id="enquiry-email"
                                                            type="email"
                                                            required
                                                            value={enquiryEmail}
                                                            onChange={e => setEnquiryEmail(e.target.value)}
                                                            placeholder="your@email.com"
                                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none transition-all placeholder:text-slate-300"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Phone <span className="normal-case font-medium text-slate-300">(optional)</span></label>
                                                <div className="relative">
                                                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                                    <input
                                                        id="enquiry-phone"
                                                        type="tel"
                                                        value={enquiryPhone}
                                                        onChange={e => setEnquiryPhone(e.target.value)}
                                                        placeholder="+60 123 456 7890"
                                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none transition-all placeholder:text-slate-300"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Your Message *</label>
                                                <textarea
                                                    id="enquiry-message"
                                                    required
                                                    value={enquiryMessage}
                                                    onChange={e => setEnquiryMessage(e.target.value)}
                                                    rows={4}
                                                    placeholder="Hi, I'd like to enquire about your services..."
                                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none transition-all placeholder:text-slate-300 resize-none"
                                                />
                                            </div>

                                            {enquiryError && (
                                                <div className="px-4 py-3 bg-rose-50 border border-rose-100 rounded-2xl text-sm text-rose-600 font-medium">
                                                    {enquiryError}
                                                </div>
                                            )}

                                            <button
                                                type="submit"
                                                id="enquiry-submit-btn"
                                                disabled={submittingEnquiry}
                                                className="w-full py-4 bg-gradient-to-r from-violet-600 to-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:from-violet-700 hover:to-blue-700 transition-all shadow-lg shadow-violet-500/20 active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                                            >
                                                {submittingEnquiry ? (
                                                    <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</>
                                                ) : (
                                                    <><Send className="w-5 h-5" /> Send Enquiry</>
                                                )}
                                            </button>
                                        </form>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Image Lightbox Slider */}
            <AnimatePresence>
                {showLightbox && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-10"
                        onClick={() => setShowLightbox(false)}
                    >
                        <button
                            className="absolute top-6 right-6 z-[110] w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-all border border-white/10"
                            onClick={() => setShowLightbox(false)}
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="relative w-full max-w-5xl aspect-video md:aspect-[16/9] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                            <button
                                className="absolute left-0 -translate-x-full md:-translate-x-20 z-[110] w-14 h-14 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-all border border-white/10"
                                onClick={prevImage}
                            >
                                <ChevronLeft className="w-8 h-8" />
                            </button>

                            <motion.div
                                key={currentImageIndex}
                                initial={{ opacity: 0, scale: 0.95, x: 20 }}
                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.95, x: -20 }}
                                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                className="w-full h-full rounded-[32px] overflow-hidden border border-white/10 shadow-2xl"
                            >
                                <img
                                    src={galleryImages[currentImageIndex]}
                                    className="w-full h-full object-contain bg-black/50"
                                    alt="Gallery selection"
                                />
                            </motion.div>

                            <button
                                className="absolute right-0 translate-x-full md:translate-x-20 z-[110] w-14 h-14 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-all border border-white/10"
                                onClick={nextImage}
                            >
                                <ChevronRight className="w-8 h-8" />
                            </button>

                            {/* Thumbnails Indicator */}
                            <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 flex gap-3">
                                {galleryImages.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentImageIndex(i)}
                                        className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${i === currentImageIndex ? 'bg-blue-500 w-8' : 'bg-white/20 hover:bg-white/40'}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div >
    );
}

