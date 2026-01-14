'use client';

import React from 'react';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
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
  const filters = {
    sort: 'score-desc',
    limit: 3,
    page: 1,
  };

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

  return (
    <section className={`py-16 bg-[var(--color-background-card)] ${className}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-normal mb-4 text-[var(--color-text-primary)]">
           Our Top Recommended Dog Food
          </h2>
          {/* <p className="text-lg text-[var(--color-text-secondary)]">
            Ranked by overall score
          </p> */}
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
            <p className="text-[var(--color-text-secondary)]">No products found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
            {products.map((product: Product, index: number) => {
              const isFirst = index === 0;
              // Calculate price per meal (assuming 400g per meal)
              const pricePerMeal = product.price_per_kg_gbp ? (product.price_per_kg_gbp * 0.4).toFixed(2) : null;

              return (
                <div
                  key={product.id}
                  className={`bg-[var(--color-background-card)] border border-[var(--color-border)] rounded-lg shadow-[var(--shadow-small)] hover:shadow-[var(--shadow-medium)] transition-all ${isFirst ? 'best-first-box' : ''}`}
                >
                  <div className="p-4">
                    {/* First Row: Image, Brand & Title */}
                    <div className="flex gap-3 mt-2 mb-4">
                      {/* Image */}
                      <div className="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                        {product.image_url ? (
                          <Image
                            src={product.image_url}
                            alt={product.name}
                            fill
                            className="object-scale-down"
                            sizes="80px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                            No image
                          </div>
                        )}
                      </div>

                      {/* Brand & Title */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between gap-2 mb-1">
                          <p className="text-xs text-[var(--color-text-secondary)] font-medium">
                            {product.brand?.name || 'Unknown Brand'}
                          </p>
                          {product.category && (
                            <span className="capitalize-text inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--color-trust-bg)] text-[var(--color-trust)] border border-[var(--color-trust)]/20">
                              {product.category}
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-sm text-[var(--color-text-primary)] line-clamp-3 leading-tight">
                          {product.name}
                        </h4>
                      </div>
                    </div>

                    {/* Second Row: Metadata Table */}
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      {/* ODF Score */}
                      <div className="bg-[var(--color-trust-light)] rounded-lg p-2.5 border border-[var(--color-border)] text-center">
                        <p className="text-xs text-[var(--color-text-secondary)]">ODF Score</p>
                        <p className="text-lg font-bold text-[var(--color-trust)]">
                          {product.overall_score || 0}
                        </p>
                      </div>

                      {/* Price per Meal */}
                      <div className="bg-gray-50 rounded-lg p-2.5 border border-[var(--color-border)] text-center">
                        <p className="text-xs text-[var(--color-text-secondary)]">Price per meal</p>
                        <p className="text-lg font-bold text-[var(--color-text-primary)]">
                          {pricePerMeal ? `£${pricePerMeal}` : 'N/A'}
                        </p>
                      </div>
                    </div>

                    {/* Bottom: Link */}
                    <div className="pt-3 border-t border-[var(--color-border)]">
                      <Link
                        href={`/dog-food/${product.slug}`}
                        className="block text-center text-xs font-bold text-[var(--color-trust)] "
                      >
                        View product details
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* View All Link */}
        <div className="text-center">
          <Link
            href="/dog-food"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-[30px] font-bold text-base hover:opacity-90 transition-all bg-[var(--color-trust)] text-[var(--color-background-card)] shadow-[var(--shadow-medium)]"
          >
            View all products


          </Link>
        </div>
      </div>
    </section>
  );
}
