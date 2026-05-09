'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, Clock, Calendar, Share2, Twitter, Linkedin } from 'lucide-react'
import BlogComments from '@/components/BlogComments'
import Link from 'next/link'
import { notFound } from 'next/navigation'

const blogPostsData: Record<string, {
  title: string
  excerpt: string
  content: string
  date: string
  readingTime: string
  tags: string[]
}> = {
  'how-i-built-mindspace': {
    title: 'How I Built MindSpace — And What Nearly Broke Me',
    excerpt: 'Building a mental health app taught me that technology alone isn\'t enough. Here\'s the story of MindSpace, the challenges I faced, and the lessons I learned about engineering empathy into products.',
    date: '2024-01-15',
    readingTime: '8 min read',
    tags: ['Build Log', 'AI', 'Product'],
    content: `
## The Beginning

It started with a simple observation: my friends were struggling. Exams, career pressure, family expectations — the usual Indian college life. But when they tried to seek help, they hit a wall. Therapy was expensive. Psychiatrists had month-long waitlists. And god forbid anyone found out.

So I thought, "I'm a developer, I can build something."

## The Problem

Mental health support in India is broken:
- Therapy costs ₹1,500-3,000 per session
- Mental health professionals don't exist in tier-2/3 cities
- Stigma stops people from even asking for help
- "Log kya kahenge?" culture runs deep

I wanted to build something that addressed these barriers. Something affordable, accessible, and — most importantly — safe.

## The Build

MindSpace became a React Native app with three core features:

1. **Anonymous peer support groups** — moderated chat rooms where people could talk without revealing their identity
2. **AI-powered journaling** — using GPT-4 to provide empathetic responses and mental health check-ins
3. **Crisis detection** — using Google's Perspective API to detect harmful content and alert moderators

The tech stack:
- React Native + Expo for mobile
- Node.js + Express for backend
- PostgreSQL + Redis for data
- Socket.io for real-time chat
- OpenAI GPT-4 for AI features

## What Nearly Broke Me

The hardest part wasn't the code. It was the responsibility.

When someone opens up about suicidal thoughts, what do you say? How do you build AI that doesn't accidentally trigger someone? How do you handle content moderation without invading privacy?

I spent weeks researching crisis intervention. I talked to actual therapists. I read countless stories of people who had been hurt by well-meaning but poorly designed mental health apps.

**The lesson:** Technology alone isn't enough. Empathy has to be engineered into every decision, from UI copy to crisis detection logic.

## What I Learned

1. **Building for vulnerable users requires extra care** — every edge case must be considered
2. **AI can help, but it can't replace human judgment** — especially in mental health
3. **Privacy isn't a feature, it's a foundation** — if users don't feel safe, they won't use the app
4. **The hardest bugs aren't in the code** — they're in understanding the human needs

## The Result

MindSpace launched with 500 beta users in the first week. The feedback was overwhelming — people felt heard, people felt safe. That was worth every sleepless night.

The app is still in development, iterating based on user feedback. Because that's what products do — they evolve.

---

*If you're struggling with mental health, reach out to a professional. This blog post is about building technology, not providing medical advice.*
`,
  },
  'dsa-grind-first-month': {
    title: 'My First Month Grinding DSA: What Nobody Tells You',
    excerpt: 'Everyone says "just grind LeetCode" but nobody talks about the mental toll. Here\'s my honest account of the first month of DSA preparation — the frustration, breakthroughs, and everything in between.',
    date: '2024-02-01',
    readingTime: '6 min read',
    tags: ['DSA', 'Reflections', 'Life'],
    content: `
## The Starting Point

I'm a first-year CS student at VIT Bhopal. My coding skills were decent — I could build full-stack apps, work with databases, deploy to production. But DSA? That was my weakness.

So in January, I decided to fix that. I created a LeetCode account, opened a Python IDE, and told myself: "One month of grind. Let's do this."

## Week 1: False Confidence

The first week felt good. Easy problems. Two-sum, valid parentheses, basic array manipulation. I was crushing it! Maybe DSA wasn't so hard after all.

Then I hit arrays.

Not "easy" arrays — the "here's a rotated sorted array, find the minimum in O(log n)" arrays. The "find the subarray with largest sum, but now with modulo" arrays.

**Reality check:** I didn't know what I didn't know.

## Week 2: The Wall

This is where most people quit.

I spent 3 hours on a single "Medium" problem. Drew diagrams. Watched YouTube solutions. Read editorial explanations. And when I finally understood it, I closed my laptop and stared at the ceiling.

Was I smart enough for this?

The self-doubt crept in. Every failed attempt felt like proof that I wasn't cut out for tech interviews. That all the projects I'd built were just "copy-paste tutorials" and I had no real skills.

**But here's what nobody tells you:** That feeling is normal. It means you're learning.

## Week 3: The Pattern

Something clicked in week three.

I stopped seeing problems as individual challenges and started seeing patterns:
- "Oh, this is just a sliding window problem"
- "This is like the two-pointer technique"
- "Graph traversal — BFS or DFS depending on the use case"

It wasn't about memorizing solutions. It was about recognizing structures.

**The breakthrough:** DSA isn't about being smart. It's about seeing the patterns.

## Week 4: Consistency

The final week wasn't about getting smarter. It was about showing up.

Every day, I did at least one problem. Some days it was 20 minutes. Some days it was 2 hours. But I showed up.

I kept a streak. I celebrated small wins. I learned to appreciate the process, not just the destination.

## What I Learned

1. **DSA is a skill, not a talent** — anyone can learn it with enough practice
2. **The struggle is part of the process** — if it's easy, you're not learning
3. **Consistency beats intensity** — one hour every day beats 10 hours on Sunday
4. **It's okay to look at solutions** — understanding comes first, memorization later
5. **The mental game is as important as the technical game** — imposter syndrome is real

## Where I Am Now

After a month:
- Solved 85 problems (45 Easy, 35 Medium, 5 Hard)
- Can identify most patterns on sight
- Still struggle with Hard problems (and that's okay)
- More confident in technical interviews
- Actually enjoying the problem-solving

## For Anyone Starting

It's going to be hard. You're going to feel stupid. You're going to want to quit.

But keep going. The wall you're hitting? It's not the end. It's the middle.

Every developer who's ever passed a coding interview felt exactly what you're feeling right now.

Keep grinding. 💪

---

*This is my experience. Your journey might be different. Find what works for you.*
`,
  },
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const { slug } = params
  const post = blogPostsData[slug]

  if (!post) {
    notFound()
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
            {post.tags.map((tag) => (
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
              {post.readingTime}
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
