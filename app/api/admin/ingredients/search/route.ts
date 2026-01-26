import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';

    if (!query || query.length < 2) {
      return NextResponse.json({ ingredients: [] });
    }

    const supabase = getServiceSupabase();

    // Search for ingredients matching the query
    const { data: ingredients, error } = await supabase
      .from('product_ingredients')
      .select('ingredient_name, percentage_declared, category, quality_tier')
      .ilike('ingredient_name', `%${query}%`)
      .order('ingredient_name')
      .limit(50);

    if (error) {
      console.error('Error searching ingredients:', error);
      return NextResponse.json(
        { error: 'Failed to search ingredients' },
        { status: 500 }
      );
    }

    // Deduplicate by ingredient_name and collect metadata
    const uniqueIngredients = ingredients?.reduce((acc, curr) => {
      const existing = acc.find(i => i.ingredient_name.toLowerCase() === curr.ingredient_name.toLowerCase());
      if (!existing) {
        acc.push(curr);
      }
      return acc;
    }, [] as typeof ingredients) || [];

    return NextResponse.json({
      ingredients: uniqueIngredients.map(i => ({
        name: i.ingredient_name,
        percentage: i.percentage_declared,
        category: i.category,
        quality_tier: i.quality_tier,
      }))
    });
  } catch (error) {
    console.error('Error in ingredient search:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
