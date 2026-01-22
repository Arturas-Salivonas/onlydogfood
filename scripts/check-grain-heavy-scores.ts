/**
 * Check for products with high grain content that might be scored incorrectly
 * This helps identify products that need recalculation with v3.0 algorithm
 */

import { getSupabase } from '../lib/supabase';
import { Product } from '../types';

async function checkGrainHeavyProducts() {
  const supabase = getSupabase();

  console.log('🔍 Checking for grain-heavy products with suspiciously high scores...\n');

  // Fetch all products
  const { data: products, error } = await supabase
    .from('products')
    .select('id, slug, name, brand:brands(name), overall_score, ingredients_raw, ingredients_list, scoring_breakdown')
    .eq('is_available', true)
    .not('ingredients_raw', 'is', null)
    .order('overall_score', { ascending: false });

  if (error) {
    console.error('❌ Error fetching products:', error);
    return;
  }

  if (!products || products.length === 0) {
    console.log('No products found');
    return;
  }

  const problematicProducts: Array<{
    name: string;
    brand: string;
    score: number;
    grainIssues: string[];
    slug: string;
    algorithmVersion: string;
  }> = [];

  // Check each product for grain-heavy issues
  for (const product of products as any[]) {
    const ingredients = product.ingredients_raw?.toLowerCase() || '';
    const ingredientsList = product.ingredients_list || [];
    const top5 = ingredientsList.slice(0, 5).map((i: string) => i.toLowerCase());
    const score = product.overall_score || 0;
    const grainIssues: string[] = [];

    // Check for algorithm version
    const algorithmVersion = product.scoring_breakdown?.algorithmVersion || 'unknown';

    // Skip if already on v3.0
    if (algorithmVersion === '3.0.0') {
      continue;
    }

    // High-glycemic grains in top 5
    const highGIGrains = ['maize', 'corn', 'white rice', 'wheat'];
    const highGIInTop5 = top5.filter((ing: string) =>
      highGIGrains.some((grain: string) => ing.includes(grain))
    );

    if (highGIInTop5.length > 0) {
      grainIssues.push(`High-GI grains in top 5: ${highGIInTop5.join(', ')}`);
    }

    // Brown rice in top 3
    const brownRiceInTop3 = top5.slice(0, 3).some((ing: string) =>
      ing.includes('brown rice')
    );

    if (brownRiceInTop3) {
      grainIssues.push('Brown rice in top 3');
    }

    // Grain as #1 ingredient
    if (top5[0]) {
      const firstIsGrain = highGIGrains.some(g => top5[0].includes(g)) ||
        top5[0].includes('brown rice') ||
        top5[0].includes('rice');

      if (firstIsGrain) {
        grainIssues.push(`Grain as #1 ingredient: ${top5[0]}`);
      }
    }

    // Calculate estimated rice percentage (rough)
    const riceMatches = ingredients.match(/rice[^,;]*/gi) || [];
    const hasSignificantRice = riceMatches.length >= 2 || brownRiceInTop3;

    if (hasSignificantRice) {
      grainIssues.push(`Multiple rice entries: ${riceMatches.join(', ')}`);
    }

    // If score is high (>85) AND has grain issues, flag it
    if (score >= 85 && grainIssues.length > 0) {
      problematicProducts.push({
        name: product.name,
        brand: product.brand?.name || 'Unknown',
        score,
        grainIssues,
        slug: product.slug,
        algorithmVersion,
      });
    }
  }

  // Display results
  console.log(`Found ${problematicProducts.length} grain-heavy products with high scores (≥85)\n`);
  console.log('=' . repeat(100));

  if (problematicProducts.length === 0) {
    console.log('✅ No problematic products found. All high-scoring products appear to be legitimate.\n');
  } else {
    console.log('⚠️  Products that should score LOWER with v3.0 algorithm:\n');

    // Sort by score descending
    problematicProducts.sort((a, b) => b.score - a.score);

    for (const product of problematicProducts) {
      console.log(`\n📦 ${product.brand} - ${product.name}`);
      console.log(`   Current Score: ${product.score}/100 (Algorithm ${product.algorithmVersion})`);
      console.log(`   URL: /dog-food/${product.slug}`);
      console.log(`   Grain Issues:`);
      product.grainIssues.forEach(issue => {
        console.log(`      • ${issue}`);
      });
    }

    console.log('\n' + '=' . repeat(100));
    console.log(`\n💡 RECOMMENDATION: Run "npm run recalculate-scores" to update all products with v3.0 algorithm`);
    console.log('   This will apply proper grain penalties and diversity bonuses.\n');
  }

  // Also check for premium multi-protein foods scoring too low
  const premiumProducts = (products as any[]).filter((p: any) => {
    const score = p.overall_score || 0;
    const ingredients = p.ingredients_raw?.toLowerCase() || '';
    const algorithmVersion = p.scoring_breakdown?.algorithmVersion || 'unknown';

    // Skip if already on v3.0
    if (algorithmVersion === '3.0.0') return false;

    // Look for multiple protein sources
    const proteinSources = [
      'chicken', 'beef', 'lamb', 'turkey', 'duck', 'salmon',
      'herring', 'mackerel', 'sardine', 'trout', 'venison'
    ];

    const foundProteins = proteinSources.filter((protein: string) => ingredients.includes(protein));

    // Premium indicators: multiple proteins, no/low grains, score under 80
    const noHighGIGrains = !ingredients.match(/\b(maize|corn|white rice|wheat)\b/);
    const hasMultipleProteins = foundProteins.length >= 4;

    return score < 80 && hasMultipleProteins && noHighGIGrains;
  });

  if (premiumProducts.length > 0) {
    console.log('\n🌟 Premium multi-protein foods that should score HIGHER with v3.0:\n');
    premiumProducts.slice(0, 10).forEach(p => {
      const ingredients = p.ingredients_raw?.toLowerCase() || '';
      const proteinSources = [
        'chicken', 'beef', 'lamb', 'turkey', 'duck', 'salmon',
        'herring', 'mackerel', 'sardine', 'trout', 'venison'
      ];
      const foundProteins = proteinSources.filter(protein => ingredients.includes(protein));

      console.log(`   ${p.brand?.name} - ${p.name}`);
      console.log(`   Current Score: ${p.overall_score}/100`);
      console.log(`   Proteins Found: ${foundProteins.join(', ')}`);
      console.log(`   URL: /dog-food/${p.slug}\n`);
    });
  }
}

checkGrainHeavyProducts()
  .then(() => {
    console.log('✅ Check complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
