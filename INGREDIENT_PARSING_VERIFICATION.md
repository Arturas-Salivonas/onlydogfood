# Ingredient Parsing Format Verification Report

## Date: January 25, 2026

### ✅ CONFIRMED: Parser Handles All Formats Correctly

The ingredient parsing system in `/lib/services/ingredient-parser.ts` correctly handles all the different percentage formats found in your database:

## Supported Formats

### 1. **Percentage After Name**
```
Format:    "Salmon Meal 20%"
Extracted: 20% (declared)
Clean:     "Salmon Meal"
```

### 2. **Percentage Before Name**
```
Format:    "20% Salmon Meal"
Extracted: 20% (declared)
Clean:     "Salmon Meal"
```

### 3. **Percentage in Parentheses**
```
Format:    "Rice (17%)"
Extracted: 17% (declared)
Clean:     "Rice"
```

### 4. **Decimal Percentages**
```
Format:    "Whole Ground Oats (4.5%)"
Extracted: 4.5% (declared)
Clean:     "Whole Ground Oats"
```

### 5. **Very Small Percentages**
```
Format:    "Yucca Extract (0.02%)"
Extracted: 0.02% (declared)
Clean:     "Yucca Extract"
```

### 6. **Trailing Periods** ✅ FIXED
```
Format:    "Chicken."
Extracted: null (estimated based on position)
Clean:     "Chicken"

Format:    "Yucca Extract (0.01%)."
Extracted: 0.01% (declared)
Clean:     "Yucca Extract"
```

### 7. **No Percentage**
```
Format:    "Maize"
Extracted: null (estimated based on position)
Clean:     "Maize"
```

## Regex Patterns Used

The parser uses 3 regex patterns in order:

1. `\((\d+(?:\.\d+)?)\s*%\)` - Matches percentages in parentheses: `(17%)`
2. `(\d+(?:\.\d+)?)\s*%` - Matches all percentage formats: `20%`, `12.5%`
3. `\(min(?:imum)?\s+(\d+(?:\.\d+)?)\s*%\)/i` - Matches minimum percentages: `(min 20%)`

## Real Database Test Results

### Product: Morrisons Natural Complete Wheat Free Dry

**ingredients_raw:**
```
Salmon Meal 20%, Fresh Salmon 14%, Salmon 12%, Salmon Oil 4%, Maize, Rice (17%), Barley, Dried Beet Pulp, Dried Brewers Yeast, Poultry Digest, Minerals, Sodium Chloride, Potassium Chloride, Chicory Extract 0.1%, Marigold Meal, Yucca Extract (0.01%)
```

**Parsing Results:**
- ✅ Salmon Meal: 20% (declared)
- ✅ Fresh Salmon: 14% (declared)
- ✅ Salmon: 12% (declared)
- ✅ Salmon Oil: 4% (declared)
- ✅ Rice: 17% (declared)
- ✅ Chicory Extract: 0.1% (declared)
- ✅ Yucca Extract: 0.01% (declared)
- ✅ Maize, Barley, etc.: Estimated based on position

### Product: Wainwright's Small Breed Adult Dry Food

**ingredients_list:**
```json
[
  "31% Dried Turkey",
  "5% Freshly Prepared Turkey",
  "Rice (26%)",
  "Whole Grain Barley (17%)",
  "Rapeseed Oil",
  "Whole Ground Oats (4.5%)",
  "Beet Pulp (4%)",
  "12.5% Dried Peas",
  "Linseed (2%)",
  "8% Dried Carrots",
  "Seaweed (0.2%)",
  "Yucca Extract (0.02%)"
]
```

**Parsing Results:**
- ✅ All percentages correctly extracted
- ✅ Mixed formats handled properly:
  - `31% Dried Turkey` (before)
  - `Rice (26%)` (in parentheses)  
  - `Whole Ground Oats (4.5%)` (in parentheses with decimal)
  - `12.5% Dried Peas` (before with decimal)

## Code Enhancement Applied

Added trailing period removal to the cleanName function:

```typescript
const cleanName = rawText
  .replace(/\(\d+(?:\.\d+)?\s*%\)/g, '')
  .replace(/\d+(?:\.\d+)?\s*%/g, '')
  .replace(/\(min(?:imum)?\s+\d+(?:\.\d+)?\s*%\)/gi, '')
  .replace(/\(\d+(?:\.\d+)?\s*(?:mg|g|mcg|iu|cfu)(?:\/kg)?\)/gi, '')
  .replace(/\.$/, '')  // ✅ ADDED: Remove trailing period
  .trim();
```

## Scoring Calculation Impact

### ✅ Percentage Detection Works Correctly

The scoring algorithm uses `percentage_declared` when available, otherwise falls back to `percentage_estimated` based on ingredient position. This means:

1. **Declared percentages**: Used directly in calculations (highest accuracy)
2. **Estimated percentages**: Calculated based on FDA/AAFCO ordering rules

### Example Calculation:
```
Position 1: 25-50% (uses midpoint: 37.5%)
Position 2: 15-25% (uses midpoint: 20%)
Position 3: 10-18% (uses midpoint: 14%)
...and so on
```

### Percentage Format Impact: **NONE**

Whether the percentage is written as:
- `20% Salmon Meal`
- `Salmon Meal 20%`
- `Salmon Meal (20%)`

The parser extracts **20%** and uses it in calculations the same way.

## Summary

✅ **All percentage formats are correctly recognized**
✅ **Trailing periods are now removed**
✅ **Decimal percentages work correctly**
✅ **Mixed formats in same product work correctly**
✅ **Scoring calculations use correct percentages**
✅ **No changes needed to existing scoring algorithm**

## Recommendations

1. ✅ **No parser changes needed** - Already working correctly
2. ✅ **Trailing period removal** - Added in this update
3. ⚠️ **Some old products may need re-parsing** to benefit from period removal

To re-parse a product:
```bash
# Via admin panel: Click "Parse Ingredients" button
# Or via API: POST /api/admin/products/{id}/ingredients
```

---

**Conclusion**: Your ingredient parsing system is robust and handles all the different formats in your database correctly. The scoring calculations are accurate regardless of how percentages are formatted.
