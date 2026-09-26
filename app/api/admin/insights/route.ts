import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';

// Aggregates the anonymous page_events table for the admin Insights page.
// Volumes are small (a portfolio), so we aggregate in JS over the window.

interface Row {
  created_at: string;
  session_id: string;
  type: string;
  path: string;
  source: string | null;
  device: string | null;
  country: string | null;
  value: number | null;
  label: string | null;
}

const RETENTION_DAYS = 180;
const dayKey = (iso: string) => new Date(new Date(iso).getTime() + 5.5 * 3600_000).toISOString().slice(0, 10); // IST day

function top<K extends string>(m: Map<K, number>, n = 10) {
  return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(([label, count]) => ({ label, count }));
}

export async function GET(request: NextRequest) {
  const admin = await requireAdmin();
  if ('error' in admin) return admin.error;

  const days = Math.min(180, Math.max(1, Number(request.nextUrl.searchParams.get('days')) || 30));
  const since = new Date(Date.now() - days * 86400_000).toISOString();
  const supabase = await createClient();

  // Housekeeping: keep at most six months of events.
  await supabase.from('page_events').delete().lt('created_at', new Date(Date.now() - RETENTION_DAYS * 86400_000).toISOString());

  const rows: Row[] = [];
  for (let from = 0; from < 50_000; from += 1000) {
    const { data, error } = await supabase
      .from('page_events')
      .select('created_at,session_id,type,path,source,device,country,value,label')
      .gte('created_at', since)
      .order('created_at', { ascending: true })
      .range(from, from + 999);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    rows.push(...(data as Row[]));
    if (!data || data.length < 1000) break;
  }

  const [{ data: projects }, { data: blogs }] = await Promise.all([
    supabase.from('projects').select('slug,title'),
    supabase.from('blogs').select('slug,title'),
  ]);
  const projectTitle = new Map((projects ?? []).map((p) => [p.slug as string, p.title as string]));
  const postTitle = new Map((blogs ?? []).map((p) => [p.slug as string, p.title as string]));

  const views = rows.filter((r) => r.type === 'pageview');
  const sessions = new Map<string, { views: number; source: string; device: string; country: string; last: number }>();
  for (const r of rows) {
    const s = sessions.get(r.session_id);
    const t = new Date(r.created_at).getTime();
    if (!s) sessions.set(r.session_id, { views: r.type === 'pageview' ? 1 : 0, source: r.source || 'direct', device: r.device || 'desktop', country: r.country || '—', last: t });
    else {
      if (r.type === 'pageview') s.views += 1;
      s.last = Math.max(s.last, t);
    }
  }

  // Daily series
  const daily = new Map<string, { views: number; sessions: Set<string> }>();
  for (let i = days - 1; i >= 0; i--) daily.set(dayKey(new Date(Date.now() - i * 86400_000).toISOString()), { views: 0, sessions: new Set() });
  for (const v of views) {
    const d = daily.get(dayKey(v.created_at));
    if (d) {
      d.views += 1;
      d.sessions.add(v.session_id);
    }
  }

  // Scroll depth per path (max per session, then averaged)
  const depthBySessionPath = new Map<string, number>();
  for (const r of rows) {
    if (r.type !== 'scroll' || r.value == null) continue;
    const k = `${r.path}\u0000${r.session_id}`;
    depthBySessionPath.set(k, Math.max(depthBySessionPath.get(k) ?? 0, r.value));
  }
  const depth = new Map<string, { sum: number; n: number }>();
  depthBySessionPath.forEach((v, k) => {
    const path = k.split('\u0000')[0];
    const d = depth.get(path) ?? { sum: 0, n: 0 };
    d.sum += v;
    d.n += 1;
    depth.set(path, d);
  });
  const avgDepth = (path: string) => {
    const d = depth.get(path);
    return d && d.n ? Math.round(d.sum / d.n) : null;
  };

  // Pages
  const pageViews = new Map<string, number>();
  const pageSessions = new Map<string, Set<string>>();
  for (const v of views) {
    pageViews.set(v.path, (pageViews.get(v.path) ?? 0) + 1);
    if (!pageSessions.has(v.path)) pageSessions.set(v.path, new Set());
    pageSessions.get(v.path)!.add(v.session_id);
  }
  const pages = top(pageViews, 15).map((p) => ({ ...p, visitors: pageSessions.get(p.label)?.size ?? 0, depth: avgDepth(p.label) }));

  // Content: projects and posts, opened on the classic site or inside RitikOS
  const content = (prefix: string, eventType: string, titles: Map<string, string>) => {
    const m = new Map<string, { views: number; os: number; depth: number | null }>();
    for (const v of views) {
      if (!v.path.startsWith(prefix)) continue;
      const slug = v.path.slice(prefix.length).split('/')[0];
      if (!slug) continue;
      const e = m.get(slug) ?? { views: 0, os: 0, depth: avgDepth(`${prefix}${slug}`) };
      e.views += 1;
      m.set(slug, e);
    }
    for (const r of rows) {
      if (r.type !== eventType || !r.label) continue;
      const e = m.get(r.label) ?? { views: 0, os: 0, depth: avgDepth(`${prefix}${r.label}`) };
      e.os += 1;
      m.set(r.label, e);
    }
    return [...m.entries()]
      .map(([slug, e]) => ({ slug, title: titles.get(slug) ?? slug, ...e, total: e.views + e.os }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 12);
  };

  const count = (key: 'source' | 'device' | 'country') => {
    const m = new Map<string, number>();
    sessions.forEach((s) => m.set(s[key], (m.get(s[key]) ?? 0) + 1));
    return top(m, 12);
  };

  const editions = new Map<string, number>();
  rows.filter((r) => r.type === 'edition' && r.label).forEach((r) => editions.set(r.label!, (editions.get(r.label!) ?? 0) + 1));

  const sessionList = [...sessions.values()].filter((s) => s.views > 0);
  const now = Date.now();
  return NextResponse.json({
    days,
    totals: {
      pageviews: views.length,
      visitors: sessionList.length,
      pagesPerVisit: sessionList.length ? +(views.length / sessionList.length).toFixed(1) : 0,
      bounceRate: sessionList.length ? Math.round((sessionList.filter((s) => s.views === 1).length / sessionList.length) * 100) : 0,
      avgDepth: depthBySessionPath.size ? Math.round([...depthBySessionPath.values()].reduce((a, b) => a + b, 0) / depthBySessionPath.size) : null,
      activeNow: [...sessions.values()].filter((s) => now - s.last < 5 * 60_000).length,
    },
    daily: [...daily.entries()].map(([date, d]) => ({ date, count: d.views, visitors: d.sessions.size })),
    pages,
    projects: content('/projects/', 'project', projectTitle),
    posts: content('/blog/', 'post', postTitle),
    sources: count('source'),
    devices: count('device'),
    countries: count('country'),
    editions: top(editions),
  });
}
