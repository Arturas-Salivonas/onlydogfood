/**
 * Ingredient Group Detection Service (Algorithm v3.0)
 *
 * Detects:
 * - Ingredient splitting (same protein source in multiple forms)
 * - Filler stuffing (many low-percentage ingredients)
 * - Creates ingredient groups for analysis
 */

import type { ProductIngredientGroup, IngredientGroupMember } from '@/types';
import type { ParsedIngredient } from './ingredient-parser';

// ==============================================
// GROUP DETECTION RULES
// ==============================================

// Define ingredient families that might be split
const INGREDIENT_FAMILIES = {
  'chicken-sources': ['chicken', 'poultry'],
  'beef-sources': ['beef'],
  'lamb-sources': ['lamb'],
  'turkey-sources': ['turkey'],
  'duck-sources': ['duck'],
  'fish-sources': ['fish', 'salmon', 'tuna', 'whitefish'],
  'pork-sources': ['pork'],
  'rice-types': ['rice'],
  'corn-derivatives': ['corn', 'maize'],
  'wheat-derivatives': ['wheat'],
  'potato-types': ['potato'],
  'pea-derivatives': ['pea'],
};

// Split severity thresholds
const SPLIT_SEVERITY = {
  none: { minCount: 0, maxCount: 1 },
  mild: { minCount: 2, maxCount: 2 },
  moderate: { minCount: 3, maxCount: 3 },
  severe: { minCount: 4, maxCount: 999 },
} as const;

// Filler stuffing detection
const FILLER_STUFFING_THRESHOLDS = {
  microFillerPercentage: 1.0,      // Ingredients <1%
  minMicroFillerCount: 20,         // Need 20+ micro fillers
  minTotalFillerCount: 30,         // And 30+ total fillers
};

// ==============================================
// HELPER FUNCTIONS
// ==============================================

/**
 * Check if ingredient belongs to a family
 */
function belongsToFamily(normalizedName: string, familyKeywords: string[]): boolean {
  return familyKeywords.some(keyword => normalizedName.includes(keyword));
}

/**
 * Get ingredient family
 */
function getIngredientFamily(normalizedName: string): string | null {
  for (const [familyName, keywords] of Object.entries(INGREDIENT_FAMILIES)) {
    if (belongsToFamily(normalizedName, keywords)) {
      return familyName;
    }
  }
  return null;
}

/**
 * Determine split severity based on count
 */
function determineSplitSeverity(count: number): 'none' | 'mild' | 'moderate' | 'severe' {
  if (count >= SPLIT_SEVERITY.severe.minCount) return 'severe';
  if (count >= SPLIT_SEVERITY.moderate.minCount) return 'moderate';
  if (count >= SPLIT_SEVERITY.mild.minCount) return 'mild';
  return 'none';
}

/**
 * Determine group category based on ingredients
 */
function determineGroupCategory(familyType: string): string {
  if (familyType.includes('sources')) return 'meat';
  if (familyType.includes('rice') || familyType.includes('corn') ||
      familyType.includes('wheat') || familyType.includes('potato')) return 'grain';
  if (familyType.includes('pea')) return 'vegetable';
  return 'other';
}

// ==============================================
// GROUP DETECTION
// ==============================================

export interface DetectedGroup {
  group_type: string;
  group_category: string;
  members: IngredientGroupMember[];
  total_percentage: number;
  ingredient_count: number;
  highest_position: number;
  average_position: number;
  is_split_suspected: boolean;
  split_severity: 'none' | 'mild' | 'moderate' | 'severe';
}

/**
 * Detect ingredient groups from parsed ingredients
 */
export function detectIngredientGroups(
  ingredients: ParsedIngredient[],
  productId: string
): DetectedGroup[] {
  const groups: Map<string, DetectedGroup> = new Map();

  // Group ingredients by family
  for (const ingredient of ingredients) {
    const family = getIngredientFamily(ingredient.ingredient_normalized);

    if (!family) continue;

    // Get or create group
    let group = groups.get(family);
    if (!group) {
      group = {
        group_type: family,
        group_category: determineGroupCategory(family),
        members: [],
        total_percentage: 0,
        ingredient_count: 0,
        highest_position: 999,
        average_position: 0,
        is_split_suspected: false,
        split_severity: 'none',
      };
      groups.set(family, group);
    }

    // Add member
    const percentage = ingredient.percentage_declared || ingredient.percentage_estimated;
    group.members.push({
      id: '', // Will be filled when saved to DB
      name: ingredient.ingredient_name,
      percentage,
      position: ingredient.position,
    });

    group.total_percentage += percentage;
    group.ingredient_count++;
    group.highest_position = Math.min(group.highest_position, ingredient.position);
  }

  // Calculate averages and detect splits
  for (const group of groups.values()) {
    // Calculate average position
    const totalPositions = group.members.reduce((sum, m) => sum + m.position, 0);
    group.average_position = totalPositions / group.members.length;

    // Determine if split is suspected (2+ ingredients from same family)
    const severity = determineSplitSeverity(group.ingredient_count);
    group.is_split_suspected = severity !== 'none';
    group.split_severity = severity;
  }

  // Return only groups with 2+ members (potential splits)
  return Array.from(groups.values()).filter(g => g.ingredient_count >= 2);
}

// ==============================================
// FILLER STUFFING DETECTION
// ==============================================

export interface FillerStuffingAnalysis {
  isDetected: boolean;
  microFillerCount: number;
  totalFillerCount: number;
  totalFillerPercentage: number;
  microFillers: ParsedIngredient[];
}

/**
 * Detect filler stuffing pattern
 */
export function detectFillerStuffing(ingredients: ParsedIngredient[]): FillerStuffingAnalysis {
  const fillerIngredients = ingredients.filter(ing => ing.is_filler);

  const microFillers = fillerIngredients.filter(ing =>
    ing.percentage_estimated < FILLER_STUFFING_THRESHOLDS.microFillerPercentage
  );

  const totalFillerPercentage = fillerIngredients.reduce((sum, ing) =>
    sum + ing.percentage_estimated, 0
  );

  const isDetected = (
    microFillers.length >= FILLER_STUFFING_THRESHOLDS.minMicroFillerCount &&
    fillerIngredients.length >= FILLER_STUFFING_THRESHOLDS.minTotalFillerCount
  );

  return {
    isDetected,
    microFillerCount: microFillers.length,
    totalFillerCount: fillerIngredients.length,
    totalFillerPercentage,
    microFillers,
  };
}

// ==============================================
// MEAT CONTENT ANALYSIS
// ==============================================

export interface MeatContentResult {
  totalDeclared: number;
  totalEstimated: number;
  freshMeatRaw: number;
  freshMeatAdjusted: number;
  mealMeatRaw: number;
  mealMeatAdjusted: number;
  effectiveMeat: number;
  meatSourceCount: number;
  isSplitDetected: boolean;
}

/**
 * Calculate true meat content with moisture adjustment
 */
export function calculateMeatContent(ingredients: ParsedIngredient[]): MeatContentResult {
  const meatIngredients = ingredients.filter(ing => ing.is_meat_source);

  let freshMeatRaw = 0;
  let mealMeatRaw = 0;
  let totalDeclared = 0;
  let totalEstimated = 0;

  for (const ingredient of meatIngredients) {
    const percentage = ingredient.percentage_declared || ingredient.percentage_estimated;

    if (ingredient.percentage_declared) {
      totalDeclared += percentage;
    }
    totalEstimated += percentage;

    // Categorize by type
    if (ingredient.subcategory === 'fresh-meat') {
      freshMeatRaw += percentage;
    } else if (ingredient.subcategory === 'meal' || ingredient.subcategory === 'dehydrated') {
      mealMeatRaw += percentage;
    } else if (ingredient.subcategory === 'fat') {
      // Fat is not protein, but count it separately if needed
      continue;
    } else {
      // Unknown meat type, assume fresh for conservative estimate
      freshMeatRaw += percentage;
    }
  }

  // Apply moisture adjustment
  // Fresh meat = 75% water, so only 25% is actual protein/nutrients
  const freshMeatAdjusted = freshMeatRaw * 0.25;

  // Meal/dehydrated already concentrated (10-12% moisture), count at 100%
  const mealMeatAdjusted = mealMeatRaw * 1.0;

  // Effective meat = adjusted values
  const effectiveMeat = freshMeatAdjusted + mealMeatAdjusted;

  // Detect splitting (3+ meat sources suggests splitting)
  const isSplitDetected = meatIngredients.length >= 3;

  return {
    totalDeclared,
    totalEstimated,
    freshMeatRaw,
    freshMeatAdjusted,
    mealMeatRaw,
    mealMeatAdjusted,
    effectiveMeat,
    meatSourceCount: meatIngredients.length,
    isSplitDetected,
  };
}

// ==============================================
// COMPLETE ANALYSIS
// ==============================================

export interface CompleteIngredientAnalysis {
  groups: DetectedGroup[];
  fillerStuffing: FillerStuffingAnalysis;
  meatContent: MeatContentResult;
  hasIngredientSplitting: boolean;
  hasFillerStuffing: boolean;
  effectiveMeatPercent: number;
  totalFillerPercent: number;
}

/**
 * Perform complete ingredient analysis
 */
export function analyzeIngredients(
  ingredients: ParsedIngredient[],
  productId: string
): CompleteIngredientAnalysis {
  const groups = detectIngredientGroups(ingredients, productId);
  const fillerStuffing = detectFillerStuffing(ingredients);
  const meatContent = calculateMeatContent(ingredients);

  // Check if any groups show splitting
  const hasIngredientSplitting = groups.some(g => g.is_split_suspected);

  return {
    groups,
    fillerStuffing,
    meatContent,
    hasIngredientSplitting,
    hasFillerStuffing: fillerStuffing.isDetected,
    effectiveMeatPercent: meatContent.effectiveMeat,
    totalFillerPercent: fillerStuffing.totalFillerPercentage,
  };
}

/**
 * Example usage
 */
export function exampleUsage() {
  const mockIngredients: ParsedIngredient[] = [
    {
      position: 1,
      ingredient_name: 'Chicken',
      ingredient_normalized: 'chicken',
      percentage_declared: 20,
      percentage_estimated: 20,
      percentage_confidence: 'declared',
      category: 'meat',
      subcategory: 'fresh-meat',
      quality_tier: 'premium',
      is_meat_source: true,
      is_protein_source: true,
      is_filler: false,
      is_artificial: false,
      is_controversial: false,
    },
    {
      position: 3,
      ingredient_name: 'Chicken Meal',
      ingredient_normalized: 'chicken meal',
      percentage_declared: 8,
      percentage_estimated: 8,
      percentage_confidence: 'declared',
      category: 'meal',
      subcategory: 'meal',
      quality_tier: 'standard',
      is_meat_source: true,
      is_protein_source: true,
      is_filler: false,
      is_artificial: false,
      is_controversial: false,
    },
  ];

  const analysis = analyzeIngredients(mockIngredients, 'test-product-id');
  console.log('Analysis:', analysis);

  return analysis;
}
