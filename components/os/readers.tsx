'use client';

import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ExternalLink, Github } from 'lucide-react';
import type { Project, TechnicalDecision, Outcome } from '@/types';
import { useEffect } from 'react';
import { useBlog } from './data';
import { track } from '@/lib/track';

// Content renderers shared by macOS Safari and the iOS apps. Colours come
// from the --mac-* variables that both .mac-root and .ios-root define.

function Paras({ text }: { text: string }) {
  return (
    <>
      {text.split(/\n\s*\n/).map((p, i) => (
        <p key={i} className="mb-3 leading-relaxed mac-text-muted">{p.trim()}</p>
      ))}
    </>
  );
}

export function ProjectReader({ project }: { project: Project }) {
  useEffect(() => track('project', { path: '/magic', label: project.slug }), [project.slug]);
  const decisions = ((project.technical_decisions || []) as TechnicalDecision[]).filter((d) => d.decision?.trim());
  const outcomes = ((project.outcomes || []) as Outcome[]).filter((o) => o.outcome?.trim() || o.result?.trim());
  return (
    <article className="max-w-2xl mx-auto px-6 py-8 mac-text">
      <p className="text-[12px] font-semibold uppercase tracking-wider text-[#0A84FF] mb-1">Case study</p>
      <h1 className="text-[28px] font-bold leading-tight mb-2">{project.title}</h1>
      {project.short_description && <p className="text-[17px] mac-text-muted leading-snug mb-5">{project.short_description}</p>}
      <div className="flex flex-wrap gap-2 mb-6">
        {project.demo_url && (
          <a href={project.demo_url} target="_blank" rel="noopener noreferrer" className="mac-btn-primary inline-flex items-center gap-1.5">
            <ExternalLink className="w-3.5 h-3.5" /> Live demo
          </a>
        )}
        {project.repo_url && (
          <a href={project.repo_url} target="_blank" rel="noopener noreferrer" className="mac-btn inline-flex items-center gap-1.5">
            <Github className="w-3.5 h-3.5" /> Source
          </a>
        )}
      </div>
      {project.cover_image && (
        <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-6 bg-black/10">
          <Image src={project.cover_image} alt={project.title} fill sizes="672px" className="object-cover object-top" />
        </div>
      )}
      {project.role && <p className="text-[13px] mac-text-faint mb-6"><span className="font-semibold mac-text">Role:</span> {project.role}</p>}
      {project.problem && (<><h2 className="text-[20px] font-bold mt-6 mb-2">Problem</h2><Paras text={project.problem} /></>)}
      {project.approach && (<><h2 className="text-[20px] font-bold mt-6 mb-2">Approach</h2><Paras text={project.approach} /></>)}
      {decisions.length > 0 && (
        <>
          <h2 className="text-[20px] font-bold mt-6 mb-2">Decisions &amp; trade-offs</h2>
          {decisions.map((d, i) => (
            <div key={i} className="border-l-2 border-[#0A84FF] pl-4 mb-4"><Paras text={d.decision} /></div>
          ))}
        </>
      )}
      {outcomes.length > 0 && (
        <>
          <h2 className="text-[20px] font-bold mt-6 mb-2">Outcomes</h2>
          <ul className="list-disc pl-5 mb-3 space-y-1.5 mac-text-muted">
            {outcomes.map((o, i) => <li key={i}>{[o.outcome, o.result].filter(Boolean).join(' — ')}</li>)}
          </ul>
        </>
      )}
      {project.learnings && (<><h2 className="text-[20px] font-bold mt-6 mb-2">What I&apos;d do differently</h2><Paras text={project.learnings} /></>)}
      {project.technologies?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-6">
          {project.technologies.map((t) => <span key={t} className="px-2 py-0.5 rounded-md mac-chip text-[12px]">{t}</span>)}
        </div>
      )}
      <a href={`/projects/${project.slug}`} target="_blank" rel="noopener noreferrer" className="inline-block mt-8 text-[13px] text-[#0A84FF]">
        Open the full case study with diagrams ↗
      </a>
    </article>
  );
}

export function BlogReader({ slug }: { slug: string }) {
  useEffect(() => track('post', { path: '/magic', label: slug }), [slug]);
  const { data: post, error } = useBlog(slug);
  if (error) return <p className="p-8 mac-text-faint">Couldn&apos;t load this post.</p>;
  if (post === undefined) return <p className="p-8 mac-text-faint">Loading…</p>;
  if (!post) return <p className="p-8 mac-text-faint">Post not found.</p>;
  // The first markdown heading usually repeats the title.
  const body = post.content.replace(/^#\s+.*\n+/, '');
  return (
    <article className="max-w-2xl mx-auto px-6 py-8 mac-text">
      <p className="text-[12px] font-semibold uppercase tracking-wider text-[#0A84FF] mb-1">{post.category}</p>
      <h1 className="text-[28px] font-bold leading-tight mb-2">{post.title}</h1>
      <p className="text-[13px] mac-text-faint mb-6">
        {new Date(post.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        {post.reading_time ? ` · ${post.reading_time}` : ''}
      </p>
      <div className="os-prose">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
      </div>
    </article>
  );
}
