import { createClient } from '@supabase/supabase-js';
import type { BlogPost, Certification, Project, Testimonial } from '@/types';

// Server-side reads of published content for public pages. Uses a
// cookieless client so the pages stay statically cacheable (ISR) and the
// content is in the initial HTML — crawlers and link previews see it
// without running JavaScript. Every reader fails soft to an empty list.
function db() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false },
  });
}

async function read<T>(label: string, run: () => PromiseLike<{ data: T[] | null; error: unknown }>): Promise<T[]> {
  try {
    const { data, error } = await run();
    if (error) throw error;
    return data ?? [];
  } catch (err) {
    console.error(`Failed to read ${label}:`, err);
    return [];
  }
}

export interface TimelineEvent {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
}

export const getProjects = (featuredOnly = false) =>
  read<Project>('projects', () => {
    let q = db()
      .from('projects')
      .select('*')
      .eq('published', true)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });
    if (featuredOnly) q = q.eq('featured', true);
    return q;
  });

export const getTimeline = () =>
  read<TimelineEvent>('timeline', () => db().from('timeline_events').select('*').order('display_order', { ascending: true }));

export const getCertifications = () =>
  read<Certification>('certifications', () =>
    db().from('certifications').select('*').eq('published', true).order('display_order', { ascending: true }),
  );

export const getTestimonials = () =>
  read<Testimonial>('testimonials', () =>
    db().from('testimonials').select('*').eq('approved', true).order('display_order', { ascending: true }),
  );

export const getBlogs = (limit?: number) =>
  read<BlogPost>('blogs', () => {
    const q = db().from('blogs').select('*').eq('published', true).order('created_at', { ascending: false });
    return limit ? q.limit(limit) : q;
  });

async function readOne<T>(label: string, run: () => PromiseLike<{ data: T | null; error: unknown }>): Promise<T | null> {
  try {
    const { data, error } = await run();
    if (error) throw error;
    return data;
  } catch (err) {
    console.error(`Failed to read ${label}:`, err);
    return null;
  }
}

export const getProjectBySlug = (slug: string) =>
  readOne<Project>(`project ${slug}`, () => db().from('projects').select('*').eq('slug', slug).eq('published', true).maybeSingle());

export const getBlogBySlug = (slug: string) =>
  readOne<BlogPost>(`blog ${slug}`, () => db().from('blogs').select('*').eq('slug', slug).eq('published', true).maybeSingle());

export const getDsaProblems = () =>
  read<import('@/types').DsaProblem>('dsa', () =>
    db().from('dsa_problems').select('*').eq('published', true).order('solved_at', { ascending: false }).order('created_at', { ascending: false }),
  );

export const getDsaBySlug = (slug: string) =>
  readOne<import('@/types').DsaProblem>(`dsa ${slug}`, () =>
    db().from('dsa_problems').select('*').eq('slug', slug).eq('published', true).maybeSingle(),
  );
