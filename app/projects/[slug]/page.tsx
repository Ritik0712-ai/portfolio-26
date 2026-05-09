'use client'

import { motion } from 'framer-motion'
import { ExternalLink, Github, ArrowLeft, Lightbulb, AlertCircle, Wrench } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

const projectsData: Record<string, {
  name: string
  tagline: string
  description: string
  problem: string
  tech: string[]
  category: string
  demo: string
  github: string
  learning: string
}> = {
  'mindspace': {
    name: 'MindSpace',
    tagline: 'Anonymous peer support + AI journaling for mental wellness',
    description: 'Mental health support platform built for the Indian context — addressing therapy costs, accessibility, and stigma with ₹99/month pricing and AI-powered empathetic journaling.',
    problem: 'Mental health support in India is broken — therapy costs ₹1,500–3,000/session, therapists don\'t exist in tier-2/3 cities, and stigma stops people from seeking help.',
    tech: ['React Native', 'Node.js', 'PostgreSQL', 'Redis', 'OpenAI GPT-4', 'Socket.io', 'Perspective API'],
    category: 'AI',
    demo: '#',
    github: '#',
    learning: 'Technology alone isn\'t enough — empathy has to be engineered into every decision, from UI copy to crisis detection logic. The hardest part wasn\'t the code; it was making sure the AI never made a vulnerable person feel worse.',
  },
  'stockschool': {
    name: 'StockSchool',
    tagline: 'Jargon-free stock education with paper trading simulator',
    description: 'Stock market education platform that demystifies investing with simple lessons and a ₹10L virtual cash simulator — learn investing without losing real money.',
    problem: 'Most Indians want to invest but don\'t know where to start — stock market education is full of jargon, and the fear of losing real money keeps beginners away.',
    tech: ['Next.js 14', 'Prisma', 'NextAuth.js', 'Google Gemini', 'Finnhub API', 'Tailwind CSS', 'Framer Motion'],
    category: 'Web',
    demo: 'https://stockschool-one.vercel.app',
    github: '#',
    learning: 'Real-world APIs are unreliable — Finnhub\'s free tier gets blocked on Vercel\'s IPs regularly. So I built a Simulated Data Engine as a fallback, ensuring users always get realistic stock data for practice. Always engineer for failure, not just the happy path.',
  },
  'portfolio-tracker': {
    name: 'Portfolio Tracker',
    tagline: 'Track your investments across multiple platforms',
    description: 'Coming soon — a unified dashboard to track all your investments in one place.',
    problem: 'Managing investments across multiple platforms is chaotic. Need one view to track everything.',
    tech: ['React', 'Node.js', 'MongoDB', 'REST APIs'],
    category: 'Web',
    demo: '#',
    github: '#',
    learning: 'Under development — stay tuned!',
  },
}

export default function ProjectPage({ params }: { params: { slug: string } }) {
  const { slug } = params
  const project = projectsData[slug]

  if (!project) {
    notFound()
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-text-muted hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Projects
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          {/* Category Badge */}
          <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
            {project.category}
          </span>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">{project.name}</span>
          </h1>

          {/* Tagline */}
          <p className="text-xl text-accent mb-6">{project.tagline}</p>

          {/* Description */}
          <p className="text-text-muted text-lg mb-8">{project.description}</p>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            <a
              href={project.demo}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent rounded-lg font-semibold text-white hover:shadow-lg hover:shadow-primary/30 transition-all"
            >
              <ExternalLink className="w-5 h-5" />
              View Demo
            </a>
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 border border-primary/50 rounded-lg font-semibold text-text-muted hover:text-primary hover:border-primary transition-all"
            >
              <Github className="w-5 h-5" />
              View Code
            </a>
          </div>
        </motion.div>

        {/* Project Image Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12 rounded-xl overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20 h-64 md:h-96 flex items-center justify-center"
        >
          <span className="text-8xl font-bold gradient-text opacity-30">
            {project.name.charAt(0)}
          </span>
        </motion.div>

        {/* Details Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Problem */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-xl p-6 border border-primary/10"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-500" />
              </div>
              <h2 className="text-xl font-bold text-text-primary">The Problem</h2>
            </div>
            <p className="text-text-muted">{project.problem}</p>
          </motion.div>

          {/* Tech Stack */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card rounded-xl p-6 border border-primary/10"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                <Wrench className="w-5 h-5 text-accent" />
              </div>
              <h2 className="text-xl font-bold text-text-primary">Tech Stack</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {project.tech.map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1 text-sm bg-primary/10 text-primary rounded-full"
                >
                  {tech}
                </span>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Key Learning */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-8 border border-primary/10"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
            </div>
            <h2 className="text-xl font-bold text-text-primary">Key Learning</h2>
          </div>
          <p className="text-text-muted text-lg italic">"{project.learning}"</p>
        </motion.div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-12 pt-8 border-t border-primary/10">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-text-muted hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            All Projects
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent rounded-lg font-semibold text-white hover:shadow-lg hover:shadow-primary/30 transition-all"
          >
            Let's Work Together
          </Link>
        </div>
      </div>
    </div>
  )
}
