# Scoring Algorithm v4.0 Upgrade - Changelog

**Date**: January 22, 2026
**Version**: 4.0.0
**Previous Version**: 3.1.0

## Overview

Upgraded scoring algorithm with dog-first anti-gaming guardrails to ensure premium meat-forward formulas reliably outrank cheaper legume/grain-heavy formulas, even when those add "superfoods" or manipulate ingredient ordering.

## Core Principles Maintained

- ✅ Overall structure preserved: Ingredient Quality (45) + Nutritional Value (33) + Value for Money (22) = 100
- ✅ Backward compatible: Missing data handled gracefully with confidence warnings
- ✅ Transparent breakdown: All caps, penalties, and scaling factors are auditable
- ✅ No silent weight changes: Used guardrails, scaling, and caps instead

---

## 🔧 Changes to `scoring/config.ts`

### 1. Algorithm Version Updated
```typescript
export const ALGORITHM_VERSION = '4.0.0'; // Dog-first anti-gaming guardrails
export const LAST_UPDATED = '2026-01-22';
```

### 2. New Constants Added

#### Superfoods List (Signal-Only)
```typescript
export const SUPERFOODS_TERMS = [
  'blueberry', 'blueberries', 'cranberry', 'cranberries',
  'raspberry', 'turmeric', 'curcumin', 'ginger', 'kale',
  'spinach', 'spirulina', 'kelp', 'seaweed', ...
];
```
**Why**: Superfoods now contribute via a single bucket (+1 max) instead of stacking per ingredient.

#### Legume Derivatives for Splitting Detection
```typescript
export const LEGUME_DERIVATIVES = [
  'pea', 'peas', 'whole peas', 'green peas',
  'pea protein', 'pea flour', 'pea starch',
  'lentils', 'red lentils', 'chickpeas', ...
];
```
**Why**: Detect when brands split legumes into multiple forms to manipulate top-10 ingredients.

#### Low-Value Grains for Position Caps
```typescript
export const LOW_VALUE_GRAINS = [
  'rice', 'white rice', 'maize', 'corn',
  'wheat', 'sorghum', 'millet', ...
];
```
**Why**: Apply hard caps when these appear in top 3 positions.

#### Legume Split Penalties
```typescript
export const LEGUME_SPLIT_PENALTIES = {
  TWO_IN_TOP_10: -2,
  THREE_PLUS_IN_TOP_10: -5,
};
```
**Why**: Stricter than general split penalties - legume splitting is a common gaming tactic.

#### Grain Position Hard Caps
```typescript
export const GRAIN_POSITION_CAPS = {
  POSITION_1: 35,      // Cap Ingredient Quality at 35/45 if grain is #1
  POSITION_2_OR_3: 38, // Cap at 38/45 if grain is #2 or #3
};
```
**Why**: Grain-heavy formulas cannot achieve premium scores regardless of other factors.

#### Value for Money Caps
```typescript
export const VALUE_CAPS = {
  EXCELLENT: { minIngredientQuality: 40, maxValue: 22 }, // No cap
  GOOD: { minIngredientQuality: 35, maxValue: 14 },
  FAIR: { minIngredientQuality: 28, maxValue: 12 },
  POOR: { minIngredientQuality: 0, maxValue: 10 },
};
```
**Why**: Prevent low-quality cheap foods from outranking premium foods via price alone.

#### Superfoods Bucket Scoring
```typescript
export const SUPERFOODS_BUCKET = {
  TOP_10: 1.0,   // If superfood in top 10
  AFTER_10: 0.5, // If superfood after position 10
  MAX: 1.0,      // Maximum contribution
};
```
**Why**: Signal that superfoods are present, but don't allow stacking to inflate scores.

---

## 🔧 Changes to `scoring/ingredient-scoring.json`

### 1. Concentrated Meat Meals Downgraded
**Before (v3.1)**:
```json
"NAMED_CONCENTRATED_MEAT_MEALS": {
  "defaultPoints": 4
}
```

**After (v4.0)**:
```json
"NAMED_CONCENTRATED_MEAT_MEALS": {
  "description": "Named dehydrated or meal-based animal proteins (downgraded from +4 to +2 in v4.0)",
  "defaultPoints": 2
}
```
**Why**: Meal-based kibbles were scoring too high. Meals are good but shouldn't dominate fresh/raw formulas.

### 2. Superfoods Set to Zero Points
**Before (v3.1)**: Each superfood ingredient contributed points
**After (v4.0)**:
```json
"SUPERFOODS_SIGNAL_ONLY": {
  "description": "Superfoods and botanicals – signal only, scored in algorithm",
  "defaultPoints": 0,
  "ingredients": ["blueberries", "cranberries", "turmeric", ...]
}
```
**Why**: Superfoods are now scored via bucket logic in algorithm, not per-ingredient stacking.

---

## 🔧 Changes to `scoring/calculator.ts`

### 1. New v4.0 Helper Functions Added

#### `tokenizeIngredients(ingredientsText: string)`
- Splits ingredients by commas/semicolons
- Returns array of lowercase trimmed tokens
- **Used by**: All position-aware logic

#### `calculateSuperfoodsBucket(ingredientTokens: string[])`
```typescript
Returns: {
  score: number;        // 0, 0.5, or 1.0
  triggeredBy: string;  // Which ingredient triggered it
  position: number;     // Position in list
}
```
- Scans top 10 ingredients for superfoods → +1 point
- Scans after position 10 → +0.5 points
- Returns first match only (no stacking)

#### `detectLegumeSplitting(ingredientTokens: string[])`
```typescript
Returns: {
  penalty: number;  // -2 or -5
  matches: Array<{ ingredient: string; position: number }>;
}
```
- Counts legume forms in top 10
- 2+ matches → -2 penalty
- 3+ matches → -5 penalty

#### `applyGrainPositionCaps(ingredientTokens: string[], currentScore: number)`
```typescript
Returns: {
  cappedScore: number;
  capApplied: { capValue: number; reason: string; matchedIngredient: string; position: number } | null;
}
```
- Checks top 3 ingredients for low-value grains
- Position #1 → cap at 35/45
- Position #2-#3 → cap at 38/45

#### `applyValueCap(rawValueScore: number, ingredientQuality: number)`
```typescript
Returns: {
  cappedScore: number;
  capApplied: { capValue: number; reason: string; ingredientQualityUsed: number } | null;
}
```
- Caps Value for Money based on Ingredient Quality
- Poor ingredients (< 28) → max 10/22 value
- Fair (28-34) → max 12/22
- Good (35-39) → max 14/22
- Excellent (40+) → no cap

### 2. Updated Section F (Ingredient Bonus) - Now Meat-Anchored

**Before (v3.1)**: Simple cap at ±7 points, applied directly
```typescript
const ingredientBonus = Math.min(7, Math.max(-7, ingredientAnalysis.totalPoints));
score = Math.max(0, Math.min(45, score + ingredientBonus));
```

**After (v4.0)**: Meat-anchored with scaling
```typescript
// 1. Calculate raw bonus (includes superfoods bucket)
const ingredientBonusRaw = ingredientAnalysis.totalPoints + superfoodsBucket.score;

// 2. Cap at ±7
const ingredientBonusCapped = Math.min(7, Math.max(-7, ingredientBonusRaw));

// 3. Scale by meat content (low meat → reduced bonus)
const bonusMultiplier = Math.min(1, meatPercent / 50);
let ingredientBonusScaled = ingredientBonusCapped * bonusMultiplier;

// 4. Hard low-meat cap (only positive bonus capped, penalties allowed)
if (meatPercent < 30 && ingredientBonusScaled > 0) {
  ingredientBonusScaled = Math.min(ingredientBonusScaled, 2);
  lowMeatCapApplied = true;
}
```

**New Breakdown Stored**:
- `ingredientBonusRaw`: Total before capping
- `ingredientBonusCapped`: After ±7 cap
- `bonusMultiplier`: Meat-based scaling factor
- `ingredientBonusScaled`: Final contribution
- `lowMeatCapApplied`: Boolean flag
- `superfoodsBucketScore`: Superfoods contribution
- `superfoodsTriggeredBy`: Which ingredient
- `superfoodsPosition`: Position in list

### 3. New Legume Splitting Penalty Applied

**Added after Section F**:
```typescript
const legumeSplitting = detectLegumeSplitting(ingredientTokens);
if (legumeSplitting.penalty < 0) {
  score = Math.max(0, score + legumeSplitting.penalty);
  details.legumeSplitPenalty = legumeSplitting.penalty;
  details.legumeMatchesTop10 = legumeSplitting.matches;
  redFlags.push(`Legume splitting detected: ${legumeSplitting.matches.length} legume forms in top 10`);
}
```

### 4. New Grain Position Hard Cap Applied

**Added after legume penalty**:
```typescript
const grainCap = applyGrainPositionCaps(ingredientTokens, score);
if (grainCap.capApplied) {
  score = grainCap.cappedScore;
  details.ingredientQualityCapApplied = grainCap.capApplied;
  redFlags.push(grainCap.capApplied.reason);
}
```

### 5. Value Score Now Has Quality-Based Cap

**Added to `calculateValueScore()` function**:
```typescript
const valueCap = applyValueCap(score, ingredientQuality);
if (valueCap.capApplied) {
  score = valueCap.cappedScore;
  details.valueCapApplied = valueCap.capApplied;
}
```

---

## 📊 Order of Operations (v4.0)

```
1. Calculate Ingredient Quality subsections A–E
2. Calculate Section F (Ingredient Bonus) with:
   - Superfoods bucket calculation
   - Raw bonus calculation
   - Meat-anchored scaling
   - Low-meat cap application
3. Apply legume splitting penalty (if detected)
4. Apply grain position hard cap (if applicable)
5. Calculate Nutritional Value (unchanged from v3.1)
6. Calculate Value for Money (raw score)
7. Apply value cap based on Ingredient Quality
8. Sum to total score
9. Assign rating band
```

---

## 🎯 Impact Summary

### Anti-Gaming Measures Implemented

| Tactic | v3.1 Handling | v4.0 Guardrail |
|--------|---------------|----------------|
| Superfood stacking | Each superfood adds points | Max +1 from bucket, no stacking |
| Legume splitting | Generic penalty | Specific -2 to -5 penalty for top 10 |
| Grain-heavy recipes | Penalty system | Hard caps: 35 or 38/45 max |
| Low-quality + cheap = high score | Could happen | Value capped based on quality |
| Low meat + many bonuses | Could inflate | Bonus scaled by meat %, capped if <30% |
| Meal-heavy formulas | +4 per meal | +2 per meal (downgraded) |

### Expected Score Changes

**Premium Meat-Forward (50%+ meat, diverse proteins)**:
- ✅ Minimal change or slight increase
- ✅ Meat-anchored bonus rewards them fully
- ✅ No caps triggered

**Meal-Heavy Kibble (e.g., 4 different meals)**:
- ⬇️ **-8 to -12 points** (4 meals × 2 point reduction)
- Still scores well if quality is good, but not inflated

**Legume-Heavy (peas, lentils, chickpeas in top 10)**:
- ⬇️ **-2 to -5 points** legume split penalty
- Additional meat-scaling reduction if low meat

**Grain-Heavy (rice/corn as #1-3 ingredient)**:
- ⬇️ **Hard capped at 35-38/45** regardless of other factors
- Cannot achieve "Excellent" rating

**Pixie Dust (low meat + 20 superfoods)**:
- ⬇️ Superfoods contribute max **+1** instead of stacking
- ⬇️ Bonus scaled down by **50-100%** if meat < 50%
- ⬇️ Capped at **+2** if meat < 30%

**Low Quality + Cheap**:
- ⬇️ Value score capped at **10-12/22** instead of full 22

---

## 🧪 Testing Recommendations

Create test cases for:

1. **Pixie Dust Test**: 25% meat + 15 superfoods → should cap at ~65-70 (Good), not Excellent
2. **Legume Split Test**: Peas, lentils, pea protein in top 10 → -5 penalty
3. **Grain Position Test**: Rice #1 → Ingredient Quality capped at 35
4. **Value Cap Test**: Poor quality (IQ=30) + cheap → Value max 12/22
5. **Meal Downgrade Test**: 4 meals formula → compare v3.1 vs v4.0 scores
6. **Premium Formula Test**: 60% meat, 6 protein sources → should remain top-tier

---

## ✅ Backward Compatibility

- Missing meat data → defaults to 0%, triggers low-meat cap
- Missing ingredient list → tokenization returns empty array, no penalties applied
- All existing v3.1 scores remain deterministic
- Breakdown includes all v4.0 additions with clear labels
- Confidence scoring unchanged

---

## 📝 Notes

- All caps/penalties are stored in `details` object for full transparency
- Red flags array includes explanations for all triggered guardrails
- Scoring remains deterministic and reproducible
- No silent changes to existing weight distributions (45/33/22)

---

**End of Changelog**
