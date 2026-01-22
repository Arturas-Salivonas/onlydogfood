#!/usr/bin/env node

/**
 * Clear All Ingredient Data
 * Use this to reset the ingredient migration completely
 */

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { getServiceSupabase } from '../lib/supabase';

async function clearAllIngredientData() {
  const supabase = getServiceSupabase();

  console.log('⚠️  WARNING: This will DELETE ALL ingredient data from the database!');
  console.log('Products table will NOT be affected, only product_ingredients and product_ingredient_groups.');
  console.log('');

  // Delete all product_ingredients
  console.log('Deleting all product_ingredients...');
  const { error: ingredientsError, count: ingredientsCount } = await supabase
    .from('product_ingredients')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all (neq with fake UUID)

  if (ingredientsError) {
    console.error('❌ Error deleting product_ingredients:', ingredientsError);
    process.exit(1);
  }

  console.log(`✅ Deleted all product_ingredients`);

  // Delete all product_ingredient_groups
  console.log('Deleting all product_ingredient_groups...');
  const { error: groupsError } = await supabase
    .from('product_ingredient_groups')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

  if (groupsError) {
    console.error('❌ Error deleting product_ingredient_groups:', groupsError);
    process.exit(1);
  }

  console.log(`✅ Deleted all product_ingredient_groups`);

  // Reset product metadata
  console.log('Resetting product metadata...');
  const { error: updateError } = await supabase
    .from('products')
    .update({
      ingredients_analyzed: false,
      total_ingredients_count: 0,
      declared_percentages_count: 0,
      has_ingredient_splitting: false,
      has_filler_stuffing: false,
      effective_meat_percent: null,
      total_filler_percent: null,
    })
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Update all

  if (updateError) {
    console.error('❌ Error resetting product metadata:', updateError);
    process.exit(1);
  }

  console.log('✅ Reset product metadata');
  console.log('');
  console.log('✅ All ingredient data cleared successfully!');
  console.log('');
  console.log('Next step: Run `npm run migrate:ingredients -- --all` to re-parse all ingredients');
}

clearAllIngredientData()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
