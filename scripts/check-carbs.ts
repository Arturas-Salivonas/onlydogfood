import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function checkCarbs() {
  const { data, error } = await supabase
    .from('products')
    .select('name, scoring_breakdown, carbs_percent, protein_percent, fat_percent, fiber_percent, moisture_percent, ash_percent')
    .limit(5);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('\n=== Carbs Data Check ===\n');

  data?.forEach((product: any) => {
    console.log(`Product: ${product.name}`);
    console.log(`  carbs_percent: ${product.carbs_percent}`);
    console.log(`  protein: ${product.protein_percent}%`);
    console.log(`  fat: ${product.fat_percent}%`);
    console.log(`  fiber: ${product.fiber_percent}%`);
    console.log(`  moisture: ${product.moisture_percent}%`);
    console.log(`  ash: ${product.ash_percent}%`);

    // Calculate what carbs should be
    if (product.protein_percent && product.fat_percent) {
      const protein = product.protein_percent;
      const fat = product.fat_percent;
      const fiber = product.fiber_percent || 0;
      const moisture = product.moisture_percent || 10; // Default if missing
      const ash = product.ash_percent || 8; // Default if missing

      const calculatedCarbs = 100 - protein - fat - fiber - moisture - ash;
      console.log(`  Calculated carbs: ${calculatedCarbs.toFixed(1)}%`);
    }

    // Check scoring breakdown
    if (product.scoring_breakdown) {
      const breakdown = product.scoring_breakdown;
      console.log(`  Breakdown has carbPenalty: ${breakdown.carbPenalty !== undefined}`);
    }

    console.log('');
  });
}

checkCarbs();
