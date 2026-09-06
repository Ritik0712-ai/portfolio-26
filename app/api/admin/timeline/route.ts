import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { z } from 'zod';

const timelineSchema = z.object({
  title: z.string().min(1),
  description: z.string().nullish(),
  event_date: z.string().min(1),
  display_order: z.coerce.number().int().nullish(),
});

export async function GET() {
  const admin = await requireAdmin();
  if ('error' in admin) return admin.error;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('timeline_events')
      .select('*')
      .order('display_order', { ascending: true });
    if (error) throw error;
    return NextResponse.json({ events: data });
  } catch (err) {
    console.error('Error fetching timeline:', err);
    return NextResponse.json({ error: 'Failed to fetch timeline' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  if ('error' in admin) return admin.error;

  try {
    const body = await request.json();
    const parsed = timelineSchema.parse(body);
    const supabase = await createClient();
    const { data, error } = await supabase.from('timeline_events').insert([parsed]).select().single();
    if (error) throw error;
    return NextResponse.json({ event: data });
  } catch (err) {
    if (err instanceof z.ZodError) {
      const issue = err.issues[0];
      const field = issue.path.join('.') || 'request';
      return NextResponse.json({ error: `${field}: ${issue.message}` }, { status: 400 });
    }
    console.error('Error creating timeline event:', err);
    return NextResponse.json({ error: 'Failed to create timeline event' }, { status: 500 });
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
    const parsed = timelineSchema.partial().parse(body);
    const supabase = await createClient();
    const { data, error } = await supabase.from('timeline_events').update(parsed).eq('id', id).select().single();
    if (error) throw error;
    return NextResponse.json({ event: data });
  } catch (err) {
    if (err instanceof z.ZodError) {
      const issue = err.issues[0];
      const field = issue.path.join('.') || 'request';
      return NextResponse.json({ error: `${field}: ${issue.message}` }, { status: 400 });
    }
    console.error('Error updating timeline event:', err);
    return NextResponse.json({ error: 'Failed to update timeline event' }, { status: 500 });
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
    const { error } = await supabase.from('timeline_events').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error deleting timeline event:', err);
    return NextResponse.json({ error: 'Failed to delete timeline event' }, { status: 500 });
  }
}
