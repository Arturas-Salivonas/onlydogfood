import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { getIngredientDatabase } from '@/scoring/ingredient-matcher';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

// Helper function to determine category and quality from ingredient name
function analyzeIngredientName(ingredientName: string) {
  const database = getIngredientDatabase();
  const normalized = ingredientName.toLowerCase().trim();

  let category: 'meat' | 'meal' | 'grain' | 'vegetable' | 'fruit' | 'fat' | 'additive' | 'supplement' | 'other' = 'other';
  let qualityTier: 'premium' | 'standard' | 'low-quality' | 'filler' | 'unknown' = 'unknown';
  let isMeat = false;
  let isFiller = false;
  let isArtificial = false;

  // Search through all categories to find a match
  for (const [categoryKey, categoryData] of Object.entries(database)) {
    if (categoryData.ingredients.some(ing =>
      normalized.includes(ing.toLowerCase()) || ing.toLowerCase().includes(normalized)
    )) {
      // Determine quality tier based on category
      if (categoryKey.includes('RAW') || categoryKey.includes('FRESH_ORGAN') || categoryKey === 'DEHYDRATED_MEATS_PREMIUM') {
        qualityTier = 'premium';
      } else if (categoryKey.includes('FRESH') || categoryKey.includes('PREPARED')) {
        qualityTier = 'premium';
      } else if (categoryKey.includes('MEAL') || categoryKey.includes('DRIED')) {
        qualityTier = 'standard';
      } else if (categoryKey.includes('FILLER') || categoryKey.includes('LOW_VALUE')) {
        qualityTier = 'filler';
      } else if (categoryKey.includes('ARTIFICIAL') || categoryKey.includes('SUGAR')) {
        qualityTier = 'low-quality';
      }

      // Determine meat source
      if (categoryKey.includes('MEAT') || categoryKey.includes('PROTEIN') ||
          categoryKey.includes('FISH') || categoryKey.includes('EGG')) {
        isMeat = true;
        category = 'meat';
      }

      // Determine category
      if (categoryKey.includes('MEAL')) {
        category = 'meal';
      } else if (categoryKey.includes('GRAIN') || categoryKey.includes('LOW_VALUE_GRAINS')) {
        category = 'grain';
      } else if (categoryKey.includes('VEGETABLE')) {
        category = 'vegetable';
      } else if (categoryKey.includes('SUPERFOODS') && (normalized.includes('berry') || normalized.includes('apple'))) {
        category = 'fruit';
      } else if (categoryKey.includes('FAT') || categoryKey.includes('OMEGA')) {
        category = 'fat';
      } else if (categoryKey.includes('ARTIFICIAL') || categoryKey.includes('ADDITIVE')) {
        category = 'additive';
      } else if (categoryKey.includes('JOINT') || categoryKey.includes('PROBIOTIC') || categoryKey.includes('VITAMIN')) {
        category = 'supplement';
      }

      // Determine filler status
      if (categoryKey.includes('FILLER') || categoryKey.includes('LOW_VALUE_GRAINS')) {
        isFiller = true;
      }

      // Determine artificial status
      if (categoryKey.includes('ARTIFICIAL')) {
        isArtificial = true;
      }

      break;
    }
  }

  return { category, qualityTier, isMeat, isFiller, isArtificial };
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id: productId } = await context.params;
    const { ingredient_name, percentage_declared, position } = await request.json();

    if (!ingredient_name || typeof ingredient_name !== 'string') {
      return NextResponse.json(
        { error: 'Ingredient name is required' },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // Get the product to validate it exists
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, ingredients_raw')
      .eq('id', productId)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Determine position
    let ingredientPosition = position;
    if (!ingredientPosition && percentage_declared) {
      // If percentage is provided, insert in the correct position
      // Ingredients are ordered by percentage (highest first)
      const { data: existingIngredients } = await supabase
        .from('product_ingredients')
        .select('position, percentage_declared')
        .eq('product_id', productId)
        .order('position', { ascending: true });

      if (existingIngredients && existingIngredients.length > 0) {
        // Check if any existing ingredients have percentages
        const hasPercentages = existingIngredients.some(ing => ing.percentage_declared);

        let insertPosition = 1;
        if (!hasPercentages) {
          // No existing ingredients have percentages, insert at position 1
          insertPosition = 1;
        } else {
          // Find position where this ingredient should go based on percentage
          for (const existing of existingIngredients) {
            if (existing.percentage_declared && percentage_declared > existing.percentage_declared) {
              // Insert before this ingredient
              insertPosition = existing.position;
              break;
            }
            insertPosition = existing.position + 1;
          }
        }

        // Shift existing ingredients down - update in reverse order to avoid conflicts
        const toShift = existingIngredients
          .filter(ing => ing.position >= insertPosition)
          .sort((a, b) => b.position - a.position); // Highest position first

        for (const ing of toShift) {
          const { error: updateError } = await supabase
            .from('product_ingredients')
            .update({ position: ing.position + 1 })
            .eq('product_id', productId)
            .eq('position', ing.position);

          if (updateError) {
            console.error(`Error shifting ingredient at position ${ing.position}:`, updateError);
          }
        }

        ingredientPosition = insertPosition;
      } else {
        ingredientPosition = 1;
      }
    } else if (!ingredientPosition) {
      // No percentage or position - append to end
      const { data: existingIngredients } = await supabase
        .from('product_ingredients')
        .select('position')
        .eq('product_id', productId)
        .order('position', { ascending: false })
        .limit(1);

      ingredientPosition = existingIngredients && existingIngredients.length > 0
        ? (existingIngredients[0].position || 0) + 1
        : 1;
    }

    // Analyze the ingredient to get category and quality tier
    const analysis = analyzeIngredientName(ingredient_name);

    // Normalize ingredient name for matching
    const ingredientNormalized = ingredient_name
      .toLowerCase()
      .trim()
      .replace(/\([^)]*\)/g, '') // Remove parentheses and content
      .replace(/[.,;!?()[\]{}]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    // Insert the new ingredient
    const { data: newIngredientData, error: insertError } = await supabase
      .from('product_ingredients')
      .insert({
        product_id: productId,
        ingredient_name: ingredient_name.trim(),
        ingredient_normalized: ingredientNormalized,
        position: ingredientPosition,
        percentage_declared: percentage_declared || null,
        percentage_estimated: percentage_declared || null,
        category: analysis.category,
        quality_tier: analysis.qualityTier,
        is_meat_source: analysis.isMeat,
        is_filler: analysis.isFiller,
        is_artificial: analysis.isArtificial,
        manually_verified: true,
        notes: 'Manually added via admin panel',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting ingredient:', insertError);
      return NextResponse.json(
        { error: 'Failed to add ingredient' },
        { status: 500 }
      );
    }

    // Also update the ingredients_raw field if we want to keep it in sync
    // This adds the ingredient to the raw string
    let updatedRaw = product.ingredients_raw || '';
    if (updatedRaw && !updatedRaw.endsWith(',')) {
      updatedRaw += ', ';
    }
    updatedRaw += percentage_declared
      ? `${ingredient_name.trim()} ${percentage_declared}%`
      : ingredient_name.trim();

    await supabase
      .from('products')
      .update({ ingredients_raw: updatedRaw })
      .eq('id', productId);

    return NextResponse.json({
      success: true,
      ingredient: newIngredientData,
      message: 'Ingredient added successfully',
    });
  } catch (error) {
    console.error('Error adding ingredient:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
