import { useQuery } from '@apollo/client/react';
import { GET_BRANDS, GET_BRAND_DETAIL, GET_FEATURED_BRANDS, SEARCH_BRANDS } from '../graphql/queries/brands';
import { Brand } from '../../types';

export function useBrands(sort: string = 'score-desc', page: number = 1, limit: number = 20) {
  const { data, loading, error } = useQuery(GET_BRANDS, {
    variables: { filters: { sort, page, limit } },
    fetchPolicy: 'cache-first',
  });

  return {
    data: (data as any)?.brands?.data as Brand[] || [],
    total: (data as any)?.brands?.total || 0,
    page: (data as any)?.brands?.page || 1,
    limit: (data as any)?.brands?.limit || 20,
    totalPages: (data as any)?.brands?.totalPages || 0,
    isLoading: loading,
    error,
  };
}

export function useBrand(slug: string) {
  return useQuery(GET_BRAND_DETAIL, {
    variables: { slug },
    fetchPolicy: 'cache-first',
    skip: !slug,
  });
}

export function useFeaturedBrands() {
  return useQuery(GET_FEATURED_BRANDS, {
    fetchPolicy: 'cache-first',
  });
}

export function useSearchBrands(query: string) {
  return useQuery(SEARCH_BRANDS, {
    variables: { query },
    fetchPolicy: 'cache-first',
    skip: !query,
  });
}
