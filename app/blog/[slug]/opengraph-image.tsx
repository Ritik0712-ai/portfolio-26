import { createClient } from '@/lib/supabase/server';
import { renderOg, OG_SIZE } from '@/lib/og';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const alt = 'Blog post — Ritik Agarwal';
export const revalidate = 3600;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from('blogs')
    .select('title, excerpt, category')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle();

  return renderOg({
    eyebrow: data?.category ? `Blog · ${data.category}` : 'Blog',
    title: data?.title ?? 'Blog post',
    description: data?.excerpt,
  });
}
