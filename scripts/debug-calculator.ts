/**
 * Debug calculator integration
 */

import { calculateIngredientScore } from '../scoring/calculator';
import type { Product } from '../types';

const testProduct: Partial<Product> = {
  name: 'Test Food',
  ingredients_raw: 'Poultry Meal (35%), Corn, Wheat, Animal Fat, Beet Pulp, Minerals, Dried Chicken, Fresh Salmon',
  meat_content_percent: 45,
  protein_percent: 26,
  fat_percent: 15,
  carbohydrate_percent: 35,
};

console.log('Testing calculateIngredientScore...\n');

try {
  const result = calculateIngredientScore(testProduct as Product);

  console.log('Result:', result);
  console.log('\nScore:', result.score);
  console.log('\nDetails:');
  Object.entries(result.details).forEach(([key, value]) => {
    console.log(`  ${key}: ${value}`);
  });

  if (result.redFlags.length > 0) {
    console.log('\nRed Flags:');
    result.redFlags.forEach(flag => console.log(`  - ${flag}`));
  }

  console.log('\n✅ Test passed');
} catch (error) {
  console.error('❌ Error:', error);
  process.exit(1);
}
