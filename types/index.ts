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
  food_category?: 'dry' | 'wet' | 'cold-pressed' | 'fresh' | 'raw' | 'snack'; // v2.1: For category-anchored pricing
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

  // v3.0: Structured ingredient tracking
  total_ingredients_count?: number | null;
  ingredients_analyzed?: boolean | null;
  declared_percentages_count?: number | null;
  has_ingredient_splitting?: boolean | null;
  has_filler_stuffing?: boolean | null;
  effective_meat_percent?: number | null;
  total_filler_percent?: number | null;

  // v3.0: Related data (populated when needed)
  structured_ingredients?: ProductIngredient[];
  ingredient_groups?: ProductIngredientGroup[];

  // Scoring (v2.1)
  overall_score: number | null;
  ingredient_score: number | null;
  nutrition_score: number | null;
  value_score: number | null;
  scoring_breakdown: ScoringBreakdown | null;
  confidence_score?: number | null;          // v2.1: Transparency score (0-100)
  confidence_level?: 'High' | 'Medium' | 'Low' | null; // v2.1: Confidence level
  star_rating?: number | null;               // v2.1: Final star rating (1-5)
  red_flag_override?: {                      // v2.1: Red flag override info
    maxRating: number;
    reason: string;
  } | null;

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
  redFlags?: string[];
  details?: {
    // Ingredient scoring details
    effectiveMeatContent?: number;
    freshMeatPenalty?: number;
    lowValueFillers?: number;
    highRiskFillerPenalty?: number;
    lowValueCarbPenalty?: number;
    brownRicePenalty?: number;
    grainFirstPenalty?: number;
    grainHeavyPenalty?: number;
    grainTop3Penalty?: number;
    grainTop5Penalty?: number;
    brownRiceFirstPenalty?: number;
    brownRiceTop3Penalty?: number;
    noArtificialAdditives?: number;
    artificialAdditivePenalty?: number;
    redFlagAdditive?: number;
    artificialColorPenalty?: number;
    preservativePenalty?: number;
    controversialAdditivePenalty?: number;
    namedMeatSources?: number;
    processingQuality?: number;
    processingPenalty?: number;
    ingredientLevelBonus?: number;
    ingredientBonusRaw?: number;
    ingredientSplittingPenalty?: number;
    fillerStuffingPenalty?: number;
    excessiveIngredientsPenalty?: number;

    // Nutrition scoring details
    proteinQuality?: number;
    proteinIntegrityPenalty?: number;
    proteinDiversity?: number;
    proteinDiversityDetails?: {
      diversity: string;
      uniqueProteinTypes: number;
      proteinSources?: string[];
    };
    plantProteinPenalty?: number;
    moderateFat?: number;
    highFatPenalty?: number;
    lowCarbs?: number;
    vegetableCarbsBonus?: number;
    appropriateFiber?: number;
    fiberScore?: number;
    micronutrientScore?: number;

    // Value scoring details
    valueRating?: number;
    ingredientValueScore?: number;

    // Legacy fields (for backward compatibility)
    highMeatContent?: number;
    noFillers?: number;
    highProtein?: number;
  };
}

// v2.2: Dry Matter metrics
export interface DryMatterMetrics {
  dmPercent: number;
  proteinDM: number | null;
  fatDM: number | null;
  fiberDM: number | null;
  carbsDM: number | null;
  usedDefaults: {
    moisture: boolean;
    ash: boolean;
  };
}

// v2.2: Nutrition metadata
export interface NutritionMeta {
  carbsProvided: boolean;
  carbsEstimated: boolean;
  ashProvided: boolean;
  ashEstimated: boolean;
  moistureProvided: boolean;
  moistureEstimated: boolean;
  usedDryMatterBasis: boolean;
}

// v2.2: Energy metrics
export interface EnergyMetrics {
  kcalPer100g: number | null;
  kcalPerKg: number | null;
  pricePer1000kcal: number | null;
  usedAtwaterEstimate: boolean;
}

// v2.2: Split ingredient group detection
export interface SplitIngredientGroup {
  groupName: string;
  countInTop10: number;
  tokensMatched: string[];
}

export interface SplitIngredientPenalty {
  penalty: number;
  groupsTriggered: SplitIngredientGroup[];
}

// v2.2: Position-weighted ingredient match
export interface IngredientMatch {
  ingredient: string;
  category: string;
  basePoints: number;
  positionIndex: number;
  positionMultiplier: number;
  weightedPoints: number;
  description: string;
}

// v2.2: Ingredient analysis result
export interface IngredientAnalysis {
  bonusRaw: number;
  bonusWeighted: number;
  bonusApplied: number;
  matches: IngredientMatch[];
  breakdown: Record<string, number>;
  breakdownWeighted: Record<string, number>;
  splitPenalty: SplitIngredientPenalty;
}

// v2.2: Red flag detection
export interface RedFlagDetection {
  ruleId: string;
  tier: number;
  capStars: number;
  reason: string;
  matchedTokens: string[];
}

// ==============================================
// v3.0: Structured Ingredient System
// ==============================================

export interface ProductIngredient {
  id: string;
  product_id: string;

  // Position & Identification
  position: number;
  ingredient_name: string;
  ingredient_normalized: string;

  // Percentage Data
  percentage_declared: number | null;
  percentage_estimated: number | null;
  percentage_confidence: 'declared' | 'estimated-high' | 'estimated-medium' | 'estimated-low' | 'unknown';

  // Classification
  category: 'meat' | 'meal' | 'grain' | 'vegetable' | 'fruit' | 'fat' | 'additive' | 'supplement' | 'other' | null;
  subcategory: string | null;
  quality_tier: 'premium' | 'standard' | 'low-quality' | 'filler' | 'unknown' | null;

  // Flags
  is_meat_source: boolean;
  is_protein_source: boolean;
  is_filler: boolean;
  is_artificial: boolean;
  is_controversial: boolean;

  // Additional metadata
  notes: string | null;
  manually_verified: boolean;

  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface IngredientGroupMember {
  id: string;
  name: string;
  percentage: number | null;
  position: number;
}

export interface ProductIngredientGroup {
  id: string;
  product_id: string;

  // Group identification
  group_type: string;
  group_category: string;

  // Aggregated data
  total_percentage: number | null;
  ingredient_count: number;
  highest_position: number;
  average_position: number | null;

  // Individual members
  member_ingredients: IngredientGroupMember[];

  // Split detection flags
  is_split_suspected: boolean;
  split_severity: 'none' | 'mild' | 'moderate' | 'severe' | null;

  // Timestamps
  created_at: string;
  updated_at: string;
}

// v3.0: Enhanced meat content analysis
export interface MeatContentAnalysisV3 {
  totalDeclaredMeat: number;
  totalEstimatedMeat: number;

  // Fresh meat moisture adjustment
  freshMeatRaw: number;
  freshMeatAdjusted: number;

  // Meal/dehydrated (concentrated)
  mealMeatRaw: number;
  mealMeatAdjusted: number;

  // Combined true meat content
  effectiveMeatProtein: number;

  // Split detection
  meatSourceCount: number;
  meatSources: ProductIngredient[];
  isSplitSuspected: boolean;
  splitPenalty: number;
}

// v3.0: Enhanced filler analysis
export interface FillerAnalysisV3 {
  totalFillerCount: number;
  highRiskFillerCount: number;
  lowValueCarbCount: number;

  // Percentage Analysis
  totalFillerPercentage: number;
  fillerStuffingDetected: boolean;

  // Position Analysis
  fillersInTop5: number;
  fillersInTop10: number;
  fillersAfter10: number;

  // Cumulative Impact
  fillerDensity: number;

  // Details
  fillerIngredients: ProductIngredient[];
}

// v3.0: Protein source analysis
export interface ProteinSourceAnalysisV3 {
  totalProtein: number;

  // Source breakdown
  proteinFromMeat: number;
  proteinFromPlantProtein: number;
  proteinFromGluten: number;
  proteinFromOther: number;

  // Quality metrics
  animalProteinRatio: number;
  meatQualityScore: number;

  // Integrity check
  hasProteinSpiking: boolean;
}

// v3.0: Absolute quantities per package
export interface AbsoluteQuantitiesV3 {
  packageSize: number;

  // Per package
  totalMeatGrams: number;
  totalProteinGrams: number;
  totalFillerGrams: number;

  // Per serving (400g for medium dog)
  meatPerServing: number;
  proteinPerServing: number;

  // Comparisons
  daysOfFood: number;
  totalServings: number;
  valuePerServing: number;
}

// v2.2: Confidence breakdown
export interface ConfidenceBreakdown {
  ingredientDisclosure: number;
  nutritionCompleteness: number;
  energyTransparency: number;
  carbsTransparency: number;
  sourcingTransparency: number;
  manufacturingInfo: number;
  details: string[];
}

// v2.2: Complete scoring result
export interface ScoringResult {
  algorithmVersion: string;
  overallScore: number;
  ingredientScore: number;
  nutritionScore: number;
  valueScore: number;
  breakdown: ScoringBreakdown;

  // v2.2: New metrics
  dmMetrics?: DryMatterMetrics;
  nutritionMeta?: NutritionMeta;
  energyMetrics?: EnergyMetrics;
  ingredientAnalysis?: IngredientAnalysis;

  // Confidence & red flags
  confidenceScore: number;
  confidenceLevel: 'High' | 'Medium' | 'Low';
  confidenceBreakdown?: ConfidenceBreakdown;
  redFlagsDetected?: RedFlagDetection[];
  finalStarCapApplied?: number | null;

  // Warnings
  warnings?: string[];
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
