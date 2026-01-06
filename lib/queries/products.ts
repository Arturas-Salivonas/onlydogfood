import React from 'react';
import { useQuery } from '@apollo/client/react';
import { GET_HOME_PRODUCTS, GET_PRODUCT_DETAIL, GET_PRODUCTS_BY_BRAND, SEARCH_PRODUCTS } from '../graphql/queries/products';
import { FilterOptions, Product, PaginatedResponse } from '@/types';

// Helper to clean filters - remove undefined/null values and their string representations
function cleanFilters(filters: FilterOptions): FilterOptions {
  const cleaned: any = {};

  for (const [key, value] of Object.entries(filters)) {
    // Skip null, undefined, and string representations of these
    if (value === null ||
        value === undefined ||
        value === 'undefined' ||
        value === 'null' ||
        value === 'NaN' ||
        value === '') {
      continue;
    }

    // Handle arrays
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

export function useProducts(filters: FilterOptions = {}) {

  const cleanedFilters = cleanFilters(filters);

  console.log('useProducts - input filters:', JSON.stringify(filters, null, 2));
  console.log('useProducts - cleaned filters:', JSON.stringify(cleanedFilters, null, 2));

  const { data, loading, error } = useQuery<{ products: PaginatedResponse<Product> }>(GET_HOME_PRODUCTS, {
    variables: { filters: cleanedFilters },
    fetchPolicy: 'network-only', // Changed from cache-first to force fresh data
  });

  // Log query completion
  React.useEffect(() => {
    if (data) {
      console.log('useProducts - query completed:', data?.products ? { total: data.products.total, dataLength: data.products.data?.length } : 'no data');
    }
  }, [data]);

  // Log query errors
  React.useEffect(() => {
    if (error) {
      console.error('useProducts - query error:', error);
    }
  }, [error]);

  console.log('useProducts - result:', {
    hasData: !!data,
    productsData: data?.products ? { total: data.products.total, dataLength: data.products.data?.length } : null,
    loading,
    hasError: !!error,
    errorMessage: error?.message
  });

  return {
    data: (data as any)?.products as PaginatedResponse<Product> | null,
    isLoading: loading,
    error,
  };
}

export function useProduct(slug: string) {
  const { data, loading, error } = useQuery(GET_PRODUCT_DETAIL, {
    variables: { slug },
    fetchPolicy: 'cache-first',
    skip: !slug,
  });

  return {
    data: (data as any)?.product as Product | null,
    isLoading: loading,
    error,
  };
}

export function useProductsByBrand(brandSlug: string, filters: FilterOptions = {}) {
  const { data, loading, error } = useQuery(GET_PRODUCTS_BY_BRAND, {
    variables: { brandSlug, filters },
    fetchPolicy: 'cache-first',
    skip: !brandSlug,
  });

  return {
    data: (data as any)?.productsByBrand || null,
    isLoading: loading,
    error,
  };
}

export function useSearchProducts(query: string, filters: FilterOptions = {}) {
  const { data, loading, error } = useQuery(SEARCH_PRODUCTS, {
    variables: { query, filters },
    fetchPolicy: 'cache-first',
    skip: !query, // Don't run query if no search term
  });

  return {
    data: (data as any)?.searchProducts as PaginatedResponse<Product> | null,
    isLoading: loading,
    error,
  };
}
