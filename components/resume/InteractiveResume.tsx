'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDownToLine, ChevronDown, Github, Linkedin, Mail, X } from 'lucide-react';
import { resume, resumeUpdated } from '@/data/resume';

// Single champagne-gold accent, matching the site's --color-accent-warm-light.
const GOLD = '201,168,92';

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

/** Quiet card with a faint gold glow that follows the cursor. */
function Card({ className = '', children, index = 0 }: { className?: string; children: ReactNode; index?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.06 * index, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      onMouseMove={(e) => {
        const r = ref.current!.getBoundingClientRect();
        ref.current!.style.setProperty('--x', `${e.clientX - r.left}px`);
        ref.current!.style.setProperty('--y', `${e.clientY - r.top}px`);
      }}
      className={`group relative overflow-hidden rounded-[20px] border border-white/[0.07] bg-white/[0.02] transition-colors duration-500 hover:border-[#C9A85C]/25 ${className}`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: `radial-gradient(420px circle at var(--x, 50%) var(--y, 50%), rgba(${GOLD},0.07), transparent 70%)` }}
      />
      <div className="relative">{children}</div>
    </motion.div>
  );
}

/** Numbered section label: "01 — About". */
function Label({ n, children }: { n: string; children: ReactNode }) {
  return (
    <p className="mb-5 flex items-center gap-3 font-body text-[10.5px] font-medium uppercase tracking-[0.28em] text-stone-500">
      <span className="text-[#C9A85C]">{n}</span>
      <span className="h-px w-6 bg-[#C9A85C]/40" />
      {children}
    </p>
  );
}

export default function InteractiveResume({ scroll = true, className = '' }: { scroll?: boolean; className?: string }) {
  const { ref, width } = useWidth<HTMLDivElement>();
  const wide = width >= 620;
  const xwide = width >= 900;
  const pad = wide ? 'p-7' : 'p-5';

  const [focus, setFocus] = useState<string | null>(null);
  const [skillTab, setSkillTab] = useState(0);
  const [open, setOpen] = useState<Record<string, boolean>>({});

  const usedIn = (skill: string) => resume.projects.filter((p) => p.stack.includes(skill)).map((p) => p.name);
  const toggleFocus = (skill: string) => setFocus((f) => (f === skill ? null : skill));
  const updated = new Date(resumeUpdated).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  const tab = resume.skills[skillTab];

  return (
    <div
      ref={ref}
      className={`relative bg-[#0c0c0e] font-body text-stone-300 antialiased ${scroll ? 'h-full overflow-y-auto' : ''} ${className}`}
      style={{ backgroundImage: `radial-gradient(800px 360px at 50% -120px, rgba(${GOLD},0.09), transparent 70%)` }}
    >
      <div className={`mx-auto max-w-4xl ${wide ? 'px-10 py-12' : 'px-5 py-8'}`}>
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >
          <p className="font-body text-[10.5px] font-medium uppercase tracking-[0.35em] text-[#C9A85C]">Résumé</p>
          {/* Inline font: host styles like `.mac-root h1` would otherwise override the class. */}
          <h1
            className={`mt-3 font-medium leading-none tracking-tight text-stone-50 ${wide ? 'text-[64px]' : 'text-[44px]'}`}
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {resume.name}
          </h1>
          <p className={`mt-3 font-display italic text-stone-400 ${wide ? 'text-[22px]' : 'text-[19px]'}`}>
            {resume.title} <span className="mx-1 text-[#C9A85C]/70">·</span> {resume.subtitle}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13px] text-stone-400">
            {[
              { href: `mailto:${resume.email}`, icon: <Mail className="h-3.5 w-3.5" />, label: resume.email, external: false },
              { href: resume.linkedin, icon: <Linkedin className="h-3.5 w-3.5" />, label: 'LinkedIn', external: true },
              { href: resume.github, icon: <Github className="h-3.5 w-3.5" />, label: 'GitHub', external: true },
            ].map((l) => (
              <a
                key={l.label}
                href={l.href}
                {...(l.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="group/link inline-flex items-center gap-1.5 transition-colors hover:text-stone-100"
              >
                {l.icon}
                <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-px transition-[background-size] duration-300 group-hover/link:bg-[length:100%_1px]">
                  {l.label}
                </span>
              </a>
            ))}
          </div>

          <div className="mt-8 flex flex-col items-center gap-2.5">
            <a
              href="/resume.pdf"
              download="Ritik_Agarwal_Resume.pdf"
              className="group/dl inline-flex items-center gap-2.5 whitespace-nowrap rounded-full border border-[#C9A85C]/50 bg-[#C9A85C]/[0.08] px-6 py-2.5 text-[13px] font-medium tracking-wide text-[#E6CF95] transition-all duration-300 hover:border-[#C9A85C] hover:bg-[#C9A85C] hover:text-[#0c0c0e]"
            >
              <ArrowDownToLine className="h-4 w-4 transition-transform duration-300 group-hover/dl:translate-y-0.5" />
              Download Résumé (PDF)
            </a>
            <span className="text-[11px] tracking-wide text-stone-600">ATS-friendly version · updated {updated}</span>
          </div>
        </motion.header>

        <div className="mx-auto my-10 flex max-w-xs items-center gap-4">
          <span className="h-px flex-1 bg-gradient-to-r from-transparent to-[#C9A85C]/40" />
          <span className="h-1.5 w-1.5 rotate-45 border border-[#C9A85C]/70" />
          <span className="h-px flex-1 bg-gradient-to-l from-transparent to-[#C9A85C]/40" />
        </div>

        {/* About + Education */}
        <div className={`grid gap-4 ${wide ? 'grid-cols-[1.4fr_1fr]' : 'grid-cols-1'}`}>
          <Card index={1} className={pad}>
            <Label n="01">About</Label>
            <p className="font-display text-[19px] leading-[1.6] text-stone-200">{resume.about}</p>
          </Card>
          <Card index={2} className={pad}>
            <Label n="02">Education</Label>
            <p className="font-display text-[22px] leading-snug text-stone-50">{resume.education.degree}</p>
            <p className="mt-2 text-[13px] text-stone-400">{resume.education.school}</p>
            <div className="mt-6 space-y-2 border-t border-white/[0.06] pt-4 text-[12.5px]">
              <div className="flex justify-between"><span className="text-stone-500">Year</span><span className="text-stone-200">{resume.education.year}</span></div>
              <div className="flex justify-between"><span className="text-stone-500">Graduation</span><span className="text-stone-200">{resume.education.graduation.replace('Expected Graduation: ', '')} <span className="text-stone-500">(expected)</span></span></div>
            </div>
          </Card>
        </div>

        {/* Skills */}
        <Card index={3} className={`mt-4 ${pad}`}>
          <Label n="03">Technical Skills</Label>
          <div className="-mx-1 mb-6 flex gap-5 overflow-x-auto border-b border-white/[0.06] px-1">
            {resume.skills.map((s, i) => (
              <button
                key={s.label}
                onClick={() => setSkillTab(i)}
                className={`relative shrink-0 pb-3 text-[13px] tracking-wide transition-colors duration-300 ${i === skillTab ? 'text-stone-50' : 'text-stone-500 hover:text-stone-300'}`}
              >
                {s.label}
                {i === skillTab && <motion.span layoutId="skill-underline" className="absolute inset-x-0 -bottom-px h-px bg-[#C9A85C]" transition={{ type: 'spring', stiffness: 500, damping: 40 }} />}
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={tab.label}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
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
                    className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[13px] transition-all duration-300 ${
                      active
                        ? 'border-[#C9A85C] bg-[#C9A85C]/15 text-[#F0DFB4]'
                        : projects.length
                          ? 'cursor-pointer border-white/10 text-stone-200 hover:border-[#C9A85C]/50'
                          : 'cursor-default border-white/[0.06] text-stone-400'
                    }`}
                  >
                    {item}
                    {projects.length > 0 && <span className="h-1 w-1 rounded-full bg-[#C9A85C]" />}
                  </button>
                );
              })}
            </motion.div>
          </AnimatePresence>
          <p className="mt-5 flex items-center gap-2 text-[11px] tracking-wide text-stone-600">
            <span className="h-1 w-1 rounded-full bg-[#C9A85C]" /> Used in a project. Select to see where.
          </p>
        </Card>

        {/* Projects */}
        <div className="mt-10">
          <div className="mb-4 flex min-h-[28px] items-center justify-between gap-3 px-1">
            <Label n="04">Selected Projects</Label>
            <AnimatePresence>
              {focus && (
                <motion.button
                  initial={{ opacity: 0, x: 6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 6 }}
                  onClick={() => setFocus(null)}
                  className="-mt-5 inline-flex items-center gap-1.5 rounded-full border border-[#C9A85C]/40 px-3 py-1 text-[12px] text-[#E6CF95] hover:bg-[#C9A85C]/10"
                >
                  {focus} <X className="h-3 w-3" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
          <div className={`grid gap-4 ${xwide ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {resume.projects.map((p, i) => {
              const matches = !focus || p.stack.includes(focus);
              const expanded = !!open[p.name];
              return (
                <motion.div key={p.name} animate={{ opacity: matches ? 1 : 0.3 }} transition={{ duration: 0.4 }}>
                  <Card index={4 + i} className={`h-full ${pad} ${focus && matches ? '!border-[#C9A85C]/40' : ''}`}>
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="font-display text-[30px] font-medium leading-none text-stone-50">{p.name}</p>
                      <span className="font-display text-[15px] italic text-[#C9A85C]/80">No. {String(i + 1).padStart(2, '0')}</span>
                    </div>
                    <p className="mt-2 font-display text-[16px] italic text-stone-400">{p.tagline}</p>

                    <div className="mt-6 grid grid-cols-2 divide-x divide-white/[0.06] border-y border-white/[0.06] py-4">
                      {p.stats.map((s, j) => (
                        <div key={s.label} className={j ? 'pl-4' : 'pr-4'}>
                          <p className="font-display text-[34px] font-medium leading-none text-[#E6CF95]">{s.value}</p>
                          <p className="mt-1.5 text-[10.5px] uppercase tracking-[0.2em] text-stone-500">{s.label}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 flex flex-wrap gap-x-4 gap-y-1.5">
                      {p.stack.map((t) => (
                        <button
                          key={t}
                          onClick={() => toggleFocus(t)}
                          className={`text-[12px] tracking-wide transition-colors duration-300 ${focus === t ? 'text-[#E6CF95] underline decoration-[#C9A85C] underline-offset-4' : 'text-stone-500 hover:text-stone-200'}`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>

                    <ul className="mt-5 space-y-3 text-[13.5px] leading-relaxed text-stone-300">
                      {(expanded ? p.points : p.points.slice(0, 2)).map((pt) => (
                        <motion.li key={pt} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="flex gap-3">
                          <span className="mt-[9px] h-px w-3 shrink-0 bg-[#C9A85C]/70" />
                          <span>{pt}</span>
                        </motion.li>
                      ))}
                    </ul>
                    <button
                      onClick={() => setOpen((o) => ({ ...o, [p.name]: !expanded }))}
                      className="mt-5 inline-flex items-center gap-1.5 text-[12px] tracking-wide text-[#C9A85C] transition-colors hover:text-[#E6CF95]"
                    >
                      {expanded ? 'Show less' : `Read all ${p.points.length} highlights`}
                      <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} />
                    </button>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Coursework */}
        <Card index={6} className={`mt-10 ${pad}`}>
          <Label n="05">Relevant Coursework</Label>
          <ul className={`grid gap-x-8 ${wide ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {resume.coursework.map((c) => (
              <li key={c} className="flex items-center gap-3 border-b border-white/[0.05] py-2.5 text-[13.5px] text-stone-300 last:border-0">
                <span className="h-1 w-1 rotate-45 bg-[#C9A85C]/70" />
                {c}
              </li>
            ))}
          </ul>
        </Card>

        <p className="mt-12 text-center font-display text-[16px] italic text-stone-500">
          For the complete, ATS-friendly version,{' '}
          <a href="/resume.pdf" download="Ritik_Agarwal_Resume.pdf" className="text-[#C9A85C] underline decoration-[#C9A85C]/40 underline-offset-4 transition-colors hover:text-[#E6CF95]">
            download the PDF
          </a>
          .
        </p>
      </div>
    </div>
  );
}
