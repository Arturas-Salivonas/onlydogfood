# Dog Food Scoring System v3.0 - Implementation Progress

**Date:** January 15, 2026
**Status:** Phase 1 In Progress - Database & Core Services Complete

---

## ✅ COMPLETED (Ready to Deploy)

### 1. Database Migration
**File:** `supabase/migrations/004_add_structured_ingredients.sql`

**What it does:**
- Creates `product_ingredients` table for individual ingredient tracking
- Creates `product_ingredient_groups` table for split detection
- Adds new fields to `products` table:
  - `total_ingredients_count`
  - `ingredients_analyzed`
  - `declared_percentages_count`
  - `has_ingredient_splitting`
  - `has_filler_stuffing`
  - `effective_meat_percent`
  - `total_filler_percent`
- Adds automatic triggers for updating counts

**Your Action Required:**
```sql
-- Run this in your Supabase SQL Editor:
-- Copy the contents of 004_add_structured_ingredients.sql and execute
```

---

### 2. TypeScript Types
**File:** `types/index.ts`

**What was added:**
- `ProductIngredient` - Individual ingredient with percentages & classifications
- `ProductIngredientGroup` - Grouped ingredients for split detection
- `IngredientGroupMember` - Members of a group
- `MeatContentAnalysisV3` - Enhanced meat analysis
- `FillerAnalysisV3` - Enhanced filler detection
- `ProteinSourceAnalysisV3` - Protein quality verification
- `AbsoluteQuantitiesV3` - Gram calculations per package
- Updated `Product` interface with new fields

---

### 3. Ingredient Parsing Service
**File:** `lib/services/ingredient-parser.ts`

**Features:**
- Parses comma-separated ingredient lists
- Extracts declared percentages (e.g., "Chicken (20%)")
- Estimates percentages based on FDA/AAFCO rules:
  - Position 1: 25-50%
  - Position 2: 15-25%
  - Position 3: 10-18%
  - etc.
- Classifies each ingredient:
  - Category: meat, meal, grain, vegetable, fruit, fat, additive, supplement
  - Subcategory: fresh-meat, meal, dehydrated, etc.
  - Quality tier: premium, standard, low-quality, filler
- Sets flags: `is_meat_source`, `is_filler`, `is_artificial`, etc.

**Example Usage:**
```typescript
import { parseIngredients } from '@/lib/services/ingredient-parser';

const raw = "Chicken (20%), Rice, Chicken Meal (8%), Peas, Dried Chicken (5%)";
const parsed = parseIngredients(raw);
// Returns array of ParsedIngredient objects
```

---

### 4. Ingredient Analysis Service
**File:** `lib/services/ingredient-analyzer.ts`

**Features:**
- **Split Detection**: Identifies when same protein appears multiple times
  - Example: chicken + chicken meal + dried chicken = SPLITTING DETECTED
  - Severity levels: mild (2x), moderate (3x), severe (4+)
- **Filler Stuffing Detection**: Identifies gaming with many micro-ingredients
  - Triggers when 20+ fillers at <1% each
- **Meat Content Calculation**:
  - Moisture adjustment (fresh chicken = 75% water → 25% protein)
  - Meal counts at 100% (already concentrated)
  - Calculates effective meat content
- **Group Analysis**: Creates ingredient families (chicken-sources, rice-types, etc.)

**Example Usage:**
```typescript
import { analyzeIngredients } from '@/lib/services/ingredient-analyzer';

const analysis = analyzeIngredients(parsedIngredients, productId);
// Returns: groups, fillerStuffing, meatContent, flags
```

---

### 5. API Endpoint for Ingredient Management
**File:** `app/api/admin/products/[id]/ingredients/route.ts`

**Endpoints:**

#### GET `/api/admin/products/[id]/ingredients`
Retrieves all ingredients and groups for a product

#### POST `/api/admin/products/[id]/ingredients`
Parses ingredients_raw and saves structured data
```json
{
  "ingredients_raw": "Chicken (20%), Rice, Chicken Meal (8%)...",
  "force": false  // Set true to re-parse
}
```

Returns:
```json
{
  "success": true,
  "ingredients": [...],
  "groups": [...],
  "analysis": {
    "totalIngredients": 55,
    "declaredPercentages": 3,
    "hasIngredientSplitting": true,
    "hasFillerStuffing": true,
    "effectiveMeatPercent": 18.5,
    "totalFillerPercent": 25.3
  }
}
```

#### PUT `/api/admin/products/[id]/ingredients`
Updates individual ingredient
```json
{
  "ingredient_id": "uuid",
  "updates": {
    "percentage_declared": 25,
    "manually_verified": true,
    "notes": "Verified from product label"
  }
}
```

#### DELETE `/api/admin/products/[id]/ingredients?ingredient_id=uuid`
Removes an ingredient

---

## 📋 NEXT STEPS - What You Need to Input

### Step 1: Run the Database Migration

1. Open your Supabase Dashboard
2. Go to SQL Editor
3. Copy & paste contents of `supabase/migrations/004_add_structured_ingredients.sql`
4. Execute the migration
5. Verify tables created:
   ```sql
   SELECT * FROM product_ingredients LIMIT 1;
   SELECT * FROM product_ingredient_groups LIMIT 1;
   ```

### Step 2: Test the Parsing on a Sample Product

I need you to provide:

**Question 1:** Do you want me to create an admin UI component for managing ingredients, or should we test via API first?

**Question 2:** Should I create a bulk migration script to parse ALL existing products at once, or do you want to do it manually product-by-product?

**Question 3:** For the admin dashboard `/admin/products/[id]/edit`, do you want:
- A. Simple "Auto-parse ingredients" button
- B. Full ingredient editor with drag-reorder, manual percentages, etc.
- C. Both?

---

## 🎯 REMAINING TASKS

### High Priority (Need Your Input)

1. **Admin UI Enhancement** - Add ingredient management to product edit page
   - Parse button
   - Ingredient list with manual editing
   - Warning displays for splits/stuffing
   - Percentage override capability

2. **Migration Script** - Parse existing products
   - Iterate through all products
   - Parse ingredients_raw
   - Save to new tables
   - Log results

3. **Scoring Algorithm Update** - Implement v3.0 calculations
   - Use effective_meat_percent instead of meat_content_percent
   - Add split penalties
   - Add stuffing penalties
   - Add ingredient count penalties

### Medium Priority

4. **Product Page Visualization**
   - Show ingredient breakdown chart
   - Display warnings (splitting, stuffing)
   - Show "X kg of actual meat in this bag"

5. **Comparison Tools**
   - Side-by-side ingredient analysis
   - Highlight splitting/stuffing differences

---

## 🔧 HOW TO USE (For Admin)

Once we complete the admin UI, you'll be able to:

### Manual Product Editing

1. Go to `/admin/products/[product-id]/edit`
2. See current ingredients parsed
3. Click "Re-parse ingredients" if needed
4. Edit individual ingredients:
   - Change percentage (overrides estimate)
   - Mark as verified
   - Add notes
   - Change category/quality tier
5. See warnings:
   - ⚠️ "Ingredient splitting detected: Chicken appears 3 times"
   - ⚠️ "Filler stuffing detected: 45 micro-ingredients"
   - ⚠️ "Effective meat: 18% (declared 36%)"
6. Save changes → Automatic score recalculation

### API Usage (If you prefer)

Parse a product:
```bash
curl -X POST /api/admin/products/{id}/ingredients \
  -H "Content-Type: application/json" \
  -d '{
    "ingredients_raw": "Chicken (20%), Rice, Chicken Meal (8%)..."
  }'
```

Update an ingredient:
```bash
curl -X PUT /api/admin/products/{id}/ingredients \
  -H "Content-Type: application/json" \
  -d '{
    "ingredient_id": "uuid",
    "updates": {
      "percentage_declared": 25,
      "manually_verified": true
    }
  }'
```

---

## 📊 EXAMPLE: What You'll See

### Before (Current System):
```
Product: "Premium Chicken Dog Food"
Ingredients: Chicken, Rice, Chicken Meal, Peas, Dried Chicken, Corn...
Meat Content: 36%
Score: 85/100 ⭐⭐⭐⭐⭐
```

### After (v3.0 System):
```
Product: "Premium Chicken Dog Food"

Ingredients Analysis:
- Total Ingredients: 55
- Declared Percentages: 3
- Estimated Percentages: 52

⚠️ WARNINGS:
- Ingredient splitting detected: Chicken sources appear 4 times
- Filler stuffing detected: 40 ingredients at <1%
- Excessive ingredient count: 55 ingredients

Meat Content:
- Declared: 36% (Chicken 20% + Chicken Meal 8% + Dried Chicken 5% + Fat 3%)
- Effective (moisture-adjusted): 18%
  - Fresh chicken: 20% → 5% (75% water loss)
  - Chicken meal: 8% → 8% (already concentrated)
  - Dried chicken: 5% → 5% (already concentrated)

Filler Content:
- Total Fillers: 45 ingredients
- Total Filler %: 25%
- Fillers in top 5: 1
- Micro fillers (<1%): 40

This 10kg bag contains:
- 1.8kg actual meat (not 3.6kg)
- 2.5kg fillers
- 72g meat per 400g serving

Score: 68/100 ⭐⭐⭐⭐ (down from 85)
Penalties:
- -5 for ingredient splitting
- -4 for filler stuffing
- -5 for excessive ingredient count
- -3 for misleading meat content
```

---

## ❓ DECISIONS NEEDED FROM YOU

Please answer these questions so I can continue:

1. **Database Migration**: Ready to run the SQL migration? (Yes/No)

2. **Admin UI Preference**: Which do you prefer?
   - [ ] Simple "Parse" button + basic display
   - [ ] Full ingredient editor with manual controls
   - [ ] Both (simple by default, advanced on click)

3. **Bulk Migration**: Should I create a script to parse all existing products?
   - [ ] Yes, parse all at once
   - [ ] No, I'll do manually product by product
   - [ ] Parse only products with ingredients_raw filled

4. **Percentage Override Policy**: When admin manually sets a percentage, should it:
   - [ ] Override estimate and mark as "declared"
   - [ ] Keep separate (show both estimate and manual)
   - [ ] Require admin to verify all ingredients if one is changed

5. **UI Warnings Display**: How prominent should warnings be?
   - [ ] Subtle badges/icons
   - [ ] Yellow warning boxes
   - [ ] Red alert boxes for serious issues

6. **Public Display**: Should we show splitting/stuffing warnings on public product pages?
   - [ ] Yes, full transparency
   - [ ] Yes, but subtle
   - [ ] No, only in admin

---

## 🚀 READY TO PROCEED

The foundation is built. Once you answer the questions above, I'll:

1. Create the admin UI components
2. Build the bulk migration script
3. Update the scoring calculator to use new data
4. Add visualization components for product pages
5. Test everything together

**Estimated time to complete remaining tasks:** 2-3 hours

Let me know your preferences and I'll continue!
