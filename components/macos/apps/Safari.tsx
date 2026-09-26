'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Lock, RotateCw, Github, Linkedin, Code2, Globe } from 'lucide-react';
import { useBlogs, useProjects, PROFILE } from '@/components/os/data';
import { BlogReader, ProjectReader } from '@/components/os/readers';

type Page = { kind: 'start' } | { kind: 'post'; slug: string } | { kind: 'project'; slug: string };

function urlFor(p: Page) {
  if (p.kind === 'post') return `ritikagarwal.me/blog/${p.slug}`;
  if (p.kind === 'project') return `ritikagarwal.me/projects/${p.slug}`;
  return 'ritikagarwal.me';
}

export default function Safari({ initial }: { initial?: Page }) {
  const [history, setHistory] = useState<Page[]>([initial ?? { kind: 'start' }]);
  const [index, setIndex] = useState(0);
  const page = history[index];
  const { data: posts } = useBlogs();
  const { data: projects } = useProjects();

  const go = (p: Page) => {
    const next = [...history.slice(0, index + 1), p];
    setHistory(next);
    setIndex(next.length - 1);
  };

  const bookmarks = [
    { label: 'GitHub', href: PROFILE.github, icon: Github, color: '#24292f' },
    { label: 'LinkedIn', href: PROFILE.linkedin, icon: Linkedin, color: '#0A66C2' },
    { label: 'LeetCode', href: PROFILE.leetcode, icon: Code2, color: '#F89F1B' },
    { label: 'Classic site', href: '/', icon: Globe, color: '#3A3530' },
  ];

  const project = page.kind === 'project' ? projects?.find((p) => p.slug === page.slug) : undefined;

  return (
    <div className="flex flex-col h-full mac-text text-[13px]">
      {/* Toolbar */}
      <div className="flex items-center gap-2 h-11 px-3 border-b mac-divider shrink-0 mac-toolbar">
        <button aria-label="Back" disabled={index === 0} onClick={() => setIndex(index - 1)} className="p-1.5 rounded-md mac-hover disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
        <button aria-label="Forward" disabled={index >= history.length - 1} onClick={() => setIndex(index + 1)} className="p-1.5 rounded-md mac-hover disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
        <div className="flex-1 flex justify-center">
          <button onClick={() => go({ kind: 'start' })} className="w-full max-w-md flex items-center justify-center gap-1.5 h-7 rounded-lg mac-urlbar text-[12.5px]">
            <Lock className="w-3 h-3 mac-text-faint" />
            <span className="truncate">{urlFor(page)}</span>
          </button>
        </div>
        <button aria-label="Reload" onClick={() => setHistory([...history])} className="p-1.5 rounded-md mac-hover"><RotateCw className="w-3.5 h-3.5" /></button>
      </div>

      <div className="flex-1 overflow-y-auto mac-window-body">
        {page.kind === 'start' && (
          <div className="max-w-3xl mx-auto px-8 py-8">
            <h2 className="text-[20px] font-bold mb-4">Favourites</h2>
            <div className="grid grid-cols-4 gap-4 mb-10">
              {bookmarks.map((b) => (
                <a key={b.label} href={b.href} target={b.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="flex flex-col items-center gap-2 group">
                  <span className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform" style={{ background: b.color }}>
                    <b.icon className="w-7 h-7 text-white" />
                  </span>
                  <span className="text-[12px]">{b.label}</span>
                </a>
              ))}
            </div>

            <h2 className="text-[20px] font-bold mb-4">Case studies</h2>
            <div className="grid grid-cols-2 gap-4 mb-10">
              {(projects ?? []).map((p) => (
                <button key={p.id} onClick={() => go({ kind: 'project', slug: p.slug })} className="text-left rounded-xl overflow-hidden mac-card hover:shadow-lg transition-shadow">
                  <div className="relative aspect-video bg-black/10">
                    {p.cover_image && <Image src={p.cover_image} alt="" fill sizes="360px" className="object-cover object-top" />}
                  </div>
                  <div className="p-3">
                    <p className="font-semibold">{p.title}</p>
                    <p className="mac-text-faint text-[12px] line-clamp-2">{p.short_description}</p>
                  </div>
                </button>
              ))}
            </div>

            <h2 className="text-[20px] font-bold mb-4">Reading list</h2>
            <div className="space-y-2">
              {(posts ?? []).map((b) => (
                <button key={b.id} onClick={() => go({ kind: 'post', slug: b.slug })} className="w-full text-left p-3 rounded-xl mac-card hover:shadow-md transition-shadow">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-[#0A84FF]">{b.category}</p>
                  <p className="font-semibold">{b.title}</p>
                  {b.excerpt && <p className="mac-text-faint text-[12px] line-clamp-2">{b.excerpt}</p>}
                </button>
              ))}
            </div>
          </div>
        )}
        {page.kind === 'post' && <BlogReader slug={page.slug} />}
        {page.kind === 'project' && (project ? <ProjectReader project={project} /> : <p className="p-8 mac-text-faint">Loading…</p>)}
      </div>
    </div>
  );
}
