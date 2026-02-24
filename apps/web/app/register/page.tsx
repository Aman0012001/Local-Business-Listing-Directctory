"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, User, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/AuthContext';

function RegisterForm() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { register } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [selectedRole, setSelectedRole] = useState<'user' | 'vendor'>('user');

    useEffect(() => {
        const queryRole = searchParams.get('role');
        if (queryRole === 'vendor') {
            setSelectedRole('vendor');
        } else {
            setSelectedRole('user');
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await register({
                fullName,
                email,
                password,
                role: selectedRole
            });
        } catch (err: any) {
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Navbar />

            <main className="flex-grow flex items-center justify-center px-4 py-20 relative overflow-hidden">
                {/* Background Accents */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[128px] pointer-events-none" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-[128px] pointer-events-none" />

                <div className="max-w-md w-full relative z-10">
                    <div className="text-center mb-10">
                        <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">
                            {selectedRole === 'vendor' ? 'Grow Your Business' : 'Join LocalFind'}
                        </h1>
                        <p className="text-slate-500">
                            {selectedRole === 'vendor'
                                ? 'Register as a vendor to start listing your services'
                                : 'Start exploring and connecting with your community'}
                        </p>
                    </div>

                    <div className="bg-white rounded-[40px] border border-slate-100 p-8 md:p-10 shadow-xl shadow-blue-500/5">
                        <div className="flex bg-slate-100 p-1 rounded-2xl mb-8">
                            <button
                                type="button"
                                onClick={() => setSelectedRole('user')}
                                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${selectedRole === 'user' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                User Account
                            </button>
                            <button
                                type="button"
                                onClick={() => setSelectedRole('vendor')}
                                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${selectedRole === 'vendor' ? 'bg-white text-[#FF7A30] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Business Account
                            </button>
                        </div>
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold border border-red-100 italic">
                                {error}
                            </div>
                        )}
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        required
                                        type="text"
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none focus:ring-2 focus:ring-blue-500/20 rounded-2xl text-slate-900 transition-all font-medium"
                                        placeholder="Enter your full name"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        required
                                        type="email"
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none focus:ring-2 focus:ring-blue-500/20 rounded-2xl text-slate-900 transition-all"
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        required
                                        type="password"
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none focus:ring-2 focus:ring-blue-500/20 rounded-2xl text-slate-900 transition-all"
                                        placeholder="At least 8 characters"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex items-start gap-3 px-1">
                                <div className="mt-1">
                                    <input required type="checkbox" className="rounded-md border-slate-200 text-blue-600 focus:ring-blue-500" />
                                </div>
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    I agree to the <Link href="/terms" className="text-blue-600 font-bold hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-blue-600 font-bold hover:underline">Privacy Policy</Link>.
                                </p>
                            </div>

                            <button
                                disabled={loading}
                                type="submit"
                                className="w-full py-4 bg-[#FF7A30] hover:bg-[#E86920] text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-500/10 group disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                    <>
                                        {selectedRole === 'vendor' ? 'Register Business' : 'Create Account'}
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 pt-8 border-t border-slate-100 text-center">
                            <div className="flex items-center justify-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                                <ShieldCheck className="w-4 h-4 text-emerald-500" /> Secure Registration
                            </div>
                        </div>
                    </div>

                    <p className="mt-8 text-center text-sm text-slate-500">
                        Already have an account? <Link href="/login" className="text-blue-600 font-bold hover:underline underline-offset-4">Log in here</Link>
                    </p>
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default function RegisterPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-white flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
            </div>
        }>
            <RegisterForm />
        </Suspense>
    );
}
