'use client';

// First-party, anonymous analytics. No cookies, no IP storage, no user ids:
// a random id that lives only for this browser tab (sessionStorage) lets us
// count sessions and scroll depth, and it is gone when the tab closes.
// Honours Do Not Track / Global Privacy Control and skips the admin panel.

export type TrackType = 'pageview' | 'scroll' | 'project' | 'post' | 'edition' | 'dsa';

function optedOut() {
  if (typeof window === 'undefined') return true;
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean; msDoNotTrack?: string };
  if (nav.doNotTrack === '1' || nav.msDoNotTrack === '1' || nav.globalPrivacyControl) return true;
  if (location.pathname.startsWith('/admin')) return true;
  if (/localhost|127\.0\.0\.1/.test(location.hostname) && !localStorage.getItem('track-local')) return true;
  return false;
}

function sessionId() {
  try {
    let id = sessionStorage.getItem('ra-sid');
    if (!id) {
      id = Math.random().toString(36).slice(2, 12) + Date.now().toString(36);
      sessionStorage.setItem('ra-sid', id);
    }
    return id;
  } catch {
    return 'nostorage' + Math.random().toString(36).slice(2, 10);
  }
}

/** Where the visit came from, bucketed so no full referrer URL is stored. */
export function trafficSource(): string {
  let source = 'direct';
  try {
    const utm = new URLSearchParams(location.search).get('utm_source') || new URLSearchParams(location.search).get('ref');
    if (utm) return utm.toLowerCase().slice(0, 40);
    const stored = sessionStorage.getItem('ra-src');
    if (stored) return stored;
    if (document.referrer) {
      const host = new URL(document.referrer).hostname.replace(/^www\./, '');
      if (host === location.hostname.replace(/^www\./, '')) return 'direct';
      if (/linkedin|lnkd\.in/.test(host)) source = 'linkedin';
      else if (/github/.test(host)) source = 'github';
      else if (/google\./.test(host)) source = 'google';
      else if (/bing\.|duckduckgo|yahoo\.|ecosia/.test(host)) source = 'search';
      else if (/(^|\.)(t\.co|twitter\.com|x\.com)$/.test(host)) source = 'x';
      else if (/instagram/.test(host)) source = 'instagram';
      else if (/whatsapp|wa\.me/.test(host)) source = 'whatsapp';
      else if (/leetcode/.test(host)) source = 'leetcode';
      else if (/chatgpt|openai|perplexity|claude\.ai|gemini/.test(host)) source = 'ai';
      else source = host.slice(0, 40);
    }
    sessionStorage.setItem('ra-src', source);
  } catch {
    /* ignore */
  }
  return source;
}

export function track(type: TrackType, opts: { path?: string; label?: string; value?: number } = {}) {
  if (optedOut()) return;
  const body = JSON.stringify({
    type,
    session_id: sessionId(),
    path: (opts.path ?? location.pathname).slice(0, 200),
    source: trafficSource(),
    label: opts.label?.slice(0, 120),
    value: opts.value,
  });
  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/track', new Blob([body], { type: 'application/json' }));
      return;
    }
  } catch {
    /* fall through */
  }
  fetch('/api/track', { method: 'POST', body, headers: { 'Content-Type': 'application/json' }, keepalive: true }).catch(() => {});
}
