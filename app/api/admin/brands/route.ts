import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { verifyToken } from '@/lib/auth';
import { BrandUpdate } from '@/types';

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
    const body: Omit<BrandUpdate, 'id' | 'created_at' | 'updated_at' | 'total_products'> = await request.json();

    // Insert the brand
    const { data: brand, error } = await supabase
      .from('brands')
      .insert([body])
      .select()
      .single();

    if (error) {
      console.error('Error creating brand:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(brand, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/admin/brands:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
