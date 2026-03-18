import React from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import JobPostForm from '../../components/leads/BroadcastRequestForm';

export default function BroadcastsPage() {
    return (
        <main className="min-h-screen bg-slate-50">
            <Navbar />
            
            <div className="max-w-4xl mx-auto px-4 py-16 md:py-24">
                <div className="text-center mb-16 animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                        <Megaphone className="w-3 h-3" /> Real-time Matching
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 tracking-tight leading-[0.95]">
                        Broadcast Your <span className="text-blue-600">Request.</span>
                    </h1>
                    <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
                        Need a pro in a hurry? Send a live broadcast to nearby qualified experts and get instant responses with real quotes.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    <div className="bg-white p-8 rounded-[32px] border-2 border-slate-50 shadow-sm transition-all hover:shadow-xl hover:scale-[1.02]">
                        <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-black text-lg mb-6 shadow-lg shadow-blue-200">
                            1
                        </div>
                        <h3 className="font-black text-slate-900 mb-2 tracking-tight">Details</h3>
                        <p className="text-sm text-slate-400 font-bold leading-relaxed">Tell us what you need and share your location for precision matching.</p>
                    </div>
                    <div className="bg-white p-8 rounded-[32px] border-2 border-slate-50 shadow-sm transition-all hover:shadow-xl hover:scale-[1.02]">
                        <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center font-black text-lg mb-6 shadow-lg shadow-emerald-200">
                            2
                        </div>
                        <h3 className="font-black text-slate-900 mb-2 tracking-tight">Broadcast</h3>
                        <p className="text-sm text-slate-400 font-bold leading-relaxed">We beam your request to the top verified experts in your immediate area.</p>
                    </div>
                    <div className="bg-white p-8 rounded-[32px] border-2 border-slate-50 shadow-sm transition-all hover:shadow-xl hover:scale-[1.02]">
                        <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-lg mb-6 shadow-lg shadow-slate-200">
                            3
                        </div>
                        <h3 className="font-black text-slate-900 mb-2 tracking-tight">Connect</h3>
                        <p className="text-sm text-slate-400 font-bold leading-relaxed">Compare quotes and choose the expert that fits your needs best.</p>
                    </div>
                </div>

                <div className="max-w-3xl mx-auto bg-white p-10 rounded-[40px] border-2 border-slate-50 shadow-2xl shadow-slate-200/50">
                    <JobPostForm />
                </div>
            </div>

            <Footer />
        </main>
    );
}

const Megaphone = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
    </svg>
);
