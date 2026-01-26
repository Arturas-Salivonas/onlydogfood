const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://hjdxainmdvzqsybznywj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqZHhhaW5tZHZ6cXN5YnpueXdqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTU2Mzg0NCwiZXhwIjoyMDgxMTM5ODQ0fQ.jhINe4GRm6HgKZ464c2YUebKlN5lii_26o_CfE1bjD0'
);

async function checkProducts() {
  const slugs = ['scrumbles-puppies-toys', 'tilly-ted-puppy-dry'];

  for (const slug of slugs) {
    const { data: product } = await supabase
      .from('products')
      .select('id, slug, name, ingredients_raw, ingredients_list')
      .eq('slug', slug)
      .single();

    if (product) {
      console.log('\n' + '='.repeat(80));
      console.log(`Product: ${product.name}`);
      console.log(`Slug: ${product.slug}`);
      console.log('='.repeat(80));

      console.log('\n📝 ingredients_raw:');
      console.log(product.ingredients_raw || 'NULL');

      console.log('\n📝 ingredients_list:');
      console.log(product.ingredients_list || 'NULL');

      // Check if it has nested patterns
      const hasNestedRaw = product.ingredients_raw && /\d+(?:\.\d+)?\s*%\s*\([^)]*,\s*[^)]*\)/.test(product.ingredients_raw);
      const hasNestedList = product.ingredients_list && /\d+(?:\.\d+)?\s*%\s*\([^)]*,\s*[^)]*\)/.test(product.ingredients_list);

      console.log('\n🔍 Analysis:');
      console.log(`  ingredients_raw has nested: ${hasNestedRaw}`);
      console.log(`  ingredients_list has nested: ${hasNestedList}`);
    } else {
      console.log(`\n❌ Product not found: ${slug}`);
    }
  }
}

checkProducts();
