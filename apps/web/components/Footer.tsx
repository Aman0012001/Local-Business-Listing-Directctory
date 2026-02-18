import React from 'react';
import Link from 'next/link';
import { MapPin } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-slate-50 border-t border-slate-200 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
                    <div className="col-span-2">
                        <Link href="/" className="flex items-center gap-2 mb-6 group">
                            <div className="w-8 h-8 bg-[#112D4E] rounded-lg flex items-center justify-center relative shadow-md group-hover:bg-[#FF7A30] transition-colors duration-300">
                                <MapPin className="w-5 h-5 text-white fill-white" />
                            </div>
                            <span className="text-xl font-black text-[#2D3E50] tracking-tight">
                                LocalFind
                            </span>
                        </Link>
                        <p className="text-slate-500 text-sm max-w-xs mb-6 font-medium leading-relaxed">
                            Discover the best local businesses, services, and professionals in your area. Your trusted local guide to everything around you.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold text-[#112D4E] mb-5 uppercase tracking-wider text-xs">Discover</h4>
                        <ul className="space-y-3 text-sm text-slate-600 font-bold">
                            <li><Link href="/search?category=restaurants-food" className="hover:text-[#FF7A30] transition-colors">Restaurants</Link></li>
                            <li><Link href="/search?category=beauty-spa" className="hover:text-[#FF7A30] transition-colors">Health & Wellness</Link></li>
                            <li><Link href="/search?category=education" className="hover:text-[#FF7A30] transition-colors">Education</Link></li>
                            <li><Link href="/search?category=automobile" className="hover:text-[#FF7A30] transition-colors">Automotive</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-[#112D4E] mb-5 uppercase tracking-wider text-xs">For Vendors</h4>
                        <ul className="space-y-3 text-sm text-slate-600 font-bold">
                            <li><Link href="/register?role=vendor" className="hover:text-[#FF7A30] transition-colors">Add Business</Link></li>
                            <li><Link href="/login" className="hover:text-[#FF7A30] transition-colors">Vendor Login</Link></li>
                            <li><Link href="/pricing" className="hover:text-[#FF7A30] transition-colors">Pricing Plans</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-[#112D4E] mb-5 uppercase tracking-wider text-xs">Company</h4>
                        <ul className="space-y-3 text-sm text-slate-600 font-bold">
                            <li><Link href="/about" className="hover:text-[#FF7A30] transition-colors">About Us</Link></li>
                            <li><Link href="/contact" className="hover:text-[#FF7A30] transition-colors">Contact</Link></li>
                            <li><Link href="/terms" className="hover:text-[#FF7A30] transition-colors">Terms of Service</Link></li>
                            <li><Link href="/privacy" className="hover:text-[#FF7A30] transition-colors">Privacy Policy</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400 font-bold">
                    <p>© 2026 LocalFind Discovery. All rights reserved.</p>
                    <div className="flex gap-6">
                        <Link href="#" className="hover:text-[#FF7A30] transition-colors uppercase tracking-widest">Twitter</Link>
                        <Link href="#" className="hover:text-[#FF7A30] transition-colors uppercase tracking-widest">LinkedIn</Link>
                        <Link href="#" className="hover:text-[#FF7A30] transition-colors uppercase tracking-widest">Instagram</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
