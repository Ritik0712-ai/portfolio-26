'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BookOpen, ChevronDown, Code2, Download, FolderGit2, Github, GraduationCap, Linkedin, Mail, Sparkles, User, X,
} from 'lucide-react';
import { resume, resumeUpdated } from '@/data/resume';

type Accent = 'emerald' | 'sky' | 'violet' | 'amber' | 'rose';

const ACCENT: Record<Accent, { text: string; glow: string; chip: string }> = {
  emerald: { text: 'text-emerald-400', glow: '52,211,153', chip: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200' },
  sky: { text: 'text-sky-400', glow: '56,189,248', chip: 'border-sky-400/30 bg-sky-400/10 text-sky-200' },
  violet: { text: 'text-violet-400', glow: '167,139,250', chip: 'border-violet-400/30 bg-violet-400/10 text-violet-200' },
  amber: { text: 'text-amber-400', glow: '251,191,36', chip: 'border-amber-400/30 bg-amber-400/10 text-amber-200' },
  rose: { text: 'text-rose-400', glow: '251,113,133', chip: 'border-rose-400/30 bg-rose-400/10 text-rose-200' },
};

const SKILL_ACCENTS: Accent[] = ['sky', 'emerald', 'violet', 'amber', 'rose'];

/** Tracks the rendered width so the layout adapts to the window it lives in, not the viewport. */
function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return { ref, width };
}

/** Glassy card with a soft glow that follows the cursor. */
function Card({ accent, className = '', children, index = 0 }: { accent: Accent; className?: string; children: ReactNode; index?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index, duration: 0.4, ease: 'easeOut' }}
      onMouseMove={(e) => {
        const r = ref.current!.getBoundingClientRect();
        ref.current!.style.setProperty('--x', `${e.clientX - r.left}px`);
        ref.current!.style.setProperty('--y', `${e.clientY - r.top}px`);
      }}
      className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm transition-colors hover:border-white/20 ${className}`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: `radial-gradient(360px circle at var(--x, 50%) var(--y, 50%), rgba(${ACCENT[accent].glow},0.12), transparent 70%)` }}
      />
      <div className="relative">{children}</div>
    </motion.div>
  );
}

function CardTitle({ icon, accent, children }: { icon: ReactNode; accent: Accent; children: ReactNode }) {
  return (
    <h2 className={`mb-4 flex font-body items-center gap-2.5 text-[15px] font-semibold tracking-tight ${ACCENT[accent].text}`}>
      {icon}
      {children}
    </h2>
  );
}

export default function InteractiveResume({ scroll = true, className = '' }: { scroll?: boolean; className?: string }) {
  const { ref, width } = useWidth<HTMLDivElement>();
  const wide = width >= 620;
  const xwide = width >= 900;

  const [focus, setFocus] = useState<string | null>(null);
  const [skillTab, setSkillTab] = useState(0);
  const [open, setOpen] = useState<Record<string, boolean>>({});

  const usedIn = (skill: string) => resume.projects.filter((p) => p.stack.includes(skill)).map((p) => p.name);
  const toggleFocus = (skill: string) => setFocus((f) => (f === skill ? null : skill));
  const updated = new Date(resumeUpdated).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  const tab = resume.skills[skillTab];
  const tabAccent = SKILL_ACCENTS[skillTab % SKILL_ACCENTS.length];

  return (
    <div
      ref={ref}
      className={`relative bg-[#0b1120] font-body text-slate-200 ${scroll ? 'h-full overflow-y-auto' : ''} ${className}`}
      style={{ backgroundImage: 'radial-gradient(900px 400px at 0% 0%, rgba(56,189,248,0.10), transparent), radial-gradient(700px 400px at 100% 0%, rgba(167,139,250,0.10), transparent)' }}
    >
      <div className={`mx-auto max-w-5xl ${wide ? 'p-8' : 'p-4'}`}>
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className={`flex gap-5 ${wide ? 'items-center justify-between' : 'flex-col'}`}
        >
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-sky-400 via-violet-500 to-emerald-400 opacity-70 blur-md" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-[#0b1120] text-xl font-bold text-white">RA</div>
            </div>
            <div className="min-w-0">
              <h1 className={`font-body font-bold tracking-tight text-white ${wide ? 'text-3xl' : 'text-2xl'}`}>{resume.name}</h1>
              <p className="bg-gradient-to-r from-sky-400 to-violet-400 bg-clip-text font-medium text-transparent">
                {resume.title} | {resume.subtitle}
              </p>
              <div className="mt-2 flex flex-wrap gap-2 text-[12px]">
                <a href={`mailto:${resume.email}`} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 hover:border-white/30 hover:text-white">
                  <Mail className="h-3.5 w-3.5" /> Email
                </a>
                <a href={resume.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 hover:border-white/30 hover:text-white">
                  <Linkedin className="h-3.5 w-3.5" /> LinkedIn
                </a>
                <a href={resume.github} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 hover:border-white/30 hover:text-white">
                  <Github className="h-3.5 w-3.5" /> GitHub
                </a>
              </div>
            </div>
          </div>
          <div className={`flex flex-col gap-1.5 ${wide ? 'items-end' : ''}`}>
            <a
              href="/resume.pdf"
              download="Ritik_Agarwal_Resume.pdf"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-gradient-to-r from-sky-500 to-violet-500 px-5 py-3 text-[14px] font-semibold text-white shadow-lg shadow-sky-500/20 transition-transform hover:scale-[1.03] active:scale-[0.98]"
            >
              <Download className="h-4 w-4" /> Download Resume PDF
            </a>
            <span className="text-[11px] text-slate-500">ATS-friendly PDF · updated {updated}</span>
          </div>
        </motion.header>

        <div className="my-6 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

        {/* About + Education */}
        <div className={`grid gap-4 ${wide ? 'grid-cols-2' : 'grid-cols-1'}`}>
          <Card accent="sky" index={1}>
            <CardTitle icon={<User className="h-5 w-5" />} accent="sky">About Me</CardTitle>
            <p className="text-[14px] leading-relaxed text-slate-300">{resume.about}</p>
          </Card>
          <Card accent="emerald" index={2}>
            <CardTitle icon={<GraduationCap className="h-5 w-5" />} accent="emerald">Education</CardTitle>
            <p className="text-[16px] font-semibold text-white">{resume.education.degree}</p>
            <p className="mt-1 text-[14px] text-slate-400">{resume.education.school}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-[12px]">
              <span className={`rounded-full border px-2.5 py-1 ${ACCENT.emerald.chip}`}>{resume.education.year}</span>
              <span className={`rounded-full border px-2.5 py-1 ${ACCENT.emerald.chip}`}>{resume.education.graduation}</span>
            </div>
          </Card>
        </div>

        {/* Skills */}
        <Card accent={tabAccent} index={3} className="mt-4">
          <CardTitle icon={<Code2 className="h-5 w-5" />} accent="violet">Technical Skills</CardTitle>
          <div className="-mx-1 mb-4 flex gap-1 overflow-x-auto px-1 pb-1">
            {resume.skills.map((s, i) => (
              <button
                key={s.label}
                onClick={() => setSkillTab(i)}
                className={`relative shrink-0 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors ${i === skillTab ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                {i === skillTab && <motion.span layoutId="skill-tab" className="absolute inset-0 rounded-lg bg-white/10" transition={{ type: 'spring', stiffness: 500, damping: 40 }} />}
                <span className="relative">{s.label}</span>
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={tab.label}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="flex flex-wrap gap-2"
            >
              {tab.items.map((item) => {
                const projects = usedIn(item);
                const active = focus === item;
                return (
                  <button
                    key={item}
                    onClick={() => projects.length && toggleFocus(item)}
                    title={projects.length ? `Used in ${projects.join(', ')}. Click to highlight.` : undefined}
                    className={`rounded-full border px-3 py-1 text-[13px] transition-all ${ACCENT[tabAccent].chip} ${projects.length ? 'cursor-pointer hover:-translate-y-0.5' : 'cursor-default'} ${active ? 'ring-2 ring-white/60' : ''}`}
                  >
                    {item}
                    {projects.length > 0 && <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-current align-middle opacity-70" />}
                  </button>
                );
              })}
            </motion.div>
          </AnimatePresence>
          <p className="mt-3 text-[11px] text-slate-500">
            <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-slate-400 align-middle" /> = used in a project below. Click it to highlight where.
          </p>
        </Card>

        {/* Projects */}
        <div className="mt-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2.5 font-body text-[15px] font-semibold text-amber-400">
              <FolderGit2 className="h-5 w-5" /> Projects
            </h2>
            <AnimatePresence>
              {focus && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={() => setFocus(null)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[12px] hover:bg-white/10"
                >
                  Showing <span className="font-semibold text-white">{focus}</span> <X className="h-3.5 w-3.5" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
          <div className={`grid gap-4 ${xwide ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {resume.projects.map((p, i) => {
              const matches = !focus || p.stack.includes(focus);
              const expanded = !!open[p.name];
              return (
                <motion.div key={p.name} animate={{ opacity: matches ? 1 : 0.35, scale: matches ? 1 : 0.98 }} transition={{ duration: 0.25 }}>
                  <Card accent="amber" index={4 + i} className={`h-full ${focus && matches ? 'border-amber-400/40' : ''}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[18px] font-semibold text-white">{p.name}</p>
                        <p className="text-[13px] italic text-slate-400">{p.tagline}</p>
                      </div>
                      <Sparkles className="h-5 w-5 shrink-0 text-amber-400/70" />
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      {p.stats.map((s) => (
                        <div key={s.label} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                          <p className="bg-gradient-to-r from-amber-300 to-rose-400 bg-clip-text text-[20px] font-bold text-transparent">{s.value}</p>
                          <p className="text-[11px] uppercase tracking-wide text-slate-500">{s.label}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {p.stack.map((t) => (
                        <button
                          key={t}
                          onClick={() => toggleFocus(t)}
                          className={`rounded-md border px-2 py-0.5 text-[12px] transition-colors ${focus === t ? 'border-amber-300/60 bg-amber-400/20 text-amber-100' : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/25'}`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>

                    <ul className="mt-4 space-y-2 text-[13.5px] leading-relaxed text-slate-300">
                      {(expanded ? p.points : p.points.slice(0, 2)).map((pt) => (
                        <motion.li key={pt} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className="flex gap-2">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                          <span>{pt}</span>
                        </motion.li>
                      ))}
                    </ul>
                    <button
                      onClick={() => setOpen((o) => ({ ...o, [p.name]: !expanded }))}
                      className="mt-3 inline-flex items-center gap-1 text-[12px] font-medium text-amber-300 hover:text-amber-200"
                    >
                      {expanded ? 'Show less' : `Show all ${p.points.length} highlights`}
                      <ChevronDown className={`h-3.5 w-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                    </button>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Coursework */}
        <Card accent="rose" index={6} className="mt-4">
          <CardTitle icon={<BookOpen className="h-5 w-5" />} accent="rose">Relevant Coursework</CardTitle>
          <div className="flex flex-wrap gap-2">
            {resume.coursework.map((c) => (
              <span key={c} className={`rounded-full border px-3 py-1 text-[13px] ${ACCENT.rose.chip}`}>{c}</span>
            ))}
          </div>
        </Card>

        <p className="mt-6 pb-2 text-center text-[12px] text-slate-500">
          Want the full ATS-friendly version?{' '}
          <a href="/resume.pdf" download="Ritik_Agarwal_Resume.pdf" className="font-medium text-sky-400 hover:underline">Download the PDF</a>
        </p>
      </div>
    </div>
  );
}
