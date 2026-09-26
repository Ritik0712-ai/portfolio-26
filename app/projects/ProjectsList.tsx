'use client';

import { useState, useMemo } from 'react';
import { ExternalLink, Github, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import TransitionLink from '@/components/TransitionLink';
import Image from 'next/image';
import ProjectFilter, { projectHasTech } from '@/components/ProjectFilter';
import type { Project } from '@/types';

export default function ProjectsList({ projects }: { projects: Project[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  // Apply category and search filters
  const displayed = useMemo(() => {
    let result = projects;
    // 'All' is the sentinel for "no filter", not a real technology name. The
    // old check was `if (activeCategory)`, and since 'All' is a truthy string
    // it filtered for projects whose technologies literally contained "All" —
    // which is none of them, so the page always rendered "No projects found".
    if (activeCategory && activeCategory !== 'All') {
      result = result.filter(p => projectHasTech(p, activeCategory));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.short_description?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [projects, activeCategory, searchQuery]);

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
            Full-stack products I've designed, built and shipped — each with a write-up of the decisions behind it.
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          <ProjectFilter
            projects={projects}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
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
        {displayed.length === 0 ? (
          <div className="text-center py-16 text-text-muted">No projects found.</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {displayed.map((project) => (
              <article
                key={project.id}
                className="reveal group bg-surface border border-border rounded-lg overflow-hidden hover:border-rule transition-colors"
              >
                {project.cover_image && (
                  <TransitionLink
                    href={`/projects/${project.slug}`}
                    tabIndex={-1}
                    aria-hidden="true"
                    className="relative block aspect-video w-full overflow-hidden bg-bg-secondary"
                    style={{ viewTransitionName: `project-cover-${project.slug}` }}
                  >
                    <Image
                      src={project.cover_image}
                      alt={project.title}
                      fill
                      placeholder="blur"
                      blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 360'%3E%3Crect fill='%23EFEBE3' width='640' height='360'/%3E%3C/svg%3E"
                      sizes="(min-width: 768px) 480px, 100vw"
                      className="object-cover object-top group-hover:scale-[1.02] transition-transform duration-slow"
                    />
                  </TransitionLink>
                )}
                <div className="p-6">
                  <h2 className="text-xl font-display font-semibold text-text-primary mb-2">
                    <TransitionLink
                      href={`/projects/${project.slug}`}
                      className="hover:text-accent transition-colors"
                      style={{ viewTransitionName: `project-title-${project.slug}` }}
                    >
                      {project.title}
                    </TransitionLink>
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
                    <TransitionLink
                      href={`/projects/${project.slug}`}
                      className="ml-auto inline-flex items-center gap-1 text-sm text-accent hover:text-accent-warm transition-colors"
                    >
                      Details <ArrowRight className="w-3.5 h-3.5" />
                    </TransitionLink>
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
