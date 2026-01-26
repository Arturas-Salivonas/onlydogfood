#!/usr/bin/env node

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { getServiceSupabase } from '../lib/supabase';
import * as fs from 'fs';
import * as path from 'path';
import ingredientScoringData from '../scoring/ingredient-scoring.json';

// Initialize Supabase
const supabase = getServiceSupabase();

interface IngredientCategory {
  description: string;
  pointValue: number;
  ingredients: string[];
}

/**
 * Normalize ingredient for matching
 */
function normalizeIngredient(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\([^)]*\)/g, '') // Remove parentheses and content
    .replace(/[.,;!?()[\]{}]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Check if ingredient is in scoring database
 */
function isIngredientScored(ingredient: string): { found: boolean; category?: string; points?: number } {
  const normalized = normalizeIngredient(ingredient);
  const database = ingredientScoringData.categories as Record<string, IngredientCategory>;

  for (const [categoryKey, category] of Object.entries(database)) {
    for (const scoredIngredient of category.ingredients) {
      const normalizedScored = normalizeIngredient(scoredIngredient);
      if (normalized.includes(normalizedScored) || normalizedScored.includes(normalized)) {
        return { found: true, category: categoryKey, points: category.pointValue };
      }
    }
  }

  return { found: false };
}

/**
 * Analyze all ingredients in database
 */
async function analyzeIngredients() {
  console.log('🔍 Analyzing all ingredients in database...\n');

  // Get all products
  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, ingredients_raw');

  if (error) {
    console.error('❌ Error fetching products:', error);
    return;
  }

  console.log(`📦 Analyzing ${products.length} products\n`);

  // Collect all unique ingredients
  const allIngredients = new Set<string>();
  const ingredientFrequency = new Map<string, number>();
  const unscoredIngredients = new Map<string, number>();
  const bracketIssues: Array<{ product: string; ingredient: string; issue: string }> = [];

  products.forEach((product) => {
    if (!product.ingredients_raw) return;

    const ingredients = product.ingredients_raw.split(/[,;]/).map((i: string) => i.trim()).filter((i: string) => i.length > 0);

    ingredients.forEach((ingredient: string) => {
      allIngredients.add(ingredient);

      // Count frequency
      ingredientFrequency.set(ingredient, (ingredientFrequency.get(ingredient) || 0) + 1);

      // Check for bracket issues
      const openBrackets = (ingredient.match(/\(/g) || []).length;
      const closeBrackets = (ingredient.match(/\)/g) || []).length;
      if (openBrackets !== closeBrackets) {
        bracketIssues.push({
          product: product.name,
          ingredient,
          issue: openBrackets > closeBrackets ? 'Unclosed bracket' : 'Extra closing bracket',
        });
      }

      // Check if starting/ending with bracket
      if (ingredient.startsWith('(') || ingredient.endsWith(')')) {
        bracketIssues.push({
          product: product.name,
          ingredient,
          issue: 'Starts or ends with bracket',
        });
      }

      // Check if ingredient is scored
      const scoringResult = isIngredientScored(ingredient);
      if (!scoringResult.found) {
        unscoredIngredients.set(ingredient, (unscoredIngredients.get(ingredient) || 0) + 1);
      }
    });
  });

  console.log(`\n📊 SUMMARY:`);
  console.log(`Total unique ingredients: ${allIngredients.size}`);
  console.log(`Ingredients with bracket issues: ${bracketIssues.length}`);
  console.log(`Unscored ingredients: ${unscoredIngredients.size}`);

  // Report bracket issues
  if (bracketIssues.length > 0) {
    console.log(`\n\n⚠️  BRACKET ISSUES (${bracketIssues.length}):`);
    console.log('=====================================');

    // Group by ingredient
    const groupedIssues = new Map<string, typeof bracketIssues>();
    bracketIssues.forEach((issue) => {
      if (!groupedIssues.has(issue.ingredient)) {
        groupedIssues.set(issue.ingredient, []);
      }
      groupedIssues.get(issue.ingredient)!.push(issue);
    });

    groupedIssues.forEach((issues, ingredient) => {
      console.log(`\n"${ingredient}"`);
      console.log(`  Issue: ${issues[0].issue}`);
      console.log(`  Appears in ${issues.length} products`);
      console.log(`  Example: ${issues[0].product}`);
    });
  }

  // Report unscored ingredients (top 50 by frequency)
  if (unscoredIngredients.size > 0) {
    console.log(`\n\n❌ UNSCORED INGREDIENTS (Top 50 by frequency):`);
    console.log('=====================================');

    const sortedUnscored = Array.from(unscoredIngredients.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 50);

    sortedUnscored.forEach(([ingredient, count]) => {
      console.log(`${count.toString().padStart(4)}x  "${ingredient}"`);
    });
  }

  // Save full reports to files
  const reportsDir = path.join(process.cwd(), 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir);
  }

  // Save all unique ingredients
  fs.writeFileSync(
    path.join(reportsDir, 'all-ingredients.json'),
    JSON.stringify(Array.from(allIngredients).sort(), null, 2)
  );

  // Save unscored ingredients
  fs.writeFileSync(
    path.join(reportsDir, 'unscored-ingredients.json'),
    JSON.stringify(
      Array.from(unscoredIngredients.entries())
        .map(([ingredient, count]) => ({ ingredient, count }))
        .sort((a, b) => b.count - a.count),
      null,
      2
    )
  );

  // Save bracket issues
  fs.writeFileSync(
    path.join(reportsDir, 'bracket-issues.json'),
    JSON.stringify(bracketIssues, null, 2)
  );

  console.log(`\n\n📁 Full reports saved to /reports/ directory`);
  console.log('   - all-ingredients.json');
  console.log('   - unscored-ingredients.json');
  console.log('   - bracket-issues.json');
}

analyzeIngredients().catch(console.error);
