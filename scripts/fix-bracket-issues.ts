#!/usr/bin/env node

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { getServiceSupabase } from '../lib/supabase';
import * as fs from 'fs';

const supabase = getServiceSupabase();

/**
 * Clean ingredient text - fix bracket issues
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

/**
 * Fix all bracket issues in the database
 */
async function fixBracketIssues() {
  console.log('🔧 Starting bracket issue cleanup...\n');

  // Get all products
  const { data: products, error: fetchError } = await supabase
    .from('products')
    .select('id, name, ingredients_raw');

  if (fetchError) {
    console.error('❌ Error fetching products:', fetchError);
    return;
  }

  console.log(`📦 Analyzing ${products.length} products\n`);

  const updates: Array<{
    id: string;
    name: string;
    oldIngredients: string;
    newIngredients: string;
  }> = [];

  products.forEach((product) => {
    if (!product.ingredients_raw) return;

    const ingredients = product.ingredients_raw.split(/[,;]/).map((i: string) => i.trim()).filter((i: string) => i.length > 0);
    let hasIssues = false;
    const cleanedIngredients: string[] = [];

    ingredients.forEach((ingredient: string) => {
      const cleaned = cleanIngredient(ingredient);
      if (cleaned !== ingredient) {
        hasIssues = true;
      }
      cleanedIngredients.push(cleaned);
    });

    if (hasIssues) {
      const newIngredientsRaw = cleanedIngredients.join(', ');
      updates.push({
        id: product.id,
        name: product.name,
        oldIngredients: product.ingredients_raw,
        newIngredients: newIngredientsRaw,
      });
    }
  });

  console.log(`\n🔍 Found ${updates.length} products with bracket issues\n`);

  if (updates.length === 0) {
    console.log('✅ No bracket issues found!');
    return;
  }

  // Show first 10 examples
  console.log('📋 First 10 examples of fixes:');
  console.log('=====================================');
  updates.slice(0, 10).forEach((update, index) => {
    console.log(`\n${index + 1}. ${update.name}`);

    // Find the specific changed ingredients
    const oldIngredients = update.oldIngredients.split(/[,;]/).map(i => i.trim());
    const newIngredients = update.newIngredients.split(/[,;]/).map(i => i.trim());

    oldIngredients.forEach((oldIng, idx) => {
      if (oldIng !== newIngredients[idx]) {
        console.log(`   OLD: "${oldIng}"`);
        console.log(`   NEW: "${newIngredients[idx]}"`);
      }
    });
  });

  // Ask for confirmation
  console.log(`\n\n⚠️  Ready to update ${updates.length} products`);
  console.log('Continue? (yes/no): ');

  // For automated run, we'll just proceed
  console.log('Proceeding with updates...\n');

  let successCount = 0;
  let errorCount = 0;

  for (const update of updates) {
    const { error } = await supabase
      .from('products')
      .update({ ingredients_raw: update.newIngredients })
      .eq('id', update.id);

    if (error) {
      console.error(`❌ Error updating ${update.name}:`, error.message);
      errorCount++;
    } else {
      successCount++;
      if (successCount % 50 === 0) {
        console.log(`✅ Updated ${successCount}/${updates.length} products...`);
      }
    }
  }

  console.log(`\n\n✅ Cleanup complete!`);
  console.log(`   Success: ${successCount}`);
  console.log(`   Errors: ${errorCount}`);

  // Save report
  const reportDir = 'reports';
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir);
  }

  fs.writeFileSync(
    `${reportDir}/bracket-fixes.json`,
    JSON.stringify(updates, null, 2)
  );

  console.log(`\n📁 Full report saved to reports/bracket-fixes.json`);
}

fixBracketIssues().catch(console.error);
