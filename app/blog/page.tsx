'use client';

import { useState, useEffect } from 'react';
import { Clock, Calendar, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { pageMetadata } from '@/lib/metadata';

export const generateMetadata = () => pageMetadata({ title: 'Notes & Reflections', path: '/blog' });

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  cover_image: string | null;
  tags: string[];
  reading_time: string | null;
  category: string;
  created_at: string;
}

const categories = ['All', 'Tech', 'DSA', 'Life', 'Reflections'];

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const res = await fetch('/api/blogs');
      const data = await res.json();
      if (data.blogs) setPosts(data.blogs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = posts.filter((post) => {
    const matchesCategory = activeFilter === 'All' || post.category === activeFilter;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <p className="text-sm font-body text-text-muted uppercase tracking-widest mb-2">Writing</p>
          <h1 className="text-4xl md:text-5xl font-display font-semibold text-text-primary">
            Notes & Reflections
          </h1>
          <p className="text-text-secondary mt-3 max-w-xl">
            Thoughts on engineering, product thinking, and building things.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-3 py-1.5 text-sm font-body rounded transition-colors ${
                activeFilter === cat
                  ? 'bg-text-primary text-bg border border-text-primary'
                  : 'text-text-muted hover:text-text-primary border border-border hover:border-rule'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <input
          type="search"
          placeholder="Search posts…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2.5 font-body text-sm bg-surface border border-border rounded text-text-primary placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-accent mb-8"
        />

        {/* Posts */}
        {loading ? (
          <div className="space-y-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-surface border border-border rounded-lg p-6 animate-pulse">
                <div className="h-6 bg-bg-secondary rounded w-3/4 mb-3" />
                <div className="h-4 bg-bg-secondary rounded w-full mb-2" />
                <div className="h-4 bg-bg-secondary rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-text-muted">
            No posts found.
          </div>
        ) : (
          <div className="space-y-6">
            {filtered.map((post) => (
              <article key={post.id} className="bg-surface border border-border rounded-lg overflow-hidden hover:border-rule transition-colors">
                {post.cover_image && (
                  <div className="relative h-48 w-full">
                    <Image
                      src={post.cover_image}
                      alt={post.title}
                      fill
                      placeholder="blur"
                      blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 360'%3E%3Crect fill='%23EFEBE3' width='640' height='360'/%3E%3C/svg%3E"
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center gap-3 text-xs text-text-faint mb-3">
                    <span className="uppercase tracking-wider border border-border px-2 py-0.5 rounded-sm">{post.category}</span>
                    {post.reading_time && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.reading_time}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(post.created_at)}
                    </span>
                  </div>

                  <h2 className="text-xl font-display font-semibold text-text-primary mb-2">
                    <Link href={`/blog/${post.slug}`} className="hover:text-accent transition-colors">
                      {post.title}
                    </Link>
                  </h2>

                  {post.excerpt && (
                    <p className="text-text-secondary text-sm mb-4 line-clamp-2">{post.excerpt}</p>
                  )}

                  {post.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.slice(0, 4).map((tag) => (
                        <span key={tag} className="text-xs px-2 py-0.5 bg-bg-secondary text-text-muted rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-1.5 text-sm text-accent hover:text-accent-warm transition-colors"
                  >
                    Read more <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
