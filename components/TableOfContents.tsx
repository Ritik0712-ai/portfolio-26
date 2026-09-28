'use client';

import { useEffect, useState, useMemo } from 'react';
import { headingId, markdownHeadingText } from '@/lib/heading-id';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
  /** Post title — a leading "# Title" in the markdown is skipped so it isn't listed twice. */
  title?: string;
}

export default function TableOfContents({ content, title }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');

  // Picks up #, ## and ### headings (posts are written in different styles:
  // some use ## for sections, some use #), ignores anything inside code
  // blocks. # and ## are top-level entries, ### is indented under them.
  const headings = useMemo<TocItem[]>(() => {
    const raw: TocItem[] = [];
    let inFence = false;
    for (const line of content.split('\n')) {
      if (/^\s{0,3}(```|~~~)/.test(line)) {
        inFence = !inFence;
        continue;
      }
      if (inFence) continue;
      const match = line.match(/^\s{0,3}(#{1,3})\s+(.+)$/);
      if (!match) continue;
      const text = markdownHeadingText(match[2]);
      const id = headingId(text);
      if (!text || !id) continue;
      raw.push({ id, text, level: match[1].length });
    }
    const norm = (s: string) => headingId(markdownHeadingText(s));
    // Drop the post's own title (and a subtitle right under it) when the
    // markdown repeats it at the top.
    if (raw[0]?.level === 1 && title && norm(raw[0].text) === norm(title)) {
      raw.shift();
      if (raw[0] && raw[0].level > 1 && raw.slice(1).some((h) => h.level < raw[0].level)) raw.shift();
    }
    const seen = new Set<string>();
    return raw
      .filter((h) => (seen.has(h.id) ? false : (seen.add(h.id), true)))
      .map((h) => ({ ...h, level: h.level === 3 ? 3 : 2 }));
  }, [content, title]);

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter(e => e.isIntersecting);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0 }
    );

    headings.forEach(h => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 3) return null;

  return (
    <nav className="hidden xl:block w-56 shrink-0" aria-label="Table of contents">
      <p className="text-xs font-body text-text-faint uppercase tracking-widest mb-3">
        On this page
      </p>
      <ul className="space-y-1.5 border-l border-border">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              className={`block text-xs font-body transition-colors py-0.5 ${
                h.level === 3 ? 'pl-4' : 'pl-3'
              } ${
                activeId === h.id
                  ? 'text-accent font-medium'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
