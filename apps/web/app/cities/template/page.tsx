import React from 'react';
import CityVendorsClient from '../[cityName]/CityVendorsClient';

export default function CityTemplatePage() {
  // This page is used as a SPA fallback for city pages that aren't pre-rendered.
  // The CityVendorsClient component will extract the real city name/slug from the URL.
  return <CityVendorsClient city="template" />;
}
