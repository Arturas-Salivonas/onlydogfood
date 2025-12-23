import { NextRequest, NextResponse } from 'next/server';
import { getCachedSupabaseClient } from '@/lib/cache/cached-supabase';
import { Product } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productIds } = body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        { error: 'Product IDs are required' },
        { status: 400 }
      );
    }

    if (productIds.length > 4) {
      return NextResponse.json(
        { error: 'Maximum 4 products can be compared' },
        { status: 400 }
      );
    }

    const cachedClient = getCachedSupabaseClient();
    const products = await cachedClient.getProductsByIds(productIds);

    // Sort products in the same order as requested IDs
    const sortedProducts = productIds
      .map(id => products?.find(p => p.id === id))
      .filter(Boolean);

    return NextResponse.json(sortedProducts);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
