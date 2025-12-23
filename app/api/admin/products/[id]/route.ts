import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { verifyToken } from '@/lib/auth';
import { ProductUpdate } from '@/types';
import { revalidateProducts } from '@/lib/revalidate';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    // Fetch the product with brand and tags
    const { data: product, error } = await supabase
      .from('products')
      .select(`
        *,
        brand:brands(*),
        product_tags(tag:tags(*))
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching product:', error);
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Transform the data to match the expected format
    const transformedProduct = {
      ...product,
      tags: product.product_tags?.map((pt: any) => pt.tag) || []
    };

    return NextResponse.json(transformedProduct);
  } catch (error) {
    console.error('Error in GET /api/admin/products/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    // Update the product
    const { data: product, error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating product:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Update product-tag relationships if tags are provided
    if (tags !== undefined) {
      // First, delete existing tags
      await supabase
        .from('product_tags')
        .delete()
        .eq('product_id', id);

      // Then insert new tags
      if (tags.length > 0) {
        const tagInserts = tags.map((tagId: string) => ({
          product_id: id,
          tag_id: tagId,
        }));

        const { error: tagError } = await supabase
          .from('product_tags')
          .insert(tagInserts);

        if (tagError) {
          console.error('Error updating product tags:', tagError);
          // Don't fail the whole request, just log the error
        }
      }
    }

    // Revalidate related pages after successful update
    try {
      await revalidateProducts([id]);
    } catch (revalidateError) {
      console.warn('Revalidation failed:', revalidateError);
      // Don't fail the request if revalidation fails
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error in PUT /api/admin/products/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    // Delete the product
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting product:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Revalidate related pages after successful deletion
    try {
      await revalidateProducts();
    } catch (revalidateError) {
      console.warn('Revalidation failed:', revalidateError);
      // Don't fail the request if revalidation fails
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/admin/products/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
