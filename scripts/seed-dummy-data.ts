// Load environment variables from .env.local
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(__dirname, '../.env.local') });

import { getServiceSupabase } from '../lib/supabase';
import { slugify } from '../lib/utils/slugify';
import { calculateOverallScore } from '../scoring/calculator';
import { Product, Brand } from '../types';

/**
 * Seed script to populate database with dummy data for testing
 * Run with: npm run seed
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

const dummyBrands = [
  {
    name: 'Premium Paws',
    country: 'UK',
    description: 'Premium dog food made with high-quality British ingredients. Family-owned business with 20+ years of experience.',
  },
  {
    name: 'Healthy Hound',
    country: 'Germany',
    description: 'German-engineered nutrition for dogs. Science-based formulas developed by veterinary nutritionists.',
  },
  {
    name: "Nature's Feast",
    country: 'UK',
    description: 'Natural, wholesome dog food with no artificial additives. Ethically sourced ingredients from trusted farms.',
  },
  {
    name: 'Paw Perfect',
    country: 'France',
    description: 'French artisan dog food combining tradition with modern nutrition science. Small-batch production.',
  },
  {
    name: 'Canine Choice',
    country: 'UK',
    description: 'Affordable, nutritious dog food for every budget. Trusted by thousands of UK dog owners.',
  },
];

const dummyProducts = [
  // Premium Paws - Dry
  {
    brandName: 'Premium Paws',
    name: 'Adult Chicken & Rice',
    category: 'dry' as const,
    subCategory: 'adult',
    packageSizeG: 12000,
    priceGbp: 45.99,
    proteinPercent: 28.0,
    fatPercent: 14.0,
    fiberPercent: 3.5,
    ashPercent: 7.0,
    moisturePercent: 8.0,
    ingredientsRaw: 'Chicken (55%), Rice, Chicken Fat, Beet Pulp, Fish Oil, Vitamins and Minerals',
    meatContentPercent: 55,
  },
  {
    brandName: 'Premium Paws',
    name: 'Puppy Formula',
    category: 'dry' as const,
    subCategory: 'puppy',
    packageSizeG: 10000,
    priceGbp: 42.99,
    proteinPercent: 30.0,
    fatPercent: 16.0,
    fiberPercent: 3.0,
    ashPercent: 7.5,
    moisturePercent: 8.0,
    ingredientsRaw: 'Chicken (60%), Rice, Chicken Fat, Salmon Oil, Beet Pulp, Vitamins and Minerals',
    meatContentPercent: 60,
  },

  // Healthy Hound - Dry
  {
    brandName: 'Healthy Hound',
    name: 'Performance Lamb & Potato',
    category: 'dry' as const,
    subCategory: 'active',
    packageSizeG: 15000,
    priceGbp: 58.99,
    proteinPercent: 32.0,
    fatPercent: 18.0,
    fiberPercent: 2.8,
    ashPercent: 7.2,
    moisturePercent: 9.0,
    ingredientsRaw: 'Lamb (65%), Sweet Potato, Lamb Fat, Potato, Peas, Fish Oil, Vitamins and Minerals',
    meatContentPercent: 65,
  },
  {
    brandName: 'Healthy Hound',
    name: 'Senior Turkey & Vegetables',
    category: 'dry' as const,
    subCategory: 'senior',
    packageSizeG: 12000,
    priceGbp: 49.99,
    proteinPercent: 26.0,
    fatPercent: 12.0,
    fiberPercent: 4.0,
    ashPercent: 6.5,
    moisturePercent: 8.5,
    ingredientsRaw: 'Turkey (50%), Rice, Carrots, Green Beans, Turkey Fat, Fish Oil, Glucosamine, Vitamins and Minerals',
    meatContentPercent: 50,
  },

  // Nature's Feast - Wet
  {
    brandName: "Nature's Feast",
    name: 'Grain-Free Beef Casserole',
    category: 'wet' as const,
    subCategory: 'grain-free',
    packageSizeG: 400,
    priceGbp: 2.49,
    proteinPercent: 10.5,
    fatPercent: 6.5,
    fiberPercent: 0.8,
    ashPercent: 2.5,
    moisturePercent: 78.0,
    ingredientsRaw: 'Beef (75%), Beef Broth, Carrots, Peas, Minerals',
    meatContentPercent: 75,
  },
  {
    brandName: "Nature's Feast",
    name: 'Chicken & Vegetable Chunks',
    category: 'wet' as const,
    subCategory: 'adult',
    packageSizeG: 400,
    priceGbp: 2.29,
    proteinPercent: 9.5,
    fatPercent: 5.5,
    fiberPercent: 0.7,
    ashPercent: 2.2,
    moisturePercent: 80.0,
    ingredientsRaw: 'Chicken (70%), Chicken Broth, Carrots, Green Beans, Minerals',
    meatContentPercent: 70,
  },

  // Paw Perfect - Dry
  {
    brandName: 'Paw Perfect',
    name: 'Artisan Duck & Oats',
    category: 'dry' as const,
    subCategory: 'adult',
    packageSizeG: 10000,
    priceGbp: 52.99,
    proteinPercent: 27.0,
    fatPercent: 15.0,
    fiberPercent: 3.2,
    ashPercent: 7.8,
    moisturePercent: 9.0,
    ingredientsRaw: 'Duck (52%), Oats, Duck Fat, Peas, Carrots, Fish Oil, Vitamins and Minerals',
    meatContentPercent: 52,
  },

  // Canine Choice - Budget
  {
    brandName: 'Canine Choice',
    name: 'Complete Chicken Mix',
    category: 'dry' as const,
    subCategory: 'adult',
    packageSizeG: 15000,
    priceGbp: 28.99,
    proteinPercent: 22.0,
    fatPercent: 10.0,
    fiberPercent: 3.0,
    ashPercent: 8.0,
    moisturePercent: 10.0,
    ingredientsRaw: 'Poultry Meal (35%), Corn, Wheat, Animal Fat, Beet Pulp, Minerals',
    meatContentPercent: 35,
  },
  {
    brandName: 'Canine Choice',
    name: 'Value Beef Dinner',
    category: 'wet' as const,
    subCategory: 'adult',
    packageSizeG: 400,
    priceGbp: 1.19,
    proteinPercent: 8.0,
    fatPercent: 4.5,
    fiberPercent: 0.5,
    ashPercent: 2.0,
    moisturePercent: 82.0,
    ingredientsRaw: 'Meat and Animal Derivatives (40% Beef), Cereals, Minerals',
    meatContentPercent: 40,
  },

  // Additional Snacks
  {
    brandName: 'Premium Paws',
    name: 'Training Treats - Chicken',
    category: 'snack' as const,
    subCategory: 'treats',
    packageSizeG: 200,
    priceGbp: 4.99,
    proteinPercent: 32.0,
    fatPercent: 8.0,
    fiberPercent: 2.0,
    ashPercent: 4.0,
    moisturePercent: 12.0,
    ingredientsRaw: 'Chicken (85%), Potato Starch, Glycerin, Minerals',
    meatContentPercent: 85,
  },
];

async function seed() {
  console.log('🌱 Starting database seeding...\n');

  const supabase = getServiceSupabase();

  // Store product-tag assignments for later
  const productTagAssignments: Array<{
    productId: string;
    product: any;
    tags: string[];
  }> = [];

  try {
    // Insert brands
    console.log('📦 Inserting brands...');
    const brandMap = new Map<string, string>();

    for (const brand of dummyBrands) {
      const slug = slugify(brand.name);

      const { data, error } = await supabase
        .from('brands')
        .upsert({
          slug,
          name: brand.name,
          country_of_origin: brand.country,
          description: brand.description,
          is_featured: false,
        }, {
          onConflict: 'slug'
        })
        .select('id, name')
        .single();

      if (error) {
        console.error(`❌ Error upserting brand ${brand.name}:`, error);
        continue;
      }

      if (data) {
        brandMap.set(brand.name, data.id);
        console.log(`✓ Upserted brand: ${brand.name}`);
      }
    }

    console.log(`\n✅ Inserted ${brandMap.size} brands\n`);

    // Insert tags
    console.log('🏷️ Inserting tags...');
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
        console.error(`❌ Error inserting tag ${tag.name}:`, error);
        continue;
      }

      if (data) {
        tagMap.set(tag.name, data.id);
        console.log(`✓ Created tag: ${tag.name}`);
      }
    }

    console.log(`\n✅ Inserted ${tagMap.size} tags\n`);

    // Calculate category average prices for scoring
    const categoryPrices: Record<string, number[]> = {
      dry: [],
      wet: [],
      snack: [],
    };

    for (const product of dummyProducts) {
      if (product.priceGbp && product.packageSizeG) {
        const pricePerKg = (product.priceGbp / product.packageSizeG) * 1000;
        categoryPrices[product.category].push(pricePerKg);
      }
    }

    const categoryAverages: Record<string, number> = {};
    for (const [category, prices] of Object.entries(categoryPrices)) {
      if (prices.length > 0) {
        categoryAverages[category] = prices.reduce((a, b) => a + b, 0) / prices.length;
      }
    }

    // Assign tags to existing products
    console.log('🐕 Finding existing products...');

    const { data: existingProducts, error: productsError } = await supabase
      .from('products')
      .select('id, name, brand_id, category, sub_category, protein_percent, fat_percent, ingredients_raw, overall_score')
      .eq('is_available', true);

    if (productsError) {
      console.error('❌ Error fetching existing products:', productsError);
      return;
    }

    console.log(`📊 Found ${existingProducts?.length || 0} existing products`);

    // Create product tag assignments for existing products
    for (const product of existingProducts || []) {
      productTagAssignments.push({
        productId: product.id,
        product,
        tags: []
      });
    }

    // Assign tags to products
    console.log('🔗 Assigning tags to products...');
    let tagAssignmentsCount = 0;

    for (const assignment of productTagAssignments) {
      const { productId, product } = assignment;

      // Determine which tags to assign based on product properties
      const tagsToAssign: string[] = [];

      // High protein (>25%)
      if (product.proteinPercent > 25) {
        tagsToAssign.push('High Protein');
      }

      // Grain free (no common grains in ingredients)
      if (!product.ingredientsRaw.toLowerCase().includes('rice') &&
          !product.ingredientsRaw.toLowerCase().includes('wheat') &&
          !product.ingredientsRaw.toLowerCase().includes('corn')) {
        tagsToAssign.push('Grain Free');
      }

      // Puppy food
      if (product.subCategory === 'puppy') {
        tagsToAssign.push('Puppy');
      }

      // Senior food
      if (product.subCategory === 'senior') {
        tagsToAssign.push('Senior');
      }

      // Small/large breed
      if (product.subCategory === 'small breed') {
        tagsToAssign.push('Small Breed');
      }
      if (product.subCategory === 'large breed') {
        tagsToAssign.push('Large Breed');
      }

      // Weight management (lower calorie density)
      if (product.fatPercent < 12 && product.proteinPercent > 20) {
        tagsToAssign.push('Weight Management');
      }

      // Vet recommended (high scoring products)
      if (assignment.product.overall_score > 85) {
        tagsToAssign.push('Vet Recommended');
      }

      // Assign tags
      for (const tagName of tagsToAssign) {
        const tagId = tagMap.get(tagName);
        if (tagId) {
          const { error } = await supabase
            .from('product_tags')
            .insert({
              product_id: productId,
              tag_id: tagId,
            });

          if (error) {
            console.error(`❌ Error assigning tag ${tagName} to product ${product.name}:`, error);
          } else {
            tagAssignmentsCount++;
          }
        }
      }
    }

    console.log(`\n✅ Assigned ${tagAssignmentsCount} tags to products\n`);
    console.log('🎉 Database seeding completed successfully!');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run the seed function
seed();
