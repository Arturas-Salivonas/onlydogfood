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
  // v4.0 imports
  SUPERFOODS_TERMS,
  LEGUME_DERIVATIVES,
  LOW_VALUE_GRAINS,
  LEGUME_SPLIT_PENALTIES,
  GRAIN_POSITION_CAPS,
  VALUE_CAPS,
  SUPERFOODS_BUCKET,
  // v5.0 imports
  PROTEIN_RANGES,
  MEAT_THRESHOLDS,
  ASH_THRESHOLDS,
  TOP_5_MEAT_DENSITY,
  CARB_SOURCES,
  POTATO_FORMS,
  PEA_FORMS,
  ORGAN_MEATS,
  WHOLE_PREY_INDICATORS,
  GENERIC_PROTEINS,
} from './config';
import {
  calculateIngredientBonusPoints,
  hasRedFlags as detectRedFlags,
  getIngredientSummary,
} from './ingredient-matcher';

// ==========================================
// v4.0: HELPER FUNCTIONS FOR GUARDRAILS
// ==========================================

/**
 * v4.0: Tokenize ingredients into ordered list
 */
function tokenizeIngredients(ingredientsText: string): string[] {
  return ingredientsText
    .split(/[,;]/)
    .map(t => t.trim().toLowerCase())
    .filter(t => t.length > 0);
}

/**
 * v4.0: Calculate superfoods bucket score (signal-only, max +1)
 */
function calculateSuperfoodsBucket(ingredientTokens: string[]): {
  score: number;
  triggeredBy: string | null;
  position: number | null;
} {
  for (let i = 0; i < Math.min(10, ingredientTokens.length); i++) {
    const token = ingredientTokens[i];
    const hasSuperfoods = SUPERFOODS_TERMS.some(sf => token.includes(sf));
    if (hasSuperfoods) {
      return {
        score: SUPERFOODS_BUCKET.TOP_10,
        triggeredBy: token,
        position: i + 1,
      };
    }
  }

  // Check after position 10
  for (let i = 10; i < ingredientTokens.length; i++) {
    const token = ingredientTokens[i];
    const hasSuperfoods = SUPERFOODS_TERMS.some(sf => token.includes(sf));
    if (hasSuperfoods) {
      return {
        score: SUPERFOODS_BUCKET.AFTER_10,
        triggeredBy: token,
        position: i + 1,
      };
    }
  }

  return { score: 0, triggeredBy: null, position: null };
}

/**
 * v4.0: Detect legume splitting in top 10 ingredients
 */
function detectLegumeSplitting(ingredientTokens: string[]): {
  penalty: number;
  matches: Array<{ ingredient: string; position: number }>;
} {
  const top10 = ingredientTokens.slice(0, 10);
  const matches: Array<{ ingredient: string; position: number }> = [];

  top10.forEach((token, index) => {
    const isLegume = LEGUME_DERIVATIVES.some(leg => token.includes(leg));
    if (isLegume) {
      matches.push({ ingredient: token, position: index + 1 });
    }
  });

  let penalty = 0;
  if (matches.length >= 3) {
    penalty = LEGUME_SPLIT_PENALTIES.THREE_PLUS_IN_TOP_10;
  } else if (matches.length >= 2) {
    penalty = LEGUME_SPLIT_PENALTIES.TWO_IN_TOP_10;
  }

  return { penalty, matches };
}

/**
 * v4.0: Apply grain position hard caps to Ingredient Quality
 */
function applyGrainPositionCaps(
  ingredientTokens: string[],
  currentScore: number
): {
  cappedScore: number;
  capApplied: {
    capValue: number;
    reason: string;
    matchedIngredient: string;
    position: number;
  } | null;
} {
  const top3 = ingredientTokens.slice(0, 3);

  for (let i = 0; i < top3.length; i++) {
    const token = top3[i];
    const isLowValueGrain = LOW_VALUE_GRAINS.some(grain => token.includes(grain));

    if (isLowValueGrain) {
      let capValue: number;
      let reason: string;

      if (i === 0) {
        capValue = GRAIN_POSITION_CAPS.POSITION_1;
        reason = 'Low-value grain as #1 ingredient';
      } else {
        capValue = GRAIN_POSITION_CAPS.POSITION_2_OR_3;
        reason = `Low-value grain at position #${i + 1}`;
      }

      if (currentScore > capValue) {
        return {
          cappedScore: capValue,
          capApplied: {
            capValue,
            reason,
            matchedIngredient: token,
            position: i + 1,
          },
        };
      }
    }
  }

  return { cappedScore: currentScore, capApplied: null };
}

/**
 * v4.0: Apply value cap based on Ingredient Quality
 */
function applyValueCap(
  rawValueScore: number,
  ingredientQuality: number
): {
  cappedScore: number;
  capApplied: {
    capValue: number;
    reason: string;
    ingredientQualityUsed: number;
  } | null;
} {
  let maxValue: number;
  let reason: string;

  if (ingredientQuality >= VALUE_CAPS.EXCELLENT.minIngredientQuality) {
    maxValue = VALUE_CAPS.EXCELLENT.maxValue;
    reason = 'No cap (excellent ingredients)';
  } else if (ingredientQuality >= VALUE_CAPS.GOOD.minIngredientQuality) {
    maxValue = VALUE_CAPS.GOOD.maxValue;
    reason = 'Good ingredient quality cap';
  } else if (ingredientQuality >= VALUE_CAPS.FAIR.minIngredientQuality) {
    maxValue = VALUE_CAPS.FAIR.maxValue;
    reason = 'Fair ingredient quality cap';
  } else {
    maxValue = VALUE_CAPS.POOR.maxValue;
    reason = 'Poor ingredient quality cap';
  }

  if (rawValueScore > maxValue) {
    return {
      cappedScore: maxValue,
      capApplied: {
        capValue: maxValue,
        reason,
        ingredientQualityUsed: ingredientQuality,
      },
    };
  }

  return { cappedScore: rawValueScore, capApplied: null };
}

// ==========================================
// v5.0: NEW HELPER FUNCTIONS FOR PHASE 1
// ==========================================

/**
 * v5.0: Detect formula type from product name
 */
function detectFormulaType(product: Product): keyof typeof PROTEIN_RANGES {
  const name = (product.name || '').toLowerCase();

  if (name.includes('fit') || name.includes('trim') || name.includes('light') || name.includes('weight')) {
    return 'WEIGHT_MANAGEMENT';
  } else if (name.includes('puppy') || name.includes('junior')) {
    return 'PUPPY';
  } else if (name.includes('senior') || name.includes('mature')) {
    return 'SENIOR';
  } else if (name.includes('active') || name.includes('performance') || name.includes('working') || name.includes('sport')) {
    return 'ACTIVE';
  }

  return 'MAINTENANCE';
}

/**
 * v5.0: Calculate Top 5 meat density bonus (Phase 1 Critical)
 */
function calculateTop5MeatDensity(ingredientTokens: string[]): {
  bonus: number;
  meatCount: number;
  nonMeatInTop5: string[];
} {
  const top5 = ingredientTokens.slice(0, 5);
  let meatCount = 0;
  const nonMeatInTop5: string[] = [];

  top5.forEach((token) => {
    const isMeat = (
      token.includes('chicken') || token.includes('turkey') || token.includes('beef') ||
      token.includes('lamb') || token.includes('duck') || token.includes('venison') ||
      token.includes('rabbit') || token.includes('pork') || token.includes('salmon') ||
      token.includes('herring') || token.includes('mackerel') || token.includes('sardine') ||
      token.includes('trout') || token.includes('hake') || token.includes('pollock') ||
      token.includes('cod') || token.includes('whitefish') || token.includes('fish oil') ||
      token.includes('egg') || token.includes('liver') || token.includes('heart') ||
      token.includes('kidney') || token.includes('giblets') || token.includes('tripe') ||
      token.includes('meat') || token.includes('poultry')
    ) && !token.includes('meal'); // Exclude "chicken meal" type strings

    if (isMeat) {
      meatCount++;
    } else {
      nonMeatInTop5.push(token);
    }
  });

  let bonus = 0;
  if (meatCount === 5) {
    bonus = TOP_5_MEAT_DENSITY.FIVE_OF_FIVE; // +10
  } else if (meatCount === 4) {
    bonus = TOP_5_MEAT_DENSITY.FOUR_OF_FIVE; // +5
  } else if (meatCount === 3) {
    bonus = TOP_5_MEAT_DENSITY.THREE_OF_FIVE; // 0
  } else {
    bonus = TOP_5_MEAT_DENSITY.TWO_OR_LESS; // -5
  }

  return { bonus, meatCount, nonMeatInTop5 };
}

/**
 * v5.0: Calculate carb position penalty (Phase 1 Critical)
 */
function calculateCarbPositionPenalty(ingredientTokens: string[]): {
  penalty: number;
  carbsInTop5: Array<{ ingredient: string; position: number; penaltyAmount: number }>;
} {
  const top5 = ingredientTokens.slice(0, 5);
  const carbsInTop5: Array<{ ingredient: string; position: number; penaltyAmount: number }> = [];
  let totalPenalty = 0;

  top5.forEach((token, index) => {
    const isCarb = CARB_SOURCES.some(carb => token.includes(carb));

    if (isCarb) {
      let penaltyAmount = 0;
      const position = index + 1;

      if (position === 1 || position === 2) {
        penaltyAmount = 8; // SEVERE penalty for #1 or #2
      } else if (position === 3) {
        penaltyAmount = 5; // Major penalty for #3
      } else if (position <= 5) {
        penaltyAmount = 3; // Moderate penalty for #4-5
      }

      carbsInTop5.push({ ingredient: token, position, penaltyAmount });
      totalPenalty += penaltyAmount;
    }
  });

  return { penalty: totalPenalty, carbsInTop5 };
}

/**
 * v5.0: Check for minimum meat threshold (Phase 1 Critical)
 */
function calculateMeatThresholdPenalty(effectiveMeat: number): {
  penalty: number;
  bonus: number;
  threshold: string;
  capScore: number | null;
} {
  if (effectiveMeat < MEAT_THRESHOLDS.FAILING.max) {
    return {
      penalty: MEAT_THRESHOLDS.FAILING.penalty,
      bonus: 0,
      threshold: 'FAILING',
      capScore: MEAT_THRESHOLDS.FAILING.capScore,
    };
  } else if (effectiveMeat < MEAT_THRESHOLDS.LOW.max) {
    return {
      penalty: MEAT_THRESHOLDS.LOW.penalty,
      bonus: 0,
      threshold: 'LOW',
      capScore: null,
    };
  } else if (effectiveMeat < MEAT_THRESHOLDS.ADEQUATE.max) {
    return {
      penalty: 0,
      bonus: 0,
      threshold: 'ADEQUATE',
      capScore: null,
    };
  } else if (effectiveMeat < MEAT_THRESHOLDS.PREMIUM.max) {
    return {
      penalty: 0,
      bonus: MEAT_THRESHOLDS.PREMIUM.bonus,
      threshold: 'PREMIUM',
      capScore: null,
    };
  } else {
    return {
      penalty: 0,
      bonus: MEAT_THRESHOLDS.ULTRA_PREMIUM.bonus,
      threshold: 'ULTRA_PREMIUM',
      capScore: null,
    };
  }
}

/**
 * v5.0: Calculate ash content penalty (Phase 1 Critical)
 */
function calculateAshPenalty(ashPercent: number | null): {
  penalty: number;
  bonus: number;
  threshold: string;
} {
  if (ashPercent === null || ashPercent === undefined) {
    return { penalty: 0, bonus: 0, threshold: 'UNKNOWN' };
  }

  if (ashPercent >= ASH_THRESHOLDS.VERY_HIGH.min) {
    return {
      penalty: ASH_THRESHOLDS.VERY_HIGH.penalty,
      bonus: 0,
      threshold: 'VERY_HIGH',
    };
  } else if (ashPercent >= ASH_THRESHOLDS.HIGH.min) {
    return {
      penalty: ASH_THRESHOLDS.HIGH.penalty,
      bonus: 0,
      threshold: 'HIGH',
    };
  } else if (ashPercent >= ASH_THRESHOLDS.NORMAL.min) {
    return {
      penalty: 0,
      bonus: 0,
      threshold: 'NORMAL',
    };
  } else {
    return {
      penalty: 0,
      bonus: ASH_THRESHOLDS.EXCELLENT.bonus,
      threshold: 'EXCELLENT',
    };
  }
}

/**
 * v5.0: Detect potato/pea form manipulation (Phase 1 Critical)
 */
function detectPotatoPeaManipulation(ingredientTokens: string[]): {
  penalty: number;
  potatoForms: number;
  peaForms: number;
  details: string[];
} {
  const top10 = ingredientTokens.slice(0, 10);
  const details: string[] = [];

  // Check potato forms
  const potatoMatches = top10.filter(token =>
    POTATO_FORMS.some(form => token.includes(form))
  );

  // Check pea forms
  const peaMatches = top10.filter(token =>
    PEA_FORMS.some(form => token.includes(form))
  );

  let penalty = 0;

  if (potatoMatches.length >= 4) {
    penalty += 8;
    details.push(`${potatoMatches.length} potato forms detected (severe manipulation)`);
  } else if (potatoMatches.length >= 3) {
    penalty += 5;
    details.push(`${potatoMatches.length} potato forms detected`);
  } else if (potatoMatches.length >= 2) {
    penalty += 3;
    details.push(`${potatoMatches.length} potato forms detected`);
  }

  if (peaMatches.length >= 4) {
    penalty += 8;
    details.push(`${peaMatches.length} pea forms detected (severe manipulation)`);
  } else if (peaMatches.length >= 3) {
    penalty += 5;
    details.push(`${peaMatches.length} pea forms detected`);
  } else if (peaMatches.length >= 2) {
    penalty += 3;
    details.push(`${peaMatches.length} pea forms detected`);
  }

  return {
    penalty,
    potatoForms: potatoMatches.length,
    peaForms: peaMatches.length,
    details,
  };
}

/**
 * v5.0: Calculate whole prey and organ meat bonuses
 */
function calculateWholePreyOrganBonus(ingredientTokens: string[]): {
  bonus: number;
  hasWholePrey: boolean;
  hasOrganMeats: boolean;
} {
  const ingredientsLower = ingredientTokens.join(' ');

  const hasWholePrey = WHOLE_PREY_INDICATORS.some(indicator =>
    ingredientsLower.includes(indicator)
  );

  const hasOrganMeats = ORGAN_MEATS.some(organ =>
    ingredientsLower.includes(organ)
  );

  let bonus = 0;
  if (hasWholePrey) bonus += 3;
  if (hasOrganMeats) bonus += 2;

  return { bonus, hasWholePrey, hasOrganMeats };
}

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
 * v5.0: Calculate Protein Source Diversity Bonus (Enhanced 0-8 scale)
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

  // v5.0: Enhanced 0-8 scoring based on protein source diversity
  if (uniqueTypes >= 4 && totalSources >= 10) {
    // Exceptional: 4+ types, 10+ sources (ultra-premium)
    points = 8;
    diversity = 'exceptional';
  } else if (uniqueTypes >= 3 && totalSources >= 8) {
    // Outstanding: 3+ types, 8+ sources
    points = 7;
    diversity = 'outstanding';
  } else if (uniqueTypes >= 3 && totalSources >= 6) {
    // Excellent diversity: 3+ types, 6+ sources (Orijen-level)
    points = 6;
    diversity = 'excellent';
  } else if (uniqueTypes >= 3 && totalSources >= 4) {
    // Very good diversity: 3+ types, 4-5 sources
    points = 5;
    diversity = 'very-good';
  } else if (uniqueTypes >= 2 && totalSources >= 3) {
    // Good diversity: 2 types, 3+ sources
    points = 3;
    diversity = 'good';
  } else if (uniqueTypes >= 2 || totalSources >= 2) {
    // Moderate diversity: 2 types or 2 sources
    points = 2;
    diversity = 'moderate';
  } else if (totalSources === 1) {
    // Single source: no points
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
  // Sort ingredients by percentage for accurate top 5 determination
  const sortedIngredients = [...ingredientsList].sort((a, b) => {
    // Extract percentages from ingredient strings like "20% Chicken" or "Chicken 20%"
    const extractPercent = (str: string): number => {
      const match = str.match(/(\d+(?:\.\d+)?)\s*%/);
      return match ? parseFloat(match[1]) : 0;
    };
    return extractPercent(b) - extractPercent(a);
  });
  const top5Ingredients = sortedIngredients.slice(0, 5).map(i => i.toLowerCase());
  const top3Ingredients = sortedIngredients.slice(0, 3).map(i => i.toLowerCase());

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
  // F) INGREDIENT-LEVEL BONUS/PENALTY (v4.0 MEAT-ANCHORED)
  // ===========================================
  // v4.0: Tokenize ingredients for position-aware analysis
  const ingredientTokens = tokenizeIngredients(ingredientsText);

  // v4.0: Calculate superfoods bucket (replaces stacking)
  const superfoodsBucket = calculateSuperfoodsBucket(ingredientTokens);
  details.superfoodsBucketScore = superfoodsBucket.score;
  if (superfoodsBucket.triggeredBy) {
    details.superfoodsTriggeredBy = superfoodsBucket.triggeredBy;
    details.superfoodsPosition = superfoodsBucket.position;
  }

  // Calculate raw ingredient bonus (including superfoods bucket)
  const ingredientAnalysis = calculateIngredientBonusPoints(ingredientsText);
  const ingredientBonusRaw = ingredientAnalysis.totalPoints + superfoodsBucket.score;

  // Cap at ±7 points
  const ingredientBonusCapped = Math.min(7, Math.max(-7, ingredientBonusRaw));

  // v4.0: Apply meat-anchored scaling
  const meatPercent = product.effective_meat_percent ?? product.meat_content_percent ?? 0;
  const bonusMultiplier = Math.min(1, meatPercent / 50);
  let ingredientBonusScaled = ingredientBonusCapped * bonusMultiplier;

  // v4.0: Hard low-meat cap (only cap positive bonus, allow negative penalties)
  let lowMeatCapApplied = false;
  if (meatPercent < 30 && ingredientBonusScaled > 0) {
    ingredientBonusScaled = Math.min(ingredientBonusScaled, 2);
    lowMeatCapApplied = true;
  }

  // Add scaled bonus to score
  score = Math.max(0, Math.min(45, score + ingredientBonusScaled));

  // Store v4.0 breakdown
  details.ingredientBonusRaw = Math.round(ingredientBonusRaw * 100) / 100;
  details.ingredientBonusCapped = Math.round(ingredientBonusCapped * 100) / 100;
  details.bonusMultiplier = Math.round(bonusMultiplier * 100) / 100;
  details.ingredientBonusScaled = Math.round(ingredientBonusScaled * 100) / 100;
  details.lowMeatCapApplied = lowMeatCapApplied;
  details.ingredientBreakdown = ingredientAnalysis.breakdown;

  // Check for red flags from ingredient-level analysis
  const ingredientRedFlags = detectRedFlags(ingredientsText);
  if (ingredientRedFlags && ingredientRedFlags.length > 0) {
    const flagMessage = `Red flag ingredients detected: ${ingredientRedFlags.join(', ')}`;
    if (!redFlags.includes(flagMessage)) {
      redFlags.push(flagMessage);
    }
  }

  // ===========================================
  // v4.0: APPLY LEGUME SPLITTING PENALTY
  // ===========================================
  const legumeSplitting = detectLegumeSplitting(ingredientTokens);
  if (legumeSplitting.penalty < 0) {
    score = Math.max(0, score + legumeSplitting.penalty);
    details.legumeSplitPenalty = legumeSplitting.penalty;
    details.legumeMatchesTop10 = legumeSplitting.matches;
    redFlags.push(`Legume splitting detected: ${legumeSplitting.matches.length} legume forms in top 10`);
  }

  // ===========================================
  // v4.0: APPLY GRAIN POSITION HARD CAP
  // ===========================================
  const grainCap = applyGrainPositionCaps(ingredientTokens, score);
  if (grainCap.capApplied) {
    score = grainCap.cappedScore;
    details.ingredientQualityCapApplied = grainCap.capApplied;
    redFlags.push(grainCap.capApplied.reason);
  }

  // ===========================================
  // v5.0: APPLY ALL PHASE 1 CRITICAL FEATURES
  // ===========================================
  const top5MeatDensity = calculateTop5MeatDensity(ingredientTokens);
  const carbPositionPenalty = calculateCarbPositionPenalty(ingredientTokens);
  const meatThreshold = calculateMeatThresholdPenalty(meatPercent);
  const ashPenalty = calculateAshPenalty(product.ash_percent || null);
  const potatoPeaManipulation = detectPotatoPeaManipulation(ingredientTokens);
  const wholePreyOrganBonus = calculateWholePreyOrganBonus(ingredientTokens);

  // Apply all bonuses and penalties
  score += top5MeatDensity.bonus;
  score += meatThreshold.bonus;
  score += ashPenalty.bonus;
  score += wholePreyOrganBonus.bonus;
  score -= meatThreshold.penalty;
  score -= carbPositionPenalty.penalty;
  score -= ashPenalty.penalty;
  score -= potatoPeaManipulation.penalty;

  // Store all v5.0 details for transparency
  details.top5MeatDensity = top5MeatDensity.meatCount;
  details.top5MeatBonus = top5MeatDensity.bonus;
  details.nonMeatInTop5 = top5MeatDensity.nonMeatInTop5;
  details.carbPositionPenalty = -carbPositionPenalty.penalty;
  details.carbsInTop5 = carbPositionPenalty.carbsInTop5;
  details.meatThresholdPenalty = -meatThreshold.penalty;
  details.meatThresholdBonus = meatThreshold.bonus;
  details.meatThresholdLevel = meatThreshold.threshold;
  details.ashPenalty = -ashPenalty.penalty;
  details.ashBonus = ashPenalty.bonus;
  details.ashThreshold = ashPenalty.threshold;
  details.potatoPeaPenalty = -potatoPeaManipulation.penalty;
  details.potatoForms = potatoPeaManipulation.potatoForms;
  details.peaForms = potatoPeaManipulation.peaForms;
  details.wholePreyOrganBonus = wholePreyOrganBonus.bonus;
  details.hasWholePrey = wholePreyOrganBonus.hasWholePrey;
  details.hasOrganMeats = wholePreyOrganBonus.hasOrganMeats;

  // Add red flags for significant penalties
  if (top5MeatDensity.bonus < 0) {
    redFlags.push(`Low meat density: Only ${top5MeatDensity.meatCount}/5 meat ingredients in top 5`);
  }
  if (carbPositionPenalty.penalty > 0) {
    redFlags.push(`High-glycemic carbs in prime positions: ${carbPositionPenalty.carbsInTop5.join(', ')}`);
  }
  if (meatThreshold.capScore !== null) {
    redFlags.push(`Critical: <20% effective meat content - score capped at ${meatThreshold.capScore}`);
  }
  if (ashPenalty.penalty >= 5) {
    redFlags.push(`High ash content (${product.ash_percent}%) suggests by-products`);
  }
  if (potatoPeaManipulation.penalty > 5) {
    redFlags.push(`Ingredient manipulation detected: ${potatoPeaManipulation.details}`);
  }

  // v5.0: Hard cap for failing meat threshold (<20% meat = cap at 25 points)
  if (meatThreshold.capScore !== null && score > meatThreshold.capScore) {
    score = meatThreshold.capScore;
    details.meatThresholdCapApplied = true;
  }

  // Final cap: ensure score doesn't exceed max (52 points in v5.0)
  score = Math.max(0, Math.min(SCORING_WEIGHTS.INGREDIENT_QUALITY, score));

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

  // v5.0: Detect formula type for appropriate protein ranges
  const formulaType = detectFormulaType(product);
  // Store as string for details
  (details as any).formulaType = formulaType;

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

    // v5.0: Use formula-specific protein ranges
    const formulaRange = PROTEIN_RANGES[formulaType];
    const optimalMin = formulaRange.min;
    const optimalMax = formulaRange.max;
    const lowThreshold = formulaRange.min - 6; // 6% below optimal min
    const plateau = formulaRange.max + 10; // 10% above optimal max

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

  // v5.0: Hard cap to prevent overflow (max 33 points)
  score = Math.min(score, SCORING_WEIGHTS.NUTRITIONAL_VALUE);

  // Safety check: ensure score is valid
  const safeScore = isNaN(score) || !isFinite(score) ? 0 : score;

  return {
    score: Math.round(safeScore * 100) / 100,
    details,
    nutritionMeta
  };
}

/**
 * Calculate value for money score (v5.0: max 15 points, split 10+5) - Algorithm v5.0
 *
 * A) Price Competitiveness (10 points) - Category-anchored
 * B) Ingredient-Adjusted Value (5 points)
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
  details: Record<string, number | Record<string, number>>;
} {
  let score = 0;
  const details: Record<string, number | Record<string, number> | any> = {};

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
    return { score: 7.5, details: { valueRating: 7.5 } }; // Neutral score (50% of 15)
  }

  // ===========================================
  // A) PRICE COMPETITIVENESS (10 points) - v5.0 updated
  // ===========================================
  // Compared to category average price per kg
  let pricePoints = 0;

  if (priceRatio < 0.7) {
    // <70% of category average → 10 points
    pricePoints = VALUE_SCORING.PRICE_PER_FEED;
  } else if (priceRatio < 0.9) {
    // 70-90% → 8 points
    pricePoints = 8;
  } else if (priceRatio <= 1.1) {
    // 90-110% → 6 points (fair/average)
    pricePoints = 6;
  } else if (priceRatio <= 1.3) {
    // 110-130% → 4 points
    pricePoints = 4;
  } else {
    // >130% → 2 points
    pricePoints = 2;
  }

  score += pricePoints;
  details.pricePerFeed = pricePoints;

  // ===========================================
  // B) INGREDIENT-ADJUSTED VALUE (5 points) - v5.0 updated
  // ===========================================
  let qualityValuePoints = 0;

  if (ingredientQuality > 0) {
    const qualityRatio = ingredientQuality / SCORING_WEIGHTS.INGREDIENT_QUALITY; // Out of 52 in v5.0

    // Junk food penalty: cheap + poor quality
    if (priceRatio < 0.8 && qualityRatio < 0.5) {
      qualityValuePoints = 1.5;
      details.junkFoodPenalty = -2;
    } else {
      // v5.0: Smooth weighted formula adapted for 5 points
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

      // Combine: 5 * (55% quality + 45% value)
      qualityValuePoints = VALUE_SCORING.INGREDIENT_VALUE * (0.55 * qualityComponent + 0.45 * valueComponent);
    }
  } else {
    qualityValuePoints = 2.5; // Neutral if no ingredient data (50% of 5)
  }

  score += qualityValuePoints;
  details.ingredientAdjustedValue = qualityValuePoints;

  // ===========================================
  // v4.0: APPLY VALUE CAP BASED ON INGREDIENT QUALITY
  // ===========================================
  const valueCap = applyValueCap(score, ingredientQuality);
  if (valueCap.capApplied) {
    score = valueCap.cappedScore;
    details.valueCapApplied = valueCap.capApplied;
  }

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

  // Helper to get top 5 ingredients sorted by percentage
  const getTop5Ingredients = (): string[] => {
    if (product.ingredients_list && product.ingredients_list.length > 0) {
      // Sort by percentage (descending) for accurate top 5
      const sortedIngredients = [...product.ingredients_list].sort((a, b) => {
        const extractPercent = (str: string): number => {
          const match = str.match(/(\d+(?:\.\d+)?)\s*%/);
          return match ? parseFloat(match[1]) : 0;
        };
        return extractPercent(b) - extractPercent(a);
      });
      return sortedIngredients.slice(0, 5).map(i => i.toLowerCase());
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
