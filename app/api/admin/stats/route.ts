import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { z } from 'zod';

const statSchema = z.object({
  icon: z.string().min(1),
  value: z.coerce.number().int().nonnegative(),
  suffix: z.string(),
  label: z.string().min(1),
  display_order: z.coerce.number().int().optional(),
});

export async function GET() {
  const admin = await requireAdmin();
  if ('error' in admin) return admin.error;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('stats')
      .select('*')
      .order('display_order', { ascending: true });
    if (error) throw error;
    return NextResponse.json({ stats: data });
  } catch (err) {
    console.error('Error fetching stats:', err);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  if ('error' in admin) return admin.error;

  try {
    const body = await request.json();
    const parsed = statSchema.parse(body);
    const supabase = await createClient();
    const { data, error } = await supabase.from('stats').insert([parsed]).select().single();
    if (error) throw error;
    return NextResponse.json({ stat: data });
  } catch (err) {
    if (err instanceof z.ZodError) {
      const issue = err.issues[0];
      const field = issue.path.join('.') || 'request';
      return NextResponse.json({ error: `${field}: ${issue.message}` }, { status: 400 });
    }
    console.error('Error creating stat:', err);
    return NextResponse.json({ error: 'Failed to create stat' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const admin = await requireAdmin();
  if ('error' in admin) return admin.error;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const body = await request.json();
    const parsed = statSchema.partial().parse(body);
    const supabase = await createClient();
    const { data, error } = await supabase.from('stats').update(parsed).eq('id', id).select().single();
    if (error) throw error;
    return NextResponse.json({ stat: data });
  } catch (err) {
    if (err instanceof z.ZodError) {
      const issue = err.issues[0];
      const field = issue.path.join('.') || 'request';
      return NextResponse.json({ error: `${field}: ${issue.message}` }, { status: 400 });
    }
    console.error('Error updating stat:', err);
    return NextResponse.json({ error: 'Failed to update stat' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const admin = await requireAdmin();
  if ('error' in admin) return admin.error;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const supabase = await createClient();
    const { error } = await supabase.from('stats').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error deleting stat:', err);
    return NextResponse.json({ error: 'Failed to delete stat' }, { status: 500 });
  }
}
