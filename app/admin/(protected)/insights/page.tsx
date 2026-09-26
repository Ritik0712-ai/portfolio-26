'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Eye, Users, Layers, MousePointerClick, ScrollText, Radio, ShieldCheck, RefreshCw } from 'lucide-react';
import { ActivityBars } from '@/components/admin/ActivityCharts';

interface Item { label: string; count: number }
interface Page extends Item { visitors: number; depth: number | null }
interface Content { slug: string; title: string; views: number; os: number; depth: number | null; total: number }
interface Insights {
  days: number;
  totals: { pageviews: number; visitors: number; pagesPerVisit: number; bounceRate: number; avgDepth: number | null; activeNow: number };
  daily: { date: string; count: number; visitors: number }[];
  pages: Page[];
  projects: Content[];
  posts: Content[];
  sources: Item[];
  devices: Item[];
  countries: Item[];
  editions: Item[];
}

const SOURCE_LABEL: Record<string, string> = {
  direct: 'Direct / bookmarks',
  linkedin: 'LinkedIn',
  github: 'GitHub',
  google: 'Google',
  search: 'Other search engines',
  x: 'X / Twitter',
  instagram: 'Instagram',
  whatsapp: 'WhatsApp',
  leetcode: 'LeetCode',
  ai: 'AI assistants',
};

const flag = (cc: string) =>
  /^[A-Z]{2}$/.test(cc) ? String.fromCodePoint(...[...cc].map((c) => 0x1f1a5 + c.charCodeAt(0))) + ' ' + cc : 'Unknown';

export default function InsightsPage() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<Insights | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/insights?days=${days}`, { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load');
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    load();
    const t = setInterval(load, 60_000);
    return () => clearInterval(t);
  }, [load]);

  const t = data?.totals;

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary mb-6">
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </Link>
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-display font-semibold text-text-primary">Visitor insights</h1>
            <p className="text-sm text-text-muted mt-1 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Anonymous: no cookies, no IP addresses, nothing that identifies a person.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {[7, 30, 90].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-3 py-1.5 text-sm rounded border ${days === d ? 'bg-text-primary text-bg border-text-primary' : 'border-border text-text-muted hover:text-text-primary'}`}
              >
                {d} days
              </button>
            ))}
            <button onClick={load} aria-label="Refresh" className="p-2 rounded border border-border text-text-muted hover:text-text-primary">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {error && <p className="mb-6 p-3 rounded border border-error/30 bg-error/10 text-error text-sm">{error}</p>}

        {!data ? (
          <p className="text-text-muted py-20 text-center">Loading…</p>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
              {[
                { label: 'Visits', value: t!.visitors, icon: Users },
                { label: 'Page views', value: t!.pageviews, icon: Eye },
                { label: 'Pages / visit', value: t!.pagesPerVisit, icon: Layers },
                { label: 'Single-page visits', value: `${t!.bounceRate}%`, icon: MousePointerClick },
                { label: 'Avg. read depth', value: t!.avgDepth == null ? '—' : `${t!.avgDepth}%`, icon: ScrollText },
                { label: 'Active now', value: t!.activeNow, icon: Radio, live: true },
              ].map((c) => (
                <div key={c.label} className="bg-surface border border-border rounded-lg p-4">
                  <c.icon className={`w-4 h-4 mb-2 ${c.live && t!.activeNow ? 'text-success' : 'text-text-muted'}`} />
                  <p className="text-2xl font-display font-semibold text-text-primary tabular-nums">{c.value}</p>
                  <p className="text-xs text-text-muted mt-0.5">{c.label}</p>
                </div>
              ))}
            </div>

            <Card title="Page views per day" hint="Hover a bar for the date">
              <ActivityBars data={data.daily} />
            </Card>

            <div className="grid lg:grid-cols-2 gap-6 mt-6">
              <Card title="Where visitors come from" hint="First source of each visit">
                <Bars items={data.sources.map((s) => ({ ...s, label: SOURCE_LABEL[s.label] ?? s.label }))} empty="No visits yet" />
              </Card>
              <Card title="Projects people open" hint="Case-study pages + opens inside RitikOS">
                <ContentTable rows={data.projects} empty="No project views yet" />
              </Card>
              <Card title="Blog posts people read" hint="Read depth = how far down the page they scrolled">
                <ContentTable rows={data.posts} empty="No post views yet" />
              </Card>
              <Card title="Top pages">
                {data.pages.length === 0 ? (
                  <Empty text="No page views yet" />
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-text-muted text-left">
                        <th className="font-normal pb-2">Page</th>
                        <th className="font-normal pb-2 text-right">Views</th>
                        <th className="font-normal pb-2 text-right">Visitors</th>
                        <th className="font-normal pb-2 text-right">Read depth</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.pages.map((p) => (
                        <tr key={p.label} className="border-t border-border">
                          <td className="py-1.5 font-mono text-xs text-text-primary truncate max-w-[220px]">{p.label}</td>
                          <td className="py-1.5 text-right tabular-nums">{p.count}</td>
                          <td className="py-1.5 text-right tabular-nums text-text-muted">{p.visitors}</td>
                          <td className="py-1.5 text-right tabular-nums text-text-muted">{p.depth == null ? '—' : `${p.depth}%`}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </Card>
              <Card title="Devices">
                <Bars items={data.devices} empty="No visits yet" />
              </Card>
              <Card title="Countries">
                <Bars items={data.countries.map((c) => ({ ...c, label: flag(c.label) }))} empty="No visits yet" />
              </Card>
              <Card title="RitikOS editions opened">
                <Bars items={data.editions} empty="Nobody has opened Magic yet" />
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Card({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="bg-surface border border-border rounded-lg p-5">
      <div className="flex items-baseline justify-between gap-3 mb-4">
        <h2 className="font-display text-lg font-semibold text-text-primary">{title}</h2>
        {hint && <p className="text-xs text-text-faint">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="text-sm text-text-faint py-6 text-center">{text}</p>;
}

function Bars({ items, empty }: { items: Item[]; empty: string }) {
  if (!items.length) return <Empty text={empty} />;
  const max = Math.max(...items.map((i) => i.count));
  const total = items.reduce((a, b) => a + b.count, 0);
  return (
    <ul className="space-y-2">
      {items.map((i) => (
        <li key={i.label} className="text-sm">
          <div className="flex justify-between mb-1">
            <span className="text-text-primary capitalize">{i.label}</span>
            <span className="text-text-muted tabular-nums">
              {i.count} <span className="text-text-faint">· {Math.round((i.count / total) * 100)}%</span>
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-bg-secondary overflow-hidden">
            <div className="h-full rounded-full bg-accent" style={{ width: `${(i.count / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function ContentTable({ rows, empty }: { rows: Content[]; empty: string }) {
  if (!rows.length) return <Empty text={empty} />;
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-xs text-text-muted text-left">
          <th className="font-normal pb-2">Title</th>
          <th className="font-normal pb-2 text-right">Site</th>
          <th className="font-normal pb-2 text-right">RitikOS</th>
          <th className="font-normal pb-2 text-right">Read depth</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.slug} className="border-t border-border">
            <td className="py-1.5 text-text-primary truncate max-w-[220px]">{r.title}</td>
            <td className="py-1.5 text-right tabular-nums">{r.views}</td>
            <td className="py-1.5 text-right tabular-nums text-text-muted">{r.os}</td>
            <td className="py-1.5 text-right tabular-nums text-text-muted">{r.depth == null ? '—' : `${r.depth}%`}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
