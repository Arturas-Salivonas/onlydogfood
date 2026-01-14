/**
 * Check the structure of scoring_breakdown
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkStructure() {
  const { data: product } = await supabase
    .from('products')
    .select('name, scoring_breakdown')
    .limit(1)
    .single();

  if (product) {
    console.log('Product:', product.name);
    console.log('\nscoring_breakdown structure:');
    console.log(JSON.stringify(product.scoring_breakdown, null, 2));
  }
}

checkStructure()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
