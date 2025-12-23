// Load environment variables from .env.local
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(__dirname, '../.env.local') });

import { getServiceSupabase } from '../lib/supabase';

/**
 * Simple script to assign tags to existing products
 */

const dummyTags = [
  { name: 'Grain Free', slug: 'grain-free', description: 'No grains like wheat, corn, or rice', color: '#10B981' },
  { name: 'High Protein', slug: 'high-protein', description: 'High protein content for active dogs', color: '#F59E0B' },
  { name: 'Organic', slug: 'organic', description: 'Made with organic ingredients', color: '#059669' },
  { name: 'Vet Recommended', slug: 'vet-recommended', description: 'Recommended by veterinarians', color: '#3B82F6' },
  { name: 'Hypoallergenic', slug: 'hypoallergenic', description: 'Suitable for dogs with allergies', color: '#8B5CF6' },
  { name: 'Small Breed', slug: 'small-breed', description: 'Specifically formulated for small dogs', color: '#EC4899' },
  { name: 'Large Breed', slug: 'large-breed', description: 'Specifically formulated for large dogs', color: '#EF4444' },
  { name: 'Puppy', slug: 'puppy', description: 'Formulated for puppies and young dogs', color: '#F97316' },
  { name: 'Senior', slug: 'senior', description: 'Formulated for senior dogs', color: '#6B7280' },
  { name: 'Weight Management', slug: 'weight-management', description: 'Helps with weight control', color: '#84CC16' },
];

async function assignTagsToProducts() {
  console.log('🏷️ Assigning tags to existing products...\n');

  const supabase = getServiceSupabase();

  try {
    // Upsert tags
    console.log('📝 Ensuring tags exist...');
    const tagMap = new Map<string, string>();

    for (const tag of dummyTags) {
      const { data, error } = await supabase
        .from('tags')
        .upsert({
          name: tag.name,
          slug: tag.slug,
          description: tag.description,
          color: tag.color,
        }, {
          onConflict: 'name'
        })
        .select('id, name')
        .single();

      if (error) {
        console.error(`❌ Error upserting tag ${tag.name}:`, error);
        continue;
      }

      if (data) {
        tagMap.set(tag.name, data.id);
        console.log(`✓ Ensured tag: ${tag.name}`);
      }
    }

    console.log(`\n✅ Ensured ${tagMap.size} tags\n`);

    // Get existing products
    console.log('🐕 Finding existing products...');
    const { data: existingProducts, error: productsError } = await supabase
      .from('products')
      .select('id, name, category, sub_category, protein_percent, fat_percent, ingredients_raw, overall_score')
      .eq('is_available', true);

    if (productsError) {
      console.error('❌ Error fetching existing products:', productsError);
      return;
    }

    console.log(`📊 Found ${existingProducts?.length || 0} existing products`);

    // Assign tags to products
    console.log('\n🔗 Assigning tags to products...');
    let tagAssignmentsCount = 0;

    for (const product of existingProducts || []) {
      // Determine which tags to assign based on product properties
      const tagsToAssign: string[] = [];

      // High protein (>25%)
      if (product.protein_percent && product.protein_percent > 25) {
        tagsToAssign.push('High Protein');
      }

      // Grain free (no common grains in ingredients)
      if (product.ingredients_raw &&
          !product.ingredients_raw.toLowerCase().includes('rice') &&
          !product.ingredients_raw.toLowerCase().includes('wheat') &&
          !product.ingredients_raw.toLowerCase().includes('corn')) {
        tagsToAssign.push('Grain Free');
      }

      // Puppy food
      if (product.sub_category === 'puppy') {
        tagsToAssign.push('Puppy');
      }

      // Senior food
      if (product.sub_category === 'senior') {
        tagsToAssign.push('Senior');
      }

      // Small/large breed
      if (product.sub_category === 'small breed') {
        tagsToAssign.push('Small Breed');
      }
      if (product.sub_category === 'large breed') {
        tagsToAssign.push('Large Breed');
      }

      // Weight management (lower calorie density)
      if (product.fat_percent && product.protein_percent &&
          product.fat_percent < 12 && product.protein_percent > 20) {
        tagsToAssign.push('Weight Management');
      }

      // Vet recommended (high scoring products)
      if (product.overall_score && product.overall_score > 85) {
        tagsToAssign.push('Vet Recommended');
      }

      // Assign tags
      for (const tagName of tagsToAssign) {
        const tagId = tagMap.get(tagName);
        if (tagId) {
          // Check if tag is already assigned
          const { data: existingAssignment } = await supabase
            .from('product_tags')
            .select('id')
            .eq('product_id', product.id)
            .eq('tag_id', tagId)
            .single();

          if (!existingAssignment) {
            const { error } = await supabase
              .from('product_tags')
              .insert({
                product_id: product.id,
                tag_id: tagId,
              });

            if (error) {
              console.error(`❌ Error assigning tag ${tagName} to product ${product.name}:`, error);
            } else {
              tagAssignmentsCount++;
              console.log(`✓ Assigned "${tagName}" to "${product.name}"`);
            }
          }
        }
      }
    }

    console.log(`\n✅ Assigned ${tagAssignmentsCount} tags to products\n`);
    console.log('🎉 Tag assignment completed successfully!');

  } catch (error) {
    console.error('❌ Tag assignment failed:', error);
    process.exit(1);
  }
}

// Run the tag assignment function
assignTagsToProducts();