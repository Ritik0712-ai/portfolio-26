import { createClient } from '@/lib/supabase/server';
import { renderOg, OG_SIZE } from '@/lib/og';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const alt = 'Project case study — Ritik Agarwal';
export const revalidate = 3600;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from('projects')
    .select('title, short_description, technologies')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle();

  return renderOg({
    eyebrow: 'Case study',
    title: data?.title ?? 'Project',
    description: data?.short_description,
    tags: (data?.technologies ?? []).map((t: string) => t.replace(/\s+\d+(\.\d+)*$/, '')),
  });
}
