// Scoring Configuration for OnlyDogFood.com

export const SCORING_WEIGHTS = {
  INGREDIENT_QUALITY: 45, // 45 points max (increased from 40)
  NUTRITIONAL_VALUE: 33,  // 33 points max (increased from 30)
  VALUE_FOR_MONEY: 22,    // 22 points max (increased from 20)
} as const;

export const INGREDIENT_SCORING = {
  HIGH_MEAT_CONTENT: 15,      // >50% meat (soft cap at 65%)
  NO_FILLERS: 10,             // No corn, wheat, soy (-2 per filler)
  NO_ARTIFICIAL_ADDITIVES: 10, // No colors, preservatives
  NAMED_MEAT_SOURCES: 5,      // "Chicken" not "poultry"
  PROCESSING_QUALITY: 5,      // No highly processed ingredients
} as const;

export const NUTRITION_SCORING = {
  HIGH_PROTEIN: 15,           // 22-32% optimal (adjusted ranges)
  MODERATE_FAT: 8,            // 10-15% (penalty >20%)
  LOW_CARBS: 7,               // <30% (bonus for vegetables)
  FIBER_AND_MICRO: 3,         // Fiber, omega-3s, glucosamine, probiotics
} as const;

export const VALUE_SCORING = {
  PRICE_PER_FEED: 15,         // Price competitiveness (max 15 pts)
  INGREDIENT_VALUE: 7,        // Quality-adjusted value (max 7 pts)
  // Price ranges
  EXCELLENT: 20,   // <70% of category average
  GOOD: 15,        // 70-90% of average
  FAIR: 10,        // 90-110% of average
  POOR: 5,         // >110% of average
} as const;

// Fillers to detect
export const FILLERS = [
  'corn',
  'wheat',
  'soy',
  'by-product',
  'meal and bone',
  'animal digest',
  'corn gluten',
  'wheat gluten',
  'soybean meal',
] as const;

// Artificial additives to detect
export const ARTIFICIAL_ADDITIVES = [
  'bha',
  'bht',
  'ethoxyquin',
  'propylene glycol',
  'artificial color',
  'artificial flavour',
  'artificial flavor',
  'red 40',
  'yellow 5',
  'yellow 6',
  'blue 2',
] as const;

// Controversial but legal additives (-3 pts each)
export const CONTROVERSIAL_ADDITIVES = [
  'carrageenan',
  'guar gum',
  'xanthan gum',
  'sodium selenite',
  'menadione',
] as const;

// Highly processed ingredients (processing penalty)
export const PROCESSED_INGREDIENTS = [
  'meat meal',
  'bone meal',
  'meat and bone meal',
  'animal digest',
  'animal fat',
  'poultry fat',
  'rendered',
  'animal derivatives',
] as const;

// Vegetables (carb source bonus)
export const VEGETABLES = [
  'sweet potato',
  'peas',
  'carrots',
  'pumpkin',
  'spinach',
  'broccoli',
  'kale',
  'potato',
] as const;

// Beneficial micronutrients
export const BENEFICIAL_MICRONUTRIENTS = [
  'omega-3',
  'omega 3',
  'fish oil',
  'salmon oil',
  'glucosamine',
  'chondroitin',
  'probiotic',
  'prebiotic',
  'taurine',
  'l-carnitine',
] as const;

// Named meat sources (good)
export const NAMED_MEAT_SOURCES = [
  'chicken',
  'beef',
  'lamb',
  'turkey',
  'duck',
  'salmon',
  'fish',
  'venison',
  'bison',
  'pork',
] as const;

// Unnamed meat sources (poor quality)
export const UNNAMED_MEAT_SOURCES = [
  'poultry',
  'meat',
  'animal',
  'meat meal',
  'poultry meal',
] as const;

// Optimal nutritional ranges
export const OPTIMAL_RANGES = {
  PROTEIN_MIN: 22,            // Adjusted from 25
  PROTEIN_OPTIMAL_MIN: 22,
  PROTEIN_OPTIMAL_MAX: 32,    // Adjusted from 35
  PROTEIN_LOW_THRESHOLD: 18,  // Sharp penalty below this
  PROTEIN_PLATEAU: 35,        // Plateau at 13.5 pts
  MEAT_SOFT_CAP: 65,          // No extra reward beyond 65%
  FAT_MIN: 10,
  FAT_MAX: 15,
  FAT_PENALTY_THRESHOLD: 20,  // Penalty if fat >20%
  CARBS_MAX: 30,
  FIBER_MIN: 2,
  FIBER_MAX: 5,
} as const;

// Algorithm version for transparency
export const ALGORITHM_VERSION = '2.0.0';
export const LAST_UPDATED = '2025-12-24';
