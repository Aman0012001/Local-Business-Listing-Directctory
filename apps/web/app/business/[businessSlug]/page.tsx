import React from 'react';
import { Metadata } from 'next';
import BusinessDetailClient from './BusinessDetailClient';
import { api } from '../../../lib/api';

export const dynamic = 'force-static';
export const dynamicParams = false;

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
      return [
        { businessSlug: 'sample-business' },
        { businessSlug: 'test-mnh4czx8' },
        { businessSlug: 'test-mnh4bnro' },
        { businessSlug: 'bright-future-academy-mn8n7y7p' },
        { businessSlug: 'template' }
      ];
    }

    const params = listings.map((business: any) => ({
      businessSlug: business.slug,
    }));

    // Ensure our important test slugs and template are always included
    const essentialSlugs = [
      'sample-business', 
      'test-mnh4czx8', 
      'test-mnh4bnro', 
      'bright-future-academy-mn8n7y7p', 
      'template'
    ];
    essentialSlugs.forEach(slug => {
      if (!params.some(p => p.businessSlug === slug)) {
        params.push({ businessSlug: slug });
      }
    });

    return params;
  } catch (error) {
    console.error('Error generating static params:', error);
    return [
      { businessSlug: 'sample-business' },
      { businessSlug: 'test-mnh4czx8' },
      { businessSlug: 'test-mnh4bnro' },
      { businessSlug: 'bright-future-academy-mn8n7y7p' },
      { businessSlug: 'template' }
    ];
  }
}

// 1. Generate Metadata for SEO
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ businessSlug: string }> 
}): Promise<Metadata> {
  try {
    const { businessSlug } = await params;
    
    // During build, if businessSlug is 'template' or similar, return default metadata
    if (businessSlug === 'template' || businessSlug === 'sample-business') {
        return { title: 'Business Details | naampata' };
    }

    const business = await api.listings.getBySlug(businessSlug, { silent: true });
    
    if (!business) {
      return {
        title: 'Business Details | naampata',
        description: 'Find local businesses in your neighborhood.'
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
    console.error('[Metadata] Error generating metadata:', error);
    return {
      title: 'Business Details | naampata',
    };
  }
}

export default async function BusinessDetailPage({ 
  params 
}: { 
  params: Promise<{ businessSlug: string }> 
}) {
  const { businessSlug } = await params;

  if (!businessSlug) {
      return <div>Invalid Business Slug</div>;
  }

  // For static export, this will be called during build time for each slug in generateStaticParams
  let business = null;
  try {
    business = await api.listings.getBySlug(businessSlug, { silent: true });
  } catch (err) {
    console.error(`[BusinessPage] Error fetching data for ${businessSlug}:`, err);
  }

  // Use || undefined to fix Type 'Business | null' is not assignable to type 'Business | undefined'
  return <BusinessDetailClient slug={businessSlug} initialData={business || undefined} />;
}
