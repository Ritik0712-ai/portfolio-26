'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, GitCommitHorizontal, Code2, BookOpen, Sparkles } from 'lucide-react';
import { nowData } from '@/data/now';
import type { GitHubActivity, LeetCodeStats } from '@/lib/activity';

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

  useEffect(() => {
    fetch('/api/activity')
      .then((r) => r.json())
      .then((d) => {
        setGithub(d.github ?? null);
        setLeetcode(d.leetcode ?? null);
      })
      .catch(() => {})
      .finally(() => setActivityLoaded(true));
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
            <p className="text-xs font-mono text-text-faint uppercase tracking-[0.3em] mb-2">Right now</p>
            <h2 id="now-heading" className="text-3xl md:text-4xl font-display font-semibold text-text-primary">
              What I&apos;m up to
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
              <Sparkles className="w-3.5 h-3.5" /> Building
            </p>
            <p className="font-display text-2xl md:text-3xl text-text-primary leading-snug mb-6">
              {nowData.focus}
            </p>
            <ul className="mt-auto space-y-3">
              {nowData.currentlyBuilding.slice(0, 2).map((item) => (
                <li key={item} className="flex gap-3 text-sm text-text-secondary font-body leading-relaxed">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-xs text-text-faint font-mono mt-6">Updated {nowData.lastUpdated}</p>
          </div>

          {/* GitHub */}
          <a
            href={github?.latest?.url || github?.profileUrl || 'https://github.com/Ritik0712-ai'}
            target="_blank"
            rel="noopener noreferrer"
            className={`${cell} md:col-span-2 group hover:border-rule transition-colors reveal`}
          >
            <p className={label}>
              <GitCommitHorizontal className="w-3.5 h-3.5" /> Latest commit
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
                Everything I build is on GitHub — open my profile.
              </p>
            ) : (
              <div className="h-10 rounded bg-bg-secondary animate-pulse" />
            )}
            {github && (
              <div className="mt-auto pt-5">
                <div className="flex items-end gap-[3px] h-8" aria-label={`${github.pushesLast30Days} pushes over the last 30 days`} role="img">
                  {github.daily.map((n, i) => (
                    <span
                      key={i}
                      className={`flex-1 rounded-sm ${n ? 'bg-accent' : 'bg-bg-tertiary'}`}
                      style={{ height: `${n ? 25 + (n / maxDaily) * 75 : 12}%` }}
                    />
                  ))}
                </div>
                <p className="text-xs text-text-faint font-mono mt-2">
                  {github.pushesLast30Days} pushes · {github.activeDaysLast30} active days · last 30 days
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
            {leetcode && leetcode.solved > 0 ? (
              <>
                <p className="font-display text-4xl text-text-primary">{leetcode.solved}</p>
                <p className="text-xs text-text-muted font-body">problems solved</p>
                <div className="mt-auto pt-4 flex gap-3 text-xs font-mono">
                  <span className="text-success">E {leetcode.easy}</span>
                  <span className="text-warning">M {leetcode.medium}</span>
                  <span className="text-error">H {leetcode.hard}</span>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-text-primary font-body leading-relaxed">
                  Just started my DSA streak — follow along as the count goes up.
                </p>
                <p className="mt-auto pt-4 text-xs font-mono text-text-faint">@Ritik812800</p>
              </>
            )}
          </a>

          {/* Latest post */}
          {post ? (
            <Link href={`/blog/${post.slug}`} className={`${cell} group hover:border-rule transition-colors reveal`}>
              <p className={label}>
                <BookOpen className="w-3.5 h-3.5" /> Latest post
              </p>
              <p className="font-display text-lg text-text-primary leading-snug group-hover:text-accent transition-colors line-clamp-3">
                {post.title}
              </p>
              <p className="text-xs text-text-faint font-mono mt-auto pt-4">{timeAgo(post.created_at)}</p>
            </Link>
          ) : (
            <div className={`${cell} reveal`}>
              <p className={label}>
                <BookOpen className="w-3.5 h-3.5" /> Reading
              </p>
              <p className="text-sm text-text-primary font-body leading-relaxed">{nowData.currentlyReading[0]}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
