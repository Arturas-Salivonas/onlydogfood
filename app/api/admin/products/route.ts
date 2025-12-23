import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const token = request.cookies.get('admin_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const supabase = getServiceSupabase();
    const body = await request.json();
    const { tags, ...productData } = body;

    // Insert the product
    const { data: product, error } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single();

    if (error) {
      console.error('Error creating product:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Insert product-tag relationships if tags are provided
    if (tags && tags.length > 0) {
      const tagInserts = tags.map((tagId: string) => ({
        product_id: product.id,
        tag_id: tagId,
      }));

      const { error: tagError } = await supabase
        .from('product_tags')
        .insert(tagInserts);

      if (tagError) {
        console.error('Error creating product tags:', tagError);
        // Don't fail the whole request, just log the error
      }
    }

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/admin/products:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
