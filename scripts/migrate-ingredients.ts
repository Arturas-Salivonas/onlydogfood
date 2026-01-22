#!/usr/bin/env node

/**
 * Ingredient Migration Script (Algorithm v3.0)
 *
 * Migrates existing products to structured ingredient format:
 * 1. Parses ingredients_raw (preferred) or ingredients_list
 * 2. Extracts declared percentages
 * 3. Estimates missing percentages
 * 4. Classifies each ingredient
 * 5. Detects splits and stuffing
 * 6. Updates product metadata
 *
 * Usage: npm run migrate:ingredients
 */

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { getServiceSupabase } from '../lib/supabase';
import { parseIngredients } from '../lib/services/ingredient-parser';
import { analyzeIngredients } from '../lib/services/ingredient-analyzer';

interface MigrationStats {
  total: number;
  success: number;
  failed: number;
  skipped: number;
  alreadyAnalyzed: number;
  errors: Array<{ productId: string; productName: string; error: string }>;
}

async function migrateProduct(
  productId: string,
  productName: string,
  ingredientsRaw: string | null,
  ingredientsList: string[] | null,
  force: boolean = false
): Promise<{ success: boolean; error?: string; analysis?: any }> {
  const supabase = getServiceSupabase();

  try {
    // Prefer ingredients_raw, fall back to ingredients_list
    let ingredientText = ingredientsRaw;

    if (!ingredientText && ingredientsList && ingredientsList.length > 0) {
      // Convert array to comma-separated string
      ingredientText = ingredientsList.join(', ');
    }

    if (!ingredientText || ingredientText.trim().length === 0) {
      return { success: false, error: 'No ingredient data available' };
    }

    // Parse ingredients
    const parsedIngredients = parseIngredients(ingredientText);

    if (parsedIngredients.length === 0) {
      return { success: false, error: 'Failed to parse ingredients' };
    }

    // Analyze for groups and patterns
    const analysis = analyzeIngredients(parsedIngredients, productId);

    // Delete existing data if force=true
    if (force) {
      const { error: deleteIngredientsError } = await supabase
        .from('product_ingredients')
        .delete()
        .eq('product_id', productId);

      if (deleteIngredientsError) {
        console.warn(`Warning: Failed to delete existing ingredients for ${productName}:`, deleteIngredientsError.message);
      }

      const { error: deleteGroupsError } = await supabase
        .from('product_ingredient_groups')
        .delete()
        .eq('product_id', productId);

      if (deleteGroupsError) {
        console.warn(`Warning: Failed to delete existing groups for ${productName}:`, deleteGroupsError.message);
      }

      // Small delay to ensure deletion completes
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Insert ingredients
    const ingredientsToInsert = parsedIngredients.map(ing => ({
      product_id: productId,
      position: ing.position,
      ingredient_name: ing.ingredient_name,
      ingredient_normalized: ing.ingredient_normalized,
      percentage_declared: ing.percentage_declared,
      percentage_estimated: ing.percentage_estimated,
      percentage_confidence: ing.percentage_confidence,
      category: ing.category,
      subcategory: ing.subcategory,
      quality_tier: ing.quality_tier,
      is_meat_source: ing.is_meat_source,
      is_protein_source: ing.is_protein_source,
      is_filler: ing.is_filler,
      is_artificial: ing.is_artificial,
      is_controversial: ing.is_controversial,
      manually_verified: false,
    }));

    const { error: insertError } = await supabase
      .from('product_ingredients')
      .insert(ingredientsToInsert);

    if (insertError) {
      throw new Error(`Insert failed: ${insertError.message}`);
    }

    // Insert groups
    if (analysis.groups.length > 0) {
      const groupsToInsert = analysis.groups.map(group => ({
        product_id: productId,
        group_type: group.group_type,
        group_category: group.group_category,
        total_percentage: group.total_percentage,
        ingredient_count: group.ingredient_count,
        highest_position: group.highest_position,
        average_position: group.average_position,
        member_ingredients: group.members,
        is_split_suspected: group.is_split_suspected,
        split_severity: group.split_severity,
      }));

      const { error: groupInsertError } = await supabase
        .from('product_ingredient_groups')
        .insert(groupsToInsert);

      if (groupInsertError) {
        console.warn(`Warning: Failed to insert groups for ${productName}:`, groupInsertError.message);
      }
    }

    // Update product metadata
    const declaredCount = parsedIngredients.filter(ing => ing.percentage_declared !== null).length;

    const { error: updateError } = await supabase
      .from('products')
      .update({
        total_ingredients_count: parsedIngredients.length,
        ingredients_analyzed: true,
        declared_percentages_count: declaredCount,
        has_ingredient_splitting: analysis.hasIngredientSplitting,
        has_filler_stuffing: analysis.hasFillerStuffing,
        effective_meat_percent: analysis.effectiveMeatPercent,
        total_filler_percent: analysis.totalFillerPercent,
        updated_at: new Date().toISOString(),
      })
      .eq('id', productId);

    if (updateError) {
      console.warn(`Warning: Failed to update product metadata for ${productName}:`, updateError.message);
    }

    return {
      success: true,
      analysis: {
        totalIngredients: parsedIngredients.length,
        declaredPercentages: declaredCount,
        hasIngredientSplitting: analysis.hasIngredientSplitting,
        hasFillerStuffing: analysis.hasFillerStuffing,
        effectiveMeatPercent: analysis.effectiveMeatPercent.toFixed(2),
        totalFillerPercent: analysis.totalFillerPercent.toFixed(2),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function migrateAllProducts(options: {
  force?: boolean;
  limit?: number;
  onlyUnanalyzed?: boolean;
}) {
  const supabase = getServiceSupabase();
  const stats: MigrationStats = {
    total: 0,
    success: 0,
    failed: 0,
    skipped: 0,
    alreadyAnalyzed: 0,
    errors: [],
  };

  console.log('=== Ingredient Migration Script v3.0 ===\n');
  console.log('Options:', options);
  console.log('\nFetching products...');

  // Fetch ALL products using pagination to avoid 1000-row Supabase limit
  let allProducts: any[] = [];
  let page = 0;
  const pageSize = 1000;
  let hasMore = true;

  while (hasMore) {
    let query = supabase
      .from('products')
      .select('id, name, ingredients_raw, ingredients_list, ingredients_analyzed')
      .order('created_at', { ascending: false })
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (options.onlyUnanalyzed) {
      query = query.or('ingredients_analyzed.is.null,ingredients_analyzed.eq.false');
    }

    const { data: batch, error } = await query;

    if (error) {
      console.error('Error fetching products:', error);
      process.exit(1);
    }

    if (!batch || batch.length === 0) {
      hasMore = false;
    } else {
      allProducts = allProducts.concat(batch);
      console.log(`Fetched ${allProducts.length} products so far...`);
      page++;

      // Stop if we got less than pageSize (last page)
      if (batch.length < pageSize) {
        hasMore = false;
      }
    }
  }

  // Apply limit AFTER fetching all (for testing)
  const products = options.limit ? allProducts.slice(0, options.limit) : allProducts;

  if (!products || products.length === 0) {
    console.log('No products found to migrate.');
    process.exit(0);
  }

  stats.total = products.length;
  console.log(`Found ${stats.total} products to migrate\n`);
  console.log('Starting migration...\n');

  // Process each product
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const progress = `[${i + 1}/${stats.total}]`;

    // Check if already analyzed (unless force=true)
    if (product.ingredients_analyzed && !options.force) {
      console.log(`${progress} ⏭️  SKIP: ${product.name} (already analyzed)`);
      stats.skipped++;
      stats.alreadyAnalyzed++;
      continue;
    }

    // Check if has ingredient data
    const hasData = (product.ingredients_raw && product.ingredients_raw.trim().length > 0) ||
                    (product.ingredients_list && Array.isArray(product.ingredients_list) && product.ingredients_list.length > 0);

    if (!hasData) {
      console.log(`${progress} ⏭️  SKIP: ${product.name} (no ingredient data)`);
      stats.skipped++;
      continue;
    }

    // Migrate
    const result = await migrateProduct(
      product.id,
      product.name,
      product.ingredients_raw,
      product.ingredients_list,
      options.force || false
    );

    if (result.success) {
      console.log(`${progress} ✅ SUCCESS: ${product.name}`);
      if (result.analysis) {
        console.log(`    Ingredients: ${result.analysis.totalIngredients}, Declared %: ${result.analysis.declaredPercentages}`);
        console.log(`    Effective Meat: ${result.analysis.effectiveMeatPercent}%, Fillers: ${result.analysis.totalFillerPercent}%`);
        if (result.analysis.hasIngredientSplitting) {
          console.log(`    ⚠️  Split detected`);
        }
        if (result.analysis.hasFillerStuffing) {
          console.log(`    ⚠️  Filler stuffing detected`);
        }
      }
      stats.success++;
    } else {
      console.log(`${progress} ❌ FAILED: ${product.name}`);
      console.log(`    Error: ${result.error}`);
      stats.failed++;
      stats.errors.push({
        productId: product.id,
        productName: product.name,
        error: result.error || 'Unknown error',
      });
    }

    // Small delay to avoid overwhelming the database
    if ((i + 1) % 10 === 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  // Print summary
  console.log('\n\n=== MIGRATION SUMMARY ===');
  console.log(`Total products: ${stats.total}`);
  console.log(`✅ Success: ${stats.success} (${Math.round(stats.success/stats.total*100)}%)`);
  console.log(`⏭️  Skipped: ${stats.skipped} (${Math.round(stats.skipped/stats.total*100)}%)`);
  console.log(`   - Already analyzed: ${stats.alreadyAnalyzed}`);
  console.log(`   - No data: ${stats.skipped - stats.alreadyAnalyzed}`);
  console.log(`❌ Failed: ${stats.failed} (${Math.round(stats.failed/stats.total*100)}%)`);

  if (stats.errors.length > 0) {
    console.log('\n=== ERRORS ===');
    stats.errors.forEach((err, idx) => {
      console.log(`${idx + 1}. ${err.productName} (${err.productId}): ${err.error}`);
    });
  }

  console.log('\n✓ Migration complete!');
}

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  force: args.includes('--force'),
  limit: args.includes('--limit') ? parseInt(args[args.indexOf('--limit') + 1]) : undefined,
  onlyUnanalyzed: !args.includes('--all'),
};

// Run migration
migrateAllProducts(options)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
