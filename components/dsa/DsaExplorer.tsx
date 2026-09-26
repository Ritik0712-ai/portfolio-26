'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, Repeat, ArrowRight } from 'lucide-react';
import type { DsaProblem } from '@/types';
import { ROADMAP, topicOf } from '@/lib/dsa';
import { T, useLang } from '@/lib/i18n';

const DIFF = { Easy: 'text-success', Medium: 'text-warning', Hard: 'text-error' } as const;

export default function DsaExplorer({ problems }: { problems: DsaProblem[] }) {
  const { t } = useLang();
  const [q, setQ] = useState('');
  const [diff, setDiff] = useState<'' | 'Easy' | 'Medium' | 'Hard'>('');
  const [topic, setTopic] = useState('');

  const shown = useMemo(
    () =>
      problems.filter(
        (p) =>
          (!diff || p.difficulty === diff) &&
          (!topic || topicOf(p)?.id === topic) &&
          (!q.trim() || `${p.number ?? ''} ${p.title} ${p.topics.join(' ')}`.toLowerCase().includes(q.trim().toLowerCase())),
      ),
    [problems, q, diff, topic],
  );

  if (!problems.length) {
    return (
      <section className="border border-dashed border-rule rounded-lg p-8 text-center">
        <p className="font-display text-2xl text-text-primary mb-2"><T en="The first entries are on their way." hi="पहली एंट्रीज़ जल्द आ रही हैं।" /></p>
        <p className="text-sm text-text-muted font-body max-w-md mx-auto">
          <T
            en="I'm starting the journal alongside my daily practice — each solved problem will show up here with the approach and code."
            hi="रोज़ की प्रैक्टिस के साथ जर्नल शुरू कर रहा हूँ — हर हल किया गया सवाल अपने तरीक़े और कोड के साथ यहाँ दिखेगा।"
          />
        </p>
      </section>
    );
  }

  return (
    <section aria-labelledby="problems-heading">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-5">
        <h2 id="problems-heading" className="text-2xl font-display font-semibold text-text-primary">
          <T en="Problems" hi="सवाल" /> <span className="text-text-faint text-lg">({shown.length})</span>
        </h2>
        <div className="flex flex-wrap gap-2">
          <label className="flex items-center gap-2 px-3 py-1.5 border border-border rounded bg-surface text-sm">
            <Search className="w-4 h-4 text-text-faint" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('Search problems', 'सवाल खोजें')} aria-label={t('Search problems', 'सवाल खोजें')} className="bg-transparent outline-none w-40 text-text-primary" />
          </label>
          <select value={diff} onChange={(e) => setDiff(e.target.value as typeof diff)} aria-label={t('Difficulty', 'कठिनाई')} className="px-2 py-1.5 border border-border rounded bg-surface text-sm text-text-secondary">
            <option value="">{t('All levels', 'सभी स्तर')}</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
          <select value={topic} onChange={(e) => setTopic(e.target.value)} aria-label={t('Topic', 'टॉपिक')} className="px-2 py-1.5 border border-border rounded bg-surface text-sm text-text-secondary">
            <option value="">{t('All topics', 'सभी टॉपिक्स')}</option>
            {ROADMAP.map((r) => (
              <option key={r.id} value={r.id}>{t(r.label, r.hi)}</option>
            ))}
          </select>
        </div>
      </div>

      <ul className="divide-y divide-border border-y border-border">
        {shown.map((p) => (
          <li key={p.id}>
            <Link href={`/dsa/${p.slug}`} className="group grid sm:grid-cols-[1fr_auto] gap-2 py-4 items-center">
              <span className="min-w-0">
                <span className="flex items-center gap-2 flex-wrap">
                  {p.difficulty && <span className={`text-xs font-mono ${DIFF[p.difficulty]}`}>{p.difficulty}</span>}
                  <span className="text-text-primary font-body font-medium group-hover:text-accent transition-colors">
                    {p.number ? `${p.number}. ` : ''}{p.title}
                  </span>
                  {p.revisit && <Repeat className="w-3.5 h-3.5 text-warning" aria-label="Marked to revisit" />}
                </span>
                <span className="flex flex-wrap gap-1.5 mt-1.5">
                  {p.topics.slice(0, 4).map((tag) => (
                    <span key={tag} className="text-[11px] px-2 py-0.5 rounded bg-bg-secondary border border-border text-text-muted">{tag}</span>
                  ))}
                </span>
              </span>
              <span className="flex items-center gap-4 text-xs font-mono text-text-faint">
                {p.time_complexity && <span>T {p.time_complexity}</span>}
                {p.space_complexity && <span>S {p.space_complexity}</span>}
                <span>{new Date(p.solved_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {!shown.length && <p className="py-8 text-center text-sm text-text-muted"><T en="No problems match these filters." hi="इन फ़िल्टर्स से कोई सवाल नहीं मिला।" /></p>}
    </section>
  );
}
