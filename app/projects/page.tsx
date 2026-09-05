'use client';

import { useState, useEffect } from 'react';
import { ExternalLink, Github, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface Project {
  id: string;
  slug: string;
  title: string;
  short_description: string | null;
  cover_image: string | null;
  technologies: string[];
  demo_url: string | null;
  repo_url: string | null;
  featured: boolean;
  created_at: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      if (data.projects) setProjects(data.projects);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = projects.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.short_description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <p className="text-sm font-body text-text-muted uppercase tracking-widest mb-2">Work</p>
          <h1 className="text-4xl md:text-5xl font-display font-semibold text-text-primary">
            Projects
          </h1>
          <p className="text-text-secondary mt-3 max-w-xl">
            Selected work in product engineering, full-stack development, and open source.
          </p>
        </div>

        {/* Search */}
        <input
          type="search"
          placeholder="Search projects…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2.5 font-body text-sm bg-surface border border-border rounded text-text-primary placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-accent mb-8"
        />

        {/* Projects Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-surface border border-border rounded-lg h-64 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-text-muted">No projects found.</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {filtered.map((project) => (
              <article
                key={project.id}
                className="group bg-surface border border-border rounded-lg overflow-hidden hover:border-rule transition-colors"
              >
                {project.cover_image && (
                  <div className="relative h-44 w-full overflow-hidden">
                    <Image
                      src={project.cover_image}
                      alt={project.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-slow"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h2 className="text-xl font-display font-semibold text-text-primary mb-2">
                    {project.title}
                  </h2>
                  {project.short_description && (
                    <p className="text-text-secondary text-sm mb-4 line-clamp-3">
                      {project.short_description}
                    </p>
                  )}
                  {project.technologies?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {project.technologies.slice(0, 5).map((tech) => (
                        <span
                          key={tech}
                          className="text-xs px-2 py-0.5 bg-bg-secondary text-text-muted border border-border-subtle rounded-sm"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-3 pt-3 border-t border-border-subtle">
                    {project.demo_url && (
                      <a
                        href={project.demo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Demo
                      </a>
                    )}
                    {project.repo_url && (
                      <a
                        href={project.repo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors"
                      >
                        <Github className="w-3.5 h-3.5" />
                        Code
                      </a>
                    )}
                    <Link
                      href={`/projects/${project.slug}`}
                      className="ml-auto inline-flex items-center gap-1 text-sm text-accent hover:text-accent-warm transition-colors"
                    >
                      Details <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
