import { Product, ScoringBreakdown } from '@/types';
import {
  SCORING_WEIGHTS,
  INGREDIENT_SCORING,
  NUTRITION_SCORING,
  VALUE_SCORING,
  FILLERS,
  ARTIFICIAL_ADDITIVES,
  CONTROVERSIAL_ADDITIVES,
  PROCESSED_INGREDIENTS,
  VEGETABLES,
  BENEFICIAL_MICRONUTRIENTS,
  NAMED_MEAT_SOURCES,
  UNNAMED_MEAT_SOURCES,
  OPTIMAL_RANGES,
  ALGORITHM_VERSION,
  LAST_UPDATED,
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

  // High meat content (15 points) - soft cap at 65%
  if (product.meat_content_percent) {
    const meatPercent = Math.min(product.meat_content_percent, OPTIMAL_RANGES.MEAT_SOFT_CAP);

    if (meatPercent >= 50) {
      const points = INGREDIENT_SCORING.HIGH_MEAT_CONTENT;
      score += points;
      details.highMeatContent = points;
    } else if (meatPercent >= 30) {
      const points = Math.round((meatPercent / 50) * INGREDIENT_SCORING.HIGH_MEAT_CONTENT);
      score += points;
      details.highMeatContent = points;
    }
  }

  // No fillers (10 points) - partial penalty: -2 per filler
  const fillersFound = FILLERS.filter(filler => ingredientsText.includes(filler));
  const fillerPenalty = fillersFound.length * 2;
  const fillerPoints = Math.max(0, INGREDIENT_SCORING.NO_FILLERS - fillerPenalty);
  score += fillerPoints;
  details.noFillers = fillerPoints;
  if (fillersFound.length > 0) {
    details.fillerPenalty = -fillerPenalty;
  }

  // No artificial additives (10 points) - with penalties for controversial additives
  const hasAdditives = ARTIFICIAL_ADDITIVES.some(additive => ingredientsText.includes(additive));
  const controversialFound = CONTROVERSIAL_ADDITIVES.filter(additive => ingredientsText.includes(additive));
  const multiplePreservatives = ARTIFICIAL_ADDITIVES.filter(additive =>
    ['bha', 'bht', 'ethoxyquin'].includes(additive) && ingredientsText.includes(additive)
  ).length > 1;

  let additivePoints: number = INGREDIENT_SCORING.NO_ARTIFICIAL_ADDITIVES;

  if (hasAdditives) {
    additivePoints = 0;
    details.artificialAdditivePenalty = -INGREDIENT_SCORING.NO_ARTIFICIAL_ADDITIVES;
  } else if (controversialFound.length > 0) {
    const controversialPenalty = controversialFound.length * 3;
    additivePoints = Math.max(0, INGREDIENT_SCORING.NO_ARTIFICIAL_ADDITIVES - controversialPenalty);
    details.controversialAdditivePenalty = -controversialPenalty;
  }

  if (multiplePreservatives) {
    additivePoints = 0;
    details.multiplePreservativesPenalty = -10;
  }

  score += additivePoints;
  details.noArtificialAdditives = additivePoints;

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

  // Processing penalty (5 points) - NEW
  const processedIngredientsFound = PROCESSED_INGREDIENTS.filter(ingredient =>
    ingredientsText.includes(ingredient)
  );

  let processingPoints: number = INGREDIENT_SCORING.PROCESSING_QUALITY;

  if (processedIngredientsFound.length > 0) {
    const processingPenalty = Math.min(5, processedIngredientsFound.length * 2);
    processingPoints = Math.max(0, INGREDIENT_SCORING.PROCESSING_QUALITY - processingPenalty);
    details.processingPenalty = -processingPenalty;
  }

  score += processingPoints;
  details.processingQuality = processingPoints;

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

  // High protein (15 points) - adjusted ranges: 22-32% optimal
  if (product.protein_percent) {
    const proteinPercent = product.protein_percent;
    let points: number = 0;

    if (proteinPercent >= OPTIMAL_RANGES.PROTEIN_OPTIMAL_MIN && proteinPercent <= OPTIMAL_RANGES.PROTEIN_OPTIMAL_MAX) {
      // Optimal range 22-32%: full 15 points
      points = NUTRITION_SCORING.HIGH_PROTEIN;
    } else if (proteinPercent >= OPTIMAL_RANGES.PROTEIN_LOW_THRESHOLD && proteinPercent < OPTIMAL_RANGES.PROTEIN_OPTIMAL_MIN) {
      // 18-22%: pro-rated
      const ratio = (proteinPercent - OPTIMAL_RANGES.PROTEIN_LOW_THRESHOLD) /
                    (OPTIMAL_RANGES.PROTEIN_OPTIMAL_MIN - OPTIMAL_RANGES.PROTEIN_LOW_THRESHOLD);
      points = Math.round(NUTRITION_SCORING.HIGH_PROTEIN * ratio);
    } else if (proteinPercent > OPTIMAL_RANGES.PROTEIN_OPTIMAL_MAX) {
      // >32%: plateau at 13.5 if beyond 35%
      if (proteinPercent >= OPTIMAL_RANGES.PROTEIN_PLATEAU) {
        points = Math.round(NUTRITION_SCORING.HIGH_PROTEIN * 0.9); // 13.5 points
      } else {
        // Gentle decline 32-35%
        const ratio = 1 - ((proteinPercent - OPTIMAL_RANGES.PROTEIN_OPTIMAL_MAX) /
                          (OPTIMAL_RANGES.PROTEIN_PLATEAU - OPTIMAL_RANGES.PROTEIN_OPTIMAL_MAX)) * 0.1;
        points = Math.round(NUTRITION_SCORING.HIGH_PROTEIN * ratio);
      }
    } else {
      // <18%: sharp penalty
      const ratio = proteinPercent / OPTIMAL_RANGES.PROTEIN_LOW_THRESHOLD;
      points = Math.round(NUTRITION_SCORING.HIGH_PROTEIN * ratio * 0.5); // Max 50% of points
    }

    score += points;
    details.highProtein = points;
  }

  // Moderate fat (8 points) - penalty if >20%
  if (product.fat_percent) {
    let fatPoints = 0;

    if (
      product.fat_percent >= OPTIMAL_RANGES.FAT_MIN &&
      product.fat_percent <= OPTIMAL_RANGES.FAT_MAX
    ) {
      fatPoints = NUTRITION_SCORING.MODERATE_FAT;
    } else if (product.fat_percent > OPTIMAL_RANGES.FAT_PENALTY_THRESHOLD) {
      // >20%: obesity risk penalty
      fatPoints = NUTRITION_SCORING.MODERATE_FAT - 2;
      details.highFatPenalty = -2;
    } else {
      // Partial credit if close
      const distance = Math.min(
        Math.abs(product.fat_percent - OPTIMAL_RANGES.FAT_MIN),
        Math.abs(product.fat_percent - OPTIMAL_RANGES.FAT_MAX)
      );

      if (distance <= 5) {
        fatPoints = Math.round(NUTRITION_SCORING.MODERATE_FAT * (1 - distance / 10));
      }
    }

    score += fatPoints;
    details.moderateFat = fatPoints;
  }

  // Low carbs (7 points) - bonus for vegetables vs grains
  const carbs = product.carbs_percent || calculateCarbs(product);
  const ingredientsText = product.ingredients_raw?.toLowerCase() || '';
  const hasVegetables = VEGETABLES.some(veg => ingredientsText.includes(veg));

  if (carbs && carbs < OPTIMAL_RANGES.CARBS_MAX) {
    let carbPoints = NUTRITION_SCORING.LOW_CARBS;

    // +1 bonus if carbs come from vegetables
    if (hasVegetables) {
      carbPoints += 1;
      details.vegetableCarbsBonus = 1;
    }

    score += carbPoints;
    details.lowCarbs = carbPoints - (hasVegetables ? 1 : 0);
  } else if (carbs && carbs < 40) {
    // Partial credit for 30-40%
    const ratio = (40 - carbs) / 10;
    const carbPoints = Math.round(NUTRITION_SCORING.LOW_CARBS * ratio);
    score += carbPoints;
    details.lowCarbs = carbPoints;
  }

  // Fiber & Micronutrients (3 points) - NEW
  let fiberMicroPoints = 0;

  // Fiber check (1 pt)
  if (product.fiber_percent &&
      product.fiber_percent >= OPTIMAL_RANGES.FIBER_MIN &&
      product.fiber_percent <= OPTIMAL_RANGES.FIBER_MAX) {
    fiberMicroPoints += 1;
    details.appropriateFiber = 1;
  }

  // Beneficial micronutrients (2 pts max)
  const micronutrientsFound = BENEFICIAL_MICRONUTRIENTS.filter(micro =>
    ingredientsText.includes(micro)
  );

  if (micronutrientsFound.length > 0) {
    const microPoints = Math.min(2, micronutrientsFound.length);
    fiberMicroPoints += microPoints;
    details.beneficialMicronutrients = microPoints;
  }

  score += fiberMicroPoints;
  details.fiberAndMicronutrients = fiberMicroPoints;

  return { score, details };
}

/**
 * Calculate value for money score (max 22 points)
 * Split into: Price per feed (15 pts) + Ingredient-adjusted value (7 pts)
 */
export function calculateValueScore(
  product: Product,
  categoryAveragePricePerKg: number,
  ingredientQuality: number = 0
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

  // Price per feed component (15 pts)
  let pricePoints = 0;
  if (priceRatio < 0.7) {
    pricePoints = 15;
  } else if (priceRatio < 0.9) {
    pricePoints = 12;
  } else if (priceRatio <= 1.1) {
    pricePoints = 9;
  } else if (priceRatio <= 1.3) {
    pricePoints = 6;
  } else {
    pricePoints = 3;
  }

  score += pricePoints;
  details.pricePerFeed = pricePoints;

  // Ingredient-adjusted value (7 pts)
  // Penalize cheap food with bad ingredients (no free wins)
  let qualityValuePoints = 0;

  if (ingredientQuality > 0) {
    const qualityRatio = ingredientQuality / 45; // Ingredient score out of 45

    if (priceRatio < 0.8 && qualityRatio < 0.5) {
      // Cheap + low quality = penalty
      qualityValuePoints = 2;
    } else if (priceRatio < 1.0 && qualityRatio >= 0.7) {
      // Good price + good quality = bonus
      qualityValuePoints = 7;
    } else if (priceRatio <= 1.2 && qualityRatio >= 0.6) {
      // Fair price + decent quality
      qualityValuePoints = 5;
    } else if (priceRatio > 1.2 && qualityRatio >= 0.8) {
      // Premium price + premium quality = justified
      qualityValuePoints = 6;
    } else {
      // Average
      qualityValuePoints = 4;
    }
  } else {
    qualityValuePoints = 4; // Neutral if no ingredient data
  }

  score += qualityValuePoints;
  details.ingredientAdjustedValue = qualityValuePoints;

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
  const value = calculateValueScore(product, categoryAveragePricePerKg || 0, ingredient.score);

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

/**
 * Get score grade
 */
export function getScoreGrade(score: number): 'Excellent' | 'Good' | 'Fair' | 'Poor' {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Poor';
}

/**
 * Get score confidence band (typical range for grade)
 */
export function getScoreConfidenceBand(score: number): {
  band: string;
  margin: number;
  min: number;
  max: number;
} {
  if (score >= 80) {
    return { band: 'High', margin: 3, min: 82, max: 88 };
  } else if (score >= 60) {
    return { band: 'Medium', margin: 5, min: 65, max: 75 };
  } else if (score >= 40) {
    return { band: 'Medium', margin: 5, min: 45, max: 55 };
  } else {
    return { band: 'Low', margin: 7, min: 25, max: 38 };
  }
}

/**
 * Get algorithm metadata for transparency
 */
export function getAlgorithmMetadata() {
  return {
    version: ALGORITHM_VERSION,
    lastUpdated: LAST_UPDATED,
    weights: {
      ingredientQuality: SCORING_WEIGHTS.INGREDIENT_QUALITY,
      nutritionalValue: SCORING_WEIGHTS.NUTRITIONAL_VALUE,
      valueForMoney: SCORING_WEIGHTS.VALUE_FOR_MONEY,
    },
    improvements: [
      'Meat soft cap at 65%',
      'Partial filler penalties (-2 each)',
      'Controversial additive detection',
      'Processing quality penalties',
      'Adjusted protein ranges (22-32% optimal)',
      'Fat penalty >20%',
      'Vegetable carb bonus',
      'Fiber & micronutrient scoring',
      'Split value scoring (price + ingredient quality)',
    ],
  };
}
