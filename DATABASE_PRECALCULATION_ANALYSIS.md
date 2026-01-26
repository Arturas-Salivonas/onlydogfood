# Database Precalculation Analysis & Optimization Plan

## Current State: What's Calculated Where

### ✅ Already Saved in Database (During Recalculation)
These fields are calculated once and stored in the `products` table:

```typescript
// Saved by recalculate-scores.ts:
- overall_score: number
- ingredient_score: number
- nutrition_score: number
- value_score: number
- scoring_breakdown: JSONB  // Full calculation details
- confidence_score: number
- confidence_level: string
- star_rating: number
- red_flag_override: object | null
- food_category: string
- effective_meat_percent: number  // v5.0: Moisture-adjusted meat
- ingredients_list: array  // Parsed from ingredients_raw
```

### ❌ NOT Saved (Calculated On-the-Fly)
These values are calculated during scoring but not persisted:

**1. Carbohydrates (`carbs_percent`)**
```typescript
// Currently calculated in UI:
carbs = 100 - protein - fat - fiber - moisture - ash

// Used in:
- ComparisonTable.tsx (on-the-fly calculation)
- Scoring algorithm (computeCarbsWithDefaults helper)
```

**2. Legacy Meat Content (`meat_content_percent`)**
```typescript
// v5.0 uses effective_meat_percent instead
// This column is NULL but still in schema
```

**3. Dry Matter Metrics**
```typescript
// Calculated during scoring, stored in scoring_breakdown JSONB:
- dmProtein
- dmFat
- dmFiber
- dmCarbs

// Not extracted to separate columns
```

**4. Energy Metrics**
```typescript
// Calculated during scoring:
- kcalPer100g (Modified Atwater formula)
- kcalPerKg
- Used for value scoring but not saved separately

// Currently in database:
- calories_per_100g (from product data, may be NULL)
```

## Recommendations: What SHOULD Be Precalculated

### 🟢 HIGH PRIORITY - Should Definitely Precalculate

#### 1. **Carbohydrates (`carbs_percent`)**
**Why**: Calculated from guaranteed analysis, rarely changes, used in multiple places
**Impact**: Currently recalculated on-the-fly in UI components
**Benefit**: Consistent display, easier querying, better performance

**Implementation**:
```typescript
// In recalculate-scores.ts, after getting product data:
const carbsPercent = product.carbs_percent || (
  100 -
  (product.protein_percent || 0) -
  (product.fat_percent || 0) -
  (product.fiber_percent || 0) -
  (product.moisture_percent || 10) - // Default 10%
  (product.ash_percent || 8)         // Default 8%
);

// Add to UPDATE:
carbs_percent: carbsPercent
```

#### 2. **Energy/Calories (`calculated_kcal_per_100g`)**
**Why**: Used for per-1000kcal value pricing, should be consistent
**Impact**: Currently calculated multiple times (scoring, value comparison)
**Benefit**: Single source of truth for energy calculations

**Implementation**:
```typescript
// Calculate using Modified Atwater if not provided:
const kcalPer100g = product.calories_per_100g || (
  3.5 * product.protein_percent +
  8.5 * product.fat_percent +
  3.5 * carbsPercent
);

// Add to UPDATE:
calculated_kcal_per_100g: kcalPer100g
```

### 🟡 MEDIUM PRIORITY - Nice to Have

#### 3. **Dry Matter Macros (Separate Columns)**
**Why**: Used in advanced nutrition analysis
**Impact**: Currently in scoring_breakdown JSONB, harder to query
**Benefit**: Easier filtering/sorting by DM protein, DM fat, etc.

**Implementation**:
```typescript
// Add new columns to schema:
- dm_protein_percent: DECIMAL(5,2)
- dm_fat_percent: DECIMAL(5,2)
- dm_fiber_percent: DECIMAL(5,2)
- dm_carbs_percent: DECIMAL(5,2)
```

#### 4. **Price Per 1000kcal**
**Why**: Used for energy-based value comparison
**Impact**: Currently calculated multiple times
**Benefit**: Easier price comparison queries

### 🔴 LOW PRIORITY - Keep Calculated

#### 5. **Scoring Details**
**Why**: Complex calculations that depend on category averages
**Impact**: Already in scoring_breakdown JSONB
**Benefit**: No need to flatten - JSONB works fine for nested data

#### 6. **Top 5 Ingredient Analysis**
**Why**: Dynamic analysis that changes with ingredient updates
**Impact**: Already in scoring_breakdown
**Benefit**: Better in JSONB - too many variations

## Migration Script: Add Missing Precalculated Fields

### Step 1: Update Database Schema
```sql
-- Add calculated carbs (should have been populated already)
UPDATE products
SET carbs_percent = 100 -
  COALESCE(protein_percent, 0) -
  COALESCE(fat_percent, 0) -
  COALESCE(fiber_percent, 0) -
  COALESCE(moisture_percent, 10) -
  COALESCE(ash_percent, 8)
WHERE carbs_percent IS NULL
  AND protein_percent IS NOT NULL
  AND fat_percent IS NOT NULL;

-- Add calculated calories if missing
ALTER TABLE products
ADD COLUMN IF NOT EXISTS calculated_kcal_per_100g DECIMAL(6,2);

UPDATE products
SET calculated_kcal_per_100g = COALESCE(
  calories_per_100g,
  3.5 * protein_percent + 8.5 * fat_percent + 3.5 * carbs_percent
)
WHERE calculated_kcal_per_100g IS NULL
  AND protein_percent IS NOT NULL
  AND fat_percent IS NOT NULL;
```

### Step 2: Update Recalculation Script

Add to `scripts/recalculate-scores.ts` (after line 250):

```typescript
// Calculate carbs if not present
const carbsPercent = product.carbs_percent ?? (
  100 -
  (product.protein_percent ?? 0) -
  (product.fat_percent ?? 0) -
  (product.fiber_percent ?? 0) -
  (product.moisture_percent ?? 10) -
  (product.ash_percent ?? 8)
);

// Calculate energy if not present
const calculatedKcal = product.calories_per_100g ?? (
  3.5 * (product.protein_percent ?? 0) +
  8.5 * (product.fat_percent ?? 0) +
  3.5 * carbsPercent
);

// Add to update:
const { error: updateError } = await supabase
  .from('products')
  .update({
    // ... existing fields ...
    carbs_percent: carbsPercent,
    calculated_kcal_per_100g: calculatedKcal,
    // ... rest of fields ...
  })
  .eq('id', product.id);
```

## Performance Impact

### Before (On-the-Fly Calculation)
- ComparisonTable renders: Calculates carbs for each product
- Product detail page: Calculates carbs, energy multiple times
- Sorting/filtering: Cannot use database indexes

### After (Precalculated)
- Database query returns ready values
- No UI computation needed
- Can add indexes for faster queries
- Consistent values across entire app

## Summary

### ✅ MUST DO (High Priority)
1. **Populate `carbs_percent`** - Simple calculation, high benefit
2. **Add `calculated_kcal_per_100g`** - Used for value scoring
3. **Update recalculation script** - Ensure future products have these values

### 🤔 CONSIDER (Medium Priority)
1. Dry matter columns for advanced filtering
2. Price per 1000kcal for easier comparison

### ⏸️ SKIP (Low Priority)
1. Flatten all scoring details (JSONB is fine)
2. Top 5 analysis (too dynamic)
3. Individual penalty/bonus fields (in JSONB already)

## Next Steps

1. ✅ Fix TypeScript build error (completed)
2. ⏭️ Run migration to populate `carbs_percent` for all products
3. ⏭️ Update recalculation script to include carbs and energy
4. ⏭️ Run `npm run recalculate-scores` to populate all fields
5. ⏭️ Remove on-the-fly carbs calculation from UI (already in DB)
