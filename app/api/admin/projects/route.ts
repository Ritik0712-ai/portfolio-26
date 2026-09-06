import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { z } from 'zod';

const projectSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  short_description: z.string().nullish(),
  description: z.string().nullish(),
  role: z.string().nullish(),
  problem: z.string().nullish(),
  approach: z.string().nullish(),
  technical_decisions: z.array(z.object({
    decision: z.string(),
    rationale: z.string(),
    trade_off: z.string(),
  })).nullish(),
  outcomes: z.array(z.object({
    outcome: z.string(),
    result: z.string(),
  })).nullish(),
  technologies: z.array(z.string()).nullish(),
  demo_url: z.string().url().nullish().or(z.literal('')),
  repo_url: z.string().url().nullish().or(z.literal('')),
  cover_image: z.string().url().nullish().or(z.literal('')),
  gallery: z.array(z.string()).nullish(),
  featured: z.boolean().optional(),
  published: z.boolean().optional(),
  display_order: z.coerce.number().int().nullish(),
});

export async function GET(request: NextRequest) {
  const admin = await requireAdmin();
  if ('error' in admin) return admin.error;

  try {
    const supabase = await createClient();
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ projects });
  } catch (err) {
    console.error('Error fetching projects:', err);
    return NextResponse.json({ error: 'Failed to read projects' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  if ('error' in admin) return admin.error;

  try {
    const body = await request.json();
    const parsed = projectSchema.parse(body);
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('projects')
      .insert([{
        ...parsed,
        technologies: parsed.technologies || [],
        gallery: parsed.gallery || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'A project with this slug already exists' }, { status: 409 });
      }
      throw error;
    }
    return NextResponse.json({ success: true, project: data });
  } catch (err) {
    if (err instanceof z.ZodError) {
      const issue = err.issues[0];
      const field = issue.path.join('.') || 'request';
      return NextResponse.json({ error: `${field}: ${issue.message}` }, { status: 400 });
    }
    console.error('Error creating project:', err);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const admin = await requireAdmin();
  if ('error' in admin) return admin.error;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Project ID required' }, { status: 400 });

    const body = await request.json();
    const parsed = projectSchema.partial().parse(body);
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('projects')
      .update({ ...parsed, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, project: data });
  } catch (err) {
    if (err instanceof z.ZodError) {
      const issue = err.issues[0];
      const field = issue.path.join('.') || 'request';
      return NextResponse.json({ error: `${field}: ${issue.message}` }, { status: 400 });
    }
    console.error('Error updating project:', err);
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const admin = await requireAdmin();
  if ('error' in admin) return admin.error;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Project ID required' }, { status: 400 });

    const supabase = await createClient();
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error deleting project:', err);
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}
