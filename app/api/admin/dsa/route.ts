import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { logActivity } from '@/lib/activity-log';
import { slugify } from '@/lib/dsa';

const schema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().max(100).optional(),
  number: z.coerce.number().int().positive().nullish(),
  url: z.string().url().nullish().or(z.literal('')),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).nullish(),
  topics: z.array(z.string().min(1).max(60)).max(20).default([]),
  approach: z.string().max(20000).nullish(),
  time_complexity: z.string().max(80).nullish(),
  space_complexity: z.string().max(80).nullish(),
  code: z.string().max(40000).nullish(),
  language: z.string().max(30).nullish(),
  notes: z.string().max(5000).nullish(),
  revisit: z.boolean().optional(),
  solved_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  published: z.boolean().optional(),
});

function badRequest(err: unknown) {
  if (err instanceof z.ZodError) {
    const issue = err.issues[0];
    return NextResponse.json({ error: `${issue.path.join('.') || 'request'}: ${issue.message}` }, { status: 400 });
  }
  return null;
}

function refresh(slug?: string) {
  revalidatePath('/dsa');
  if (slug) revalidatePath(`/dsa/${slug}`);
}

export async function GET() {
  const admin = await requireAdmin();
  if ('error' in admin) return admin.error;
  const supabase = await createClient();
  const { data, error } = await supabase.from('dsa_problems').select('*').order('solved_at', { ascending: false }).order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ problems: data });
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  if ('error' in admin) return admin.error;
  try {
    const parsed = schema.parse(await request.json());
    const row = { ...parsed, slug: slugify(parsed.slug || parsed.title), url: parsed.url || null };
    const supabase = await createClient();
    const { data, error } = await supabase.from('dsa_problems').insert([row]).select().single();
    if (error) throw error;
    await logActivity(supabase, { userId: admin.user.id, action: 'create', resourceType: 'dsa_problem', resourceId: data?.id ?? null });
    refresh(data?.slug);
    return NextResponse.json({ problem: data });
  } catch (err) {
    const bad = badRequest(err);
    if (bad) return bad;
    const msg = (err as { code?: string; message?: string })?.code === '23505' ? 'A problem with this slug already exists' : 'Failed to save';
    console.error('dsa create failed', err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const admin = await requireAdmin();
  if ('error' in admin) return admin.error;
  const id = request.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  try {
    const parsed = schema.partial().parse(await request.json());
    const row = { ...parsed, ...(parsed.slug !== undefined || parsed.title ? { slug: slugify(parsed.slug || parsed.title || '') } : {}), ...(parsed.url === '' ? { url: null } : {}) };
    if ('slug' in row && !row.slug) delete (row as { slug?: string }).slug;
    const supabase = await createClient();
    const { data, error } = await supabase.from('dsa_problems').update(row).eq('id', id).select().single();
    if (error) throw error;
    await logActivity(supabase, { userId: admin.user.id, action: 'update', resourceType: 'dsa_problem', resourceId: id });
    refresh(data?.slug);
    return NextResponse.json({ problem: data });
  } catch (err) {
    const bad = badRequest(err);
    if (bad) return bad;
    console.error('dsa update failed', err);
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const admin = await requireAdmin();
  if ('error' in admin) return admin.error;
  const id = request.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const supabase = await createClient();
  const { error } = await supabase.from('dsa_problems').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await logActivity(supabase, { userId: admin.user.id, action: 'delete', resourceType: 'dsa_problem', resourceId: id });
  refresh();
  return NextResponse.json({ ok: true });
}
