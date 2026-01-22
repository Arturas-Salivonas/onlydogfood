#!/usr/bin/env node

/**
 * Script to examine existing product ingredient data
 *
 * This will help us understand:
 * - What format ingredients are stored in
 * - How many have ingredients_raw vs ingredients_list
 * - Examples of the data structure
 * - Edge cases we need to handle
 */

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { getServiceSupabase } from '../lib/supabase';

async function examineProducts() {
  const supabase = getServiceSupabase();

  console.log('=== Examining Product Ingredient Data ===\n');

  // Fetch sample products
  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, ingredients_raw, ingredients_list, meat_content_percent')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Error fetching products:', error);
    return;
  }

  if (!products || products.length === 0) {
    console.log('No products found in database');
    return;
  }

  console.log(`Found ${products.length} products to examine\n`);

  // Statistics
  let hasRawCount = 0;
  let hasListCount = 0;
  let hasBothCount = 0;
  let hasNeitherCount = 0;
  let rawLengthSum = 0;
  let listLengthSum = 0;

  products.forEach((product, index) => {
    const hasRaw = product.ingredients_raw && product.ingredients_raw.trim().length > 0;
    const hasList = product.ingredients_list && Array.isArray(product.ingredients_list) && product.ingredients_list.length > 0;

    if (hasRaw) hasRawCount++;
    if (hasList) hasListCount++;
    if (hasRaw && hasList) hasBothCount++;
    if (!hasRaw && !hasList) hasNeitherCount++;

    if (hasRaw) rawLengthSum += product.ingredients_raw!.length;
    if (hasList) listLengthSum += product.ingredients_list!.length;

    // Print first 10 products in detail
    if (index < 10) {
      console.log(`\n--- Product ${index + 1}: ${product.name} ---`);
      console.log(`ID: ${product.id}`);
      console.log(`Meat Content %: ${product.meat_content_percent || 'Not set'}`);

      if (hasRaw) {
        const preview = product.ingredients_raw!.substring(0, 200);
        console.log(`\nHas ingredients_raw: YES (${product.ingredients_raw!.length} chars)`);
        console.log(`Preview: "${preview}${product.ingredients_raw!.length > 200 ? '...' : ''}"`);
      } else {
        console.log(`\nHas ingredients_raw: NO`);
      }

      if (hasList) {
        console.log(`\nHas ingredients_list: YES (${product.ingredients_list!.length} items)`);
        console.log(`First 10 items:`, product.ingredients_list!.slice(0, 10));
      } else {
        console.log(`\nHas ingredients_list: NO`);
      }

      console.log('---');
    }
  });

  // Summary statistics
  console.log('\n\n=== SUMMARY STATISTICS ===');
  console.log(`Total products examined: ${products.length}`);
  console.log(`Has ingredients_raw: ${hasRawCount} (${Math.round(hasRawCount/products.length*100)}%)`);
  console.log(`Has ingredients_list: ${hasListCount} (${Math.round(hasListCount/products.length*100)}%)`);
  console.log(`Has both: ${hasBothCount} (${Math.round(hasBothCount/products.length*100)}%)`);
  console.log(`Has neither: ${hasNeitherCount} (${Math.round(hasNeitherCount/products.length*100)}%)`);

  if (hasRawCount > 0) {
    console.log(`\nAverage ingredients_raw length: ${Math.round(rawLengthSum / hasRawCount)} chars`);
  }

  if (hasListCount > 0) {
    console.log(`Average ingredients_list count: ${Math.round(listLengthSum / hasListCount)} items`);
  }

  // Recommendations
  console.log('\n\n=== RECOMMENDATIONS ===');
  if (hasRawCount > hasListCount) {
    console.log('✓ Use ingredients_raw as primary source (more complete)');
  } else if (hasListCount > hasRawCount) {
    console.log('✓ Use ingredients_list as primary source (more complete)');
  } else {
    console.log('✓ Check both sources, prefer ingredients_raw when available');
  }

  if (hasNeitherCount > 0) {
    console.log(`⚠ ${hasNeitherCount} products have no ingredient data at all`);
  }
}

// Run the examination
examineProducts()
  .then(() => {
    console.log('\n✓ Examination complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
