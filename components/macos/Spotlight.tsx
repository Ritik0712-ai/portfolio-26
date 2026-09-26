'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, FileText, FolderOpen, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { AppIcon } from './icons';
import { APPS, LAUNCHPAD_APPS } from './registry';
import type { AppId } from './types';
import { useBlogs, useProjects } from '@/components/os/data';

interface Result {
  id: string;
  label: string;
  sub: string;
  group: 'Applications' | 'Projects' | 'Posts' | 'Ask';
  icon: React.ReactNode;
  run: () => void;
}

export default function Spotlight({ onClose, onApp, onProject, onPost, onAsk }: {
  onClose: () => void;
  onApp: (id: AppId) => void;
  onProject: (slug: string) => void;
  onPost: (slug: string) => void;
  onAsk?: (q: string) => void;
}) {
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: projects } = useProjects();
  const { data: posts } = useBlogs();

  useEffect(() => inputRef.current?.focus(), []);

  const results = useMemo<Result[]>(() => {
    const t = q.trim().toLowerCase();
    if (!t) return [];
    const match = (s: string) => s.toLowerCase().includes(t);
    const apps: Result[] = LAUNCHPAD_APPS.filter((id) => match(`${APPS[id].name} ${APPS[id].keywords ?? ''}`)).map((id) => ({
      id: `app-${id}`, label: APPS[id].name, sub: 'Application', group: 'Applications', icon: <AppIcon id={APPS[id].icon} size={22} />, run: () => onApp(id),
    }));
    const pr: Result[] = (projects ?? []).filter((p) => match(`${p.title} ${p.short_description ?? ''} ${(p.technologies ?? []).join(' ')}`)).map((p) => ({
      id: `p-${p.slug}`, label: p.title, sub: 'Case study', group: 'Projects', icon: <FolderOpen className="w-5 h-5 text-[#2E86EA]" />, run: () => onProject(p.slug),
    }));
    const po: Result[] = (posts ?? []).filter((b) => match(`${b.title} ${b.excerpt ?? ''}`)).map((b) => ({
      id: `b-${b.slug}`, label: b.title, sub: 'Blog post', group: 'Posts', icon: <FileText className="w-5 h-5 text-[#8E8E93]" />, run: () => onPost(b.slug),
    }));
    const ask: Result[] = onAsk ? [{ id: 'ask', label: `Ask AI: “${q.trim()}”`, sub: 'Answers from Ritik’s portfolio', group: 'Ask', icon: <Sparkles className="w-5 h-5 text-[#BF5AF2]" />, run: () => onAsk(q.trim()) }] : [];
    return [...apps, ...pr, ...po, ...ask];
  }, [q, projects, posts, onApp, onProject, onPost, onAsk]);

  useEffect(() => setActive(0), [q]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    else if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === 'Enter' && results[active]) { results[active].run(); onClose(); }
  };

  let last = '';
  return (
    <div className="fixed inset-0 z-[9500]" onMouseDown={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.12 }}
        onMouseDown={(e) => e.stopPropagation()}
        className="absolute left-1/2 top-[22%] -translate-x-1/2 w-[640px] max-w-[92vw] mac-menu overflow-hidden"
        role="dialog"
        aria-label="Spotlight search"
      >
        <div className="flex items-center gap-3 px-4 h-14">
          <Search className="w-5 h-5 mac-text-faint" />
          <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={onKey} placeholder="Spotlight Search" className="flex-1 bg-transparent outline-none text-[22px] font-light mac-text" aria-label="Spotlight search" />
        </div>
        {results.length > 0 && (
          <ul className="max-h-[360px] overflow-y-auto border-t mac-divider py-1.5">
            {results.map((r, i) => {
              const header = r.group !== last ? r.group : null;
              last = r.group;
              return (
                <li key={r.id}>
                  {header && <p className="px-4 pt-2 pb-1 text-[11px] font-semibold mac-text-faint">{header}</p>}
                  <button
                    onMouseEnter={() => setActive(i)}
                    onClick={() => { r.run(); onClose(); }}
                    className={`w-full flex items-center gap-3 px-4 py-1.5 text-left text-[13px] ${i === active ? 'bg-[#0A84FF] text-white' : 'mac-text'}`}
                  >
                    <span className="w-6 flex justify-center">{r.icon}</span>
                    <span className="truncate">{r.label}</span>
                    <span className={`ml-auto text-[11px] ${i === active ? 'text-white/80' : 'mac-text-faint'}`}>{r.sub}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </motion.div>
    </div>
  );
}
