"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Lock, ArrowRight, Github, Chrome, Loader2 } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await login({ email, password });
        } catch (err: any) {
            setError(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Navbar />

            <main className="flex-grow flex items-center justify-center px-4 py-20 relative overflow-hidden">
                {/* Abstract Background */}
                <div className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(circle_at_100%_0%,rgba(59,130,246,0.05),transparent)]" />
                <div className="absolute bottom-0 left-0 w-1/2 h-full bg-[radial-gradient(circle_at_0%_100%,rgba(99,102,241,0.05),transparent)]" />

                <div className="max-w-md w-full relative z-10">
                    <div className="text-center mb-10">
                        <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">Welcome Back</h1>
                        <p className="text-slate-500">Sign in to your LocalFind account</p>
                    </div>

                    <div className="bg-white rounded-[40px] border border-slate-100 p-8 md:p-10 shadow-xl shadow-blue-500/5">
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold border border-red-100 italic">
                                {error}
                            </div>
                        )}
                        <form className="space-y-6" onSubmit={handleSubmit}>
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
                                <div className="flex justify-between px-1 mb-2">
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Password</label>
                                    <Link href="/forgot-password" title="Forgot Password" className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">Forgot?</Link>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        required
                                        type="password"
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none focus:ring-2 focus:ring-blue-500/20 rounded-2xl text-slate-900 transition-all"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            <button
                                disabled={loading}
                                type="submit"
                                className="w-full py-4 bg-[#112D4E] hover:bg-black text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-slate-900/10 group disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                    <>
                                        Sign In
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="relative my-10">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                            <div className="relative flex justify-center text-xs uppercase font-bold text-slate-400 bg-white px-4">Or continue with</div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button className="flex items-center justify-center gap-2 py-4 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors font-bold text-sm text-slate-700">
                                <Chrome className="w-4 h-4" /> Google
                            </button>
                            <button className="flex items-center justify-center gap-2 py-4 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors font-bold text-sm text-slate-700">
                                <Github className="w-4 h-4" /> GitHub
                            </button>
                        </div>
                    </div>

                    <p className="mt-8 text-center text-sm text-slate-500">
                        Don't have an account? <Link href="/register" className="text-blue-600 font-bold hover:underline underline-offset-4">Create one for free</Link>
                    </p>
                </div>
            </main>

            <Footer />
        </div>
    );
}
