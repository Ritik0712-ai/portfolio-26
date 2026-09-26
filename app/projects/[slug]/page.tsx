import type { Metadata } from 'next';
import ProjectDetailClient from './ProjectDetailClient';
import { siteUrl } from '@/lib/metadata';
import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import type { Project } from '@/types';

type PageProps = { params: Promise<{ slug: string }> };

// Runs on the server, where a relative fetch('/api/...') has no origin to
// resolve against and throws ERR_INVALID_URL. Querying Supabase directly is
// also one network hop instead of two.
// cache() dedupes the query between generateMetadata and the page render.
const getProject = cache(async (slug: string): Promise<Project | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle();

  if (error) {
    console.error('getProject failed for slug', slug, error);
    return null;
  }
  return data as Project | null;
});

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
    },
    twitter: { card: 'summary_large_image', title: project.title, description: project.short_description || undefined },
  };
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { slug } = await params;
  // Rendering with the project already loaded (no client fetch spinner) is
  // what lets the cover and title morph in with a view transition.
  const project = await getProject(slug);
  return <ProjectDetailClient slug={slug} initialProject={project} />;
}
