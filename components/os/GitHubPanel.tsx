'use client';

import { useEffect, useState } from 'react';
import { Star, GitFork, ExternalLink, GitCommitHorizontal } from 'lucide-react';
import { useActivity, useGitHub, timeAgo } from './data';

// Live GitHub view shared by the macOS GitHub app and the iOS GitHub app.
const LEVEL = ['var(--mac-chip)', 'rgba(48,209,88,0.35)', 'rgba(48,209,88,0.55)', 'rgba(48,209,88,0.8)', '#30D158'];

export default function GitHubPanel({ compact = false }: { compact?: boolean }) {
  const gh = useGitHub();
  const activity = useActivity();
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setSlow(true), 8000);
    return () => clearTimeout(t);
  }, []);

  if (!gh) {
    return (
      <p className="p-6 mac-text-faint text-[13px]">
        {slow ? (
          <>GitHub isn&apos;t responding right now. <a className="text-[#0A84FF]" href="https://github.com/Ritik0712-ai" target="_blank" rel="noopener noreferrer">Open the profile ↗</a></>
        ) : (
          'Connecting to GitHub…'
        )}
      </p>
    );
  }

  const weeks = gh.contributions?.weeks ?? [];
  const shown = compact ? weeks.slice(-20) : weeks;
  const latest = activity?.github?.latest;
  const lc = activity?.leetcode;

  return (
    <div className="p-5 mac-text text-[13px] space-y-5">
      <div className="flex items-center gap-3">
        <img src={gh.profile.avatar} alt="" className="w-12 h-12 rounded-full" />
        <div className="min-w-0">
          <p className="font-semibold text-[15px]">{gh.profile.name ?? gh.profile.login}</p>
          <a href={gh.profile.url} target="_blank" rel="noopener noreferrer" className="text-[#0A84FF] text-[12px]">@{gh.profile.login}</a>
        </div>
        <span className="ml-auto inline-flex items-center gap-1.5 text-[11px] mac-text-faint">
          <span className="w-1.5 h-1.5 rounded-full bg-[#30D158] animate-pulse" /> Live
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          ['Repos', gh.repos.total],
          ['Contributions', gh.contributions?.totalLastYear ?? '—'],
          ['LeetCode', lc ? lc.solved : '—'],
        ].map(([k, v]) => (
          <div key={k as string} className="rounded-xl mac-card p-3">
            <p className="text-[22px] font-semibold leading-none">{v}</p>
            <p className="text-[11px] mac-text-faint mt-1">{k}</p>
          </div>
        ))}
      </div>

      {shown.length > 0 && (
        <div className="rounded-xl mac-card p-3 overflow-x-auto">
          <p className="text-[11px] font-semibold mac-text-faint mb-2">Contributions</p>
          <div className="flex gap-[3px]">
            {shown.map((w, i) => (
              <div key={i} className="flex flex-col gap-[3px]">
                {w.map((d) => (
                  <span key={d.date} title={`${d.count} on ${d.date}`} className="w-[10px] h-[10px] rounded-[2px]" style={{ background: LEVEL[d.level] }} />
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {latest && (
        <a href={latest.url ?? latest.repoUrl} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 rounded-xl mac-card p-3">
          <GitCommitHorizontal className="w-4 h-4 mt-0.5 text-[#0A84FF]" />
          <div className="min-w-0">
            <p className="font-mono text-[12px] truncate">{latest.message ?? 'Pushed new work'}</p>
            <p className="text-[11px] mac-text-faint">{latest.repo} · {timeAgo(latest.at)}</p>
          </div>
        </a>
      )}

      <div>
        <p className="text-[11px] font-semibold mac-text-faint mb-2">Recently active</p>
        <div className={compact ? 'space-y-2' : 'grid grid-cols-2 gap-2'}>
          {gh.recentRepos.map((r) => (
            <a key={r.id} href={r.url} target="_blank" rel="noopener noreferrer" className="block rounded-xl mac-card p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="font-mono text-[12px] truncate">{r.name}</p>
                <ExternalLink className="w-3 h-3 mac-text-faint shrink-0" />
              </div>
              <p className="text-[11px] mac-text-faint line-clamp-1 mt-0.5">{r.description ?? 'No description'}</p>
              <div className="flex items-center gap-3 text-[11px] mac-text-faint mt-1.5">
                {r.language && <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: r.languageColor ?? '#8e8e93' }} />{r.language}</span>}
                <span className="inline-flex items-center gap-0.5"><Star className="w-3 h-3" />{r.stars}</span>
                <span className="inline-flex items-center gap-0.5"><GitFork className="w-3 h-3" />{r.forks}</span>
                <span className="ml-auto">{timeAgo(r.pushedAt)}</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
