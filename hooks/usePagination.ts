import { useState, useCallback } from 'react';

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

export function usePagination(initialPageSize: number = 12) {
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: initialPageSize,
    total: 0,
  });

  const setPage = useCallback((page: number) => {
    setPagination(prev => ({
      ...prev,
      page: Math.max(1, page),
    }));
  }, []);

  const setPageSize = useCallback((pageSize: number) => {
    setPagination(prev => ({
      ...prev,
      pageSize,
      page: 1, // Reset to first page when changing page size
    }));
  }, []);

  const setTotal = useCallback((total: number) => {
    setPagination(prev => ({
      ...prev,
      total,
      // Reset to first page if current page exceeds total pages
      page: Math.min(prev.page, Math.ceil(total / prev.pageSize) || 1),
    }));
  }, []);

  const nextPage = useCallback(() => {
    setPagination(prev => {
      const maxPage = Math.ceil(prev.total / prev.pageSize) || 1;
      return {
        ...prev,
        page: Math.min(prev.page + 1, maxPage),
      };
    });
  }, []);

  const prevPage = useCallback(() => {
    setPagination(prev => ({
      ...prev,
      page: Math.max(prev.page - 1, 1),
    }));
  }, []);

  const resetPagination = useCallback(() => {
    setPagination(prev => ({
      ...prev,
      page: 1,
    }));
  }, []);

  const totalPages = Math.ceil(pagination.total / pagination.pageSize) || 1;
  const hasNextPage = pagination.page < totalPages;
  const hasPrevPage = pagination.page > 1;
  const offset = (pagination.page - 1) * pagination.pageSize;

  return {
    ...pagination,
    setPage,
    setPageSize,
    setTotal,
    nextPage,
    prevPage,
    resetPagination,
    totalPages,
    hasNextPage,
    hasPrevPage,
    offset,
  };
}