import { createClient } from '@supabase/supabase-js';
import { calculateOverallScore, getScoreGrade } from '../scoring/calculator';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function analyzeProduct(slug: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error(`Error fetching ${slug}:`, error);
    return null;
  }

  if (!data) {
    console.error(`Product not found: ${slug}`);
    return null;
  }

  console.log(`\n${'='.repeat(80)}`);
  console.log(`PRODUCT: ${data.name}`);
  console.log(`Slug: ${slug}`);
  console.log(`${'='.repeat(80)}\n`);

  // Calculate score
  const scoreResult = calculateOverallScore(data);
  const grade = getScoreGrade(scoreResult.overallScore, scoreResult.redFlagOverride);

  // Display basic info
  console.log(`📊 OVERALL SCORE: ${Math.round(scoreResult.overallScore)}/100 (${grade.stars} stars)`);
  console.log(`   Algorithm Version: ${scoreResult.algorithmVersion}`);
  console.log(`   Confidence: ${scoreResult.confidenceLevel} (${scoreResult.confidenceScore})`);
  console.log();

  // Score breakdown
  console.log(`🔍 SCORE BREAKDOWN:`);
  console.log(`   Ingredient Quality: ${Math.round(scoreResult.ingredientScore * 10) / 10}/52`);
  console.log(`   Nutritional Value:  ${Math.round(scoreResult.nutritionScore * 10) / 10}/33`);
  console.log(`   Value for Money:    ${Math.round(scoreResult.valueScore * 10) / 10}/15`);
  console.log();

  // Meat content
  console.log(`🥩 MEAT CONTENT:`);
  console.log(`   Effective Meat: ${data.effective_meat_percent ?? 'N/A'}%`);
  console.log(`   Meat Content: ${data.meat_content_percent ?? 'N/A'}%`);
  console.log();

  // Nutritional info
  console.log(`📈 NUTRITION (As-Fed):`);
  console.log(`   Protein: ${data.protein_percent ?? 'N/A'}%`);
  console.log(`   Fat: ${data.fat_percent ?? 'N/A'}%`);
  console.log(`   Fiber: ${data.fiber_percent ?? 'N/A'}%`);
  console.log(`   Moisture: ${data.moisture_percent ?? 'N/A'}%`);
  console.log();

  // Ingredients
  console.log(`📝 INGREDIENTS (Top 10):`);
  if (data.ingredients_text) {
    const ingredientsList = data.ingredients_text.split(/[,;]/).map((s: string) => s.trim());
    ingredientsList.slice(0, 10).forEach((ing: string, idx: number) => {
      console.log(`   ${idx + 1}. ${ing}`);
    });
  } else {
    console.log('   No ingredients data');
  }
  console.log();

  // Detailed ingredient scoring breakdown
  console.log(`🔬 INGREDIENT QUALITY BREAKDOWN (${Math.round(scoreResult.ingredientScore * 10) / 10}/45):`);
  const details = scoreResult.breakdown.details as any;

  console.log(`   Effective Meat Content: ${details.effectiveMeatContent ?? 0} points`);
  console.log(`   Protein Diversity: ${details.proteinDiversity ?? 0} points (${details.proteinDiversityDetails?.diversity ?? 'N/A'})`);
  console.log(`      - Protein Types: ${details.proteinDiversityDetails?.uniqueProteinTypes ?? 0}`);
  console.log(`      - Sources Found: ${details.proteinDiversityDetails?.proteinSources?.join(', ') ?? 'none'}`);
  console.log(`   Low Value Fillers: ${details.lowValueFillers ?? 0} points`);
  if (details.lowValueCarbPenalty) {
    console.log(`      - Low Value Carb Penalty: ${details.lowValueCarbPenalty}`);
  }
  if (details.grainTop3Penalty || details.grainTop5Penalty || details.grainFirstPenalty) {
    console.log(`      - Grain Penalty: ${details.grainTop3Penalty || details.grainTop5Penalty || details.grainFirstPenalty || 0}`);
  }
  console.log(`   No Artificial Additives: ${details.noArtificialAdditives ?? 0} points`);
  console.log(`   Named Meat Sources: ${details.namedMeatSources ?? 0} points`);
  console.log();

  // v4.0 specific details
  console.log(`🎯 v4.0 GUARDRAILS:`);
  console.log(`   Superfoods Bucket: ${details.superfoodsBucketScore ?? 0} points`);
  if (details.superfoodsTriggeredBy) {
    console.log(`      - Triggered by: ${details.superfoodsTriggeredBy} (position ${details.superfoodsPosition})`);
  }
  console.log(`   Ingredient Bonus (Raw): ${details.ingredientBonusRaw ?? 0}`);
  console.log(`   Ingredient Bonus (Capped): ${details.ingredientBonusCapped ?? 0}`);
  console.log(`   Meat-Anchored Multiplier: ${details.bonusMultiplier ?? 0}x`);
  console.log(`   Ingredient Bonus (Scaled): ${details.ingredientBonusScaled ?? 0}`);
  console.log(`   Low Meat Cap Applied: ${details.lowMeatCapApplied ? 'YES' : 'NO'}`);
  console.log();

  if (details.legumeSplitPenalty) {
    console.log(`   Legume Split Penalty: ${details.legumeSplitPenalty}`);
    if (details.legumeMatchesTop10?.length > 0) {
      console.log(`      - Matches in top 10: ${details.legumeMatchesTop10.length}`);
      details.legumeMatchesTop10.forEach((match: any) => {
        console.log(`        • Position ${match.position}: ${match.ingredient}`);
      });
    }
  }
  console.log();

  // Ingredient breakdown by category
  if (details.ingredientBreakdown) {
    console.log(`📦 INGREDIENT CATEGORY POINTS:`);
    Object.entries(details.ingredientBreakdown).forEach(([category, points]) => {
      if (points !== 0) {
        console.log(`   ${category}: ${points}`);
      }
    });
    console.log();
  }

  // Nutritional value breakdown
  console.log(`💊 NUTRITIONAL VALUE BREAKDOWN (${Math.round(scoreResult.nutritionScore * 10) / 10}/33):`);
  console.log(`   Protein Quality: ${Math.round((details.proteinQuality ?? 0) * 10) / 10} points`);
  console.log(`   Moderate Fat: ${Math.round((details.moderateFat ?? 0) * 10) / 10} points`);
  console.log(`   Low Carbs: ${details.lowCarbs ?? 0} points`);
  console.log(`   Fiber & Micronutrients: ${Math.round((details.fiberAndMicronutrients ?? 0) * 10) / 10} points`);
  console.log();

  // Price info
  if (data.price_per_kg) {
    console.log(`💰 VALUE FOR MONEY (${Math.round(scoreResult.valueScore * 10) / 10}/22):`);
    console.log(`   Price per kg: £${data.price_per_kg}`);
    console.log(`   Value Rating: ${details.valueRating ?? 0} points`);
    console.log();
  }

  return {
    product: data,
    score: scoreResult,
  };
}

async function main() {
  console.log('\n🔍 DEEP ALGORITHM ANALYSIS\n');

  // Analyze both products
  const ciMightyMeaty = await analyzeProduct('ci-mighty-meaty');
  const orijen = await analyzeProduct('orijen-fit-trim');

  // Comparison
  if (ciMightyMeaty && orijen) {
    console.log(`\n${'='.repeat(80)}`);
    console.log('📊 COMPARISON SUMMARY');
    console.log(`${'='.repeat(80)}\n`);

    console.log(`Ci Mighty Meaty: ${Math.round(ciMightyMeaty.score.overallScore)}/100`);
    console.log(`Orijen Fit & Trim: ${Math.round(orijen.score.overallScore)}/100`);
    console.log(`Difference: ${Math.round(ciMightyMeaty.score.overallScore - orijen.score.overallScore)} points (Ci is HIGHER)`);
    console.log();

    console.log(`Ingredient Quality:`);
    console.log(`   Ci: ${Math.round(ciMightyMeaty.score.ingredientScore * 10) / 10}/52`);
    console.log(`   Orijen: ${Math.round(orijen.score.ingredientScore * 10) / 10}/52`);
    console.log(`   Difference: ${Math.round((ciMightyMeaty.score.ingredientScore - orijen.score.ingredientScore) * 10) / 10}`);
    console.log();

    console.log(`Protein Diversity:`);
    const ciDetails = ciMightyMeaty.score.breakdown.details as any;
    const orijenDetails = orijen.score.breakdown.details as any;
    console.log(`   Ci: ${ciDetails.proteinDiversity ?? 0} points (${ciDetails.proteinDiversityDetails?.proteinSources?.length ?? 0} sources)`);
    console.log(`   Orijen: ${orijenDetails.proteinDiversity ?? 0} points (${orijenDetails.proteinDiversityDetails?.proteinSources?.length ?? 0} sources)`);
    console.log();
  }

  console.log('\n✅ Analysis complete\n');
}

main().catch(console.error);
