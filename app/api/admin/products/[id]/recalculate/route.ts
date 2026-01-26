import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { calculateOverallScore, getScoreGrade } from '@/scoring/calculator';

/**
 * POST /api/admin/products/[id]/recalculate
 * Recalculate score for a specific product
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getServiceSupabase();
    const { id } = await context.params;

    // Get product
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (!product.ingredients_raw) {
      return NextResponse.json({ error: 'Missing ingredients data' }, { status: 400 });
    }

    // Calculate new scores
    const result = calculateOverallScore(product as any);

    const grade = getScoreGrade(result.overallScore);

    // Update product
    const { error: updateError } = await supabase
      .from('products')
      .update({
        overall_score: result.overallScore,
        ingredient_score: result.ingredientScore,
        nutrition_score: result.nutritionScore,
        value_score: result.valueScore,
        scoring_breakdown: result.breakdown,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Recalculated score for ${product.name}`,
      scores: {
        overall: result.overallScore,
        ingredient: result.ingredientScore,
        nutrition: result.nutritionScore,
        value: result.valueScore,
      },
    });
  } catch (error: any) {
    console.error('Recalculation error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
