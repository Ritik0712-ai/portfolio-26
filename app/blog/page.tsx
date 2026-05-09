'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, Calendar, ArrowRight, Search } from 'lucide-react'
import Link from 'next/link'

const blogPosts = [
  {
    slug: 'how-i-built-mindspace',
    title: 'How I Built MindSpace — And What Nearly Broke Me',
    excerpt: 'Building a mental health app taught me that technology alone isn\'t enough. Here\'s the story of MindSpace, the challenges I faced, and the lessons I learned about engineering empathy into products.',
    date: '2024-01-15',
    readingTime: '8 min read',
    tags: ['Build Log', 'AI', 'Product'],
    category: 'Tech',
  },
  {
    slug: 'dsa-grind-first-month',
    title: 'My First Month Grinding DSA: What Nobody Tells You',
    excerpt: 'Everyone says "just grind LeetCode" but nobody talks about the mental toll. Here\'s my honest account of the first month of DSA preparation — the frustration, breakthroughs, and everything in between.',
    date: '2024-02-01',
    readingTime: '6 min read',
    tags: ['DSA', 'Reflections', 'Life'],
    category: 'DSA',
  },
]

const categories = ['All', 'Tech', 'DSA', 'Life', 'Reflections']

export default function BlogPage() {
  const [activeFilter, setActiveFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredPosts = blogPosts.filter((post) => {
    const matchesCategory = activeFilter === 'All' || post.category === activeFilter
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">Blog</span>
          </h1>
          <p className="text-text-muted max-w-2xl">
            Thoughts on building, learning, and everything in between. Weekly deep dives and quick bites.
          </p>
        </motion.div>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-card border border-primary/20 rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveFilter(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeFilter === category
                    ? 'bg-primary text-white'
                    : 'bg-card text-text-muted hover:text-primary hover:bg-primary/10'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Posts Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {filteredPosts.map((post, index) => (
            <motion.article
              key={post.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
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
                <h2 className="text-xl font-bold text-text-primary mb-3 group-hover:text-primary transition-colors">
                  {post.title}
                </h2>
              </Link>

              {/* Excerpt */}
              <p className="text-text-muted text-sm mb-4 line-clamp-3">
                {post.excerpt}
              </p>

              {/* Meta */}
              <div className="flex items-center gap-4 text-xs text-text-muted mb-4">
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
                className="inline-flex items-center gap-2 text-primary hover:text-accent transition-colors text-sm font-medium"
              >
                Read More
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.article>
          ))}
        </div>

        {/* Empty State */}
        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-text-muted">No posts found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  )
}
