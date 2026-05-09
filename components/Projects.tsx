'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ExternalLink, Github, ArrowRight, Filter } from 'lucide-react'

const projects = [
  {
    id: 'mindspace',
    name: 'MindSpace',
    tagline: 'Anonymous peer support + AI journaling for mental wellness',
    description: 'Mental health support platform built for the Indian context — addressing therapy costs, accessibility, and stigma with ₹99/month pricing and AI-powered empathetic journaling.',
    problem: 'Mental health support in India is broken — therapy costs ₹1,500–3,000/session, therapists don\'t exist in tier-2/3 cities, and stigma stops people from seeking help.',
    tech: ['React Native', 'Node.js', 'PostgreSQL', 'Redis', 'OpenAI GPT-4', 'Socket.io'],
    category: 'AI',
    demo: '#',
    github: '#',
    learning: 'Technology alone isn\'t enough — empathy has to be engineered into every decision, from UI copy to crisis detection logic.',
  },
  {
    id: 'stockschool',
    name: 'StockSchool',
    tagline: 'Jargon-free stock education with paper trading simulator',
    description: 'Stock market education platform that demystifies investing with simple lessons and a ₹10L virtual cash simulator — learn investing without losing real money.',
    problem: 'Most Indians want to invest but don\'t know where to start — stock market education is full of jargon, and the fear of losing real money keeps beginners away.',
    tech: ['Next.js 14', 'Prisma', 'NextAuth.js', 'Google Gemini', 'Finnhub API', 'Tailwind CSS'],
    category: 'Web',
    demo: 'https://stockschool-one.vercel.app',
    github: '#',
    learning: 'Real-world APIs are unreliable — always engineer for failure, not just the happy path. Built a Simulated Data Engine as fallback.',
  },
  {
    id: 'portfolio-tracker',
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
]

const categories = ['All', 'Web', 'DSA', 'AI', 'Tools']

export default function Projects() {
  const [activeFilter, setActiveFilter] = useState('All')

  const filteredProjects = activeFilter === 'All'
    ? projects
    : projects.filter(p => p.category === activeFilter)

  return (
    <section id="projects" className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">Featured Projects</span>
          </h2>
          <p className="text-text-muted max-w-2xl">
            Real products that solve real problems. Each one taught me something that textbooks couldn't.
          </p>
          <div className="w-20 h-1 bg-gradient-to-r from-primary to-accent rounded-full mt-4" />
        </motion.div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-10">
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

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="group bg-card rounded-xl overflow-hidden border border-primary/10 hover:border-primary/30 transition-all hover:shadow-xl hover:shadow-primary/5"
            >
              {/* Project Header - Gradient placeholder */}
              <div className="h-40 bg-gradient-to-br from-primary/20 to-accent/20 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl font-bold gradient-text opacity-50">
                    {project.name.charAt(0)}
                  </span>
                </div>
                {/* Category badge */}
                <span className="absolute top-4 right-4 px-3 py-1 bg-background/80 rounded-full text-xs font-medium text-accent">
                  {project.category}
                </span>
              </div>

              {/* Project Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-text-primary mb-2 group-hover:text-primary transition-colors">
                  {project.name}
                </h3>
                <p className="text-sm text-accent mb-3">{project.tagline}</p>
                <p className="text-sm text-text-muted mb-4 line-clamp-2">
                  {project.description}
                </p>

                {/* Tech Stack */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tech.slice(0, 4).map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-1 text-xs bg-primary/10 text-primary rounded"
                    >
                      {tech}
                    </span>
                  ))}
                  {project.tech.length > 4 && (
                    <span className="px-2 py-1 text-xs bg-card text-text-muted rounded">
                      +{project.tech.length - 4}
                    </span>
                  )}
                </div>

                {/* Links */}
                <div className="flex items-center gap-4 pt-4 border-t border-primary/10">
                  <a
                    href={project.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-text-muted hover:text-primary transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Demo
                  </a>
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-text-muted hover:text-primary transition-colors"
                  >
                    <Github className="w-4 h-4" />
                    Code
                  </a>
                  <a
                    href={`/projects/${project.id}`}
                    className="ml-auto flex items-center gap-1 text-sm text-primary hover:text-accent transition-colors"
                  >
                    Details
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View All Link */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-12"
        >
          <a
            href="/projects"
            className="inline-flex items-center gap-2 px-6 py-3 bg-card rounded-full text-text-muted hover:text-primary hover:bg-primary/10 transition-all"
          >
            View All Projects
            <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>
      </div>
    </section>
  )
}
