/**
 * Centralized database query utilities for consistent Supabase queries
 */

import { getSupabase } from '@/lib/supabase';
import { Product, Brand, FilterOptions, PaginatedResponse } from '@/types';

/**
 * Standard select pattern for products with all relations
 */
const PRODUCT_FULL_SELECT = `
  *,
  brand:brands(*),
  tags:product_tags(tag:tags(*))
`;

/**
 * Standard select pattern for products with minimal relations (for lists)
 */
const PRODUCT_LIST_SELECT = `
  *,
  brand:brands(id, name, slug, logo_url)
`;

/**
 * Standard select pattern for brands with relations
 */
const BRAND_FULL_SELECT = `
  *
`;

/**
 * Centralized product queries
 */
export const productQueries = {
  /**
   * Get a single product by slug
   */
  async bySlug(slug: string): Promise<Product | null> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('products')
      .select(PRODUCT_FULL_SELECT)
      .eq('slug', slug)
      .eq('is_available', true)
      .single();

    if (error || !data) return null;

    return {
      ...(data as any),
      tags: (data as any).tags?.map((pt: any) => pt.tag) || []
    } as Product;
  },

  /**
   * Get a single product by ID
   */
  async byId(id: string): Promise<Product | null> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('products')
      .select(PRODUCT_FULL_SELECT)
      .eq('id', id)
      .eq('is_available', true)
      .single();

    if (error || !data) return null;

    return {
      ...(data as any),
      tags: (data as any).tags?.map((pt: any) => pt.tag) || []
    } as Product;
  },

  /**
   * Get multiple products by IDs
   */
  async byIds(ids: string[]): Promise<Product[]> {
    if (ids.length === 0) return [];

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('products')
      .select(PRODUCT_FULL_SELECT)
      .in('id', ids)
      .eq('is_available', true);

    if (error || !data) return [];

    return data.map(p => ({
      ...(p as any),
      tags: (p as any).tags?.map((pt: any) => pt.tag) || []
    })) as Product[];
  },

  /**
   * Get multiple products by slugs
   */
  async bySlugs(slugs: string[]): Promise<Product[]> {
    if (slugs.length === 0) return [];

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('products')
      .select(PRODUCT_FULL_SELECT)
      .in('slug', slugs)
      .eq('is_available', true);

    if (error || !data) return [];

    return data.map(p => ({
      ...(p as any),
      tags: (p as any).tags?.map((pt: any) => pt.tag) || []
    })) as Product[];
  },

  /**
   * Get products with filters (paginated)
   */
  async list(filters: FilterOptions = {}): Promise<PaginatedResponse<Product>> {
    const supabase = getSupabase();
    let query = supabase
      .from('products')
      .select(PRODUCT_LIST_SELECT, { count: 'exact' })
      .eq('is_available', true);

    // Apply filters
    if (filters.category && filters.category !== 'all') {
      query = query.eq('category', filters.category);
    }

    if (filters.brandId) {
      query = query.eq('brand_id', filters.brandId);
    }

    if (filters.minScore) {
      query = query.gte('overall_score', filters.minScore);
    }

    if (filters.maxScore) {
      query = query.lte('overall_score', filters.maxScore);
    }

    if (filters.minPrice) {
      query = query.gte('price_gbp', filters.minPrice);
    }

    if (filters.maxPrice) {
      query = query.lte('price_gbp', filters.maxPrice);
    }

    if (filters.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }

    // Apply sorting
    const sortField = filters.sort?.includes('price') ? 'price_gbp' :
                     filters.sort?.includes('score') ? 'overall_score' : 'overall_score';
    const sortOrder = filters.sort?.includes('desc') ? false : true;
    query = query.order(sortField, { ascending: sortOrder, nullsFirst: false });

    // Apply pagination
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching products:', error);
      return {
        data: [],
        total: 0,
        page,
        limit,
        totalPages: 0
      };
    }

    const products = data ? data.map(p => ({
      ...(p as any),
      tags: []
    })) as Product[] : [];

    return {
      data: products,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    };
  },

  /**
   * Get top products by score
   */
  async topRated(limit: number = 10): Promise<Product[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('products')
      .select(PRODUCT_LIST_SELECT)
      .eq('is_available', true)
      .order('overall_score', { ascending: false, nullsFirst: false })
      .limit(limit);

    if (error || !data) return [];

    return data.map(p => ({
      ...(p as any),
      tags: []
    })) as Product[];
  },
};

/**
 * Centralized brand queries
 */
export const brandQueries = {
  /**
   * Get a single brand by slug
   */
  async bySlug(slug: string): Promise<Brand | null> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('brands')
      .select(BRAND_FULL_SELECT)
      .eq('slug', slug)
      .single();

    if (error || !data) return null;
    return data as Brand;
  },

  /**
   * Get all brands
   */
  async list(): Promise<Brand[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('brands')
      .select(BRAND_FULL_SELECT)
      .order('name', { ascending: true });

    if (error || !data) return [];
    return data as Brand[];
  },

  /**
   * Get brands with product counts
   */
  async withProductCounts(): Promise<Array<Brand & { product_count: number }>> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('brands')
      .select(`
        *,
        products:products(count)
      `)
      .order('name', { ascending: true });

    if (error || !data) return [];

    return data.map(brand => ({
      ...(brand as any),
      product_count: (brand as any).products?.[0]?.count || 0,
    })) as Array<Brand & { product_count: number }>;
  },
};

/**
 * Helper function to validate UUID
 */
export function isValidUUID(str: string): boolean {
  if (typeof str !== 'string') return false;
  if (str === 'undefined' || str === 'null' || str === 'NaN' || str === '') return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}
