import { NextResponse } from 'next/server';
import { getCachedSupabaseClient } from '@/lib/cache/cached-supabase';
import { getSupabase } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = getSupabase();

    // Get total available products count
    const { count: totalProducts, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_available', true);

    if (countError) {
      throw countError;
    }

    // Get total brands count
    const { count: totalBrands, error: brandsError } = await supabase
      .from('brands')
      .select('*', { count: 'exact', head: true });

    if (brandsError) {
      throw brandsError;
    }

    // Calculate average score from ALL AVAILABLE products with valid scores
    // Use multiple queries to get all products since Supabase limits results
    let allScores: any[] = [];
    let page = 1;
    const pageSize = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data: scores, error: scoreError } = await supabase
        .from('products')
        .select('overall_score')
        .eq('is_available', true)
        .not('overall_score', 'is', null)
        .gt('overall_score', 0)
        .range((page - 1) * pageSize, page * pageSize - 1);

      if (scoreError) {
        console.error('Error fetching scores page', page, ':', scoreError);
        throw scoreError;
      }

      if (scores && scores.length > 0) {
        allScores = allScores.concat(scores);
        page++;
      } else {
        hasMore = false;
      }

      // Safety check to prevent infinite loops
      if (page > 10) {
        console.warn('Reached maximum pages, stopping pagination');
        hasMore = false;
      }
    }

    console.log(`Fetched ${allScores.length} products with scores for average calculation`);

    const averageScore = allScores.length > 0
      ? Math.round(allScores.reduce((sum, product: any) => sum + (product.overall_score || 0), 0) / allScores.length)
      : 70; // Realistic fallback

    const stats = {
      totalProducts,
      totalBrands,
      averageScore,
      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}