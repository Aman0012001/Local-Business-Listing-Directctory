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
export default async function BusinessDetailPage({ params }: Props) {
  // 1. Unwrap the params promise
  const { slug } = await params;

  // 2. Debugging
  console.log("SSR: Loading business page for slug:", slug);

  // 3. Validation
  if (!slug) {
    notFound();
  }

  // 4. Return the client component
  // In SSR mode, the client component will handle the data fetching via the slug
  return <BusinessDetailClient slug={slug} />;
}
