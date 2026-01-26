# v5.0 UI Display Fixes - January 23, 2026

## Summary

All UI components have been updated to correctly display v5.0 algorithm data and fix N/A display issues.

## Issues Fixed

### 1. **Score Maximum Values Updated** (v4.0 → v5.0)
Updated hardcoded maximum values across all components:
- Ingredient Quality: 45 → **52 points**
- Nutrition Value: 33 points (unchanged)
- Value for Money: 22 → **15 points**
- Protein Diversity: 5 → **8 points**

### 2. **Meat Content Display Fixed**
**Problem**: UI showed "N/A" for meat content because it was reading `meat_content_percent` (NULL in database).

**Solution**: Updated all components to use `effective_meat_percent` (populated by v5.0 algorithm).

**Why**: v5.0 algorithm calculates moisture-adjusted "effective meat" which is stored in `effective_meat_percent`. The legacy `meat_content_percent` column is not populated during recalculation.

### 3. **Carbohydrate Display Fixed**
**Problem**: UI showed "N/A" for carbs because `carbs_percent` is NULL in database.

**Solution**: Added on-the-fly calculation in ComparisonTable.tsx:
```typescript
carbs = 100 - protein - fat - fiber - moisture - ash
```

This provides accurate carb percentages without needing database schema changes.

## Files Updated

### Components Updated:
1. **components/features/ScoringDebugPanel.tsx**
   - Fixed Ingredient Quality display: "/45" → "/52"
   - Fixed Value score display: "/22" → "/15"
   - Changed meat display to use `effective_meat_percent`
   - Display now shows: "Effective Meat: 42%" instead of "Meat %: N/A"

2. **components/ui/ComparisonTable.tsx**
   - Updated all score maximums (52/33/15)
   - Changed meat content to use `effective_meat_percent`
   - Added carbs calculation for missing `carbs_percent` values
   - Now displays actual percentages instead of "N/A"

3. **components/ui/IngredientBreakdown.tsx**
   - Changed display from `meat_content_percent` to `effective_meat_percent`
   - Label updated to "Effective Meat" for clarity

4. **components/ui/FoodSummaryPanel.tsx**
   - Updated meat content threshold check to use `effective_meat_percent`
   - Flag displays "X% Meat" with effective percentage

5. **components/features/ProductDetail.tsx**
   - Updated meat content display to use `effective_meat_percent`
   - Changed label from "Claimed meat content" to "Effective meat content"
   - Updated problem detection to use `effective_meat_percent`

6. **components/pages/HowWeRatePage.tsx**
   - Updated example scores to reflect v5.0 values
   - Example now shows: 44/52, 30/33, 12/15 (total 86/100)

## Database Schema Notes

Current state:
- `meat_content_percent`: DECIMAL(5,2) - **NULL** (not populated by v5.0 recalculation)
- `effective_meat_percent`: DECIMAL(5,2) - **Populated** (v5.0 moisture-adjusted calculation)
- `carbs_percent`: DECIMAL(5,2) - **NULL** (not calculated during recalculation)

**Why this works**:
- v5.0 algorithm uses `effective_meat_percent` for scoring (accounts for moisture in fresh meats)
- Carbs can be calculated on-the-fly from guaranteed analysis
- No database migration needed

## Testing Checklist

- [x] Product detail pages show correct score maximums (52/33/15)
- [x] Debug panel displays "52/52" instead of "52/45"
- [x] Meat content displays actual percentage instead of "N/A"
- [x] Compare page shows meat percentages correctly
- [x] Carbohydrates display calculated values instead of "N/A"
- [x] Scoring breakdown shows all v5.0 features (8 pts protein diversity)
- [x] Product flags use effective meat percentage

## Result

✅ All v5.0 UI display issues resolved
✅ No more "N/A" displays for meat or carbs
✅ All score maximums updated to v5.0 values
✅ Algorithm calculations and display now consistent

The UI now accurately reflects the v5.0 scoring algorithm data!
