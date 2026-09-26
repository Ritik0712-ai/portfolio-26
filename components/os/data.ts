'use client';

// Shared data layer for every RitikOS edition (Mac, iPhone, Windows, Android).
// Every hook reads the same public APIs as the classic site, so content edited
// in the admin panel shows up everywhere — live, without a reload.

import { useEffect, useState } from 'react';
import type { BlogPost, Certification, DsaProblem, Project, Stat, Testimonial } from '@/types';
import type { GitHubOverview } from '@/lib/github';
import type { GitHubActivity, LeetCodeStats } from '@/lib/activity';
import { useLivePoll } from '@/lib/useLivePoll';

export interface TimelineEvent {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
}

// ---------------------------------------------------------------------------
// Live content store. Every hook subscribes to an API URL; the store keeps the
// last good value (so reopening an app is instant) and refreshes it:
//   • instantly when Supabase Realtime reports a change to the backing table,
//   • every 30s while the tab is visible (catches unpublish/unapprove, which
//     Realtime can't deliver to anonymous visitors because of RLS),
//   • whenever the visitor comes back to the tab.
// Components only re-render when the JSON actually changed.
// ---------------------------------------------------------------------------

interface Entry {
  value: unknown;
  json: string | null;
  error: boolean;
  pick: (json: any) => unknown;
  listeners: Set<() => void>;
  inflight: Promise<void> | null;
}

const store = new Map<string, Entry>();

/** Which API URLs each table feeds. */
const TABLE_PREFIX: Record<string, string> = {
  projects: '/api/projects',
  blogs: '/api/blogs',
  timeline_events: '/api/timeline',
  certifications: '/api/certifications',
  testimonials: '/api/testimonials',
  stats: '/api/stats',
  dsa_problems: '/api/dsa',
};

function refresh(url: string) {
  const e = store.get(url);
  if (!e || e.inflight) return;
  e.inflight = fetch(url, { cache: 'no-store' })
    .then((r) => {
      if (!r.ok) throw new Error(String(r.status));
      return r.json();
    })
    .then((j) => {
      const v = e.pick(j);
      const json = JSON.stringify(v);
      if (json !== e.json || e.error) {
        e.value = v;
        e.json = json;
        e.error = false;
        e.listeners.forEach((l) => l());
      }
    })
    .catch(() => {
      if (e.json === null) {
        e.error = true;
        e.listeners.forEach((l) => l());
      }
    })
    .finally(() => {
      e.inflight = null;
    });
}

function refreshAll(prefix?: string) {
  store.forEach((e, url) => {
    if (e.listeners.size && (!prefix || url.startsWith(prefix))) refresh(url);
  });
}

let live = false;
function startLive() {
  if (live || typeof window === 'undefined') return;
  live = true;

  const onVisible = () => document.visibilityState === 'visible' && refreshAll();
  document.addEventListener('visibilitychange', onVisible);
  window.addEventListener('focus', onVisible);
  setInterval(() => document.visibilityState === 'visible' && refreshAll(), 30_000);

  // Realtime push — loaded lazily so the Supabase client isn't in the first paint.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return;
  import('@/lib/supabase/client')
    .then(({ createClient }) => {
      const supabase = createClient();
      const timers: Record<string, ReturnType<typeof setTimeout>> = {};
      let channel = supabase.channel('ritikos-live');
      for (const table of Object.keys(TABLE_PREFIX)) {
        channel = channel.on('postgres_changes', { event: '*', schema: 'public', table }, () => {
          // Debounce bursts (e.g. reordering several rows in the admin).
          clearTimeout(timers[table]);
          timers[table] = setTimeout(() => refreshAll(TABLE_PREFIX[table]), 400);
        });
      }
      channel.subscribe();
    })
    .catch(() => {
      /* polling still keeps things fresh */
    });
}

function useLive<T>(url: string | null, pick: (json: any) => T): { data: T | undefined; error: boolean } {
  const [, force] = useState(0);
  useEffect(() => {
    if (!url) return;
    let e = store.get(url);
    if (!e) {
      e = { value: undefined, json: null, error: false, pick, listeners: new Set(), inflight: null };
      store.set(url, e);
    }
    const l = () => force((n) => n + 1);
    e.listeners.add(l);
    refresh(url);
    startLive();
    return () => {
      e!.listeners.delete(l);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);
  const e = url ? store.get(url) : undefined;
  return { data: e?.value as T | undefined, error: e?.error ?? false };
}

export const useProjects = () => useLive<Project[]>('/api/projects', (j) => j.projects || []);
export const useTimeline = () => useLive<TimelineEvent[]>('/api/timeline', (j) => j.events || []);
export const useCertifications = () => useLive<Certification[]>('/api/certifications', (j) => j.certifications || []);
export const useBlogs = () => useLive<BlogPost[]>('/api/blogs', (j) => j.blogs || []);
export const useTestimonials = () => useLive<Testimonial[]>('/api/testimonials', (j) => j.testimonials || []);
export const useDsa = () => useLive<DsaProblem[]>('/api/dsa', (j) => j.problems || []);
export const useStats = () => useLive<Stat[]>('/api/stats', (j) => j.stats || []);
export const useBlog = (slug: string | null) =>
  useLive<BlogPost | null>(slug ? `/api/blogs?slug=${encodeURIComponent(slug)}` : null, (j) => j.blog ?? null);

/**
 * Which sections currently have something to show. A section is only true
 * once it has loaded with at least one item, so empty sections never appear
 * (and appear by themselves the moment the first item is published).
 */
export function useContent() {
  const projects = useProjects().data;
  const timeline = useTimeline().data;
  const certifications = useCertifications().data;
  const blogs = useBlogs().data;
  const testimonials = useTestimonials().data;
  const dsa = useDsa().data;
  return {
    dsa: !!dsa?.length,
    projects: !!projects?.length,
    experience: !!timeline?.length,
    certifications: !!certifications?.length,
    blog: !!blogs?.length,
    testimonials: !!testimonials?.length,
  };
}

/** Live GitHub overview — refreshed every minute while visible. */
export function useGitHub() {
  const [data, setData] = useState<GitHubOverview | null>(null);
  useLivePoll(() => {
    fetch('/api/github')
      .then((r) => r.json())
      .then((d) => !d.error && setData(d))
      .catch(() => {});
  });
  return data;
}

/** Live homepage activity (latest commit, 30-day bars, LeetCode). */
export function useActivity() {
  const [data, setData] = useState<{ github: GitHubActivity | null; leetcode: LeetCodeStats | null } | null>(null);
  useLivePoll(() => {
    fetch('/api/activity')
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => {});
  });
  return data;
}

export async function askAssistant(messages: { role: 'user' | 'assistant'; content: string }[]): Promise<string> {
  const res = await fetch('/api/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: messages.slice(-10) }),
  });
  const data = await res.json();
  if (!res.ok || !data.answer) throw new Error(data.error || 'The assistant is unavailable right now.');
  return data.answer as string;
}

export async function sendContact(payload: { name: string; email: string; message: string }) {
  const res = await fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error(d.error || 'Could not send the message.');
  }
}

export function useAskEnabled() {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    fetch('/api/ask').then((r) => r.json()).then((d) => setEnabled(!!d.enabled)).catch(() => {});
  }, []);
  return enabled;
}

export const PROFILE = {
  name: 'Ritik Agarwal',
  role: 'Full-Stack Developer',
  school: 'B.Tech CSE, VIT Bhopal',
  email: 'ritikagarwal2468@gmail.com',
  github: 'https://github.com/Ritik0712-ai',
  linkedin: 'https://www.linkedin.com/in/ritik-agarwal-58ba012b4/',
  leetcode: 'https://leetcode.com/u/Ritik812800/',
  site: 'https://www.ritikagarwal.me',
  photo: '/IMG-20260904-WA0065.jpg',
};

/** Photos available to the Photos app: portraits + project screenshots. */
export const PORTRAITS = ['/IMG-20260904-WA0065.jpg', '/profile.jpg', '/IMG-20260726-WA0016.jpg', '/IMG20260725125429.jpg', '/Snapchat-771821034.jpg'];

export function formatMonth(value: string) {
  return /^\d{4}-\d{2}/.test(value)
    ? new Date(value).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : value;
}

export function timeAgo(iso: string) {
  const s = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return 'just now';
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
