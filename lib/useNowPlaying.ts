'use client';

import { useState } from 'react';
import { useLivePoll } from './useLivePoll';
import type { NowPlaying } from './nowplaying';

const RECENT_MS = 30 * 86400_000;

/** Live "now playing" (polls every 30s while visible). null = nothing to show. */
export function useNowPlaying(): NowPlaying | null {
  const [track, setTrack] = useState<NowPlaying | null>(null);
  useLivePoll(() => {
    fetch('/api/now-playing')
      .then((r) => r.json())
      .then((d) => {
        const t: NowPlaying | null = d?.configured ? d.track : null;
        if (t && !t.isPlaying && t.playedAt && Date.now() - new Date(t.playedAt).getTime() > RECENT_MS) return setTrack(null);
        setTrack(t);
      })
      .catch(() => {});
  }, 30_000);
  return track;
}

export function ago(iso: string | null) {
  if (!iso) return '';
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}
