"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, User, X, Building2, Users, LayoutGrid, MapPin, Loader2, Command } from 'lucide-react';
import { api, getImageUrl } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminHeader() {
    const { user } = useAuth();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [results, setResults] = useState<{
        businesses: any[],
        users: any[],
        categories: any[],
        cities: any[]
    } | null>(null);
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Keyboard shortcut (CMD/CTRL + K)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                const input = document.getElementById('admin-global-search');
                input?.focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchQuery.length >= 2) {
                setIsSearching(true);
                try {
                    const data = await api.admin.globalSearch(searchQuery);
                    setResults(data);
                    setShowResults(true);
                } catch (error) {
                    console.error('Search failed:', error);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setResults(null);
                setShowResults(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const handleResultClick = (href: string) => {
        setShowResults(false);
        setSearchQuery('');
        router.push(href);
    };

    return (
        <header className="h-20 bg-white border-b border-slate-200 sticky top-0 z-50 px-6 lg:px-10 flex items-center justify-between shadow-sm">
            {/* Left: Mobile Sidebar Toggle Placeholder or Logo */}
            <div className="flex items-center gap-4">
                <Link href="/admin" className="flex items-center gap-2 group">
                    <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-200 transition-transform group-hover:scale-105">
                        <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div className="hidden md:block">
                        <h1 className="text-lg font-black text-slate-900 leading-tight">Admin<span className="text-red-600">Portal</span></h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Management System</p>
                    </div>
                </Link>
            </div>

            {/* Middle: Global Search ("Easy Search") */}
            <div className="flex-1 max-w-2xl px-8 relative" ref={searchRef}>
                <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                        {isSearching ? (
                            <Loader2 className="w-5 h-5 text-red-500 animate-spin" />
                        ) : (
                            <Search className="w-5 h-5 text-slate-400 group-focus-within:text-red-600 transition-colors" />
                        )}
                    </div>
                    <input
                        id="admin-global-search"
                        type="text"
                        placeholder="Search anything... (Ctrl + K)"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
                        className="w-full h-12 bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-12 focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 focus:bg-white transition-all font-medium text-slate-900"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 px-1.5 py-1 bg-white border border-slate-200 rounded-lg shadow-sm">
                        <Command className="w-3 h-3 text-slate-400" />
                        <span className="text-[10px] font-bold text-slate-400">K</span>
                    </div>
                </div>

                {/* Results Dropdown */}
                {showResults && results && (
                    <div className="absolute top-full left-8 right-8 mt-2 bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-[100]">
                        <div className="max-h-[70vh] overflow-y-auto p-2">
                            {/* Businesses */}
                            {results.businesses.length > 0 && (
                                <div className="mb-4">
                                    <h3 className="px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                                        <Building2 className="w-3 h-3" /> Businesses
                                    </h3>
                                    {results.businesses.map(b => (
                                        <button
                                            key={b.id}
                                            onClick={() => handleResultClick(`/admin/businesses?search=${b.title}`)}
                                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 rounded-2xl transition-colors text-left group"
                                        >
                                            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                {b.title[0]}
                                            </div>
                                            <div className="flex-1 truncate">
                                                <p className="text-sm font-bold text-slate-900 truncate">{b.title}</p>
                                                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                                    <MapPin className="w-2.5 h-2.5" /> {b.city}
                                                </p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Users */}
                            {results.users.length > 0 && (
                                <div className="mb-4">
                                    <h3 className="px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                                        <Users className="w-3 h-3" /> Users
                                    </h3>
                                    {results.users.map(u => (
                                        <button
                                            key={u.id}
                                            onClick={() => handleResultClick(`/admin/users?search=${u.email}`)}
                                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 rounded-2xl transition-colors text-left group"
                                        >
                                            <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-100 flex-shrink-0">
                                                <img src={getImageUrl(u.avatarUrl) || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 truncate">
                                                <p className="text-sm font-bold text-slate-900 truncate">{u.fullName || 'Anonymous'}</p>
                                                <p className="text-[10px] font-medium text-slate-400 truncate">{u.email}</p>
                                            </div>
                                            <span className="px-2 py-0.5 bg-slate-100 rounded-md text-[9px] font-bold text-slate-500 uppercase tracking-widest">{u.role}</span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Categories & Cities */}
                            <div className="grid grid-cols-2 gap-2">
                                {results.categories.length > 0 && (
                                    <div>
                                        <h3 className="px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Categories</h3>
                                        {results.categories.map(c => (
                                            <button
                                                key={c.id}
                                                onClick={() => handleResultClick(`/admin/categories?search=${c.name}`)}
                                                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-xl transition-colors text-left"
                                            >
                                                <span className="text-xs font-bold text-slate-700 truncate">{c.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {results.cities.length > 0 && (
                                    <div>
                                        <h3 className="px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Cities</h3>
                                        {results.cities.map(c => (
                                            <button
                                                key={c.id}
                                                onClick={() => handleResultClick(`/admin/cities?search=${c.name}`)}
                                                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-xl transition-colors text-left"
                                            >
                                                <span className="text-xs font-bold text-slate-700 truncate">{c.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* No results */}
                            {Object.values(results).every(arr => arr.length === 0) && (
                                <div className="py-10 text-center">
                                    <X className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                                    <p className="text-sm font-bold text-slate-400">No matches found for "{searchQuery}"</p>
                                </div>
                            )}
                        </div>
                        <div className="bg-slate-50/50 p-3 border-t border-slate-100 flex justify-between items-center">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Admin Search</p>
                            <span className="text-[10px] font-medium text-slate-500 italic">Showing top results</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Right: Quick Actions */}
            <div className="flex items-center gap-3">
                <button className="p-2.5 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all relative">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-600 rounded-full border-2 border-white" />
                </button>

                <div className="h-8 w-px bg-slate-200 mx-2" />

                <div className="flex items-center gap-3 pl-2">
                    <div className="hidden sm:block text-right">
                        <p className="text-sm font-bold text-slate-900 leading-tight">{user?.fullName || 'Super Admin'}</p>
                        <p className="text-[10px] font-bold text-red-600 uppercase tracking-[0.2em]">Full Access</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl border-2 border-white shadow-md overflow-hidden bg-slate-100">
                        <img 
                            src={getImageUrl(user?.avatarUrl) || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'} 
                            alt="Avatar" 
                            className="w-full h-full object-cover" 
                        />
                    </div>
                </div>
            </div>
        </header>
    );
}
