'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Calendar, Share2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import BlogComments from '@/components/BlogComments';
import Link from 'next/link';
import Image from 'next/image';
import type { Components } from 'react-markdown';
import TableOfContents from '@/components/TableOfContents';
import SocialShare from '@/components/SocialShare';
import StructuredData from '@/components/StructuredData';

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover_image: string | null;
  date: string;
  reading_time: string;
  tags: string[];
  category: string;
  created_at: string;
}

export default function BlogPostClient({ slug }: { slug: string }) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchBlogPost();
  }, [slug]);

  const fetchBlogPost = async () => {
    try {
      const res = await fetch(`/api/blogs?slug=${encodeURIComponent(slug)}`);
      const data = await res.json();
      if (data.blog) {
        setPost(data.blog);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-border border-t-text-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center px-4">
        <h1 className="text-4xl font-display font-semibold text-text-primary mb-4">Post Not Found</h1>
        <Link href="/blog" className="text-text-muted hover:text-text-primary transition-colors">
          ← Back to Blog
        </Link>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
      });
    } catch { return dateStr; }
  };

  const blogPostUrl = `https://ritik.dev/blog/${post.slug}`;

  const markdownComponents: Components = {
    h1: ({ children }) => <h1 className="font-display text-3xl font-semibold text-text-primary mt-10 mb-4">{children}</h1>,
    h2: ({ children }) => {
      const text = typeof children === 'string'
        ? children
        : typeof children === 'number'
          ? String(children)
          : '';
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim();
      return <h2 id={id} className="font-display text-2xl font-semibold text-text-primary mt-8 mb-3">{children}</h2>;
    },
    h3: ({ children }) => {
      const text = typeof children === 'string'
        ? children
        : typeof children === 'number'
          ? String(children)
          : '';
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim();
      return <h3 id={id} className="font-display text-xl font-semibold text-text-primary mt-6 mb-2">{children}</h3>;
    },
    p: ({ children }) => <p className="text-text-secondary leading-relaxed mb-4">{children}</p>,
    a: ({ href, children }) => (
      <a href={href} className="text-accent-warm hover:underline" target={href?.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">
        {children}
      </a>
    ),
    ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-1 text-text-secondary">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-1 text-text-secondary">{children}</ol>,
    li: ({ children }) => <li className="leading-relaxed">{children}</li>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-accent-warm pl-4 my-4 italic text-text-muted">{children}</blockquote>
    ),
    code: ({ className, children, ...props }) => {
      const isInline = !className;
      if (isInline) {
        return <code className="font-mono text-sm bg-bg-secondary px-1.5 py-0.5 rounded text-accent-warm" {...props}>{children}</code>;
      }
      return (
        <pre className="bg-bg-secondary border border-border rounded p-4 overflow-x-auto my-4">
          <code className="font-mono text-sm text-text-primary">{children}</code>
        </pre>
      );
    },
    img: ({ src, alt }) => src ? (
      <span className="block my-6">
        <Image src={src} alt={alt || ''} width={800} height={450} className="rounded-lg w-full object-cover" />
        {alt && <p className="text-xs text-text-faint mt-2 text-center">{alt}</p>}
      </span>
    ) : null,
    table: ({ children }) => (
      <div className="overflow-x-auto my-4">
        <table className="w-full border-collapse text-sm text-text-secondary">{children}</table>
      </div>
    ),
    th: ({ children }) => <th className="border border-border px-3 py-2 text-left bg-bg-secondary font-medium text-text-primary">{children}</th>,
    td: ({ children }) => <td className="border border-border px-3 py-2">{children}</td>,
    hr: () => <hr className="border-border my-8" />,
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto flex gap-8">
        {/* Main Content */}
        <article className="flex-1 max-w-prose mx-auto lg:mx-0">
          {/* Back link */}
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to Blog
          </Link>

          {/* Cover Image */}
          {post.cover_image && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-8 -mx-4 md:mx-0"
            >
              <Image
                src={post.cover_image}
                alt={post.title}
                width={800}
                height={450}
                placeholder="blur"
                blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 450'%3E%3Crect fill='%23EFEBE3' width='800' height='450'/%3E%3C/svg%3E"
                className="rounded-lg w-full object-cover"
              />
            </motion.div>
          )}

          {/* Header */}
          <motion.header initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            {/* Category */}
            <span className="text-xs font-body font-medium uppercase tracking-widest text-accent-warm">
              {post.category}
            </span>

            {/* Title */}
            <h1 className="font-display text-4xl md:text-5xl font-semibold text-text-primary mt-2 mb-4 leading-tight">
              {post.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-text-muted mb-6">
              {post.created_at && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {formatDate(post.created_at)}
                </span>
              )}
              {post.reading_time && (
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {post.reading_time}
                </span>
              )}
              <SocialShare title={post.title} url={`/blog/${post.slug}`} />
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {post.tags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 bg-bg-secondary border border-border rounded text-xs text-text-muted">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Rule */}
            <div className="border-t border-border mb-8" />
          </motion.header>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="prose-editorial"
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
              {post.content}
            </ReactMarkdown>
          </motion.div>

          {/* Footer rule */}
          <div className="border-t border-border mt-12 mb-8" />

          {/* Structured Data */}
          <StructuredData
            type="blog"
            data={{
              title: post.title,
              excerpt: post.excerpt,
              date: post.created_at,
              author: 'Ritik Agarwal',
              url: blogPostUrl,
              cover_image: post.cover_image || undefined,
            }}
          />

          {/* Comments */}
          <BlogComments blogSlug={slug} />
        </article>

        {/* Sidebar: Table of Contents */}
        <TableOfContents content={post.content} />
      </div>
    </div>
  );
}
