import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function checkData() {
  const { data, error } = await supabase
    .from('products')
    .select('name, meat_content_percent, effective_meat_percent, carbs_percent')
    .limit(10);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('\n📊 Sample Product Data:\n');
  data?.forEach(p => {
    console.log(`${p.name}:`);
    console.log(`  meat_content_percent: ${p.meat_content_percent ?? 'NULL'}`);
    console.log(`  effective_meat_percent: ${p.effective_meat_percent ?? 'NULL'}`);
    console.log(`  carbs_percent: ${p.carbs_percent ?? 'NULL'}`);
    console.log('');
  });
}

checkData();
