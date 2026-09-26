'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, GitCommitHorizontal, Code2, BookOpen, Sparkles } from 'lucide-react';
import { nowData, nowDataHi } from '@/data/now';
import { T } from '@/lib/i18n';
import NowPlaying from '@/components/NowPlaying';
import type { GitHubActivity, LeetCodeStats } from '@/lib/activity';
import { useLivePoll } from '@/lib/useLivePoll';

interface LatestPost {
  title: string;
  slug: string;
  excerpt: string | null;
  created_at: string;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 60) return `${Math.max(mins, 1)}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const cell = 'bg-surface border border-border rounded-lg p-5 md:p-6 flex flex-col';
const label = 'flex items-center gap-2 text-xs font-mono text-text-faint uppercase tracking-widest mb-4';

export default function NowBento() {
  const [github, setGithub] = useState<GitHubActivity | null>(null);
  const [leetcode, setLeetcode] = useState<LeetCodeStats | null>(null);
  const [post, setPost] = useState<LatestPost | null>(null);
  const [activityLoaded, setActivityLoaded] = useState(false);

  // GitHub + LeetCode refresh every minute while the tab is open.
  useLivePoll(() => {
    fetch('/api/activity')
      .then((r) => r.json())
      .then((d) => {
        if (d.github) setGithub(d.github);
        if (d.leetcode) setLeetcode(d.leetcode);
      })
      .catch(() => {})
      .finally(() => setActivityLoaded(true));
  });

  useEffect(() => {
    fetch('/api/blogs?limit=1')
      .then((r) => r.json())
      .then((d) => setPost((d.blogs || d.posts || [])[0] ?? null))
      .catch(() => {});
  }, []);

  const maxDaily = Math.max(1, ...(github?.daily ?? [0]));
  const leetcodeUrl = leetcode?.profileUrl ?? 'https://leetcode.com/u/Ritik812800/';

  return (
    <section id="now" aria-labelledby="now-heading" className="pb-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-xs font-mono text-text-faint uppercase tracking-[0.3em] mb-2"><T en="Right now" hi="अभी" /></p>
            <h2 id="now-heading" className="text-3xl md:text-4xl font-display font-semibold text-text-primary">
              <T en="What I'm up to" hi="आजकल क्या कर रहा हूँ" />
            </h2>
          </div>
          <Link href="/now" className="hidden sm:inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-primary font-body transition-colors">
            /now <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid md:grid-cols-4 gap-4 md:auto-rows-[minmax(180px,auto)]">
          {/* Building — large */}
          <div className={`${cell} md:col-span-2 md:row-span-2 reveal`}>
            <p className={label}>
              <Sparkles className="w-3.5 h-3.5" /> <T en="Building" hi="बना रहा हूँ" />
            </p>
            <p className="font-display text-2xl md:text-3xl text-text-primary leading-snug mb-6">
              <T en={nowData.focus} hi={nowDataHi.focus} />
            </p>
            <ul className="mt-auto space-y-3">
              {nowData.currentlyBuilding.slice(0, 2).map((item, i) => (
                <li key={item} className="flex gap-3 text-sm text-text-secondary font-body leading-relaxed">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                  <span><T en={item} hi={nowDataHi.currentlyBuilding[i] ?? item} /></span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-text-faint font-mono mt-6"><T en={`Updated ${nowData.lastUpdated}`} hi={`अपडेट: ${nowDataHi.lastUpdated}`} /></p>
          </div>

          {/* GitHub */}
          <a
            href={github?.latest?.url || github?.profileUrl || 'https://github.com/Ritik0712-ai'}
            target="_blank"
            rel="noopener noreferrer"
            className={`${cell} md:col-span-2 group hover:border-rule transition-colors reveal`}
          >
            <p className={label}>
              <GitCommitHorizontal className="w-3.5 h-3.5" /> <T en="Latest commit" hi="ताज़ा कमिट" />
              <ArrowUpRight className="w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </p>
            {github?.latest ? (
              <>
                <p className="text-sm text-text-primary font-mono leading-relaxed line-clamp-2">
                  {github.latest.message ?? 'Pushed new work'}
                </p>
                <p className="text-xs text-text-muted font-body mt-1.5">
                  {github.latest.repo} · {timeAgo(github.latest.at)}
                </p>
              </>
            ) : activityLoaded ? (
              <p className="text-sm text-text-secondary font-body">
                <T en="Everything I build is on GitHub — open my profile." hi="मैं जो भी बनाता हूँ, GitHub पर है — प्रोफ़ाइल खोलें।" />
              </p>
            ) : (
              <div className="h-10 rounded bg-bg-secondary animate-pulse" />
            )}
            {github && (
              <div className="mt-auto pt-5">
                <div className="flex items-end gap-[3px] h-8" aria-label={`${github.pushesLast30Days} ${github.unit} over the last 30 days`} role="img">
                  {github.daily.map((n, i) => (
                    <span
                      key={i}
                      className={`flex-1 rounded-sm ${n ? 'bg-accent' : 'bg-bg-tertiary'}`}
                      style={{ height: `${n ? 25 + (n / maxDaily) * 75 : 12}%` }}
                    />
                  ))}
                </div>
                <p className="text-xs text-text-faint font-mono mt-2">
                  {github.pushesLast30Days} {github.unit} · {github.activeDaysLast30} active days · last 30 days
                </p>
              </div>
            )}
          </a>

          {/* LeetCode — live from the public profile, so it updates on its own */}
          <a href={leetcodeUrl} target="_blank" rel="noopener noreferrer" className={`${cell} group hover:border-rule transition-colors reveal`}>
            <p className={label}>
              <Code2 className="w-3.5 h-3.5" /> LeetCode
              <ArrowUpRight className="w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </p>
            {leetcode ? (
              <>
                <p className="font-display text-4xl text-text-primary">{leetcode.solved}</p>
                <p className="text-xs text-text-muted font-body"><T en={`${leetcode.solved === 1 ? 'question' : 'questions'} solved`} hi="सवाल हल किए" /></p>
                <div className="mt-auto pt-4 flex gap-3 text-xs font-mono">
                  <span className="text-success">E {leetcode.easy}</span>
                  <span className="text-warning">M {leetcode.medium}</span>
                  <span className="text-error">H {leetcode.hard}</span>
                </div>
                <p className="pt-2 text-xs font-mono text-text-muted group-hover:text-text-primary transition-colors"><T en="View on LeetCode →" hi="LeetCode पर देखें →" /></p>
              </>
            ) : (
              <>
                <p className="text-sm text-text-primary font-body leading-relaxed">
                  {activityLoaded ? <T en="Live count unavailable right now." hi="लाइव गिनती अभी उपलब्ध नहीं है।" /> : <T en="Loading…" hi="लोड हो रहा है…" />}
                </p>
                <p className="mt-auto pt-4 text-xs font-mono text-text-muted group-hover:text-text-primary transition-colors"><T en="View on LeetCode →" hi="LeetCode पर देखें →" /></p>
              </>
            )}
          </a>

          {/* Latest post */}
          {post ? (
            <Link href={`/blog/${post.slug}`} className={`${cell} group hover:border-rule transition-colors reveal`}>
              <p className={label}>
                <BookOpen className="w-3.5 h-3.5" /> <T en="Latest post" hi="ताज़ा पोस्ट" />
              </p>
              <p className="font-display text-lg text-text-primary leading-snug group-hover:text-accent transition-colors line-clamp-3">
                {post.title}
              </p>
              <p className="text-xs text-text-faint font-mono mt-auto pt-4">{timeAgo(post.created_at)}</p>
            </Link>
          ) : (
            <div className={`${cell} reveal`}>
              <p className={label}>
                <BookOpen className="w-3.5 h-3.5" /> <T en="Reading" hi="पढ़ रहा हूँ" />
              </p>
              <p className="text-sm text-text-primary font-body leading-relaxed"><T en={nowData.currentlyReading[0]} hi={nowDataHi.currentlyReading[0]} /></p>
            </div>
          )}

          {/* Spotify — only when configured and something played recently */}
          <NowPlaying className="md:col-span-4" />
        </div>
      </div>
    </section>
  );
}
