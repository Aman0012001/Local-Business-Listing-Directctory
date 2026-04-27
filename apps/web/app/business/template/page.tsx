import React from 'react';
import BusinessDetailClient from '../[businessSlug]/BusinessDetailClient';

export default function BusinessTemplatePage() {
  // This page is used as a SPA fallback for business listings that aren't pre-rendered.
  // The BusinessDetailClient component will extract the real slug from the URL query params.
  return <BusinessDetailClient slug="template" />;
}
