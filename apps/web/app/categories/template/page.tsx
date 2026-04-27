import React from 'react';
import CategoryDetailClient from '../[categorySlug]/CategoryDetailClient';

export default function CategoryTemplatePage() {
  // This page is used as a SPA fallback for category pages that aren't pre-rendered.
  // The CategoryDetailClient component will extract the real category slug from the URL.
  return <CategoryDetailClient slug="template" />;
}
