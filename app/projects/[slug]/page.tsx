import type { Metadata } from 'next';
import ProjectDetailClient from './ProjectDetailClient';
import { siteUrl } from '@/lib/metadata';
import { cache } from 'react';
import { getProjectBySlug, getProjects } from '@/lib/public-data';

type PageProps = { params: Promise<{ slug: string }> };

// Rendered on the server with a cookieless client, so the page is cached
// (regenerated at most once a minute) instead of rebuilt on every visit.
// cache() dedupes the query between generateMetadata and the page render.
export const revalidate = 60;

const getProject = cache(getProjectBySlug);

// Pre-render every published project; new slugs render on first visit.
export async function generateStaticParams() {
  return (await getProjects()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return { title: 'Project Not Found' };

  const canonical = `/projects/${project.slug}`;
  return {
    // absolute: the /projects layout sets a plain title, which stops the root
    // '%s | Ritik Agarwal' template from applying here.
    title: { absolute: `${project.title} — Case Study | Ritik Agarwal` },
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
