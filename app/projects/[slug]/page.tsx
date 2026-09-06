import type { Metadata } from 'next';
import ProjectDetailClient from './ProjectDetailClient';
import { siteUrl } from '@/lib/metadata';

type PageProps = { params: Promise<{ slug: string }> };

async function getProject(slug: string) {
  const res = await fetch(`/api/projects?slug=${encodeURIComponent(slug)}`, { next: { revalidate: 3600 } });
  if (!res.ok) return null;
  const data = await res.json();
  return data.project || null;
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
