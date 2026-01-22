// Scoring Configuration for OnlyDogFood.com - Algorithm v3.0

export const SCORING_WEIGHTS = {
  INGREDIENT_QUALITY: 45, // 45 points max
  NUTRITIONAL_VALUE: 33,  // 33 points max
  VALUE_FOR_MONEY: 22,    // 22 points max
} as const;

export const INGREDIENT_SCORING = {
  EFFECTIVE_MEAT_CONTENT: 15,  // ≥50% meat (soft cap at 65%, quality modifier)
  PROTEIN_DIVERSITY: 5,        // NEW: Bonus for multiple protein sources
  LOW_VALUE_FILLERS: 10,       // Start at 10, -2 per high-risk filler, -1 per low-value carb
  NO_ARTIFICIAL_ADDITIVES: 10, // Immediate 0 for red flags, -3 first, -2 each additional
  NAMED_MEAT_SOURCES: 5,       // All named → 5pts, mix → 2.5pts, generic → 0pts
} as const;

export const NUTRITION_SCORING = {
  PROTEIN_QUALITY: 15,        // 22-32% optimal with integrity modifier
  MODERATE_FAT: 8,            // 10-15% optimal, -2 if >20%
  LOW_CARBS: 7,               // <30% carbs + vegetable bonus
  FIBER_AND_MICRO: 3,         // Fiber (2pts) + functional micronutrients (3pts max)
} as const;

export const VALUE_SCORING = {
  PRICE_PER_FEED: 15,         // Category-anchored price competitiveness
  INGREDIENT_VALUE: 7,        // Quality-adjusted value scoring
} as const;

// High-Risk Fillers (-2 each)
export const HIGH_RISK_FILLERS = [
  'corn gluten meal',
  'wheat gluten',
  'soy protein isolate',
  'by-product',
  'generic by-product',
  'poultry by-product',
  'meat by-product',
] as const;

// Low-Value Carbohydrates - STRONGER penalties for grain-heavy formulas
export const LOW_VALUE_CARBS = [
  'white rice',
  'maize',
  'corn',
  'wheat',
] as const;

// Brown Rice - separate category (better than white rice, but still high GI)
export const BROWN_RICE_CARBS = [
  'brown rice',
  'whole brown rice',
  'wholegrain brown rice',
] as const;

// Neutral/Acceptable Carbs (0 penalty)
export const ACCEPTABLE_CARBS = [
  'oats',
  'barley',
  'quinoa',
  'sweet potato',
  'sweet potatoes',
  'potato',
  'potatoes',
] as const;

// v3.0: Grain severity levels for position-based penalties
export const GRAIN_SEVERITY = {
  HIGH_GLYCEMIC: ['white rice', 'maize', 'corn', 'wheat'],
  MEDIUM_GLYCEMIC: ['brown rice', 'whole brown rice'],
  LOW_GLYCEMIC: ['oats', 'barley', 'quinoa'],
} as const;

// v3.0: Protein source diversity categories
export const PROTEIN_SOURCE_TYPES = {
  POULTRY: ['chicken', 'turkey', 'duck', 'goose', 'quail', 'pheasant', 'guinea fowl'],
  RED_MEAT: ['beef', 'lamb', 'venison', 'bison', 'pork', 'wild boar', 'kangaroo', 'goat', 'rabbit', 'reindeer', 'ostrich'],
  FISH: ['salmon', 'herring', 'mackerel', 'sardine', 'hake', 'trout', 'whitefish', 'cod', 'haddock', 'pollock', 'anchovies'],
  EGGS: ['egg', 'eggs'],
  NOVEL_PROTEINS: ['insect', 'venison', 'kangaroo', 'wild boar', 'rabbit', 'bison'],
} as const;

// Red Flag Additives (automatic 0 for subsection, caps rating at ⭐⭐⭐)
export const RED_FLAG_ADDITIVES = [
  'ethoxyquin',
  'propylene glycol',
] as const;

// Artificial Colors (automatic 0 for subsection)
export const ARTIFICIAL_COLORS = [
  'artificial color',
  'artificial colour',
  'red 40',
  'yellow 5',
  'yellow 6',
  'blue 2',
  'caramel color',
] as const;

// Artificial Preservatives (first: -3, each additional: -2, ≥3 = hard zero)
export const ARTIFICIAL_PRESERVATIVES = [
  'bha',
  'bht',
  'tbhq',
  'propyl gallate',
] as const;

// Controversial but Legal Additives (-3 each)
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

// Vegetables (carb source bonus for nutrition scoring)
export const VEGETABLES = [
  'sweet potato',
  'sweet potatoes',
  'peas',
  'carrots',
  'pumpkin',
  'spinach',
  'broccoli',
  'kale',
  'potato',
  'potatoes',
  'butternut squash',
  'zucchini',
] as const;

// Fresh Meat Sources (70% water - lower protein density but high quality)
export const FRESH_MEAT_SOURCES = [
  'fresh chicken',
  'fresh beef',
  'fresh lamb',
  'fresh turkey',
  'fresh duck',
  'fresh salmon',
  'fresh fish',
  'fresh herring',
  'fresh mackerel',
  'raw whole herring',
  'raw turkey',
  'raw whole hake',
  'raw whole mackerel',
  'chicken breast',
  'beef meat',
  'lamb meat',
  'deboned chicken',
  'deboned beef',
  'deboned lamb',
  'deboned turkey',
  'fresh eggs',
  'fresh whole egg',
  'fresh chicken giblets',
] as const;

// Dehydrated/Meal Meat Sources (concentrated - 300% more protein than fresh)
export const DEHYDRATED_MEAT_SOURCES = [
  'chicken meal',
  'beef meal',
  'lamb meal',
  'turkey meal',
  'duck meal',
  'salmon meal',
  'fish meal',
  'herring meal',
  'mackerel meal',
  'sardine meal',
  'anchovy meal',
  'dehydrated chicken',
  'dehydrated beef',
  'dehydrated lamb',
  'dehydrated turkey',
  'dehydrated duck',
  'dehydrated salmon',
  'dehydrated fish',
  'dehydrated herring',
  'dehydrated mackerel',
  'dehydrated sardine',
  'dehydrated whitefish',
  'dried chicken',
  'dried beef',
  'dried lamb',
  'dried turkey',
] as const;

// Functional Micronutrients (categorized for +1 bonus each, max 3)
export const OMEGA_FATTY_ACIDS = [
  'omega-3',
  'omega 3',
  'fish oil',
  'salmon oil',
  'flaxseed oil',
  'dha',
  'epa',
] as const;

export const JOINT_SUPPORT = [
  'glucosamine',
  'chondroitin',
  'green lipped mussel',
  'msm',
] as const;

export const DIGESTIVE_SUPPORT = [
  'probiotic',
  'prebiotic',
  'lactobacillus',
  'bifidobacterium',
  'chicory root',
  'inulin',
] as const;

export const AMINO_ACIDS = [
  'taurine',
  'l-carnitine',
  'l-lysine',
  'methionine',
] as const;

// Named meat sources (good)
export const NAMED_MEAT_SOURCES = [
  'chicken',
  'beef',
  'lamb',
  'turkey',
  'duck',
  'salmon',
  'herring',
  'mackerel',
  'sardine',
  'hake',
  'trout',
  'whitefish',
  'venison',
  'bison',
  'pork',
  'rabbit',
  'kangaroo',
  'wild boar',
  'goat',
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
  PROTEIN_MIN: 22,
  PROTEIN_OPTIMAL_MIN: 22,
  PROTEIN_OPTIMAL_MAX: 32,
  PROTEIN_LOW_THRESHOLD: 18,
  PROTEIN_PLATEAU: 35,
  MEAT_SOFT_CAP: 65,
  FAT_MIN: 10,
  FAT_MAX: 15,
  FAT_PENALTY_THRESHOLD: 20,
  CARBS_MAX: 30,
  FIBER_MIN: 2,
  FIBER_MAX: 5,
} as const;

// Red Flag Override Rules (global rules that cap rating regardless of score)
export const RED_FLAG_RULES = {
  MAX_RATING_IF_ETHOXYQUIN: 3,           // ⭐⭐⭐ max if ethoxyquin present
  MAX_RATING_IF_UNNAMED_DIGEST: 3,       // ⭐⭐⭐ max if unnamed animal digest is primary
  MAX_RATING_IF_COLOR_PLUS_SWEETENER: 3, // ⭐⭐⭐ max if artificial color + sweeteners
} as const;

// Food Categories (for category-anchored pricing)
export const FOOD_CATEGORIES = [
  'dry',          // Dry kibble
  'wet',          // Wet/canned food
  'cold-pressed', // Cold-pressed
  'fresh',        // Fresh/refrigerated
  'raw',          // Raw/frozen
  'snack',        // Treats/snacks
] as const;

// Confidence Score Criteria
export const CONFIDENCE_CRITERIA = {
  FULL_DISCLOSURE: 30,           // Full ingredient % disclosure
  CLEAR_NUTRITIONAL_VALUES: 25,  // All protein/fat/fiber/moisture/ash values
  NAMED_SOURCING: 20,            // All animal sources named
  CARBS_PROVIDED: 15,            // Carbs explicitly stated (not calculated)
  MANUFACTURING_INFO: 10,        // Country of origin, facility info
} as const;

// Algorithm version for transparency
export const ALGORITHM_VERSION = '3.1.0'; // Updated with Fresh/Raw bonuses and improved categorization
export const LAST_UPDATED = '2026-01-16';

// v2.2: Feature Flags for gradual rollout
// IMPORTANT: Start with all flags FALSE for safe deployment
// Enable one-by-one after testing each feature
export const FEATURE_FLAGS = {
  USE_DM_NUTRITION: true,           // Dry matter normalization
  USE_KCAL_VALUE: true,              // Energy-based pricing (price per 1000kcal)
  USE_POSITION_WEIGHTING: true,      // Position-weighted ingredients (anti-pixie dust)
  USE_SPLIT_INGREDIENT_PENALTY: true // Split ingredient detection (anti-gaming)
} as const;

// v2.2: Moisture defaults by category (for DM calculation)
export const MOISTURE_DEFAULTS = {
  dry: 10,
  wet: 78,
  raw: 70,
  fresh: 65,
  'cold-pressed': 10,
  snack: 10,
} as const;

// v2.2: Ash defaults by category (for carbs calculation)
export const ASH_DEFAULTS = {
  dry: 8,
  wet: 2.5,
  raw: 3,
  fresh: 3,
  'cold-pressed': 8,
  snack: 6,
} as const;

// v2.2: Dry Matter (DM) optimal ranges
export const DM_OPTIMAL_RANGES = {
  PROTEIN_OPTIMAL_MIN: 24,
  PROTEIN_OPTIMAL_MAX: 38,
  PROTEIN_LOW_THRESHOLD: 20,
  PROTEIN_PLATEAU: 45,
  FAT_MIN: 12,
  FAT_MAX: 20,
  CARBS_MAX: 30,
  FIBER_MIN: 2,
  FIBER_MAX: 8,
} as const;

// v2.2: Split ingredient groups for anti-gaming detection
export const SPLIT_INGREDIENT_GROUPS = {
  LEGUMES: [
    'pea', 'peas', 'pea protein', 'pea flour', 'pea starch', 'pea fibre',
    'chickpea', 'chickpeas', 'chickpea flour',
    'lentil', 'lentils', 'lentil flour', 'red lentil', 'green lentil',
    'legume', 'legumes', 'bean', 'beans',
  ],
  CORN: [
    'corn', 'maize', 'corn gluten', 'corn gluten meal',
    'corn meal', 'corn flour', 'corn starch', 'flaked maize',
    'maize flour', 'maize meal', 'maize starch', 'maize gluten',
    'ground maize',
  ],
  RICE: [
    'rice', 'rice flour', 'rice starch', 'rice bran', 'rice meal',
    'brown rice', 'white rice', 'cooked white rice',
    'whole brown rice', 'wholegrain brown rice',
  ],
  POTATO: [
    'potato', 'potatoes', 'white potato', 'potato protein',
    'potato starch', 'potato flour',
    'tapioca', 'tapioca starch', 'cassava',
  ],
} as const;

// v2.2: Split ingredient penalties
export const SPLIT_INGREDIENT_PENALTIES = {
  TWO_IN_TOP_10: -1.5,
  THREE_PLUS_IN_TOP_10: -3,
} as const;

// v2.2: Tiered red flag rules
export const RED_FLAG_TIERS = {
  TIER_1_ETHOXYQUIN: {
    tier: 1,
    maxStars: 2,
    ingredients: ['ethoxyquin'],
    description: 'Ethoxyquin present (banned in human food)',
  },
  TIER_2_ARTIFICIAL_COLORS: {
    tier: 2,
    maxStars: 3,
    ingredients: [...ARTIFICIAL_COLORS],
    description: 'Artificial coloring agents present',
  },
  TIER_2_COLORS_SWEETENERS: {
    tier: 2,
    maxStars: 3,
    requiresAll: true,
    colorIngredients: [...ARTIFICIAL_COLORS],
    sweetenerIngredients: [
      'corn syrup', 'glucose syrup', 'wheat glucose syrup',
      'cane sugar', 'sugar', 'sucrose', 'fructose', 'dextrose',
    ],
    description: 'Contains artificial coloring and added sweeteners',
  },
  TIER_3_UNNAMED_DIGEST: {
    tier: 3,
    maxStars: 3,
    ingredientsInTop5: ['animal digest', 'meat digest'],
    description: 'Unnamed animal digest as primary ingredient',
  },
  TIER_4_CONTROVERSIAL_ADDITIVES: {
    tier: 4,
    maxStars: 4,
    threshold: 3,
    ingredients: [...CONTROVERSIAL_ADDITIVES],
    description: '3+ controversial additives present',
  },
} as const;
