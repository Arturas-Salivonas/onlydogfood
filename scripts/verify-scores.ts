/**
 * Verify updated scores in database
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function verifyScores() {
  console.log('='.repeat(80));
  console.log('VERIFYING UPDATED SCORES IN DATABASE');
  console.log('='.repeat(80));
  console.log();

  // Get some high-scoring products
  const { data: topProducts, error: topError } = await supabase
    .from('products')
    .select('name, overall_score, ingredient_score, nutrition_score, star_rating, scoring_breakdown, brand:brands(name)')
    .order('overall_score', { ascending: false })
    .limit(5);

  if (topError) {
    console.error('Error fetching top products:', topError);
    return;
  }

  console.log('🏆 TOP 5 SCORING PRODUCTS:');
  console.log('─'.repeat(80));
  topProducts?.forEach((product, i) => {
    const brandName = (product.brand as any)?.name || 'N/A';
    console.log(`${i + 1}. ${product.name} (${brandName})`);
    console.log(`   Overall: ${product.overall_score}/100 | Ingredient: ${product.ingredient_score}/45 | Stars: ${'⭐'.repeat(product.star_rating || 0)}`);

    // Show ingredient bonus if available
    const breakdown = product.scoring_breakdown?.ingredientDetails || {};
    if (breakdown.ingredientLevelBonus !== undefined) {
      console.log(`   Ingredient Bonus: ${breakdown.ingredientLevelBonus > 0 ? '+' : ''}${breakdown.ingredientLevelBonus} points`);

      if (breakdown.ingredientBreakdown) {
        const positive = Object.entries(breakdown.ingredientBreakdown)
          .filter(([_, pts]) => (pts as number) > 0)
          .reduce((sum, [_, pts]) => sum + (pts as number), 0);
        const negative = Object.entries(breakdown.ingredientBreakdown)
          .filter(([_, pts]) => (pts as number) < 0)
          .reduce((sum, [_, pts]) => sum + (pts as number), 0);
        console.log(`   (Positive ingredients: +${positive}, Negative: ${negative})`);
      }
    }
    console.log();
  });

  // Get some products with red flags
  const { data: flaggedProducts, error: flagError } = await supabase
    .from('products')
    .select('name, overall_score, ingredient_score, scoring_breakdown, brand:brands(name)')
    .not('scoring_breakdown->ingredientDetails->ingredientBreakdown->ARTIFICIAL_COLORS', 'is', null)
    .limit(3);

  if (!flagError && flaggedProducts && flaggedProducts.length > 0) {
    console.log('🚨 PRODUCTS WITH ARTIFICIAL COLORS DETECTED:');
    console.log('─'.repeat(80));
    flaggedProducts.forEach((product, i) => {
      const brandName = (product.brand as any)?.name || 'N/A';
      console.log(`${i + 1}. ${product.name} (${brandName})`);
      console.log(`   Score: ${product.overall_score}/100 | Ingredient: ${product.ingredient_score}/45`);

      const breakdown = product.scoring_breakdown?.ingredientDetails?.ingredientBreakdown || {};
      if (breakdown.ARTIFICIAL_COLORS) {
        console.log(`   ⚠️  Artificial Colors Penalty: ${breakdown.ARTIFICIAL_COLORS} points`);
      }
      console.log();
    });
  }

  // Get statistics
  const { data: stats } = await supabase
    .from('products')
    .select('overall_score, ingredient_score');

  if (stats) {
    const avgOverall = stats.reduce((sum, p) => sum + (p.overall_score || 0), 0) / stats.length;
    const avgIngredient = stats.reduce((sum, p) => sum + (p.ingredient_score || 0), 0) / stats.length;

    const highQuality = stats.filter(p => (p.overall_score || 0) >= 80).length;
    const good = stats.filter(p => (p.overall_score || 0) >= 60 && (p.overall_score || 0) < 80).length;
    const fair = stats.filter(p => (p.overall_score || 0) >= 40 && (p.overall_score || 0) < 60).length;
    const poor = stats.filter(p => (p.overall_score || 0) < 40).length;

    console.log('📊 OVERALL STATISTICS:');
    console.log('─'.repeat(80));
    console.log(`Total Products: ${stats.length}`);
    console.log(`Average Overall Score: ${avgOverall.toFixed(1)}/100`);
    console.log(`Average Ingredient Score: ${avgIngredient.toFixed(1)}/45`);
    console.log();
    console.log('Quality Distribution:');
    console.log(`  Excellent (80-100): ${highQuality} products (${((highQuality/stats.length)*100).toFixed(1)}%)`);
    console.log(`  Good (60-79): ${good} products (${((good/stats.length)*100).toFixed(1)}%)`);
    console.log(`  Fair (40-59): ${fair} products (${((fair/stats.length)*100).toFixed(1)}%)`);
    console.log(`  Poor (0-39): ${poor} products (${((poor/stats.length)*100).toFixed(1)}%)`);
  }

  console.log();
  console.log('='.repeat(80));
  console.log('✅ VERIFICATION COMPLETE');
  console.log('='.repeat(80));
}

verifyScores()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
