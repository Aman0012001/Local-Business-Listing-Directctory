'use client';

import React from 'react';
import { JobLead } from '../../types/api';
import { formatDistanceToNow } from 'date-fns';

interface JobOpportunityCardProps {
    lead: JobLead;
    onRespond: (lead: JobLead) => void;
}

export default function JobOpportunityCard({ lead, onRespond }: JobOpportunityCardProps) {
    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{lead.title}</h3>
                    <div className="flex items-center space-x-3 text-sm text-gray-500">
                        <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {lead.city || 'Anywhere'}
                        </span>
                        <span>•</span>
                        <span>{formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })}</span>
                    </div>
                </div>
                {lead.budget && (
                    <div className="bg-primary-50 text-primary-700 px-3 py-1 rounded-lg text-sm font-bold">
                        PKR {lead.budget.toLocaleString()}
                    </div>
                )}
            </div>

            <p className="text-gray-600 mb-6 line-clamp-3">
                {lead.description}
            </p>

            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-semibold uppercase tracking-wider">
                        {lead.status}
                    </span>
                </div>
                <button
                    onClick={() => onRespond(lead)}
                    className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-xl font-bold transition-all flex items-center space-x-2"
                >
                    <span>Send Quote</span>
                </button>
            </div>
        </div>
    );
}
