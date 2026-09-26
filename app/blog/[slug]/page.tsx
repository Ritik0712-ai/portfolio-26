import { Metadata } from 'next';
import BlogPostClient from './BlogPostClient';
import { siteUrl } from '@/lib/metadata';
import { cache } from 'react';
import { getBlogBySlug, getBlogs } from '@/lib/public-data';

type PageProps = { params: Promise<{ slug: string }> };

// The full post is fetched on the server so its text is in the initial HTML
// (search engines and link previews see it), and the page is cached,
// regenerated at most once a minute. cache() shares the query with metadata.
export const revalidate = 60;

const getBlogPost = cache(getBlogBySlug);

// Pre-render every published post; new slugs render on first visit.
export async function generateStaticParams() {
  return (await getBlogs()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) return { title: 'Post Not Found' };

  const canonical = `/blog/${post.slug}`;
  return {
    // absolute: the /blog layout sets a plain title, which stops the root
    // '%s | Ritik Agarwal' template from applying here.
    title: { absolute: `${post.title} | Ritik Agarwal` },
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
    },
    twitter: { card: 'summary_large_image', title: post.title, description: post.excerpt || undefined },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  return <BlogPostClient slug={slug} initialPost={await getBlogPost(slug)} />;
}
