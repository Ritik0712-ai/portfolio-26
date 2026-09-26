'use client';

import { useEffect, useRef } from 'react';

// Calls `fn` now, then every `intervalMs` while the tab is visible, and again
// immediately when the visitor comes back to the tab. Keeps "live" widgets
// fresh without hammering the API from background tabs.
export function useLivePoll(fn: () => void, intervalMs = 60_000) {
  const saved = useRef(fn);
  saved.current = fn;

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    const start = () => {
      if (timer) return;
      timer = setInterval(() => saved.current(), intervalMs);
    };
    const stop = () => {
      if (timer) clearInterval(timer);
      timer = null;
    };
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        saved.current();
        start();
      } else {
        stop();
      }
    };

    saved.current();
    if (document.visibilityState === 'visible') start();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [intervalMs]);
}
