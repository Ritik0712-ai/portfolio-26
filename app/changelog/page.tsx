import type { Metadata } from 'next';
import Link from 'next/link';
import { Sparkles, Wrench, Bug, FileText, GitCommitHorizontal, ArrowUpRight } from 'lucide-react';
import { pageMetadata } from '@/lib/metadata';
import { getChangelog, CHANGELOG_REPO, type ChangeKind } from '@/lib/changelog';
import { T } from '@/lib/i18n';

export const metadata: Metadata = pageMetadata({
  title: "What's new",
  description: 'Everything that has changed on this site, straight from its commit history.',
  path: '/changelog',
});

export const revalidate = 3600;

const KIND: Record<ChangeKind, { en: string; hi: string; icon: typeof Sparkles; cls: string }> = {
  new: { en: 'New', hi: 'नया', icon: Sparkles, cls: 'text-accent border-accent/30 bg-accent/10' },
  improved: { en: 'Improved', hi: 'बेहतर', icon: Wrench, cls: 'text-accent-warm border-accent-warm/30 bg-accent-warm/10' },
  fixed: { en: 'Fixed', hi: 'ठीक किया', icon: Bug, cls: 'text-success border-success/30 bg-success/10' },
  content: { en: 'Content', hi: 'कंटेंट', icon: FileText, cls: 'text-text-muted border-border bg-bg-secondary' },
};

const monthLabel = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' });
const dayLabel = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' });

export default async function ChangelogPage() {
  const log = await getChangelog();

  const months = new Map<string, NonNullable<typeof log>['changes']>();
  for (const c of log?.changes ?? []) {
    const k = monthLabel(c.date);
    if (!months.has(k)) months.set(k, []);
    months.get(k)!.push(c);
  }

  return (
    <main id="main-content" className="min-h-screen pt-28 pb-20 px-4">
      <div className="max-w-3xl mx-auto">
        <header className="mb-12">
          <p className="text-xs font-mono text-text-faint uppercase tracking-[0.3em] mb-2">/changelog</p>
          <h1 className="text-4xl md:text-5xl font-display font-semibold text-text-primary mb-4">
            <T en="What's new" hi="नया क्या है" />
          </h1>
          <p className="text-text-secondary font-body leading-relaxed max-w-xl">
            <T
              en="This site is a living project. Every change below comes straight from its Git history, updated automatically."
              hi="यह साइट लगातार बनती रहती है। नीचे का हर बदलाव सीधे इसकी Git हिस्ट्री से आता है, अपने आप अपडेट होकर।"
            />
          </p>
        </header>

        {!log ? (
          <p className="text-text-muted font-body">
            <T en="The changelog can't be loaded right now — try again in a bit." hi="चेंजलॉग अभी लोड नहीं हो पा रहा — थोड़ी देर बाद कोशिश करें।" />
          </p>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3 mb-14">
              {[
                { v: log.last30, en: 'changes in 30 days', hi: 'बदलाव, पिछले 30 दिनों में' },
                { v: log.activeDays30, en: 'days shipped in 30', hi: 'दिन जिनमें कुछ शिप हुआ' },
                { v: log.weekStreak, en: log.weekStreak === 1 ? 'week streak' : 'weeks in a row', hi: 'हफ़्ते लगातार' },
              ].map((s) => (
                <div key={s.en} className="bg-surface border border-border rounded-lg p-4">
                  <p className="text-3xl font-display font-semibold text-text-primary tabular-nums">{s.v}</p>
                  <p className="text-xs text-text-muted font-body mt-1"><T en={s.en} hi={s.hi} /></p>
                </div>
              ))}
            </div>

            <div className="space-y-14">
              {[...months.entries()].map(([month, items]) => (
                <section key={month}>
                  <h2 className="text-xs font-mono text-text-faint uppercase tracking-widest mb-6 sticky top-16 bg-bg/90 backdrop-blur-sm py-2 z-10">{month}</h2>
                  <ol className="relative border-l border-border ml-1.5 space-y-7">
                    {items.map((c) => {
                      const k = KIND[c.kind];
                      return (
                        <li key={c.sha} className="pl-6 relative">
                          <span className="absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full bg-bg border-2 border-rule" />
                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            <span className={`inline-flex items-center gap-1 text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border ${k.cls}`}>
                              <k.icon className="w-3 h-3" /> <T en={k.en} hi={k.hi} />
                            </span>
                            <time dateTime={c.date} className="text-xs text-text-faint font-mono">{dayLabel(c.date)}</time>
                          </div>
                          <p className="text-text-primary font-body font-medium leading-snug">{c.title}</p>
                          {c.details.length > 0 && (
                            <ul className="mt-2 space-y-1 text-sm text-text-muted font-body list-disc pl-5">
                              {c.details.map((d) => (
                                <li key={d}>{d}</li>
                              ))}
                            </ul>
                          )}
                          {c.url && (
                            <a href={c.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-mono text-text-faint hover:text-text-primary">
                              <GitCommitHorizontal className="w-3.5 h-3.5" /> {c.sha}
                            </a>
                          )}
                        </li>
                      );
                    })}
                  </ol>
                </section>
              ))}
            </div>

            <p className="mt-16 text-sm text-text-muted font-body">
              {log.repoPublic ? (
                <a href={`https://github.com/${CHANGELOG_REPO}/commits`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-text-primary">
                  <T en="Full history on GitHub" hi="पूरी हिस्ट्री GitHub पर" /> <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              ) : (
                <Link href="/github" className="hover:text-text-primary"><T en="See my GitHub activity →" hi="मेरी GitHub गतिविधि देखें →" /></Link>
              )}
            </p>
          </>
        )}
      </div>
    </main>
  );
}
