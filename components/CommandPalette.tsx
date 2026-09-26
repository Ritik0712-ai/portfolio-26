'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Search, Home, FolderKanban, BookOpen, Clock, Wrench, FileText, Github, Linkedin, Mail,
  MessageSquarePlus, Moon, Sun, Sparkles, CornerDownLeft, Briefcase, CornerUpRight, Code2,
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export const OPEN_PALETTE_EVENT = 'open-command-palette';
export const OPEN_ASK_EVENT = 'open-ask-ai';

interface Command {
  id: string;
  label: string;
  group: 'Navigate' | 'Projects' | 'Writing' | 'Actions';
  icon: React.ComponentType<{ className?: string }>;
  keywords?: string;
  run: () => void;
}

const EMAIL = 'ritikagarwal2468@gmail.com';

export default function CommandPalette() {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [projects, setProjects] = useState<{ title: string; slug: string }[]>([]);
  const [posts, setPosts] = useState<{ title: string; slug: string }[]>([]);
  const [askEnabled, setAskEnabled] = useState(false);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const loaded = useRef(false);

  const close = useCallback(() => {
    setOpen(false);
    setQuery('');
    setActive(0);
  }, []);

  // ⌘K / Ctrl+K anywhere; also opened by the nav button via a custom event.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener('keydown', onKey);
    window.addEventListener(OPEN_PALETTE_EVENT, onOpen);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener(OPEN_PALETTE_EVENT, onOpen);
    };
  }, []);

  // Load searchable content the first time the palette opens, not on page load.
  useEffect(() => {
    if (!open) return;
    setTimeout(() => inputRef.current?.focus(), 0);
    if (loaded.current) return;
    loaded.current = true;
    fetch('/api/projects').then((r) => r.json()).then((d) => setProjects(d.projects || [])).catch(() => {});
    fetch('/api/blogs').then((r) => r.json()).then((d) => setPosts(d.blogs || [])).catch(() => {});
    fetch('/api/ask').then((r) => r.json()).then((d) => setAskEnabled(!!d.enabled)).catch(() => {});
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const go = useCallback(
    (href: string) => () => {
      close();
      if (href.startsWith('http')) window.open(href, '_blank', 'noopener,noreferrer');
      else router.push(href);
    },
    [close, router]
  );

  const commands = useMemo<Command[]>(() => {
    const list: Command[] = [
      { id: 'home', label: 'Home', group: 'Navigate', icon: Home, run: go('/') },
      { id: 'projects', label: 'Projects', group: 'Navigate', icon: FolderKanban, keywords: 'work portfolio', run: go('/projects') },
      { id: 'experience', label: 'Experience & certifications', group: 'Navigate', icon: Briefcase, keywords: 'timeline internship aiesec certificate', run: go('/#experience') },
      { id: 'blog', label: 'Blog', group: 'Navigate', icon: BookOpen, keywords: 'writing posts notes', run: go('/blog') },
      { id: 'now', label: 'Now', group: 'Navigate', icon: Clock, keywords: 'currently doing', run: go('/now') },
      { id: 'uses', label: 'Uses', group: 'Navigate', icon: Wrench, keywords: 'setup tools gear stack', run: go('/uses') },
      { id: 'resume', label: 'Résumé', group: 'Navigate', icon: FileText, keywords: 'resume cv', run: go('/resume') },
      { id: 'contact', label: 'Contact', group: 'Navigate', icon: Mail, keywords: 'hire email message', run: go('/contact') },
      { id: 'testimonial', label: 'Leave a testimonial', group: 'Navigate', icon: MessageSquarePlus, keywords: 'feedback review', run: go('/feedback') },
    ];
    for (const p of projects) {
      list.push({ id: `p-${p.slug}`, label: p.title, group: 'Projects', icon: CornerUpRight, keywords: 'project case study', run: go(`/projects/${p.slug}`) });
    }
    for (const p of posts) {
      list.push({ id: `b-${p.slug}`, label: p.title, group: 'Writing', icon: CornerUpRight, keywords: 'blog post', run: go(`/blog/${p.slug}`) });
    }
    if (askEnabled) {
      list.push({
        id: 'ask', label: 'Ask AI about Ritik', group: 'Actions', icon: Sparkles, keywords: 'chat question assistant',
        run: () => { close(); window.dispatchEvent(new Event(OPEN_ASK_EVENT)); },
      });
    }
    list.push(
      {
        id: 'theme', label: theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode', group: 'Actions',
        icon: theme === 'dark' ? Sun : Moon, keywords: 'theme appearance', run: () => { toggleTheme(); close(); },
      },
      {
        id: 'copy-email', label: copied ? 'Copied!' : 'Copy email address', group: 'Actions', icon: Mail, keywords: EMAIL,
        run: () => {
          navigator.clipboard?.writeText(EMAIL).then(() => {
            setCopied(true);
            setTimeout(() => { setCopied(false); close(); }, 700);
          });
        },
      },
      { id: 'github', label: 'GitHub', group: 'Actions', icon: Github, run: go('https://github.com/Ritik0712-ai') },
      { id: 'linkedin', label: 'LinkedIn', group: 'Actions', icon: Linkedin, run: go('https://www.linkedin.com/in/ritik-agarwal-58ba012b4/') },
      { id: 'leetcode', label: 'LeetCode', group: 'Actions', icon: Code2, keywords: 'dsa problems', run: go('https://leetcode.com/u/Ritik812800/') },
    );
    return list;
  }, [projects, posts, askEnabled, theme, toggleTheme, copied, go, close]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    const terms = q.split(/\s+/);
    return commands.filter((c) => {
      const hay = `${c.label} ${c.keywords ?? ''} ${c.group}`.toLowerCase();
      return terms.every((t) => hay.includes(t));
    });
  }, [commands, query]);

  useEffect(() => setActive(0), [query]);

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  if (pathname?.startsWith('/admin')) return null;
  if (!open) return null;

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      filtered[active]?.run();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      close();
    }
  };

  let lastGroup = '';

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-[12vh]" role="dialog" aria-modal="true" aria-label="Command menu">
      <button aria-label="Close" className="absolute inset-0 bg-black/40 backdrop-blur-[2px] cursor-default" onClick={close} />
      <div className="relative w-full max-w-xl bg-surface border border-border rounded-lg shadow-2xl overflow-hidden palette-in">
        <div className="flex items-center gap-3 px-4 border-b border-border">
          <Search className="w-4 h-4 text-text-faint shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search pages, projects, posts…"
            className="flex-1 h-14 bg-transparent text-text-primary font-body text-sm placeholder:text-text-faint focus:outline-none"
            role="combobox"
            aria-expanded="true"
            aria-controls="command-list"
            aria-activedescendant={filtered[active] ? `cmd-${filtered[active].id}` : undefined}
          />
          <kbd className="hidden sm:inline text-[10px] font-mono text-text-faint border border-border rounded px-1.5 py-0.5">ESC</kbd>
        </div>

        <ul id="command-list" ref={listRef} role="listbox" className="max-h-[50vh] overflow-y-auto py-2">
          {filtered.length === 0 && (
            <li className="px-4 py-8 text-center text-sm text-text-muted font-body">No results for “{query}”</li>
          )}
          {filtered.map((c, i) => {
            const header = c.group !== lastGroup ? c.group : null;
            lastGroup = c.group;
            const Icon = c.icon;
            return (
              <li key={c.id} role="presentation">
                {header && (
                  <p className="px-4 pt-3 pb-1.5 text-[10px] font-mono text-text-faint uppercase tracking-widest">{header}</p>
                )}
                <button
                  id={`cmd-${c.id}`}
                  role="option"
                  aria-selected={i === active}
                  data-index={i}
                  onMouseMove={() => setActive(i)}
                  onClick={() => c.run()}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm font-body transition-colors ${
                    i === active ? 'bg-bg-secondary text-text-primary' : 'text-text-secondary'
                  }`}
                >
                  <Icon className="w-4 h-4 text-text-muted shrink-0" />
                  <span className="truncate">{c.label}</span>
                  {i === active && <CornerDownLeft className="w-3.5 h-3.5 ml-auto text-text-faint" />}
                </button>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-4 px-4 py-2.5 border-t border-border text-[10px] font-mono text-text-faint">
          <span>↑↓ navigate</span>
          <span>↵ open</span>
          <span className="ml-auto">⌘K to toggle</span>
        </div>
      </div>
    </div>
  );
}
