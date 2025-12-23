import { NextRequest, NextResponse } from 'next/server';
import { getCachedSupabaseClient } from '@/lib/cache/cached-supabase';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sort = searchParams.get('sort') || 'score-desc';

    const cachedClient = getCachedSupabaseClient();
    const brands = await cachedClient.getBrands(sort);

    return NextResponse.json(brands, {
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
