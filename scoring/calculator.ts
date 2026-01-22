import { Product, ScoringBreakdown, DryMatterMetrics, NutritionMeta, EnergyMetrics, RedFlagDetection } from '@/types';
import {
  SCORING_WEIGHTS,
  INGREDIENT_SCORING,
  NUTRITION_SCORING,
  VALUE_SCORING,
  HIGH_RISK_FILLERS,
  LOW_VALUE_CARBS,
  BROWN_RICE_CARBS,
  ACCEPTABLE_CARBS,
  RED_FLAG_ADDITIVES,
  ARTIFICIAL_COLORS,
  ARTIFICIAL_PRESERVATIVES,
  CONTROVERSIAL_ADDITIVES,
  VEGETABLES,
  FRESH_MEAT_SOURCES,
  DEHYDRATED_MEAT_SOURCES,
  OMEGA_FATTY_ACIDS,
  JOINT_SUPPORT,
  DIGESTIVE_SUPPORT,
  AMINO_ACIDS,
  NAMED_MEAT_SOURCES,
  UNNAMED_MEAT_SOURCES,
  OPTIMAL_RANGES,
  RED_FLAG_RULES,
  FOOD_CATEGORIES,
  CONFIDENCE_CRITERIA,
  ALGORITHM_VERSION,
  LAST_UPDATED,
  GRAIN_SEVERITY,
  PROTEIN_SOURCE_TYPES,
  // v2.2 imports
  FEATURE_FLAGS,
  MOISTURE_DEFAULTS,
  ASH_DEFAULTS,
  DM_OPTIMAL_RANGES,
  RED_FLAG_TIERS,
} from './config';
import {
  calculateIngredientBonusPoints,
  hasRedFlags as detectRedFlags,
  getIngredientSummary,
} from './ingredient-matcher';

// ==========================================
// v2.2: HELPER FUNCTIONS
// ==========================================

/**
 * v2.2: Compute dry matter macros for fair comparison across food types
 */
function computeDryMatterMacros(product: Product): DryMatterMetrics {
  const warnings: string[] = [];
  const usedDefaults = {
    moisture: false,
    ash: false,
  };

  // Get moisture
  let moisture = product.moisture_percent;
  if (moisture === null || moisture === undefined) {
    const category = (product.food_category || product.category) as keyof typeof MOISTURE_DEFAULTS;
    moisture = MOISTURE_DEFAULTS[category] || MOISTURE_DEFAULTS.dry;
    usedDefaults.moisture = true;
  }

  // Calculate DM%
  const dmPercent = 100 - moisture;

  // Safety check: if dmPercent is too low, return null values to avoid division issues
  if (dmPercent <= 0 || dmPercent > 100) {
    return {
      dmPercent,
      proteinDM: null,
      fatDM: null,
      fiberDM: null,
      carbsDM: null,
      usedDefaults,
    };
  }

  // Convert macros to DM basis
  const proteinDM = product.protein_percent !== null && product.protein_percent !== undefined
    ? (product.protein_percent / dmPercent) * 100
    : null;

  const fatDM = product.fat_percent !== null && product.fat_percent !== undefined
    ? (product.fat_percent / dmPercent) * 100
    : null;

  const fiberDM = product.fiber_percent !== null && product.fiber_percent !== undefined
    ? (product.fiber_percent / dmPercent) * 100
    : null;

  // For carbs, we need to compute them first
  const carbsAsFed = computeCarbsInternal(product);
  const carbsDM = carbsAsFed !== null && carbsAsFed !== undefined ? (carbsAsFed / dmPercent) * 100 : null;

  return {
    dmPercent,
    proteinDM,
    fatDM,
    fiberDM,
    carbsDM,
    usedDefaults,
  };
}

/**
 * v3.0: Calculate Protein Source Diversity Bonus
 * Rewards foods with multiple different protein sources (Orijen-style formulas)
 * Penalizes single-source formulas
 */
function calculateProteinDiversity(ingredientsText: string, ingredientsList: string[]): {
  points: number;
  details: {
    uniqueProteinTypes: number;
    proteinSources: string[];
    diversity: string;
  };
} {
  const foundProteinTypes = new Set<string>();
  const foundSources: string[] = [];

  // Check each protein source type
  for (const [type, sources] of Object.entries(PROTEIN_SOURCE_TYPES)) {
    for (const source of sources) {
      if (ingredientsText.includes(source)) {
        foundProteinTypes.add(type);
        if (!foundSources.includes(source)) {
          foundSources.push(source);
        }
      }
    }
  }

  const uniqueTypes = foundProteinTypes.size;
  const totalSources = foundSources.length;

  let points = 0;
  let diversity = 'poor';

  // Scoring based on protein source diversity
  if (uniqueTypes >= 3 && totalSources >= 6) {
    // Exceptional diversity: 3+ types, 6+ sources (Orijen-level)
    points = 5;
    diversity = 'exceptional';
  } else if (uniqueTypes >= 3 && totalSources >= 4) {
    // Excellent diversity: 3+ types, 4-5 sources
    points = 4;
    diversity = 'excellent';
  } else if (uniqueTypes >= 2 && totalSources >= 3) {
    // Good diversity: 2 types, 3+ sources
    points = 3;
    diversity = 'good';
  } else if (uniqueTypes >= 2 || totalSources >= 2) {
    // Moderate diversity: 2 types or 2 sources
    points = 2;
    diversity = 'moderate';
  } else if (totalSources === 1) {
    // Single source: penalty
    points = 0;
    diversity = 'single-source';
  }

  return {
    points,
    details: {
      uniqueProteinTypes: uniqueTypes,
      proteinSources: foundSources,
      diversity,
    },
  };
}

/**
 * v2.2: Compute carbs with ash defaults
 * Internal version for DM calculation
 */
function computeCarbsInternal(product: Product): number | null {
  // If carbs provided explicitly, use it
  if (product.carbs_percent !== null && product.carbs_percent !== undefined) {
    return product.carbs_percent;
  }

  // Compute from other macros
  const protein = product.protein_percent || 0;
  const fat = product.fat_percent || 0;
  const fiber = product.fiber_percent || 0;

  let moisture = product.moisture_percent;
  if (moisture === null || moisture === undefined) {
    const category = (product.food_category || product.category) as keyof typeof MOISTURE_DEFAULTS;
    moisture = MOISTURE_DEFAULTS[category] || MOISTURE_DEFAULTS.dry;
  }

  let ash = product.ash_percent;
  if (ash === null || ash === undefined) {
    const category = (product.food_category || product.category) as keyof typeof ASH_DEFAULTS;
    ash = ASH_DEFAULTS[category] || ASH_DEFAULTS.dry;
  }

  const carbs = Math.max(0, 100 - protein - fat - moisture - ash - fiber);
  return carbs;
}

/**
 * v2.2: Compute carbs with detailed metadata
 */
function computeCarbsWithDefaults(product: Product): {
  carbs: number;
  carbsProvided: boolean;
  carbsEstimated: boolean;
  ashProvided: boolean;
  ashEstimated: boolean;
} {
  const carbsProvided = product.carbs_percent !== null && product.carbs_percent !== undefined;

  if (carbsProvided) {
    return {
      carbs: product.carbs_percent!,
      carbsProvided: true,
      carbsEstimated: false,
      ashProvided: product.ash_percent !== null && product.ash_percent !== undefined,
      ashEstimated: false,
    };
  }

  const ashProvided = product.ash_percent !== null && product.ash_percent !== undefined;
  const carbs = computeCarbsInternal(product);

  return {
    carbs: carbs || 0,
    carbsProvided: false,
    carbsEstimated: true,
    ashProvided,
    ashEstimated: !ashProvided,
  };
}

/**
 * v2.2: Compute metabolizable energy using Modified Atwater
 */
function computeAtwaterEnergy(product: Product, carbs: number | null): EnergyMetrics {
  const protein = product.protein_percent;
  const fat = product.fat_percent;

  // Need all three macros for estimation
  if (protein === null || protein === undefined ||
      fat === null || fat === undefined ||
      carbs === null || carbs === undefined) {
    return {
      kcalPer100g: product.calories_per_100g || null,
      kcalPerKg: product.calories_per_100g ? product.calories_per_100g * 10 : null,
      pricePer1000kcal: null,
      usedAtwaterEstimate: false,
    };
  }

  // Modified Atwater: 3.5*protein + 8.5*fat + 3.5*NFE
  const kcalPer100g = 3.5 * protein + 8.5 * fat + 3.5 * carbs;
  const kcalPerKg = kcalPer100g * 10;

  // Calculate price per 1000kcal
  let pricePer1000kcal: number | null = null;
  if (product.price_per_kg_gbp && kcalPerKg > 0) {
    pricePer1000kcal = product.price_per_kg_gbp / (kcalPerKg / 1000);
  }

  return {
    kcalPer100g,
    kcalPerKg,
    pricePer1000kcal,
    usedAtwaterEstimate: true,
  };
}

/**
 * Calculate ingredient quality score (max 45 points) - Algorithm v3.0
 *
 * A) Effective Meat Content (15 points)
 * B) Protein Source Diversity (5 points) - NEW!
 * C) Low-Value Fillers & Carbohydrates (10 points)
 * D) Artificial Additives & Preservatives (10 points)
 * E) Named Animal Sources (5 points)
 */
export function calculateIngredientScore(product: Product): {
  score: number;
  details: Record<string, number | Record<string, number>>;
  redFlags: string[];
} {
  let score = 0;
  const details: Record<string, number | Record<string, number> | any> = {};
  const redFlags: string[] = [];

  const ingredientsText = product.ingredients_raw?.toLowerCase() || '';
  const ingredientsList = product.ingredients_list || [];

  // ===========================================
  // A) EFFECTIVE MEAT CONTENT (15 points) - v3.0
  // ===========================================
  // Use effective_meat_percent (moisture-adjusted) if available, fallback to meat_content_percent
  const effectiveMeat = product.effective_meat_percent ?? product.meat_content_percent;

  if (effectiveMeat) {
    const meatPercent = Math.min(effectiveMeat, OPTIMAL_RANGES.MEAT_SOFT_CAP);
    let meatPoints = 0;

    // Enhanced scoring for exceptional meat content
    if (meatPercent >= 50) {
      // 50%+ gets full 15 points (excellent)
      meatPoints = INGREDIENT_SCORING.EFFECTIVE_MEAT_CONTENT;
    } else if (meatPercent >= 40) {
      // 40-49%: 13-14.9 points (very good)
      meatPoints = 13 + ((meatPercent - 40) / 10) * 2;
    } else if (meatPercent >= 30) {
      // 30-39%: 10-13 points (good)
      meatPoints = 10 + ((meatPercent - 30) / 10) * 3;
    } else if (meatPercent >= 20) {
      // 20-29%: 6-10 points (adequate)
      meatPoints = 6 + ((meatPercent - 20) / 10) * 4;
    } else {
      // <20%: 0-6 points (poor)
      meatPoints = (meatPercent / 20) * 6;
    }

    // v3.1: FRESH/RAW MEAT BONUS (+1 point)
    // Reward manufacturers using fresh or raw meats instead of generic terms
    let freshMeatBonus = 0;
    const hasFreshMeat = /\b(fresh|raw|deboned)\s+(chicken|beef|lamb|turkey|duck|salmon|fish|trout|herring|mackerel)/i.test(ingredientsText);
    if (hasFreshMeat) {
      freshMeatBonus = 1;
      details.freshMeatBonus = freshMeatBonus;
    }

    // v3.1: DEHYDRATED/MEAL BONUS (+1 point)
    // Reward concentrated protein sources (dehydrated meats, meals)
    let concentratedProteinBonus = 0;
    const hasConcentratedProtein = /\b(dehydrated|dried)\s+(chicken|beef|lamb|turkey|duck|salmon|fish)/i.test(ingredientsText);
    if (hasConcentratedProtein && !freshMeatBonus) { // Don't double-bonus
      concentratedProteinBonus = 1;
      details.concentratedProteinBonus = concentratedProteinBonus;
    }

    // v3.1: AMBIGUOUS NOTATION PENALTY (-2 points)
    // Penalize weird/misleading ingredient names like "Chicken (Chicken Meal)" or "Liver (Heart)"
    let ambiguousNotationPenalty = 0;
    const hasAmbiguousNotation = /\b(chicken|beef|lamb|turkey|fish|liver|heart)\s*\(\s*(chicken|beef|lamb|turkey|fish|liver|heart|meal)\s*\)/i.test(ingredientsText);
    if (hasAmbiguousNotation) {
      ambiguousNotationPenalty = -2;
      details.ambiguousNotationPenalty = ambiguousNotationPenalty;
      redFlags.push('Ambiguous ingredient notation detected (e.g., "Chicken (Chicken Meal)")');
    }

    meatPoints += freshMeatBonus + concentratedProteinBonus + ambiguousNotationPenalty;

    // v3.0: REMOVED the fresh meat penalty - high-quality fresh meat is excellent!
    // Meal proteins are concentrated, but fresh proteins are highly digestible
    // Both have their place in quality formulas

    score += meatPoints;
    details.effectiveMeatContent = meatPoints;
  }

  // ===========================================
  // B) PROTEIN SOURCE DIVERSITY (5 points) - v3.0 NEW!
  // ===========================================
  const diversityBonus = calculateProteinDiversity(ingredientsText, ingredientsList);
  score += diversityBonus.points;
  details.proteinDiversity = diversityBonus.points;
  details.proteinDiversityDetails = diversityBonus.details;

  // ===========================================
  // v3.0: INGREDIENT SPLITTING PENALTY
  // ===========================================
  if (product.has_ingredient_splitting) {
    const splitPenalty = -5;
    details.ingredientSplittingPenalty = splitPenalty;
    score += splitPenalty;
    redFlags.push('Ingredient splitting detected (same protein source split across multiple entries)');
  }

  // ===========================================
  // v3.0: FILLER STUFFING PENALTY
  // ===========================================
  if (product.has_filler_stuffing) {
    const stuffingPenalty = -4;
    details.fillerStuffingPenalty = stuffingPenalty;
    score += stuffingPenalty;
    redFlags.push('Filler stuffing detected (excessive low-quality ingredients)');
  }

  // ===========================================
  // v3.0: EXCESSIVE INGREDIENT COUNT PENALTY
  // ===========================================
  if (product.total_ingredients_count && product.total_ingredients_count > 60) {
    const excessivePenalty = -3;
    details.excessiveIngredientsPenalty = excessivePenalty;
    score += excessivePenalty;
    redFlags.push(`Excessive ingredient count (${product.total_ingredients_count} ingredients)`);
  }
  // ===========================================
  // C) LOW-VALUE FILLERS & CARBOHYDRATES (10 points) - v3.0 ENHANCED
  // ===========================================
  let fillerPoints: number = INGREDIENT_SCORING.LOW_VALUE_FILLERS;

  // High-Risk Fillers (-2 each)
  const highRiskFillersFound = HIGH_RISK_FILLERS.filter(filler =>
    ingredientsText.includes(filler)
  );
  const highRiskPenalty = highRiskFillersFound.length * 2;
  fillerPoints -= highRiskPenalty;

  if (highRiskFillersFound.length > 0) {
    details.highRiskFillerPenalty = -highRiskPenalty;
  }

  // Low-Value Carbohydrates (-2 each - INCREASED from -1)
  const lowValueCarbsFound = LOW_VALUE_CARBS.filter(carb =>
    ingredientsText.includes(carb)
  );
  const lowValueCarbPenalty = lowValueCarbsFound.length * 2; // INCREASED
  fillerPoints -= lowValueCarbPenalty;

  if (lowValueCarbsFound.length > 0) {
    details.lowValueCarbPenalty = -lowValueCarbPenalty;
  }

  // Brown Rice penalty (-1 each)
  const brownRiceFound = BROWN_RICE_CARBS.filter(carb =>
    ingredientsText.includes(carb)
  );
  const brownRicePenalty = brownRiceFound.length * 1;
  fillerPoints -= brownRicePenalty;

  if (brownRiceFound.length > 0) {
    details.brownRicePenalty = -brownRicePenalty;
  }

  // Ensure minimum score of 0
  fillerPoints = Math.max(0, fillerPoints);
  score += fillerPoints;
  details.lowValueFillers = fillerPoints;

  // ===========================================
  // C2) GRAIN-HEAVY PENALTY (v3.0 MUCH STRONGER)
  // ===========================================
  // Severely penalize foods with grains as primary ingredients
  const top5Ingredients = ingredientsList.slice(0, 5).map(i => i.toLowerCase());
  const top3Ingredients = ingredientsList.slice(0, 3).map(i => i.toLowerCase());

  let grainPenalty = 0;

  // Check for HIGH GLYCEMIC grains (maize, corn, white rice, wheat)
  const highGIInTop5 = top5Ingredients.filter(ing =>
    GRAIN_SEVERITY.HIGH_GLYCEMIC.some(grain => ing.includes(grain))
  );

  const highGIInTop3 = top3Ingredients.filter(ing =>
    GRAIN_SEVERITY.HIGH_GLYCEMIC.some(grain => ing.includes(grain))
  );

  // Check for brown rice in top 5
  const brownRiceInTop5 = top5Ingredients.filter(ing =>
    GRAIN_SEVERITY.MEDIUM_GLYCEMIC.some(grain => ing.includes(grain))
  );

  const brownRiceInTop3 = top3Ingredients.filter(ing =>
    GRAIN_SEVERITY.MEDIUM_GLYCEMIC.some(grain => ing.includes(grain))
  );

  // HIGH GLYCEMIC grain as #1 ingredient: -8 points (SEVERE)
  if (highGIInTop3.length > 0 && top3Ingredients[0] && GRAIN_SEVERITY.HIGH_GLYCEMIC.some(g => top3Ingredients[0].includes(g))) {
    grainPenalty = -8;
    details.grainFirstPenalty = grainPenalty;
    redFlags.push(`High-glycemic grain (${top3Ingredients[0]}) as primary ingredient`);
  }
  // HIGH GLYCEMIC grains 2+ times in top 5: -7 points
  else if (highGIInTop5.length >= 2) {
    grainPenalty = -7;
    details.grainHeavyPenalty = grainPenalty;
    redFlags.push(`Multiple high-glycemic grains in top 5 ingredients`);
  }
  // HIGH GLYCEMIC grain in top 3 (not #1): -5 points
  else if (highGIInTop3.length > 0) {
    grainPenalty = -5;
    details.grainTop3Penalty = grainPenalty;
  }
  // HIGH GLYCEMIC grain in top 5: -3 points
  else if (highGIInTop5.length > 0) {
    grainPenalty = -3;
    details.grainTop5Penalty = grainPenalty;
  }
  // BROWN RICE as #1 ingredient: -4 points
  else if (brownRiceInTop3.length > 0 && top3Ingredients[0] && GRAIN_SEVERITY.MEDIUM_GLYCEMIC.some(g => top3Ingredients[0].includes(g))) {
    grainPenalty = -4;
    details.brownRiceFirstPenalty = grainPenalty;
  }
  // BROWN RICE in top 3: -2 points
  else if (brownRiceInTop3.length > 0) {
    grainPenalty = -2;
    details.brownRiceTop3Penalty = grainPenalty;
  }

  score = Math.max(0, score + grainPenalty);

  // ===========================================
  // D) ARTIFICIAL ADDITIVES & PRESERVATIVES (10 points)
  // ===========================================
  let additivePoints: number = INGREDIENT_SCORING.NO_ARTIFICIAL_ADDITIVES;

  // Check for RED FLAGS (automatic 0 for this subsection)
  const redFlagFound = RED_FLAG_ADDITIVES.find(additive => ingredientsText.includes(additive));
  if (redFlagFound) {
    additivePoints = 0;
    details.redFlagAdditive = -INGREDIENT_SCORING.NO_ARTIFICIAL_ADDITIVES;
    redFlags.push(redFlagFound);
  } else {
    // Check for artificial colors (automatic 0)
    const colorFound = ARTIFICIAL_COLORS.find(color => ingredientsText.includes(color));
    if (colorFound) {
      additivePoints = 0;
      details.artificialColorPenalty = -INGREDIENT_SCORING.NO_ARTIFICIAL_ADDITIVES;
    } else {
      // Preservative Penalty System
      const preservativesFound = ARTIFICIAL_PRESERVATIVES.filter(pres =>
        ingredientsText.includes(pres)
      );

      if (preservativesFound.length >= 3) {
        // Hard zero if ≥3 artificial preservatives
        additivePoints = 0;
        details.multiplePreservativesPenalty = -INGREDIENT_SCORING.NO_ARTIFICIAL_ADDITIVES;
      } else if (preservativesFound.length > 0) {
        // First preservative: -3, each additional: -2
        const penalty = 3 + (preservativesFound.length - 1) * 2;
        additivePoints = Math.max(0, additivePoints - penalty);
        details.preservativePenalty = -penalty;
      }

      // Controversial but Legal Additives (-3 each)
      const controversialFound = CONTROVERSIAL_ADDITIVES.filter(additive =>
        ingredientsText.includes(additive)
      );
      if (controversialFound.length > 0) {
        const controversialPenalty = controversialFound.length * 3;
        additivePoints = Math.max(0, additivePoints - controversialPenalty);
        details.controversialAdditivePenalty = -controversialPenalty;
      }
    }
  }

  score += additivePoints;
  details.noArtificialAdditives = additivePoints;

  // ===========================================
  // E) NAMED ANIMAL SOURCES (5 points)
  // ===========================================
  const hasNamedMeat = NAMED_MEAT_SOURCES.some(meat => ingredientsText.includes(meat));
  const hasUnnamedMeat = UNNAMED_MEAT_SOURCES.some(meat => ingredientsText.includes(meat));

  let namedMeatPoints = 0;
  if (hasNamedMeat && !hasUnnamedMeat) {
    // All named: 5 points
    namedMeatPoints = INGREDIENT_SCORING.NAMED_MEAT_SOURCES;
  } else if (hasNamedMeat && hasUnnamedMeat) {
    // Mix of named + unnamed: 2.5 points
    namedMeatPoints = INGREDIENT_SCORING.NAMED_MEAT_SOURCES / 2;
  }
  // Only generic sources: 0 points (no else needed)

  score += namedMeatPoints;
  details.namedMeatSources = namedMeatPoints;

  // ===========================================
  // F) INGREDIENT-LEVEL BONUS/PENALTY (Enhancement Layer)
  // ===========================================
  // Granular scoring based on specific ingredient presence
  // This enhances the existing scoring with detailed ingredient analysis
  const ingredientAnalysis = calculateIngredientBonusPoints(ingredientsText);

  // Cap bonus/penalty at ±7 points to maintain balance (increased from ±5)
  // Allows rewarding exceptional ingredient diversity
  const ingredientBonus = Math.min(7, Math.max(-7, ingredientAnalysis.totalPoints));

  // Add to score but respect the 45-point maximum for ingredient scoring
  score = Math.max(0, Math.min(45, score + ingredientBonus));

  // Store detailed breakdown for transparency
  details.ingredientLevelBonus = ingredientBonus;
  details.ingredientBonusRaw = ingredientAnalysis.totalPoints;
  details.ingredientBreakdown = ingredientAnalysis.breakdown;

  // Check for red flags from ingredient-level analysis
  const ingredientRedFlags = detectRedFlags(ingredientsText);
  if (ingredientRedFlags && ingredientRedFlags.length > 0) {
    // Add detected red flag ingredients
    const flagMessage = `Red flag ingredients detected: ${ingredientRedFlags.join(', ')}`;
    if (!redFlags.includes(flagMessage)) {
      redFlags.push(flagMessage);
    }
  }

  // Safety check: ensure score is valid
  const safeScore = isNaN(score) || !isFinite(score) ? 0 : score;

  return { score: Math.round(safeScore * 100) / 100, details, redFlags };
}

/**
 * Calculate nutritional value score (max 33 points) - Algorithm v2.2
 *
 * A) Protein Quantity & Integrity (15 points)
 * B) Fat Content (8 points)
 * C) Carbohydrate Load (7 points + bonus)
 * D) Fiber & Functional Micronutrients (5 points)
 *
 * v2.2: Optional dry matter normalization for fair cross-format comparison
 */
export function calculateNutritionScore(
  product: Product,
  dmMetrics?: DryMatterMetrics
): {
  score: number;
  details: Record<string, number>;
  nutritionMeta: NutritionMeta;
} {
  let score = 0;
  const details: Record<string, number> = {};
  const ingredientsText = product.ingredients_raw?.toLowerCase() || '';

  // v2.2: Determine if using DM basis
  const useDM = FEATURE_FLAGS.USE_DM_NUTRITION && dmMetrics !== undefined;
  const nutritionMeta: NutritionMeta = {
    moistureProvided: product.moisture_percent !== null && product.moisture_percent !== undefined,
    moistureEstimated: dmMetrics?.usedDefaults.moisture || false,
    ashProvided: product.ash_percent !== null && product.ash_percent !== undefined,
    ashEstimated: false, // Will be set by carbs calculation
    carbsProvided: product.carbs_percent !== null && product.carbs_percent !== undefined,
    carbsEstimated: false,
    usedDryMatterBasis: useDM,
  };

  // ===========================================
  // A) PROTEIN QUANTITY & INTEGRITY (15 points)
  // ===========================================
  const proteinValue = useDM && dmMetrics?.proteinDM !== null
    ? dmMetrics.proteinDM
    : product.protein_percent;

  if (proteinValue !== null && proteinValue !== undefined) {
    const proteinPercent = proteinValue;
    let proteinPoints = 0;

    // v2.2: Use DM optimal ranges if on DM basis, else as-fed ranges
    const optimalMin = useDM ? DM_OPTIMAL_RANGES.PROTEIN_OPTIMAL_MIN : OPTIMAL_RANGES.PROTEIN_OPTIMAL_MIN;
    const optimalMax = useDM ? DM_OPTIMAL_RANGES.PROTEIN_OPTIMAL_MAX : OPTIMAL_RANGES.PROTEIN_OPTIMAL_MAX;
    const lowThreshold = useDM ? DM_OPTIMAL_RANGES.PROTEIN_LOW_THRESHOLD : OPTIMAL_RANGES.PROTEIN_LOW_THRESHOLD;
    const plateau = useDM ? DM_OPTIMAL_RANGES.PROTEIN_PLATEAU : OPTIMAL_RANGES.PROTEIN_PLATEAU;

    // Optimal Range → full points
    if (proteinPercent >= optimalMin && proteinPercent <= optimalMax) {
      proteinPoints = NUTRITION_SCORING.PROTEIN_QUALITY;
    }
    // Above Optimal → gradual decline, ≥plateau → capped at 90% (13.5 pts)
    else if (proteinPercent > optimalMax) {
      if (proteinPercent >= plateau) {
        proteinPoints = NUTRITION_SCORING.PROTEIN_QUALITY * 0.9; // 13.5 points
      } else {
        // Gradual decline
        const ratio = 1 - ((proteinPercent - optimalMax) / (plateau - optimalMax)) * 0.1;
        proteinPoints = NUTRITION_SCORING.PROTEIN_QUALITY * ratio;
      }
    }
    // Below Optimal → scaled
    else if (proteinPercent >= lowThreshold) {
      const ratio = (proteinPercent - lowThreshold) / (optimalMin - lowThreshold);
      proteinPoints = NUTRITION_SCORING.PROTEIN_QUALITY * ratio;
    }
    // Very low: max 50% of points
    else {
      const ratio = proteinPercent / lowThreshold;
      proteinPoints = NUTRITION_SCORING.PROTEIN_QUALITY * ratio * 0.5;
    }

    // Protein Integrity Modifier
    // ONLY penalize if plant protein is PRIMARY source (low meat content)
    if (proteinPercent >= 25) {
      const plantProteins = [
        'pea protein',
        'soy protein',
        'lentil protein',
        'chickpea',
        'legume',
        'potato protein',
        'wheat protein',
        'corn gluten',
      ];

      const hasPlantProtein = plantProteins.some(plant => ingredientsText.includes(plant));

      // Check if animal protein sources are present
      const hasAnimalProtein = NAMED_MEAT_SOURCES.some(meat => ingredientsText.includes(meat)) ||
                              DEHYDRATED_MEAT_SOURCES.some(meat => ingredientsText.includes(meat));

      const meatPercent = product.meat_content_percent || 0;

      // If high protein but primarily from plant sources (or plant protein listed early)
      if (hasPlantProtein && !hasAnimalProtein) {
        // No animal protein at all - full penalty
        const penalty = proteinPoints * 0.2;
        proteinPoints -= penalty;
        details.plantProteinPenalty = -penalty;
      } else if (hasPlantProtein && meatPercent < 30) {
        // Plant protein with low meat (<30%) = likely plant-boosted
        const penalty = proteinPoints * 0.2;
        proteinPoints -= penalty;
        details.plantProteinPenalty = -penalty;
      }
      // If meat content is ≥30%, plant protein is likely just a supplement - NO penalty
    }

    score += proteinPoints;
    details.proteinQuality = proteinPoints;
  }

  // ===========================================
  // B) FAT CONTENT (8 points)
  // ===========================================
  const fatValue = useDM && dmMetrics?.fatDM !== null
    ? dmMetrics.fatDM
    : product.fat_percent;

  if (fatValue !== null && fatValue !== undefined) {
    let fatPoints = 0;

    // v2.2: Use DM ranges if on DM basis
    const fatMin = useDM ? DM_OPTIMAL_RANGES.FAT_MIN : OPTIMAL_RANGES.FAT_MIN;
    const fatMax = useDM ? DM_OPTIMAL_RANGES.FAT_MAX : OPTIMAL_RANGES.FAT_MAX;
    const penaltyThreshold = useDM ? 25 : OPTIMAL_RANGES.FAT_PENALTY_THRESHOLD;

    // Optimal range: Full 8 points
    if (fatValue >= fatMin && fatValue <= fatMax) {
      fatPoints = NUTRITION_SCORING.MODERATE_FAT;
    }
    // Too high: -2 penalty (obesity risk)
    else if (fatValue > penaltyThreshold) {
      fatPoints = NUTRITION_SCORING.MODERATE_FAT - 2;
      details.highFatPenalty = -2;
    }
    // Within ±5% of optimal range → partial credit
    else {
      const distance = Math.min(
        Math.abs(fatValue - fatMin),
        Math.abs(fatValue - fatMax)
      );

      if (distance <= 5) {
        fatPoints = NUTRITION_SCORING.MODERATE_FAT * (1 - distance / 10);
      }
    }

    score += fatPoints;
    details.moderateFat = fatPoints;
  }

  // ===========================================
  // C) CARBOHYDRATE LOAD (7 points + bonus)
  // ===========================================
  const carbValue = useDM && dmMetrics?.carbsDM !== null
    ? dmMetrics.carbsDM
    : (product.carbs_percent || calculateCarbs(product));

  if (carbValue !== null) {
    let carbPoints = 0;

    // v2.2: Use DM max if on DM basis
    const carbsMax = useDM ? DM_OPTIMAL_RANGES.CARBS_MAX : OPTIMAL_RANGES.CARBS_MAX;

    // Below max → full 7 points
    if (carbValue < carbsMax) {
      carbPoints = NUTRITION_SCORING.LOW_CARBS;
    }
    // Above max → scaled decline
    else if (carbValue <= (useDM ? 45 : 40)) {
      const ratio = ((useDM ? 45 : 40) - carbValue) / (useDM ? 15 : 10);
      carbPoints = NUTRITION_SCORING.LOW_CARBS * ratio;
    }
    // Too high → steep decline (0 points)

    // +1 Bonus Point: If carbs from vegetables rather than grains
    const hasVegetables = VEGETABLES.some(veg => ingredientsText.includes(veg));
    const hasGrains = ['rice', 'wheat', 'corn', 'barley', 'oats'].some(grain =>
      ingredientsText.includes(grain)
    );

    if (hasVegetables && carbPoints > 0) {
      carbPoints += 1;
      details.vegetableCarbsBonus = 1;
    }

    score += carbPoints;
    details.lowCarbs = carbPoints - (details.vegetableCarbsBonus || 0);
  }

  // ===========================================
  // D) FIBER & FUNCTIONAL MICRONUTRIENTS (5 points)
  // ===========================================
  let fiberMicroPoints = 0;

  // Fiber Content (2 points): optimal range → full points
  const fiberValue = useDM && dmMetrics?.fiberDM !== null
    ? dmMetrics.fiberDM
    : product.fiber_percent;

  if (fiberValue !== null && fiberValue !== undefined) {
    const fiberMin = useDM ? DM_OPTIMAL_RANGES.FIBER_MIN : OPTIMAL_RANGES.FIBER_MIN;
    const fiberMax = useDM ? DM_OPTIMAL_RANGES.FIBER_MAX : OPTIMAL_RANGES.FIBER_MAX;

    if (fiberValue >= fiberMin && fiberValue <= fiberMax) {
      fiberMicroPoints += 2;
      details.appropriateFiber = 2;
    } else {
      // Partial credit if close
      const distance = Math.min(
        Math.abs(fiberValue - fiberMin),
        Math.abs(fiberValue - fiberMax)
      );
      if (distance <= 2) {
        const fiberPts = 2 * (1 - distance / 4);
        fiberMicroPoints += fiberPts;
        details.appropriateFiber = fiberPts;
      }
    }
  }

  // Functional Additives (up to 3 points): +1 per category, max 3
  let functionalPoints = 0;
  let categoriesFound = 0;

  // Check Omega-3 / fish oil
  if (OMEGA_FATTY_ACIDS.some(omega => ingredientsText.includes(omega))) {
    functionalPoints += 1;
    categoriesFound++;
  }

  // Check Glucosamine / Chondroitin (joint support)
  if (JOINT_SUPPORT.some(joint => ingredientsText.includes(joint))) {
    functionalPoints += 1;
    categoriesFound++;
  }

  // Check Probiotics / Prebiotics OR Taurine / L-Carnitine
  const hasDigestive = DIGESTIVE_SUPPORT.some(digest => ingredientsText.includes(digest));
  const hasAminoAcids = AMINO_ACIDS.some(amino => ingredientsText.includes(amino));

  if (hasDigestive || hasAminoAcids) {
    functionalPoints += 1;
    categoriesFound++;
  }

  // Cap at 3 points total
  functionalPoints = Math.min(3, functionalPoints);
  fiberMicroPoints += functionalPoints;

  if (functionalPoints > 0) {
    details.functionalMicronutrients = functionalPoints;
  }

  score += fiberMicroPoints;
  details.fiberAndMicronutrients = fiberMicroPoints;

  // Safety check: ensure score is valid
  const safeScore = isNaN(score) || !isFinite(score) ? 0 : score;

  return {
    score: Math.round(safeScore * 100) / 100,
    details,
    nutritionMeta
  };
}

/**
 * Calculate value for money score (max 22 points) - Algorithm v2.2
 *
 * A) Price Competitiveness (15 points) - Category-anchored
 * B) Ingredient-Adjusted Value (7 points)
 *
 * v2.2: Optional energy-based pricing (price per 1000kcal) for fair comparison
 * IMPORTANT: Comparisons are made only within the same food category
 */
export function calculateValueScore(
  product: Product,
  categoryAveragePricePerKg: number,
  categoryAveragePricePer1000kcal: number | undefined,
  ingredientQuality: number = 0,
  energyMetrics?: EnergyMetrics
): {
  score: number;
  details: Record<string, number>;
} {
  let score = 0;
  const details: Record<string, number> = {};

  // v2.2: Prefer energy-based pricing if available and feature flag enabled
  const useEnergyPricing = FEATURE_FLAGS.USE_KCAL_VALUE &&
                          energyMetrics?.pricePer1000kcal !== null &&
                          energyMetrics?.pricePer1000kcal !== undefined &&
                          categoryAveragePricePer1000kcal !== undefined;

  let priceRatio: number;

  if (useEnergyPricing && energyMetrics) {
    // Use price per 1000kcal for fair comparison across formats
    priceRatio = energyMetrics.pricePer1000kcal! / categoryAveragePricePer1000kcal!;
    details.pricingMethod = 1; // 1 = per 1000kcal
  } else if (product.price_per_kg_gbp && categoryAveragePricePerKg) {
    // Fall back to price per kg
    priceRatio = product.price_per_kg_gbp / categoryAveragePricePerKg;
    details.pricingMethod = 0; // 0 = per kg
  } else {
    // No pricing data available
    return { score: 11, details: { valueRating: 11 } }; // Neutral score (50%)
  }

  // ===========================================
  // A) PRICE COMPETITIVENESS (15 points)
  // ===========================================
  // Compared to category average price per kg
  let pricePoints = 0;

  if (priceRatio < 0.7) {
    // <70% of category average → 15 points
    pricePoints = 15;
  } else if (priceRatio < 0.9) {
    // 70-90% → 12 points
    pricePoints = 12;
  } else if (priceRatio <= 1.1) {
    // 90-110% → 9 points (fair/average)
    pricePoints = 9;
  } else if (priceRatio <= 1.3) {
    // 110-130% → 6 points
    pricePoints = 6;
  } else {
    // >130% → 3 points
    pricePoints = 3;
  }

  score += pricePoints;
  details.pricePerFeed = pricePoints;

  // ===========================================
  // B) INGREDIENT-ADJUSTED VALUE (7 points) - v2.2 smooth formula
  // ===========================================
  let qualityValuePoints = 0;

  if (ingredientQuality > 0) {
    const qualityRatio = ingredientQuality / 45; // Ingredient score out of 45

    // Junk food penalty: cheap + poor quality
    if (priceRatio < 0.8 && qualityRatio < 0.5) {
      qualityValuePoints = 2;
      details.junkFoodPenalty = -3;
    } else {
      // v2.2: Smooth weighted formula
      // Quality component (55% weight): qualityRatio directly
      const qualityComponent = qualityRatio;

      // Value component (45% weight): normalize priceRatio (0.7->1.3 maps to 0->1)
      // Lower price = better value
      let valueComponent = 0;
      if (priceRatio <= 0.7) {
        valueComponent = 1.0; // Best value
      } else if (priceRatio >= 1.3) {
        valueComponent = 0.0; // Poor value
      } else {
        // Linear interpolation: 0.7->1.3 maps to 1.0->0.0
        valueComponent = 1.0 - ((priceRatio - 0.7) / 0.6);
      }

      // Combine: 7 * (55% quality + 45% value)
      qualityValuePoints = 7 * (0.55 * qualityComponent + 0.45 * valueComponent);
    }
  } else {
    qualityValuePoints = 4; // Neutral if no ingredient data
  }

  score += qualityValuePoints;
  details.ingredientAdjustedValue = qualityValuePoints;

  // Safety check: ensure score is valid
  const safeScore = isNaN(score) || !isFinite(score) ? 0 : score;

  return { score: Math.round(safeScore * 100) / 100, details };
}

/**
 * Check for red flag conditions that cap the final rating - v2.2 Tiered System
 * Returns array of detected flags with tier info and final cap applied
 */
export function checkRedFlagOverride(
  product: Product,
  redFlags: string[]
): {
  redFlagsDetected: RedFlagDetection[];
  finalStarCapApplied: number | null;
} {
  const ingredientsText = product.ingredients_raw?.toLowerCase() || '';
  const redFlagsDetected: RedFlagDetection[] = [];

  // Helper to get top 5 ingredients
  const getTop5Ingredients = (): string[] => {
    if (product.ingredients_list && product.ingredients_list.length > 0) {
      return product.ingredients_list.slice(0, 5).map(i => i.toLowerCase());
    }
    // Fallback: split by comma
    const tokens = ingredientsText.split(/[,;]/);
    return tokens.slice(0, 5).map(t => t.trim().toLowerCase());
  };

  const top5Lower = getTop5Ingredients().join(' ');

  // ===================================
  // TIER 1: Ethoxyquin (cap at 2 stars)
  // ===================================
  const tier1 = RED_FLAG_TIERS.TIER_1_ETHOXYQUIN;
  for (const ingredient of tier1.ingredients) {
    if (ingredientsText.includes(ingredient)) {
      redFlagsDetected.push({
        ruleId: 'TIER_1_ETHOXYQUIN',
        tier: tier1.tier,
        capStars: tier1.maxStars,
        reason: tier1.description,
        matchedTokens: [ingredient],
      });
      break; // Only count once
    }
  }

  // ===================================
  // TIER 2: Artificial Colors (cap at 3 stars)
  // ===================================
  const tier2Colors = RED_FLAG_TIERS.TIER_2_ARTIFICIAL_COLORS;
  const matchedColors = tier2Colors.ingredients.filter(ing =>
    ingredientsText.includes(ing)
  );
  if (matchedColors.length > 0) {
    redFlagsDetected.push({
      ruleId: 'TIER_2_ARTIFICIAL_COLORS',
      tier: tier2Colors.tier,
      capStars: tier2Colors.maxStars,
      reason: tier2Colors.description,
      matchedTokens: matchedColors,
    });
  }

  // ===================================
  // TIER 2: Colors + Sweeteners Combo (cap at 3 stars)
  // ===================================
  const tier2Combo = RED_FLAG_TIERS.TIER_2_COLORS_SWEETENERS;
  const hasColors = tier2Combo.colorIngredients.some(ing =>
    ingredientsText.includes(ing)
  );
  const hasSweeteners = tier2Combo.sweetenerIngredients.some(ing =>
    ingredientsText.includes(ing)
  );
  if (hasColors && hasSweeteners) {
    const matchedItems: string[] = [];
    if (hasColors) matchedItems.push('artificial colors');
    if (hasSweeteners) matchedItems.push('sweeteners');

    redFlagsDetected.push({
      ruleId: 'TIER_2_COLORS_SWEETENERS',
      tier: tier2Combo.tier,
      capStars: tier2Combo.maxStars,
      reason: tier2Combo.description,
      matchedTokens: matchedItems,
    });
  }

  // ===================================
  // TIER 3: Unnamed digest in top 5 (cap at 3 stars)
  // ===================================
  const tier3 = RED_FLAG_TIERS.TIER_3_UNNAMED_DIGEST;
  const matchedDigest = tier3.ingredientsInTop5.filter(ing =>
    top5Lower.includes(ing)
  );
  if (matchedDigest.length > 0) {
    redFlagsDetected.push({
      ruleId: 'TIER_3_UNNAMED_DIGEST',
      tier: tier3.tier,
      capStars: tier3.maxStars,
      reason: tier3.description,
      matchedTokens: matchedDigest,
    });
  }

  // ===================================
  // TIER 4: 3+ Controversial Additives (cap at 4 stars)
  // ===================================
  const tier4 = RED_FLAG_TIERS.TIER_4_CONTROVERSIAL_ADDITIVES;
  const matchedControversial = tier4.ingredients.filter(ing =>
    ingredientsText.includes(ing)
  );
  if (matchedControversial.length >= tier4.threshold) {
    redFlagsDetected.push({
      ruleId: 'TIER_4_CONTROVERSIAL_ADDITIVES',
      tier: tier4.tier,
      capStars: tier4.maxStars,
      reason: `${tier4.description} (${matchedControversial.length} found)`,
      matchedTokens: matchedControversial,
    });
  }

  // Apply lowest cap (most strict)
  const finalStarCapApplied = redFlagsDetected.length > 0
    ? Math.min(...redFlagsDetected.map(f => f.capStars))
    : null;

  return { redFlagsDetected, finalStarCapApplied };
}

/**
 * Calculate confidence score (0-100) - Non-scoring transparency indicator
 * Shows how reliable the product data is
 */
export function calculateConfidenceScore(product: Product): {
  score: number;
  level: 'High' | 'Medium' | 'Low';
  details: Record<string, number>;
} {
  let score = 0;
  const details: Record<string, number> = {};

  // Full ingredient % disclosure (30 points)
  // Check if ingredients have percentages (e.g., "chicken (30%)")
  const ingredientsText = product.ingredients_raw || '';
  const hasPercentages = /\d+%/.test(ingredientsText);
  const percentageMatches = ingredientsText.match(/\d+%/g);

  if (hasPercentages && percentageMatches && percentageMatches.length >= 3) {
    score += CONFIDENCE_CRITERIA.FULL_DISCLOSURE;
    details.fullDisclosure = CONFIDENCE_CRITERIA.FULL_DISCLOSURE;
  } else if (hasPercentages && percentageMatches && percentageMatches.length >= 1) {
    score += CONFIDENCE_CRITERIA.FULL_DISCLOSURE * 0.5;
    details.partialDisclosure = CONFIDENCE_CRITERIA.FULL_DISCLOSURE * 0.5;
  }

  // Clear nutritional values (25 points)
  const hasProtein = product.protein_percent !== null && product.protein_percent !== undefined;
  const hasFat = product.fat_percent !== null && product.fat_percent !== undefined;
  const hasFiber = product.fiber_percent !== null && product.fiber_percent !== undefined;
  const hasMoisture = product.moisture_percent !== null && product.moisture_percent !== undefined;
  const hasAsh = product.ash_percent !== null && product.ash_percent !== undefined;

  const nutritionalCount = [hasProtein, hasFat, hasFiber, hasMoisture, hasAsh].filter(Boolean).length;
  const nutritionalPoints = (nutritionalCount / 5) * CONFIDENCE_CRITERIA.CLEAR_NUTRITIONAL_VALUES;
  score += nutritionalPoints;
  details.clearNutritionalValues = nutritionalPoints;

  // Named sourcing (20 points)
  const ingredientsLower = ingredientsText.toLowerCase();
  const hasNamedSources = NAMED_MEAT_SOURCES.some(meat => ingredientsLower.includes(meat));
  const hasUnnamedSources = UNNAMED_MEAT_SOURCES.some(meat => ingredientsLower.includes(meat));

  if (hasNamedSources && !hasUnnamedSources) {
    score += CONFIDENCE_CRITERIA.NAMED_SOURCING;
    details.namedSourcing = CONFIDENCE_CRITERIA.NAMED_SOURCING;
  } else if (hasNamedSources) {
    score += CONFIDENCE_CRITERIA.NAMED_SOURCING * 0.5;
    details.partialNamedSourcing = CONFIDENCE_CRITERIA.NAMED_SOURCING * 0.5;
  }

  // Carbs explicitly provided (15 points)
  if (product.carbs_percent !== null && product.carbs_percent !== undefined) {
    score += CONFIDENCE_CRITERIA.CARBS_PROVIDED;
    details.carbsProvided = CONFIDENCE_CRITERIA.CARBS_PROVIDED;
  } else if (hasProtein && hasFat && hasMoisture) {
    // Can be calculated reliably
    score += CONFIDENCE_CRITERIA.CARBS_PROVIDED * 0.5;
    details.carbsCalculated = CONFIDENCE_CRITERIA.CARBS_PROVIDED * 0.5;
  }

  // Manufacturing info (10 points)
  const hasOrigin = product.brand?.country_of_origin !== null;
  const hasWebsite = product.brand?.website_url !== null;

  if (hasOrigin && hasWebsite) {
    score += CONFIDENCE_CRITERIA.MANUFACTURING_INFO;
    details.manufacturingInfo = CONFIDENCE_CRITERIA.MANUFACTURING_INFO;
  } else if (hasOrigin || hasWebsite) {
    score += CONFIDENCE_CRITERIA.MANUFACTURING_INFO * 0.5;
    details.partialManufacturingInfo = CONFIDENCE_CRITERIA.MANUFACTURING_INFO * 0.5;
  }

  // Determine level
  let level: 'High' | 'Medium' | 'Low';
  if (score >= 80) {
    level = 'High';
  } else if (score >= 50) {
    level = 'Medium';
  } else {
    level = 'Low';
  }

  return {
    score: Math.round(score),
    level,
    details,
  };
}
/**
 * Calculate overall score for a product - Algorithm v2.2
 *
 * v2.2: Optionally uses dry matter normalization and energy-based pricing
 */
export function calculateOverallScore(
  product: Product,
  categoryAveragePricePerKg?: number,
  categoryAveragePricePer1000kcal?: number
): {
  overallScore: number;
  ingredientScore: number;
  nutritionScore: number;
  valueScore: number;
  breakdown: ScoringBreakdown;
  confidenceScore: number;
  confidenceLevel: 'High' | 'Medium' | 'Low';
  redFlagOverride?: { maxRating: number; reason: string };
  // v2.2 additions
  algorithmVersion?: string;
  dmMetrics?: DryMatterMetrics;
  nutritionMeta?: NutritionMeta;
  energyMetrics?: EnergyMetrics;
} {
  // v2.2: Compute helper metrics if feature flags enabled
  let dmMetrics: DryMatterMetrics | undefined;
  let carbsData: ReturnType<typeof computeCarbsWithDefaults> | undefined;
  let energyMetrics: EnergyMetrics | undefined;

  if (FEATURE_FLAGS.USE_DM_NUTRITION) {
    dmMetrics = computeDryMatterMacros(product);
  }

  carbsData = computeCarbsWithDefaults(product);

  if (FEATURE_FLAGS.USE_KCAL_VALUE) {
    energyMetrics = computeAtwaterEnergy(product, carbsData.carbs);
  }

  // Calculate component scores
  const ingredient = calculateIngredientScore(product);
  const nutrition = calculateNutritionScore(product, dmMetrics);
  const value = calculateValueScore(
    product,
    categoryAveragePricePerKg || 0,
    categoryAveragePricePer1000kcal,
    ingredient.score,
    energyMetrics
  );
  const confidence = calculateConfidenceScore(product);
  const redFlagCheck = checkRedFlagOverride(product, ingredient.redFlags);

  const overallScore = ingredient.score + nutrition.score + value.score;

  // Safety check: ensure score is a valid number
  const safeOverallScore = isNaN(overallScore) || !isFinite(overallScore) ? 0 : overallScore;

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

  const result = {
    overallScore: Math.round(safeOverallScore * 100) / 100,
    ingredientScore: ingredient.score,
    nutritionScore: nutrition.score,
    valueScore: value.score,
    breakdown,
    confidenceScore: confidence.score,
    confidenceLevel: confidence.level,
    // v2.2 metadata
    algorithmVersion: ALGORITHM_VERSION,
    dmMetrics,
    nutritionMeta: nutrition.nutritionMeta,
    energyMetrics,
  };

  // Add red flag override if applicable (v2.2 format)
  if (redFlagCheck.finalStarCapApplied !== null) {
    return {
      ...result,
      redFlagOverride: {
        maxRating: redFlagCheck.finalStarCapApplied,
        reason: redFlagCheck.redFlagsDetected.map(f => f.reason).join('; '),
      },
    };
  }

  return result;
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
 * Get score grade with star rating
 * Takes into account red flag overrides
 */
export function getScoreGrade(
  score: number,
  redFlagOverride?: { maxRating: number; reason: string }
): {
  grade: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  stars: number;
  emoji: string;
} {
  // Determine stars based on score
  let stars = 2; // Default Poor
  let grade: 'Excellent' | 'Good' | 'Fair' | 'Poor' = 'Poor';

  if (score >= 80) {
    stars = 5;
    grade = 'Excellent';
  } else if (score >= 60) {
    stars = 4;
    grade = 'Good';
  } else if (score >= 40) {
    stars = 3;
    grade = 'Fair';
  } else {
    stars = 2;
    grade = 'Poor';
  }

  // Apply red flag override if present
  if (redFlagOverride && stars > redFlagOverride.maxRating) {
    stars = redFlagOverride.maxRating;
    // Update grade based on capped rating
    if (stars === 3) {
      grade = 'Fair';
    } else if (stars === 2) {
      grade = 'Poor';
    }
  }

  const emoji = '⭐'.repeat(stars);

  return { grade, stars, emoji };
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
