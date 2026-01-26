import { calculateIngredientScore, calculateNutritionScore, calculateValueScore } from '../scoring/calculator';
import type { Product } from '../types';

console.log('\n🧪 Testing v5.0 Algorithm Features\n' + '='.repeat(60));

// Test 1: Orijen Fit & Trim (should score highly with v5.0)
const orijen: Product = {
  id: 'test-orijen',
  name: 'Orijen Fit & Trim',
  brand_id: 'test',
  category: 'dry_dog_food',
  ingredients_raw: `Fresh Chicken (25%), Raw Whole Herring (6%), Raw Turkey (6%), Fresh Chicken Giblets (6%), Raw Whole Hake (5%), Raw Whole Mackerel (5%), Fresh Eggs (5%), Dehydrated Chicken (4%), Dehydrated Mackerel (4%), Dehydrated Sardine (4%), Dehydrated Herring (4%), Dehydrated Turkey (4%), Dehydrated Whitefish (4%), Whole Red Lentils, Whole Green Lentils`,
  ingredients_list: ['Fresh Chicken (25%)', 'Raw Whole Herring (6%)', 'Raw Turkey (6%)', 'Fresh Chicken Giblets (6%)', 'Raw Whole Hake (5%)'],
  meat_content_percent: 82,
  protein_percent: 40,
  fat_percent: 15,
  carbs_percent: 20,
  fiber_percent: 8,
  moisture_percent: 10,
  ash_percent: 7.5,
  price_per_kg_gbp: 8.50,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// Test 2: Ci Mighty Meaty (should score lower with v5.0)
const ciMighty: Product = {
  id: 'test-ci',
  name: 'Ci Mighty Meaty',
  brand_id: 'test',
  category: 'dry_dog_food',
  ingredients_raw: `Chicken (36%), Dried Chicken (22%), Sweet Potato, Turkey (11%), Potato, Salmon (4%), Pollock (4%), Chicken Stock (1%), Dried Duck (1%), Pea Fibre`,
  ingredients_list: ['Chicken (36%)', 'Dried Chicken (22%)', 'Sweet Potato', 'Turkey (11%)', 'Potato'],
  meat_content_percent: 79,
  protein_percent: 28,
  fat_percent: 15,
  carbs_percent: 29,
  fiber_percent: 3.5,
  moisture_percent: 8,
  ash_percent: 8.5,
  price_per_kg_gbp: 4.50,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

console.log('\n📊 TEST 1: Orijen Fit & Trim (Ultra-Premium)');
console.log('-'.repeat(60));
const origenIngredient = calculateIngredientScore(orijen);
const origenNutrition = calculateNutritionScore(orijen);
const origenValue = calculateValueScore(orijen, 6.0, undefined, origenIngredient.score);

console.log(`\n✅ Ingredient Quality: ${origenIngredient.score.toFixed(1)}/52`);
console.log(`   ✓ Top 5 meat: ${origenIngredient.details.top5MeatDensity}/5 (bonus: ${origenIngredient.details.top5MeatBonus > 0 ? '+' : ''}${origenIngredient.details.top5MeatBonus})`);
console.log(`   ✓ Whole prey + organs: +${origenIngredient.details.wholePreyOrganBonus}`);
console.log(`   ✓ Formula: ${(origenNutrition.details as any).formulaType || 'MAINTENANCE'}`);

console.log(`\n✅ Nutritional Value: ${origenNutrition.score.toFixed(1)}/33`);
console.log(`✅ Value for Money: ${origenValue.score.toFixed(1)}/15`);

const origenTotal = origenIngredient.score + origenNutrition.score + origenValue.score;
console.log(`\n🏆 TOTAL: ${origenTotal.toFixed(1)}/100`);

console.log('\n\n📊 TEST 2: Ci Mighty Meaty (Premium Budget)');
console.log('-'.repeat(60));
const ciIngredient = calculateIngredientScore(ciMighty);
const ciNutrition = calculateNutritionScore(ciMighty);
const ciValue = calculateValueScore(ciMighty, 4.50, undefined, ciIngredient.score);

console.log(`\n✅ Ingredient Quality: ${ciIngredient.score.toFixed(1)}/52`);
console.log(`   ⚠ Top 5 meat: ${ciIngredient.details.top5MeatDensity}/5 (bonus: ${ciIngredient.details.top5MeatBonus})`);
console.log(`   ⚠ Carbs in top 5: penalty -${ciIngredient.details.carbPositionPenalty}`);
console.log(`   ⚠ High ash: ${ciMighty.ash_percent}% (penalty: -${ciIngredient.details.ashPenalty})`);

console.log(`\n✅ Nutritional Value: ${ciNutrition.score.toFixed(1)}/33`);
console.log(`✅ Value for Money: ${ciValue.score.toFixed(1)}/15`);

const ciTotal = ciIngredient.score + ciNutrition.score + ciValue.score;
console.log(`\n🏆 TOTAL: ${ciTotal.toFixed(1)}/100`);

console.log('\n\n' + '='.repeat(60));
console.log('📊 V5.0 ALGORITHM SUMMARY');
console.log('='.repeat(60));
console.log(`\nOrijen Fit & Trim:  ${origenTotal.toFixed(1)}/100`);
console.log(`  Ingredient: ${origenIngredient.score.toFixed(1)}/52 | Nutrition: ${origenNutrition.score.toFixed(1)}/33 | Value: ${origenValue.score.toFixed(1)}/15`);

console.log(`\nCi Mighty Meaty:    ${ciTotal.toFixed(1)}/100`);
console.log(`  Ingredient: ${ciIngredient.score.toFixed(1)}/52 | Nutrition: ${ciNutrition.score.toFixed(1)}/33 | Value: ${ciValue.score.toFixed(1)}/15`);

console.log(`\n${ origenTotal > ciTotal ? '✅ CORRECT: Orijen scores higher' : '❌ NEEDS ADJUSTMENT: Ci scores higher'}`);
console.log(`Difference: ${Math.abs(origenTotal - ciTotal).toFixed(1)} points`);

if (ciIngredient.redFlags.length > 0) {
  console.log('\n⚠️  Ci Red Flags:');
  ciIngredient.redFlags.slice(0, 3).forEach(flag => console.log(`   • ${flag}`));
}

console.log('\n✨ v5.0 Features Active:');
console.log('  ✓ 7-tier meat quality (dehydrated meats: +5 points)');
console.log('  ✓ Top 5 meat density bonuses');
console.log('  ✓ Carb position penalties');
console.log('  ✓ Ash penalties');
console.log('  ✓ Formula-specific protein ranges');
console.log('  ✓ Scoring: 52/33/15 structure\n');
