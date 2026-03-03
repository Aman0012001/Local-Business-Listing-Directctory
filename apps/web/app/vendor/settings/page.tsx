"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Settings, User, Phone, MapPin, Globe, Save, Loader2, CheckCircle2, AlertCircle, Upload, KeyRound, Camera } from 'lucide-react';
import { api, getImageUrl } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';

export default function AccountSettings() {
    const { user, updateUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const hasFetched = useRef(false);

    // Profile State
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);

    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        avatarUrl: '',
        city: '',
        state: '',
        // Vendor Fields
        businessName: '',
        businessEmail: '',
        businessPhone: '',
        businessAddress: '',
        gstNumber: '',
        panNumber: ''
    });

    // Password State
    const [pwdSaving, setPwdSaving] = useState(false);
    const [pwdSuccess, setPwdSuccess] = useState(false);
    const [pwdError, setPwdError] = useState<string | null>(null);
    const [pwdData, setPwdData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        const fetchInitialProfile = async () => {
            if (hasFetched.current) return;
            hasFetched.current = true;
            setLoading(true);
            try {
                const profile = await api.users.getProfile();
                if (profile) {
                    setFormData(prev => ({
                        ...prev,
                        fullName: profile.fullName || '',
                        phone: profile.phone || '',
                        avatarUrl: profile.avatarUrl || '',
                        city: profile.city || '',
                        state: profile.state || '',
                        businessName: profile.vendor?.businessName || '',
                        businessEmail: profile.vendor?.businessEmail || '',
                        businessPhone: profile.vendor?.businessPhone || '',
                        businessAddress: profile.vendor?.businessAddress || '',
                        gstNumber: profile.vendor?.gstNumber || '',
                        panNumber: profile.vendor?.panNumber || ''
                    }));
                    if (profile.avatarUrl) {
                        setPreviewImage(getImageUrl(profile.avatarUrl));
                    }
                    if (updateUser) {
                        updateUser(profile);
                    }
                }
            } catch (err) {
                console.error('Failed to initial fetch profile:', err);
                setError('Failed to load profile data');
            } finally {
                setLoading(false);
            }
        };

        if (user && !hasFetched.current) {
            fetchInitialProfile();
        } else if (!user) {
            setLoading(false);
        }
    }, [user, updateUser]);

    // Profile Handlers
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (success) setSuccess(false);
        if (error) setError(null);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            // Use URL.createObjectURL for instant preview
            const objectUrl = URL.createObjectURL(file);
            setPreviewImage(objectUrl);

            if (success) setSuccess(false);
            if (error) setError(null);

            // Important:Revoke the URL when the component unmounts or image changes
            return () => URL.revokeObjectURL(objectUrl);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setSuccess(false);
        setError(null);

        try {
            let currentAvatarUrl = formData.avatarUrl;

            // 1. Upload avatar if changed
            if (avatarFile) {
                const response = await api.users.uploadAvatar(avatarFile);
                currentAvatarUrl = response.user.avatarUrl;
                setFormData(prev => ({ ...prev, avatarUrl: currentAvatarUrl }));
            }

            // 2. Update user profile
            await api.users.updateProfile({
                fullName: formData.fullName,
                phone: formData.phone,
                city: formData.city,
                state: formData.state,
                avatarUrl: currentAvatarUrl
            });

            // 3. Update vendor profile — ONLY if the user is explicitly a vendor
            if (user?.role === 'vendor') {
                // Strip empty strings — @IsOptional() only skips undefined/null, not ""
                const vendorPayload: Record<string, string | undefined> = {
                    businessName: formData.businessName || undefined,
                    businessEmail: formData.businessEmail || undefined,
                    businessPhone: formData.businessPhone || undefined,
                    businessAddress: formData.businessAddress || undefined,
                    gstNumber: formData.gstNumber || undefined,
                    panNumber: formData.panNumber || undefined,
                };
                // Remove undefined keys so they aren't serialised to JSON as null
                Object.keys(vendorPayload).forEach(k => {
                    if (vendorPayload[k] === undefined) delete vendorPayload[k];
                });
                await api.vendors.updateProfile(vendorPayload);
            }

            // 4. BIG SYNC: Re-fetch the entire profile from the backend to ensure a source of truth
            const finalFullProfile = await api.users.getProfile();

            // Sync AuthContext and local form state with the re-fetched data
            if (updateUser) {
                updateUser(finalFullProfile);
            }

            setFormData(prev => ({
                ...prev,
                fullName: finalFullProfile.fullName || '',
                phone: finalFullProfile.phone || '',
                avatarUrl: finalFullProfile.avatarUrl || '',
                city: finalFullProfile.city || '',
                state: finalFullProfile.state || '',
                businessName: finalFullProfile.vendor?.businessName || '',
                businessEmail: finalFullProfile.vendor?.businessEmail || '',
                businessPhone: finalFullProfile.vendor?.businessPhone || '',
                businessAddress: finalFullProfile.vendor?.businessAddress || '',
                gstNumber: finalFullProfile.vendor?.gstNumber || '',
                panNumber: finalFullProfile.vendor?.panNumber || ''
            }));

            if (finalFullProfile.avatarUrl) {
                setPreviewImage(getImageUrl(finalFullProfile.avatarUrl));
            }

            setSuccess(true);
            setAvatarFile(null);
        } catch (err: any) {
            console.error('Failed to update profile:', err);
            setError(err.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    // Password Handlers
    const handlePwdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPwdData(prev => ({ ...prev, [name]: value }));
        if (pwdSuccess) setPwdSuccess(false);
        if (pwdError) setPwdError(null);
    };

    const handlePwdSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setPwdSaving(true);
        setPwdSuccess(false);
        setPwdError(null);

        if (pwdData.newPassword.length < 8) {
            setPwdError('Password must be at least 8 characters long');
            setPwdSaving(false);
            return;
        }

        if (pwdData.newPassword !== pwdData.confirmPassword) {
            setPwdError('New passwords do not match');
            setPwdSaving(false);
            return;
        }

        try {
            await api.users.changePassword({
                oldPassword: pwdData.oldPassword,
                newPassword: pwdData.newPassword
            });
            setPwdSuccess(true);
            setPwdData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err: any) {
            console.error('Failed to change password:', err);
            setPwdError(err.message || 'Failed to change password');
        } finally {
            setPwdSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                <p className="text-slate-400 font-bold uppercase tracking-widest">Loading Settings...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl space-y-12 pb-20">
            <div>
                <h1 className="text-4xl lg:text-5xl font-black text-slate-900 mb-3 tracking-tight flex items-center gap-4">
                    Account Settings <Settings className="w-8 h-8 text-slate-400" />
                </h1>
                <p className="text-slate-400 font-bold tracking-tight text-lg">Manage your personal information and account preferences.</p>
            </div>

            {/* General Profile Info */}
            <div className="bg-white rounded-[20px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-8 lg:p-12 border-b border-slate-50 bg-slate-50/30">
                    <h3 className="text-xl font-black text-slate-900 mb-2">Personal Information</h3>
                    <p className="text-sm text-slate-500 font-medium">This information will be displayed on your profile and reviews.</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 lg:p-12 space-y-8">
                    {success && (
                        <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-2xl animate-in fade-in slide-in-from-top-2">
                            <CheckCircle2 className="w-5 h-5" />
                            <span className="font-bold text-sm">Profile updated successfully!</span>
                        </div>
                    )}
                    {error && (
                        <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl animate-in fade-in slide-in-from-top-2">
                            <AlertCircle className="w-5 h-5" />
                            <span className="font-bold text-sm">{error}</span>
                        </div>
                    )}

                    {/* Avatar Upload */}
                    <div className="flex flex-col sm:flex-row items-start gap-8 border-b border-slate-100 pb-8">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-3xl overflow-hidden bg-slate-100 border-4 border-white shadow-xl">
                                {previewImage ? (
                                    <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-300">
                                        <User className="w-12 h-12" />
                                    </div>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute -bottom-3 -right-3 w-12 h-12 bg-white rounded-2xl shadow-lg border border-slate-100 flex items-center justify-center text-slate-600 hover:text-blue-600 hover:scale-110 transition-all cursor-pointer"
                            >
                                <Camera className="w-5 h-5" />
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                                accept="image/png, image/jpeg, image/webp"
                            />
                        </div>
                        <div className="pt-2">
                            <h4 className="font-bold text-slate-900 text-lg mb-1">Profile Photo</h4>
                            <p className="text-sm text-slate-500 mb-4 font-medium max-w-sm">We recommend an image of at least 400x400px. You can upload a PNG or JPEG.</p>
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-colors"
                            >
                                Choose File
                            </button>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                                <User className="w-3.5 h-3.5" /> Full Name
                            </label>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                placeholder="e.g. John Doe"
                                className="w-full px-6 py-4 bg-slate-50 border-transparent focus:border-blue-500/20 focus:bg-white rounded-2xl text-sm font-bold transition-all outline-none"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                                <Phone className="w-3.5 h-3.5" /> Phone Number
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="e.g. +1 234 567 890"
                                className="w-full px-6 py-4 bg-slate-50 border-transparent focus:border-blue-500/20 focus:bg-white rounded-2xl text-sm font-bold transition-all outline-none"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                                <MapPin className="w-3.5 h-3.5" /> City
                            </label>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                placeholder="e.g. New York"
                                className="w-full px-6 py-4 bg-slate-50 border-transparent focus:border-blue-500/20 focus:bg-white rounded-2xl text-sm font-bold transition-all outline-none"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                                <Globe className="w-3.5 h-3.5" /> State / Region
                            </label>
                            <input
                                type="text"
                                name="state"
                                value={formData.state}
                                onChange={handleChange}
                                placeholder="e.g. NY"
                                className="w-full px-6 py-4 bg-slate-50 border-transparent focus:border-blue-500/20 focus:bg-white rounded-2xl text-sm font-bold transition-all outline-none"
                            />
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-50 flex justify-end">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center justify-center gap-3 px-10 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 disabled:scale-100"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    Save Profile
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Business Information (Vendor Only) */}
            {(user?.role === 'vendor' || user?.vendor) && (
                <div className="bg-white rounded-[20px] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-8 lg:p-12 border-b border-slate-50 bg-slate-50/30">
                        <h3 className="text-xl font-black text-slate-900 mb-2">Business Information</h3>
                        <p className="text-sm text-slate-500 font-medium">Manage your business profile and contact details.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 lg:p-12 space-y-8">
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                                    Business Name
                                </label>
                                <input
                                    type="text"
                                    name="businessName"
                                    value={formData.businessName}
                                    onChange={handleChange}
                                    className="w-full px-6 py-4 bg-slate-50 border-transparent focus:border-blue-500/20 focus:bg-white rounded-2xl text-sm font-bold transition-all outline-none"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                                    Business Email
                                </label>
                                <input
                                    type="email"
                                    name="businessEmail"
                                    value={formData.businessEmail}
                                    onChange={handleChange}
                                    className="w-full px-6 py-4 bg-slate-50 border-transparent focus:border-blue-500/20 focus:bg-white rounded-2xl text-sm font-bold transition-all outline-none"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                                    Business Phone
                                </label>
                                <input
                                    type="tel"
                                    name="businessPhone"
                                    value={formData.businessPhone}
                                    onChange={handleChange}
                                    className="w-full px-6 py-4 bg-slate-50 border-transparent focus:border-blue-500/20 focus:bg-white rounded-2xl text-sm font-bold transition-all outline-none"
                                />
                            </div>
                            <div className="space-y-3 md:col-span-2">
                                <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                                    Business Address
                                </label>
                                <input
                                    type="text"
                                    name="businessAddress"
                                    value={formData.businessAddress}
                                    onChange={handleChange}
                                    className="w-full px-6 py-4 bg-slate-50 border-transparent focus:border-blue-500/20 focus:bg-white rounded-2xl text-sm font-bold transition-all outline-none"
                                />
                            </div>
                        </div>

                        <div className="pt-8 border-t border-slate-100 mt-8">
                            <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Tax Information</h4>
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                                        GST Number
                                    </label>
                                    <input
                                        type="text"
                                        name="gstNumber"
                                        value={formData.gstNumber}
                                        onChange={handleChange}
                                        placeholder="Optional"
                                        className="w-full px-6 py-4 bg-slate-50 border-transparent focus:border-blue-500/20 focus:bg-white rounded-2xl text-sm font-bold transition-all outline-none"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                                        PAN Number
                                    </label>
                                    <input
                                        type="text"
                                        name="panNumber"
                                        value={formData.panNumber}
                                        onChange={handleChange}
                                        placeholder="Optional"
                                        className="w-full px-6 py-4 bg-slate-50 border-transparent focus:border-blue-500/20 focus:bg-white rounded-2xl text-sm font-bold transition-all outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-50 flex justify-end">
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex items-center justify-center gap-3 px-10 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 disabled:scale-100"
                            >
                                {saving ? 'Updating...' : 'Save Business Info'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Security & Password */}
            <div className="bg-white rounded-[20px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-8 lg:p-12 border-b border-slate-50 bg-slate-50/30 flex items-start gap-4">
                    <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center shrink-0">
                        <KeyRound className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-900 mb-2">Security & Password</h3>
                        <p className="text-sm text-slate-500 font-medium">Keep your account secure. If you change your password, you might be securely logged out on other devices.</p>
                    </div>
                </div>

                <form onSubmit={handlePwdSubmit} className="p-8 lg:p-12 space-y-8">
                    {pwdSuccess && (
                        <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-2xl animate-in fade-in slide-in-from-top-2">
                            <CheckCircle2 className="w-5 h-5" />
                            <span className="font-bold text-sm">Password updated successfully!</span>
                        </div>
                    )}
                    {pwdError && (
                        <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl animate-in fade-in slide-in-from-top-2">
                            <AlertCircle className="w-5 h-5" />
                            <span className="font-bold text-sm">{pwdError}</span>
                        </div>
                    )}

                    <div className="space-y-6 max-w-xl">
                        <div className="space-y-3">
                            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Current Password</label>
                            <input
                                type="password"
                                name="oldPassword"
                                required
                                value={pwdData.oldPassword}
                                onChange={handlePwdChange}
                                placeholder="Enter current password"
                                className="w-full px-6 py-4 bg-slate-50 border-transparent focus:border-orange-500/20 focus:bg-white rounded-2xl text-sm font-bold transition-all outline-none"
                            />
                        </div>

                        <div className="grid sm:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 ml-1">New Password</label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    required
                                    minLength={8}
                                    value={pwdData.newPassword}
                                    onChange={handlePwdChange}
                                    placeholder="Min. 8 characters"
                                    className="w-full px-6 py-4 bg-slate-50 border-transparent focus:border-orange-500/20 focus:bg-white rounded-2xl text-sm font-bold transition-all outline-none"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Confirm Password</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    required
                                    minLength={8}
                                    value={pwdData.confirmPassword}
                                    onChange={handlePwdChange}
                                    placeholder="Repeat new password"
                                    className="w-full px-6 py-4 bg-slate-50 border-transparent focus:border-orange-500/20 focus:bg-white rounded-2xl text-sm font-bold transition-all outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-50 flex justify-end">
                        <button
                            type="submit"
                            disabled={pwdSaving || !pwdData.oldPassword || !pwdData.newPassword || !pwdData.confirmPassword}
                            className="flex items-center justify-center gap-3 px-10 py-4 bg-[#FF7A30] text-white rounded-2xl font-black shadow-xl shadow-orange-500/20 hover:bg-[#E86920] transition-all active:scale-95 disabled:opacity-50 disabled:scale-100"
                        >
                            {pwdSaving ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <KeyRound className="w-5 h-5" />
                                    Change Password
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
