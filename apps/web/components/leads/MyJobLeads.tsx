'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { JobLead, JobLeadResponse } from '../../types/api';
import { formatDistanceToNow } from 'date-fns';

export default function MyJobLeads() {
    const [leads, setLeads] = useState<JobLead[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedLead, setSelectedLead] = useState<JobLead | null>(null);

    useEffect(() => {
        fetchMyLeads();
    }, []);

    const fetchMyLeads = async () => {
        try {
            setLoading(true);
            const data = await api.jobLeads.getMyLeads();
            setLeads(data);
        } catch (err: any) {
            console.error('Failed to fetch my leads', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center py-12">Loading your requests...</div>;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">My Job Requests</h2>

            {leads.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center">
                    <p className="text-gray-500 mb-4">You haven't posted any job requests yet.</p>
                    <a href="/job-leads" className="text-primary-600 font-bold hover:underline">Post a job now</a>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {leads.map(lead => (
                        <div 
                            key={lead.id} 
                            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer"
                            onClick={() => setSelectedLead(lead)}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-gray-900">{lead.title}</h3>
                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                    lead.status === 'closed' ? 'bg-gray-100 text-gray-600' : 'bg-primary-50 text-primary-600'
                                }`}>
                                    {lead.status}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 mb-4">
                                Posted {formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })}
                            </p>
                            <div className="flex items-center text-sm font-semibold text-primary-600">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                </svg>
                                {lead.responses?.length || 0} Responses from Vendors
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Responses Modal */}
            {selectedLead && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <div>
                                <h3 className="font-bold text-gray-900 text-xl">{selectedLead.title}</h3>
                                <p className="text-sm text-gray-500">Vendor Responses</p>
                            </div>
                            <button onClick={() => setSelectedLead(null)} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l18 18" />
                                </svg>
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {selectedLead.responses && selectedLead.responses.length > 0 ? (
                                selectedLead.responses.map(resp => (
                                    <div key={resp.id} className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold">
                                                    {resp.vendor?.businessName?.charAt(0) || 'V'}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900">{resp.vendor?.businessName}</h4>
                                                    <p className="text-xs text-gray-500">{formatDistanceToNow(new Date(resp.createdAt), { addSuffix: true })}</p>
                                                </div>
                                            </div>
                                            {resp.price && (
                                                <div className="text-right">
                                                    <p className="text-xs text-gray-400 uppercase font-bold">Offer Price</p>
                                                    <p className="text-lg font-black text-primary-600">PKR {resp.price.toLocaleString()}</p>
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-gray-700 leading-relaxed italic">"{resp.message}"</p>
                                        <div className="mt-6 flex space-x-3">
                                            <button className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 rounded-xl transition-all">
                                                Contact Vendor
                                            </button>
                                            <button className="px-4 py-2 border border-gray-200 hover:bg-white rounded-xl text-gray-600 font-bold transition-all">
                                                Decline
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 text-gray-400">
                                    <p>No responses yet. We're waiting for vendors to send their quotes.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
