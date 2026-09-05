'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ExternalLink, Github, ArrowLeft } from 'lucide-react';
import type { Project, TechnicalDecision, Outcome } from '@/types';

export default function ProjectDetailPage({ params }: { params: { slug: string } }) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/api/projects?slug=${encodeURIComponent(params.slug)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.project) setProject(d.project);
        else setError(true);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [params.slug]);

  if (loading) return (
    <div className="min-h-screen pt-24 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-border border-t-text-primary rounded-full animate-spin" />
    </div>
  );

  if (error || !project) return (
    <div className="min-h-screen pt-24 flex flex-col items-center justify-center px-4">
      <h1 className="text-4xl font-display font-semibold text-text-primary mb-4">Project Not Found</h1>
      <Link href="/projects" className="text-text-muted hover:text-text-primary transition-colors">← Back to Projects</Link>
    </div>
  );

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Back */}
        <Link href="/projects" className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> All Projects
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-display font-semibold text-text-primary mb-3">
            {project.title}
          </h1>
          {project.short_description && (
            <p className="text-lg text-text-secondary leading-relaxed">{project.short_description}</p>
          )}
        </div>

        {/* Cover Image */}
        {project.cover_image && (
          <div className="relative w-full aspect-[16/9] mb-10 rounded-lg overflow-hidden border border-border">
            <Image src={project.cover_image} alt={project.title} fill className="object-cover" />
          </div>
        )}

        {/* Tech stack */}
        {project.technologies && project.technologies.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {project.technologies.map((tech) => (
              <span key={tech} className="px-3 py-1 text-xs font-body bg-bg-secondary text-text-secondary border border-border rounded-sm">
                {tech}
              </span>
            ))}
          </div>
        )}

        {/* Links */}
        <div className="flex flex-wrap gap-3 mb-12 pb-12 border-b border-border">
          {project.demo_url && (
            <a href={project.demo_url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-body font-medium bg-text-primary text-bg rounded-sm hover:opacity-90 transition-opacity">
              <ExternalLink className="w-4 h-4" /> Live Demo
            </a>
          )}
          {project.repo_url && (
            <a href={project.repo_url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-body font-medium border border-border text-text-primary rounded-sm hover:bg-bg-secondary transition-colors">
              <Github className="w-4 h-4" /> Source Code
            </a>
          )}
        </div>

        {/* Case Study Sections */}
        {project.problem && (
          <section className="mb-10">
            <h2 className="text-xs font-body font-medium text-text-muted uppercase tracking-widest mb-3">Problem</h2>
            <p className="text-text-secondary leading-relaxed">{project.problem}</p>
          </section>
        )}

        {project.approach && (
          <section className="mb-10">
            <h2 className="text-xs font-body font-medium text-text-muted uppercase tracking-widest mb-3">Approach</h2>
            <p className="text-text-secondary leading-relaxed">{project.approach}</p>
          </section>
        )}

        {project.role && (
          <section className="mb-10">
            <h2 className="text-xs font-body font-medium text-text-muted uppercase tracking-widest mb-3">Role</h2>
            <p className="text-text-secondary leading-relaxed">{project.role}</p>
          </section>
        )}

        {project.technical_decisions && project.technical_decisions.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xs font-body font-medium text-text-muted uppercase tracking-widest mb-4">Technical Decisions</h2>
            <div className="space-y-6">
              {(project.technical_decisions as TechnicalDecision[]).map((td, i) => (
                <div key={i} className="border-l-2 border-border pl-5">
                  <h3 className="text-base font-body font-semibold text-text-primary mb-1.5">{td.decision}</h3>
                  <p className="text-sm text-text-secondary mb-1.5"><span className="text-text-muted">Rationale: </span>{td.rationale}</p>
                  <p className="text-sm text-text-muted"><span className="text-text-muted">Trade-off: </span>{td.trade_off}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {project.outcomes && project.outcomes.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xs font-body font-medium text-text-muted uppercase tracking-widest mb-4">Outcomes</h2>
            <div className="space-y-4">
              {(project.outcomes as Outcome[]).map((o, i) => (
                <div key={i} className="flex gap-4">
                  <span className="text-xs font-body text-text-faint mt-0.5 min-w-[1.5rem]">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <p className="text-text-secondary font-body">{o.outcome}</p>
                    {o.result && <p className="text-sm text-text-muted mt-0.5">{o.result}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Gallery */}
        {project.gallery && project.gallery.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xs font-body font-medium text-text-muted uppercase tracking-widest mb-4">Screenshots</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {project.gallery.map((img, i) => (
                <div key={i} className="relative aspect-video rounded-lg overflow-hidden border border-border">
                  <Image src={img} alt={`${project.title} screenshot ${i + 1}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Footer nav */}
        <div className="pt-8 border-t border-border">
          <Link href="/projects" className="inline-flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Projects
          </Link>
        </div>
      </div>
    </div>
  );
}
