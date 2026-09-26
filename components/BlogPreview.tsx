'use client';
import { T } from '@/lib/i18n';

import Link from 'next/link';
import { ArrowRight, Clock } from 'lucide-react';
import type { BlogPost } from '@/types';
import { formatReadingTime } from '@/lib/reading-time';

export default function BlogPreview({ posts }: { posts: BlogPost[] }) {

  if (posts.length === 0) return null;

  return (
    <section id="blog" className="py-20 bg-bg-secondary">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <p className="text-xs font-mono text-text-faint uppercase tracking-[0.3em] mb-2"><T en="Writing" hi="लेखन" /></p>
            <h2 className="text-3xl md:text-4xl font-display font-semibold text-text-primary"><T en="From the Blog" hi="ब्लॉग से" /></h2>
          </div>
          <Link href="/blog" className="hidden md:inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary font-body transition-colors">
            <T en="All posts" hi="सभी पोस्ट्स" /> <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {posts.map((post) => (
            <article key={post.id} className="reveal group bg-surface border border-border rounded-lg p-6 hover:border-rule transition-colors">
              <div className="mb-4">
                <span className="text-xs font-mono text-accent uppercase tracking-wider">{post.category}</span>
              </div>
              <h3 className="font-display font-semibold text-lg text-text-primary mb-2 group-hover:text-accent transition-colors">
                <Link href={`/blog/${post.slug}`}>{post.title}</Link>
              </h3>
              {post.excerpt && (
                <p className="text-sm text-text-muted font-body leading-relaxed mb-4 line-clamp-2">
                  {post.excerpt}
                </p>
              )}
              <div className="flex items-center justify-between">
                {post.reading_time && (
                  <span className="flex items-center gap-1 text-xs text-text-faint font-mono">
                    <Clock className="w-3 h-3" />
                    {formatReadingTime(post.reading_time)}
                  </span>
                )}
                <Link href={`/blog/${post.slug}`} className="ml-auto text-xs text-accent hover:text-accent-warm font-body transition-colors">
                  <T en="Read →" hi="पढ़ें →" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
