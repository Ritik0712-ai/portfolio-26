'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Clock, Calendar, Share2, Twitter, Linkedin, Loader2 } from 'lucide-react'
import BlogComments from '@/components/BlogComments'
import Link from 'next/link'
import { useParams } from 'next/navigation'

interface BlogPost {
  slug: string
  title: string
  excerpt: string
  content: string
  date: string
  reading_time: string
  tags: string[]
}

export default function BlogPostPage() {
  const params = useParams()
  const slug = params.slug as string
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetchBlogPost()
  }, [slug])

  const fetchBlogPost = async () => {
    try {
      const res = await fetch(`/api/admin/blogs?slug=${slug}`)
      const data = await res.json()
      if (data.blog) {
        setPost(data.blog)
      } else {
        setError(true)
      }
    } catch (error) {
      console.error('Failed to fetch blog:', error)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Blog post not found</h1>
          <Link href="/blog" className="text-primary hover:underline">
            Back to Blog
          </Link>
        </div>
      </div>
    )
  }

  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(shareUrl)}`
  const linkedInShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <article className="max-w-3xl mx-auto">
        {/* Back Button */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-text-muted hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Blog
        </Link>

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags && post.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 text-sm bg-primary/10 text-primary rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            {post.title}
          </h1>

          {/* Meta */}
          <div className="flex items-center gap-6 text-text-muted mb-6">
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {new Date(post.date).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {post.reading_time || '5 min read'}
            </span>
          </div>

          {/* Share */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-text-muted">Share:</span>
            <a
              href={twitterShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-card hover:bg-primary/10 text-text-muted hover:text-primary transition-colors"
              aria-label="Share on Twitter"
            >
              <Twitter className="w-4 h-4" />
            </a>
            <a
              href={linkedInShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-card hover:bg-primary/10 text-text-muted hover:text-primary transition-colors"
              aria-label="Share on LinkedIn"
            >
              <Linkedin className="w-4 h-4" />
            </a>
          </div>
        </motion.header>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="prose prose-invert prose-lg max-w-none"
        >
          <div className="text-text-primary leading-relaxed space-y-6">
            {post.content.split('\n').map((paragraph, index) => {
              if (paragraph.startsWith('## ')) {
                return (
                  <h2 key={index} className="text-2xl font-bold mt-10 mb-4 gradient-text">
                    {paragraph.replace('## ', '')}
                  </h2>
                )
              }
              if (paragraph.startsWith('### ')) {
                return (
                  <h3 key={index} className="text-xl font-semibold mt-8 mb-3 text-text-primary">
                    {paragraph.replace('### ', '')}
                  </h3>
                )
              }
              if (paragraph.startsWith('1. ') || paragraph.startsWith('2. ') || paragraph.startsWith('3. ') || paragraph.startsWith('4. ') || paragraph.startsWith('5. ')) {
                return (
                  <p key={index} className="pl-6 border-l-2 border-primary/30 text-text-muted">
                    {paragraph}
                  </p>
                )
              }
              if (paragraph.startsWith('- ')) {
                return (
                  <p key={index} className="pl-6 text-text-muted">
                    • {paragraph.replace('- ', '')}
                  </p>
                )
              }
              if (paragraph.trim() === '---') {
                return <hr key={index} className="border-primary/20 my-8" />
              }
              if (paragraph.trim() === '') {
                return <div key={index} className="h-4" />
              }
              if (paragraph.startsWith('*') && paragraph.endsWith('*')) {
                return (
                  <p key={index} className="text-accent italic">
                    {paragraph.replace(/\*/g, '')}
                  </p>
                )
              }
              return (
                <p key={index} className="text-text-muted">
                  {paragraph}
                </p>
              )
            })}
          </div>
        </motion.div>

        {/* Navigation */}
        <div className="mt-16 pt-8 border-t border-primary/10">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-primary hover:text-accent transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>
        </div>

        {/* Comments Section */}
        <BlogComments slug={slug} />
      </article>
    </div>
  )
}
