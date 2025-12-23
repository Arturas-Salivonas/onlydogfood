'use client';

import { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import Link from 'next/link';
import { Product } from '@/types';
import { ProductCard } from './ProductCard';
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

  const { data, loading, error } = useQuery(GET_TOP_PRODUCTS, {
    variables: { filters: cleanedFilters },
    fetchPolicy: 'network-only', // Changed from cache-first to force fresh data
    onCompleted: (data) => {
      console.log('BestFoodsSection - query completed:', data?.products ? { total: data.products.total, dataLength: data.products.data?.length } : 'no data');
    },
    onError: (error) => {
      console.error('BestFoodsSection - query error:', error);
    },
  });

  const products = (data as { products?: { data?: Product[] } })?.products?.data || [];

  console.log('BestFoodsSection - result:', { hasData: !!data, productsLength: products.length, loading, hasError: !!error });

  const tabs = [
    { id: 'all' as TabType, label: 'Dog Food', description: '' },
    { id: 'natural' as TabType, label: 'Natural', description: '' },
    { id: 'hypoallergenic' as TabType, label: 'Hypoallergenic', description: '' },
  ];

  return (
    <section className={`py-16 bg-gradient-to-br from-gray-50 via-white to-blue-50/30 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            5 Best Dog Foods
          </h2>
          {/* <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover the highest-scoring dog foods based on our comprehensive analysis
          </p> */}
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-2xl p-2 shadow-lg border border-gray-200">
            <div className="flex space-x-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg transform scale-105'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
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
            <p className="text-red-600 mb-2">Error loading products. Please try again.</p>
            <p className="text-sm text-gray-500">{error.message || 'Unknown error'}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No products found for this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {products.map((product: Product, index: number) => (
              <ProductCard
                key={product.id}
                product={product}
                ranking={index + 1}
                showComparison={false}
                showTags={false}
                showPricePerMeal={false}
                imageFit="contain"
              />
            ))}
          </div>
        )}

        {/* View All Link */}
        <div className="text-center mt-12">
          <Link
            href="/dog-food"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all hover:scale-105"
          >
            View All Products
            <span>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}