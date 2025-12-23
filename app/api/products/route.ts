import { NextRequest, NextResponse } from 'next/server';
import { getCachedSupabaseClient } from '@/lib/cache/cached-supabase';
import { FilterOptions, PaginatedResponse, Product } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Parse query parameters
    const category = searchParams.get('category') || undefined;
    const brandId = searchParams.get('brandId') || undefined;
    const minScore = searchParams.get('minScore') ? Number(searchParams.get('minScore')) : undefined;
    const maxScore = searchParams.get('maxScore') ? Number(searchParams.get('maxScore')) : undefined;
    const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
    const search = searchParams.get('search') || undefined;
    const sort = searchParams.get('sort') || 'score-desc';
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 12;

    const filters: FilterOptions = {
      category: (category as 'dry' | 'wet' | 'snack' | 'all' | undefined),
      brandId,
      minScore,
      maxScore,
      minPrice,
      maxPrice,
      search,
      sort: (sort as 'score-desc' | 'score-asc' | 'price-asc' | 'price-desc' | 'newest'),
      page,
      limit,
    };

    const cachedClient = getCachedSupabaseClient();
    const response = await cachedClient.getProducts(filters);

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
