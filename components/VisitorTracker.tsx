'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { track } from '@/lib/track';

// Records one anonymous pageview per route and, when the visitor leaves the
// page, how far down they scrolled (0–100%). See lib/track.ts for privacy.
export default function VisitorTracker() {
  const pathname = usePathname();
  const maxDepth = useRef(0);
  const current = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname) return;
    const flush = () => {
      if (current.current && maxDepth.current > 0) track('scroll', { path: current.current, value: maxDepth.current });
      maxDepth.current = 0;
    };
    flush(); // previous page
    current.current = pathname;
    track('pageview', { path: pathname });

    const measure = () => {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      const depth = scrollable <= 0 ? 100 : Math.round((window.scrollY / scrollable) * 100);
      maxDepth.current = Math.max(maxDepth.current, Math.min(100, depth));
    };
    const onHide = () => document.visibilityState === 'hidden' && flush();
    const t = setTimeout(measure, 800);
    window.addEventListener('scroll', measure, { passive: true });
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('pagehide', flush);
    return () => {
      clearTimeout(t);
      window.removeEventListener('scroll', measure);
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('pagehide', flush);
    };
  }, [pathname]);

  return null;
}
