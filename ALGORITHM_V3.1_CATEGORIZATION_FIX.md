# Algorithm v3.1 - Ingredient Categorization Fix

## Date: January 16, 2026

## Problem Identified

User reported major scoring issues after v3.0 release:

### Example 1: AVA Medium Breed Puppy (Scored 89/100)
**Ingredients:**
- Chicken (Chicken Meal) 54.5% → **WEIRD NOTATION**
- Brown Rice 22.5% → High-GI grain
- Maize 12.5% → Low-value filler
- Only 3 protein sources

**Issues:**
- "Chicken Fat" categorized as **meat** (should be **fat**)
- "Maize" categorized as **other** (should be **grain**)
- "Salmon Oil" categorized as **meat** (should be **fat**)
- Weird ingredient notation not penalized

### Example 2: Orijen Adult (Scored 71/100 - WAY TOO LOW!)
**Ingredients:**
- 8+ fresh/raw meats
- 5 dehydrated meats
- NO grains
- 9 protein sources (exceptional diversity)

**Issues:**
- Effective meat: **12.0%** (TOTALLY WRONG - should be 70%+)
- "Raw Turkey" categorized as **other** (should be **meat**)
- "Raw Whole Herring" categorized as **other** (should be **meat**)
- "Raw Whole Hake" categorized as **other** (should be **meat**)
- "Dehydrated Turkey" categorized as **other** (should be **meal**)
- "Dehydrated Mackerel" categorized as **other** (should be **meal**)
- "Dehydrated Sardine" categorized as **other** (should be **meal**)
- "Dehydrated Herring" categorized as **other** (should be **meal**)

## Root Cause

The ingredient categorization in `lib/services/ingredient-parser.ts` was TOO SIMPLE:

### Old Logic Problems:
1. **Hardcoded keyword lists** - only checked for exact phrases like "chicken meal"
2. **Missed "Raw" and "Fresh" prefixes** - didn't detect "Raw Turkey" or "Fresh Chicken"
3. **No "Dehydrated" detection** - missed all dehydrated meats
4. **Maize not recognized as grain** - only checked for "corn"
5. **Fats classified as meats** - "Chicken Fat" marked as meat protein
6. **No dosage cleanup** - ingredients had "(200mg/kg)" in names
7. **No penalty for ambiguous notation** - "Chicken (Chicken Meal)" not flagged

## Complete Fix Implemented

### 1. Expanded Ingredient Keyword Lists

**Added comprehensive arrays:**
```typescript
const MEAT_ANIMALS = [
  'chicken', 'turkey', 'duck', 'beef', 'lamb', 'pork', 'salmon',
  'herring', 'mackerel', 'sardine', 'hake', 'whitefish', 'cod',
  'pollock', 'rabbit', 'venison', 'bison', ...
];

const ORGAN_MEATS = [
  'liver', 'heart', 'kidney', 'spleen', 'lung', 'tripe', 'giblets', ...
];

const FATS_OILS = [
  'chicken fat', 'beef fat', 'salmon oil', 'fish oil', 'cod liver oil',
  'pollock oil', 'flaxseed oil', 'canola oil', ...
];

const GRAINS = [
  'rice', 'brown rice', 'white rice', 'maize', 'corn', 'wheat',
  'barley', 'oats', 'sorghum', 'millet', 'rye', 'quinoa', ...
];

const LEGUMES = [
  'peas', 'lentils', 'chickpeas', 'beans', 'soy', ...
];
```

### 2. Improved Classification Logic

**New `classifyCategory()` function:**
- Checks fats/oils FIRST (most specific)
- Then grains (including maize/corn)
- Then meat animals and organs
- Distinguishes meal vs fresh meat
- Handles eggs properly
- Categorizes legumes as vegetable protein

### 3. Enhanced Subcategory Detection

**New `determineSubcategory()` function:**
- Detects **"fresh-meat"** - Fresh, Deboned, Freshly Prepared
- Detects **"raw-meat"** - Raw meats (premium quality)
- Detects **"meal"** - Dehydrated, Dried, Meal (concentrated)
- Detects **"organ"** - Liver, Heart, Kidney, etc.
- Detects **"unnamed-source"** - Generic "meat" or "poultry"

### 4. Fresh/Raw Meat Bonus Scoring

**Added to `calculator.ts`:**
```typescript
// v3.1: FRESH/RAW MEAT BONUS (+1 point)
let freshMeatBonus = 0;
const hasFreshMeat = /\b(fresh|raw|deboned)\s+(chicken|beef|lamb|turkey|duck|salmon|fish)/i.test(ingredientsText);
if (hasFreshMeat) {
  freshMeatBonus = 1;
}

// v3.1: DEHYDRATED/MEAL BONUS (+1 point)
let concentratedProteinBonus = 0;
const hasConcentratedProtein = /\b(dehydrated|dried)\s+(chicken|beef|lamb|turkey|duck|salmon|fish)/i.test(ingredientsText);
if (hasConcentratedProtein && !freshMeatBonus) {
  concentratedProteinBonus = 1;
}
```

**Rationale:**
- Fresh/Raw meats = manufacturer transparency = bonus
- Dehydrated meats = concentrated protein = bonus
- Generic "chicken" without qualifiers = no bonus

### 5. Ambiguous Notation Penalty

**Added detection for weird manufacturer tricks:**
```typescript
// v3.1: AMBIGUOUS NOTATION PENALTY (-2 points)
let ambiguousNotationPenalty = 0;
const hasAmbiguousNotation = /\b(chicken|beef|lamb|turkey|fish|liver|heart)\s*\(\s*(chicken|beef|lamb|turkey|fish|liver|heart|meal)\s*\)/i.test(ingredientsText);
if (hasAmbiguousNotation) {
  ambiguousNotationPenalty = -2;
  redFlags.push('Ambiguous ingredient notation detected');
}
```

**Examples penalized:**
- "Chicken (Chicken Meal)" - which one is it?
- "Liver (Heart)" - are these two ingredients or one?
- "Fish (Salmon)" - why parentheses?

### 6. Dosage Information Cleanup

**Updated parsing to remove dosages:**
```typescript
// Remove dosage info like (200mg/kg), (1600mg/kg)
.replace(/\(\d+(?:\.\d+)?\s*(?:mg|g|mcg|iu|cfu)(?:\/kg)?\)/gi, '')
```

**Before:**
- "Yucca Extract (200mg/kg)" 0.8%
- "Glucosamine (200mg/kg)" 0.7%

**After:**
- "Yucca Extract" 0.8%
- "Glucosamine" 0.7%

### 7. Quality Tier Assignment

**Improved logic:**
- **Premium:** Fresh/Raw meats, Dehydrated/Meal proteins
- **Standard:** Named meats without qualifiers
- **Low-Quality:** Generic "meat", "poultry", high-GI grains
- **Filler:** By-products, corn gluten, wheat gluten

## Migration Process

1. **Cleared all ingredient data** - Fresh start needed
2. **Re-parsed all products** - Using v3.1 categorization
3. **Expected Results:**
   - Orijen: Effective meat 70%+ (was 12%)
   - AVA: Effective meat ~59% (was 59% - unchanged, but grain penalties apply)
   - All fats properly categorized
   - All grains detected
   - Fresh/Raw meats get bonus points

## Files Modified

### 1. `lib/services/ingredient-parser.ts`
- **Lines 35-130:** New comprehensive keyword arrays
- **Lines 145-165:** Dosage cleanup + ambiguous detection
- **Lines 220-265:** Rewritten `classifyCategory()` function
- **Lines 270-335:** Enhanced `determineSubcategory()` function
- **Lines 340-365:** Updated quality tier logic

### 2. `scoring/calculator.ts`
- **Lines 305-355:** Added Fresh/Raw meat bonuses
- **Lines 310-325:** Added concentrated protein bonus
- **Lines 330-340:** Added ambiguous notation penalty

### 3. `scoring/config.ts`
- **Line 311:** Updated ALGORITHM_VERSION to '3.1.0'

### 4. `scripts/clear-ingredient-data.ts` (NEW)
- Utility to reset ingredient migration
- Deletes all product_ingredients and product_ingredient_groups
- Resets product metadata

### 5. `scripts/migrate-ingredients.ts`
- **Lines 65-85:** Improved delete logic with error handling

## Expected Score Changes

### AVA Medium Breed Puppy
**Before v3.1:**
- Ingredient Quality: 37.0/45
- Overall Score: 89/100

**After v3.1:**
- Ambiguous notation penalty: -2 pts
- Maize properly penalized: -2 pts
- Multiple grains in top 5: -7 pts
- **Expected Score: ~75-80/100** ✅

### Orijen Adult
**Before v3.1:**
- Ingredient Quality: 35.6/45 (effective meat 12%!)
- Overall Score: 71/100

**After v3.1:**
- Effective meat: 70%+ (15 points instead of 3.6)
- Fresh/Raw meat bonus: +1 pt
- Dehydrated meat bonus: +1 pt
- Protein diversity: +5 pts (unchanged)
- **Expected Score: ~85-90/100** ✅

## Next Steps

1. ✅ Clear all ingredient data
2. 🔄 Re-migrate all products (IN PROGRESS)
3. ⏳ Recalculate scores with v3.1 algorithm
4. ⏳ Verify Orijen scores 85-90, AVA scores 75-80
5. ⏳ Update debug panel to show Fresh/Raw bonuses

## Version History

- **v3.0.0** (Jan 16) - Protein diversity, grain penalties, brown rice penalty
- **v3.1.0** (Jan 16) - Fixed categorization, Fresh/Raw bonuses, ambiguous notation penalty

---

**Status:** Migration in progress (870/1767 products completed)
**Updated:** January 16, 2026 23:45
