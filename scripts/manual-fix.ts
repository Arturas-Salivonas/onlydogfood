#!/usr/bin/env node

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { getServiceSupabase } from '../lib/supabase';

async function manualFix() {
  const supabase = getServiceSupabase();

  // For the Collards product specifically
  const { error } = await supabase
    .from('products')
    .update({
      sub_category: JSON.stringify(['toy', 'small', 'medium', 'large', 'giant'])
    })
    .eq('slug', 'collards-puppy-dry-turkey-rice');

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('✅ Fixed Collards product');
  }

  // Fix James Wellbeloved
  const { error: error2 } = await supabase
    .from('products')
    .update({
      sub_category: JSON.stringify(['large', 'giant'])
    })
    .eq('slug', 'james-wellbeloved-adult-large-breed-dry');

  if (error2) {
    console.error('Error:', error2);
  } else {
    console.log('✅ Fixed James Wellbeloved product');
  }

  // Fix all products with malformed arrays
  const products = [
    'wild-pet-food-omega-plus-80-slash-20-complete',
    'different-dog',
    'butchers-joints-and-coat-foil',
    'scrumbles-grain-free-complete-wet-dog-food',
    'years-complete-nutrition-system'
  ];

  for (const slug of products) {
    const { error } = await supabase
      .from('products')
      .update({
        sub_category: JSON.stringify(['toy', 'small', 'medium', 'large', 'giant'])
      })
      .eq('slug', slug);

    if (error) {
      console.error(`Error fixing ${slug}:`, error);
    } else {
      console.log(`✅ Fixed ${slug}`);
    }
  }
}

manualFix();
