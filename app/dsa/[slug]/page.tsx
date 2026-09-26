import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowLeft, ExternalLink, Repeat, Clock, HardDrive } from 'lucide-react';
import { getDsaBySlug, getDsaProblems } from '@/lib/public-data';
import { pageMetadata } from '@/lib/metadata';
import { topicOf, DSA_LANGUAGES } from '@/lib/dsa';
import { T } from '@/lib/i18n';
import CodeBlock from '@/components/dsa/CodeBlock';

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 60;
const get = cache(getDsaBySlug);

export async function generateStaticParams() {
  return (await getDsaProblems()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await get(slug);
  if (!p) return { title: 'Problem not found' };
  return pageMetadata({
    title: `${p.number ? `${p.number}. ` : ''}${p.title} — DSA journal`,
    description: `My approach to ${p.title}${p.time_complexity ? ` in ${p.time_complexity} time` : ''}, with code and notes.`,
    path: `/dsa/${p.slug}`,
  });
}

const DIFF = { Easy: 'text-success border-success/30 bg-success/10', Medium: 'text-warning border-warning/30 bg-warning/10', Hard: 'text-error border-error/30 bg-error/10' } as const;

export default async function DsaProblemPage({ params }: Props) {
  const { slug } = await params;
  const p = await get(slug);
  if (!p) notFound();
  const topic = topicOf(p);
  const lang = DSA_LANGUAGES.find((l) => l.value === p.language);

  return (
    <main id="main-content" className="min-h-screen pt-28 pb-20 px-4">
      <article className="max-w-3xl mx-auto">
        <Link href="/dsa" className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary mb-8">
          <ArrowLeft className="w-4 h-4" /> <T en="DSA journal" hi="DSA जर्नल" />
        </Link>

        <header className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {p.difficulty && <span className={`text-xs font-mono px-2 py-0.5 rounded border ${DIFF[p.difficulty]}`}>{p.difficulty}</span>}
            {topic && <span className="text-xs font-mono px-2 py-0.5 rounded border border-border bg-bg-secondary text-text-muted"><T en={topic.label} hi={topic.hi} /></span>}
            {p.revisit && (
              <span className="inline-flex items-center gap-1 text-xs font-mono px-2 py-0.5 rounded border border-warning/30 text-warning">
                <Repeat className="w-3 h-3" /> <T en="Revisit" hi="दोबारा देखना है" />
              </span>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-semibold text-text-primary leading-tight mb-3">
            {p.number ? `${p.number}. ` : ''}{p.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-text-muted font-body">
            <span><T en="Solved" hi="हल किया" /> {new Date(p.solved_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            {p.url && (
              <a href={p.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-text-primary">
                <T en="Open the problem" hi="सवाल खोलें" /> <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
          {p.topics.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4">
              {p.topics.map((tag) => (
                <span key={tag} className="text-[11px] px-2 py-0.5 rounded bg-bg-secondary border border-border text-text-muted">{tag}</span>
              ))}
            </div>
          )}
        </header>

        {(p.time_complexity || p.space_complexity) && (
          <div className="grid grid-cols-2 gap-3 mb-10">
            <div className="bg-surface border border-border rounded-lg p-4">
              <p className="text-xs text-text-faint font-body flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> <T en="Time" hi="समय" /></p>
              <p className="text-xl font-mono text-text-primary mt-1">{p.time_complexity ?? '—'}</p>
            </div>
            <div className="bg-surface border border-border rounded-lg p-4">
              <p className="text-xs text-text-faint font-body flex items-center gap-1.5"><HardDrive className="w-3.5 h-3.5" /> <T en="Space" hi="मेमोरी" /></p>
              <p className="text-xl font-mono text-text-primary mt-1">{p.space_complexity ?? '—'}</p>
            </div>
          </div>
        )}

        {p.approach && (
          <section className="mb-10">
            <h2 className="text-xs font-mono text-text-faint uppercase tracking-widest mb-3"><T en="Approach" hi="तरीक़ा" /></h2>
            <div className="prose-editorial">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{p.approach}</ReactMarkdown>
            </div>
          </section>
        )}

        {p.code && (
          <section className="mb-10">
            <h2 className="text-xs font-mono text-text-faint uppercase tracking-widest mb-3">
              <T en="Code" hi="कोड" /> {lang && <span className="normal-case tracking-normal">· {lang.label}</span>}
            </h2>
            <CodeBlock code={p.code} language={p.language ?? 'text'} />
          </section>
        )}

        {p.notes && (
          <section className="mb-10 border-l-2 border-accent-warm pl-4">
            <h2 className="text-xs font-mono text-text-faint uppercase tracking-widest mb-2"><T en="Notes to self" hi="ख़ुद के लिए नोट्स" /></h2>
            <p className="text-text-secondary font-body leading-relaxed whitespace-pre-line">{p.notes}</p>
          </section>
        )}
      </article>
    </main>
  );
}
