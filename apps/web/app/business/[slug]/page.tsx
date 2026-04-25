import React from 'react';
import BusinessDetailClient from './BusinessDetailClient';

export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return [{ slug: 'placeholder' }];
}

export default async function BusinessDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return <BusinessDetailClient slug={slug} />;
}
