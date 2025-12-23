import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { verifyToken } from '@/lib/auth';
import { BrandUpdate } from '@/types';
import { revalidateBrands } from '@/lib/revalidate';

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
    const body: BrandUpdate = await request.json();

    // Update the brand
    const { data: brand, error } = await supabase
      .from('brands')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating brand:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Revalidate related pages after successful update
    try {
      await revalidateBrands([id]);
    } catch (revalidateError) {
      console.warn('Revalidation failed:', revalidateError);
      // Don't fail the request if revalidation fails
    }

    return NextResponse.json(brand);
  } catch (error) {
    console.error('Error in PUT /api/admin/brands/[id]:', error);
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

    // Delete the brand
    const { error } = await supabase
      .from('brands')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting brand:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Revalidate related pages after successful deletion
    try {
      await revalidateBrands();
    } catch (revalidateError) {
      console.warn('Revalidation failed:', revalidateError);
      // Don't fail the request if revalidation fails
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/admin/brands/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
