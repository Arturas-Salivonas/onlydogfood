/**
 * Fix Nested Ingredients Script V2
 *
 * This script identifies and fixes products with nested ingredient structures like:
 * - "Chicken 61% (Fresh Chicken 25%, Dehydrated Chicken 20%, Chicken Fat 6%)"
 * - "65% Chicken (29% Dehydrated Chicken, 26% Freshly Prepared Chicken)"
 *
 * It will:
 * 1. Find all products with nested ingredients (containing parentheses with commas)
 * 2. Parse and flatten the nested structure into individual ingredients
 * 3. Update BOTH ingredients_raw AND ingredients_list columns
 * 4. Recalculate product scores
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
  'https://hjdxainmdvzqsybznywj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqZHhhaW5tZHZ6cXN5YnpueXdqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTU2Mzg0NCwiZXhwIjoyMDgxMTM5ODQ0fQ.jhINe4GRm6HgKZ464c2YUebKlN5lii_26o_CfE1bjD0'
);

// ============================================
// NESTED INGREDIENT DETECTION
// ============================================

/**
 * Check if ingredient string contains nested structure
 * Patterns:
 * 1. "X% Something (Item1 Y%, Item2 Z%, ...)"
 * 2. "Something X% (Item1 Y%, Item2 Z%, ...)"
 * 3. "Something (Item1, Item2, Item3)" - with commas inside parentheses
 */
function hasNestedIngredients(text) {
  if (!text) return false;

  // Pattern 1: X% Something (Item1 Y%, Item2 Z%)
  const pattern1 = /\d+(?:\.\d+)?\s*%\s+[^(]+\([^)]*,\s*[^)]*\)/;

  // Pattern 2: Something X% (Item1 Y%, Item2 Z%)
  const pattern2 = /[^(]+\s+\d+(?:\.\d+)?\s*%\s*\([^)]*,\s*[^)]*\)/;

  // Pattern 3: Something (Item1, Item2, Item3) - parentheses with commas but not just dosage
  // Exclude patterns like (200mg/kg) or (min 20%) - these are single values, not nested lists
  const pattern3 = /[^(]+\([^)]*,\s*[^)]*\)/;
  const isDosage = /\(\d+\s*(?:mg|g|mcg|iu|cfu)(?:\/kg)?\)/i.test(text);
  const isMinMax = /\(min(?:imum)?\s+\d+/i.test(text);

  return pattern1.test(text) || pattern2.test(text) || (pattern3.test(text) && !isDosage && !isMinMax);
}

/**
 * Extract nested ingredients from a string
 * Handles multiple patterns:
 * 1. "Chicken 61% (Fresh Chicken 25%, Dehydrated Chicken 20%)"
 * 2. "65% Chicken (29% Dehydrated Chicken, 26% Freshly Prepared Chicken)"
 * 3. "Herbs (Parsley, Rosemary, Nettle)"
 */
function extractNestedIngredients(text) {
  const results = [];

  // Pattern 1: X% Something (Item1 Y%, Item2 Z%)
  const pattern1 = /(\d+(?:\.\d+)?)\s*%\s+([^(]+)\(([^)]+)\)/g;

  // Pattern 2: Something X% (Item1 Y%, Item2 Z%)
  const pattern2 = /([^(]+?)\s+(\d+(?:\.\d+)?)\s*%\s*\(([^)]+)\)/g;

  // Pattern 3: Something (Item1, Item2, Item3)
  const pattern3 = /([^(]+)\(([^)]+)\)/g;

  let match;

  // Try Pattern 1: "65% Chicken (29% Dehydrated Chicken, ...)"
  while ((match = pattern1.exec(text)) !== null) {
    const totalPercentage = parseFloat(match[1]);
    const mainIngredient = match[2].trim();
    const nestedContent = match[3];

    const nestedItems = nestedContent
      .split(/,(?![^()]*\))/)
      .map(item => item.trim())
      .filter(item => item.length > 0);

    for (const item of nestedItems) {
      // Try "29% Dehydrated Chicken" format
      let percentMatch = item.match(/(\d+(?:\.\d+)?)\s*%\s+(.+)/);
      if (percentMatch) {
        results.push({
          name: percentMatch[2].trim(),
          percentage: parseFloat(percentMatch[1]),
          isNested: true,
          parentIngredient: mainIngredient,
          parentPercentage: totalPercentage
        });
        continue;
      }

      // Try "Dehydrated Chicken 29%" format
      percentMatch = item.match(/(.+?)\s+(\d+(?:\.\d+)?)\s*%/);
      if (percentMatch) {
        results.push({
          name: percentMatch[1].trim(),
          percentage: parseFloat(percentMatch[2]),
          isNested: true,
          parentIngredient: mainIngredient,
          parentPercentage: totalPercentage
        });
      } else {
        results.push({
          name: item.trim(),
          percentage: null,
          isNested: true,
          parentIngredient: mainIngredient,
          parentPercentage: totalPercentage
        });
      }
    }
  }

  // Reset regex
  pattern2.lastIndex = 0;

  // Try Pattern 2: "Chicken 61% (Fresh Chicken 25%, ...)"
  while ((match = pattern2.exec(text)) !== null) {
    const mainIngredient = match[1].trim();
    const totalPercentage = parseFloat(match[2]);
    const nestedContent = match[3];

    const nestedItems = nestedContent
      .split(/,(?![^()]*\))/)
      .map(item => item.trim())
      .filter(item => item.length > 0);

    for (const item of nestedItems) {
      // Try "29% Dehydrated Chicken" format
      let percentMatch = item.match(/(\d+(?:\.\d+)?)\s*%\s+(.+)/);
      if (percentMatch) {
        results.push({
          name: percentMatch[2].trim(),
          percentage: parseFloat(percentMatch[1]),
          isNested: true,
          parentIngredient: mainIngredient,
          parentPercentage: totalPercentage
        });
        continue;
      }

      // Try "Dehydrated Chicken 29%" format
      percentMatch = item.match(/(.+?)\s+(\d+(?:\.\d+)?)\s*%/);
      if (percentMatch) {
        results.push({
          name: percentMatch[1].trim(),
          percentage: parseFloat(percentMatch[2]),
          isNested: true,
          parentIngredient: mainIngredient,
          parentPercentage: totalPercentage
        });
      } else {
        results.push({
          name: item.trim(),
          percentage: null,
          isNested: true,
          parentIngredient: mainIngredient,
          parentPercentage: totalPercentage
        });
      }
    }
  }

  // Reset regex
  pattern3.lastIndex = 0;

  // Try Pattern 3: "Herbs (Parsley, Rosemary)" - only if no percentage in main part
  // Skip dosages like (200mg/kg)
  while ((match = pattern3.exec(text)) !== null) {
    const mainPart = match[1].trim();
    const nestedContent = match[2];

    // Skip if this is a dosage pattern
    if (/\d+\s*(?:mg|g|mcg|iu|cfu)(?:\/kg)?/i.test(nestedContent)) {
      continue;
    }

    // Skip if mainPart has a percentage (already handled by pattern 1 or 2)
    if (/\d+(?:\.\d+)?\s*%/.test(mainPart)) {
      continue;
    }

    // Check if nested content has commas (indicates multiple items)
    if (nestedContent.includes(',')) {
      const nestedItems = nestedContent
        .split(',')
        .map(item => item.trim())
        .filter(item => item.length > 0);

      for (const item of nestedItems) {
        results.push({
          name: item.trim(),
          percentage: null,
          isNested: true,
          parentIngredient: mainPart,
          parentPercentage: null
        });
      }
    }
  }

  return results;
}

/**
 * Flatten ingredients by expanding nested structures
 * Returns flat list with only top-level ingredients
 */
function flattenIngredients(ingredientsRaw) {
  const parts = ingredientsRaw.split(/,(?![^()]*\))/).map(s => s.trim());
  const flattened = [];

  for (const part of parts) {
    if (hasNestedIngredients(part)) {
      // Extract nested ingredients
      const nested = extractNestedIngredients(part);
      flattened.push(...nested);
    } else {
      // Regular ingredient - extract name and percentage
      const percentMatch = part.match(/(.+?)\s+(\d+(?:\.\d+)?)\s*%/);
      if (percentMatch) {
        flattened.push({
          name: percentMatch[1].trim(),
          percentage: parseFloat(percentMatch[2]),
          isNested: false
        });
      } else {
        flattened.push({
          name: part.trim(),
          percentage: null,
          isNested: false
        });
      }
    }
  }

  return flattened;
}

// ============================================
// INGREDIENT REBUILDING
// ============================================

/**
 * Rebuild ingredients_raw string from flattened structure
 * Format: "Ingredient1 X%, Ingredient2 Y%, ..."
 */
function rebuildIngredientsRaw(flattenedIngredients) {
  return flattenedIngredients
    .map(ing => {
      if (ing.percentage !== null) {
        return `${ing.name} ${ing.percentage}%`;
      }
      return ing.name;
    })
    .join(', ');
}

/**
 * Rebuild ingredients_list array from flattened structure
 * Format: ["X% Ingredient1", "Y% Ingredient2", ...]
 */
function rebuildIngredientsList(flattenedIngredients) {
  return flattenedIngredients.map(ing => {
    if (ing.percentage !== null) {
      return `${ing.percentage}% ${ing.name}`;
    }
    return ing.name;
  });
}

// ============================================
// DATABASE OPERATIONS
// ============================================

/**
 * Update a product's ingredients in the database
 * Updates BOTH ingredients_raw AND ingredients_list columns
 */
async function updateProduct(productId, rebuiltRaw, rebuiltList, dryRun = true) {
  if (dryRun) {
    console.log('\n⚠️  DRY RUN - Not updating database');
    return { success: true, dryRun: true };
  }

  console.log('\n💾 Updating database...');

  try {
    // 1. Update both ingredients_raw AND ingredients_list in products table
    const { error: updateError } = await supabase
      .from('products')
      .update({
        ingredients_raw: rebuiltRaw,
        ingredients_list: rebuiltList, // ✅ IMPORTANT: Also update ingredients_list
        ingredients_analyzed: false, // Mark for re-analysis
        updated_at: new Date().toISOString()
      })
      .eq('id', productId);

    if (updateError) {
      console.error('Error updating product:', updateError);
      return { success: false, error: updateError };
    }

    // 2. Delete existing parsed ingredients (they'll be re-parsed)
    const { error: deleteError } = await supabase
      .from('product_ingredients')
      .delete()
      .eq('product_id', productId);

    if (deleteError) {
      console.error('Error deleting old ingredients:', deleteError);
      return { success: false, error: deleteError };
    }

    console.log('✅ Database updated successfully (both ingredients_raw and ingredients_list)');
    return { success: true };

  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error };
  }
}

/**
 * Re-parse ingredients after updating
 */
async function reparseIngredients(productId, ingredientsRaw) {
  console.log('\n🔄 Re-parsing ingredients...');
  try {
    const response = await fetch(`http://localhost:3000/api/admin/products/${productId}/ingredients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ingredients_raw: ingredientsRaw  // Use ingredients_raw (with underscore)
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to re-parse ingredients:', errorText);
      return { success: false };
    }

    console.log('✅ Ingredients re-parsed successfully');
    return { success: true };

  } catch (error) {
    console.error('Error calling re-parse API:', error.message);
    return { success: false, error };
  }
}

/**
 * Recalculate product scores
 */
async function recalculateScores(productId) {
  try {
    const response = await fetch(`http://localhost:3000/api/admin/products/${productId}/recalculate`, {
      method: 'POST',
    });

    if (!response.ok) {
      console.error('Failed to recalculate scores:', await response.text());
      return { success: false };
    }

    console.log('✅ Scores recalculated successfully');
    return { success: true };

  } catch (error) {
    console.error('Error calling recalculate API:', error.message);
    return { success: false, error };
  }
}

// ============================================
// PRODUCT SCANNING
// ============================================

/**
 * Find all products with nested ingredients
 */
async function findProductsWithNestedIngredients() {
  console.log('🔍 Scanning products for nested ingredients...\n');

  const allProducts = [];
  let page = 0;
  const pageSize = 1000;

  while (true) {
    const { data, error } = await supabase
      .from('products')
      .select('id, slug, name, ingredients_raw, ingredients_list')
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) {
      console.error('Error fetching products:', error);
      break;
    }

    allProducts.push(...data);
    console.log(`Fetched ${data.length} products (page ${page + 1})...`);

    if (data.length < pageSize) {
      break; // Last page
    }

    page++;
  }

  console.log(`\n✅ Scanned ${allProducts.length} total products\n`);

  // Check both ingredients_raw and ingredients_list for nested structures
  const productsWithNested = allProducts.filter(product => {
    const hasNestedRaw = hasNestedIngredients(product.ingredients_raw);

    // Check if ingredients_list also has nested structures
    let hasNestedList = false;
    if (product.ingredients_list && Array.isArray(product.ingredients_list)) {
      hasNestedList = product.ingredients_list.some(ing => hasNestedIngredients(ing));
    }

    return hasNestedRaw || hasNestedList;
  });

  console.log(`Found ${productsWithNested.length} products with nested ingredients\n`);

  return productsWithNested;
}

// ============================================
// PRODUCT ANALYSIS
// ============================================

/**
 * Analyze a single product's nested ingredients
 */
function analyzeProduct(product) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`📦 ${product.name}`);
  console.log(`   Slug: ${product.slug}`);
  console.log(`   ID: ${product.id}`);
  console.log(`${'='.repeat(80)}`);

  console.log('\n📝 ORIGINAL ingredients_raw:');
  console.log(product.ingredients_raw);

  console.log('\n📝 ORIGINAL ingredients_list:');
  console.log(JSON.stringify(product.ingredients_list, null, 2));

  // Determine which source to use for flattening
  // Prefer ingredients_list if it has nested structures, as it's usually more accurate
  let sourceForFlattening = product.ingredients_raw;
  let useList = false;

  if (product.ingredients_list && Array.isArray(product.ingredients_list)) {
    const hasNestedInList = product.ingredients_list.some(ing => hasNestedIngredients(ing));
    if (hasNestedInList) {
      // Convert array back to comma-separated string for processing
      sourceForFlattening = product.ingredients_list.join(', ');
      useList = true;
      console.log('\n⚠️  Using ingredients_list as source (more accurate nested structure)');
    }
  }

  // Flatten nested ingredients
  const flattened = flattenIngredients(sourceForFlattening);

  console.log('\n🔍 FLATTENED INGREDIENTS:');
  flattened.forEach((ing, idx) => {
    const marker = ing.isNested ? '  ↳ ' : '';
    const percentage = ing.percentage !== null ? ` ${ing.percentage}%` : '';
    console.log(`${idx + 1}. ${marker}${ing.name}${percentage}`);
  });

  const rebuiltRaw = rebuildIngredientsRaw(flattened);
  const rebuiltList = rebuildIngredientsList(flattened);

  console.log('\n🔄 REBUILT ingredients_raw:');
  console.log(rebuiltRaw);

  console.log('\n🔄 REBUILT ingredients_list:');
  console.log(JSON.stringify(rebuiltList, null, 2));

  return {
    product,
    flattened,
    rebuiltRaw,
    rebuiltList
  };
}

// ============================================
// MAIN EXECUTION
// ============================================

async function main() {
  const args = process.argv.slice(2);

  // Mode 1: Find all products with nested ingredients
  if (args.includes('--find')) {
    const products = await findProductsWithNestedIngredients();

    // Save report
    const report = products.map(p => ({
      id: p.id,
      slug: p.slug,
      name: p.name
    }));

    fs.writeFileSync(
      'nested-ingredients-report.json',
      JSON.stringify(report, null, 2)
    );

    console.log('\n📄 Report saved to: nested-ingredients-report.json');
    return;
  }

  // Mode 3: Batch process all products with nested ingredients
  if (args.includes('--batch')) {
    const dryRun = !args.includes('--save');

    console.log('\n🔄 BATCH PROCESSING MODE');
    console.log(`   Mode: ${dryRun ? 'DRY RUN (no changes)' : 'SAVE CHANGES'}\n`);

    const products = await findProductsWithNestedIngredients();

    if (products.length === 0) {
      console.log('No products with nested ingredients found.');
      return;
    }

    const report = [];
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      console.log(`\n[${i + 1}/${products.length}] Processing: ${product.slug}`);

      try {
        const analysis = analyzeProduct(product);
        report.push(analysis);

        if (!dryRun) {
          // Update database
          const updateResult = await updateProduct(product.id, analysis.rebuiltRaw, analysis.rebuiltList, false);

          if (updateResult.success) {
            // Re-parse ingredients
            const parseResult = await reparseIngredients(product.id, analysis.rebuiltRaw);

            if (parseResult.success) {
              // Recalculate scores
              await recalculateScores(product.id);
            }

            successCount++;
          } else {
            errorCount++;
          }
        }

      } catch (error) {
        console.error(`Error processing ${product.slug}:`, error.message);
        errorCount++;
      }
    }

    // Save detailed report
    fs.writeFileSync(
      'nested-ingredients-batch-report.json',
      JSON.stringify(report, null, 2)
    );

    console.log('\n' + '='.repeat(80));
    console.log('📊 BATCH PROCESSING COMPLETE');
    console.log('='.repeat(80));
    console.log(`Total products: ${products.length}`);
    console.log(`Errors: ${errorCount}`);
    console.log(`Report saved to: nested-ingredients-batch-report.json`);

    return;
  }

  // Mode 2: Analyze specific product by slug
  if (args.length > 0 && !args.includes('--find') && !args.includes('--batch')) {
    const slug = args[0];
    const dryRun = !args.includes('--save');

    console.log(`\n🎯 Analyzing single product: ${slug}`);
    console.log(`   Mode: ${dryRun ? 'DRY RUN (no changes)' : 'SAVE CHANGES'}\n`);

    const { data: product, error } = await supabase
      .from('products')
      .select('id, slug, name, ingredients_raw, ingredients_list')
      .eq('slug', slug)
      .single();

    if (error || !product) {
      console.error('Product not found:', slug);
      return;
    }

    const analysis = analyzeProduct(product);

    if (!dryRun) {
      // Update database
      const updateResult = await updateProduct(product.id, analysis.rebuiltRaw, analysis.rebuiltList, false);

      if (updateResult.success) {
        // Re-parse ingredients
        const parseResult = await reparseIngredients(product.id, analysis.rebuiltRaw);

        if (parseResult.success) {
          // Recalculate scores
          await recalculateScores(product.id);
        }
      }
    }

    return;
  }

  // Default: Show usage
  console.log(`
🛠️  Nested Ingredients Fixer

Usage:
  node fix-nested-ingredients-v2.js <slug>         # Analyze single product (dry run)
  node fix-nested-ingredients-v2.js <slug> --save  # Fix single product
  node fix-nested-ingredients-v2.js --find         # Find all products with nested ingredients
  node fix-nested-ingredients-v2.js --batch        # Batch process all (dry run)
  node fix-nested-ingredients-v2.js --batch --save # Batch process and save all changes

Examples:
  node fix-nested-ingredients-v2.js wellness-core-puppy-large-breed
  node fix-nested-ingredients-v2.js acana-adult-dog-recipe --save
  node fix-nested-ingredients-v2.js --batch --save
  `);
}

main().catch(console.error);
