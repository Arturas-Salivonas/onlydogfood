import { getCachedSupabaseClient } from '../cache/cached-supabase';
import { FilterOptions, Brand } from '../../types';

// Helper function to check if a value is a valid UUID
function isValidUUID(str: string): boolean {
  if (typeof str !== 'string') return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

// Helper function to clean filter values - remove undefined/null strings and empty values
function cleanFilters(filters: any): any {
  if (!filters || typeof filters !== 'object') return {};

  const cleaned: any = {};

  for (const [key, value] of Object.entries(filters)) {
    // Skip if value is null, undefined, or string representations of these
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

// Transform database data for GraphQL (no field name changes needed since schema uses snake_case)
function transformProduct(product: any): any {
  return {
    ...product,
    // Ensure tags are included
    tags: product.tags || []
  };
}

function transformBrand(brand: any): any {
  return brand;
}

export const resolvers: any = {
  Query: {
    // Products
    products: async (_: any, { filters }: any) => {

      console.log('===== GraphQL products resolver START =====');
      console.log('Raw filters received:', JSON.stringify(filters, null, 2));

      const cachedClient = getCachedSupabaseClient();

      // Clean and sanitize filters
      const sanitizedFilters = cleanFilters(filters);
      console.log('Sanitized filters:', JSON.stringify(sanitizedFilters, null, 2));

      // Validate brandId is a valid UUID
      if (sanitizedFilters.brandId && !isValidUUID(sanitizedFilters.brandId)) {
        delete sanitizedFilters.brandId;
      }

      // Ensure brands array contains only valid UUIDs
      if (sanitizedFilters.brands && Array.isArray(sanitizedFilters.brands)) {
        sanitizedFilters.brands = sanitizedFilters.brands.filter((id: any) => isValidUUID(id));
        if (sanitizedFilters.brands.length === 0) {
          delete sanitizedFilters.brands;
        }
      }

      // Build filterOptions only with defined values
      const filterOptions: FilterOptions = {
        page: sanitizedFilters.page || 1,
        limit: sanitizedFilters.limit || 12,
      };

      // Only add properties that have actual values
      if (sanitizedFilters.category) filterOptions.category = sanitizedFilters.category as any;
      if (sanitizedFilters.brandId) filterOptions.brandId = sanitizedFilters.brandId;
      if (sanitizedFilters.minScore !== undefined) filterOptions.minScore = sanitizedFilters.minScore;
      if (sanitizedFilters.maxScore !== undefined) filterOptions.maxScore = sanitizedFilters.maxScore;
      if (sanitizedFilters.minPrice !== undefined) filterOptions.minPrice = sanitizedFilters.minPrice;
      if (sanitizedFilters.maxPrice !== undefined) filterOptions.maxPrice = sanitizedFilters.maxPrice;
      if (sanitizedFilters.subCategory) filterOptions.subCategory = sanitizedFilters.subCategory;
      if (sanitizedFilters.isGrainFree !== undefined) filterOptions.isGrainFree = sanitizedFilters.isGrainFree;
      if (sanitizedFilters.highProtein !== undefined) filterOptions.highProtein = sanitizedFilters.highProtein;
      if (sanitizedFilters.search) filterOptions.search = sanitizedFilters.search;
      if (sanitizedFilters.sort) filterOptions.sort = sanitizedFilters.sort as any;
      if (sanitizedFilters.priceRange) filterOptions.priceRange = sanitizedFilters.priceRange;
      if (sanitizedFilters.minScoreFilter) filterOptions.minScoreFilter = sanitizedFilters.minScoreFilter;
      if (sanitizedFilters.brands) filterOptions.brands = sanitizedFilters.brands;
      if (sanitizedFilters.lifeStage) filterOptions.lifeStage = sanitizedFilters.lifeStage;
      if (sanitizedFilters.breedSize) filterOptions.breedSize = sanitizedFilters.breedSize;
      if (sanitizedFilters.specialDiet) filterOptions.specialDiet = sanitizedFilters.specialDiet;

      console.log('Final filterOptions passed to DB:', JSON.stringify(filterOptions, null, 2));

      const result = await cachedClient.getProducts(filterOptions);

      console.log('Result from DB:', { total: result.total, dataLength: result.data?.length, page: result.page });
      console.log('===== GraphQL products resolver END =====');

      // Transform the data to match GraphQL schema
      return {
        ...result,
        data: result.data.map(transformProduct),
      };
    },

    product: async (_: any, { slug }: any) => {
      const cachedClient = getCachedSupabaseClient();
      const result = await cachedClient.getProductBySlug(slug);
      return result ? transformProduct(result) : null;
    },

    productsByBrand: async (_: any, { brandSlug, filters }: any) => {
      const cachedClient = getCachedSupabaseClient();
      const brand = await cachedClient.getBrandBySlug(brandSlug);
      if (!brand) return null;

      const filterOptions: FilterOptions = {
        brandId: brand.id,
        ...filters,
      };

      const products = await cachedClient.getProducts(filterOptions);

      return {
        brand: transformBrand(brand),
        products: products.data.map(transformProduct),
        totalProducts: products.total,
      };
    },

    // Brands
    brands: async (_: any, { filters }: any) => {
      const cachedClient = getCachedSupabaseClient();
      const result = await cachedClient.getBrandsWithFilters({
        search: filters?.search,
        sort: filters?.sort as any,
        page: filters?.page || 1,
        limit: filters?.limit || 500,
        isFeatured: filters?.isFeatured,
        isSponsored: filters?.isSponsored,
      });
      return {
        data: result.data.map(transformBrand),
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      };
    },

    brand: async (_: any, { slug }: any) => {
      const cachedClient = getCachedSupabaseClient();
      const result = await cachedClient.getBrandBySlug(slug);
      return result ? transformBrand(result) : null;
    },

    featuredBrands: async () => {
      const cachedClient = getCachedSupabaseClient();
      const result = await cachedClient.getBrandsWithFilters({
        isFeatured: true,
        limit: 10,
      });
      return result.data.map(transformBrand);
    },

    // Search
    searchProducts: async (_: any, { query, filters }: any) => {
      const cachedClient = getCachedSupabaseClient();
      const filterOptions: FilterOptions = {
        search: query,
        ...filters,
      };
      const result = await cachedClient.getProducts(filterOptions);
      return {
        ...result,
        data: result.data.map(transformProduct),
      };
    },

    searchBrands: async (_: any, { query }: any) => {
      const cachedClient = getCachedSupabaseClient();
      const result = await cachedClient.getBrandsWithFilters({
        search: query,
        limit: 20,
      });
      return result.data.map(transformBrand);
    },

    // Tags
    tags: async () => {
      const cachedClient = getCachedSupabaseClient();
      const result = await cachedClient.getTags();
      return result;
    },

    tag: async (_: any, { slug }: any) => {
      const cachedClient = getCachedSupabaseClient();
      const tags = await cachedClient.getTags();
      const result = tags.find(tag => tag.slug === slug) || null;
      return result;
    },

    // Articles/Content
    articles: async () => {
      const cachedClient = getCachedSupabaseClient();
      const result = await cachedClient.getArticles();
      return result;
    },

    article: async (_: any, { slug }: any) => {
      const cachedClient = getCachedSupabaseClient();
      const articles = await cachedClient.getArticles();
      const result = articles.find(article => article.slug === slug) || null;
      return result;
    },

    // Comparisons
    comparisons: async () => {
      const cachedClient = getCachedSupabaseClient();
      const result = await cachedClient.getComparisons();
      return result;
    },

    comparison: async (_: any, { slug }: any) => {
      const cachedClient = getCachedSupabaseClient();
      const comparisons = await cachedClient.getComparisons();
      const result = comparisons.find(comparison => comparison.slug === slug) || null;
      return result;
    },
  },

  Mutation: {
    updateProduct: async (_: any, { id, input }: any) => {
      // Admin operation - would need authentication
      throw new Error('Not implemented');
    },

    updateBrand: async (_: any, { id, input }: any) => {
      // Admin operation - would need authentication
      throw new Error('Not implemented');
    },
  },

  // Field resolvers for relationships
  Product: {
    brand: async (parent: any) => {
      if (parent.brand) return parent.brand;
      const cachedClient = getCachedSupabaseClient();
      const result = await cachedClient.getBrandById(parent.brandId);
      return result ? transformBrand(result) : null;
    },

    tags: async (parent: any) => {
      if (parent.tags) return parent.tags;
      const cachedClient = getCachedSupabaseClient();
      const result = await cachedClient.getProductTags(parent.id);
      return result;
    },
  },
};