'use client';

import { useState } from 'react';
import Image from 'next/image';
import { AnimatePresence } from 'framer-motion';
import { ChevronRight, ExternalLink, Download, Share } from 'lucide-react';
import IOSPage, { ListSection } from '../IOSPage';
import { useProjects, useTimeline, useCertifications, useBlogs, formatMonth, timeAgo, PROFILE } from '@/components/os/data';
import { ProjectReader, BlogReader } from '@/components/os/readers';
import { aboutHeadline, aboutParagraphs } from '@/data/about';
import { nowData } from '@/data/now';
import { uses } from '@/data/uses';
import { resumeUpdated } from '@/data/resume';

export function ProjectsApp() {
  const { data: projects } = useProjects();
  const [open, setOpen] = useState<string | null>(null);
  const project = projects?.find((p) => p.slug === open);
  return (
    <>
      <IOSPage title="Projects">
        <ListSection header={`${projects?.length ?? '…'} projects`}>
          {(projects ?? []).map((p) => (
            <button key={p.id} className="ios-row" onClick={() => setOpen(p.slug)} style={{ ['--ios-inset' as string]: '92px' }}>
              <div className="relative w-[64px] h-[44px] rounded-md overflow-hidden bg-black/10 shrink-0">
                {p.cover_image && <Image src={p.cover_image} alt="" fill sizes="64px" className="object-cover object-top" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold truncate">{p.title}</p>
                <p className="text-[13px] ios-secondary line-clamp-1">{p.short_description}</p>
              </div>
              <ChevronRight className="w-4 h-4 ios-secondary shrink-0" />
            </button>
          ))}
        </ListSection>
      </IOSPage>
      <AnimatePresence>
        {project && (
          <IOSPage key={project.slug} title={project.title} back="Projects" onBack={() => setOpen(null)} largeTitle={false} flush
            trailing={<a href={`/projects/${project.slug}`} target="_blank" rel="noopener noreferrer" aria-label="Open full case study"><Share className="w-5 h-5" /></a>}>
            <ProjectReader project={project} />
          </IOSPage>
        )}
      </AnimatePresence>
    </>
  );
}

export function ExperienceApp() {
  const { data: timeline } = useTimeline();
  const { data: certs } = useCertifications();
  return (
    <IOSPage title="Experience">
      <ListSection header="Journey">
        {(timeline ?? []).map((t) => (
          <div key={t.id} className="ios-row items-start">
            <div className="w-2.5 h-2.5 rounded-full bg-[var(--ios-blue)] mt-1.5 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{t.title}</p>
              {t.description && <p className="text-[15px] ios-secondary">{t.description}</p>}
            </div>
            <span className="text-[13px] ios-secondary whitespace-nowrap">{formatMonth(t.event_date)}</span>
          </div>
        ))}
      </ListSection>
      {certs && certs.length > 0 && (
        <ListSection header="Certifications">
          {certs.map((c) => (
            <a key={c.id} href={c.credential_url ?? undefined} target="_blank" rel="noopener noreferrer" className="ios-row">
              <span className="min-w-0 flex-1"><span className="block truncate">{c.title}</span><span className="block text-[13px] ios-secondary">{c.issuer}</span></span>
              {c.credential_url && <ExternalLink className="w-4 h-4 ios-secondary" />}
            </a>
          ))}
        </ListSection>
      )}
    </IOSPage>
  );
}

export function CertificationsApp() {
  const { data: certs } = useCertifications();
  return (
    <IOSPage title="Certificates">
      <div className="grid grid-cols-1 gap-3 mt-2">
        {(certs ?? []).map((c) => (
          <a key={c.id} href={c.credential_url ?? undefined} target="_blank" rel="noopener noreferrer"
            className="rounded-2xl p-4 text-white shadow-lg" style={{ background: 'linear-gradient(135deg, #1C1C1E, #3A3A3C)' }}>
            <div className="flex items-start gap-3">
              {c.image_url ? <img src={c.image_url} alt="" className="w-12 h-12 rounded-lg bg-white object-contain" /> : null}
              <div className="min-w-0">
                <p className="text-[12px] uppercase tracking-wider opacity-70">{c.issuer}</p>
                <p className="text-[17px] font-semibold leading-snug">{c.title}</p>
              </div>
            </div>
            <div className="flex justify-between items-end mt-6 text-[12px] opacity-80">
              <span>{c.issue_date ? `Issued ${formatMonth(c.issue_date)}` : ''}</span>
              {c.credential_url && <span className="inline-flex items-center gap-1">Verify <ExternalLink className="w-3 h-3" /></span>}
            </div>
          </a>
        ))}
        {certs && certs.length === 0 && <p className="ios-secondary text-center py-10">No certificates yet.</p>}
      </div>
    </IOSPage>
  );
}

export function SafariApp() {
  const { data: posts } = useBlogs();
  const { data: projects } = useProjects();
  const [page, setPage] = useState<{ kind: 'post' | 'project'; slug: string } | null>(null);
  const project = page?.kind === 'project' ? projects?.find((p) => p.slug === page.slug) : undefined;
  const url = page ? `ritikagarwal.me/${page.kind === 'post' ? 'blog' : 'projects'}/${page.slug}` : 'ritikagarwal.me';

  return (
    <div className="absolute inset-0 ios-screen flex flex-col">
      <div className="flex-1 overflow-y-auto pt-[54px]" style={{ paddingBottom: 110 }}>
        {!page && (
          <div className="px-4">
            <h1 className="ios-large-title pt-2">Start Page</h1>
            <ListSection header="Case studies">
              {(projects ?? []).map((p) => (
                <button key={p.id} className="ios-row" onClick={() => setPage({ kind: 'project', slug: p.slug })}>
                  <span className="flex-1 min-w-0"><span className="block truncate">{p.title}</span><span className="block text-[13px] ios-secondary truncate">{p.short_description}</span></span>
                  <ChevronRight className="w-4 h-4 ios-secondary" />
                </button>
              ))}
            </ListSection>
            <ListSection header="Reading list">
              {(posts ?? []).map((b) => (
                <button key={b.id} className="ios-row" onClick={() => setPage({ kind: 'post', slug: b.slug })}>
                  <span className="flex-1 min-w-0"><span className="block truncate">{b.title}</span><span className="block text-[13px] ios-secondary">{b.category} · {timeAgo(b.created_at)}</span></span>
                  <ChevronRight className="w-4 h-4 ios-secondary" />
                </button>
              ))}
            </ListSection>
          </div>
        )}
        {page?.kind === 'post' && <BlogReader slug={page.slug} />}
        {page?.kind === 'project' && project && <ProjectReader project={project} />}
      </div>
      {/* Bottom address bar (iOS Safari) */}
      <div className="absolute inset-x-0 bottom-0 ios-bar border-t pt-2 px-3" style={{ borderColor: 'var(--ios-separator)', paddingBottom: 'calc(40px + env(safe-area-inset-bottom))' }}>
        <div className="flex items-center gap-3">
          <button onClick={() => setPage(null)} disabled={!page} className="ios-blue disabled:opacity-30 text-[17px] px-1" aria-label="Back">‹</button>
          <div className="flex-1 h-11 rounded-xl ios-cell flex items-center justify-center text-[15px] shadow-sm truncate px-3">{url}</div>
        </div>
      </div>
    </div>
  );
}

export function NotesApp() {
  const notes = [
    { id: 'about', title: aboutHeadline, preview: aboutParagraphs[0], body: aboutParagraphs.map((p) => <p key={p.slice(0, 16)} className="mb-3">{p}</p>) },
    {
      id: 'now', title: 'What I’m doing now', preview: nowData.focus,
      body: (
        <>
          <p className="font-semibold mb-3">{nowData.focus}</p>
          {([['Building', nowData.currentlyBuilding], ['Learning', nowData.currentlyLearning], ['Reading', nowData.currentlyReading]] as const).map(([h, items]) => (
            <div key={h} className="mb-3"><p className="font-semibold">{h}</p><ul className="list-disc pl-5">{items.map((i) => <li key={i}>{i}</li>)}</ul></div>
          ))}
        </>
      ),
    },
    {
      id: 'uses', title: 'What I use', preview: uses.map((u) => u.title).join(', '),
      body: uses.map((g) => (
        <div key={g.title} className="mb-3"><p className="font-semibold">{g.title}</p><ul className="list-disc pl-5">{g.items.map((i) => <li key={i.name}>{i.name}{i.note ? ` — ${i.note}` : ''}</li>)}</ul></div>
      )),
    },
  ];
  const [open, setOpen] = useState<string | null>(null);
  const note = notes.find((n) => n.id === open);
  return (
    <>
      <IOSPage title="Notes">
        <ListSection header="Pinned">
          {notes.map((n) => (
            <button key={n.id} className="ios-row items-start" onClick={() => setOpen(n.id)}>
              <span className="min-w-0 flex-1"><span className="block font-semibold truncate">{n.title}</span><span className="block text-[15px] ios-secondary truncate">{n.preview}</span></span>
            </button>
          ))}
        </ListSection>
      </IOSPage>
      <AnimatePresence>
        {note && (
          <IOSPage key={note.id} title="" back="Notes" onBack={() => setOpen(null)} largeTitle={false}>
            <article className="text-[17px] leading-relaxed pt-2">
              <h1 className="text-[28px] font-bold leading-tight mb-4">{note.title}</h1>
              {note.body}
            </article>
          </IOSPage>
        )}
      </AnimatePresence>
    </>
  );
}

export function ResumeApp() {
  const date = new Date(resumeUpdated).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  return (
    <IOSPage title="Résumé">
      <p className="text-[15px] ios-secondary mb-4">Last updated {date}</p>
      <div className="rounded-2xl overflow-hidden shadow-lg bg-white aspect-[1/1.3] mb-4">
        <iframe src="/resume.pdf#view=FitH" title="Résumé" className="w-full h-full" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <a href="/resume.pdf" target="_blank" rel="noopener noreferrer" className="h-12 rounded-xl ios-cell flex items-center justify-center gap-2 ios-blue font-semibold text-[17px]">
          <ExternalLink className="w-4 h-4" /> Open
        </a>
        <a href="/resume.pdf" download="Ritik_Agarwal_Resume.pdf" className="h-12 rounded-xl bg-[var(--ios-blue)] text-white flex items-center justify-center gap-2 font-semibold text-[17px]">
          <Download className="w-4 h-4" /> Download
        </a>
      </div>
      <p className="text-[13px] ios-secondary mt-4 text-center">{PROFILE.name} · {PROFILE.role}</p>
    </IOSPage>
  );
}
