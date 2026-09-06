import { createClient as createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET /api/admin/export - Export portfolio data as JSON
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
  const types = searchParams.get('types')?.split(',').filter(Boolean) || [
    'blogs', 'projects', 'testimonials', 'timeline', 'stats'
  ];

  const exportData: Record<string, any> = {};
  const tableMap: Record<string, string> = {
    blogs: 'blogs',
    projects: 'projects',
    testimonials: 'testimonials',
    timeline: 'timeline_events',
    stats: 'stats',
  };

  for (const type of types) {
    const table = tableMap[type];
    if (!table) continue;

    const { data, error } = await supabase.from(table).select('*');
    if (!error) {
      exportData[type] = data ?? [];
    }
  }

  const exportPayload = {
    exported_at: new Date().toISOString(),
    exported_by: user.email,
    version: '1.0',
    data: exportData,
  };

  const json = JSON.stringify(exportPayload, null, 2);

  return new NextResponse(json, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename=portfolio-export-${new Date().toISOString().split('T')[0]}.json`,
    },
  });
}

// POST /api/admin/export - Import portfolio data from JSON
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
    const { data: importData, strategy = 'upsert' } = body;

    if (!importData || typeof importData !== 'object') {
      return NextResponse.json({ error: 'Invalid import data' }, { status: 400 });
    }

    const allowedStrategies = ['upsert', 'replace'];
    if (!allowedStrategies.includes(strategy)) {
      return NextResponse.json({ error: 'Invalid strategy. Use upsert or replace' }, { status: 400 });
    }

    const allowedTables = ['blogs', 'projects', 'testimonials', 'timeline', 'stats'];
    const tableMap: Record<string, string> = {
      blogs: 'blogs',
      projects: 'projects',
      testimonials: 'testimonials',
      timeline: 'timeline_events',
      stats: 'stats',
    };

    const results: Record<string, { imported: number; errors: string[] }> = {};

    for (const type of allowedTables) {
      const items = importData[type];
      if (!Array.isArray(items) || items.length === 0) {
        results[type] = { imported: 0, errors: [] };
        continue;
      }

      const table = tableMap[type];
      if (!table) {
        results[type] = { imported: 0, errors: ['Invalid table type'] };
        continue;
      }

      // Remove id to let Supabase generate new ones (avoid conflicts)
      const cleanItems = items.map(({ id, ...rest }) => rest);

      if (strategy === 'replace') {
        const { error: deleteError } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (deleteError) {
          results[type] = { imported: 0, errors: [deleteError.message] };
          continue;
        }
      }

      const { data: inserted, error } = await supabase.from(table).insert(cleanItems).select();

      if (error) {
        results[type] = { imported: 0, errors: [error.message] };
      } else {
        results[type] = { imported: inserted?.length ?? 0, errors: [] };
      }
    }

    // Log activity
    await supabase.from('activity_log').insert({
      user_id: user.id,
      action: 'bulk_import',
      resource_type: 'all',
      details: { results },
    });

    const totalImported = Object.values(results).reduce((sum, r) => sum + r.imported, 0);
    const hasErrors = Object.values(results).some(r => r.errors.length > 0);

    return NextResponse.json({
      success: true,
      strategy,
      results,
      totalImported,
      hasErrors,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON data' }, { status: 400 });
  }
}
