import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/metadata';
import { getDsaProblems } from '@/lib/public-data';
import { getLeetCodeStats } from '@/lib/activity';
import { roadmapProgress, dayStreak } from '@/lib/dsa';
import { T } from '@/lib/i18n';
import DsaExplorer from '@/components/dsa/DsaExplorer';

export const metadata: Metadata = pageMetadata({
  title: 'DSA journal',
  description: 'Every data-structures and algorithms problem I solve — my approach, complexity and code — plus progress across the core interview topics.',
  path: '/dsa',
});

export const revalidate = 60;

export default async function DsaPage() {
  const [problems, leetcode] = await Promise.all([getDsaProblems(), getLeetCodeStats()]);
  const progress = roadmapProgress(problems);
  const streak = dayStreak(problems);
  const covered = progress.topics.filter((t) => t.done > 0).length;

  // Last 16 weeks of solves for the activity strip.
  const perDay = new Map<string, number>();
  for (const p of problems) perDay.set(p.solved_at, (perDay.get(p.solved_at) ?? 0) + 1);
  const days: { date: string; n: number }[] = [];
  const todayIst = new Date(Date.now() + 5.5 * 3600_000);
  for (let i = 16 * 7 - 1; i >= 0; i--) {
    const d = new Date(todayIst.getTime() - i * 86400_000).toISOString().slice(0, 10);
    days.push({ date: d, n: perDay.get(d) ?? 0 });
  }

  return (
    <main id="main-content" className="min-h-screen pt-28 pb-20 px-4">
      <div className="max-w-5xl mx-auto">
        <header className="mb-12 max-w-2xl">
          <p className="text-xs font-mono text-text-faint uppercase tracking-[0.3em] mb-2">/dsa</p>
          <h1 className="text-4xl md:text-5xl font-display font-semibold text-text-primary mb-4">
            <T en="DSA journal" hi="DSA जर्नल" />
          </h1>
          <p className="text-text-secondary font-body leading-relaxed">
            <T
              en="Data structures and algorithms are my main focus this semester. Every problem I solve lands here with my approach, its complexity and the code — my revision notes, in public."
              hi="इस सेमेस्टर मेरा मुख्य फ़ोकस डेटा स्ट्रक्चर्स और एल्गोरिदम है। मैं जो भी सवाल हल करता हूँ, वह यहाँ मेरे तरीक़े, कॉम्प्लेक्सिटी और कोड के साथ आता है — सबके सामने मेरे रिवीज़न नोट्स।"
            />
          </p>
        </header>

        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {[
            { v: leetcode ? leetcode.solved : '—', en: 'solved on LeetCode', hi: 'LeetCode पर हल किए', href: leetcode?.profileUrl },
            { v: problems.length, en: 'written up here', hi: 'यहाँ लिखे गए' },
            { v: streak, en: streak === 1 ? 'day streak' : 'day streak', hi: 'दिन लगातार' },
            { v: `${covered}/${progress.topics.length}`, en: 'topics started', hi: 'टॉपिक्स शुरू किए' },
          ].map((s) => {
            const body = (
              <>
                <p className="text-3xl font-display font-semibold text-text-primary tabular-nums">{s.v}</p>
                <p className="text-xs text-text-muted font-body mt-1"><T en={s.en} hi={s.hi} /></p>
              </>
            );
            return s.href ? (
              <a key={s.en} href={s.href} target="_blank" rel="noopener noreferrer" className="bg-surface border border-border rounded-lg p-4 hover:border-rule transition-colors">{body}</a>
            ) : (
              <div key={s.en} className="bg-surface border border-border rounded-lg p-4">{body}</div>
            );
          })}
        </section>

        {leetcode && (
          <div className="flex flex-wrap gap-4 text-xs font-mono mb-10 -mt-6 text-text-muted">
            <span className="text-success">Easy {leetcode.easy}</span>
            <span className="text-warning">Medium {leetcode.medium}</span>
            <span className="text-error">Hard {leetcode.hard}</span>
            <span className="text-text-faint"><T en="· live from LeetCode" hi="· LeetCode से लाइव" /></span>
          </div>
        )}

        <section className="mb-12" aria-labelledby="activity-heading">
          <h2 id="activity-heading" className="text-xs font-mono text-text-faint uppercase tracking-widest mb-3">
            <T en="Last 16 weeks" hi="पिछले 16 हफ़्ते" />
          </h2>
          <div className="grid grid-flow-col grid-rows-7 gap-[3px] w-fit" role="img" aria-label={`${problems.length} problems written up`}>
            {days.map((d) => (
              <span
                key={d.date}
                title={`${d.date}: ${d.n}`}
                className={`w-3 h-3 rounded-[3px] ${d.n === 0 ? 'bg-bg-tertiary' : d.n === 1 ? 'bg-accent/50' : d.n === 2 ? 'bg-accent/75' : 'bg-accent'}`}
              />
            ))}
          </div>
        </section>

        <section className="mb-14" aria-labelledby="roadmap-heading">
          <div className="flex items-baseline justify-between mb-5">
            <h2 id="roadmap-heading" className="text-2xl font-display font-semibold text-text-primary">
              <T en="Roadmap" hi="रोडमैप" />
            </h2>
            <p className="text-xs text-text-faint font-body"><T en="16 core interview topics · 150 problems" hi="16 मुख्य इंटरव्यू टॉपिक्स · 150 सवाल" /></p>
          </div>
          <div className="grid sm:grid-cols-2 gap-x-10 gap-y-4">
            {progress.topics.map((t) => (
              <div key={t.id}>
                <div className="flex justify-between text-sm font-body mb-1.5">
                  <span className="text-text-primary"><T en={t.label} hi={t.hi} /></span>
                  <span className="text-text-muted tabular-nums">{Math.min(t.done, t.target)}/{t.target}</span>
                </div>
                <div className="h-1.5 rounded-full bg-bg-tertiary overflow-hidden">
                  <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${Math.min(100, (t.done / t.target) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <DsaExplorer problems={problems} />
      </div>
    </main>
  );
}
