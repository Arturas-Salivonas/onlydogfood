import { NextRequest, NextResponse } from 'next/server';
import { getCachedSupabaseClient } from '@/lib/cache/cached-supabase';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query || query.length < 3) {
      return NextResponse.json({ products: [], brands: [] });
    }

    const cachedClient = getCachedSupabaseClient();
    const results = await cachedClient.search(query);

    return NextResponse.json(results);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
