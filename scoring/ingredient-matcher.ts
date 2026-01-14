import ingredientScoringData from './ingredient-scoring.json';
import { FEATURE_FLAGS, SPLIT_INGREDIENT_GROUPS, SPLIT_INGREDIENT_PENALTIES } from './config';
import type { IngredientMatch } from '@/types';

export interface IngredientCategory {
  description: string;
  pointValue: number;
  ingredients: string[];
}

interface TokenInfo {
  token: string;
  normalizedToken: string;
  positionIndex: number;
}

/**
 * Load and parse ingredient scoring database
 */
export function getIngredientDatabase(): Record<string, IngredientCategory> {
  return ingredientScoringData.categories as Record<string, IngredientCategory>;
}

/**
 * v2.2: Escape regex special characters
 */
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Normalize ingredient text for matching
 */
function normalizeIngredient(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\([^)]*\)/g, '') // Remove parentheses and content
    .replace(/[.,;!?()[\]{}]/g, '')
    .replace(/\s+/g, ' ');
}

/**
 * v2.2: Tokenize ingredients by commas and semicolons
 */
function tokenizeIngredients(ingredientText: string): TokenInfo[] {
  const tokens = ingredientText
    .split(/[,;]/)
    .map((t, index) => ({
      token: t.trim(),
      normalizedToken: normalizeIngredient(t.trim()),
      positionIndex: index,
    }))
    .filter(t => t.normalizedToken.length > 0);

  return tokens;
}

/**
 * v2.2: Get position multiplier for weighted scoring
 * Top 5 ingredients: 1.0x
 * Positions 6-10: 0.6x
 * Position 11+: 0.3x ("pixie dust" penalty)
 */
function getPositionMultiplier(positionIndex: number): number {
  if (positionIndex <= 4) return 1.0; // Top 5
  if (positionIndex <= 9) return 0.6; // 6-10
  return 0.3; // 11+
}

/**
 * Check if an ingredient text contains a specific ingredient phrase
 */
function containsIngredient(text: string, ingredient: string): boolean {
  const normalizedText = normalizeIngredient(text);
  const normalizedIngredient = normalizeIngredient(ingredient);

  // Exact match or word boundary match
  const regex = new RegExp(`\\b${escapeRegExp(normalizedIngredient)}\\b`, 'i');
  return regex.test(normalizedText);
}

/**
 * Analyze ingredient text and match against scoring database
 * v2.2: Includes position weighting when feature flag enabled
 * Returns array of matches with point values and position info
 */
export function analyzeIngredients(ingredientText: string): IngredientMatch[] {
  if (!ingredientText || ingredientText.trim().length === 0) {
    return [];
  }

  const matches: IngredientMatch[] = [];
  const database = getIngredientDatabase();
  const matchedIngredients = new Set<string>(); // Prevent double-counting

  // v2.2: Tokenize if position weighting enabled
  const usePositionWeighting = FEATURE_FLAGS.USE_POSITION_WEIGHTING;
  let tokens: TokenInfo[] = [];

  if (usePositionWeighting) {
    tokens = tokenizeIngredients(ingredientText);
  }

  // Iterate through each category
  for (const [categoryKey, category] of Object.entries(database)) {
    // Check each ingredient in the category
    for (const ingredient of category.ingredients) {
      let foundInToken: TokenInfo | null = null;

      if (usePositionWeighting && tokens.length > 0) {
        // Check each token for this ingredient
        for (const token of tokens) {
          if (containsIngredient(token.token, ingredient) && !matchedIngredients.has(ingredient)) {
            foundInToken = token;
            break;
          }
        }
      } else {
        // v2.1 behavior: check entire text
        if (containsIngredient(ingredientText, ingredient) && !matchedIngredients.has(ingredient)) {
          foundInToken = { token: ingredient, normalizedToken: ingredient, positionIndex: 0 };
        }
      }

      if (foundInToken) {
        const positionMultiplier = usePositionWeighting
          ? getPositionMultiplier(foundInToken.positionIndex)
          : 1.0;

        const rawPoints = category.pointValue;
        const weightedPoints = rawPoints * positionMultiplier;

        matches.push({
          ingredient,
          category: categoryKey,
          basePoints: rawPoints,
          weightedPoints,
          positionIndex: foundInToken.positionIndex,
          positionMultiplier,
          description: category.description,
        });
        matchedIngredients.add(ingredient);
      }
    }
  }

  return matches;
}

/**
 * v2.2: Detect split ingredient gaming (multiple forms of same ingredient in top 10)
 * Returns penalty points and details of detected groups
 */
export function detectSplitIngredients(ingredientText: string): {
  penalty: number;
  groupsTriggered: Array<{
    groupName: string;
    countInTop10: number;
    tokensMatched: string[];
  }>;
} {
  if (!FEATURE_FLAGS.USE_SPLIT_INGREDIENT_PENALTY) {
    return { penalty: 0, groupsTriggered: [] };
  }

  const tokens = tokenizeIngredients(ingredientText);
  const top10Tokens = tokens.slice(0, 10);

  const groupsTriggered: Array<{
    groupName: string;
    countInTop10: number;
    tokensMatched: string[];
  }> = [];

  let totalPenalty = 0;

  for (const [groupName, ingredients] of Object.entries(SPLIT_INGREDIENT_GROUPS)) {
    const matchedTokens: string[] = [];

    for (const token of top10Tokens) {
      for (const ingredient of ingredients) {
        const regex = new RegExp(`\\b${escapeRegExp(ingredient)}\\b`, 'i');
        if (regex.test(token.normalizedToken)) {
          matchedTokens.push(token.token);
          break; // Count each token once per group
        }
      }
    }

    const count = matchedTokens.length;
    if (count >= 2) {
      groupsTriggered.push({
        groupName,
        countInTop10: count,
        tokensMatched: matchedTokens,
      });

      const penalty = count >= 3
        ? SPLIT_INGREDIENT_PENALTIES.THREE_PLUS_IN_TOP_10
        : SPLIT_INGREDIENT_PENALTIES.TWO_IN_TOP_10;

      totalPenalty += penalty;
    }
  }

  return {
    penalty: totalPenalty,
    groupsTriggered,
  };
}

/**
 * Calculate total ingredient-based bonus/penalty points
 * v2.2: Uses weighted points when position weighting enabled
 */
export function calculateIngredientBonusPoints(ingredientText: string): {
  totalPoints: number;
  matches: IngredientMatch[];
  breakdown: Record<string, number>;
  splitPenalty: number;
} {
  const matches = analyzeIngredients(ingredientText);
  const splitDetection = detectSplitIngredients(ingredientText);

  let totalPoints = 0;
  const breakdown: Record<string, number> = {};

  // v2.2: Use weighted points if available
  const useWeightedPoints = FEATURE_FLAGS.USE_POSITION_WEIGHTING;

  matches.forEach(match => {
    const pointsToAdd = useWeightedPoints && match.weightedPoints !== undefined
      ? match.weightedPoints
      : match.basePoints;

    totalPoints += pointsToAdd;

    if (breakdown[match.category]) {
      breakdown[match.category] += pointsToAdd;
    } else {
      breakdown[match.category] = pointsToAdd;
    }
  });

  // Apply split ingredient penalty
  totalPoints -= splitDetection.penalty;

  return {
    totalPoints: Math.round(totalPoints * 10) / 10, // Round to 1 decimal
    matches,
    breakdown,
    splitPenalty: splitDetection.penalty,
  };
}

/**
 * Get ingredient quality score (0-10 scale)
 * Positive ingredients increase score, negative decrease
 */
export function getIngredientQualityScore(ingredientText: string): number {
  const { totalPoints } = calculateIngredientBonusPoints(ingredientText);

  // Base score is 5 (neutral)
  // Each point moves the scale
  // Cap at 0-10 range
  const score = 5 + (totalPoints / 2);

  return Math.max(0, Math.min(10, score));
}

/**
 * Check for specific red flags
 */
export function hasRedFlags(ingredientText: string): string[] {
  const redFlags: string[] = [];
  const database = getIngredientDatabase();

  const redFlagCategories = [
    'ARTIFICIAL_COLORS',
    'RED_FLAG_PRESERVATIVES',
  ];

  redFlagCategories.forEach(categoryKey => {
    const category = database[categoryKey];
    if (category) {
      category.ingredients.forEach(ingredient => {
        if (containsIngredient(ingredientText, ingredient)) {
          redFlags.push(ingredient);
        }
      });
    }
  });

  return redFlags;
}

/**
 * Count premium proteins in ingredient list
 */
export function countPremiumProteins(ingredientText: string): number {
  const database = getIngredientDatabase();
  const premiumProteins = database['PREMIUM_PROTEINS'];

  if (!premiumProteins) return 0;

  let count = 0;
  premiumProteins.ingredients.forEach(ingredient => {
    if (containsIngredient(ingredientText, ingredient)) {
      count++;
    }
  });

  return count;
}

/**
 * Get human-readable summary of ingredient analysis
 */
export function getIngredientSummary(ingredientText: string): {
  qualityScore: number;
  totalPoints: number;
  positives: IngredientMatch[];
  negatives: IngredientMatch[];
  redFlags: string[];
  premiumProteinCount: number;
} {
  const { totalPoints, matches } = calculateIngredientBonusPoints(ingredientText);
  const qualityScore = getIngredientQualityScore(ingredientText);
  const redFlags = hasRedFlags(ingredientText);
  const premiumProteinCount = countPremiumProteins(ingredientText);

  const positives = matches.filter(m => m.basePoints > 0);
  const negatives = matches.filter(m => m.basePoints < 0);

  return {
    qualityScore,
    totalPoints,
    positives,
    negatives,
    redFlags,
    premiumProteinCount,
  };
}
