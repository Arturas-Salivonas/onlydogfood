// Core Types for OnlyDogFood.com

export interface Brand {
  id: string;
  slug: string;
  name: string;
  logo_url: string | null;
  website_url: string | null;
  country_of_origin: string | null;
  description: string | null;
  scrape_source_url: string | null;
  overall_score: number | null;
  total_products: number;
  is_featured: boolean;
  is_sponsored: boolean;
  sponsored_priority: number | null;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
}

export type BrandUpdate = Omit<Brand, 'id' | 'created_at' | 'updated_at' | 'total_products'>;

export interface Tag {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string;
  created_at: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  brand_id: string;
  brand?: Brand;
  tags?: Tag[];

  // Product details
  category: 'dry' | 'wet' | 'snack';
  sub_category: string | null;
  image_url: string | null;
  package_size_g: number | null;
  price_gbp: number | null;
  price_per_kg_gbp: number | null;

  // Nutritional data
  protein_percent: number | null;
  fat_percent: number | null;
  fiber_percent: number | null;
  ash_percent: number | null;
  moisture_percent: number | null;
  carbs_percent: number | null;
  calories_per_100g: number | null;

  // Ingredients
  ingredients_raw: string | null;
  ingredients_list: string[] | null;
  meat_content_percent: number | null;

  // Scoring
  overall_score: number | null;
  ingredient_score: number | null;
  nutrition_score: number | null;
  value_score: number | null;
  scoring_breakdown: ScoringBreakdown | null;

  // Metadata
  scrape_source_url: string | null;
  last_scraped_at: string | null;
  is_available: boolean;
  is_sponsored: boolean;
  sponsored_priority: number | null;
  affiliate_url: string | null;
  discount_code: string | null;
  discount_description: string | null;

  // SEO
  meta_title: string | null;
  meta_description: string | null;

  // Timestamps
  created_at: string;
  updated_at: string;
}

export type ProductUpdate = Omit<Product, 'id' | 'created_at' | 'updated_at' | 'price_per_kg_gbp' | 'overall_score' | 'ingredient_score' | 'nutrition_score' | 'value_score' | 'scoring_breakdown' | 'last_scraped_at'>;

export interface ScoringBreakdown {
  ingredientScore: number;
  nutritionScore: number;
  valueScore: number;
  details?: {
    highMeatContent?: number;
    noFillers?: number;
    noArtificialAdditives?: number;
    namedMeatSources?: number;
    highProtein?: number;
    moderateFat?: number;
    lowCarbs?: number;
    valueRating?: number;
  };
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  featuredImageUrl: string | null;
  category: 'methodology' | 'guide' | 'news';
  author: string;
  isPublished: boolean;
  publishedAt: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Comparison {
  id: string;
  slug: string;
  productIds: string[];
  viewCount: number;
  createdAt: string;
}

export interface ExchangeRate {
  id: string;
  currencyCode: string;
  rateToGbp: number;
  updatedAt: string;
}

export interface ScrapeLog {
  id: string;
  scrapeType: 'products' | 'brands' | 'content';
  status: 'started' | 'completed' | 'failed';
  itemsScraped: number;
  errors: any | null;
  startedAt: string;
  completedAt: string | null;
}

export interface FilterOptions {
  category?: 'dry' | 'wet' | 'snack' | 'all';
  brandId?: string;
  minScore?: number;
  maxScore?: number;
  minPrice?: number;
  maxPrice?: number;
  subCategory?: string;
  isGrainFree?: boolean;
  highProtein?: boolean;
  search?: string;
  sort?: 'score-desc' | 'score-asc' | 'price-asc' | 'price-desc' | 'newest' | 'name-asc';
  page?: number;
  limit?: number;
  priceRange?: string;
  minScoreFilter?: string;
  brands?: string[];
  lifeStage?: string;
  breedSize?: string;
  specialDiet?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type Currency = 'GBP' | 'USD' | 'EUR' | 'AUD';

export interface CurrencyContext {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  convertPrice: (priceGbp: number) => number;
  formatPrice: (priceGbp: number) => string;
}
