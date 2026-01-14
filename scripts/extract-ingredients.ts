import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
config({ path: '.env.local' });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '✓' : '✗');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface Product {
  id: string;
  name: string;
  ingredients_raw: string | null;
  ingredients_list: string[] | null;
}

async function extractAllIngredients() {
  console.log('🔍 Fetching all products...');

  // Fetch all products with pagination
  let allProducts: Product[] = [];
  let page = 0;
  const pageSize = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, ingredients_raw, ingredients_list')
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) {
      console.error('Error fetching products:', error);
      process.exit(1);
    }

    if (data && data.length > 0) {
      allProducts = allProducts.concat(data as Product[]);
      console.log(`📦 Fetched page ${page + 1} (${data.length} products)`);
      page++;
    } else {
      hasMore = false;
    }
  }

  console.log(`\n✅ Total products fetched: ${allProducts.length}`);

  // Extract unique ingredients
  const ingredientSet = new Set<string>();
  let productsWithIngredients = 0;
  let productsWithoutIngredients = 0;

  console.log('\n🔬 Extracting ingredients...\n');

  for (const product of allProducts) {
    let ingredients: string[] = [];

    // Try to get ingredients from ingredients_list first
    if (product.ingredients_list && Array.isArray(product.ingredients_list) && product.ingredients_list.length > 0) {
      ingredients = product.ingredients_list;
    }
    // Otherwise parse from ingredients_raw
    else if (product.ingredients_raw && product.ingredients_raw.trim().length > 0) {
      // Split by comma and clean up
      ingredients = product.ingredients_raw
        .split(',')
        .map(ing => ing.trim())
        .filter(ing => ing.length > 0);
    }

    if (ingredients.length > 0) {
      productsWithIngredients++;

      // Normalize and add each ingredient
      ingredients.forEach(ingredient => {
        // Some ingredients might still contain comma-separated lists or period-separated
        // Split by commas first, then by periods
        const commaSplit = ingredient.split(',').map(i => i.trim()).filter(i => i.length > 0);

        commaSplit.forEach(item => {
          const periodSplit = item.split('.').map(i => i.trim()).filter(i => i.length > 0);

          periodSplit.forEach(subIngredient => {
          // Clean up the ingredient name
          let cleaned = subIngredient
            .toLowerCase()
            .trim()
            // Remove percentages at the beginning (e.g., "0.025% chondroitin")
            .replace(/^\d+\.?\d*\s*%\s*/g, '')
            // Remove percentages anywhere in the string (e.g., "dried broccoli 0.1%")
            .replace(/\s+\d+\.?\d*\s*%/g, '')
            // Remove measurement units with numbers (mg/kg, mg, g/kg, g, etc.)
            .replace(/\s*\d+\.?\d*\s*(mg\/kg|mg|g\/kg|g|ml\/kg|ml|mcg\/kg|mcg|iu\/kg|iu|cfu\/kg|cfu)\b/gi, '')
            // Remove standalone numbers at the end (e.g., "cooked white rice 12.5")
            .replace(/\s+\d+\.?\d*$/g, '')
            // Remove percentages in parentheses
            .replace(/\s*\([^)]*%[^)]*\)/g, '')
            // Remove other parentheses content
            .replace(/\s*\([^)]*\)/g, '')
            // Normalize spelling variations (British to American)
            .replace(/sulphate/g, 'sulfate')
            .replace(/sulphur/g, 'sulfur')
            // Fix common misspellings
            .replace(/chondroitine/g, 'chondroitin')
            .replace(/glucosomine/g, 'glucosamine')
            // Normalize apostrophes (brewer's, brewers', brewers all become same)
            .replace(/['']s?\b/g, '')
            // Normalize common plurals to singular
            .replace(/\b(protein|mineral|vitamin|derivative|extract|product|oil|fat|herb|botanical|vegetable|fruit|bean|pea|lentil|berry|antioxidant|preservative|nucleotide|probiotic|prebiotic|amino acid|fatty acid)\s*s\b/g, '$1')
            // Remove trailing punctuation and brackets
            .replace(/[.,*\[\](){}]+$/g, '')
            // Remove leading punctuation and brackets
            .replace(/^[.,*\[\](){}]+/g, '')
            // Normalize multiple spaces to single space
            .replace(/\s+/g, ' ')
            // Remove leading/trailing spaces
            .trim();

          // Skip if empty or too short
          if (cleaned.length > 2) {
            // Skip invalid entries that are just punctuation, numbers, or fragments
            if (
              cleaned.match(/^[0-9\s\/.,\-:;%&]+$/) ||  // Just numbers and punctuation
              cleaned.includes('(') ||                  // Contains unmatched parentheses
              cleaned.includes(')') ||                  // Contains unmatched parentheses
              cleaned.includes('[') ||                  // Contains brackets
              cleaned.includes(']') ||
              cleaned.match(/^\d+x\d+/) ||              // Format like "15x109"
              cleaned.match(/^\d+%/) ||                 // Starts with percentage
              cleaned.includes(' kbe') ||               // Measurement units
              cleaned.startsWith('/') ||                // Starts with slash
              cleaned.startsWith('&') ||                // Starts with ampersand
              cleaned.endsWith('&') ||                  // Ends with ampersand
              cleaned === 'thereof' ||
              cleaned === 'and' ||                      // Common conjunctions
              cleaned === 'or' ||
              cleaned === 'with' ||
              cleaned.match(/^minerals$/i) ||           // Just "minerals"
              cleaned.match(/^\d+%?\s+\w+/)             // Starts with number like "15% fresh"
            ) {
              return; // Skip this entry
            }

            ingredientSet.add(cleaned);
          }
          });
        });
      });
    } else {
      productsWithoutIngredients++;
    }
  }

  console.log(`✅ Products with ingredients: ${productsWithIngredients}`);
  console.log(`⚠️  Products without ingredients: ${productsWithoutIngredients}`);
  console.log(`\n🎯 Total unique ingredients found: ${ingredientSet.size}\n`);

  // Convert to sorted array
  const uniqueIngredients = Array.from(ingredientSet).sort((a, b) => a.localeCompare(b));

  // Output to console (first 100 for preview)
  console.log('📋 First 100 ingredients (preview):');
  console.log('─'.repeat(80));
  uniqueIngredients.slice(0, 100).forEach((ing, idx) => {
    console.log(`${(idx + 1).toString().padStart(4)}. ${ing}`);
  });

  if (uniqueIngredients.length > 100) {
    console.log(`... and ${uniqueIngredients.length - 100} more`);
  }

  // Save to files
  const outputDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Save as text file (one per line)
  const txtPath = path.join(outputDir, 'unique-ingredients.txt');
  fs.writeFileSync(txtPath, uniqueIngredients.join('\n'));
  console.log(`\n💾 Saved ${uniqueIngredients.length} unique ingredients to: ${txtPath}`);

  console.log('\n✨ Extraction complete!\n');
}

// Run the extraction
extractAllIngredients().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
