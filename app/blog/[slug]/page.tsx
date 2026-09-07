import { Metadata } from 'next';
import BlogPostClient from './BlogPostClient';
import { siteUrl } from '@/lib/metadata';
import { createClient } from '@/lib/supabase/server';

type PageProps = { params: Promise<{ slug: string }> };

// Same fix as the project detail page: a relative fetch has no origin to
// resolve against on the server and throws ERR_INVALID_URL. Query Supabase
// directly instead of the app calling its own API over the network.
async function getBlogPost(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('blogs')
    .select('slug, title, excerpt, cover_image, created_at, updated_at, tags')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle();

  if (error) {
    console.error('getBlogPost failed for slug', slug, error);
    return null;
  }
  return data;
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
