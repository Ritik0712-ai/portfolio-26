import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { z } from 'zod';

export async function GET() {
  const admin = await requireAdmin();
  if ('error' in admin) return admin.error;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json({ feedback: data });
  } catch (err) {
    console.error('Error fetching feedback:', err);
    return NextResponse.json({ error: 'Failed to fetch feedback' }, { status: 500 });
  }
}

const testimonialSchema = z.object({
  name: z.string().min(1),
  role: z.string().optional(),
  company: z.string().optional(),
  avatar: z.string().optional(),
  content: z.string().min(1),
  rating: z.number().optional(),
});

export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  if ('error' in admin) return admin.error;

  try {
    const body = await request.json();
    const parsed = testimonialSchema.parse(body);
    const supabase = await createClient();

    // Mark feedback as reviewed if provided
    if (body.feedbackId) {
      await supabase.from('feedback').update({ reviewed: true }).eq('id', body.feedbackId);
    }

    const { data, error } = await supabase.from('testimonials').insert([parsed]).select().single();
    if (error) throw error;
    return NextResponse.json({ testimonial: data });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues[0].message }, { status: 400 });
    console.error('Error creating testimonial from feedback:', err);
    return NextResponse.json({ error: 'Failed to create testimonial' }, { status: 500 });
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
    const supabase = await createClient();
    const { data, error } = await supabase.from('feedback').update(body).eq('id', id).select().single();
    if (error) throw error;
    return NextResponse.json({ feedback: data });
  } catch (err) {
    console.error('Error updating feedback:', err);
    return NextResponse.json({ error: 'Failed to update feedback' }, { status: 500 });
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
    const { error } = await supabase.from('feedback').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error deleting feedback:', err);
    return NextResponse.json({ error: 'Failed to delete feedback' }, { status: 500 });
  }
}
