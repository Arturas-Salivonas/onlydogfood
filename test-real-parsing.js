/**
 * Real-world test with actual database format
 * Testing: Morrisons Natural Complete Wheat Free Dry
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://hjdxainmdvzqsybznywj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqZHhhaW5tZHZ6cXN5YnpueXdqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTU2Mzg0NCwiZXhwIjoyMDgxMTM5ODQ0fQ.jhINe4GRm6HgKZ464c2YUebKlN5lii_26o_CfE1bjD0'
);

async function testRealProduct() {
  console.log('Testing Real Product from Database\n' + '='.repeat(80));
  
  // Fetch a product that has mixed percentage formats
  const { data: product, error } = await supabase
    .from('products')
    .select('id, slug, name, ingredients_raw, ingredients_list')
    .eq('slug', 'morrisons-natural-complete-wheat-free-dry')
    .single();
  
  if (error || !product) {
    console.error('Product not found:', error);
    return;
  }
  
  console.log(`\nProduct: ${product.name}`);
  console.log(`Slug: ${product.slug}\n`);
  
  console.log('ingredients_raw:');
  console.log(product.ingredients_raw);
  
  console.log('\ningredients_list (JSON array):');
  console.log(JSON.stringify(product.ingredients_list, null, 2));
  
  // Fetch the parsed ingredients from product_ingredients table
  const { data: parsedIngredients, error: parseError } = await supabase
    .from('product_ingredients')
    .select('*')
    .eq('product_id', product.id)
    .order('position', { ascending: true });
  
  if (parseError) {
    console.error('Error fetching parsed ingredients:', parseError);
    return;
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('PARSED INGREDIENTS FROM DATABASE');
  console.log('='.repeat(80));
  
  if (!parsedIngredients || parsedIngredients.length === 0) {
    console.log('⚠️  No parsed ingredients found. Product needs to be re-parsed.');
    return;
  }
  
  console.log(`\nTotal ingredients: ${parsedIngredients.length}\n`);
  
  parsedIngredients.forEach(ing => {
    const pct = ing.percentage_declared !== null 
      ? `${ing.percentage_declared}% (DECLARED)` 
      : `~${ing.percentage_estimated.toFixed(1)}% (${ing.percentage_confidence})`;
    
    console.log(`${String(ing.position).padStart(2)}. ${ing.ingredient_name.padEnd(40)} ${pct}`);
  });
  
  // Check if percentages are correctly identified
  console.log('\n' + '='.repeat(80));
  console.log('VERIFICATION: PERCENTAGE DETECTION');
  console.log('='.repeat(80));
  
  const withDeclared = parsedIngredients.filter(i => i.percentage_declared !== null);
  const withEstimated = parsedIngredients.filter(i => i.percentage_declared === null);
  
  console.log(`\n✓ Ingredients with DECLARED percentages: ${withDeclared.length}`);
  withDeclared.forEach(ing => {
    console.log(`  - ${ing.ingredient_name}: ${ing.percentage_declared}%`);
  });
  
  console.log(`\n✓ Ingredients with ESTIMATED percentages: ${withEstimated.length}`);
  console.log(`  (Based on position in ingredient list)`);
  
  // Test another product with different format
  console.log('\n\n' + '='.repeat(80));
  console.log('TESTING ANOTHER PRODUCT: Wainwright\'s Small Breed Adult');
  console.log('='.repeat(80));
  
  const { data: product2 } = await supabase
    .from('products')
    .select('id, slug, name, ingredients_list')
    .eq('slug', 'wainwright-s-small-breed-adult-dry-food')
    .single();
  
  if (product2) {
    console.log(`\nProduct: ${product2.name}`);
    console.log('\ningredients_list:');
    console.log(JSON.stringify(product2.ingredients_list, null, 2));
    
    const { data: ing2 } = await supabase
      .from('product_ingredients')
      .select('position, ingredient_name, percentage_declared, percentage_estimated')
      .eq('product_id', product2.id)
      .order('position', { ascending: true })
      .limit(10);
    
    if (ing2 && ing2.length > 0) {
      console.log('\nFirst 10 parsed ingredients:');
      ing2.forEach(ing => {
        const pct = ing.percentage_declared !== null 
          ? `${ing.percentage_declared}%` 
          : `~${ing.percentage_estimated.toFixed(1)}%`;
        console.log(`${String(ing.position).padStart(2)}. ${ing.ingredient_name.padEnd(35)} ${pct}`);
      });
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('✅ TEST COMPLETE');
  console.log('='.repeat(80));
}

testRealProduct().catch(console.error);
