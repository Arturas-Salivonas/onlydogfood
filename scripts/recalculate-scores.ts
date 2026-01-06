#!/usr/bin/env node

/**
 * Recalculate Scores Script
 * Recalculates scores and price_per_kg_gbp for all existing products
 *
 * Usage: npm run recalculate-scores
 */

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { getServiceSupabase } from '../lib/supabase';
import { calculateOverallScore } from '../scoring/calculator';

/**
 * Parse ingredients string into an array of individual ingredients
 */
function parseIngredients(ingredientsRaw: string): string[] {
  if (!ingredientsRaw) return [];

  // Split on commas, but be smart about percentages in parentheses
  const ingredients: string[] = [];
  let currentIngredient = '';
  let parenthesesDepth = 0;

  for (let i = 0; i < ingredientsRaw.length; i++) {
    const char = ingredientsRaw[i];

    if (char === '(') {
      parenthesesDepth++;
      currentIngredient += char;
    } else if (char === ')') {
      parenthesesDepth--;
      currentIngredient += char;
    } else if (char === ',' && parenthesesDepth === 0) {
      // Only split on commas outside of parentheses
      if (currentIngredient.trim()) {
        ingredients.push(currentIngredient.trim());
      }
      currentIngredient = '';
    } else {
      currentIngredient += char;
    }
  }

  // Add the last ingredient
  if (currentIngredient.trim()) {
    ingredients.push(currentIngredient.trim());
  }

  return ingredients;
}

async function recalculateScores() {
  const supabase = getServiceSupabase();

  console.log('🔄 Fetching all products...');

  // First, get the total count
  const { count, error: countError } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error('❌ Error counting products:', countError);
    return;
  }

  if (!count) {
    console.log('📊 No products found in database.');
    return;
  }

  console.log(`📊 Found ${count} products total. Fetching all products...`);

  // Fetch all products using pagination (Supabase max is 1000 per request)
  const pageSize = 1000;
  const totalPages = Math.ceil(count / pageSize);
  let allProducts: any[] = [];

  for (let page = 0; page < totalPages; page++) {
    const { data: pageProducts, error: pageError } = await supabase
      .from('products')
      .select('*')
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (pageError) {
      console.error(`❌ Error fetching page ${page + 1}:`, pageError);
      continue;
    }

    if (pageProducts) {
      allProducts = allProducts.concat(pageProducts);
      console.log(`✓ Fetched page ${page + 1}/${totalPages} (${pageProducts.length} products)`);
    }
  }

  const products = allProducts;

  if (!products || products.length === 0) {
    console.log('ℹ️  No products found');
    return;
  }

  console.log(`\n📊 Total fetched: ${products.length} products. Starting recalculation...\n`);

  let updated = 0;
  let errors = 0;

  for (const product of products) {
    try {
      // Calculate price per kg
      let pricePerKg = product.price_per_kg_gbp;
      if (!pricePerKg && product.price_gbp && product.package_size_g) {
        pricePerKg = product.price_gbp / (product.package_size_g / 1000);
      }

      // Prepare product data for scoring
      const productForScoring = {
        ...product,
        price_per_kg_gbp: pricePerKg,
      };

      // Calculate scores
      const scores = calculateOverallScore(productForScoring as any);

      // Fix brand_id if missing - extract brand name from product name
      let brandId = product.brand_id;
      if (!brandId && product.name) {
        // Extract potential brand name from product name (first word)
        const firstWord = product.name.split(/[\s-]+/)[0];

        // Try to find brand
        const { data: brands } = await supabase
          .from('brands')
          .select('id, name, slug')
          .or(`name.ilike.%${firstWord}%,slug.ilike.%${firstWord}%`);

        if (brands && brands.length > 0) {
          brandId = brands[0].id;
          console.log(`📌 Matched brand "${brands[0].name}" for product "${product.name}"`);
        }
      }

      // Fix sub_category if it's incorrectly encoded
      let subCategoryValue = product.sub_category;
      if (typeof subCategoryValue === 'string' && subCategoryValue) {
        try {
          // Try parsing it - if it's double-encoded, fix it
          const parsed = JSON.parse(subCategoryValue);

          // If it's an array of strings that look like JSON, it's double-encoded
          if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'string' && parsed[0].startsWith('[')) {
            // It's double-encoded, parse the first element to get the real array
            const realArray = JSON.parse(parsed[0]);
            subCategoryValue = JSON.stringify(realArray);
            console.log(`🔧 Fixed double-encoded sub_category for "${product.name}"`);
          } else if (typeof parsed === 'string' && parsed.includes(',')) {
            // It's a comma-separated string that was parsed, convert to array
            const categories = parsed.split(',').map((s: string) => s.trim());
            subCategoryValue = JSON.stringify(categories);
          }
        } catch {
          // If parsing fails and it contains commas, treat as comma-separated
          if (subCategoryValue.includes(',') && !subCategoryValue.startsWith('[')) {
            const categories = subCategoryValue.split(',').map((s: string) => s.trim());
            subCategoryValue = JSON.stringify(categories);
          }
        }
      }

      // Parse ingredients into a list if not already done
      let ingredientsList = product.ingredients_list;
      if (!ingredientsList && product.ingredients_raw) {
        ingredientsList = parseIngredients(product.ingredients_raw);
        console.log(`🥘 Parsed ${ingredientsList.length} ingredients for "${product.name}"`);
      }

      // Update the product
      const { error: updateError } = await supabase
        .from('products')
        .update({
          brand_id: brandId,
          price_per_kg_gbp: pricePerKg,
          overall_score: scores.overallScore,
          ingredient_score: scores.ingredientScore,
          nutrition_score: scores.nutritionScore,
          value_score: scores.valueScore,
          scoring_breakdown: scores.breakdown,
          sub_category: subCategoryValue,
          ingredients_list: ingredientsList,
        })
        .eq('id', product.id);

      if (updateError) {
        console.error(`❌ Error updating product ${product.name}:`, updateError);
        errors++;
      } else {
        console.log(`✅ Updated: ${product.name} (Score: ${scores.overallScore.toFixed(1)})`);
        updated++;
      }
    } catch (error) {
      console.error(`❌ Error processing product ${product.name}:`, error);
      errors++;
    }
  }

  console.log('\n✅ Recalculation completed!');
  console.log(`📊 Results: ${updated} updated, ${errors} errors`);
}

// Run if called directly
if (require.main === module) {
  recalculateScores().catch(console.error);
}

export { recalculateScores };
