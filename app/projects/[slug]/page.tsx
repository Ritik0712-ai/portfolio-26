import type { Metadata } from 'next';
import ProjectDetailClient from './ProjectDetailClient';
import { siteUrl } from '@/lib/metadata';
import { createClient } from '@/lib/supabase/server';

type PageProps = { params: Promise<{ slug: string }> };

// Runs on the server, where a relative fetch('/api/...') has no origin to
// resolve against and throws ERR_INVALID_URL. Querying Supabase directly is
// also one network hop instead of two.
async function getProject(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('projects')
    .select('slug, title, short_description, cover_image')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle();

  if (error) {
    console.error('getProject failed for slug', slug, error);
    return null;
  }
  return data;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return { title: 'Project Not Found' };

  const canonical = `/projects/${project.slug}`;
  return {
    title: project.title,
    description: project.short_description || undefined,
    alternates: { canonical },
    openGraph: {
      title: project.title,
      description: project.short_description || undefined,
      url: `${siteUrl}${canonical}`,
      siteName: 'Ritik Agarwal Portfolio',
      locale: 'en_US',
      type: 'website',
      images: project.cover_image ? [{ url: project.cover_image, width: 1200, height: 630, alt: project.title }] : undefined,
    },
    twitter: { card: 'summary_large_image', title: project.title, description: project.short_description || undefined, images: project.cover_image ? [project.cover_image] : undefined },
  };
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { slug } = await params;
  return <ProjectDetailClient slug={slug} />;
}
