import React from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import JobPostForm from '../../components/leads/JobPostForm';

export default function JobLeadsPage() {
    return (
        <main className="min-h-screen bg-gray-50">
            <Navbar />
            
            <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
                        Broadcast Your <span className="text-primary-600">Job Request</span>
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Post your service requirements and get competitive quotes from verified local vendors in minutes.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <span className="text-xl font-bold">1</span>
                        </div>
                        <h3 className="font-bold text-gray-900 mb-1">Post Details</h3>
                        <p className="text-sm text-gray-500">Tell us what you need and where you need it.</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
                        <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <span className="text-xl font-bold">2</span>
                        </div>
                        <h3 className="font-bold text-gray-900 mb-1">We Match</h3>
                        <p className="text-sm text-gray-500">We notify relevant vendors in your area instantly.</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
                        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <span className="text-xl font-bold">3</span>
                        </div>
                        <h3 className="font-bold text-gray-900 mb-1">Get Quotes</h3>
                        <p className="text-sm text-gray-500">Compare responses and choose the best offer.</p>
                    </div>
                </div>

                <div className="max-w-3xl mx-auto">
                    <JobPostForm />
                </div>
            </div>

            <Footer />
        </main>
    );
}
