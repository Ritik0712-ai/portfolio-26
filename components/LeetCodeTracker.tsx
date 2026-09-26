'use client';

import { useState } from 'react';
import { ArrowUpRight, Code2 } from 'lucide-react';
import type { LeetCodeStats } from '@/lib/activity';
import { useLivePoll } from '@/lib/useLivePoll';

// Kept in sync with LEETCODE_USERNAME in lib/activity.ts (server-only module).
const LEETCODE_USERNAME = 'Ritik812800';
const PROFILE_URL = `https://leetcode.com/u/${LEETCODE_USERNAME}/`;

const DIFFICULTIES = [
  { key: 'easy', label: 'Easy', text: 'text-success', bar: 'bg-success' },
  { key: 'medium', label: 'Medium', text: 'text-warning', bar: 'bg-warning' },
  { key: 'hard', label: 'Hard', text: 'text-error', bar: 'bg-error' },
] as const;

// Live LeetCode progress, refreshed every minute from /api/activity.
export default function LeetCodeTracker() {
  const [stats, setStats] = useState<LeetCodeStats | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  useLivePoll(() => {
    fetch('/api/activity')
      .then((r) => r.json())
      .then((d) => {
        setStats(d.leetcode ?? null);
        setUpdatedAt(new Date());
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  });

  const solved = stats?.solved ?? 0;

  return (
    <section aria-labelledby="leetcode-heading" className="mt-12">
      <div className="flex items-end justify-between gap-4 mb-4">
        <h2 id="leetcode-heading" className="flex items-center gap-2 text-xs font-mono text-text-faint uppercase tracking-[0.3em]">
          <Code2 className="w-4 h-4" /> LeetCode
        </h2>
        {updatedAt && (
          <span className="text-xs font-mono text-text-faint">
            live · updated {updatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>

      <div className="bg-surface border border-border rounded-lg p-6 grid md:grid-cols-[220px_1fr] gap-8 items-center">
        <div>
          {stats ? (
            <>
              <p className="font-display text-6xl font-semibold text-text-primary leading-none">{solved}</p>
              <p className="mt-2 text-sm text-text-muted font-body">{solved === 1 ? 'question' : 'questions'} solved</p>
            </>
          ) : (
            <p className="text-sm text-text-muted font-body">{loaded ? 'Live count unavailable right now.' : 'Loading…'}</p>
          )}
          <a
            href={PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 text-sm font-body font-medium rounded border border-border text-text-primary hover:border-rule hover:bg-surface-hover transition-colors"
          >
            View on LeetCode <ArrowUpRight className="w-4 h-4" />
          </a>
          <p className="mt-2 text-xs font-mono text-text-faint">@{LEETCODE_USERNAME}</p>
        </div>

        <div className="space-y-4">
          {DIFFICULTIES.map((d) => {
            const count = stats?.[d.key] ?? 0;
            const pct = solved > 0 ? Math.round((count / solved) * 100) : 0;
            return (
              <div key={d.key}>
                <div className="flex justify-between text-sm font-body mb-1.5">
                  <span className={d.text}>{d.label}</span>
                  <span className="text-text-primary font-mono">{count}</span>
                </div>
                <div className="h-2 rounded-full bg-bg-tertiary overflow-hidden">
                  <div className={`h-full rounded-full ${d.bar} transition-all duration-700`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
          {stats && solved === 0 && (
            <p className="text-sm text-text-muted font-body">Just getting started — this updates on its own as I solve problems.</p>
          )}
        </div>
      </div>
    </section>
  );
}
