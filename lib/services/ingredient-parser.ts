/**
 * Ingredient Parsing Service (Algorithm v3.0)
 *
 * Parses raw ingredient text into structured format with:
 * - Individual ingredient extraction
 * - Percentage estimation
 * - Category classification
 * - Quality tier assignment
 * - Flag detection (meat, filler, artificial, etc.)
 */

import type { ProductIngredient } from '@/types';

// ==============================================
// CONFIGURATION
// ==============================================

// Percentage estimation based on FDA/AAFCO rules
// Ingredients are listed in descending order by weight
const POSITION_PERCENTAGE_ESTIMATES = {
  1: { min: 25, max: 50, confidence: 'estimated-medium' },
  2: { min: 15, max: 25, confidence: 'estimated-medium' },
  3: { min: 10, max: 18, confidence: 'estimated-medium' },
  4: { min: 5, max: 12, confidence: 'estimated-low' },
  5: { min: 4, max: 8, confidence: 'estimated-low' },
  6: { min: 3, max: 6, confidence: 'estimated-low' },
  7: { min: 2, max: 5, confidence: 'estimated-low' },
  8: { min: 1.5, max: 4, confidence: 'estimated-low' },
  9: { min: 1, max: 3, confidence: 'estimated-low' },
  10: { min: 0.8, max: 2, confidence: 'estimated-low' },
} as const;

// ==============================================
// INGREDIENT CLASSIFICATION KEYWORDS
// ==============================================

// Meat type keywords - for identifying animal protein sources
const MEAT_ANIMALS = [
  'chicken', 'turkey', 'duck', 'goose', 'pheasant', 'quail', 'guinea fowl', 'poultry',
  'beef', 'lamb', 'pork', 'veal', 'venison', 'bison', 'buffalo', 'wild boar',
  'rabbit', 'kangaroo', 'goat', 'reindeer', 'ostrich', 'emu',
  'salmon', 'trout', 'herring', 'mackerel', 'sardine', 'anchovy', 'hake',
  'whitefish', 'cod', 'pollock', 'haddock', 'tuna', 'fish'
];

// Organ meat keywords
const ORGAN_MEATS = [
  'liver', 'heart', 'kidney', 'spleen', 'lung', 'tripe', 'brain',
  'gizzard', 'giblets', 'offal', 'organ'
];

// Fats and oils
const FATS_OILS = [
  'chicken fat', 'beef fat', 'pork fat', 'lamb fat', 'duck fat', 'turkey fat', 'animal fat',
  'salmon oil', 'fish oil', 'cod liver oil', 'herring oil', 'anchovy oil', 'krill oil', 'pollock oil',
  'flaxseed oil', 'flax seed oil', 'canola oil', 'sunflower oil', 'vegetable oil', 'coconut oil',
  'linseed oil', 'hemp seed oil', 'algal oil', 'dha oil', 'epa oil'
];

// Grains (includes all types - high and low GI)
const GRAINS = [
  'rice', 'brown rice', 'white rice', 'ground rice',
  'maize', 'corn', 'ground corn', 'corn meal',
  'wheat', 'whole wheat', 'wheat flour', 'wheat gluten',
  'barley', 'whole barley', 'pearled barley',
  'oats', 'oatmeal', 'whole oats', 'steel-cut oats',
  'sorghum', 'millet', 'rye', 'spelt', 'quinoa', 'buckwheat', 'amaranth'
];

// Legumes and beans
const LEGUMES = [
  'peas', 'green peas', 'garden peas', 'pea protein', 'pea flour', 'pea starch', 'pea fiber', 'pea fibre',
  'lentils', 'red lentils', 'green lentils', 'lentil fiber', 'lentil fibre',
  'chickpeas', 'garbanzo beans', 'pinto beans', 'navy beans', 'black beans', 'kidney beans',
  'soybeans', 'soy', 'soya'
];

// Vegetables
const VEGETABLES = [
  'carrot', 'carrots', 'sweet potato', 'sweet potatoes', 'potato', 'potatoes',
  'pumpkin', 'butternut squash', 'zucchini', 'courgette',
  'spinach', 'kale', 'broccoli', 'asparagus', 'brussels sprouts', 'chard',
  'celery', 'cucumber', 'beets', 'beetroot', 'beet greens', 'turnip greens',
  'parsnips', 'parsnip'
];

// Fruits
const FRUITS = [
  'apple', 'apples', 'pear', 'pears', 'banana', 'bananas',
  'blueberry', 'blueberries', 'cranberry', 'cranberries',
  'strawberry', 'strawberries', 'raspberry', 'raspberries', 'blackberry', 'blackberries',
  'pomegranate', 'acai', 'goji', 'aronia', 'bilberry', 'saskatoon'
];

// Supplements and additives
const SUPPLEMENTS = [
  'vitamin', 'mineral', 'zinc', 'calcium', 'iron', 'copper', 'manganese',
  'selenium', 'iodine', 'magnesium', 'phosphorus', 'potassium', 'sodium',
  'glucosamine', 'chondroitin', 'msm', 'collagen',
  'probiotic', 'prebiotic', 'lactobacillus', 'bifidobacterium', 'enterococcus',
  'fos', 'mos', 'fructooligosaccharide', 'mannanoligosaccharide',
  'yucca', 'chicory', 'inulin', 'taurine', 'carnitine', 'dl-methionine'
];

// Artificial additives
const ARTIFICIAL = {
  colors: ['artificial color', 'artificial colour', 'red 40', 'yellow 5', 'yellow 6', 'blue 2', 'caramel color'],
  preservatives: ['bha', 'bht', 'tbhq', 'propyl gallate', 'ethoxyquin', 'propylene glycol'],
  controversial: ['carrageenan', 'guar gum', 'xanthan gum', 'sodium selenite', 'menadione'],
};

// Fillers and by-products
const FILLERS = {
  highRisk: ['corn gluten meal', 'wheat gluten', 'soy protein isolate', 'by-product', 'poultry by-product', 'meat by-product'],
  lowValueCarbs: ['white rice', 'maize', 'tapioca', 'corn', 'wheat', 'wheat flour'],
  acceptableCarbs: ['oats', 'barley', 'brown rice', 'quinoa', 'sweet potato'],
};

// ==============================================
// HELPER FUNCTIONS
// ==============================================

/**
 * Normalize ingredient text for matching
 */
function normalizeIngredient(text: string): string {
  return text
    .toLowerCase()
    .trim()
    // Remove dosage information like (200mg/kg), (1600mg/kg), etc.
    .replace(/\(\d+(?:\.\d+)?\s*(?:mg|g|mcg|iu|cfu)(?:\/kg)?\)/gi, '')
    // Remove percentage information
    .replace(/\([^)]*%[^)]*\)/g, '')
    // Remove other parentheses content (but keep track for penalty detection)
    .replace(/\([^)]*\)/g, '')
    .replace(/[.,;!?()[\]{}]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Detect if ingredient has ambiguous/misleading notation
 * Examples: "Chicken (Chicken Meal)", "Liver (Heart)", "Fish (Salmon)"
 */
function hasAmbiguousNotation(text: string): boolean {
  // Check for pattern: Word (Different Word) where both are meat-related
  const ambiguousPattern = /([a-z]+)\s*\(([a-z\s]+)\)/i;
  const match = text.match(ambiguousPattern);

  if (match) {
    const outer = match[1].toLowerCase().trim();
    const inner = match[2].toLowerCase().trim();

    // If both parts are meat animals or ingredients, this is ambiguous
    const isMeatOuter = MEAT_ANIMALS.some(m => outer.includes(m)) || ORGAN_MEATS.some(o => outer.includes(o));
    const isMeatInner = MEAT_ANIMALS.some(m => inner.includes(m)) || ORGAN_MEATS.some(o => inner.includes(o));

    if (isMeatOuter && isMeatInner) {
      return true;
    }
  }

  return false;
}

/**
 * Extract declared percentage from ingredient text
 * Examples: "Chicken (20%)", "Chicken 20%", "Chicken (min 20%)"
 */
function extractDeclaredPercentage(text: string): number | null {
  // Match patterns like (20%), 20%, (min 20%), (minimum 20%)
  const patterns = [
    /\((\d+(?:\.\d+)?)\s*%\)/,           // (20%)
    /(\d+(?:\.\d+)?)\s*%/,                // 20%
    /\(min(?:imum)?\s+(\d+(?:\.\d+)?)\s*%\)/i,  // (min 20%)
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const percentage = parseFloat(match[1]);
      if (!isNaN(percentage) && percentage >= 0 && percentage <= 100) {
        return percentage;
      }
    }
  }

  return null;
}

/**
 * Estimate percentage based on position
 */
function estimatePercentage(position: number, totalIngredients: number): number {
  // For positions 1-10, use lookup table
  if (position <= 10) {
    const estimate = POSITION_PERCENTAGE_ESTIMATES[position as keyof typeof POSITION_PERCENTAGE_ESTIMATES];
    if (estimate) {
      // Use midpoint of range
      return (estimate.min + estimate.max) / 2;
    }
  }

  // For position 11-20: 0.5-1.5%
  if (position <= 20) {
    return 1.0 - ((position - 10) * 0.05);
  }

  // For position 21+: <0.5% (trace amounts)
  return Math.max(0.1, 0.5 - ((position - 20) * 0.02));
}

/**
 * Get confidence level for percentage
 */
function getPercentageConfidence(
  position: number,
  hasDeclared: boolean
): ProductIngredient['percentage_confidence'] {
  if (hasDeclared) return 'declared';

  if (position <= 3) return 'estimated-medium';
  if (position <= 10) return 'estimated-low';
  return 'unknown';
}

/**
 * Classify ingredient category using comprehensive keyword matching
 */
function classifyCategory(normalizedName: string, originalName: string): ProductIngredient['category'] {
  const lower = normalizedName.toLowerCase();

  // 1. Check for FATS and OILS first (most specific)
  if (FATS_OILS.some(fat => lower.includes(fat)) ||
      (lower.includes('fat') || lower.includes('oil'))) {
    return 'fat';
  }

  // 2. Check for GRAINS (including maize/corn)
  if (GRAINS.some(grain => lower.includes(grain))) {
    return 'grain';
  }

  // 3. Check for MEAT sources (fresh, raw, dehydrated, meal)
  // Check if contains any meat animal name
  const hasMeatAnimal = MEAT_ANIMALS.some(animal => lower.includes(animal));
  const hasOrganMeat = ORGAN_MEATS.some(organ => lower.includes(organ));

  if (hasMeatAnimal || hasOrganMeat) {
    // Determine if it's a meal (dehydrated/concentrated) or fresh meat
    if (lower.includes('meal') ||
        lower.includes('dehydrated') ||
        lower.includes('dried') ||
        lower.includes('concentrate')) {
      return 'meal';
    }
    // Otherwise it's fresh/raw meat
    return 'meat';
  }

  // 4. Check for EGGS
  if (lower.includes('egg')) {
    return 'meat'; // Eggs categorized with meat for protein scoring
  }

  // 5. Check for LEGUMES (peas, lentils, beans)
  if (LEGUMES.some(legume => lower.includes(legume))) {
    return 'vegetable'; // Legumes are vegetable protein sources
  }

  // 6. Check for VEGETABLES
  if (VEGETABLES.some(veg => lower.includes(veg))) {
    return 'vegetable';
  }

  // 7. Check for FRUITS
  if (FRUITS.some(fruit => lower.includes(fruit))) {
    return 'fruit';
  }

  // 8. Check for SUPPLEMENTS
  if (SUPPLEMENTS.some(supp => lower.includes(supp))) {
    return 'supplement';
  }

  // 9. Check for ADDITIVES/PRESERVATIVES
  if ([...ARTIFICIAL.colors, ...ARTIFICIAL.preservatives, ...ARTIFICIAL.controversial]
    .some(additive => lower.includes(additive))) {
    return 'additive';
  }

  // 10. Default to 'other' if no match
  return 'other';
}

/**
 * Determine quality tier based on subcategory and category
 */
function determineQualityTier(
  normalizedName: string,
  subcategory: string | null,
  category: ProductIngredient['category']
): ProductIngredient['quality_tier'] {
  // Premium meat sources
  if (category === 'meat' || category === 'meal') {
    // Unnamed sources are low quality
    if (subcategory === 'unnamed-source') {
      return 'low-quality';
    }
    // Fresh, raw, and dehydrated/meal are premium
    if (subcategory === 'fresh-meat' || subcategory === 'raw-meat' || subcategory === 'meal') {
      return 'premium';
    }
    // Named meats are standard-premium
    return 'standard';
  }

  // Fillers
  if (FILLERS.highRisk.some(filler => normalizedName.includes(filler))) {
    return 'filler';
  }

  if (FILLERS.lowValueCarbs.some(carb => normalizedName.includes(carb))) {
    return 'low-quality';
  }

  if (FILLERS.acceptableCarbs.some(carb => normalizedName.includes(carb))) {
    return 'standard';
  }

  return 'unknown';
}

/**
 * Determine subcategory for detailed classification
 * This helps identify Fresh, Raw, Dehydrated, etc. for bonus scoring
 */
function determineSubcategory(
  normalizedName: string,
  originalName: string,
  category: ProductIngredient['category']
): string | null {
  const lower = normalizedName.toLowerCase();
  const originalLower = originalName.toLowerCase();

  if (category === 'meat' || category === 'meal') {
    // Check for FRESH meats (gets bonus)
    if (originalLower.includes('fresh') ||
        originalLower.includes('deboned') ||
        originalLower.includes('freshly prepared')) {
      return 'fresh-meat';
    }

    // Check for RAW meats (gets bonus)
    if (originalLower.includes('raw')) {
      return 'raw-meat';
    }

    // Check for DEHYDRATED/MEAL (concentrated protein, gets bonus)
    if (lower.includes('meal') ||
        lower.includes('dehydrated') ||
        lower.includes('dried')) {
      return 'meal';
    }

    // Check for ORGAN meats
    if (ORGAN_MEATS.some(organ => lower.includes(organ))) {
      return 'organ';
    }

    // Check for unnamed/generic sources (gets penalty)
    if (lower === 'meat' ||
        lower === 'poultry' ||
        lower === 'animal protein' ||
        lower.includes('meat meal') ||
        lower.includes('poultry meal')) {
      return 'unnamed-source';
    }

    // Regular named meat
    return 'named-meat';
  }

  if (category === 'fat') {
    // Named fat source is better than generic
    if (MEAT_ANIMALS.some(animal => lower.includes(animal))) {
      return 'named-fat';
    }
    return 'fat';
  }

  return null;
}

/**
 * Check if ingredient is a meat source
 */
function isMeatSource(normalizedName: string): boolean {
  return MEAT_ANIMALS.some(animal => normalizedName.includes(animal)) ||
         ORGAN_MEATS.some(organ => normalizedName.includes(organ)) ||
         normalizedName.includes('egg');
}

/**
 * Check if ingredient is a protein source
 */
function isProteinSource(normalizedName: string): boolean {
  return isMeatSource(normalizedName) ||
    normalizedName.includes('protein') ||
    normalizedName.includes('meal') ||
    LEGUMES.some(legume => normalizedName.includes(legume));
}

/**
 * Check if ingredient is a filler
 */
function isFiller(normalizedName: string): boolean {
  return [...FILLERS.highRisk, ...FILLERS.lowValueCarbs].some(filler =>
    normalizedName.includes(filler)
  );
}

/**
 * Check if ingredient is artificial
 */
function isArtificial(normalizedName: string): boolean {
  return [...ARTIFICIAL.colors, ...ARTIFICIAL.preservatives].some(additive =>
    normalizedName.includes(additive)
  );
}

/**
 * Check if ingredient is controversial
 */
function isControversial(normalizedName: string): boolean {
  return ARTIFICIAL.controversial.some(additive =>
    normalizedName.includes(additive)
  );
}

// ==============================================
// MAIN PARSING FUNCTION
// ==============================================

export interface ParsedIngredient {
  position: number;
  ingredient_name: string;
  ingredient_normalized: string;
  percentage_declared: number | null;
  percentage_estimated: number;
  percentage_confidence: ProductIngredient['percentage_confidence'];
  category: ProductIngredient['category'];
  subcategory: string | null;
  quality_tier: ProductIngredient['quality_tier'];
  is_meat_source: boolean;
  is_protein_source: boolean;
  is_filler: boolean;
  is_artificial: boolean;
  is_controversial: boolean;
}

/**
 * Parse ingredient text into structured format
 *
 * @param ingredientsRaw - Raw comma-separated ingredient text
 * @returns Array of parsed ingredients with classifications
 */
export function parseIngredients(ingredientsRaw: string): ParsedIngredient[] {
  if (!ingredientsRaw || !ingredientsRaw.trim()) {
    return [];
  }

  // Split by commas and semicolons
  const rawIngredients = ingredientsRaw
    .split(/[,;]/)
    .map(ing => ing.trim())
    .filter(ing => ing.length > 0);

  const totalCount = rawIngredients.length;
  const parsed: ParsedIngredient[] = [];

  for (let i = 0; i < rawIngredients.length; i++) {
    const position = i + 1;
    const rawText = rawIngredients[i];

    // Extract declared percentage if present
    const declaredPercentage = extractDeclaredPercentage(rawText);

    // Clean ingredient name:
    // 1. Remove percentage notation
    // 2. Remove dosage information like (200mg/kg)
    // 3. Remove trailing periods
    // 4. Keep original text for subcategory detection (Fresh/Raw)
    const cleanName = rawText
      .replace(/\(\d+(?:\.\d+)?\s*%\)/g, '')
      .replace(/\d+(?:\.\d+)?\s*%/g, '')
      .replace(/\(min(?:imum)?\s+\d+(?:\.\d+)?\s*%\)/gi, '')
      // Remove dosage info like (200mg/kg), (1600mg/kg)
      .replace(/\(\d+(?:\.\d+)?\s*(?:mg|g|mcg|iu|cfu)(?:\/kg)?\)/gi, '')
      // Remove trailing period
      .replace(/\.$/, '')
      .trim();

    const normalized = normalizeIngredient(cleanName);

    // Estimate percentage if not declared
    const estimatedPercentage = declaredPercentage || estimatePercentage(position, totalCount);
    const percentageConfidence = getPercentageConfidence(position, declaredPercentage !== null);

    // Classify ingredient (pass both normalized and original for better detection)
    const category = classifyCategory(normalized, cleanName);
    const subcategory = determineSubcategory(normalized, cleanName, category);
    const qualityTier = determineQualityTier(normalized, subcategory, category);

    // Set flags
    const isMeat = isMeatSource(normalized);
    const isProtein = isProteinSource(normalized);
    const isFillerIng = isFiller(normalized);
    const isArtificialIng = isArtificial(normalized);
    const isControversialIng = isControversial(normalized);

    parsed.push({
      position,
      ingredient_name: cleanName,
      ingredient_normalized: normalized,
      percentage_declared: declaredPercentage,
      percentage_estimated: estimatedPercentage,
      percentage_confidence: percentageConfidence,
      category,
      subcategory,
      quality_tier: qualityTier,
      is_meat_source: isMeat,
      is_protein_source: isProtein,
      is_filler: isFillerIng,
      is_artificial: isArtificialIng,
      is_controversial: isControversialIng,
    });
  }

  return parsed;
}

/**
 * Calculate normalized percentages to sum to 100%
 * Useful when estimated percentages don't add up exactly
 */
export function normalizePercentages(ingredients: ParsedIngredient[]): ParsedIngredient[] {
  const total = ingredients.reduce((sum, ing) => sum + ing.percentage_estimated, 0);

  if (total === 0) return ingredients;

  return ingredients.map(ing => ({
    ...ing,
    percentage_estimated: (ing.percentage_estimated / total) * 100,
  }));
}

/**
 * Example usage
 */
export function exampleUsage() {
  const raw = "Chicken (20%), Rice, Chicken Meal (8%), Peas, Dried Chicken (5%), Corn";
  const parsed = parseIngredients(raw);

  console.log('Parsed ingredients:', parsed);
  return parsed;
}
