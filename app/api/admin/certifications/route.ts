import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { logActivity } from '@/lib/activity-log';
import { z } from 'zod';

const certificationSchema = z.object({
  title: z.string().min(1),
  issuer: z.string().min(1),
  issue_date: z.string().nullish().or(z.literal('')),
  expiry_date: z.string().nullish().or(z.literal('')),
  credential_url: z.string().url().nullish().or(z.literal('')),
  image_url: z.string().url().nullish().or(z.literal('')),
  published: z.boolean().optional(),
  display_order: z.coerce.number().int().nullish(),
});

export async function GET() {
  const admin = await requireAdmin();
  if ('error' in admin) return admin.error;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('certifications')
      .select('*')
      .order('display_order', { ascending: true });
    if (error) throw error;
    return NextResponse.json({ certifications: data });
  } catch (err) {
    console.error('Error fetching certifications:', err);
    return NextResponse.json({ error: 'Failed to fetch certifications' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  if ('error' in admin) return admin.error;

  try {
    const body = await request.json();
    const parsed = certificationSchema.parse(body);
    const supabase = await createClient();
    const { data, error } = await supabase.from('certifications').insert([parsed]).select().single();
    if (error) throw error;
    await logActivity(supabase, {
      userId: admin.user.id, action: 'create', resourceType: 'certification', resourceId: data?.id ?? null,
    });
    return NextResponse.json({ certification: data });
  } catch (err) {
    if (err instanceof z.ZodError) {
      const issue = err.issues[0];
      const field = issue.path.join('.') || 'request';
      return NextResponse.json({ error: `${field}: ${issue.message}` }, { status: 400 });
    }
    console.error('Error creating certification:', err);
    return NextResponse.json({ error: 'Failed to create certification' }, { status: 500 });
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
    const parsed = certificationSchema.partial().parse(body);
    const supabase = await createClient();
    const { data, error } = await supabase.from('certifications').update(parsed).eq('id', id).select().single();
    if (error) throw error;
    await logActivity(supabase, {
      userId: admin.user.id, action: 'update', resourceType: 'certification', resourceId: data?.id ?? null,
    });
    return NextResponse.json({ certification: data });
  } catch (err) {
    if (err instanceof z.ZodError) {
      const issue = err.issues[0];
      const field = issue.path.join('.') || 'request';
      return NextResponse.json({ error: `${field}: ${issue.message}` }, { status: 400 });
    }
    console.error('Error updating certification:', err);
    return NextResponse.json({ error: 'Failed to update certification' }, { status: 500 });
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
    const { error } = await supabase.from('certifications').delete().eq('id', id);
    if (error) throw error;
    await logActivity(supabase, {
      userId: admin.user.id, action: 'delete', resourceType: 'certification', resourceId: id,
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error deleting certification:', err);
    return NextResponse.json({ error: 'Failed to delete certification' }, { status: 500 });
  }
}
