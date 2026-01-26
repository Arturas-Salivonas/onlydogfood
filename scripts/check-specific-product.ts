#!/usr/bin/env node

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { getServiceSupabase } from '../lib/supabase';

const supabase = getServiceSupabase();

async function checkProduct() {
  const { data: product, error } = await supabase
    .from('products')
    .select('id, name, slug, ingredients_raw')
    .eq('slug', 'wellness-core-puppy-large-breed')
    .single();

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  if (!product) {
    console.log('❌ Product not found');
    return;
  }

  console.log('📦 Product:', product.name);
  console.log('🔗 Slug:', product.slug);
  console.log('\n📝 Raw ingredients:');
  console.log('=====================================');
  console.log(product.ingredients_raw);
  console.log('\n=====================================');

  const ingredients = product.ingredients_raw.split(/[,;]/).map((i: string) => i.trim());
  console.log(`\n📊 Total ingredients: ${ingredients.length}\n`);

  console.log('🔍 Checking for bracket issues:\n');
  ingredients.forEach((ing: string, idx: number) => {
    const openCount = (ing.match(/\(/g) || []).length;
    const closeCount = (ing.match(/\)/g) || []).length;

    if (openCount !== closeCount || ing.startsWith(')') || ing.endsWith('(')) {
      console.log(`❌ Issue #${idx + 1}: "${ing}"`);
      console.log(`   Open: ${openCount}, Close: ${closeCount}`);

      // Suggest fix
      let fixed = ing.trim();
      fixed = fixed.replace(/^\)+/, '');
      fixed = fixed.replace(/\(+$/, '');

      const stillOpen = (fixed.match(/\(/g) || []).length;
      const stillClose = (fixed.match(/\)/g) || []).length;

      if (stillOpen > stillClose) {
        fixed += ')'.repeat(stillOpen - stillClose);
      } else if (stillClose > stillOpen) {
        let extraClose = stillClose - stillOpen;
        while (extraClose > 0 && fixed.endsWith(')')) {
          fixed = fixed.slice(0, -1);
          extraClose--;
        }
      }

      console.log(`   ✓ Fixed: "${fixed}"\n`);
    }
  });
}

checkProduct().catch(console.error);
