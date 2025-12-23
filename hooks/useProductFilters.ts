import { useState, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

export interface ProductFilters {
  category?: string;
  brandId?: string;
  minScore?: number;
  maxScore?: number;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sort?: string;
}

export function useProductFilters(initialFilters: ProductFilters = {}) {
  const [filters, setFilters] = useLocalStorage<ProductFilters>(
    'productFilters',
    initialFilters
  );

  const updateFilter = useCallback(<K extends keyof ProductFilters>(
    key: K,
    value: ProductFilters[K]
  ) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  }, [setFilters]);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, [setFilters]);

  const hasActiveFilters = Object.values(filters).some(value =>
    value !== undefined && value !== '' && value !== null
  );

  const getActiveFilterCount = () => {
    return Object.values(filters).filter(value =>
      value !== undefined && value !== '' && value !== null
    ).length;
  };

  return {
    filters,
    updateFilter,
    clearFilters,
    hasActiveFilters,
    activeFilterCount: getActiveFilterCount(),
  };
}