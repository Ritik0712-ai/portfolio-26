import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { slug } = await request.json();

    if (!slug || typeof slug !== 'string') {
      return NextResponse.json({ error: 'Invalid slug' }, { status: 400 });
    }

    const supabase = await createClient();

    // Increment view count using atomic operation
    let data: any = null;
    let error: any = null;
    try {
      const result = await supabase.rpc('increment_blog_views', {
        p_slug: slug
      });
      data = result.data;
      error = result.error;
    } catch {
      // Fallback if RPC doesn't exist: use direct update
      const { data: post } = await supabase
        .from('blogs')
        .select('views')
        .eq('slug', slug)
        .single();

      if (!post) {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 });
      }

      const { data: updated } = await supabase
        .from('blogs')
        .update({ views: (post.views || 0) + 1 })
        .eq('slug', slug)
        .select('views')
        .single();

      data = updated?.views || 0;
    }

    if (error) {
      return NextResponse.json({ error: error.message || 'Failed to record view' }, { status: 500 });
    }

    return NextResponse.json({ views: data?.views || 0 });
  } catch {
    return NextResponse.json({ error: 'Failed to record view' }, { status: 500 });
  }
}
