import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { sendNewPostEmails } from '@/lib/newsletter';
import { z } from 'zod';

const blogSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  excerpt: z.string().nullish(),
  content: z.string().min(1),
  cover_image: z.string().url().nullish().or(z.literal('')),
  tags: z.array(z.string()).nullish(),
  // Tolerant: older client bundles (and browser-cached ones) send a number.
  reading_time: z.union([z.string(), z.number()]).transform(String).nullish(),
  featured: z.boolean().optional(),
  published: z.boolean().optional(),
  category: z.string().nullish(),
});

export async function GET(request: NextRequest) {
  const admin = await requireAdmin();
  if ('error' in admin) return admin.error;

  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const supabase = await createClient();

    if (slug) {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('slug', slug)
        .single();
      if (error) throw error;
      return NextResponse.json({ blog: data });
    }

    const { data: blogs, error } = await supabase
      .from('blogs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ blogs });
  } catch (err) {
    console.error('Error fetching blogs:', err);
    return NextResponse.json({ error: 'Failed to read blogs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  if ('error' in admin) return admin.error;

  try {
    const body = await request.json();
    const parsed = blogSchema.parse(body);
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('blogs')
      .insert([{
        title: parsed.title,
        slug: parsed.slug,
        excerpt: parsed.excerpt || '',
        content: parsed.content,
        cover_image: parsed.cover_image || '',
        tags: parsed.tags || [],
        reading_time: String(parsed.reading_time || 0),
        featured: parsed.featured || false,
        published: parsed.published !== undefined ? parsed.published : true,
        category: parsed.category || 'Tech',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'A post with this slug already exists' }, { status: 409 });
      }
      throw error;
    }
    return NextResponse.json({ success: true, blog: data });
  } catch (err) {
    if (err instanceof z.ZodError) {
      const issue = err.issues[0];
      const field = issue.path.join('.') || 'request';
      return NextResponse.json({ error: `${field}: ${issue.message}` }, { status: 400 });
    }
    console.error('Error creating blog:', err);
    return NextResponse.json({ error: 'Failed to create blog' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const admin = await requireAdmin();
  if ('error' in admin) return admin.error;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Blog ID required' }, { status: 400 });

    const body = await request.json();
    const parsed = blogSchema.partial().parse(body);
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('blogs')
      .update({ ...parsed, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Notify subscribers the first time a post becomes publicly visible.
    // newsletter_sent_at is the guard: without it, every subsequent edit to a
    // published post would re-mail everyone. It is set before sending, so a
    // double-click cannot produce two broadcasts.
    let newsletter;
    if (data?.published && !data.newsletter_sent_at) {
      const { data: claimed } = await supabase
        .from('blogs')
        .update({ newsletter_sent_at: new Date().toISOString() })
        .eq('id', id)
        .is('newsletter_sent_at', null)
        .select('id')
        .maybeSingle();

      if (claimed) {
        const { data: subs } = await supabase
          .from('newsletter_subscribers')
          .select('email, unsubscribe_token')
          .eq('confirmed', true);

        if (subs?.length) {
          newsletter = await sendNewPostEmails(
            { title: data.title, slug: data.slug, excerpt: data.excerpt },
            subs
          );
          console.log('Newsletter broadcast:', data.slug, newsletter);
        } else {
          newsletter = { sent: 0, failed: 0 };
        }
      }
    }

    return NextResponse.json({ success: true, blog: data, newsletter });
  } catch (err) {
    if (err instanceof z.ZodError) {
      const issue = err.issues[0];
      const field = issue.path.join('.') || 'request';
      return NextResponse.json({ error: `${field}: ${issue.message}` }, { status: 400 });
    }
    console.error('Error updating blog:', err);
    return NextResponse.json({ error: 'Failed to update blog' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const admin = await requireAdmin();
  if ('error' in admin) return admin.error;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Blog ID required' }, { status: 400 });

    const supabase = await createClient();
    const { error } = await supabase.from('blogs').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error deleting blog:', err);
    return NextResponse.json({ error: 'Failed to delete blog' }, { status: 500 });
  }
}
