'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Clock, Calendar } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'

interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  date: string
  reading_time: string
  tags: string[]
}

export default function BlogPreview() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBlogs()
  }, [])

  const fetchBlogs = async () => {
    try {
      const res = await fetch('/api/admin/blogs')
      const data = await res.json()
      if (data.blogs) {
        // Get only published blogs, take first 2
        const published = data.blogs.filter((b: any) => b.published).slice(0, 2)
        setPosts(published)
      }
    } catch (error) {
      console.error('Failed to fetch blogs:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="py-24 px-4 bg-card/30">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 flex items-end justify-between"
        >
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text">Latest from the Blog</span>
            </h2>
            <p className="text-text-muted max-w-2xl">
              Thoughts on building, learning, and everything in between.
            </p>
          </div>
          <Link
            href="/blog"
            className="hidden md:flex items-center gap-2 text-primary hover:text-accent transition-colors"
          >
            View All Posts
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* Blog Posts Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="bg-card rounded-xl p-6 border border-primary/10 animate-pulse">
                <div className="h-6 bg-gray-700 rounded w-1/4 mb-4"></div>
                <div className="h-8 bg-gray-700 rounded w-3/4 mb-3"></div>
                <div className="h-16 bg-gray-700 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : posts.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {posts.map((post, index) => (
              <motion.article
                key={post.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="group bg-card rounded-xl p-6 border border-primary/10 hover:border-primary/30 transition-all hover:shadow-xl hover:shadow-primary/5"
              >
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags?.map((tag: string) => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-xs bg-primary/10 text-primary rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Title */}
                <Link href={`/blog/${post.slug}`}>
                  <h3 className="text-xl font-bold text-text-primary mb-3 group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                </Link>

                {/* Excerpt */}
                <p className="text-text-muted text-sm mb-4 line-clamp-3">
                  {post.excerpt}
                </p>

                {/* Meta */}
                <div className="flex items-center gap-4 text-xs text-text-muted">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(post.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {post.reading_time || '5 min read'}
                  </span>
                </div>

                {/* Read More */}
                <Link
                  href={`/blog/${post.slug}`}
                  className="mt-4 flex items-center gap-2 text-primary hover:text-accent transition-colors text-sm font-medium"
                >
                  Read More
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.article>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-text-muted">
            <p>No blog posts yet. Check back soon!</p>
            <Link href="/admin" className="text-primary hover:underline mt-2 inline-block">
              Create your first post →
            </Link>
          </div>
        )}

        {/* Mobile View All Link */}
        <div className="md:hidden text-center mt-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 bg-card rounded-full text-text-muted hover:text-primary transition-all"
          >
            View All Posts
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
