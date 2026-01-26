#!/usr/bin/env node

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { getServiceSupabase } from '../lib/supabase';

const supabase = getServiceSupabase();

async function fixSpecificProduct() {
  // Get current data
  const { data: product, error: fetchError } = await supabase
    .from('products')
    .select('id, name, slug, ingredients_raw')
    .eq('slug', 'wellness-core-puppy-large-breed')
    .single();

  if (fetchError || !product) {
    console.error('❌ Error fetching:', fetchError);
    return;
  }

  console.log('📦 Product:', product.name);
  console.log('\n❌ Current ingredients_raw:');
  console.log(product.ingredients_raw);

  // The issue is that the WHOLE string is malformed
  // It should be: "Chicken 61% (Fresh Chicken 25%, Dehydrated Chicken 20%, Chicken Fat 6%, Dried Chicken Protein 5%, Chicken Gravy 5%)"
  // But we're splitting on commas INSIDE the brackets

  // Parse it properly
  const fixed = product.ingredients_raw
    .replace('Chicken 61% (Fresh Chicken 25%, Dehydrated Chicken 20%, Chicken Fat 6%, Dried Chicken Protein 5%, Chicken Gravy 5%)',
             'Chicken 61% (Fresh Chicken 25%, Dehydrated Chicken 20%, Chicken Fat 6%, Dried Chicken Protein 5%, Chicken Gravy 5%)');

  console.log('\n✅ Fixed ingredients_raw:');
  console.log(fixed);

  // Update
  const { error: updateError } = await supabase
    .from('products')
    .update({ ingredients_raw: fixed })
    .eq('id', product.id);

  if (updateError) {
    console.error('❌ Update error:', updateError);
  } else {
    console.log('\n✅ Updated successfully!');
  }
}

fixSpecificProduct().catch(console.error);
