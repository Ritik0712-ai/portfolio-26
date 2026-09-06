import { createClient as createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const publishNowSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['blogs', 'projects']),
});

// POST /api/admin/schedule/publish-now - Publish a scheduled item immediately
export async function POST(request: Request) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();

  if (!adminUser) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const validated = publishNowSchema.parse(body);

    const tableMap: Record<string, { table: string; publishedField: string; scheduledField: string }> = {
      blogs: { table: 'blogs', publishedField: 'published', scheduledField: 'scheduled_publish_at' },
      projects: { table: 'projects', publishedField: 'published', scheduledField: 'scheduled_publish_at' },
    };

    const config = tableMap[validated.type];
    if (!config) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    // Publish immediately
    const { data, error } = await supabase
      .from(config.table)
      .update({
        [config.publishedField]: true,
        [config.scheduledField]: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', validated.id)
      .select('id, title')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log activity
    await supabase.from('activity_log').insert({
      user_id: user.id,
      action: 'schedule_publish_now',
      resource_type: validated.type,
      resource_id: validated.id,
      details: { title: data?.title },
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues?.[0]?.message || 'Validation error' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

// GET /api/admin/schedule - Get scheduled items
export async function GET(request: Request) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();

  if (!adminUser) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  const results: { type: string; data: any[] }[] = [];

  const typesToQuery = type ? [type] : ['blogs', 'projects'];

  for (const t of typesToQuery) {
    if (t === 'blogs') {
      const { data } = await supabase
        .from('blogs')
        .select('id, title, scheduled_publish_at, published, created_at')
        .not('scheduled_publish_at', 'is', null)
        .order('scheduled_publish_at', { ascending: true });
      if (data?.length) results.push({ type: 'blogs', data });
    } else if (t === 'projects') {
      const { data } = await supabase
        .from('projects')
        .select('id, title, scheduled_publish_at, published, created_at')
        .not('scheduled_publish_at', 'is', null)
        .order('scheduled_publish_at', { ascending: true });
      if (data?.length) results.push({ type: 'projects', data });
    }
  }

  return NextResponse.json({ results });
}
