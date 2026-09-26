'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import TransitionLink from '@/components/TransitionLink';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { ExternalLink, Github, ArrowLeft, ArrowRight } from 'lucide-react';
import type { Project, TechnicalDecision, Outcome } from '@/types';

const MermaidDiagram = dynamic(() => import('@/components/MermaidDiagram'), {
  ssr: false,
  loading: () => <div className="h-40 rounded-lg bg-bg-secondary animate-pulse" />,
});

const BLUR =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 360'%3E%3Crect fill='%23EFEBE3' width='640' height='360'/%3E%3C/svg%3E";

// Long-form fields are stored as plain text with blank lines between
// paragraphs; render each paragraph instead of collapsing the whitespace.
function Paragraphs({ text }: { text: string }) {
  return (
    <div className="space-y-4">
      {text
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p, i) => (
          <p key={i} className="text-text-secondary font-body leading-relaxed">
            {p}
          </p>
        ))}
    </div>
  );
}

function SectionHeading({ index, children }: { index: number; children: React.ReactNode }) {
  return (
    <h2 className="flex items-baseline gap-3 mb-5">
      <span className="text-xs font-mono text-text-faint">{String(index).padStart(2, '0')}</span>
      <span className="text-2xl font-display font-semibold text-text-primary">{children}</span>
    </h2>
  );
}

interface ProjectDetailClientProps {
  slug: string;
  initialProject?: Project | null;
}

export default function ProjectDetailClient({ slug, initialProject }: ProjectDetailClientProps) {
  const [project, setProject] = useState<Project | null>(initialProject ?? null);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(!initialProject);
  const [error, setError] = useState(initialProject === null);

  useEffect(() => {
    fetch('/api/projects')
      .then((r) => r.json())
      .then((d) => setAllProjects(d.projects || []))
      .catch(() => {});
    if (initialProject !== undefined) return;
    fetch(`/api/projects?slug=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.project) setProject(d.project);
        else setError(true);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug, initialProject]);

  const decisions = useMemo(
    () => ((project?.technical_decisions || []) as TechnicalDecision[]).filter((d) => d.decision?.trim()),
    [project]
  );
  const outcomes = useMemo(
    () => ((project?.outcomes || []) as Outcome[]).filter((o) => o.outcome?.trim() || o.result?.trim()),
    [project]
  );

  const sections = useMemo(() => {
    if (!project) return [];
    return [
      project.problem?.trim() && { id: 'problem', label: 'Problem' },
      project.approach?.trim() && { id: 'approach', label: 'Approach' },
      project.architecture?.trim() && { id: 'architecture', label: 'Architecture' },
      decisions.length > 0 && { id: 'decisions', label: 'Decisions & trade-offs' },
      outcomes.length > 0 && { id: 'outcomes', label: 'Outcomes' },
      project.learnings?.trim() && { id: 'learnings', label: "What I'd do differently" },
      project.gallery?.length > 0 && { id: 'screenshots', label: 'Screenshots' },
    ].filter(Boolean) as { id: string; label: string }[];
  }, [project, decisions, outcomes]);

  const next = useMemo(() => {
    if (!project || allProjects.length < 2) return null;
    const i = allProjects.findIndex((p) => p.slug === project.slug);
    return allProjects[(i + 1) % allProjects.length];
  }, [project, allProjects]);

  if (loading)
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-border border-t-text-primary rounded-full animate-spin" />
      </div>
    );

  if (error || !project)
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center px-4">
        <h1 className="text-4xl font-display font-semibold text-text-primary mb-4">Project Not Found</h1>
        <Link href="/projects" className="text-text-muted hover:text-text-primary transition-colors">
          ← Back to Projects
        </Link>
      </div>
    );

  const sectionIndex = (id: string) => sections.findIndex((s) => s.id === id) + 1;

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        <TransitionLink
          href="/projects"
          className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors mb-10"
        >
          <ArrowLeft className="w-4 h-4" /> All Projects
        </TransitionLink>

        {/* Header */}
        <header className="max-w-3xl mb-10">
          <p className="text-xs font-mono text-text-faint uppercase tracking-[0.3em] mb-3">Case study</p>
          <h1
            className="text-4xl md:text-6xl font-display font-semibold text-text-primary leading-[1.05] mb-4"
            style={{ viewTransitionName: `project-title-${project.slug}` }}
          >
            {project.title}
          </h1>
          {project.short_description && (
            <p className="text-lg text-text-secondary font-body leading-relaxed">{project.short_description}</p>
          )}
        </header>

        {/* At a glance */}
        <dl className="grid sm:grid-cols-3 gap-6 py-6 mb-10 border-y border-border">
          {project.role && (
            <div>
              <dt className="text-xs font-mono text-text-faint uppercase tracking-widest mb-1.5">Role</dt>
              <dd className="text-sm text-text-primary font-body">{project.role}</dd>
            </div>
          )}
          {project.technologies?.length > 0 && (
            <div>
              <dt className="text-xs font-mono text-text-faint uppercase tracking-widest mb-1.5">Stack</dt>
              <dd className="text-sm text-text-primary font-body">{project.technologies.slice(0, 6).join(' · ')}</dd>
            </div>
          )}
          {(project.demo_url || project.repo_url) && (
            <div>
              <dt className="text-xs font-mono text-text-faint uppercase tracking-widest mb-1.5">Links</dt>
              <dd className="flex flex-wrap gap-4 text-sm font-body">
                {project.demo_url && (
                  <a href={project.demo_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-text-primary hover:text-accent transition-colors">
                    <ExternalLink className="w-3.5 h-3.5" /> Live demo
                  </a>
                )}
                {project.repo_url && (
                  <a href={project.repo_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-text-primary hover:text-accent transition-colors">
                    <Github className="w-3.5 h-3.5" /> Source
                  </a>
                )}
              </dd>
            </div>
          )}
        </dl>

        {/* Cover */}
        {project.cover_image && (
          <div
            className="relative w-full aspect-[16/9] mb-14 rounded-lg overflow-hidden border border-border bg-bg-secondary"
            style={{ viewTransitionName: `project-cover-${project.slug}` }}
          >
            <Image
              src={project.cover_image}
              alt={project.title}
              fill
              priority
              sizes="(min-width: 1024px) 1024px, 100vw"
              placeholder="blur"
              blurDataURL={BLUR}
              className="object-cover object-top"
            />
          </div>
        )}

        <div className="grid lg:grid-cols-[200px_1fr] gap-12">
          {/* On this page */}
          {sections.length > 1 && (
            <nav aria-label="On this page" className="hidden lg:block">
              <div className="sticky top-28">
                <p className="text-xs font-mono text-text-faint uppercase tracking-widest mb-4">On this page</p>
                <ol className="space-y-2.5 border-l border-border">
                  {sections.map((s) => (
                    <li key={s.id}>
                      <a href={`#${s.id}`} className="block -ml-px pl-4 border-l border-transparent text-sm font-body text-text-muted hover:text-text-primary hover:border-text-primary transition-colors">
                        {s.label}
                      </a>
                    </li>
                  ))}
                </ol>
              </div>
            </nav>
          )}

          <article className="max-w-3xl space-y-16 lg:col-start-2">
            {project.problem?.trim() && (
              <section id="problem" className="scroll-mt-28 reveal">
                <SectionHeading index={sectionIndex('problem')}>Problem</SectionHeading>
                <Paragraphs text={project.problem} />
              </section>
            )}

            {project.approach?.trim() && (
              <section id="approach" className="scroll-mt-28 reveal">
                <SectionHeading index={sectionIndex('approach')}>Approach</SectionHeading>
                <Paragraphs text={project.approach} />
              </section>
            )}

            {project.architecture?.trim() && (
              <section id="architecture" className="scroll-mt-28 reveal">
                <SectionHeading index={sectionIndex('architecture')}>Architecture</SectionHeading>
                <div className="bg-surface border border-border rounded-lg p-6">
                  <MermaidDiagram chart={project.architecture} />
                </div>
              </section>
            )}

            {decisions.length > 0 && (
              <section id="decisions" className="scroll-mt-28 reveal">
                <SectionHeading index={sectionIndex('decisions')}>Decisions &amp; trade-offs</SectionHeading>
                <ol className="space-y-8">
                  {decisions.map((td, i) => (
                    <li key={i} className="border-l-2 border-border pl-6">
                      <p className="text-xs font-mono text-accent mb-2">Decision {i + 1}</p>
                      <Paragraphs text={td.decision} />
                      {td.rationale?.trim() && (
                        <p className="text-sm text-text-secondary font-body mt-3">
                          <span className="text-text-muted">Why: </span>
                          {td.rationale}
                        </p>
                      )}
                      {td.trade_off?.trim() && (
                        <p className="text-sm text-text-secondary font-body mt-2">
                          <span className="text-text-muted">Trade-off: </span>
                          {td.trade_off}
                        </p>
                      )}
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {outcomes.length > 0 && (
              <section id="outcomes" className="scroll-mt-28 reveal">
                <SectionHeading index={sectionIndex('outcomes')}>Outcomes</SectionHeading>
                <div className="grid sm:grid-cols-2 gap-4">
                  {outcomes.map((o, i) => (
                    <div key={i} className="bg-surface border border-border rounded-lg p-5">
                      {o.result?.trim() ? (
                        <>
                          <p className="text-xs font-mono text-text-faint uppercase tracking-widest mb-2">{o.outcome}</p>
                          <p className="text-sm text-text-primary font-body leading-relaxed">{o.result}</p>
                        </>
                      ) : (
                        <p className="text-sm text-text-primary font-body leading-relaxed">{o.outcome}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {project.learnings?.trim() && (
              <section id="learnings" className="scroll-mt-28 reveal">
                <SectionHeading index={sectionIndex('learnings')}>What I&apos;d do differently</SectionHeading>
                <div className="bg-bg-secondary border-l-2 border-accent rounded-r-lg p-6">
                  <Paragraphs text={project.learnings} />
                </div>
              </section>
            )}

            {project.gallery?.length > 0 && (
              <section id="screenshots" className="scroll-mt-28 reveal">
                <SectionHeading index={sectionIndex('screenshots')}>Screenshots</SectionHeading>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {project.gallery.map((img, i) => (
                    <a key={i} href={img} target="_blank" rel="noopener noreferrer" className="relative aspect-video rounded-lg overflow-hidden border border-border bg-bg-secondary block">
                      <Image
                        src={img}
                        alt={`${project.title} screenshot ${i + 1}`}
                        fill
                        sizes="(min-width: 640px) 384px, 100vw"
                        placeholder="blur"
                        blurDataURL={BLUR}
                        className="object-cover object-top hover:scale-[1.02] transition-transform duration-300"
                      />
                    </a>
                  ))}
                </div>
              </section>
            )}

            {/* Next project */}
            <footer className="pt-8 border-t border-border flex items-center justify-between gap-4">
              <Link href="/projects" className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors">
                <ArrowLeft className="w-4 h-4" /> All projects
              </Link>
              {next && next.slug !== project.slug && (
                <TransitionLink href={`/projects/${next.slug}`} className="group text-right">
                  <span className="block text-xs font-mono text-text-faint uppercase tracking-widest">Next</span>
                  <span className="inline-flex items-center gap-2 font-display text-xl text-text-primary group-hover:text-accent transition-colors">
                    {next.title} <ArrowRight className="w-4 h-4" />
                  </span>
                </TransitionLink>
              )}
            </footer>
          </article>
        </div>
      </div>
    </div>
  );
}
