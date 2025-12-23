#!/usr/bin/env node

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { getServiceSupabase } from '../lib/supabase';

async function fixSubcategories() {
  const supabase = getServiceSupabase();

  const { data: products } = await supabase
    .from('products')
    .select('id, name, sub_category');

  if (!products) {
    console.log('No products found');
    return;
  }

  for (const product of products) {
    console.log(`\nProduct: ${product.name}`);
    console.log(`  Current sub_category: ${product.sub_category}`);

    if (product.sub_category && typeof product.sub_category === 'string') {
      // If it starts with [, try to parse it
      if (product.sub_category.startsWith('[')) {
        try {
          // Parse first level
          let parsed = JSON.parse(product.sub_category);
          console.log(`  Parsed (level 1):`, parsed);

          // Check if it's an array with one element that's a string starting with [
          if (Array.isArray(parsed) && parsed.length === 1 && typeof parsed[0] === 'string' && parsed[0].startsWith('[')) {
            console.log(`  ⚠️  NESTED ARRAY!`);
            // Parse the inner array
            const inner = JSON.parse(parsed[0]);
            console.log(`  Fixed:`, inner);

            // Update it
            const { error } = await supabase
              .from('products')
              .update({ sub_category: JSON.stringify(inner) })
              .eq('id', product.id);

            if (error) {
              console.log(`  ❌ Error:`, error);
            } else {
              console.log(`  ✅ Fixed!`);
            }
          } else if (Array.isArray(parsed) && parsed.some(item => typeof item === 'string' && item.startsWith('["'))) {
            // Multiple items, each is a JSON string
            console.log(`  ⚠️  MALFORMED ARRAY!`);

            // Reconstruct from the original string
            // Try to extract the actual array content
            const match = product.sub_category.match(/\[\"(.+?)\"\]/);
            if (match) {
              const inner = match[0];
              console.log(`  Extracted:`, inner);
              const innerParsed = JSON.parse(inner);
              console.log(`  Fixed:`, innerParsed);

              // Update it
              const { error } = await supabase
                .from('products')
                .update({ sub_category: JSON.stringify(innerParsed) })
                .eq('id', product.id);

              if (error) {
                console.log(`  ❌ Error:`, error);
              } else {
                console.log(`  ✅ Fixed!`);
              }
            }
          } else {
            console.log(`  ✅ Already correct format`);
          }
        } catch (e) {
          console.log(`  Error parsing:`, e);
        }
      } else {
        // Plain text, convert to array
        console.log(`  Plain text, converting to array`);
        const { error } = await supabase
          .from('products')
          .update({ sub_category: JSON.stringify([product.sub_category]) })
          .eq('id', product.id);

        if (error) {
          console.log(`  ❌ Error:`, error);
        } else {
          console.log(`  ✅ Fixed!`);
        }
      }
    }
  }
}

fixSubcategories();
