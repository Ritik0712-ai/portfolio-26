'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Clock, Calendar } from 'lucide-react'
import Link from 'next/link'

const blogPosts = [
  {
    slug: 'how-i-built-mindspace',
    title: 'How I Built MindSpace — And What Nearly Broke Me',
    excerpt: 'Building a mental health app taught me that technology alone isn\'t enough. Here\'s the story of MindSpace, the challenges I faced, and the lessons I learned about engineering empathy into products.',
    date: '2024-01-15',
    readingTime: '8 min read',
    tags: ['Build Log', 'AI', 'Product'],
  },
  {
    slug: 'dsa-grind-first-month',
    title: 'My First Month Grinding DSA: What Nobody Tells You',
    excerpt: 'Everyone says "just grind LeetCode" but nobody talks about the mental toll. Here\'s my honest account of the first month of DSA preparation — the frustration, breakthroughs, and everything in between.',
    date: '2024-02-01',
    readingTime: '6 min read',
    tags: ['DSA', 'Reflections', 'Life'],
  },
]

export default function BlogPreview() {
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
        <div className="grid md:grid-cols-2 gap-6">
          {blogPosts.map((post, index) => (
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
                {post.tags.map((tag) => (
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
                  {post.readingTime}
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
