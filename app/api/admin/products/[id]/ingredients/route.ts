/**
 * API Route: /api/admin/products/[id]/ingredients
 *
 * Manages structured ingredient data for products
 * - GET: Retrieve all ingredients for a product
 * - POST: Parse and save ingredients from raw text
 * - PUT: Update individual ingredient
 * - DELETE: Remove ingredient
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { parseIngredients } from '@/lib/services/ingredient-parser';
import { analyzeIngredients as analyzeIngredientGroups } from '@/lib/services/ingredient-analyzer';
import type { ProductIngredient, ProductIngredientGroup } from '@/types';

// ==============================================
// GET: Retrieve product ingredients
// ==============================================
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await context.params;
    const supabase = getServiceSupabase();

    // Fetch ingredients
    const { data: ingredients, error: ingredientsError } = await supabase
      .from('product_ingredients')
      .select('*')
      .eq('product_id', productId)
      .order('position', { ascending: true });

    if (ingredientsError) {
      throw ingredientsError;
    }

    // Fetch groups
    const { data: groups, error: groupsError } = await supabase
      .from('product_ingredient_groups')
      .select('*')
      .eq('product_id', productId);

    if (groupsError) {
      throw groupsError;
    }

    return NextResponse.json({
      ingredients: ingredients || [],
      groups: groups || [],
    });
  } catch (error) {
    console.error('Error fetching ingredients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ingredients' },
      { status: 500 }
    );
  }
}

// ==============================================
// POST: Parse and save ingredients
// ==============================================
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await context.params;
    const body = await request.json();
    const { ingredients_raw, force = false } = body;

    if (!ingredients_raw) {
      return NextResponse.json(
        { error: 'ingredients_raw is required' },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // Check if already analyzed (unless force=true)
    if (!force) {
      const { data: product } = await supabase
        .from('products')
        .select('ingredients_analyzed')
        .eq('id', productId)
        .single();

      if (product?.ingredients_analyzed) {
        return NextResponse.json(
          { error: 'Product already analyzed. Use force=true to re-analyze' },
          { status: 409 }
        );
      }
    }

    // Parse ingredients
    const parsedIngredients = parseIngredients(ingredients_raw);

    if (parsedIngredients.length === 0) {
      return NextResponse.json(
        { error: 'No ingredients could be parsed' },
        { status: 400 }
      );
    }

    // Analyze for groups and patterns
    const analysis = analyzeIngredientGroups(parsedIngredients, productId);

    // Delete existing ingredients if force=true
    if (force) {
      await supabase
        .from('product_ingredients')
        .delete()
        .eq('product_id', productId);

      await supabase
        .from('product_ingredient_groups')
        .delete()
        .eq('product_id', productId);
    }

    // Insert ingredients
    const ingredientsToInsert = parsedIngredients.map(ing => ({
      product_id: productId,
      position: ing.position,
      ingredient_name: ing.ingredient_name,
      ingredient_normalized: ing.ingredient_normalized,
      percentage_declared: ing.percentage_declared,
      percentage_estimated: ing.percentage_estimated,
      percentage_confidence: ing.percentage_confidence,
      category: ing.category,
      subcategory: ing.subcategory,
      quality_tier: ing.quality_tier,
      is_meat_source: ing.is_meat_source,
      is_protein_source: ing.is_protein_source,
      is_filler: ing.is_filler,
      is_artificial: ing.is_artificial,
      is_controversial: ing.is_controversial,
      manually_verified: false,
    }));

    const { data: insertedIngredients, error: insertError } = await supabase
      .from('product_ingredients')
      .insert(ingredientsToInsert)
      .select();

    if (insertError) {
      throw insertError;
    }

    // Insert groups
    const groupsToInsert = analysis.groups.map(group => ({
      product_id: productId,
      group_type: group.group_type,
      group_category: group.group_category,
      total_percentage: group.total_percentage,
      ingredient_count: group.ingredient_count,
      highest_position: group.highest_position,
      average_position: group.average_position,
      member_ingredients: group.members,
      is_split_suspected: group.is_split_suspected,
      split_severity: group.split_severity,
    }));

    let insertedGroups = [];
    if (groupsToInsert.length > 0) {
      const { data, error: groupInsertError } = await supabase
        .from('product_ingredient_groups')
        .insert(groupsToInsert)
        .select();

      if (groupInsertError) {
        console.error('Error inserting groups:', groupInsertError);
      } else {
        insertedGroups = data || [];
      }
    }

    // Update product metadata
    const declaredCount = parsedIngredients.filter(
      ing => ing.percentage_declared !== null
    ).length;

    await supabase
      .from('products')
      .update({
        total_ingredients_count: parsedIngredients.length,
        ingredients_analyzed: true,
        declared_percentages_count: declaredCount,
        has_ingredient_splitting: analysis.hasIngredientSplitting,
        has_filler_stuffing: analysis.hasFillerStuffing,
        effective_meat_percent: analysis.effectiveMeatPercent,
        total_filler_percent: analysis.totalFillerPercent,
        updated_at: new Date().toISOString(),
      })
      .eq('id', productId);

    return NextResponse.json({
      success: true,
      ingredients: insertedIngredients,
      groups: insertedGroups,
      analysis: {
        totalIngredients: parsedIngredients.length,
        declaredPercentages: declaredCount,
        hasIngredientSplitting: analysis.hasIngredientSplitting,
        hasFillerStuffing: analysis.hasFillerStuffing,
        effectiveMeatPercent: analysis.effectiveMeatPercent,
        totalFillerPercent: analysis.totalFillerPercent,
      },
    });
  } catch (error) {
    console.error('Error parsing ingredients:', error);
    return NextResponse.json(
      { error: 'Failed to parse ingredients' },
      { status: 500 }
    );
  }
}

// ==============================================
// PUT: Update single ingredient
// ==============================================
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await context.params;
    const body = await request.json();
    const { ingredient_id, updates } = body;

    if (!ingredient_id) {
      return NextResponse.json(
        { error: 'ingredient_id is required' },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // Validate updates
    const allowedFields = [
      'ingredient_name',
      'percentage_declared',
      'percentage_estimated',
      'percentage_confidence',
      'category',
      'subcategory',
      'quality_tier',
      'is_meat_source',
      'is_protein_source',
      'is_filler',
      'is_artificial',
      'is_controversial',
      'notes',
      'manually_verified',
    ];

    const validUpdates: Record<string, any> = {};
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        validUpdates[field] = updates[field];
      }
    }

    if (Object.keys(validUpdates).length === 0) {
      return NextResponse.json(
        { error: 'No valid updates provided' },
        { status: 400 }
      );
    }

    // Add updated_at
    validUpdates.updated_at = new Date().toISOString();

    // Update ingredient
    const { data, error } = await supabase
      .from('product_ingredients')
      .update(validUpdates)
      .eq('id', ingredient_id)
      .eq('product_id', productId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, ingredient: data });
  } catch (error) {
    console.error('Error updating ingredient:', error);
    return NextResponse.json(
      { error: 'Failed to update ingredient' },
      { status: 500 }
    );
  }
}

// ==============================================
// DELETE: Remove ingredient
// ==============================================
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await context.params;
    const { searchParams } = new URL(request.url);
    const ingredientId = searchParams.get('ingredient_id');

    if (!ingredientId) {
      return NextResponse.json(
        { error: 'ingredient_id is required' },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    const { error } = await supabase
      .from('product_ingredients')
      .delete()
      .eq('id', ingredientId)
      .eq('product_id', productId);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting ingredient:', error);
    return NextResponse.json(
      { error: 'Failed to delete ingredient' },
      { status: 500 }
    );
  }
}
