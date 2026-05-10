'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ExternalLink, Github, ArrowRight, Filter } from 'lucide-react'

interface Project {
  id: string
  slug: string
  title: string
  description: string
  demo_url: string
  repo_url: string
  technologies: string[]
  featured: boolean
  image: string
}

const categories = ['All', 'Web', 'DSA', 'AI', 'Tools']

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('All')

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/admin/projects')
      const data = await res.json()
      if (data.projects) {
        setProjects(data.projects)
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    } finally {
      setLoading(false)
    }
  }

  // Map Supabase project to component format
  const mapProject = (p: Project) => ({
    id: p.slug || p.id,
    name: p.title,
    tagline: p.description?.substring(0, 60) || '',
    description: p.description || '',
    tech: p.technologies || [],
    category: 'Web',
    demo: p.demo_url || '#',
    github: p.repo_url || '#',
  })

  const mappedProjects = projects.map(mapProject)
  const filteredProjects = activeFilter === 'All'
    ? mappedProjects
    : mappedProjects.filter((p: any) => p.category === activeFilter)

  if (loading) {
    return (
      <section id="projects" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-12 bg-gray-700 rounded w-1/4"></div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-80 bg-gray-700 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  }

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
        {filteredProjects.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project: any, index: number) => (
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
                      {project.name?.charAt(0) || 'P'}
                    </span>
                  </div>
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
                    {(project.tech || []).slice(0, 4).map((tech: string) => (
                      <span
                        key={tech}
                        className="px-2 py-1 text-xs bg-primary/10 text-primary rounded"
                      >
                        {tech}
                      </span>
                    ))}
                    {(project.tech || []).length > 4 && (
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
        ) : (
          <div className="text-center py-12 text-text-muted">
            <p>No projects yet. Add some from the admin panel!</p>
            <a href="/admin" className="text-primary hover:underline mt-2 inline-block">
              Add projects →
            </a>
          </div>
        )}

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
