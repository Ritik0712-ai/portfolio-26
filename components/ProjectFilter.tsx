'use client';

import { useMemo } from 'react';
import type { Project } from '@/types';

// Collapse variants so one technology shows up as one chip:
// "Next.js 16" -> "Next.js", "React 19" -> "React", "Neon Postgres" -> "PostgreSQL".
const ALIASES: Record<string, string> = {
  'React.js': 'React',
  'Neon Postgres': 'PostgreSQL',
  Postgres: 'PostgreSQL',
};

export function normalizeTech(tech: string): string {
  const trimmed = tech.trim().replace(/\s+v?\d+(\.\d+)*$/, '');
  return ALIASES[trimmed] ?? trimmed;
}

export function projectHasTech(project: Project, category: string): boolean {
  return (project.technologies || []).some((t) => normalizeTech(t) === category);
}

interface ProjectFilterProps {
  projects: Project[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export default function ProjectFilter({ projects, activeCategory, onCategoryChange }: ProjectFilterProps) {
  // Only offer filters that actually narrow things down: a tech used by
  // a single project is noise as a filter chip.
  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    projects.forEach((p) => {
      new Set((p.technologies || []).map(normalizeTech)).forEach((t) =>
        counts.set(t, (counts.get(t) ?? 0) + 1)
      );
    });
    const shared = Array.from(counts.entries())
      .filter(([, n]) => n >= 2)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([t]) => t);
    return ['All', ...shared];
  }, [projects]);

  if (categories.length <= 2) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onCategoryChange(cat)}
          className={`px-3 py-1.5 text-sm font-body rounded transition-colors border ${
            cat === activeCategory
              ? 'border-accent text-accent bg-accent/5'
              : 'border-border text-text-muted hover:text-text-primary hover:border-rule'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
