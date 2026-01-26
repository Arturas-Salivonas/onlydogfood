import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { calculateOverallScore, getScoreGrade } from '@/scoring/calculator';

/**
 * POST /api/admin/products/recalculate-all
 * Recalculate scores for all products
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = getServiceSupabase();

    // Get all products
    const { data: products, error: fetchError } = await supabase
      .from('products')
      .select('*');

    if (fetchError) {
      console.error('Fetch error:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }

    if (!products || products.length === 0) {
      return NextResponse.json({ message: 'No products to recalculate' }, { status: 200 });
    }

    let successCount = 0;
    let errorCount = 0;
    const errors: Array<{ product: string; error: string }> = [];

    for (const product of products) {
      try {
        if (!product.ingredients_raw || !product.protein_percent) {
          errorCount++;
          errors.push({ product: product.name, error: 'Missing required data' });
          continue;
        }

        // Calculate new scores
        const result = calculateOverallScore(product as any);

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
          .eq('id', product.id);

        if (updateError) {
          errorCount++;
          errors.push({ product: product.name, error: updateError.message });
        } else {
          successCount++;
        }
      } catch (err: any) {
        errorCount++;
        errors.push({ product: product.name, error: err.message });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Recalculated ${successCount} products`,
      successCount,
      errorCount,
      total: products.length,
      errors: errors.slice(0, 10), // Return first 10 errors only
    });
  } catch (error: any) {
    console.error('Recalculation error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
