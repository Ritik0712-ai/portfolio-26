import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');

    let query = supabase
      .from('blogs')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }
    if (featured === 'true') {
      query = query.eq('featured', true);
    }

    const { data: blogs, error } = await query;

    if (error) throw error;
    return NextResponse.json({ blogs });
  } catch (err) {
    console.error('Error fetching blogs:', err);
    return NextResponse.json({ error: 'Failed to read blogs' }, { status: 500 });
  }
}
