# Scoring Algorithm v3.0 - Major Upgrade

**Date:** January 16, 2026
**Version:** 3.0.0
**Previous Version:** 2.2.0

## Problem Statement

The previous scoring algorithm had critical flaws that resulted in grain-heavy, lower-quality foods scoring higher than premium, protein-diverse formulas:

### Example Issue:
- **AVA Medium Breed Puppy:** 96/100 score
  - Ingredients: Chicken Meal (54.5%), Fresh Chicken (17.5%), **Brown Rice (22.5%)**, **Maize (12.5%)**, Beet Pulp
  - Single protein source (chicken only)
  - High grain content (35% combined)

- **Orijen Fit & Trim:** 69/100 score
  - Ingredients: Fresh Chicken (25%), 6 different fish sources, Fresh Eggs, Multiple dehydrated meats
  - **6+ different protein sources** (exceptional diversity)
  - **Zero grains** - uses legumes instead
  - **Premium quality** across the board

## Root Causes Identified

1. **Grain penalties too weak** - only -1 to -2 points for grains
2. **No diversity scoring** - single-source foods not penalized
3. **Fresh meat penalty** - incorrectly penalized high-quality fresh meats
4. **Brown rice treated as neutral** - should be penalized (high glycemic index)
5. **Ingredient bonus caps too low** - couldn't reward exceptional quality

---

## v3.0 Changes

### 1. Ingredient Categorization Overhaul (`ingredient-scoring.json`)

#### New Categories:
- **PREMIUM_FRESH_MEATS** (3 points) - Fresh meats, 70% moisture, excellent quality
- **CONCENTRATED_MEAT_MEALS** (4 points) - Dehydrated proteins, 300% more protein than fresh
- **PREMIUM_FISH_PROTEINS** (4 points) - Whole fish sources, omega-3 rich
- **WHOLE_EGGS** (3 points) - Complete protein, 94% digestibility

#### Updated Point Values:
| Category | Old Points | New Points | Reason |
|----------|-----------|-----------|---------|
| Chicken Meal | +1 | +4 | Concentrated protein source |
| Fresh Chicken | +2 | +3 | High quality but 70% water |
| Brown Rice | 0 | -1 | High glycemic index |
| Maize/Corn | -1 | -3 | Poor nutritional value |
| Organ Meats | +2 | +3 | Nutrient dense |
| Artificial Colors | -5 | -7 | Stronger deterrent |

### 2. Protein Source Diversity Scoring (NEW!)

**Allocation:** 5 points maximum

Foods are now rewarded for variety:

| Diversity Level | Criteria | Points | Examples |
|----------------|----------|--------|----------|
| Exceptional | 3+ types, 6+ sources | 5 | Orijen, Acana Premium |
| Excellent | 3+ types, 4-5 sources | 4 | High-end multi-protein |
| Good | 2 types, 3+ sources | 3 | Chicken + fish + egg |
| Moderate | 2 types or 2 sources | 2 | Chicken + beef |
| Single Source | 1 source only | 0 | Chicken-only formulas |

**Protein Type Categories:**
- Poultry: chicken, turkey, duck, etc.
- Red Meat: beef, lamb, venison, etc.
- Fish: salmon, herring, mackerel, etc.
- Eggs: whole eggs, egg protein
- Novel: insect, kangaroo, wild boar

### 3. Grain Penalty System (MASSIVELY STRENGTHENED)

#### Previous System:
- Grain as #1: -2 points
- 2+ grains in top 3: -4 points

#### New v3.0 System:

| Situation | Penalty | Impact |
|-----------|---------|--------|
| High-GI grain as #1 (maize, corn, white rice) | -8 points | SEVERE |
| 2+ high-GI grains in top 5 | -7 points | Very High |
| High-GI grain in top 3 | -5 points | High |
| High-GI grain in top 5 | -3 points | Moderate |
| Brown rice as #1 | -4 points | Moderate-High |
| Brown rice in top 3 | -2 points | Low-Moderate |

**High-Glycemic Grains:** white rice, maize, corn, wheat
**Medium-Glycemic:** brown rice
**Low-Glycemic:** oats, barley, quinoa (minimal penalty)

### 4. Fresh Meat Penalty REMOVED

**Reason:** Fresh meats are high-quality, highly digestible proteins. The previous penalty incorrectly assumed they were used for "gaming" when they're actually premium ingredients.

**Impact:**
- Orijen-style formulas with fresh chicken, fresh fish no longer penalized
- Foods still need sufficient meal proteins for dry matter protein density
- Diversity bonus rewards variety more than concentration

### 5. Increased Ingredient Bonus Cap

- **Previous:** ±5 points max
- **New:** ±7 points max

**Reason:** Allows algorithm to properly reward foods with exceptional ingredient profiles (multiple omega sources, diverse vegetables, superfoods, etc.)

### 6. Low-Value Carb Penalties Doubled

- **Previous:** -1 point per occurrence
- **New:** -2 points per occurrence

**Affected Ingredients:**
- Maize/corn
- White rice
- Wheat
- Tapioca (in some contexts)

### 7. Updated Scoring Breakdown

**Total: 100 points**

#### Ingredient Quality (45 points)
- A) Effective Meat Content: 15 points
- B) Protein Source Diversity: 5 points (**NEW**)
- C) Low-Value Fillers: 10 points
- D) Artificial Additives: 10 points
- E) Named Meat Sources: 5 points

#### Nutritional Value (33 points)
- Protein Quality: 15 points
- Moderate Fat: 8 points
- Low Carbs: 7 points
- Fiber & Micronutrients: 3 points

#### Value for Money (22 points)
- Price per feed: 15 points
- Ingredient value: 7 points

---

## Expected Impact

### Foods That Will Score Higher:
✅ Orijen, Acana (multi-protein, grain-free)
✅ Canagan (fish-based, diverse ingredients)
✅ Nutriment (raw, multiple protein sources)
✅ Pure, Wellness CORE (grain-free, quality proteins)

### Foods That Will Score Lower:
❌ Grain-heavy formulas (maize/corn as primary carb)
❌ Single-protein sources without diversity
❌ Brown rice as #1 ingredient
❌ Generic "meat meal" formulations

### Neutral Impact:
🔹 Quality foods with oats/barley (low-GI whole grains)
🔹 Single-protein but with eggs + fish oil supplements
🔹 Foods with sweet potato/legumes as carbs

---

## Testing Recommendations

1. **Recalculate all products** in database with new algorithm
2. **Spot check premium brands:**
   - Orijen Fit & Trim should score 85-95
   - AVA with high grain should score 70-80
   - Grain-free premium should generally score 80+

3. **Verify grain penalty impact:**
   - Foods with maize as #1 should drop significantly
   - Brown rice formulas should see moderate decrease
   - Oat/barley formulas should see minimal impact

4. **Check diversity bonus:**
   - Orijen 6 Flesh should get full 5 points
   - Single chicken formulas should get 0 points
   - Chicken + fish + egg should get 2-3 points

---

## Migration Notes

### Database Changes Needed:
- No database migration required (uses existing `ingredients_raw` and `ingredients_list`)
- Consider adding `protein_diversity_score` column for transparency

### Frontend Updates:
- Update scoring breakdown display to show diversity score
- Add diversity badge/indicator for 4-5 point diversity scores
- Update grain warnings to show severity level

### Admin Panel:
- Add filter for "High Diversity" products (≥4 points)
- Add alert for grain-heavy products (penalties ≥-5)

---

## Configuration Constants Updated

### `config.ts`:
```typescript
export const ALGORITHM_VERSION = '3.0.0';
export const LAST_UPDATED = '2026-01-16';

export const INGREDIENT_SCORING = {
  EFFECTIVE_MEAT_CONTENT: 15,
  PROTEIN_DIVERSITY: 5,        // NEW!
  LOW_VALUE_FILLERS: 10,
  NO_ARTIFICIAL_ADDITIVES: 10,
  NAMED_MEAT_SOURCES: 5,
};

export const GRAIN_SEVERITY = {
  HIGH_GLYCEMIC: ['white rice', 'maize', 'corn', 'wheat'],
  MEDIUM_GLYCEMIC: ['brown rice', 'whole brown rice'],
  LOW_GLYCEMIC: ['oats', 'barley', 'quinoa'],
};

export const PROTEIN_SOURCE_TYPES = {
  POULTRY: [...],
  RED_MEAT: [...],
  FISH: [...],
  EGGS: [...],
  NOVEL_PROTEINS: [...],
};
```

---

## Research Sources

This update is based on:

1. **Canine nutrition research:**
   - Protein digestibility studies
   - Glycemic index impact on dogs
   - Ingredient quality standards

2. **Industry best practices:**
   - AAFCO standards
   - Biologically appropriate feeding
   - Whole prey model principles

3. **User feedback:**
   - Premium brands under-scored
   - Grain-heavy foods over-scored
   - Need for diversity recognition

---

## Rollback Plan

If issues arise:
1. Revert `config.ts` to v2.2.0 constants
2. Revert `calculator.ts` grain penalty section
3. Disable diversity bonus (set to 0)
4. Keep improved `ingredient-scoring.json` (compatible with v2.2)

---

## Next Steps

1. ✅ Deploy to staging
2. ⏳ Run test suite with sample products
3. ⏳ Review top 100 products for accuracy
4. ⏳ Deploy to production
5. ⏳ Monitor user feedback for 1 week
6. ⏳ Fine-tune thresholds if needed

---

**Author:** OnlyDogFood Development Team
**Approved By:** [Pending Review]
