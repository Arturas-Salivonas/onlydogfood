// Scoring Configuration for OnlyDogFood.com

export const SCORING_WEIGHTS = {
  INGREDIENT_QUALITY: 45, // 45 points max (increased from 40)
  NUTRITIONAL_VALUE: 33,  // 33 points max (increased from 30)
  VALUE_FOR_MONEY: 22,    // 22 points max (increased from 20)
} as const;

export const INGREDIENT_SCORING = {
  HIGH_MEAT_CONTENT: 15,      // >50% meat
  NO_FILLERS: 10,             // No corn, wheat, soy
  NO_ARTIFICIAL_ADDITIVES: 10, // No colors, preservatives
  NAMED_MEAT_SOURCES: 5,      // "Chicken" not "poultry"
} as const;

export const NUTRITION_SCORING = {
  HIGH_PROTEIN: 15,           // >25% for adult dogs
  MODERATE_FAT: 8,            // 10-15%
  LOW_CARBS: 7,               // <30%
} as const;

export const VALUE_SCORING = {
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
  PROTEIN_MIN: 25,
  PROTEIN_OPTIMAL_MAX: 35,
  FAT_MIN: 10,
  FAT_MAX: 15,
  CARBS_MAX: 30,
  FIBER_MIN: 2,
  FIBER_MAX: 5,
} as const;
