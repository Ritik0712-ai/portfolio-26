'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, Send, User, Mail, Loader2 } from 'lucide-react'

interface Comment {
  id: string
  name: string
  email?: string
  message: string
  slug: string
  createdAt: string
  approved: boolean
}

interface BlogCommentsProps {
  slug: string
}

export default function BlogComments({ slug }: BlogCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    fetchComments()
  }, [slug])

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/comments?slug=${slug}`)
      const data = await res.json()
      // Only show approved comments
      setComments((data.comments || []).filter((c: Comment) => c.approved))
    } catch (error) {
      console.error('Failed to fetch comments:', error)
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, slug }),
      })
      setSubmitted(true)
      setForm({ name: '', email: '', message: '' })
      setTimeout(() => setSubmitted(false), 5000)
    } catch (error) {
      alert('Failed to submit comment')
    }
    setSubmitting(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="mt-16 pt-8 border-t border-primary/10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <MessageCircle className="w-6 h-6 text-primary" />
          <h3 className="text-2xl font-bold text-text-primary">
            Comments ({comments.length})
          </h3>
        </div>

        {/* Comment Form */}
        <form onSubmit={handleSubmit} className="bg-card rounded-xl p-6 border border-primary/10 mb-8">
          <h4 className="text-lg font-semibold text-text-primary mb-4">Leave a comment</h4>
          
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-green-500/20 border border-green-500/20 rounded-lg text-green-400 text-center"
            >
              Thanks for your comment! It will appear after approval.
            </motion.div>
          ) : (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Your name"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-bg-primary border border-primary/20 rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
                <div>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="Your email (optional)"
                      className="w-full pl-10 pr-4 py-3 bg-bg-primary border border-primary/20 rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Your comment..."
                required
                rows={4}
                className="w-full px-4 py-3 bg-bg-primary border border-primary/20 rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary resize-none"
              />
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent rounded-lg font-semibold text-white hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Post Comment
                  </>
                )}
              </button>
            </div>
          )}
        </form>

        {/* Comments List */}
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-text-muted">
            No comments yet. Be the first to share your thoughts!
          </div>
        ) : (
          <div className="space-y-6">
            {comments.map((comment) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card/50 rounded-xl p-5 border border-primary/10"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold">
                    {comment.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h5 className="font-semibold text-text-primary">{comment.name}</h5>
                    <p className="text-xs text-text-muted">{formatDate(comment.createdAt)}</p>
                  </div>
                </div>
                <p className="text-text-muted ml-13">{comment.message}</p>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
