import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, ChevronDown, MapPin, User as UserIcon, LogOut, X, Search, Building2, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { Category, City } from '../types/api';

export default function Navbar() {
    const { user, logout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [cats, cityData] = await Promise.all([
                    api.categories.getPopular(10),
                    api.cities.getPopular()
                ]);
                setCategories(cats.slice(0, 10));
                setCities(cityData.slice(0, 10));
            } catch (error) {
                console.error('Error fetching navbar data:', error);
            }
        };
        fetchData();
    }, []);

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    return (
        <nav className="sticky top-0 z-50 bg-white/90 border-b border-slate-100/80 shadow-sm backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20 relative">

                    {/* Logo - Fixed Width Area */}
                    <div className="flex-shrink-0 w-48">
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="w-10 h-10 bg-[#112D4E] rounded-xl flex items-center justify-center relative shadow-lg group-hover:bg-[#FF7A30] transition-all duration-300 group-hover:rotate-6">
                                <MapPin className="w-6 h-6 text-white fill-white" />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-[#FF7A30] rounded-full border-2 border-[#112D4E] group-hover:bg-white group-hover:border-[#FF7A30] transition-colors duration-300" />
                            </div>
                            <span className="text-2xl font-black text-[#2D3E50] tracking-tight group-hover:text-[#112D4E] transition-colors">
                                LocalFind
                            </span>
                        </Link>
                    </div>

                    {/* Centered Desktop Nav Menu */}
                    <div className="hidden lg:flex flex-grow justify-center absolute left-1/2 -translate-x-1/2 w-full max-w-2xl pointer-events-none">
                        <div className="flex items-center gap-2 pointer-events-auto">
                            <Link href="/" className="relative text-[#2D3E50] font-bold text-[15px] px-4 py-2 rounded-xl hover:bg-slate-50 transition-all hover:text-[#FF7A30]">
                                Home
                            </Link>

                            {/* Categories Dropdown */}
                            <div
                                className="relative group"
                                onMouseEnter={() => setActiveDropdown('categories')}
                                onMouseLeave={() => setActiveDropdown(null)}
                            >
                                <button className="flex items-center gap-1 text-[#2D3E50]/70 font-bold text-[15px] px-4 py-2 rounded-xl hover:bg-slate-50 hover:text-[#2D3E50] transition-all group">
                                    Categories <ChevronDown className={`w-4 h-4 opacity-40 group-hover:opacity-100 transition-all ${activeDropdown === 'categories' ? 'rotate-180' : ''}`} />
                                </button>

                                {activeDropdown === 'categories' && (
                                    <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="grid grid-cols-1 gap-1">
                                            {categories.map((cat) => (
                                                <Link
                                                    key={cat.id}
                                                    href={`/categories/${cat.slug}`}
                                                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all group/item"
                                                >
                                                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover/item:bg-blue-50 group-hover/item:text-blue-500">
                                                        <Search className="w-4 h-4" />
                                                    </div>
                                                    <span className="text-sm font-bold text-slate-600 group-hover/item:text-slate-900">{cat.name}</span>
                                                </Link>
                                            ))}
                                            <Link href="/categories" className="mt-2 text-center py-2 text-xs font-black uppercase tracking-widest text-[#FF7A30] hover:text-[#E86920] border-t border-slate-50 pt-3">
                                                View All Categories
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Businesses Dropdown */}
                            <div
                                className="relative group"
                                onMouseEnter={() => setActiveDropdown('businesses')}
                                onMouseLeave={() => setActiveDropdown(null)}
                            >
                                <button className="flex items-center gap-1 text-[#2D3E50]/70 font-bold text-[15px] px-4 py-2 rounded-xl hover:bg-slate-50 hover:text-[#2D3E50] transition-all group">
                                    Businesses <ChevronDown className={`w-4 h-4 opacity-40 group-hover:opacity-100 transition-all ${activeDropdown === 'businesses' ? 'rotate-180' : ''}`} />
                                </button>

                                {activeDropdown === 'businesses' && (
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="grid grid-cols-1 gap-1">
                                            <Link href="/search?filter=featured" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-all group/item">
                                                <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-[#FF7A30]">
                                                    <Building2 className="w-4 h-4" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-slate-900">Featured</span>
                                                    <span className="text-[10px] text-slate-400 font-medium italic">Hand-picked best locals</span>
                                                </div>
                                            </Link>
                                            <Link href="/search?filter=new" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-all group/item">
                                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                                                    <Search className="w-4 h-4" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-slate-900">Newly Added</span>
                                                    <span className="text-[10px] text-slate-400 font-medium italic">Fresh arrivals this week</span>
                                                </div>
                                            </Link>
                                            <Link href="/search" className="mt-2 text-center py-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 border-t border-slate-50 pt-3">
                                                Advanced Search
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Cities Dropdown */}
                            <div
                                className="relative group"
                                onMouseEnter={() => setActiveDropdown('cities')}
                                onMouseLeave={() => setActiveDropdown(null)}
                            >
                                <button className="flex items-center gap-1 text-[#2D3E50]/70 font-bold text-[15px] px-4 py-2 rounded-xl hover:bg-slate-50 hover:text-[#2D3E50] transition-all group">
                                    Cities <ChevronDown className={`w-4 h-4 opacity-40 group-hover:opacity-100 transition-all ${activeDropdown === 'cities' ? 'rotate-180' : ''}`} />
                                </button>

                                {activeDropdown === 'cities' && (
                                    <div className="absolute top-full right-0 mt-1 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="grid grid-cols-1 gap-1">
                                            {cities.map((city) => (
                                                <Link
                                                    key={city.id}
                                                    href={`/search?city=${city.name}`}
                                                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-all group/item"
                                                >
                                                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover/item:text-emerald-500 group-hover/item:bg-emerald-50">
                                                        <Globe className="w-4 h-4" />
                                                    </div>
                                                    <span className="text-sm font-bold text-slate-600 group-hover/item:text-slate-900">{city.name}</span>
                                                </Link>
                                            ))}
                                            <Link href="/cities" className="mt-2 text-center py-2 text-xs font-black uppercase tracking-widest text-[#FF7A30] hover:text-[#E86920] border-t border-slate-50 pt-3">
                                                Browse All Cities
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>

                    {/* Auth Actions - Fixed Width Area */}
                    <div className="flex items-center justify-end gap-3 w-48 lg:w-auto">
                        {user ? (
                            <div className="flex items-center gap-3">
                                <Link href="/vendor/dashboard" className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100 hover:bg-slate-100 transition-all cursor-pointer group">
                                    <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                        <UserIcon className="w-4 h-4 text-[#FF7A30]" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-black text-[#112D4E] leading-tight max-w-[80px] truncate">{user.fullName || user.email}</span>
                                        {user.role === 'vendor' && (
                                            <span className="text-[8px] text-orange-600 font-black uppercase tracking-widest">Dashboard</span>
                                        )}
                                    </div>
                                </Link>
                                <button
                                    onClick={logout}
                                    className="p-2.5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                                    title="Logout"
                                >
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <div className="hidden sm:flex items-center gap-2">
                                <Link
                                    href="/login"
                                    className="px-5 py-2.5 rounded-xl text-[#2D3E50] font-bold text-sm hover:bg-slate-50 transition-all"
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/register?role=vendor"
                                    className="px-5 py-2.5 rounded-xl bg-[#FF7A30] text-white font-bold text-sm hover:bg-[#E86920] shadow-lg shadow-orange-500/20 transition-all active:scale-95 whitespace-nowrap"
                                >
                                    Add Business
                                </Link>
                            </div>
                        )}

                        <button
                            onClick={toggleMobileMenu}
                            className="lg:hidden p-2.5 bg-slate-50 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
                        >
                            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Drawer */}
            <div className={`lg:hidden fixed inset-0 z-50 transition-all duration-300 pointer-events-none ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}>
                <div className={`absolute top-20 left-0 right-0 bg-white border-b border-slate-100 shadow-2xl transition-all duration-300 pointer-events-auto ${isMobileMenuOpen ? 'translate-y-0' : '-translate-y-full'}`}>
                    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-5rem)]">
                        <div className="grid grid-cols-2 gap-4">
                            <Link href="/" className="p-4 rounded-2xl bg-slate-50 text-center font-bold text-slate-900 border border-transparent active:border-slate-200">Home</Link>
                            <Link href="/blog" className="p-4 rounded-2xl bg-slate-50 text-center font-bold text-slate-900 border border-transparent active:border-slate-200">Blog</Link>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-2">Browse Deeply</h3>
                            <div className="space-y-2">
                                <Link href="/categories" className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 font-bold text-slate-700">
                                    Categories <ChevronDown className="w-4 h-4 opacity-40" />
                                </Link>
                                <Link href="/search" className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 font-bold text-slate-700">
                                    Businesses <ChevronDown className="w-4 h-4 opacity-40" />
                                </Link>
                                <Link href="/cities" className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 font-bold text-slate-700">
                                    Cities <ChevronDown className="w-4 h-4 opacity-40" />
                                </Link>
                            </div>
                        </div>

                        {!user && (
                            <div className="space-y-3 pt-4 border-t border-slate-100">
                                <Link href="/login" className="block w-full py-4 text-center rounded-2xl font-bold bg-slate-100 text-[#2D3E50]">Log In</Link>
                                <Link href="/register?role=vendor" className="block w-full py-4 text-center rounded-2xl font-bold bg-[#FF7A30] text-white shadow-lg shadow-orange-500/20">Add Your Business</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
