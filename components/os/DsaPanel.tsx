'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChevronLeft, ExternalLink, Repeat } from 'lucide-react';
import { useDsa } from './data';
import { topicOf, roadmapProgress } from '@/lib/dsa';

const DIFF: Record<string, string> = { Easy: '#30A46C', Medium: '#E5A000', Hard: '#E5484D' };

// DSA journal inside every RitikOS edition (Finder, File Explorer, iPhone and
// Android apps). Colours come from the edition's --mac-* variables. Live.
export default function DsaPanel({ accent = '#0A84FF' }: { accent?: string }) {
  const { data } = useDsa();
  const [open, setOpen] = useState<string | null>(null);
  if (!data) return <p className="p-6 mac-text-faint text-[13px]">Loading…</p>;
  const p = data.find((x) => x.id === open);

  if (p) {
    return (
      <div className="p-5 mac-text text-[14px]">
        <button onClick={() => setOpen(null)} className="inline-flex items-center gap-1 text-[13px] mb-4" style={{ color: accent }}>
          <ChevronLeft className="w-4 h-4" /> DSA journal
        </button>
        <div className="flex flex-wrap items-center gap-2 mb-2 text-[12px]">
          {p.difficulty && <span className="font-semibold" style={{ color: DIFF[p.difficulty] }}>{p.difficulty}</span>}
          {topicOf(p) && <span className="mac-text-faint">· {topicOf(p)!.label}</span>}
          {p.revisit && <span className="inline-flex items-center gap-1 mac-text-faint"><Repeat className="w-3 h-3" /> revisit</span>}
        </div>
        <h2 className="text-[22px] font-bold leading-tight mb-3">{p.number ? `${p.number}. ` : ''}{p.title}</h2>
        {(p.time_complexity || p.space_complexity) && (
          <div className="flex gap-2 mb-4 font-mono text-[12px]">
            {p.time_complexity && <span className="px-2 py-1 rounded-md mac-chip">Time {p.time_complexity}</span>}
            {p.space_complexity && <span className="px-2 py-1 rounded-md mac-chip">Space {p.space_complexity}</span>}
          </div>
        )}
        {p.approach && (
          <div className="os-prose !text-[14px] mb-4">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{p.approach}</ReactMarkdown>
          </div>
        )}
        {p.code && <pre className="text-[12px] leading-relaxed p-3 rounded-lg bg-[#1e1e1e] text-[#e6e6e6] overflow-x-auto mb-4"><code>{p.code}</code></pre>}
        {p.notes && <p className="text-[13px] mac-text-muted whitespace-pre-line border-l-2 pl-3 mb-4" style={{ borderColor: accent }}>{p.notes}</p>}
        <div className="flex flex-wrap gap-3 text-[13px]">
          {p.url && <a href={p.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1" style={{ color: accent }}>Problem <ExternalLink className="w-3 h-3" /></a>}
          <a href={`/dsa/${p.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1" style={{ color: accent }}>Full page <ExternalLink className="w-3 h-3" /></a>
        </div>
      </div>
    );
  }

  const progress = roadmapProgress(data).topics.filter((t) => t.done > 0);
  return (
    <div className="p-5 mac-text text-[13px]">
      {progress.length > 0 && (
        <div className="grid grid-cols-2 gap-x-5 gap-y-2 mb-5">
          {progress.map((t) => (
            <div key={t.id}>
              <div className="flex justify-between text-[12px] mb-1"><span>{t.label}</span><span className="mac-text-faint tabular-nums">{Math.min(t.done, t.target)}/{t.target}</span></div>
              <div className="h-1 rounded-full mac-chip overflow-hidden"><div className="h-full rounded-full" style={{ width: `${Math.min(100, (t.done / t.target) * 100)}%`, background: accent }} /></div>
            </div>
          ))}
        </div>
      )}
      <ul className="rounded-xl mac-card overflow-hidden">
        {data.map((x, i) => (
          <li key={x.id} className={i ? 'border-t mac-divider' : ''}>
            <button onClick={() => setOpen(x.id)} className="w-full flex items-center gap-3 px-3 py-2.5 text-left mac-hover">
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: x.difficulty ? DIFF[x.difficulty] : 'currentColor' }} />
              <span className="min-w-0 flex-1">
                <span className="block font-medium truncate">{x.number ? `${x.number}. ` : ''}{x.title}</span>
                <span className="block text-[11px] mac-text-faint truncate">{topicOf(x)?.label ?? x.topics.join(', ')}</span>
              </span>
              {x.time_complexity && <span className="font-mono text-[11px] mac-text-faint">{x.time_complexity}</span>}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
