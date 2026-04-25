import React from 'react';
import Link from 'next/link';
import { MapPin, Twitter, Linkedin, Instagram, ArrowUpRight } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-slate-900 text-white pt-24 pb-12 overflow-hidden relative">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-16 mb-20">
                    <div className="col-span-2">
                        <Link href="/" className="flex items-center mb-8 group overflow-hidden h-16">
                            <div className="h-24 w-40 relative transition-all duration-500 group-hover:scale-105">
                                <img
                                    src="/logo.png"
                                    alt="naampata logo"
                                    className="absolute inset-0 w-full h-full object-contain scale-[2.5] brightness-0 invert"
                                />
                            </div>
                        </Link>
                        <p className="text-slate-400 text-lg max-w-sm mb-10 font-medium leading-relaxed">
                            The definitive platform for discovering premium local businesses and services. Verified excellence, around the corner.
                        </p>
                        <div className="flex gap-4">
                            {[
                                { icon: Twitter, href: "#" },
                                { icon: Linkedin, href: "#" },
                                { icon: Instagram, href: "#" }
                            ].map((social, i) => (
                                <Link 
                                    key={i} 
                                    href={social.href}
                                    className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-primary transition-all duration-300 group"
                                >
                                    <social.icon className="w-5 h-5 text-slate-300 group-hover:text-white transition-colors" />
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="font-black text-white mb-8 uppercase tracking-[0.2em] text-[10px]">Discover</h4>
                        <ul className="space-y-4 text-sm text-slate-400 font-bold">
                            <li><Link href="/search?category=restaurants-food" className="hover:text-white transition-colors flex items-center gap-2 group">Restaurants <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all" /></Link></li>
                            <li><Link href="/search?category=beauty-spa" className="hover:text-white transition-colors flex items-center gap-2 group">Health & Wellness <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all" /></Link></li>
                            <li><Link href="/search?category=education" className="hover:text-white transition-colors flex items-center gap-2 group">Education <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all" /></Link></li>
                            <li><Link href="/search?category=automobile" className="hover:text-white transition-colors flex items-center gap-2 group">Automotive <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all" /></Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-black text-white mb-8 uppercase tracking-[0.2em] text-[10px]">Partners</h4>
                        <ul className="space-y-4 text-sm text-slate-400 font-bold">
                            <li><Link href="/register?role=vendor" className="hover:text-white transition-colors">Add Business</Link></li>
                            <li><Link href="/login" className="hover:text-white transition-colors">Vendor Dashboard</Link></li>
                            <li><Link href="/pricing" className="hover:text-white transition-colors">Growth Plans</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-black text-white mb-8 uppercase tracking-[0.2em] text-[10px]">Company</h4>
                        <ul className="space-y-4 text-sm text-slate-400 font-bold">
                            <li><Link href="/about" className="hover:text-white transition-colors">Our Vision</Link></li>
                            <li><Link href="/contact" className="hover:text-white transition-colors">Support Center</Link></li>
                            <li><Link href="/terms" className="hover:text-white transition-colors">Legal Terms</Link></li>
                            <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Platform Status: Operational
                    </div>
                    <p>© 2026 naampata systems. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
