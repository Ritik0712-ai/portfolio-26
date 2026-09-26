'use client';

import { useEffect, useState } from 'react';
import { Star, GitFork, ExternalLink, Lock } from 'lucide-react';
import type { GitHubOverview } from '@/lib/github';
import { useLivePoll } from '@/lib/useLivePoll';

function timeAgo(iso: string, now: number) {
  const s = Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

const LEVEL_CLASS = ['bg-bg-tertiary', 'bg-accent/30', 'bg-accent/55', 'bg-accent/80', 'bg-accent'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function GitHubTracker() {
  const [data, setData] = useState<GitHubOverview | null>(null);
  const [error, setError] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useLivePoll(() => {
    fetch('/api/github')
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setData(d);
        setError(false);
      })
      .catch(() => setError((prev) => prev || !data));
  });

  // Ticks the "updated Xs ago" label.
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 15_000);
    return () => clearInterval(t);
  }, []);

  if (!data && !error) {
    return (
      <div className="space-y-6">
        <div className="h-40 rounded-lg bg-bg-secondary animate-pulse" />
        <div className="h-48 rounded-lg bg-bg-secondary animate-pulse" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12 text-text-muted font-body">
        GitHub is not responding right now.{' '}
        <a href="https://github.com/Ritik0712-ai" target="_blank" rel="noopener noreferrer" className="underline">
          View the profile directly
        </a>
        .
      </div>
    );
  }

  const stats = [
    { label: 'Repositories', value: data.repos.total },
    { label: 'Public', value: data.repos.public },
    ...(data.repos.private ? [{ label: 'Private', value: data.repos.private }] : []),
    ...(data.contributions ? [{ label: 'Contributions (1y)', value: data.contributions.totalLastYear }] : []),
    { label: 'Followers', value: data.profile.followers },
  ];

  // Month labels above the first week that starts in each month.
  const monthLabels = data.contributions?.weeks.map((week, i) => {
    const first = new Date(week[0]?.date);
    const prev = i > 0 ? new Date(data.contributions!.weeks[i - 1][0]?.date) : null;
    return !prev || first.getMonth() !== prev.getMonth() ? MONTHS[first.getMonth()] : '';
  });

  return (
    <div className="space-y-10">
      {/* Profile + live status */}
      <section className="bg-surface border border-border rounded-lg p-6">
        <div className="flex items-start gap-5">
          <a href={data.profile.url} target="_blank" rel="noopener noreferrer" className="shrink-0">
            <img src={data.profile.avatar} alt="" className="w-16 h-16 rounded-full border border-border" />
          </a>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <h2 className="text-2xl font-display font-semibold text-text-primary">
                {data.profile.name || 'Ritik Agarwal'}
              </h2>
              <span className="inline-flex items-center gap-1.5 text-xs font-mono text-text-faint">
                <span className="relative flex w-2 h-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-60 animate-ping" />
                  <span className="relative inline-flex w-2 h-2 rounded-full bg-success" />
                </span>
                Live · updated {timeAgo(data.fetchedAt, now)}
              </span>
            </div>
            {data.profile.bio && <p className="text-sm text-text-muted font-body mt-1">{data.profile.bio}</p>}
            <a
              href={data.profile.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-2 text-sm font-body text-text-secondary hover:text-text-primary transition-colors"
            >
              @{data.profile.login} <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        <dl className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-6 pt-6 border-t border-border">
          {stats.map((s) => (
            <div key={s.label}>
              <dd className="text-3xl font-display font-semibold text-text-primary">{s.value}</dd>
              <dt className="text-xs text-text-muted font-body mt-0.5">{s.label}</dt>
            </div>
          ))}
        </dl>
      </section>

      {/* Contribution graph */}
      {data.contributions && (
        <section>
          <div className="flex items-baseline justify-between mb-4">
            <h3 className="text-xs font-mono text-text-faint uppercase tracking-widest">Contributions — last 12 months</h3>
            <p className="text-sm font-body text-text-secondary">{data.contributions.totalLastYear} total</p>
          </div>
          <div className="bg-surface border border-border rounded-lg p-5 overflow-x-auto">
            <div className="inline-flex flex-col gap-1 min-w-full">
              <div className="flex gap-[3px] text-[10px] font-mono text-text-faint h-3">
                {monthLabels?.map((m, i) => (
                  <span key={i} className="w-[11px] shrink-0 overflow-visible whitespace-nowrap">{m}</span>
                ))}
              </div>
              <div className="flex gap-[3px]" role="img" aria-label={`${data.contributions.totalLastYear} contributions in the last year`}>
                {data.contributions.weeks.map((week, wi) => (
                  <div key={wi} className="flex flex-col gap-[3px]">
                    {week.map((day) => (
                      <span
                        key={day.date}
                        title={`${day.count} contribution${day.count === 1 ? '' : 's'} on ${new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
                        className={`w-[11px] h-[11px] rounded-[2px] ${LEVEL_CLASS[day.level]}`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-end gap-1.5 mt-3 text-[10px] font-mono text-text-faint">
              Less
              {LEVEL_CLASS.map((c) => (
                <span key={c} className={`w-[11px] h-[11px] rounded-[2px] ${c}`} />
              ))}
              More
            </div>
          </div>
        </section>
      )}

      {/* Recently active public repositories */}
      <section>
        <h3 className="text-xs font-mono text-text-faint uppercase tracking-widest mb-4">Recently active repositories</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {data.recentRepos.map((repo) => (
            <a
              key={repo.id}
              href={repo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-surface border border-border rounded-lg p-5 hover:border-rule transition-colors flex flex-col"
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <h4 className="font-mono text-sm text-text-primary group-hover:text-accent transition-colors truncate">
                  {repo.name}
                </h4>
                <ExternalLink className="w-3.5 h-3.5 text-text-faint shrink-0" />
              </div>
              <p className="text-sm text-text-muted font-body line-clamp-2 mb-4">
                {repo.description || 'No description'}
              </p>
              <div className="mt-auto flex items-center gap-4 text-xs font-body text-text-muted">
                {repo.language && (
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: repo.languageColor || 'var(--color-text-faint)' }} />
                    {repo.language}
                  </span>
                )}
                <span className="inline-flex items-center gap-1"><Star className="w-3 h-3" />{repo.stars}</span>
                <span className="inline-flex items-center gap-1"><GitFork className="w-3 h-3" />{repo.forks}</span>
                <span className="ml-auto text-text-faint">pushed {timeAgo(repo.pushedAt, now)}</span>
              </div>
            </a>
          ))}
        </div>
        {data.repos.private ? (
          <p className="mt-4 inline-flex items-center gap-1.5 text-xs text-text-faint font-body">
            <Lock className="w-3 h-3" /> {data.repos.private} private repositories are counted above but not listed.
          </p>
        ) : null}
      </section>
    </div>
  );
}
