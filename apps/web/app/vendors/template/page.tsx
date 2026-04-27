import React from 'react';
import VendorProfileClient from '../[vendorSlug]/VendorProfileClient';

export default function VendorTemplatePage() {
  // This page is used as a SPA fallback for vendor profiles that aren't pre-rendered.
  // The VendorProfileClient component will extract the real slug from the URL query params.
  return <VendorProfileClient slugOrId="template" />;
}
