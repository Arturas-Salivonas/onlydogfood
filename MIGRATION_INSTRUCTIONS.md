# Database Migration Instructions

## Step 1: Apply the Database Migration

You need to run the SQL migration in your Supabase database before running the ingredient migration script.

### Option A: Using Supabase Dashboard (Recommended)

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Go to **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the entire contents of `supabase/migrations/004_add_structured_ingredients.sql`
6. Paste into the SQL editor
7. Click **Run** or press `Ctrl+Enter`
8. Wait for "Success" message

### Option B: Using Supabase CLI

If you have Supabase CLI installed:

```bash
supabase db push
```

### Verify Migration

After running the migration, verify the tables were created:

```sql
-- Run this in SQL Editor to verify
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('product_ingredients', 'product_ingredient_groups');
```

You should see both tables listed.

---

## Step 2: Run the Ingredient Migration

After the database migration is complete, you can migrate your existing products.

### Dry Run (Test on 10 products first)

```bash
npm run migrate:ingredients -- --limit 10
```

This will:
- Process only the first 10 products
- Skip already analyzed products
- Show detailed output for each product

### Migrate All Unanalyzed Products

```bash
npm run migrate:ingredients
```

This will:
- Process all products that haven't been analyzed yet
- Skip products already analyzed (safe to run multiple times)

### Force Re-analyze All Products

```bash
npm run migrate:ingredients -- --all --force
```

⚠️ **WARNING:** This will re-analyze ALL products, even those already done.

### Migrate All Products (including already analyzed)

```bash
npm run migrate:ingredients -- --all
```

---

## What the Migration Does

For each product, the script will:

1. ✅ Parse `ingredients_raw` (or `ingredients_list` as fallback)
2. ✅ Extract declared percentages (e.g., "Chicken (20%)" → 20%)
3. ✅ Estimate percentages for ingredients without declared values
4. ✅ Classify each ingredient:
   - Category: meat, grain, vegetable, etc.
   - Quality tier: premium, standard, low-quality, filler
   - Flags: is_meat_source, is_filler, is_artificial, etc.
5. ✅ Detect ingredient splitting (e.g., chicken appears 3+ times)
6. ✅ Detect filler stuffing (20+ ingredients at <1%)
7. ✅ Calculate effective meat content (moisture-adjusted)
8. ✅ Save structured data to database
9. ✅ Update product metadata

---

## Expected Output

```
=== Ingredient Migration Script v3.0 ===

Found 142 products to migrate

[1/142] ✅ SUCCESS: Millies Wolfheart Countryside Mix
    Ingredients: 24, Declared %: 12
    Effective Meat: 42.5%, Fillers: 8.2%
    ⚠️  Split detected

[2/142] ✅ SUCCESS: COYA Freeze-Dried Puppy
    Ingredients: 7, Declared %: 6
    Effective Meat: 68.0%, Fillers: 0.0%

[3/142] ✅ SUCCESS: Royal Canin Veterinary Diet Renal
    Ingredients: 16, Declared %: 0
    Effective Meat: 12.5%, Fillers: 35.7%
    ⚠️  Filler stuffing detected

...

=== MIGRATION SUMMARY ===
Total products: 142
✅ Success: 140 (99%)
⏭️  Skipped: 0 (0%)
❌ Failed: 2 (1%)

✓ Migration complete!
```

---

## Troubleshooting

### Error: "Missing Supabase service role key"
- Check your `.env.local` file has `SUPABASE_SERVICE_ROLE_KEY`

### Error: "relation product_ingredients does not exist"
- You haven't run the database migration yet (Step 1)

### Error: "Failed to parse ingredients"
- Some products have malformed ingredient data
- These will be logged in the errors section
- You can manually fix them later in the admin UI

---

## Next Steps

After migration completes:

1. ✅ Verify data in database:
   ```sql
   SELECT COUNT(*) FROM product_ingredients;
   SELECT COUNT(*) FROM product_ingredient_groups;
   ```

2. ✅ Check products table:
   ```sql
   SELECT
     name,
     total_ingredients_count,
     has_ingredient_splitting,
     has_filler_stuffing,
     effective_meat_percent
   FROM products
   WHERE ingredients_analyzed = true
   LIMIT 10;
   ```

3. ✅ Test the admin UI (we'll build this next)

4. ✅ Update scoring algorithm to use new data

---

Ready to proceed?

1. Apply the database migration (Step 1)
2. Run test migration: `npm run migrate:ingredients -- --limit 10`
3. If successful, run full migration: `npm run migrate:ingredients`
