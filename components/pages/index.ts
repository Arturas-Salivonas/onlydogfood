'use client';

import dynamic from 'next/dynamic';

// Lazy load the main page components
const HomePage = dynamic(() => import('@/components/pages/HomePage'));
const DogFoodPage = dynamic(() => import('@/components/pages/DogFoodPage'));
const BrandsPage = dynamic(() => import('@/components/pages/BrandsPage'));
const ComparePage = dynamic(() => import('@/components/pages/ComparePage'));
const MethodologyPage = dynamic(() => import('@/components/pages/MethodologyPage'));

// Export the components directly (Next.js dynamic handles loading)
export { HomePage, DogFoodPage, BrandsPage, ComparePage, MethodologyPage };