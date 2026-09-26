'use client';

// Shared data layer for RitikOS (macOS + iOS). Every hook reads the same
// public APIs as the classic site, so content edited in the admin panel shows
// up everywhere. Responses are cached per page load so reopening an app is
// instant.

import { useEffect, useState } from 'react';
import type { BlogPost, Certification, Project } from '@/types';
import type { GitHubOverview } from '@/lib/github';
import type { GitHubActivity, LeetCodeStats } from '@/lib/activity';
import { useLivePoll } from '@/lib/useLivePoll';

export interface TimelineEvent {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
}

const cache = new Map<string, unknown>();
const inflight = new Map<string, Promise<unknown>>();

function load<T>(url: string, pick: (json: any) => T): Promise<T> {
  if (cache.has(url)) return Promise.resolve(cache.get(url) as T);
  if (!inflight.has(url)) {
    inflight.set(
      url,
      fetch(url)
        .then((r) => r.json())
        .then((j) => {
          const v = pick(j);
          cache.set(url, v);
          inflight.delete(url);
          return v;
        })
        .catch((e) => {
          inflight.delete(url);
          throw e;
        })
    );
  }
  return inflight.get(url) as Promise<T>;
}

function useCached<T>(url: string | null, pick: (json: any) => T): { data: T | undefined; error: boolean } {
  const [data, setData] = useState<T | undefined>(() => (url ? (cache.get(url) as T | undefined) : undefined));
  const [error, setError] = useState(false);
  useEffect(() => {
    if (!url) return;
    let alive = true;
    load(url, pick)
      .then((v) => alive && setData(v))
      .catch(() => alive && setError(true));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);
  return { data, error };
}

export const useProjects = () => useCached<Project[]>('/api/projects', (j) => j.projects || []);
export const useTimeline = () => useCached<TimelineEvent[]>('/api/timeline', (j) => j.events || []);
export const useCertifications = () => useCached<Certification[]>('/api/certifications', (j) => j.certifications || []);
export const useBlogs = () => useCached<BlogPost[]>('/api/blogs', (j) => j.blogs || []);
export const useBlog = (slug: string | null) =>
  useCached<BlogPost | null>(slug ? `/api/blogs?slug=${encodeURIComponent(slug)}` : null, (j) => j.blog ?? null);

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
