import { NextRequest, NextResponse } from 'next/server';
import { getCachedSupabaseClient } from '@/lib/cache/cached-supabase';
import { Brand } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category') || undefined;

    const cachedClient = getCachedSupabaseClient();
    const result = await cachedClient.getBrand(slug, category);

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('API error:', error);
    if (error instanceof Error && error.message === 'Brand not found') {
      return NextResponse.json(
        { error: 'Brand not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
