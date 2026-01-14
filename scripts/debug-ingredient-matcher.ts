/**
 * Simple debug script to test ingredient matching directly
 */

import { calculateIngredientBonusPoints, getIngredientDatabase } from '../scoring/ingredient-matcher';

// Test with a simple ingredient list
const testIngredients = `
Poultry Meal (35%), Corn, Wheat, Animal Fat, Beet Pulp, Minerals,
Dried Chicken, Fresh Salmon, Chicken Liver, Glucosamine, Chondroitin,
Blueberries, Cranberries, Turmeric, Red 40, BHA
`;

console.log('='.repeat(80));
console.log('INGREDIENT MATCHER DEBUG TEST');
console.log('='.repeat(80));
console.log();

try {
  // Test 1: Load database
  console.log('Test 1: Loading ingredient database...');
  const database = getIngredientDatabase();
  const categoryCount = Object.keys(database).length;
  console.log(`✅ Loaded ${categoryCount} categories`);
  console.log();

  // Test 2: Calculate bonus points
  console.log('Test 2: Calculating ingredient bonus points...');
  console.log(`Input: "${testIngredients.substring(0, 100)}..."`);
  console.log();

  const result = calculateIngredientBonusPoints(testIngredients);

  console.log(`Total Points: ${result.totalPoints}`);
  console.log(`Matches Found: ${result.matches.length}`);
  console.log();

  if (result.matches.length > 0) {
    console.log('Ingredient Matches:');
    result.matches.forEach(match => {
      console.log(`  - ${match.ingredient} (${match.category}): ${match.points > 0 ? '+' : ''}${match.points} points`);
    });
    console.log();
  }

  console.log('Category Breakdown:');
  Object.entries(result.breakdown).forEach(([category, points]) => {
    console.log(`  ${category}: ${points > 0 ? '+' : ''}${points} points`);
  });

  console.log();
  console.log('='.repeat(80));
  console.log('✅ TEST PASSED');
  console.log('='.repeat(80));

} catch (error) {
  console.error('❌ TEST FAILED:', error);
  process.exit(1);
}
