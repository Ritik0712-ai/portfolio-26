'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Power, ChevronRight, ChevronLeft, Lock, Moon, RotateCcw, Laptop, Smartphone, Globe, Sparkles, LayoutGrid } from 'lucide-react';
import { WIN_APPS, PINNED, Fluent, FolderGlyph, type WinAppId } from './meta';
import { useBlogs, useProjects, PROFILE, timeAgo } from '@/components/os/data';

export type PowerAction = 'lock' | 'sleep' | 'restart' | 'shutdown' | 'mac' | 'android' | 'classic' | 'all';

interface Props {
  mode: 'start' | 'search';
  onClose: () => void;
  onApp: (id: WinAppId, params?: Record<string, string>) => void;
  onPower: (a: PowerAction) => void;
  onAsk?: (q: string) => void;
}

export default function StartMenu({ mode, onClose, onApp, onPower, onAsk }: Props) {
  const [q, setQ] = useState('');
  const [allApps, setAllApps] = useState(false);
  const [powerOpen, setPowerOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: projects } = useProjects();
  const { data: posts } = useBlogs();

  useEffect(() => {
    if (mode === 'search') inputRef.current?.focus();
  }, [mode]);

  const t = q.trim().toLowerCase();
  const results = useMemo(() => {
    if (!t) return null;
    const apps = (Object.keys(WIN_APPS) as WinAppId[]).filter((id) => `${WIN_APPS[id].name} ${WIN_APPS[id].blurb}`.toLowerCase().includes(t));
    const pr = (projects ?? []).filter((p) => `${p.title} ${p.short_description ?? ''} ${(p.technologies ?? []).join(' ')}`.toLowerCase().includes(t)).slice(0, 5);
    const po = (posts ?? []).filter((p) => `${p.title} ${p.excerpt ?? ''}`.toLowerCase().includes(t)).slice(0, 5);
    return { apps, pr, po };
  }, [t, projects, posts]);

  const recommended = useMemo(() => {
    const items = [
      ...(posts ?? []).map((p) => ({ key: `post-${p.id}`, title: p.title, when: p.created_at, kind: 'post' as const, slug: p.slug })),
      ...(projects ?? []).map((p) => ({ key: `proj-${p.id}`, title: p.title, when: p.updated_at || p.created_at, kind: 'project' as const, slug: p.slug })),
    ];
    return items.sort((a, b) => +new Date(b.when) - +new Date(a.when)).slice(0, 6);
  }, [posts, projects]);

  const openItem = (kind: 'post' | 'project', slug: string) => onApp('browser', kind === 'post' ? { post: slug } : { project: slug });

  const first = () => {
    if (!results) return;
    if (results.apps[0]) return onApp(results.apps[0]);
    if (results.pr[0]) return openItem('project', results.pr[0].slug);
    if (results.po[0]) return openItem('post', results.po[0].slug);
    if (onAsk) onAsk(q.trim());
  };

  return (
    <div className="fixed inset-x-0 bottom-[58px] z-[9100] flex justify-center pointer-events-none">
    <motion.div
      role="dialog"
      aria-label={mode === 'search' ? 'Search' : 'Start'}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      transition={{ type: 'spring', stiffness: 520, damping: 42 }}
      onPointerDown={(e) => e.stopPropagation()}
      className="pointer-events-auto w-[min(640px,calc(100vw-24px))] h-[min(700px,calc(100vh-80px))] rounded-lg win-acrylic win-text flex flex-col overflow-hidden"
    >
      <div className="px-8 pt-7 pb-4">
        <label className="flex items-center gap-3 h-9 px-3 rounded-full win-card border-b-2 !border-b-[var(--win-accent)]">
          <Search className="w-4 h-4 win-text-2" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') first(); if (e.key === 'Escape') onClose(); }}
            placeholder="Search for apps, projects and posts"
            aria-label="Search"
            className="flex-1 bg-transparent outline-none text-[13px] placeholder:win-text-2"
          />
        </label>
      </div>

      <div className="flex-1 overflow-y-auto win-scroll px-8 pb-4">
        {results ? (
          <SearchResults
            q={q.trim()}
            results={results}
            onApp={onApp}
            onItem={openItem}
            onAsk={onAsk}
          />
        ) : allApps ? (
          <>
            <Header title="All apps" action={<button onClick={() => setAllApps(false)} className="win-btn text-[12px] inline-flex items-center gap-1"><ChevronLeft className="w-3.5 h-3.5" /> Back</button>} />
            <ul className="space-y-0.5">
              {(Object.keys(WIN_APPS) as WinAppId[])
                .sort((a, b) => WIN_APPS[a].name.localeCompare(WIN_APPS[b].name))
                .map((id) => (
                  <li key={id}>
                    <button onClick={() => onApp(id)} className="w-full flex items-center gap-3 px-3 py-1.5 rounded-md win-hover text-left">
                      {WIN_APPS[id].icon(28)}
                      <span className="text-[13px]">{WIN_APPS[id].name}</span>
                      <span className="ml-auto text-[11px] win-text-2 truncate">{WIN_APPS[id].blurb}</span>
                    </button>
                  </li>
                ))}
            </ul>
          </>
        ) : (
          <>
            <Header title="Pinned" action={<button onClick={() => setAllApps(true)} className="win-btn text-[12px] inline-flex items-center gap-1">All apps <ChevronRight className="w-3.5 h-3.5" /></button>} />
            <div className="grid grid-cols-6 gap-y-1 mb-6">
              {PINNED.map((id) => (
                <button key={id} onClick={() => onApp(id)} className="flex flex-col items-center gap-1.5 py-3 rounded-md win-hover">
                  {WIN_APPS[id].icon(32)}
                  <span className="text-[12px] leading-tight text-center px-1 line-clamp-1">{WIN_APPS[id].name}</span>
                </button>
              ))}
            </div>
            <Header title="Recommended" />
            <div className="grid grid-cols-2 gap-1">
              {recommended.length === 0 && <p className="text-[12px] win-text-2 col-span-2 px-3">Loading recent work…</p>}
              {recommended.map((r) => (
                <button key={r.key} onClick={() => openItem(r.kind, r.slug)} className="flex items-center gap-3 px-3 py-2 rounded-md win-hover text-left min-w-0">
                  {r.kind === 'post' ? <Fluent name="document_48_color" size={30} /> : <FolderGlyph size={30} />}
                  <span className="min-w-0">
                    <span className="block text-[12px] truncate">{r.title}</span>
                    <span className="block text-[11px] win-text-2">{r.kind === 'post' ? 'Blog post' : 'Project'} · {timeAgo(r.when)}</span>
                  </span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Footer: account + power */}
      <div className="h-16 shrink-0 px-12 flex items-center justify-between border-t win-stroke bg-[var(--win-hover)] relative">
        <button onClick={() => onApp('about')} className="flex items-center gap-3 px-2 py-1.5 rounded-md win-hover">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={PROFILE.photo} alt="" className="w-8 h-8 rounded-full object-cover" />
          <span className="text-[12px]">{PROFILE.name}</span>
        </button>
        <button onClick={() => setPowerOpen((o) => !o)} aria-label="Power" aria-expanded={powerOpen} className="w-9 h-9 rounded-md win-hover flex items-center justify-center">
          <Power className="w-4 h-4" />
        </button>
        {powerOpen && (
          <div role="menu" className="absolute right-8 bottom-14 w-[250px] p-1 rounded-lg win-acrylic text-[13px]">
            {([
              ['lock', 'Lock', Lock],
              ['sleep', 'Sleep', Moon],
              ['restart', 'Restart', RotateCcw],
              ['shutdown', 'Shut down', Power],
            ] as const).map(([a, label, Icon]) => (
              <button key={a} role="menuitem" onClick={() => onPower(a)} className="w-full flex items-center gap-3 px-3 py-2 rounded-md win-hover text-left">
                <Icon className="w-4 h-4" /> {label}
              </button>
            ))}
            <div className="my-1 border-t win-stroke" />
            <p className="px-3 pt-1 pb-0.5 text-[11px] win-text-2">Switch RitikOS edition</p>
            {([
              ['mac', 'Mac edition', Laptop],
              ['android', 'Android edition', Smartphone],
              ['all', 'All editions', LayoutGrid],
              ['classic', 'Classic portfolio', Globe],
            ] as const).map(([a, label, Icon]) => (
              <button key={a} role="menuitem" onClick={() => onPower(a)} className="w-full flex items-center gap-3 px-3 py-2 rounded-md win-hover text-left">
                <Icon className="w-4 h-4" /> {label}
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
    </div>
  );
}

function Header({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-2 px-3">
      <p className="text-[14px] font-semibold">{title}</p>
      {action}
    </div>
  );
}

function SearchResults({
  q, results, onApp, onItem, onAsk,
}: {
  q: string;
  results: { apps: WinAppId[]; pr: { id: string; slug: string; title: string; short_description: string | null }[]; po: { id: string; slug: string; title: string; excerpt: string | null }[] };
  onApp: (id: WinAppId) => void;
  onItem: (kind: 'post' | 'project', slug: string) => void;
  onAsk?: (q: string) => void;
}) {
  const none = results.apps.length + results.pr.length + results.po.length === 0;
  const row = 'w-full flex items-center gap-3 px-3 py-2 rounded-md win-hover text-left';
  return (
    <div className="space-y-4">
      {results.apps.length > 0 && (
        <section>
          <p className="px-3 mb-1 text-[12px] font-semibold">Apps</p>
          {results.apps.map((id) => (
            <button key={id} className={row} onClick={() => onApp(id)}>
              {WIN_APPS[id].icon(28)}
              <span className="min-w-0"><span className="block text-[13px]">{WIN_APPS[id].name}</span><span className="block text-[11px] win-text-2 truncate">{WIN_APPS[id].blurb}</span></span>
            </button>
          ))}
        </section>
      )}
      {results.pr.length > 0 && (
        <section>
          <p className="px-3 mb-1 text-[12px] font-semibold">Projects</p>
          {results.pr.map((p) => (
            <button key={p.id} className={row} onClick={() => onItem('project', p.slug)}>
              <FolderGlyph size={28} />
              <span className="min-w-0"><span className="block text-[13px] truncate">{p.title}</span><span className="block text-[11px] win-text-2 truncate">{p.short_description}</span></span>
            </button>
          ))}
        </section>
      )}
      {results.po.length > 0 && (
        <section>
          <p className="px-3 mb-1 text-[12px] font-semibold">Blog</p>
          {results.po.map((p) => (
            <button key={p.id} className={row} onClick={() => onItem('post', p.slug)}>
              <Fluent name="document_48_color" size={28} />
              <span className="min-w-0"><span className="block text-[13px] truncate">{p.title}</span><span className="block text-[11px] win-text-2 truncate">{p.excerpt}</span></span>
            </button>
          ))}
        </section>
      )}
      {none && <p className="px-3 text-[13px] win-text-2">No matches for “{q}”.</p>}
      {onAsk && (
        <button className={`${row} win-card`} onClick={() => onAsk(q)}>
          <Sparkles className="w-5 h-5 win-accent" />
          <span className="text-[13px]">Ask Ritik’s assistant: “{q}”</span>
        </button>
      )}
    </div>
  );
}
