import { getSupabase } from '../supabase';
import { getCacheManager, cacheTags, cacheTTL } from '../cache/manager';
import { cacheKeys } from '../cache/redis';
import { Product, Brand, FilterOptions, PaginatedResponse, Tag } from '../../types';

export class CachedSupabaseClient {
  private cache = getCacheManager();

  async getProducts(filters: FilterOptions = {}): Promise<PaginatedResponse<Product>> {

    console.log('>>> CachedSupabase.getProducts - Input filters:', JSON.stringify(filters, null, 2));

    // TEMPORARILY BYPASS CACHE FOR DEBUGGING
    // const cacheKey = cacheKeys.products.list(filters);
    // const cached = await this.cache.get<PaginatedResponse<Product>>(cacheKey);
    // if (cached) {
    //   console.log('>>> CachedSupabase.getProducts - Returning from cache');
    //   return cached;
    // }

    console.log('>>> CachedSupabase.getProducts - Cache BYPASSED, querying database');

    // Validate brandId is a valid UUID before filtering
    const isValidUUID = (str: string) => {
      if (typeof str !== 'string') return false;
      // Check for invalid string values first
      if (str === 'undefined' || str === 'null' || str === 'NaN' || str === '') return false;
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      return uuidRegex.test(str);
    };

    // Fetch from database
    const supabase = getSupabase();
    let query = supabase
      .from('products')
      .select(`
        *,
        product_tags(
          tag:tags(*)
        )
      `, { count: 'exact' })
      .eq('is_available', true)
      .not('brand_id', 'is', null);

    // Apply filters
    if (filters.category && filters.category !== 'all') {
      query = query.eq('category', filters.category);
    }

    // Only apply brandId filter if it's a valid UUID
    if (filters.brandId) {
      if (isValidUUID(filters.brandId)) {
        query = query.eq('brand_id', filters.brandId);
      }
    }

    if (filters.brands && Array.isArray(filters.brands) && filters.brands.length > 0) {
      // Filter by multiple brand IDs - only include valid UUIDs
      const validBrandIds = filters.brands.filter(id => isValidUUID(id));
      if (validBrandIds.length > 0) {
        query = query.in('brand_id', validBrandIds);
      }
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

    if (filters.subCategory) {
      // Handle sub_category filtering - check if it contains the filter value
      query = query.ilike('sub_category', `%${filters.subCategory}%`);
    }

    // NOTE: priceRange, minScoreFilter, lifeStage, breedSize, and specialDiet are
    // application-level filters that should be converted to database queries if needed
    // For now, they're used for UI purposes and don't map to database columns

    // Handle application-level filters by converting them to database queries
    if (filters.priceRange && filters.priceRange !== 'all') {
      // Example: 'budget' -> under £2/kg, 'premium' -> over £5/kg, etc.
      // For now, we'll skip these as they need proper mapping
      console.log('>>> CachedSupabase - priceRange filter ignored (needs conversion):', filters.priceRange);
    }

    if (filters.minScoreFilter && filters.minScoreFilter !== 'all') {
      // Convert minScoreFilter to actual score ranges
      console.log('>>> CachedSupabase - minScoreFilter ignored (needs conversion):', filters.minScoreFilter);
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

    console.log('>>> CachedSupabase.getProducts - Executing Supabase query...');
    const { data, error, count } = await query;

    if (error) {
      console.error('>>> CachedSupabase.getProducts - Supabase error:', error);
      throw error;
    }

    console.log('>>> CachedSupabase.getProducts - Query successful:', { count, dataLength: data?.length });

    const result: PaginatedResponse<Product> = {
      data: (data as any[]).map(product => ({
        ...product,
        tags: product.product_tags?.map((pt: any) => pt.tag) || [],
        brand: null // Will be populated below
      })) as Product[],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    };

    // Fetch brands separately for products with valid brand_ids
    const validBrandIds = result.data
      .map(p => p.brand_id)
      .filter(id => id && typeof id === 'string' && isValidUUID(id));

    if (validBrandIds.length > 0) {
      const { data: brandsData } = await supabase
        .from('brands')
        .select('*')
        .in('id', validBrandIds);

      const brandMap = new Map((brandsData as any)?.map((brand: any) => [brand.id, brand]) || []);

      // Assign brands to products
      result.data.forEach(product => {
        if (product.brand_id && brandMap.has(product.brand_id)) {
          product.brand = brandMap.get(product.brand_id) as any;
        }
      });
    }

    // TEMPORARILY DON'T CACHE FOR DEBUGGING
    // await this.cache.set(cacheKey, result, cacheTTL.medium);

    console.log('>>> CachedSupabase.getProducts - Returning result:', { total: result.total, dataLength: result.data.length });

    return result;
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    const cacheKey = cacheKeys.products.detail(slug);

    // Validate UUID helper
    const isValidUUID = (str: string) => {
      if (typeof str !== 'string') return false;
      if (str === 'undefined' || str === 'null' || str === 'NaN' || str === '') return false;
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      return uuidRegex.test(str);
    };

    // Try cache first
    const cached = await this.cache.get<Product>(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch from database
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('products')
      .select('*, product_tags(tag:tags(*))')
      .eq('slug', slug)
      .eq('is_available', true)
      .filter('brand_id::text', 'not.in', '("undefined","null","NaN","")')
      .not('brand_id', 'is', null)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    let product = {
      ...(data as any),
      tags: (data as any).product_tags?.map((pt: any) => pt.tag) || [],
      brand: null
    } as Product;

    // Fetch brand separately if brand_id is valid
    if (product.brand_id && typeof product.brand_id === 'string' && isValidUUID(product.brand_id)) {
      const { data: brandData } = await supabase
        .from('brands')
        .select('*')
        .eq('id', product.brand_id)
        .single();

      if (brandData) {
        product.brand = brandData;
      }
    }

    // Cache the result
    await this.cache.set(cacheKey, product, cacheTTL.long);

    return product;
  }

  async getProduct(slug: string): Promise<{ product: Product; relatedProducts: Product[] } | null> {
    const cacheKey = cacheKeys.products.detail(slug);
    // Validate UUID helper
    const isValidUUID = (str: string) => {
      if (typeof str !== 'string') return false;
      if (str === 'undefined' || str === 'null' || str === 'NaN' || str === '') return false;
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      return uuidRegex.test(str);
    };
    // Try cache first
    const cached = await this.cache.get<{ product: Product; relatedProducts: Product[] }>(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch from database
    const supabase = getSupabase();

    // Fetch product with brand
    const { data: productData, error: productError } = await supabase
      .from('products')
      .select('*, product_tags(tag:tags(*))')
      .eq('slug', slug)
      .eq('is_available', true)
      .filter('brand_id::text', 'not.in', '("undefined","null","NaN","")')
      .not('brand_id', 'is', null)
      .single();

    if (productError || !productData) {
      if (productError?.code === 'PGRST116') return null; // Not found
      throw productError;
    }

    let product = {
      ...(productData as any),
      tags: (productData as any).product_tags?.map((pt: any) => pt.tag) || [],
      brand: null
    } as Product;

    // Fetch brand separately if brand_id is valid
    if (product.brand_id && typeof product.brand_id === 'string' && isValidUUID(product.brand_id)) {
      const { data: brandData } = await supabase
        .from('brands')
        .select('*')
        .eq('id', product.brand_id)
        .single();

      if (brandData) {
        product.brand = brandData;
      }
    }

    // Fetch related products (same brand or category)
    let relatedQuery = supabase
      .from('products')
      .select('*, product_tags(tag:tags(*))')
      .eq('is_available', true)
      .filter('brand_id::text', 'not.in', '("undefined","null","NaN","")')
      .not('brand_id', 'is', null)
      .neq('id', product.id);

    // Only filter by brand if brand_id is valid
    if (product.brand_id && isValidUUID(product.brand_id)) {
      relatedQuery = relatedQuery.or(`brand_id.eq.${product.brand_id},category.eq.${product.category}`);
    } else {
      relatedQuery = relatedQuery.eq('category', product.category);
    }

    const { data: relatedProductsData } = await relatedQuery
      .order('overall_score', { ascending: false, nullsFirst: false })
      .limit(4);

    let relatedProducts = (relatedProductsData || []).map(p => ({
      ...(p as any),
      tags: (p as any).product_tags?.map((pt: any) => pt.tag) || [],
      brand: null
    })) as Product[];

    // Fetch brands for related products
    const validRelatedBrandIds = relatedProducts
      .map(p => p.brand_id)
      .filter(id => id && typeof id === 'string' && isValidUUID(id));

    if (validRelatedBrandIds.length > 0) {
      const { data: brandsData } = await supabase
        .from('brands')
        .select('*')
        .in('id', validRelatedBrandIds);

      const brandMap = new Map((brandsData as any)?.map((brand: any) => [brand.id, brand]) || []);

      // Assign brands to related products
      relatedProducts.forEach(product => {
        if (product.brand_id && brandMap.has(product.brand_id)) {
          product.brand = brandMap.get(product.brand_id) as any;
        }
      });
    }

    const result = {
      product,
      relatedProducts,
    };

    // Cache the result
    await this.cache.set(cacheKey, result, cacheTTL.long);

    return result;
  }

  async getBrands(sort: string = 'score-desc'): Promise<Brand[]> {
    const cacheKey = cacheKeys.brands.list(sort);

    // Try cache first
    const cached = await this.cache.get<Brand[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch from database
    const supabase = getSupabase();
    let query = supabase
      .from('brands')
      .select('*');

    // Apply sorting
    switch (sort) {
      case 'name-asc':
        query = query.order('name', { ascending: true });
        break;
      case 'products':
        query = query.order('total_products', { ascending: false });
        break;
      case 'score-desc':
      default:
        query = query.order('overall_score', { ascending: false, nullsFirst: false });
        break;
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    const brands = data as Brand[];

    // Cache the result
    await this.cache.set(cacheKey, brands, cacheTTL.long);

    return brands;
  }

  async getBrandBySlug(slug: string): Promise<Brand | null> {
    const cacheKey = cacheKeys.brands.detail(slug);

    // Try cache first
    const cached = await this.cache.get<Brand>(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch from database
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    const brand = data as Brand;

    // Cache the result
    await this.cache.set(cacheKey, brand, cacheTTL.long);

    return brand;
  }

  async getBrand(slug: string, category?: string): Promise<{ brand: Brand; products: Product[] } | null> {
    const cacheKey = cacheKeys.brands.detail(`${slug}${category ? `-${category}` : ''}`);

    // Try cache first
    const cached = await this.cache.get<{ brand: Brand; products: Product[] }>(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch from database
    const supabase = getSupabase();

    // Fetch brand
    const { data: brandData, error: brandError } = await supabase
      .from('brands')
      .select('*')
      .eq('slug', slug)
      .single();

    if (brandError || !brandData) {
      if (brandError?.code === 'PGRST116') return null; // Not found
      throw brandError;
    }

    const brand = brandData as Brand;

    // Fetch brand products
    let productsQuery = supabase
      .from('products')
      .select('*')
      .eq('brand_id', brand.id)
      .eq('is_available', true)
      .order('overall_score', { ascending: false, nullsFirst: false });

    if (category && category !== 'all') {
      productsQuery = productsQuery.eq('category', category);
    }

    const { data: productsData, error: productsError } = await productsQuery;

    if (productsError) {
      throw productsError;
    }

    const result = {
      brand,
      products: productsData || [],
    };

    // Cache the result
    await this.cache.set(cacheKey, result, cacheTTL.long);

    return result;
  }

  async getBrandsWithFilters(filters: {
    search?: string;
    sort?: string;
    page?: number;
    limit?: number;
    isFeatured?: boolean;
    isSponsored?: boolean;
  } = {}): Promise<PaginatedResponse<Brand>> {
    const cacheKey = `brands:filtered:${JSON.stringify(filters)}`;

    // Try cache first
    const cached = await this.cache.get<PaginatedResponse<Brand>>(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch from database
    const supabase = getSupabase();
    let query = supabase
      .from('brands')
      .select('*', { count: 'exact' });

    // Apply filters
    if (filters.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }

    if (filters.isFeatured !== undefined) {
      query = query.eq('is_featured', filters.isFeatured);
    }

    if (filters.isSponsored !== undefined) {
      query = query.eq('is_sponsored', filters.isSponsored);
    }

    // Apply sorting
    const sort = filters.sort || 'score-desc';
    switch (sort) {
      case 'name-asc':
        query = query.order('name', { ascending: true });
        break;
      case 'name-desc':
        query = query.order('name', { ascending: false });
        break;
      case 'products':
        query = query.order('total_products', { ascending: false });
        break;
      case 'score-desc':
      default:
        query = query.order('overall_score', { ascending: false, nullsFirst: false });
        break;
    }

    // Apply pagination
    const page = filters.page || 1;
    const limit = filters.limit || 12;
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    const brands = data as Brand[];
    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    const result: PaginatedResponse<Brand> = {
      data: brands,
      total,
      page,
      limit,
      totalPages,
    };

    // Cache the result
    await this.cache.set(cacheKey, result, cacheTTL.long);

    return result;
  }

  async getProductsByIds(ids: string[]): Promise<Product[]> {
    const cacheKey = cacheKeys.products.byIds(ids.sort().join(','));

    // Validate UUID helper
    const isValidUUID = (str: string) => {
      if (typeof str !== 'string') return false;
      if (str === 'undefined' || str === 'null' || str === 'NaN' || str === '') return false;
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      return uuidRegex.test(str);
    };

    // Try cache first
    const cached = await this.cache.get<Product[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch from database
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('products')
      .select('*, product_tags(tag:tags(*))')
      .in('id', ids)
      .eq('is_available', true)
      .filter('brand_id::text', 'not.in', '("undefined","null","NaN","")')
      .not('brand_id', 'is', null);

    if (error) {
      throw error;
    }

    let products = (data as any[]).map(product => ({
      ...product,
      tags: product.product_tags?.map((pt: any) => pt.tag) || [],
      brand: null
    })) as Product[];

    // Fetch brands separately for products with valid brand_ids
    const validBrandIds = products
      .map(p => p.brand_id)
      .filter(id => id && typeof id === 'string' && isValidUUID(id));

    if (validBrandIds.length > 0) {
      const { data: brandsData } = await supabase
        .from('brands')
        .select('*')
        .in('id', validBrandIds);

      const brandMap = new Map((brandsData as any)?.map((brand: any) => [brand.id, brand]) || []);

      // Assign brands to products
      products.forEach(product => {
        if (product.brand_id && brandMap.has(product.brand_id)) {
          product.brand = brandMap.get(product.brand_id) as any;
        }
      });
    }

    // Cache the result
    await this.cache.set(cacheKey, products, cacheTTL.medium);

    return products;
  }

  async searchProducts(query: string, limit: number = 10): Promise<Product[]> {
    const cacheKey = cacheKeys.products.search(query);

    // Validate UUID helper
    const isValidUUID = (str: string) => {
      if (typeof str !== 'string') return false;
      if (str === 'undefined' || str === 'null' || str === 'NaN' || str === '') return false;
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      return uuidRegex.test(str);
    };

    // Try cache first
    const cached = await this.cache.get<Product[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch from database
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('products')
      .select('*, product_tags(tag:tags(*))')
      .eq('is_available', true)
      .filter('brand_id::text', 'not.in', '("undefined","null","NaN","")')
      .not('brand_id', 'is', null)
      .ilike('name', `%${query}%`)
      .order('overall_score', { ascending: false, nullsFirst: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    let products = (data as any[]).map(product => ({
      ...product,
      tags: product.product_tags?.map((pt: any) => pt.tag) || [],
      brand: null
    })) as Product[];

    // Fetch brands separately for products with valid brand_ids
    const validBrandIds = products
      .map(p => p.brand_id)
      .filter(id => id && typeof id === 'string' && isValidUUID(id));

    if (validBrandIds.length > 0) {
      const { data: brandsData } = await supabase
        .from('brands')
        .select('*')
        .in('id', validBrandIds);

      const brandMap = new Map((brandsData as any)?.map((brand: any) => [brand.id, brand]) || []);

      // Assign brands to products
      products.forEach(product => {
        if (product.brand_id && brandMap.has(product.brand_id)) {
          product.brand = brandMap.get(product.brand_id) as any;
        }
      });
    }

    // Cache the result with shorter TTL for search results
    await this.cache.set(cacheKey, products, cacheTTL.short);

    return products;
  }

  async search(query: string): Promise<{ products: Product[]; brands: Brand[] }> {
    const cacheKey = `search:${query}`;

    // Try cache first
    const cached = await this.cache.get<{ products: Product[]; brands: Brand[] }>(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch from database
    const supabase = getSupabase();

    // Search products
    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .select('*, brand:brands(*)')
      .eq('is_available', true)
      .or(`name.ilike.%${query}%,ingredients_raw.ilike.%${query}%`)
      .order('overall_score', { ascending: false, nullsFirst: false })
      .limit(10);

    // Search brands
    const { data: brandsData, error: brandsError } = await supabase
      .from('brands')
      .select('*')
      .ilike('name', `%${query}%`)
      .limit(5);

    if (productsError || brandsError) {
      throw productsError || brandsError;
    }

    const result = {
      products: productsData || [],
      brands: brandsData || [],
    };

    // Cache the result with shorter TTL for search results
    await this.cache.set(cacheKey, result, cacheTTL.short);

    return result;
  }

  // Cache invalidation methods
  async invalidateProductCache(slug?: string): Promise<void> {
    if (slug) {
      await this.cache.delete(cacheKeys.products.detail(slug));
    } else {
      await this.cache.deletePattern('products:*');
    }
  }

  async invalidateBrandCache(slug?: string): Promise<void> {
    if (slug) {
      await this.cache.delete(cacheKeys.brands.detail(slug));
    } else {
      await this.cache.delete(cacheKeys.brands.list());
      await this.cache.deletePattern('brands:detail:*');
    }
  }

  async invalidateSearchCache(): Promise<void> {
    await this.cache.deletePattern('products:search:*');
  }

  async invalidateAllCache(): Promise<void> {
    await this.cache.clearAll();
  }

  // Health check
  async healthCheck(): Promise<{
    cache: { redis: boolean; memory: boolean; memorySize: number };
    database: boolean;
  }> {
    let database = false;

    try {
      const supabase = getSupabase();
      const { error } = await supabase.from('products').select('id').limit(1);
      database = !error;
    } catch {
      database = false;
    }

    return {
      cache: await this.cache.healthCheck(),
      database,
    };
  }

  // Additional methods for GraphQL
  async getBrandById(id: string): Promise<Brand | null> {
    const cacheKey = `brand:id:${id}`;

    const cached = await this.cache.get<Brand>(cacheKey);
    if (cached) return cached;

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    await this.cache.set(cacheKey, data as Brand, cacheTTL.long);
    return data as Brand;
  }

  async getProductTags(productId: string): Promise<Tag[]> {
    const cacheKey = `product:tags:${productId}`;

    const cached = await this.cache.get<Tag[]>(cacheKey);
    if (cached) return cached;

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('product_tags')
      .select('tag:tags(*)')
      .eq('product_id', productId);

    if (error) throw error;

    const tags = (data || []).map((item: any) => item.tag) as Tag[];
    await this.cache.set(cacheKey, tags, cacheTTL.long);
    return tags;
  }

  async getTags(): Promise<Tag[]> {
    const cacheKey = 'tags:all';

    const cached = await this.cache.get<Tag[]>(cacheKey);
    if (cached) return cached;

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('name');

    if (error) throw error;

    await this.cache.set(cacheKey, data as Tag[], cacheTTL.long);
    return data as Tag[];
  }

  async getArticles(): Promise<any[]> {
    const cacheKey = 'articles:all';

    const cached = await this.cache.get<any[]>(cacheKey);
    if (cached) return cached;

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('is_published', true)
      .order('published_at', { ascending: false });

    if (error) throw error;

    await this.cache.set(cacheKey, data || [], cacheTTL.medium);
    return data || [];
  }

  async getComparisons(): Promise<any[]> {
    const cacheKey = 'comparisons:all';

    const cached = await this.cache.get<any[]>(cacheKey);
    if (cached) return cached;

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('comparisons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    await this.cache.set(cacheKey, data || [], cacheTTL.medium);
    return data || [];
  }
}

// Singleton instance
let cachedClient: CachedSupabaseClient | null = null;

export function getCachedSupabaseClient(): CachedSupabaseClient {
  if (!cachedClient) {
    cachedClient = new CachedSupabaseClient();
  }
  return cachedClient;
}