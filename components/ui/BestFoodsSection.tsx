'use client';

import React, { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import Link from 'next/link';
import { Product } from '@/types';
import { FoodCard } from './FoodCard';
import { LoadingSpinner } from './LoadingSpinner';

// GraphQL query for top products
const GET_TOP_PRODUCTS = gql`
  query GetTopProducts($filters: ProductFilters) {
    products(filters: $filters) {
      data {
        id
        slug
        name
        brand_id
        category
        sub_category
        image_url
        package_size_g
        price_gbp
        price_per_kg_gbp
        overall_score
        is_sponsored
        sponsored_priority
        discount_code
        discount_description
        brand {
          id
          name
          slug
          country_of_origin
        }
        tags {
          id
          name
          slug
          color
        }
      }
      total
      page
      limit
      totalPages
    }
  }
`;

interface BestFoodsSectionProps {
  className?: string;
}

type TabType = 'all' | 'natural' | 'hypoallergenic';

// Helper to clean filters - remove undefined/null values and their string representations
function cleanFilters(filters: any): any {
  const cleaned: any = {};

  for (const [key, value] of Object.entries(filters)) {
    if (value === null ||
        value === undefined ||
        value === 'undefined' ||
        value === 'null' ||
        value === 'NaN' ||
        value === '') {
      continue;
    }

    if (Array.isArray(value)) {
      const cleanedArray = value.filter(item =>
        item !== null &&
        item !== undefined &&
        item !== 'undefined' &&
        item !== 'null' &&
        item !== 'NaN' &&
        item !== ''
      );
      if (cleanedArray.length > 0) {
        cleaned[key] = cleanedArray;
      }
    } else {
      cleaned[key] = value;
    }
  }

  return cleaned;
}

export function BestFoodsSection({ className = '' }: BestFoodsSectionProps) {
  const [activeTab, setActiveTab] = useState<TabType>('all');

  const getFilters = (tab: TabType) => {
    const baseFilters = {
      sort: 'score-desc',
      limit: 5,
      page: 1,
    };

    switch (tab) {
      case 'natural':
        return { ...baseFilters, subCategory: 'Natural' };
      case 'hypoallergenic':
        return { ...baseFilters, subCategory: 'Hypoallergenic' };
      default:
        return baseFilters;
    }
  };

  const filters = getFilters(activeTab);
  const cleanedFilters = cleanFilters(filters);

  console.log('BestFoodsSection - filters:', JSON.stringify(filters, null, 2));
  console.log('BestFoodsSection - cleaned filters:', JSON.stringify(cleanedFilters, null, 2));

  const { data, loading, error } = useQuery<{ products?: { data?: Product[]; total?: number } }>(GET_TOP_PRODUCTS, {
    variables: { filters: cleanedFilters },
    fetchPolicy: 'network-only', // Changed from cache-first to force fresh data
  });

  // Log query completion
  React.useEffect(() => {
    if (data) {
      console.log('BestFoodsSection - query completed:', data?.products ? { total: data.products.total, dataLength: data.products.data?.length } : 'no data');
    }
  }, [data]);

  // Log query errors
  React.useEffect(() => {
    if (error) {
      console.error('BestFoodsSection - query error:', error);
    }
  }, [error]);

  const products = data?.products?.data || [];

  console.log('BestFoodsSection - result:', { hasData: !!data, productsLength: products.length, loading, hasError: !!error });

  const tabs = [
    { id: 'all' as TabType, label: 'Dog Food', description: '' },
    { id: 'natural' as TabType, label: 'Natural', description: '' },
    { id: 'hypoallergenic' as TabType, label: 'Hypoallergenic', description: '' },
  ];

  return (
    <section className={`py-16 bg-[var(--color-background-card)] ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-normal mb-4 text-[var(--color-text-primary)]">
            5 best dog foods
          </h2>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="rounded-lg p-2 border bg-[var(--color-background-card)] border-[var(--color-border)] shadow-[var(--shadow-small)]">
            <div className="flex space-x-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 rounded-lg font-bold text-sm transition-all ${
                    activeTab === tab.id
                      ? 'bg-[var(--color-trust)] text-[var(--color-background-card)] shadow-[var(--shadow-medium)]'
                      : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-trust-bg)]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Description */}
        <div className="text-center mb-8">
          <p className="text-lg text-gray-600">
            {tabs.find(tab => tab.id === activeTab)?.description}
          </p>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="mb-2 text-[var(--color-caution)]">Error loading products. Please try again.</p>
            <p className="text-sm text-[var(--color-text-secondary)]">{error.message || 'Unknown error'}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[var(--color-text-secondary)]">No products found for this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {products.map((product: Product, index: number) => (
              <FoodCard
                key={product.id}
                product={product}
                ranking={index + 1}
                showComparison={false}
              />
            ))}
          </div>
        )}

        {/* View All Link */}
        <div className="text-center mt-12">
          <Link
            href="/dog-food"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-bold text-base hover:opacity-90 transition-all bg-[var(--color-trust)] text-[var(--color-background-card)] shadow-[var(--shadow-medium)]"
          >
            View all products
            <span>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
