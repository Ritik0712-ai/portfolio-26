import { Metadata } from 'next';
import BlogPostClient from './BlogPostClient';
import { siteUrl } from '@/lib/metadata';

type PageProps = { params: Promise<{ slug: string }> };

async function getBlogPost(slug: string) {
  const res = await fetch(`/api/blogs?slug=${encodeURIComponent(slug)}`, { next: { revalidate: 3600 } });
  if (!res.ok) return null;
  const data = await res.json();
  return data.blog || null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) return { title: 'Post Not Found' };

  const canonical = `/blog/${post.slug}`;
  return {
    title: post.title,
    description: post.excerpt || undefined,
    alternates: { canonical },
    openGraph: {
      title: post.title,
      description: post.excerpt || undefined,
      url: `${siteUrl}${canonical}`,
      siteName: 'Ritik Agarwal Portfolio',
      locale: 'en_US',
      type: 'article',
      publishedTime: post.created_at,
      images: post.cover_image ? [{ url: post.cover_image, width: 1200, height: 630, alt: post.title }] : undefined,
    },
    twitter: { card: 'summary_large_image', title: post.title, description: post.excerpt || undefined, images: post.cover_image ? [post.cover_image] : undefined },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  return <BlogPostClient slug={slug} />;
}
