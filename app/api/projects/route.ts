import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get('featured');
    const slug = searchParams.get('slug');

    if (slug) {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .single();
      if (error) throw error;
      return NextResponse.json({ project: data });
    }

    let query = supabase
      .from('projects')
      .select('*')
      .eq('published', true)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (featured === 'true') {
      query = query.eq('featured', true);
    }

    const { data: projects, error } = await query;

    if (error) throw error;
    return NextResponse.json({ projects });
  } catch (err) {
    console.error('Error fetching projects:', err);
    return NextResponse.json({ error: 'Failed to read projects' }, { status: 500 });
  }
}
