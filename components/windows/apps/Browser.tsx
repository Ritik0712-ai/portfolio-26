'use client';

import { useState } from 'react';
import { ArrowLeft, ArrowRight, RotateCw, Lock, Plus, X, Star, Github, Linkedin, Code2, Globe, Search } from 'lucide-react';
import { useBlogs, useProjects, PROFILE } from '@/components/os/data';
import { BlogReader, ProjectReader } from '@/components/os/readers';
import { Fluent } from '../meta';

type Page = { kind: 'start' } | { kind: 'post'; slug: string } | { kind: 'project'; slug: string };
interface Tab { id: number; history: Page[]; index: number }

let tabSeq = 1;

function urlFor(p: Page) {
  if (p.kind === 'post') return `ritikagarwal.me/blog/${p.slug}`;
  if (p.kind === 'project') return `ritikagarwal.me/projects/${p.slug}`;
  return '';
}

// A Chromium-style browser with tabs. It only "browses" the portfolio's own
// content; outside links open in a real browser tab.
export default function Browser({ initial }: { initial?: Page }) {
  const [tabs, setTabs] = useState<Tab[]>(() => [{ id: tabSeq++, history: [initial ?? { kind: 'start' }], index: 0 }]);
  const [active, setActive] = useState(tabs[0].id);
  const [q, setQ] = useState('');
  const { data: posts } = useBlogs();
  const { data: projects } = useProjects();

  const tab = tabs.find((t) => t.id === active) ?? tabs[0];
  const page = tab.history[tab.index];

  const patch = (t: Partial<Tab>) => setTabs((all) => all.map((x) => (x.id === tab.id ? { ...x, ...t } : x)));
  const go = (p: Page) => {
    const h = [...tab.history.slice(0, tab.index + 1), p];
    patch({ history: h, index: h.length - 1 });
  };
  const newTab = () => {
    const t = { id: tabSeq++, history: [{ kind: 'start' } as Page], index: 0 };
    setTabs((all) => [...all, t]);
    setActive(t.id);
  };
  const closeTab = (id: number) => {
    if (tabs.length === 1) return patch({ history: [{ kind: 'start' }], index: 0 });
    const i = tabs.findIndex((t) => t.id === id);
    const rest = tabs.filter((t) => t.id !== id);
    setTabs(rest);
    if (id === active) setActive(rest[Math.max(0, i - 1)].id);
  };

  const titleOf = (p: Page) => {
    if (p.kind === 'post') return posts?.find((b) => b.slug === p.slug)?.title ?? 'Blog';
    if (p.kind === 'project') return projects?.find((b) => b.slug === p.slug)?.title ?? 'Project';
    return 'New tab';
  };

  const project = page.kind === 'project' ? projects?.find((p) => p.slug === page.slug) : undefined;

  const search = () => {
    const t = q.trim().toLowerCase();
    if (!t) return;
    const pr = projects?.find((p) => p.title.toLowerCase().includes(t));
    if (pr) return go({ kind: 'project', slug: pr.slug });
    const po = posts?.find((p) => p.title.toLowerCase().includes(t));
    if (po) return go({ kind: 'post', slug: po.slug });
  };

  const favourites = [
    { label: 'GitHub', href: PROFILE.github, Icon: Github, color: '#24292f' },
    { label: 'LinkedIn', href: PROFILE.linkedin, Icon: Linkedin, color: '#0A66C2' },
    { label: 'LeetCode', href: PROFILE.leetcode, Icon: Code2, color: '#E8910C' },
    { label: 'Classic site', href: '/', Icon: Globe, color: '#3A3530' },
  ];

  return (
    <div className="flex flex-col h-full text-[13px]">
      {/* Tab strip */}
      <div className="flex items-end gap-1 px-2 pt-1.5 win-mica shrink-0 overflow-x-auto">
        {tabs.map((t) => {
          const p = t.history[t.index];
          const on = t.id === tab.id;
          return (
            <div
              key={t.id}
              className={`group flex items-center gap-2 h-8 pl-3 pr-1 w-[200px] min-w-[120px] rounded-t-lg ${on ? 'win-solid shadow-[0_-1px_0_var(--win-stroke)]' : 'win-hover'}`}
            >
              <button onClick={() => setActive(t.id)} className="flex items-center gap-2 flex-1 min-w-0 text-left">
                {p.kind === 'start' ? <Fluent name="globe_24_color" size={14} /> : <Fluent name={p.kind === 'post' ? 'document_48_color' : 'briefcase_48_color'} size={14} />}
                <span className="truncate text-[12px]">{titleOf(p)}</span>
              </button>
              <button aria-label="Close tab" onClick={() => closeTab(t.id)} className="w-6 h-6 rounded win-hover flex items-center justify-center opacity-70 hover:opacity-100">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
        <button aria-label="New tab" onClick={newTab} className="w-8 h-8 mb-0.5 rounded-md win-hover flex items-center justify-center"><Plus className="w-4 h-4" /></button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-1 h-11 px-2 win-solid border-b win-stroke shrink-0">
        <button aria-label="Back" disabled={tab.index === 0} onClick={() => patch({ index: tab.index - 1 })} className="w-8 h-8 rounded-md win-hover flex items-center justify-center disabled:opacity-30"><ArrowLeft className="w-4 h-4" /></button>
        <button aria-label="Forward" disabled={tab.index >= tab.history.length - 1} onClick={() => patch({ index: tab.index + 1 })} className="w-8 h-8 rounded-md win-hover flex items-center justify-center disabled:opacity-30"><ArrowRight className="w-4 h-4" /></button>
        <button aria-label="Refresh" onClick={() => patch({ history: [...tab.history] })} className="w-8 h-8 rounded-md win-hover flex items-center justify-center"><RotateCw className="w-3.5 h-3.5" /></button>
        <div className="flex-1 h-8 mx-1 rounded-full win-card flex items-center gap-2 px-3">
          <Lock className="w-3.5 h-3.5 win-text-2" />
          <input
            value={page.kind === 'start' ? q : urlFor(page)}
            onChange={(e) => page.kind === 'start' && setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && search()}
            readOnly={page.kind !== 'start'}
            placeholder="Search projects and posts, or pick one below"
            aria-label="Address bar"
            className="flex-1 bg-transparent outline-none placeholder:win-text-2"
          />
          <Star className="w-4 h-4 win-text-2" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto win-scroll bg-[var(--win-layer)]">
        {page.kind === 'start' && (
          <div className="max-w-3xl mx-auto px-8 py-10">
            <div className="flex flex-col items-center mb-8">
              <span className="text-[40px] font-semibold tracking-tight mb-4" style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}>ritikagarwal.me</span>
              <label className="w-full max-w-xl h-11 rounded-full win-card flex items-center gap-3 px-4 shadow-sm">
                <Search className="w-4 h-4 win-text-2" />
                <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && search()} placeholder="Search the portfolio" aria-label="Search the portfolio" className="flex-1 bg-transparent outline-none text-[14px]" />
              </label>
            </div>
            <div className="flex justify-center gap-6 mb-10">
              {favourites.map((b) => (
                <a key={b.label} href={b.href} target={b.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="flex flex-col items-center gap-2 w-20 p-2 rounded-lg win-hover">
                  <span className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: b.color }}><b.Icon className="w-5 h-5 text-white" /></span>
                  <span className="text-[12px]">{b.label}</span>
                </a>
              ))}
            </div>
            {!!projects?.length && <h2 className="text-[16px] font-semibold mb-3">Case studies</h2>}
            <div className="grid grid-cols-2 gap-3 mb-8">
              {(projects ?? []).map((p) => (
                <button key={p.id} onClick={() => go({ kind: 'project', slug: p.slug })} className="text-left rounded-lg overflow-hidden win-card win-hover">
                  {p.cover_image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.cover_image} alt="" className="w-full aspect-video object-cover object-top" />
                  )}
                  <span className="block p-3">
                    <span className="block font-semibold">{p.title}</span>
                    <span className="block win-text-2 text-[12px] line-clamp-2">{p.short_description}</span>
                  </span>
                </button>
              ))}
            </div>
            {!!posts?.length && <h2 className="text-[16px] font-semibold mb-3">From the blog</h2>}
            <div className="space-y-2">
              {(posts ?? []).map((b) => (
                <button key={b.id} onClick={() => go({ kind: 'post', slug: b.slug })} className="w-full text-left p-3 rounded-lg win-card win-hover">
                  <span className="block text-[11px] font-semibold uppercase tracking-wide win-accent">{b.category}</span>
                  <span className="block font-semibold">{b.title}</span>
                  {b.excerpt && <span className="block win-text-2 text-[12px] line-clamp-2">{b.excerpt}</span>}
                </button>
              ))}
            </div>
          </div>
        )}
        {page.kind === 'post' && <BlogReader slug={page.slug} />}
        {page.kind === 'project' && (project ? <ProjectReader project={project} /> : <p className="p-8 win-text-2">Loading…</p>)}
      </div>
    </div>
  );
}
