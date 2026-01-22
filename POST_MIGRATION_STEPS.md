# Post-Migration Steps

## What Was Fixed

### 1. Migration Script Pagination ✅
**Problem**: Script only processed 1000 products (Supabase default limit)
**Solution**: Added pagination loop to fetch ALL products in batches of 1000

### 2. Scoring Calculator v3.0 Integration ✅
**Updates**:
- Now uses `effective_meat_percent` (moisture-adjusted) instead of `meat_content_percent`
- Added **-5 point penalty** for ingredient splitting
- Added **-4 point penalty** for filler stuffing
- Added **-3 point penalty** for excessive ingredient count (>60 ingredients)

### 3. Product Detail Page v3.0 Display ✅
**New Features**:
- Fetches structured ingredients from `product_ingredients` table
- Shows declared/estimated percentages for each ingredient
- Color-coded quality tiers (green=premium, red=filler, orange=low-quality)
- Warning badges for ingredient splitting and filler stuffing
- Table view with ingredient type, meat source indicators, artificial warnings
- Effective meat content displayed (moisture-adjusted)

## Next Steps (In Order)

### Step 1: Run the Migration (Required First)
```powershell
npm run migrate:ingredients
```

This will now process ALL 1700+ products. Expected output:
```
Fetching products...
Fetched 1000 products so far...
Fetched 1756 products so far...
Found 1756 products to migrate

[1/1756] ✅ SUCCESS: Product Name
   Ingredients: 24, Declared %: 8
   Effective Meat: 32.5%, Fillers: 12.3%
...
```

**How long**: ~10-15 minutes for 1700+ products

### Step 2: Recalculate All Scores with v3.0
After migration completes, recalculate scores to apply new penalties:

```powershell
npm run recalculate-scores
```

This will:
- Fetch all products (with pagination)
- Apply v3.0 scoring with split/stuffing penalties
- Update `overall_score`, `scoring_breakdown`, etc.

**How long**: ~10-15 minutes for 1700+ products

### Step 3: Verify in Admin Dashboard
1. Start dev server: `npm run dev`
2. Go to admin: `http://localhost:3000/admin/products`
3. Pick a product you know has ingredient splitting (e.g., multiple chicken sources)
4. Click edit
5. Scroll to "Ingredient Analysis (v3.0)" section
6. Click "Parse Ingredients" button
7. Verify:
   - ✅ Ingredients show percentages
   - ⚠️ Warning appears if splitting detected
   - 🥩 Meat sources flagged
   - Table shows all data correctly

### Step 4: Verify Public Product Pages
1. Go to any product page: `http://localhost:3000/dog-food/[slug]`
2. Scroll to "Ingredients breakdown" section
3. Verify:
   - ✅ Top 5 ingredients show percentages and color coding
   - ⚠️ Warning badges appear if split/stuffing detected
   - 📊 "View all ingredients" expands to show full table
   - 🥩 Effective meat content displayed

### Step 5: Check Score Changes
Products with gaming issues should now have lower scores:

**Example Expected Changes**:
- Royal Canin (grain-heavy, 60+ ingredients): Score might drop 3-7 points
- Products with "Chicken, Chicken Meal, Dried Chicken": -5 points for splitting
- Products with 20+ fillers at <1%: -4 points for stuffing

Check a few products:
```powershell
# In Supabase SQL editor or via API
SELECT
  name,
  overall_score,
  has_ingredient_splitting,
  has_filler_stuffing,
  total_ingredients_count,
  effective_meat_percent
FROM products
WHERE has_ingredient_splitting = true
   OR has_filler_stuffing = true
ORDER BY overall_score DESC
LIMIT 20;
```

### Step 6: Deploy to Production (Optional)
If everything looks good locally:

1. Commit changes:
```powershell
git add .
git commit -m "v3.0: Add structured ingredient system with split/stuffing detection"
git push origin main
```

2. Run migration on production database:
   - Copy `supabase/migrations/004_add_structured_ingredients.sql`
   - Paste into Production Supabase SQL Editor
   - Run it

3. Run migration script on production:
```powershell
# Set production env vars first
npm run migrate:ingredients
npm run recalculate-scores
```

4. Clear cache if using CDN/ISR:
```powershell
# Revalidate all product pages
# (Next.js ISR will auto-update over time with revalidate: 3600)
```

## What Changed in Each File

### Database
- ✅ `004_add_structured_ingredients.sql` - Already created
- New tables: `product_ingredients`, `product_ingredient_groups`
- New product columns: `total_ingredients_count`, `effective_meat_percent`, `has_ingredient_splitting`, etc.

### Scripts
- ✅ `scripts/migrate-ingredients.ts` - Fixed pagination (now fetches ALL products)
- ✅ `scripts/recalculate-scores.ts` - Already had pagination, now uses updated calculator

### Scoring
- ✅ `scoring/calculator.ts` - Added v3.0 penalties for splitting, stuffing, excessive ingredients

### Frontend
- ✅ `app/dog-food/[slug]/page.tsx` - Fetches structured ingredients and groups
- ✅ `components/features/ProductDetail.tsx` - Displays v3.0 ingredient data with warnings

## Expected Results

### Before v3.0
```
Product: Royal Canin Medium Adult
Score: 68/100
Ingredients: "Rice, Corn, Chicken Meal, Corn Gluten, ..." (plain text)
```

### After v3.0
```
Product: Royal Canin Medium Adult
Score: 61/100 (-7 from penalties)
Ingredients:
  ⚠️ Filler stuffing detected (excessive low-quality ingredients)
  ⚠️ Excessive ingredient count (72 ingredients)

  #1 Rice (28.5%) [grain]
  #2 Corn (18.2%) [grain] ⚠️
  #3 Chicken Meal (12.0%) [meal] 🥩
  ...

  Effective meat content: 14.3% (moisture-adjusted)
```

## Troubleshooting

### Migration is slow
- Normal! 1700 products × (parse + DB writes) = ~10-15 min
- Progress shows every 10 products: `[450/1756] ✅ SUCCESS`

### Some products fail
- Check error messages at end of migration summary
- Common issues: Missing ingredient data, malformed text
- Re-run with `--force` to retry: `npm run migrate:ingredients -- --force`

### Scores don't change after recalculate
- Make sure you ran migration FIRST
- Check `ingredients_analyzed = true` in database
- Verify `has_ingredient_splitting` and `has_filler_stuffing` are populated

### Product pages show old ingredient format
- Clear Next.js cache: Delete `.next` folder and restart dev server
- ISR cache: Wait 1 hour or manually revalidate

## Questions?

Check these files for reference:
- Migration logic: `scripts/migrate-ingredients.ts`
- Scoring logic: `scoring/calculator.ts` (lines 200-310)
- Display logic: `components/features/ProductDetail.tsx` (lines 850-950)
- Database schema: `supabase/migrations/004_add_structured_ingredients.sql`
