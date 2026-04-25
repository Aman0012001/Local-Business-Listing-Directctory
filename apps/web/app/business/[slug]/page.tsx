import React from 'react';
import { Metadata } from 'next';
import BusinessDetailClient from './BusinessDetailClient';
import { api } from '../../../lib/api';

// Static Export Requirement: Must pre-generate all possible paths
export async function generateStaticParams() {
  try {
    // For a static export, we need to fetch the slugs we want to pre-render.
    // In a large directory, you might only pre-render popular ones or fetch all.
    // Here we fetch a reasonable number of listings to avoid long build times while ensuring coverage.
    const response = await api.listings.search({ limit: 100 });
    const listings = response.data || [];
    
    // Fallback if no listings found
    if (listings.length === 0) {
      return [{ slug: 'sample-business' }];
    }

    return listings.map((business: any) => ({
      slug: business.slug,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [{ slug: 'sample-business' }];
  }
}

// 1. Generate Metadata for SEO
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    const business = await api.listings.getBySlug(slug, { silent: true });
    
    if (!business) {
      return {
        title: 'Business Not Found | naampata',
        description: 'The business you are looking for could not be found.'
      };
    }

    return {
      title: `${business.title} | ${business.city} | naampata`,
      description: business.description?.substring(0, 160) || `Find details about ${business.title} in ${business.city}.`,
      openGraph: {
        title: business.title,
        description: business.description,
        images: business.coverImageUrl ? [business.coverImageUrl] : [],
      }
    };
  } catch (error) {
    return {
      title: 'Business Details | naampata',
    };
  }
}

export default async function BusinessDetailPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params;

  // For static export, this will be called during build time for each slug in generateStaticParams
  const business = await api.listings.getBySlug(slug, { silent: true });

  // Use || undefined to fix Type 'Business | null' is not assignable to type 'Business | undefined'
  return <BusinessDetailClient slug={slug} initialData={business || undefined} />;
}
