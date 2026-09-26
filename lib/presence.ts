'use client';

// Live visitors across RitikOS using Supabase Realtime Presence (free tier,
// no database writes). Each tab joins one shared channel with a random guest
// identity — no names, accounts or locations. Desktop editions also
// broadcast normalised cursor positions so visitors see each other move.

import { useEffect, useRef, useState } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface Guest {
  id: string;
  name: string;
  color: string;
  edition: string;
}
export interface Cursor extends Guest {
  x: number;
  y: number;
  t: number;
}

const ADJ = ['Curious', 'Swift', 'Quiet', 'Bright', 'Clever', 'Brave', 'Calm', 'Keen', 'Witty', 'Bold'];
const ANIMAL = ['Panda', 'Tiger', 'Falcon', 'Otter', 'Koala', 'Lynx', 'Heron', 'Fox', 'Dolphin', 'Yak'];
const COLORS = ['#FF6B6B', '#4ECDC4', '#FFD166', '#6C8CFF', '#B388EB', '#06D6A0', '#F78C6B', '#EF476F'];
const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];

const me: Guest = {
  id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2),
  name: `${pick(ADJ)} ${pick(ANIMAL)}`,
  color: pick(COLORS),
  edition: 'picker',
};

let channel: RealtimeChannel | null = null;
let joined = false;
let guests: Guest[] = [];
const cursors = new Map<string, Cursor>();
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function connect() {
  if (channel || typeof window === 'undefined') return;
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return;
  import('@/lib/supabase/client')
    .then(({ createClient }) => {
      const supabase = createClient();
      channel = supabase.channel('ritikos-presence', { config: { presence: { key: me.id }, broadcast: { self: false } } });
      channel
        .on('presence', { event: 'sync' }, () => {
          const state = channel!.presenceState<Guest>();
          guests = Object.values(state).map((metas) => metas[0] as unknown as Guest).filter(Boolean);
          const ids = new Set(guests.map((g) => g.id));
          cursors.forEach((_, id) => !ids.has(id) && cursors.delete(id));
          emit();
        })
        .on('broadcast', { event: 'cursor' }, ({ payload }) => {
          const c = payload as Cursor;
          if (!c?.id || c.id === me.id) return;
          cursors.set(c.id, { ...c, t: Date.now() });
          emit();
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            joined = true;
            channel!.track(me);
          }
        });
    })
    .catch(() => {});
}

function setEdition(edition: string) {
  if (me.edition === edition) return;
  me.edition = edition;
  if (joined) channel?.track(me);
}

let lastSent = 0;
function sendCursor(x: number, y: number) {
  const now = Date.now();
  if (!joined || now - lastSent < 60) return;
  lastSent = now;
  channel?.send({ type: 'broadcast', event: 'cursor', payload: { ...me, x, y } });
}

/** Everyone currently exploring RitikOS (including you). */
export function useLiveVisitors(edition?: string) {
  const [, force] = useState(0);
  useEffect(() => {
    const l = () => force((n) => n + 1);
    listeners.add(l);
    connect();
    return () => {
      listeners.delete(l);
    };
  }, []);
  useEffect(() => {
    if (edition) setEdition(edition);
  }, [edition]);
  const total = Math.max(guests.length, joined ? 1 : 0);
  return { total, guests, me, sameEdition: guests.filter((g) => g.edition === me.edition).length };
}

/** Other visitors' cursors in the same edition, fading out after 5s idle. */
export function useLiveCursors(edition: string, enabled = true) {
  useLiveVisitors(edition);
  const [, tick] = useState(0);
  const raf = useRef<number | null>(null);
  useEffect(() => {
    if (!enabled) return;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      sendCursor(e.clientX / window.innerWidth, e.clientY / window.innerHeight);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    const t = setInterval(() => tick((n) => n + 1), 1000);
    return () => {
      window.removeEventListener('pointermove', onMove);
      clearInterval(t);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [enabled]);
  const now = Date.now();
  return [...cursors.values()].filter((c) => c.edition === edition && now - c.t < 5000);
}
