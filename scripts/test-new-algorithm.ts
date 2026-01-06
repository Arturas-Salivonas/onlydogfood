#!/usr/bin/env node

/**
 * Test New Scoring Algorithm
 * Tests the improved algorithm on sample products to verify improvements
 *
 * Usage: npm run test-algorithm
 */

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { getServiceSupabase } from '../lib/supabase';
import { calculateOverallScore, getScoreConfidenceBand, getAlgorithmMetadata } from '../scoring/calculator';

async function testAlgorithm() {
  const supabase = getServiceSupabase();

  console.log('🧪 Testing New Scoring Algorithm (v2.0.0)\n');

  // Display algorithm metadata
  const metadata = getAlgorithmMetadata();
  console.log('📋 Algorithm Info:');
  console.log(`   Version: ${metadata.version}`);
  console.log(`   Updated: ${metadata.lastUpdated}`);
  console.log(`   Improvements: ${metadata.improvements.join(', ')}\n`);

  // Fetch 5 diverse products for testing
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .order('overall_score', { ascending: false })
    .limit(10);

  if (error) {
    console.error('❌ Error fetching products:', error);
    return;
  }

  if (!products || products.length === 0) {
    console.log('ℹ️  No products found');
    return;
  }

  console.log(`📊 Testing on ${products.length} sample products:\n`);

  for (const product of products) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`🍖 ${product.name}`);
    console.log(`${'='.repeat(80)}`);

    // Calculate price per kg if needed
    let pricePerKg = product.price_per_kg_gbp;
    if (!pricePerKg && product.price_gbp && product.package_size_g) {
      pricePerKg = product.price_gbp / (product.package_size_g / 1000);
    }

    const productForScoring = {
      ...product,
      price_per_kg_gbp: pricePerKg,
    };

    // Calculate new scores
    const newScores = calculateOverallScore(productForScoring as any);
    const oldScore = product.overall_score || 0;

    // Display comparison
    console.log(`\n📊 SCORE COMPARISON:`);
    console.log(`   Old Overall Score: ${oldScore.toFixed(1)}/100`);
    console.log(`   New Overall Score: ${newScores.overallScore.toFixed(1)}/100`);
    console.log(`   Change: ${(newScores.overallScore - oldScore) >= 0 ? '+' : ''}${(newScores.overallScore - oldScore).toFixed(1)} points`);

    // Component scores
    console.log(`\n🔍 COMPONENT SCORES:`);
    console.log(`   Ingredient Quality: ${newScores.ingredientScore.toFixed(1)}/45 pts`);
    console.log(`   Nutritional Value:  ${newScores.nutritionScore.toFixed(1)}/33 pts`);
    console.log(`   Value for Money:    ${newScores.valueScore.toFixed(1)}/22 pts`);

    // Confidence band
    const confidence = getScoreConfidenceBand(newScores.overallScore);
    console.log(`   Confidence: ${confidence.band} (±${confidence.margin})`);

    // Breakdown details
    console.log(`\n📝 DETAILED BREAKDOWN:`);
    if (newScores.breakdown && newScores.breakdown.details) {
      const bd = newScores.breakdown.details;

      // Ingredient breakdown
      console.log(`\n   Ingredient Quality (${newScores.ingredientScore.toFixed(1)}/45):`);
      console.log(`     • Meat Content: ${bd.meatContent || 0} pts`);
      console.log(`     • Fillers: ${bd.fillers || 0} pts`);
      console.log(`     • Artificial Additives: ${bd.artificialAdditives || 0} pts`);
      console.log(`     • Named Meat Sources: ${bd.namedMeatSources || 0} pts`);
      console.log(`     • Processing Quality: ${bd.processingQuality || 0} pts`);

      // Nutrition breakdown
      console.log(`\n   Nutritional Value (${newScores.nutritionScore.toFixed(1)}/33):`);
      console.log(`     • Protein: ${bd.highProtein || 0} pts`);
      console.log(`     • Fat: ${bd.moderateFat || 0} pts`);
      console.log(`     • Carbohydrates: ${bd.lowCarbs || 0} pts`);
      console.log(`     • Fiber & Micronutrients: ${bd.fiberAndMicronutrients || 0} pts`);

      // Value breakdown
      console.log(`\n   Value for Money (${newScores.valueScore.toFixed(1)}/22):`);
      console.log(`     • Price per Feed: ${bd.pricePerFeed || 0} pts`);
      console.log(`     • Ingredient-Adjusted Value: ${bd.ingredientAdjustedValue || 0} pts`);
    }

    // Key product info
    console.log(`\n📦 PRODUCT INFO:`);
    console.log(`   Brand: ${product.brand_id || 'Unknown'}`);
    console.log(`   Category: ${product.category || 'N/A'}`);
    console.log(`   Price: £${product.price_gbp?.toFixed(2) || 'N/A'}`);
    console.log(`   Price/kg: £${pricePerKg?.toFixed(2) || 'N/A'}`);
    if (product.protein) console.log(`   Protein: ${product.protein}%`);
    if (product.fat) console.log(`   Fat: ${product.fat}%`);
    if (product.carbohydrates) console.log(`   Carbs: ${product.carbohydrates}%`);

    // Top ingredients
    if (product.ingredients_list && Array.isArray(product.ingredients_list)) {
      console.log(`\n🥘 TOP 5 INGREDIENTS:`);
      product.ingredients_list.slice(0, 5).forEach((ing: string, i: number) => {
        console.log(`   ${i + 1}. ${ing}`);
      });
    }
  }

  console.log(`\n${'='.repeat(80)}`);
  console.log('✅ Algorithm testing completed!');
  console.log(`${'='.repeat(80)}\n`);
}

// Run if called directly
if (require.main === module) {
  testAlgorithm()
    .catch(console.error)
    .finally(() => process.exit(0));
}

export { testAlgorithm };
