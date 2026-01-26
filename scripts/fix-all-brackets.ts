#!/usr/bin/env node

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { getServiceSupabase } from '../lib/supabase';

const supabase = getServiceSupabase();

/**
 * More aggressive bracket cleaning - handles nested brackets better
 */
function cleanIngredient(ingredient: string): string {
  let cleaned = ingredient.trim();

  // Remove leading closing brackets
  cleaned = cleaned.replace(/^\)+/, '');

  // Remove trailing opening brackets
  cleaned = cleaned.replace(/\(+$/, '');

  // Count brackets
  const openCount = (cleaned.match(/\(/g) || []).length;
  const closeCount = (cleaned.match(/\)/g) || []).length;

  // If unbalanced, try to fix
  if (openCount > closeCount) {
    // Add missing closing brackets at the end
    cleaned += ')'.repeat(openCount - closeCount);
  } else if (closeCount > openCount) {
    // Remove extra closing brackets from the end
    let extraClose = closeCount - openCount;
    while (extraClose > 0 && cleaned.endsWith(')')) {
      cleaned = cleaned.slice(0, -1);
      extraClose--;
    }
  }

  return cleaned.trim();
}

async function findAndFixBracketIssues() {
  console.log('🔍 Scanning ALL products for bracket issues...\n');

  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, slug, ingredients_raw');

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log(`📦 Checking ${products.length} products\n`);

  const problemProducts: Array<{
    id: string;
    name: string;
    slug: string;
    issues: string[];
    fixed: string;
  }> = [];

  products.forEach((product) => {
    if (!product.ingredients_raw) return;

    const ingredients = product.ingredients_raw.split(/[,;]/).map((i: string) => i.trim());
    const issues: string[] = [];
    const fixedIngredients: string[] = [];
    let hasIssues = false;

    ingredients.forEach((ing: string) => {
      const openCount = (ing.match(/\(/g) || []).length;
      const closeCount = (ing.match(/\)/g) || []).length;

      if (openCount !== closeCount || ing.startsWith(')') || ing.endsWith('(')) {
        hasIssues = true;
        issues.push(`"${ing}" (open:${openCount}, close:${closeCount})`);
        fixedIngredients.push(cleanIngredient(ing));
      } else {
        fixedIngredients.push(ing);
      }
    });

    if (hasIssues) {
      problemProducts.push({
        id: product.id,
        name: product.name,
        slug: product.slug,
        issues,
        fixed: fixedIngredients.join(', '),
      });
    }
  });

  console.log(`\n❌ Found ${problemProducts.length} products with bracket issues\n`);

  if (problemProducts.length === 0) {
    console.log('✅ All products clean!');
    return;
  }

  // Show first 5 examples
  console.log('📋 First 5 examples:\n');
  problemProducts.slice(0, 5).forEach((p, idx) => {
    console.log(`${idx + 1}. ${p.name} (${p.slug})`);
    p.issues.forEach((issue) => console.log(`   ❌ ${issue}`));
    console.log('');
  });

  // Ask to fix
  console.log(`\n⚠️  Ready to fix ${problemProducts.length} products`);
  console.log('Proceeding with fixes...\n');

  let successCount = 0;
  let errorCount = 0;

  for (const product of problemProducts) {
    const { error } = await supabase
      .from('products')
      .update({ ingredients_raw: product.fixed })
      .eq('id', product.id);

    if (error) {
      console.error(`❌ Error updating ${product.name}:`, error.message);
      errorCount++;
    } else {
      successCount++;
      if (successCount % 50 === 0) {
        console.log(`✅ Fixed ${successCount}/${problemProducts.length} products...`);
      }
    }
  }

  console.log(`\n\n✅ Bracket fix complete!`);
  console.log(`   Success: ${successCount}`);
  console.log(`   Errors: ${errorCount}`);
}

findAndFixBracketIssues().catch(console.error);
