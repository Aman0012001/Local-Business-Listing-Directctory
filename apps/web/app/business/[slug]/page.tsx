import React from 'react';
import BusinessDetailClient from './BusinessDetailClient';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ slug: string }>;
}

/**
 * Business Detail Page (SSR Mode)
 * This page fetches dynamic data based on the slug.
 * generateStaticParams and output: 'export' have been removed.
 */
import { api } from '../../../lib/api';

export default async function BusinessDetailPage({ params }: Props) {
  // 1. Unwrap the params promise
  const { slug } = await params;

  // 2. Debugging
  console.log("SSR: Loading business page for slug:", slug);

  // 3. Validation
  if (!slug) {
    notFound();
  }

  // 4. Server-side fetch to validate SSR API connectivity (localhost -> 127.0.0.1 fix)
  let business = null;
  try {
    business = await api.listings.getBySlug(slug);
  } catch (error) {
    console.error(`[SSR] Failed to fetch business "${slug}":`, error);
    // If it fails on server, we can still render client component which will retry on client
  }

  // 5. If truly not found, show 404
  if (!business && !process.env.NEXT_PHASE) { // Avoid 404 during build if possible
     // Optional: notFound(); 
     // We'll let the client component handle the final "not found" state if SSR fails
  }

  // 6. Return the client component with initial data
  return <BusinessDetailClient slug={slug} initialData={business} />;
}
