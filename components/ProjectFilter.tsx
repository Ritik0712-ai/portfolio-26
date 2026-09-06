'use client';

import { useMemo } from 'react';
import type { Project } from '@/types';

interface ProjectFilterProps {
  projects: Project[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export default function ProjectFilter({ projects, activeCategory, onCategoryChange }: ProjectFilterProps) {
  const categories = useMemo(() => {
    const cats = new Set<string>();
    projects.forEach(p => {
      (p.technologies || []).forEach(t => cats.add(t));
    });
    return ['All', ...Array.from(cats).sort()];
  }, [projects]);

  const handleFilter = (category: string) => {
    onCategoryChange(category);
  };

  return (
    <div className="flex flex-wrap gap-2 mb-8">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => handleFilter(cat)}
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
