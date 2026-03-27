import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import {
    MapPin, Users, Building2, Star, Heart, Zap, Globe, Shield,
    ArrowRight, CheckCircle
} from "lucide-react";

export const metadata: Metadata = {
    title: "About Us | naampata – Find Local Businesses",
    description:
        "Learn about naampata's mission to connect people with the best local businesses in their community. Discover our story, values, and the team behind the platform.",
};

const stats = [
    { label: "Businesses Listed", value: "10,000+", icon: Building2, color: "text-[#FF7A30] bg-orange-50" },
    { label: "Happy Users", value: "50,000+", icon: Users, color: "text-blue-600 bg-blue-50" },
    { label: "Cities Covered", value: "200+", icon: Globe, color: "text-emerald-600 bg-emerald-50" },
    { label: "Reviews Posted", value: "120,000+", icon: Star, color: "text-yellow-600 bg-yellow-50" },
];

const values = [
    {
        icon: Heart,
        title: "Community First",
        desc: "We believe in the power of local communities. Every feature we build starts with the question: does this help our neighbours thrive?",
        color: "text-rose-500 bg-rose-50",
    },
    {
        icon: Shield,
        title: "Trust & Transparency",
        desc: "Verified listings, honest reviews, and clear pricing. We hold ourselves and every business on our platform to the highest standards.",
        color: "text-indigo-500 bg-indigo-50",
    },
    {
        icon: Zap,
        title: "Relentless Innovation",
        desc: "From live chat to push notifications, we continuously ship features that make discovering and connecting with local businesses effortless.",
        color: "text-[#FF7A30] bg-orange-50",
    },
    {
        icon: Globe,
        title: "Inclusive Growth",
        desc: "Whether you're a one-person shop or a growing enterprise, naampata gives every business an equal chance to shine in front of local customers.",
        color: "text-emerald-500 bg-emerald-50",
    },
];

const team = [
    { name: "Arjun Sharma", role: "Co-founder & CEO", initials: "AS", gradient: "from-orange-400 to-rose-500" },
    { name: "Priya Mehta", role: "Co-founder & CTO", initials: "PM", gradient: "from-indigo-400 to-purple-500" },
    { name: "Ravi Patel", role: "Head of Product", initials: "RP", gradient: "from-emerald-400 to-teal-500" },
    { name: "Sneha Gupta", role: "Head of Growth", initials: "SG", gradient: "from-sky-400 to-blue-500" },
];

export default function AboutPage() {
    return (
        <>
            <Navbar />
            <main>
                {/* ── Hero ── */}
                <section className="relative overflow-hidden bg-gradient-to-br from-[#112D4E] via-[#1a3f6b] to-[#2D3E50] py-28 px-4">
                    {/* decorative blobs */}
                    <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#FF7A30]/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative max-w-4xl mx-auto text-center">
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white/80 text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-sm border border-white/10">
                            <MapPin className="w-3.5 h-3.5 text-[#FF7A30]" /> Our Story
                        </span>
                        <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6">
                            Connecting People with <br />
                            <span className="text-[#FF7A30]">Local Greatness</span>
                        </h1>
                        <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed font-medium">
                            naampata was born from a simple belief — every neighbourhood has hidden gems waiting to be discovered. We built the platform to make that discovery effortless.
                        </p>
                    </div>
                </section>

                {/* ── Stats ── */}
                <section className="bg-white py-16 px-4 border-b border-slate-100">
                    <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
                        {stats.map(({ label, value, icon: Icon, color }) => (
                            <div key={label} className="flex flex-col items-center text-center gap-3 p-6 rounded-2xl border border-slate-100 hover:shadow-lg transition-shadow">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <span className="text-3xl font-black text-[#112D4E]">{value}</span>
                                <span className="text-sm text-slate-500 font-semibold">{label}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── Mission ── */}
                <section className="py-20 px-4 bg-slate-50">
                    <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <span className="text-[#FF7A30] text-xs font-black uppercase tracking-widest">Our Mission</span>
                            <h2 className="mt-3 text-3xl md:text-4xl font-black text-[#112D4E] leading-tight">
                                Empowering Local Economies, One Discovery at a Time
                            </h2>
                            <p className="mt-5 text-slate-600 font-medium leading-relaxed">
                                We give local businesses a powerful digital presence — complete with verified profiles, customer reviews, real-time chat, and targeted offers — so that when someone searches for a service nearby, the best match is right at their fingertips.
                            </p>
                            <ul className="mt-6 space-y-3">
                                {[
                                    "Free basic listing for every local business",
                                    "AI-assisted search for precision discovery",
                                    "Review moderation for trustworthy ratings",
                                    "Real-time enquiry and broadcast system",
                                ].map((item) => (
                                    <li key={item} className="flex items-start gap-3 text-slate-700 font-medium">
                                        <CheckCircle className="w-5 h-5 text-[#FF7A30] flex-shrink-0 mt-0.5" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* visual card */}
                        <div className="relative">
                            <div className="bg-gradient-to-br from-[#FF7A30] to-rose-500 rounded-3xl p-8 text-white shadow-2xl shadow-orange-500/20">
                                <MapPin className="w-10 h-10 mb-4 opacity-80" />
                                <p className="text-2xl font-black leading-snug">
                                    "Making local businesses as easy to find as they are great to experience."
                                </p>
                                <p className="mt-4 text-sm text-white/70 font-semibold">— naampata founding team</p>
                            </div>
                            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-[#112D4E] rounded-3xl -z-10" />
                        </div>
                    </div>
                </section>

                {/* ── Values ── */}
                <section className="py-20 px-4 bg-white">
                    <div className="max-w-5xl mx-auto">
                        <div className="text-center mb-14">
                            <span className="text-[#FF7A30] text-xs font-black uppercase tracking-widest">What We Stand For</span>
                            <h2 className="mt-3 text-3xl md:text-4xl font-black text-[#112D4E]">Our Core Values</h2>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-6">
                            {values.map(({ icon: Icon, title, desc, color }) => (
                                <div key={title} className="flex gap-5 p-6 rounded-2xl border border-slate-100 hover:shadow-lg hover:border-slate-200 transition-all">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-[#112D4E]">{title}</h3>
                                        <p className="mt-1 text-sm text-slate-500 font-medium leading-relaxed">{desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Team ── */}
                <section className="py-20 px-4 bg-slate-50">
                    <div className="max-w-5xl mx-auto">
                        <div className="text-center mb-14">
                            <span className="text-[#FF7A30] text-xs font-black uppercase tracking-widest">The People</span>
                            <h2 className="mt-3 text-3xl md:text-4xl font-black text-[#112D4E]">Meet the Team</h2>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {team.map(({ name, role, initials, gradient }) => (
                                <div key={name} className="flex flex-col items-center text-center">
                                    <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-2xl font-black shadow-lg mb-4`}>
                                        {initials}
                                    </div>
                                    <p className="font-bold text-[#112D4E]">{name}</p>
                                    <p className="text-xs text-slate-500 font-medium mt-0.5">{role}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── CTA ── */}
                <section className="py-20 px-4 bg-gradient-to-br from-[#112D4E] to-[#1a3f6b]">
                    <div className="max-w-2xl mx-auto text-center">
                        <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Ready to grow with us?</h2>
                        <p className="text-white/70 font-medium mb-8">Join thousands of local businesses already thriving on naampata.</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/register?role=vendor"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-[#FF7A30] text-white font-bold rounded-2xl hover:bg-[#E86920] shadow-lg shadow-orange-500/30 transition-all active:scale-95"
                            >
                                List Your Business <ArrowRight className="w-4 h-4" />
                            </Link>
                            <Link
                                href="/contact"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 text-white font-bold rounded-2xl hover:bg-white/20 border border-white/20 transition-all"
                            >
                                Contact Us
                            </Link>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
