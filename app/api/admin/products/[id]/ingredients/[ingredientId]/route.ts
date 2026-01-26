/**
 * API Route: /api/admin/products/[id]/ingredients/[ingredientId]
 *
 * DELETE: Remove a specific ingredient from a product
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

interface RouteContext {
  params: Promise<{ id: string; ingredientId: string }>;
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id: productId, ingredientId } = await context.params;
    const supabase = getServiceSupabase();

    // Verify product exists
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, name')
      .eq('id', productId)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Get ingredient details before deleting (for position adjustment)
    const { data: ingredient, error: ingredientError } = await supabase
      .from('product_ingredients')
      .select('position, ingredient_name')
      .eq('id', ingredientId)
      .eq('product_id', productId)
      .single();

    if (ingredientError || !ingredient) {
      return NextResponse.json(
        { error: 'Ingredient not found' },
        { status: 404 }
      );
    }

    // Delete the ingredient
    const { error: deleteError } = await supabase
      .from('product_ingredients')
      .delete()
      .eq('id', ingredientId)
      .eq('product_id', productId);

    if (deleteError) {
      console.error('Error deleting ingredient:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete ingredient' },
        { status: 500 }
      );
    }

    // Adjust positions of subsequent ingredients (shift them up)
    const { data: subsequentIngredients } = await supabase
      .from('product_ingredients')
      .select('id, position')
      .eq('product_id', productId)
      .gt('position', ingredient.position)
      .order('position', { ascending: true });

    if (subsequentIngredients && subsequentIngredients.length > 0) {
      // Update positions one by one
      for (const ing of subsequentIngredients) {
        await supabase
          .from('product_ingredients')
          .update({ position: ing.position - 1 })
          .eq('id', ing.id);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Deleted ingredient: ${ingredient.ingredient_name}`,
      deletedIngredient: {
        id: ingredientId,
        name: ingredient.ingredient_name,
        position: ingredient.position,
      },
    });
  } catch (error) {
    console.error('Error in DELETE /api/admin/products/[id]/ingredients/[ingredientId]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
