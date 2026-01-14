/**
 * Check detailed ingredient breakdown for a few products
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkIngredientBreakdown() {
  console.log('='.repeat(80));
  console.log('DETAILED INGREDIENT BREAKDOWN CHECK');
  console.log('='.repeat(80));
  console.log();

  // Get a few products with high positive ingredient bonuses
  const { data: products } = await supabase
    .from('products')
    .select('name, ingredients_raw, overall_score, ingredient_score, scoring_breakdown, brand:brands(name)')
    .not('scoring_breakdown->ingredientDetails->ingredientBreakdown', 'is', null)
    .limit(3);

  if (!products) {
    console.log('No products found');
    return;
  }

  products.forEach((product, i) => {
    const brandName = (product.brand as any)?.name || 'N/A';
    console.log(`${i + 1}. ${product.name} (${brandName})`);
    console.log(`   Overall: ${product.overall_score}/100 | Ingredient: ${product.ingredient_score}/45`);
    console.log();

    // Show ingredients
    const ingredientsPreview = product.ingredients_raw?.substring(0, 150) || 'N/A';
    console.log(`   Ingredients: ${ingredientsPreview}...`);
    console.log();

    // Show ingredient breakdown
    const details = product.scoring_breakdown?.ingredientDetails;
    if (details) {
      const breakdown = details.ingredientBreakdown || {};

      console.log('   📊 Ingredient Analysis:');

      // Positive categories
      const positives = Object.entries(breakdown).filter(([_, pts]) => (pts as number) > 0);
      if (positives.length > 0) {
        console.log('\n   ✅ Positive Contributions:');
        positives
          .sort(([, a], [, b]) => (b as number) - (a as number))
          .forEach(([category, points]) => {
            console.log(`      ${category}: +${points} points`);
          });
      }

      // Negative categories
      const negatives = Object.entries(breakdown).filter(([_, pts]) => (pts as number) < 0);
      if (negatives.length > 0) {
        console.log('\n   ⚠️  Negative Contributions:');
        negatives
          .sort(([, a], [, b]) => (a as number) - (b as number))
          .forEach(([category, points]) => {
            console.log(`      ${category}: ${points} points`);
          });
      }

      // Totals
      if (details.ingredientLevelBonus !== undefined) {
        const rawBonus = details.ingredientBonusRaw || 0;
        const appliedBonus = details.ingredientLevelBonus || 0;
        console.log(`\n   📈 Net Bonus: ${rawBonus > 0 ? '+' : ''}${rawBonus} → Applied: ${appliedBonus > 0 ? '+' : ''}${appliedBonus} points`);
        if (rawBonus !== appliedBonus) {
          console.log(`      (Capped at ±10 points to maintain balance)`);
        }
      }
    }

    console.log();
    console.log('─'.repeat(80));
    console.log();
  });

  console.log('✅ Check complete');
}

checkIngredientBreakdown()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
