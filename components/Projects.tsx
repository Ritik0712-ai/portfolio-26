'use client';

import { useState, useEffect } from 'react';
import { ExternalLink, Github, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import ProjectFilter from './ProjectFilter';
import type { Project } from '@/types';

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  useEffect(() => {
    fetch('/api/projects?featured=true')
      .then((r) => r.json())
      .then((d) => setProjects(d.projects || []))
      .catch(() => {});
  }, []);

  const filteredProjects = activeCategory === 'all'
    ? projects
    : projects.filter((p) => p.technologies?.includes(activeCategory));

  return (
    <section id="projects" className="py-20">
      <div className="max-w-5xl mx-auto px-4">
        {/* Section header */}
        <div className="mb-12 flex items-end justify-between">
          <div>
            <p className="text-xs font-mono text-text-faint uppercase tracking-[0.3em] mb-2">Selected Work</p>
            <h2 className="text-3xl md:text-4xl font-display font-semibold text-text-primary">Projects</h2>
          </div>
          <Link href="/projects" className="hidden md:inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary font-body transition-colors">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Filter + Search */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <ProjectFilter projects={projects} activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
        </div>

        {/* Projects grid */}
        {filteredProjects.length === 0 ? (
          <p className="text-text-muted font-body text-sm py-12 text-center border border-dashed border-border rounded-lg">
            No projects match this filter.
          </p>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {filteredProjects.map((project) => (
              <article key={project.id} className="group bg-surface border border-border rounded-lg overflow-hidden hover:border-accent/30 transition-all duration-slow hover:shadow-lg hover:shadow-accent/5">
                {/* Cover image */}
                {project.cover_image ? (
                  <div className="aspect-video overflow-hidden bg-bg-secondary">
                    <Image
                      src={project.cover_image}
                      alt={project.title}
                      width={640}
                      height={360}
                      className="object-cover w-full h-full group-hover:scale-[1.02] transition-transform duration-slow"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-bg-secondary flex items-center justify-center">
                    <span className="text-xs text-text-faint font-mono">{project.title[0]}</span>
                  </div>
                )}

                {/* Content */}
                <div className="p-6">
                  <h3 className="font-display font-semibold text-xl text-text-primary mb-1 group-hover:text-accent transition-colors">
                    <Link href={`/projects/${project.slug}`}>{project.title}</Link>
                  </h3>
                  {project.short_description && (
                    <p className="text-sm text-text-secondary font-body leading-relaxed mb-4">
                      {project.short_description}
                    </p>
                  )}

                  {/* Technologies */}
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {project.technologies.slice(0, 5).map((tech) => (
                        <span key={tech} className="text-xs font-mono text-text-faint bg-bg-secondary px-2 py-0.5 rounded">
                          {tech}
                        </span>
                      ))}
                      {project.technologies.length > 5 && (
                        <span className="text-xs text-text-faint">+{project.technologies.length - 5}</span>
                      )}
                    </div>
                  )}

                  {/* Links */}
                  <div className="flex items-center gap-3 pt-4 border-t border-border">
                    {project.demo_url && (
                      <a href={project.demo_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary font-body transition-colors">
                        <ExternalLink className="w-3.5 h-3.5" /> Demo
                      </a>
                    )}
                    {project.repo_url && (
                      <a href={project.repo_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary font-body transition-colors">
                        <Github className="w-3.5 h-3.5" /> Code
                      </a>
                    )}
                    <Link href={`/projects/${project.slug}`} className="ml-auto inline-flex items-center gap-1 text-xs text-accent hover:text-accent-warm font-body transition-colors">
                      Details <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Mobile view all */}
        <div className="mt-8 text-center md:hidden">
          <Link href="/projects" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary font-body transition-colors">
            View all projects <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
