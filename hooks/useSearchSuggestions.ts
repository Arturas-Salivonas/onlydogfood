import { useState, useEffect, useCallback, useRef } from 'react';
import { useDebounce } from './useDebounce';

export interface SearchSuggestion {
  id: string;
  text: string;
  type: 'product' | 'brand' | 'category';
  score?: number;
  brand?: {
    id: string;
    name: string;
    slug: string;
  };
  product?: {
    id: string;
    name: string;
    slug: string;
    overall_score?: number;
    image_url?: string;
    price_per_kg_gbp?: number | null;
  };
}

interface SearchResult {
  products: Array<{
    id: string;
    name: string;
    slug: string;
    overall_score?: number;
    image_url?: string;
    price_per_kg_gbp?: number | null;
    brand?: {
      id: string;
      name: string;
      slug: string;
    };
  }>;
  brands: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
}

export function useSearchSuggestions(searchTerm: string, enabled: boolean = true) {
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Anti-abuse: rate limiting
  const lastRequestTime = useRef<number>(0);
  const requestCount = useRef<number>(0);
  const requestWindowStart = useRef<number>(Date.now());

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Reset request count every minute
  useEffect(() => {
    const interval = setInterval(() => {
      requestCount.current = 0;
      requestWindowStart.current = Date.now();
    }, 60000); // 1 minute

    return () => clearInterval(interval);
  }, []);

  const fetchSuggestions = useCallback(async (term: string) => {
    // Only search if term is at least 3 characters
    if (!term.trim() || term.length < 3 || !enabled) {
      setSuggestions([]);
      return;
    }

    // Anti-abuse: rate limiting (max 10 requests per minute)
    const now = Date.now();
    if (now - requestWindowStart.current > 60000) {
      requestCount.current = 0;
      requestWindowStart.current = now;
    }

    if (requestCount.current >= 10) {
      setError('Too many requests. Please wait a moment.');
      return;
    }

    // Anti-abuse: minimum 200ms between requests
    if (now - lastRequestTime.current < 200) {
      return;
    }

    lastRequestTime.current = now;
    requestCount.current++;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(term)}`);

      if (!response.ok) {
        throw new Error('Search request failed');
      }

      const data: SearchResult = await response.json();

      // Transform the data into suggestions
      const transformedSuggestions: SearchSuggestion[] = [];

      // Only add products (no brands)
      data.products.forEach((product) => {
        transformedSuggestions.push({
          id: `product-${product.id}`,
          text: product.name,
          type: 'product',
          score: product.overall_score ? product.overall_score / 100 : 0.5,
          brand: product.brand,
          product: {
            id: product.id,
            name: product.name,
            slug: product.slug,
            overall_score: product.overall_score,
            image_url: product.image_url,
            price_per_kg_gbp: product.price_per_kg_gbp,
          },
        });
      });

      // Sort by score (highest first)
      transformedSuggestions.sort((a, b) => (b.score || 0) - (a.score || 0));

      // Limit to top 8 results
      setSuggestions(transformedSuggestions.slice(0, 8));
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to fetch search suggestions');
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    fetchSuggestions(debouncedSearchTerm);
  }, [debouncedSearchTerm, fetchSuggestions]);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
  }, []);

  return {
    suggestions,
    isLoading,
    error,
    clearSuggestions,
  };
}