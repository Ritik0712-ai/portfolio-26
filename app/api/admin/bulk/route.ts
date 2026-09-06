import { createClient as createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET /api/admin/bulk - Get items for bulk operations
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
  const type = searchParams.get('type'); // 'blogs' | 'projects' | 'testimonials' | 'timeline'
  const ids = searchParams.get('ids')?.split(',').filter(Boolean);

  if (!type || !ids || ids.length === 0) {
    return NextResponse.json({ error: 'Missing type or ids' }, { status: 400 });
  }

  const tableMap: Record<string, string> = {
    blogs: 'blogs',
    projects: 'projects',
    testimonials: 'testimonials',
    timeline: 'timeline',
  };

  const table = tableMap[type];
  if (!table) {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from(table)
    .select('id, title, published, created_at')
    .in('id', ids);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: data ?? [] });
}

// POST /api/admin/bulk - Perform bulk operations
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

  const body = await request.json();
  const { type, action, ids } = body;

  if (!type || !action || !ids || !Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const allowedActions = ['publish', 'unpublish', 'delete'];
  if (!allowedActions.includes(action)) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  const tableMap: Record<string, { table: string; publishedField?: string }> = {
    blogs: { table: 'blogs', publishedField: 'published' },
    projects: { table: 'projects', publishedField: 'published' },
    testimonials: { table: 'testimonials' },
    timeline: { table: 'timeline' },
  };

  const config = tableMap[type];
  if (!config) {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  }

  let result;

  if (action === 'delete') {
    result = await supabase.from(config.table).delete().in('id', ids);
  } else if (action === 'publish' && config.publishedField) {
    result = await supabase.from(config.table).update({ [config.publishedField]: true }).in('id', ids);
  } else if (action === 'unpublish' && config.publishedField) {
    result = await supabase.from(config.table).update({ [config.publishedField]: false }).in('id', ids);
  }

  if (result?.error) {
    return NextResponse.json({ error: result.error.message }, { status: 500 });
  }

  // Log activity
  await supabase.from('activity_log').insert({
    user_id: user.id,
    action: `bulk_${action}`,
    resource_type: type,
    resource_ids: ids,
    details: { count: ids.length },
  });

  return NextResponse.json({
    success: true,
    affected: ids.length,
    action,
    type,
  });
}
