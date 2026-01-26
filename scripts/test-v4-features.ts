#!/usr/bin/env node

/**
 * Test v4.0 Algorithm Features
 * Quick smoke test to verify v4.0 guardrails are working
 */

import { calculateOverallScore } from '../scoring/calculator';
import type { Product } from '@/types';

// Test case 1: Pixie dust formula (low meat + superfoods)
const pixieDustFormula: Product = {
  id: 'test-1',
  name: 'Pixie Dust Test',
  slug: 'pixie-dust-test',
  brand_id: 'test',
  brand_name: 'Test',
  ingredients_raw: 'rice, corn, pea protein, pea starch, blueberries, cranberries, turmeric, herbs, chicken meal (4%), vitamins, minerals',
  ingredients_list: ['rice', 'corn', 'pea protein', 'pea starch', 'blueberries', 'cranberries', 'turmeric', 'herbs', 'chicken meal', 'vitamins', 'minerals'],
  guaranteed_analysis: {
    crude_protein_min: 22,
    crude_fat_min: 10,
    crude_fibre_max: 4,
    moisture_max: 10
  },
  price_per_kg: 2.5,
  category_average_price_per_kg: 3.5,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

// Test case 2: Legume splitting (3+ legumes in top 10)
const legumeSplittingFormula: Product = {
  id: 'test-2',
  name: 'Legume Splitting Test',
  slug: 'legume-splitting-test',
  brand_id: 'test',
  brand_name: 'Test',
  ingredients_raw: 'chicken meal, peas, pea protein, pea starch, lentils, red lentils, brown rice, chicken fat, vitamins, minerals',
  ingredients_list: ['chicken meal', 'peas', 'pea protein', 'pea starch', 'lentils', 'red lentils', 'brown rice', 'chicken fat', 'vitamins', 'minerals'],
  guaranteed_analysis: {
    crude_protein_min: 28,
    crude_fat_min: 15,
    crude_fibre_max: 4,
    moisture_max: 10
  },
  price_per_kg: 3.0,
  category_average_price_per_kg: 3.5,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

// Test case 3: Grain position cap (rice as #1)
const grainFirstFormula: Product = {
  id: 'test-3',
  name: 'Grain First Test',
  slug: 'grain-first-test',
  brand_id: 'test',
  brand_name: 'Test',
  ingredients_raw: 'rice, chicken meal, corn, peas, chicken fat, vitamins, minerals',
  ingredients_list: ['rice', 'chicken meal', 'corn', 'peas', 'chicken fat', 'vitamins', 'minerals'],
  guaranteed_analysis: {
    crude_protein_min: 24,
    crude_fat_min: 12,
    crude_fibre_max: 4,
    moisture_max: 10
  },
  price_per_kg: 2.0,
  category_average_price_per_kg: 3.5,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

// Test case 4: Premium formula (high meat)
const premiumFormula: Product = {
  id: 'test-4',
  name: 'Premium Test',
  slug: 'premium-test',
  brand_id: 'test',
  brand_name: 'Test',
  ingredients_raw: 'fresh chicken (30%), chicken meal (20%), turkey meal (10%), fresh turkey (10%), chicken fat, salmon oil, sweet potato, vitamins, minerals',
  ingredients_list: ['fresh chicken', 'chicken meal', 'turkey meal', 'fresh turkey', 'chicken fat', 'salmon oil', 'sweet potato', 'vitamins', 'minerals'],
  guaranteed_analysis: {
    crude_protein_min: 32,
    crude_fat_min: 18,
    crude_fibre_max: 3,
    moisture_max: 10
  },
  price_per_kg: 5.0,
  category_average_price_per_kg: 3.5,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

console.log('\n=== v4.0 ALGORITHM SMOKE TEST ===\n');

// Test 1: Pixie dust
console.log('Test 1: Pixie Dust Formula (low meat + superfoods)');
console.log('Expected: Superfoods bucket limited to +1, grain penalties applied');
const result1 = calculateOverallScore(pixieDustFormula, 3.5, undefined);
console.log(`Overall Score: ${result1.overallScore}/100`);
console.log(`Ingredient Quality: ${result1.ingredientScore}/45`);
console.log(`Breakdown details:`, JSON.stringify(result1.breakdown.details, null, 2));
if (result1.breakdown.details?.superfoodsBonus) {
  console.log(`✓ Superfoods bonus: ${result1.breakdown.details.superfoodsBonus} (capped at +1)`);
}
console.log(`Algorithm Version: ${result1.algorithmVersion}`);
console.log('');

// Test 2: Legume splitting
console.log('Test 2: Legume Splitting Formula (3+ legumes in top 10)');
console.log('Expected: Legume splitting penalty (-2 to -5 points)');
const result2 = calculateOverallScore(legumeSplittingFormula, 3.5, undefined);
console.log(`Overall Score: ${result2.overallScore}/100`);
console.log(`Ingredient Quality: ${result2.ingredientScore}/45`);
if (result2.breakdown.details?.legumeSplittingPenalty) {
  console.log(`✓ Legume splitting penalty: ${result2.breakdown.details.legumeSplittingPenalty}`);
}
if (result2.breakdown.details?.legumeMatchesTop10) {
  console.log(`  Matches found: ${result2.breakdown.details.legumeMatchesTop10.join(', ')}`);
}
console.log('');

// Test 3: Grain position cap
console.log('Test 3: Grain First Formula (rice as #1 ingredient)');
console.log('Expected: Ingredient quality capped at 35-38/45');
const result3 = calculateOverallScore(grainFirstFormula, 3.5, undefined);
console.log(`Overall Score: ${result3.overallScore}/100`);
console.log(`Ingredient Quality: ${result3.ingredientScore}/45`);
if (result3.breakdown.details?.ingredientQualityCapApplied) {
  const cap = result3.breakdown.details.ingredientQualityCapApplied as any;
  console.log(`✓ Grain position cap applied: ${cap.reason}`);
  console.log(`  Cap value: ${cap.capValue}/45`);
}
console.log('');

// Test 4: Premium formula
console.log('Test 4: Premium Formula (60%+ meat)');
console.log('Expected: High ingredient score, meat-anchored bonus applied');
const result4 = calculateOverallScore(premiumFormula, 3.5, undefined);
console.log(`Overall Score: ${result4.overallScore}/100`);
console.log(`Ingredient Quality: ${result4.ingredientScore}/45`);
if (result4.breakdown.details?.meatAnchoredBonus) {
  console.log(`✓ Meat-anchored bonus: +${result4.breakdown.details.meatAnchoredBonus}`);
}
if (result4.breakdown.details?.meatPercent) {
  console.log(`  Meat percentage: ${result4.breakdown.details.meatPercent}%`);
}
console.log('');

console.log('=== TEST COMPLETE ===\n');
console.log('All v4.0 features working correctly if:');
console.log('✓ Superfoods bonus capped at +1');
console.log('✓ Legume splitting detected and penalized');
console.log('✓ Grain position cap applied when grain is #1');
console.log('✓ Meat-anchored bonus scales with meat content');
console.log('');
