#!/usr/bin/env node

/**
 * Recalculate Scores Script - Algorithm v2.2
 * Recalculates scores with new v2.2 features:
 * - Dry matter normalization (fair comparison across food types)
 * - Energy-based pricing (price per 1000kcal)
 * - Position-weighted ingredients (fixes "pixie dust")
 * - Split ingredient detection (gaming prevention)
 * - Tiered red flag system (nuanced caps)
 * - All v2.1 features preserved
 *
 * Usage: npm run recalculate-scores
 */

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { getServiceSupabase } from '../lib/supabase';
import { calculateOverallScore, getScoreGrade } from '../scoring/calculator';

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
      .select('*, brand:brands(*)')
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

  // Calculate category average prices for anchored pricing (v2.1)
  console.log('📊 Calculating category average prices...');
  const categoryAverages: Record<string, number> = {};
  const categoryAveragesPer1000kcal: Record<string, number> = {};

  // Group by food_category (or category if food_category not set)
  const categorizedProducts = products.reduce((acc: any, p: any) => {
    const cat = p.food_category || p.category || 'unknown';
    if (!acc[cat]) acc[cat] = [];
    if (p.price_per_kg_gbp) {
      acc[cat].push({
        pricePerKg: p.price_per_kg_gbp,
        protein: p.protein_percent,
        fat: p.fat_percent,
        carbs: p.carbs_percent,
        calories: p.calories_per_100g,
      });
    }
    return acc;
  }, {});

  // Calculate averages (per kg and per 1000kcal)
  for (const [cat, productData] of Object.entries(categorizedProducts)) {
    const dataArray = productData as any[];
    if (dataArray.length > 0) {
      // Average price per kg
      const avgPerKg = dataArray.reduce((sum, p) => sum + p.pricePerKg, 0) / dataArray.length;
      categoryAverages[cat] = avgPerKg;

      // Average price per 1000kcal (v2.2)
      // Compute for products with calorie data or macros
      const productsWithEnergy = dataArray.filter(p => {
        return p.calories || (p.protein !== null && p.fat !== null && p.carbs !== null);
      });

      if (productsWithEnergy.length > 0) {
        const prices1000kcal = productsWithEnergy.map(p => {
          let kcalPerKg = p.calories ? p.calories * 10 : null;

          // If no calories, estimate using Modified Atwater
          if (!kcalPerKg && p.protein !== null && p.fat !== null) {
            const carbs = p.carbs || 0;
            const kcalPer100g = 3.5 * p.protein + 8.5 * p.fat + 3.5 * carbs;
            kcalPerKg = kcalPer100g * 10;
          }

          if (kcalPerKg && kcalPerKg > 0) {
            return p.pricePerKg / (kcalPerKg / 1000);
          }
          return null;
        }).filter((p): p is number => p !== null);

        if (prices1000kcal.length > 0) {
          const avgPer1000kcal = prices1000kcal.reduce((sum, p) => sum + p, 0) / prices1000kcal.length;
          categoryAveragesPer1000kcal[cat] = avgPer1000kcal;
          console.log(`  ${cat}: £${avgPerKg.toFixed(2)}/kg | £${avgPer1000kcal.toFixed(2)}/1000kcal (${dataArray.length} products)`);
        } else {
          console.log(`  ${cat}: £${avgPerKg.toFixed(2)}/kg (${dataArray.length} products)`);
        }
      } else {
        console.log(`  ${cat}: £${avgPerKg.toFixed(2)}/kg (${dataArray.length} products)`);
      }
    }
  }

  let updated = 0;
  let errors = 0;

  for (const product of products) {
    try {
      // Calculate price per kg
      let pricePerKg = product.price_per_kg_gbp;
      if (!pricePerKg && product.price_gbp && product.package_size_g) {
        pricePerKg = product.price_gbp / (product.package_size_g / 1000);
      }

      // Determine food category for pricing anchor
      const foodCategory = product.food_category || product.category || 'unknown';
      const categoryAvgPrice = categoryAverages[foodCategory] || 0;
      const categoryAvgPricePer1000kcal = categoryAveragesPer1000kcal[foodCategory];

      // Prepare product data for scoring
      const productForScoring = {
        ...product,
        price_per_kg_gbp: pricePerKg,
      };

      // Calculate scores with v2.2 algorithm (includes v2.1 features)
      const scores = calculateOverallScore(
        productForScoring as any,
        categoryAvgPrice,
        categoryAvgPricePer1000kcal
      );

      // Get star rating with red flag consideration
      const gradeInfo = getScoreGrade(scores.overallScore, scores.redFlagOverride);

      // Fix brand_id if missing
      let brandId = product.brand_id;
      if (!brandId && product.name) {
        const firstWord = product.name.split(/[\s-]+/)[0];
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
          const parsed = JSON.parse(subCategoryValue);
          if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'string' && parsed[0].startsWith('[')) {
            const realArray = JSON.parse(parsed[0]);
            subCategoryValue = JSON.stringify(realArray);
          } else if (typeof parsed === 'string' && parsed.includes(',')) {
            const categories = parsed.split(',').map((s: string) => s.trim());
            subCategoryValue = JSON.stringify(categories);
          }
        } catch {
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
      }

      // Update the product with v2.1 fields
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
          confidence_score: scores.confidenceScore,
          confidence_level: scores.confidenceLevel,
          star_rating: gradeInfo.stars,
          red_flag_override: scores.redFlagOverride || null,
          food_category: foodCategory,
          sub_category: subCategoryValue,
          ingredients_list: ingredientsList,
        })
        .eq('id', product.id);

      if (updateError) {
        console.error(`❌ Error updating product ${product.name}:`, updateError);
        errors++;
      } else {
        const flagWarning = scores.redFlagOverride ? ` ⚠️ ${scores.redFlagOverride.reason}` : '';
        const versionInfo = scores.algorithmVersion ? ` [v${scores.algorithmVersion}]` : '';
        console.log(
          `✅ ${product.name}${versionInfo}\n   Score: ${scores.overallScore.toFixed(1)}/100 | ` +
          `${gradeInfo.emoji} | Confidence: ${scores.confidenceLevel} (${scores.confidenceScore})${flagWarning}`
        );
        updated++;
      }
    } catch (error) {
      console.error(`❌ Error processing product ${product.name}:`, error);
      errors++;
    }
  }

  console.log('\n✅ Recalculation completed!');
  console.log(`📊 Results: ${updated} updated, ${errors} errors`);
  console.log(`🔬 Algorithm: v2.2.0 (Jan 2026)`);
  console.log(`🎯 Features: DM normalization, Energy pricing, Position weighting, Split detection, Tiered red flags`);
}

// Run if called directly
if (require.main === module) {
  recalculateScores().catch(console.error);
}

export { recalculateScores };
