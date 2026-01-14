/**
 * Test script to verify enhanced ingredient scoring
 * Tests the integration of ingredient-matcher with calculator
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { calculateOverallScore } from '../scoring/calculator';
import type { Product } from '../types';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function testEnhancedScoring() {
  console.log('='.repeat(80));
  console.log('TESTING ENHANCED INGREDIENT SCORING ALGORITHM');
  console.log('='.repeat(80));
  console.log();

  // Fetch a few sample products with different quality levels
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .not('ingredients_raw', 'is', null)
    .limit(5);

  if (error) {
    console.error('Error fetching products:', error);
    return;
  }

  if (!products || products.length === 0) {
    console.log('No products found to test.');
    return;
  }

  console.log(`Testing ${products.length} sample products...\n`);

  for (const product of products) {
    console.log('─'.repeat(80));
    console.log(`PRODUCT: ${product.name}`);
    console.log(`BRAND: ${product.brand_name}`);
    console.log('─'.repeat(80));

    // Show first 200 chars of ingredients
    const ingredientsPreview = product.ingredients_raw?.substring(0, 200) || 'N/A';
    console.log(`\nIngredients (preview): ${ingredientsPreview}...`);

    // Calculate score with new algorithm
    const scoringResult = calculateOverallScore(product as Product);

    console.log('\n📊 SCORING RESULTS:');
    console.log(`   Overall Score: ${scoringResult.overallScore}/100`);
    console.log(`   Ingredient Score: ${scoringResult.ingredientScore}/45`);
    console.log(`   Nutrition Score: ${scoringResult.nutritionScore}/33`);
    console.log(`   Value Score: ${scoringResult.valueScore}/22`);
    console.log(`   Quality Band: ${scoringResult.qualityBand}`);
    console.log(`   Confidence Level: ${scoringResult.confidenceLevel}`);

    // Show ingredient breakdown if available
    const ingredientDetails = scoringResult.breakdown?.ingredientDetails || {};
    if (ingredientDetails.ingredientBreakdown) {
      console.log('\n🔍 INGREDIENT-LEVEL ANALYSIS:');
      const breakdown = ingredientDetails.ingredientBreakdown;

      // Show positive contributions
      const positives = Object.entries(breakdown).filter(([_, pts]) => (pts as number) > 0);
      if (positives.length > 0) {
        console.log('\n   ✅ POSITIVE INGREDIENTS:');
        positives
          .sort(([, a], [, b]) => (b as number) - (a as number))
          .forEach(([category, points]) => {
            console.log(`      ${category}: +${points} points`);
          });
      }

      // Show negative contributions
      const negatives = Object.entries(breakdown).filter(([_, pts]) => (pts as number) < 0);
      if (negatives.length > 0) {
        console.log('\n   ⚠️  NEGATIVE INGREDIENTS:');
        negatives
          .sort(([, a], [, b]) => (a as number) - (b as number))
          .forEach(([category, points]) => {
            console.log(`      ${category}: ${points} points`);
          });
      }

      // Show totals
      if (ingredientDetails.ingredientLevelBonus !== undefined) {
        console.log(`\n   📈 Ingredient Bonus/Penalty Applied: ${ingredientDetails.ingredientLevelBonus > 0 ? '+' : ''}${ingredientDetails.ingredientLevelBonus} points`);
        if (ingredientDetails.ingredientBonusRaw !== ingredientDetails.ingredientLevelBonus) {
          console.log(`   (Capped from ${ingredientDetails.ingredientBonusRaw > 0 ? '+' : ''}${ingredientDetails.ingredientBonusRaw})`);
        }
      }
    }

    // Show red flags
    if (scoringResult.redFlags && scoringResult.redFlags.length > 0) {
      console.log('\n🚨 RED FLAGS:');
      scoringResult.redFlags.forEach(flag => {
        console.log(`   • ${flag}`);
      });
    }

    console.log('\n');
  }

  console.log('='.repeat(80));
  console.log('TEST COMPLETE');
  console.log('='.repeat(80));
}

// Run the test
testEnhancedScoring()
  .then(() => {
    console.log('\n✅ Test completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });
