import { useQuery } from '@apollo/client/react';
import { SEARCH_ALL } from '../graphql/queries/search';
import { Product, Brand } from '../../types';

export function useSearch(query: string) {
  const { data, loading, error } = useQuery(SEARCH_ALL, {
    variables: { query },
    fetchPolicy: 'cache-first',
    skip: !query || query.length < 2,
  });

  return {
    data: data ? {
      products: (data as any).searchProducts?.data as Product[] || [],
      brands: (data as any).searchBrands as Brand[] || [],
    } : null,
    isLoading: loading,
    error,
  };
}
