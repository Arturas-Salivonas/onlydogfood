import { Product, ScoringBreakdown } from '@/types';
import {
  SCORING_WEIGHTS,
  INGREDIENT_SCORING,
  NUTRITION_SCORING,
  VALUE_SCORING,
  FILLERS,
  ARTIFICIAL_ADDITIVES,
  NAMED_MEAT_SOURCES,
  UNNAMED_MEAT_SOURCES,
  OPTIMAL_RANGES,
} from './config';

/**
 * Calculate ingredient quality score (max 45 points)
 */
export function calculateIngredientScore(product: Product): {
  score: number;
  details: Record<string, number>;
} {
  let score = 0;
  const details: Record<string, number> = {};

  const ingredientsText = product.ingredients_raw?.toLowerCase() || '';

  // High meat content (15 points)
  if (product.meat_content_percent && product.meat_content_percent >= 50) {
    const points = INGREDIENT_SCORING.HIGH_MEAT_CONTENT;
    score += points;
    details.highMeatContent = points;
  } else if (product.meat_content_percent && product.meat_content_percent >= 30) {
    const points = Math.round((product.meat_content_percent / 50) * INGREDIENT_SCORING.HIGH_MEAT_CONTENT);
    score += points;
    details.highMeatContent = points;
  }

  // No fillers (10 points)
  const hasFillers = FILLERS.some(filler => ingredientsText.includes(filler));
  if (!hasFillers) {
    const points = INGREDIENT_SCORING.NO_FILLERS;
    score += points;
    details.noFillers = points;
  }

  // No artificial additives (10 points)
  const hasAdditives = ARTIFICIAL_ADDITIVES.some(additive => ingredientsText.includes(additive));
  if (!hasAdditives) {
    const points = INGREDIENT_SCORING.NO_ARTIFICIAL_ADDITIVES;
    score += points;
    details.noArtificialAdditives = points;
  }

  // Named meat sources (5 points)
  const hasNamedMeat = NAMED_MEAT_SOURCES.some(meat => ingredientsText.includes(meat));
  const hasUnnamedMeat = UNNAMED_MEAT_SOURCES.some(meat => ingredientsText.includes(meat));

  if (hasNamedMeat && !hasUnnamedMeat) {
    const points = INGREDIENT_SCORING.NAMED_MEAT_SOURCES;
    score += points;
    details.namedMeatSources = points;
  } else if (hasNamedMeat) {
    const points = Math.round(INGREDIENT_SCORING.NAMED_MEAT_SOURCES / 2);
    score += points;
    details.namedMeatSources = points;
  }

  return { score, details };
}

/**
 * Calculate nutritional value score (max 33 points)
 */
export function calculateNutritionScore(product: Product): {
  score: number;
  details: Record<string, number>;
} {
  let score = 0;
  const details: Record<string, number> = {};

  // High protein (15 points)
  if (product.protein_percent) {
    if (product.protein_percent >= OPTIMAL_RANGES.PROTEIN_MIN) {
      let points: number = NUTRITION_SCORING.HIGH_PROTEIN;

      // Plateau at 35%, don't reward excessive protein
      if (product.protein_percent > OPTIMAL_RANGES.PROTEIN_OPTIMAL_MAX) {
        points = Math.round(NUTRITION_SCORING.HIGH_PROTEIN * 0.9);
      }

      score += points;
      details.highProtein = points;
    } else {
      // Partial credit for 20-25%
      const ratio = product.protein_percent / OPTIMAL_RANGES.PROTEIN_MIN;
      const points = Math.round(NUTRITION_SCORING.HIGH_PROTEIN * ratio);
      score += points;
      details.highProtein = points;
    }
  }

  // Moderate fat (8 points)
  if (product.fat_percent) {
    if (
      product.fat_percent >= OPTIMAL_RANGES.FAT_MIN &&
      product.fat_percent <= OPTIMAL_RANGES.FAT_MAX
    ) {
      const points = NUTRITION_SCORING.MODERATE_FAT;
      score += points;
      details.moderateFat = points;
    } else {
      // Partial credit if close
      const distance = Math.min(
        Math.abs(product.fat_percent - OPTIMAL_RANGES.FAT_MIN),
        Math.abs(product.fat_percent - OPTIMAL_RANGES.FAT_MAX)
      );

      if (distance <= 5) {
        const points = Math.round(NUTRITION_SCORING.MODERATE_FAT * (1 - distance / 10));
        score += points;
        details.moderateFat = points;
      }
    }
  }

  // Low carbs (7 points)
  const carbs = product.carbs_percent || calculateCarbs(product);

  if (carbs && carbs < OPTIMAL_RANGES.CARBS_MAX) {
    const points = NUTRITION_SCORING.LOW_CARBS;
    score += points;
    details.lowCarbs = points;
  } else if (carbs && carbs < 40) {
    // Partial credit for 30-40%
    const ratio = (40 - carbs) / 10;
    const points = Math.round(NUTRITION_SCORING.LOW_CARBS * ratio);
    score += points;
    details.lowCarbs = points;
  }

  return { score, details };
}

/**
 * Calculate value for money score (max 22 points)
 */
export function calculateValueScore(
  product: Product,
  categoryAveragePricePerKg: number
): {
  score: number;
  details: Record<string, number>;
} {
  let score = 0;
  const details: Record<string, number> = {};

  if (!product.price_per_kg_gbp || !categoryAveragePricePerKg) {
    return { score: 10, details: { valueRating: 10 } }; // Neutral score if no price data
  }

  const priceRatio = product.price_per_kg_gbp / categoryAveragePricePerKg;

  if (priceRatio < 0.7) {
    score = VALUE_SCORING.EXCELLENT;
    details.valueRating = VALUE_SCORING.EXCELLENT;
  } else if (priceRatio < 0.9) {
    score = VALUE_SCORING.GOOD;
    details.valueRating = VALUE_SCORING.GOOD;
  } else if (priceRatio <= 1.1) {
    score = VALUE_SCORING.FAIR;
    details.valueRating = VALUE_SCORING.FAIR;
  } else {
    score = VALUE_SCORING.POOR;
    details.valueRating = VALUE_SCORING.POOR;
  }

  return { score, details };
}

/**
 * Calculate overall score for a product
 */
export function calculateOverallScore(
  product: Product,
  categoryAveragePricePerKg?: number
): {
  overallScore: number;
  ingredientScore: number;
  nutritionScore: number;
  valueScore: number;
  breakdown: ScoringBreakdown;
} {
  const ingredient = calculateIngredientScore(product);
  const nutrition = calculateNutritionScore(product);
  const value = calculateValueScore(product, categoryAveragePricePerKg || 0);

  const overallScore = ingredient.score + nutrition.score + value.score;

  const breakdown: ScoringBreakdown = {
    ingredientScore: ingredient.score,
    nutritionScore: nutrition.score,
    valueScore: value.score,
    details: {
      ...ingredient.details,
      ...nutrition.details,
      ...value.details,
    },
  };

  return {
    overallScore: Math.round(overallScore * 100) / 100,
    ingredientScore: ingredient.score,
    nutritionScore: nutrition.score,
    valueScore: value.score,
    breakdown,
  };
}

/**
 * Calculate carbs percentage from other nutrients
 */
function calculateCarbs(product: Product): number | null {
  const protein = product.protein_percent || 0;
  const fat = product.fat_percent || 0;
  const ash = product.ash_percent || 0;
  const moisture = product.moisture_percent || 0;

  if (protein + fat + ash + moisture === 0) {
    return null;
  }

  return Math.max(0, 100 - protein - fat - ash - moisture);
}

/**
 * Get score color and label
 */
export function getScoreColor(score: number): {
  color: string;
  bgColor: string;
  label: string;
} {
  if (score >= 80) {
    return {
      color: 'text-green-700',
      bgColor: 'bg-green-100',
      label: 'Excellent',
    };
  } else if (score >= 60) {
    return {
      color: 'text-yellow-700',
      bgColor: 'bg-yellow-100',
      label: 'Good',
    };
  } else if (score >= 40) {
    return {
      color: 'text-orange-700',
      bgColor: 'bg-orange-100',
      label: 'Fair',
    };
  } else {
    return {
      color: 'text-red-700',
      bgColor: 'bg-red-100',
      label: 'Poor',
    };
  }
}
