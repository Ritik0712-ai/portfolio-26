import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    const slug = searchParams.get('slug');
    // BlogPreview on the homepage requests ?limit=3; without this it was
    // silently ignored and the homepage listed every published post.
    const limit = searchParams.get('limit');

    // app/blog/[slug]/page.tsx fetches /api/blogs?slug=... and reads
    // data.blog (singular). Without this branch the slug was ignored, the
    // route returned the full { blogs: [...] } list, data.blog was always
    // undefined, and every post rendered "Post Not Found".
    if (slug) {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .maybeSingle();
      if (error) throw error;
      return NextResponse.json({ blog: data });
    }

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

    if (limit) {
      const n = Number.parseInt(limit, 10);
      if (Number.isFinite(n) && n > 0) query = query.limit(n);
    }

    const { data: blogs, error } = await query;

    if (error) throw error;
    return NextResponse.json({ blogs });
  } catch (err) {
    console.error('Error fetching blogs:', err);
    return NextResponse.json({ error: 'Failed to read blogs' }, { status: 500 });
  }
}
