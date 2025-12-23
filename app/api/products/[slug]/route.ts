import { NextRequest, NextResponse } from 'next/server';
import { getCachedSupabaseClient } from '@/lib/cache/cached-supabase';
import { Product } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const cachedClient = getCachedSupabaseClient();

    const result = await cachedClient.getProduct(slug);

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('API error:', error);
    if (error instanceof Error && error.message === 'Product not found') {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
