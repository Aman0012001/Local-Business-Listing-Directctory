'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { JobLead } from '../../types/api';
import JobOpportunityCard from './JobOpportunityCard';

export default function VendorLeadsInbox() {
    const [leads, setLeads] = useState<JobLead[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedLead, setSelectedLead] = useState<JobLead | null>(null);
    const [responseMessage, setResponseMessage] = useState('');
    const [responsePrice, setResponsePrice] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        try {
            setLoading(true);
            const data = await api.broadcasts.getVendorInbox();
            setLeads(data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch leads');
        } finally {
            setLoading(false);
        }
    };

    const handleRespond = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedLead) return;

        setSubmitting(true);
        try {
            await api.broadcasts.respond(selectedLead.id, {
                message: responseMessage,
                price: responsePrice ? parseFloat(responsePrice) : undefined,
            });
            setSelectedLead(null);
            setResponseMessage('');
            setResponsePrice('');
            fetchLeads();
        } catch (err: any) {
            alert(err.message || 'Failed to send response');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="text-center py-12">Loading job opportunities...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Job Opportunities</h2>
                <button 
                    onClick={fetchLeads}
                    className="text-primary-600 hover:text-primary-700 text-sm font-semibold flex items-center"
                >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                </button>
            </div>

            {leads.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl border border-dashed border-gray-200 text-center">
                    <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">No leads yet</h3>
                    <p className="text-gray-500">We'll notify you when new requests match your business category.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {leads.map(lead => (
                        <JobOpportunityCard 
                            key={lead.id} 
                            lead={lead} 
                            onRespond={setSelectedLead} 
                        />
                    ))}
                </div>
            )}

            {/* Response Modal */}
            {selectedLead && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <div>
                                <h3 className="font-bold text-gray-900">Send Price Quote</h3>
                                <p className="text-sm text-gray-500 line-clamp-1">To: {selectedLead.title}</p>
                            </div>
                            <button onClick={() => setSelectedLead(null)} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l18 18" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleRespond} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Your Message</label>
                                <textarea
                                    required
                                    rows={4}
                                    placeholder="Explain how you can help and why they should choose you..."
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                    value={responseMessage}
                                    onChange={(e) => setResponseMessage(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Estimated Price (Optional)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">PKR</span>
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        className="w-full pl-14 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                        value={responsePrice}
                                        onChange={(e) => setResponsePrice(e.target.value)}
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center space-x-2 shadow-lg shadow-primary-200"
                            >
                                {submitting ? (
                                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                ) : (
                                    <>
                                        <span>Send Proposal</span>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
