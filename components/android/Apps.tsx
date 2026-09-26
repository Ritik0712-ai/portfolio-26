'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useProjects, useTimeline, useCertifications, useBlogs, askAssistant, sendContact, formatMonth, timeAgo, PROFILE } from '@/components/os/data';
import { BlogReader, ProjectReader } from '@/components/os/readers';
import GitHubPanel from '@/components/os/GitHubPanel';
import Terminal from '@/components/macos/apps/Terminal';
import { usePhotoLibrary } from '@/components/macos/apps/Photos';
import { musicPicks, spotifyEmbed, spotifyLink, type MusicItem } from '@/data/music';
import { aboutParagraphs, aboutHeadline } from '@/data/about';
import { nowData } from '@/data/now';
import { skillGroups } from '@/data/skills';
import { resumeUpdated } from '@/data/resume';
import { Sym, AppIcon } from './System';
import { ANDROID_WALLPAPERS } from './theme';

/* ------------------------------------------------------------ Scaffolding */

/** Material 3 screen: top app bar that shrinks from large to small on scroll. */
export function Screen({ title, onBack, actions, children, fab, large = true }: { title: string; onBack: () => void; actions?: ReactNode; children: ReactNode; fab?: ReactNode; large?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  return (
    <div className="absolute inset-0 md-surface flex flex-col">
      <header className={`shrink-0 pt-9 transition-colors ${scrolled ? 'md-surface-container' : ''}`}>
        <div className="h-16 flex items-center gap-1 px-1">
          <button onClick={onBack} aria-label="Back" className="w-12 h-12 rounded-full flex items-center justify-center md-state"><Sym name="arrow_back" size={24} /></button>
          <p className={`flex-1 text-[22px] truncate transition-opacity ${large && !scrolled ? 'opacity-0' : 'opacity-100'}`}>{title}</p>
          {actions}
        </div>
        {large && (
          <p className={`px-4 text-[32px] leading-tight overflow-hidden transition-all ${scrolled ? 'h-0 pb-0' : 'h-12 pb-3'}`}>{title}</p>
        )}
      </header>
      <div className="flex-1 overflow-y-auto md-scroll pb-8" onScroll={(e) => setScrolled((e.target as HTMLElement).scrollTop > 8)}>
        {children}
      </div>
      {fab}
    </div>
  );
}

function Detail({ onBack, title, children }: { onBack: () => void; title: string; children: ReactNode }) {
  return (
    <motion.div className="absolute inset-0 z-10" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', stiffness: 400, damping: 40 }}>
      <Screen title={title} onBack={onBack} large={false}>{children}</Screen>
    </motion.div>
  );
}

const Loading = () => <p className="px-4 py-6 md-variant">Loading…</p>;

function ListItem({ icon, title, sub, trailing, onClick, href }: { icon?: ReactNode; title: ReactNode; sub?: ReactNode; trailing?: ReactNode; onClick?: () => void; href?: string }) {
  const body = (
    <>
      {icon}
      <span className="flex-1 min-w-0">
        <span className="block text-[16px] truncate">{title}</span>
        {sub && <span className="block text-[14px] md-variant line-clamp-2">{sub}</span>}
      </span>
      {trailing}
    </>
  );
  const cls = 'w-full flex items-center gap-4 px-4 py-3 text-left md-state';
  return href ? <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>{body}</a> : <button onClick={onClick} className={cls}>{body}</button>;
}

function Group({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`mx-4 rounded-[24px] md-surface-container overflow-hidden ${className}`}>{children}</div>;
}

/* ---------------------------------------------------------------- Projects */

export function ProjectsApp({ onBack, initial }: { onBack: () => void; initial?: string }) {
  const { data } = useProjects();
  const [open, setOpen] = useState<string | null>(initial ?? null);
  const project = data?.find((p) => p.slug === open);
  return (
    <>
      <Screen title="Projects" onBack={onBack}>
        {!data ? <Loading /> : (
          <div className="px-4 space-y-3">
            {data.map((p) => (
              <button key={p.id} onClick={() => setOpen(p.slug)} className="w-full text-left rounded-[24px] md-surface-container overflow-hidden md-state">
                {p.cover_image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.cover_image} alt="" className="w-full aspect-[16/9] object-cover object-top" />
                )}
                <span className="block p-4">
                  <span className="flex items-center gap-2">
                    <span className="text-[18px] font-medium">{p.title}</span>
                    {p.featured && <span className="text-[11px] px-2 py-0.5 rounded-full md-secondary-container">Featured</span>}
                  </span>
                  <span className="block text-[14px] md-variant mt-1 line-clamp-2">{p.short_description}</span>
                  <span className="flex flex-wrap gap-1.5 mt-3">
                    {(p.technologies ?? []).slice(0, 4).map((t) => (
                      <span key={t} className="text-[12px] px-2.5 py-1 rounded-lg border md-outline">{t}</span>
                    ))}
                  </span>
                </span>
              </button>
            ))}
          </div>
        )}
      </Screen>
      <AnimatePresence>
        {project && <Detail key="d" title={project.title} onBack={() => setOpen(null)}><ProjectReader project={project} /></Detail>}
      </AnimatePresence>
    </>
  );
}

/* -------------------------------------------------------------- Experience */

export function ExperienceApp({ onBack }: { onBack: () => void }) {
  const { data } = useTimeline();
  return (
    <Screen title="Experience" onBack={onBack}>
      {!data ? <Loading /> : (
        <ol className="px-4">
          {data.map((e, i) => (
            <li key={e.id} className="flex gap-4">
              <span className="flex flex-col items-center">
                <span className="w-10 h-10 rounded-full md-primary-container flex items-center justify-center shrink-0"><Sym name="work" size={20} /></span>
                {i < data.length - 1 && <span className="w-0.5 flex-1 my-1 bg-[var(--md-outline-variant)]" />}
              </span>
              <span className="pb-6 min-w-0">
                <span className="block text-[12px] md-primary font-medium pt-2.5">{formatMonth(e.event_date)}</span>
                <span className="block text-[17px] font-medium mt-0.5">{e.title}</span>
                {e.description && <span className="block text-[14px] md-variant mt-1 whitespace-pre-line">{e.description}</span>}
              </span>
            </li>
          ))}
        </ol>
      )}
    </Screen>
  );
}

/* ------------------------------------------------------------ Certificates */

export function CertificatesApp({ onBack }: { onBack: () => void }) {
  const { data } = useCertifications();
  return (
    <Screen title="Certificates" onBack={onBack}>
      {!data ? <Loading /> : data.length === 0 ? <p className="px-4 md-variant">No certificates yet.</p> : (
        <Group>
          {data.map((c) => (
            <ListItem
              key={c.id}
              href={c.credential_url ?? undefined}
              icon={<span className="w-10 h-10 rounded-full md-secondary-container flex items-center justify-center shrink-0"><Sym name="badge" size={20} /></span>}
              title={c.title}
              sub={`${c.issuer}${c.issue_date ? ` · ${formatMonth(c.issue_date)}` : ''}`}
              trailing={c.credential_url ? <Sym name="open_in_new" size={20} color="var(--md-on-surface-variant)" /> : undefined}
            />
          ))}
        </Group>
      )}
    </Screen>
  );
}

/* --------------------------------------------------------------------- Web */

export function WebApp({ onBack, initialPost }: { onBack: () => void; initialPost?: string }) {
  const { data } = useBlogs();
  const [open, setOpen] = useState<string | null>(initialPost ?? null);
  const post = data?.find((p) => p.slug === open);
  return (
    <>
      <div className="absolute inset-0 md-surface flex flex-col">
        <div className="pt-10 px-3 pb-2 flex items-center gap-2 md-surface-container">
          <button onClick={onBack} aria-label="Back" className="w-10 h-10 rounded-full flex items-center justify-center md-state"><Sym name="arrow_back" size={22} /></button>
          <div className="flex-1 h-11 rounded-full md-surface-highest flex items-center gap-2 px-4 text-[14px]">
            <Sym name="lock" size={16} color="var(--md-on-surface-variant)" />
            <span className="truncate">ritikagarwal.me/blog</span>
          </div>
          <a href="/blog" target="_blank" rel="noopener noreferrer" aria-label="Open in browser" className="w-10 h-10 rounded-full flex items-center justify-center md-state"><Sym name="open_in_new" size={20} /></a>
        </div>
        <div className="flex-1 overflow-y-auto md-scroll pb-8">
          <p className="px-4 pt-5 pb-3 text-[28px]">From the blog</p>
          {!data ? <Loading /> : (
            <div className="px-4 space-y-3">
              {data.map((b) => (
                <button key={b.id} onClick={() => setOpen(b.slug)} className="w-full text-left rounded-[24px] md-surface-container p-4 md-state">
                  <span className="block text-[12px] font-medium md-primary uppercase tracking-wide">{b.category}</span>
                  <span className="block text-[18px] font-medium leading-snug mt-1">{b.title}</span>
                  {b.excerpt && <span className="block text-[14px] md-variant mt-1 line-clamp-3">{b.excerpt}</span>}
                  <span className="block text-[12px] md-variant mt-2">{timeAgo(b.created_at)}{b.reading_time ? ` · ${b.reading_time}` : ''}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <AnimatePresence>
        {open && <Detail key="p" title={post?.title ?? 'Post'} onBack={() => setOpen(null)}><BlogReader slug={open} /></Detail>}
      </AnimatePresence>
    </>
  );
}

/* -------------------------------------------------------------------- Mail */

export function MailApp({ onBack }: { onBack: () => void }) {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');
  const send = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) { setError('Name, email and a message are required.'); setState('error'); return; }
    setState('sending');
    try {
      await sendContact({ name: form.name.trim(), email: form.email.trim(), message: form.subject.trim() ? `Subject: ${form.subject.trim()}\n\n${form.message.trim()}` : form.message.trim() });
      setState('sent');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not send.'); setState('error');
    }
  };
  if (state === 'sent') {
    return (
      <Screen title="Mail" onBack={onBack} large={false}>
        <div className="flex flex-col items-center text-center px-8 pt-24">
          <span className="w-20 h-20 rounded-full md-primary-container flex items-center justify-center mb-5"><Sym name="send" size={36} /></span>
          <p className="text-[22px]">Message sent</p>
          <p className="md-variant mt-2">Thanks, {form.name.split(' ')[0]}! Ritik usually replies within a day or two.</p>
          <button onClick={onBack} className="mt-8 h-10 px-6 rounded-full md-bg-primary">Done</button>
        </div>
      </Screen>
    );
  }
  return (
    <Screen
      title="Compose"
      onBack={onBack}
      large={false}
      actions={<button onClick={send} disabled={state === 'sending'} aria-label="Send" className="w-12 h-12 rounded-full flex items-center justify-center md-state disabled:opacity-40"><Sym name="send" size={24} color="var(--md-primary)" /></button>}
    >
      <div className="px-4 pt-2 space-y-4">
        <div className="flex items-center gap-3 text-[15px]"><span className="md-variant w-12">To</span><span className="px-3 py-1.5 rounded-lg md-secondary-container">{PROFILE.name}</span></div>
        <input className="md-field" placeholder="Your name" aria-label="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className="md-field" type="email" placeholder="Your email" aria-label="Your email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input className="md-field" placeholder="Subject" aria-label="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
        <textarea className="md-field min-h-[180px] resize-none" placeholder="Compose email" aria-label="Message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
        {state === 'error' && <p className="text-[14px] text-[#B3261E]">{error}</p>}
        {state === 'sending' && <p className="text-[14px] md-variant">Sending…</p>}
      </div>
    </Screen>
  );
}

/* ------------------------------------------------------------------- Notes */

const NOTES = [
  { id: 'about', title: aboutHeadline, body: aboutParagraphs.join('\n\n'), tone: 'md-primary-container' },
  { id: 'now', title: `Now · ${nowData.lastUpdated}`, body: [nowData.focus, '', 'Building:', ...nowData.currentlyBuilding.map((x) => `• ${x}`), '', 'Learning:', ...nowData.currentlyLearning.map((x) => `• ${x}`)].join('\n'), tone: 'md-secondary-container' },
  { id: 'skills', title: 'Skills', body: skillGroups.map((g) => `${g.title}\n${g.skills.join(', ')}`).join('\n\n'), tone: 'md-surface-highest' },
  { id: 'reading', title: 'Reading list', body: nowData.currentlyReading.map((x) => `• ${x}`).join('\n'), tone: 'md-surface-high' },
];

export function NotesApp({ onBack }: { onBack: () => void }) {
  const [open, setOpen] = useState<string | null>(null);
  const note = NOTES.find((n) => n.id === open);
  return (
    <>
      <Screen title="Notes" onBack={onBack}>
        <div className="px-4 columns-2 gap-3">
          {NOTES.map((n) => (
            <button key={n.id} onClick={() => setOpen(n.id)} className={`w-full mb-3 break-inside-avoid text-left rounded-[20px] p-4 border md-outline ${n.tone} md-state`}>
              <span className="block text-[15px] font-medium mb-2">{n.title}</span>
              <span className="block text-[13px] opacity-80 whitespace-pre-line line-clamp-[9]">{n.body}</span>
            </button>
          ))}
        </div>
      </Screen>
      <AnimatePresence>
        {note && (
          <Detail key="n" title="" onBack={() => setOpen(null)}>
            <div className="px-5">
              <p className="text-[24px] mb-4">{note.title}</p>
              <p className="text-[16px] leading-relaxed whitespace-pre-line md-variant">{note.body}</p>
            </div>
          </Detail>
        )}
      </AnimatePresence>
    </>
  );
}

/* ----------------------------------------------------------------- Gallery */

export function GalleryApp({ onBack }: { onBack: () => void }) {
  const photos = usePhotoLibrary();
  const [open, setOpen] = useState<number | null>(null);
  return (
    <>
      <Screen title="Gallery" onBack={onBack}>
        <div className="grid grid-cols-3 gap-0.5 px-0.5">
          {photos.map((p, i) => (
            <button key={p.src + i} onClick={() => setOpen(i)} className="aspect-square overflow-hidden rounded-[4px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.src} alt={p.album} className="w-full h-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      </Screen>
      <AnimatePresence>
        {open !== null && photos[open] && (
          <motion.div key="v" className="absolute inset-0 z-20 bg-black flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photos[open].src} alt={photos[open].album} className="max-w-full max-h-full object-contain" />
            <button onClick={() => setOpen(null)} aria-label="Close" className="absolute top-10 left-3 w-12 h-12 rounded-full flex items-center justify-center"><Sym name="arrow_back" size={24} color="#fff" /></button>
            <div className="absolute bottom-8 inset-x-0 flex items-center justify-between px-6 text-white text-[13px]">
              <button aria-label="Previous" onClick={() => setOpen((open - 1 + photos.length) % photos.length)} className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center rotate-180"><Sym name="chevron_right" size={26} color="#fff" /></button>
              <span>{photos[open].album} · {open + 1}/{photos.length}</span>
              <button aria-label="Next" onClick={() => setOpen((open + 1) % photos.length)} className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center"><Sym name="chevron_right" size={26} color="#fff" /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ------------------------------------------------------------ GitHub, Term */

export function GitHubApp({ onBack }: { onBack: () => void }) {
  return <Screen title="GitHub" onBack={onBack}><GitHubPanel compact /></Screen>;
}

export function TerminalApp({ onBack, onOpenResume, onOpenProject, onOpenMail }: { onBack: () => void; onOpenResume: () => void; onOpenProject: (slug: string) => void; onOpenMail: () => void }) {
  return (
    <div className="absolute inset-0 bg-[#0C0C0C] pt-9 pb-6 flex flex-col">
      <div className="h-12 flex items-center gap-2 px-2 text-white/80 text-[14px]">
        <button onClick={onBack} aria-label="Back" className="w-10 h-10 rounded-full flex items-center justify-center"><Sym name="arrow_back" size={22} color="#fff" /></button>
        rtksh — ~
      </div>
      <div className="flex-1 min-h-0">
        <Terminal variant="windows" prompt="ritik@android:~$" onClose={onBack} onOpenResume={onOpenResume} onOpenProject={onOpenProject} onOpenMail={onOpenMail} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------- Music */

export function MusicApp({ onBack }: { onBack: () => void }) {
  const [current, setCurrent] = useState<MusicItem>(musicPicks[0]);
  return (
    <Screen title="Music" onBack={onBack}>
      <div className="px-4">
        <div className="rounded-[28px] md-primary-container p-4 flex gap-4 items-center mb-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={current.cover.replace('00001e02', '0000b273')} alt="" className="w-24 h-24 rounded-[16px] object-cover shadow-lg" />
          <div className="min-w-0">
            <p className="text-[12px] opacity-75">Now playing</p>
            <p className="text-[20px] font-medium leading-tight truncate">{current.title}</p>
            <p className="text-[14px] opacity-80 truncate">{current.artist}</p>
          </div>
        </div>
        <iframe key={current.id} title={`${current.title} on Spotify`} src={spotifyEmbed(current)} className="w-full rounded-[16px] border-0 mb-2" height={152} allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" />
        <a href={spotifyLink(current)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[14px] md-primary mb-4">Open in Spotify <Sym name="open_in_new" size={16} /></a>
        <p className="text-[14px] font-medium md-primary mb-2">Ritik&apos;s picks</p>
      </div>
      <Group>
        {musicPicks.map((t) => (
          <ListItem
            key={t.id}
            onClick={() => setCurrent(t)}
            // eslint-disable-next-line @next/next/no-img-element
            icon={<img src={t.cover} alt="" className="w-12 h-12 rounded-[10px] object-cover" loading="lazy" />}
            title={<span className={t.id === current.id ? 'md-primary font-medium' : ''}>{t.title}</span>}
            sub={t.artist}
            trailing={t.id === current.id ? <Sym name="music_note" size={20} color="var(--md-primary)" /> : undefined}
          />
        ))}
      </Group>
    </Screen>
  );
}

/* -------------------------------------------------------------- Calculator */

type Op = '+' | '−' | '×' | '÷' | null;
const calc = (a: number, b: number, op: Op) => (op === '+' ? a + b : op === '−' ? a - b : op === '×' ? a * b : op === '÷' ? (b === 0 ? NaN : a / b) : b);
const fmt = (n: number) => (!isFinite(n) ? "Can't divide by 0" : String(parseFloat(n.toPrecision(12))));

export function CalculatorApp({ onBack }: { onBack: () => void }) {
  const [display, setDisplay] = useState('0');
  const [acc, setAcc] = useState<number | null>(null);
  const [op, setOp] = useState<Op>(null);
  const [fresh, setFresh] = useState(true);
  const [expr, setExpr] = useState('');
  const digit = (d: string) => {
    if (fresh) { setDisplay(d === '.' ? '0.' : d); setFresh(false); return; }
    if (d === '.' && display.includes('.')) return;
    if (display.length >= 14) return;
    setDisplay(display === '0' && d !== '.' ? d : display + d);
  };
  const operator = (o: Op) => {
    const cur = parseFloat(display);
    let base = cur;
    if (acc !== null && !fresh) { base = calc(acc, cur, op); setDisplay(fmt(base)); } else if (acc !== null && fresh) base = acc;
    setAcc(base); setOp(o); setFresh(true); setExpr(`${fmt(base)} ${o}`);
  };
  const equals = () => {
    if (acc === null || op === null) return;
    const b = parseFloat(display);
    setExpr(`${fmt(acc)} ${op} ${fmt(b)}`);
    setDisplay(fmt(calc(acc, b, op))); setAcc(null); setOp(null); setFresh(true);
  };
  const clear = () => { setDisplay('0'); setAcc(null); setOp(null); setExpr(''); setFresh(true); };
  const b = 'rounded-full text-[28px] flex items-center justify-center md-state active:rounded-[22px] transition-[border-radius]';
  return (
    <div className="absolute inset-0 md-surface flex flex-col pt-9">
      <div className="h-14 flex items-center px-1">
        <button onClick={onBack} aria-label="Back" className="w-12 h-12 rounded-full flex items-center justify-center md-state"><Sym name="arrow_back" size={24} /></button>
      </div>
      <div className="flex-1 flex flex-col justify-end px-6 pb-4 text-right">
        <p className="text-[24px] md-variant h-8 truncate">{expr}</p>
        <p className="text-[64px] leading-tight tabular-nums truncate">{display}</p>
      </div>
      <div className="md-surface-container rounded-t-[32px] p-4 pb-10 grid grid-cols-4 gap-3 h-[58%]">
        <button className={`${b} md-primary-container`} onClick={clear}>AC</button>
        <button className={`${b} md-secondary-container`} onClick={() => setDisplay(fmt(-parseFloat(display)))}>±</button>
        <button className={`${b} md-secondary-container`} onClick={() => setDisplay(fmt(parseFloat(display) / 100))}>%</button>
        <button className={`${b} md-secondary-container`} onClick={() => operator('÷')}>÷</button>
        {['7', '8', '9'].map((d) => <button key={d} className={`${b} md-surface-highest`} onClick={() => digit(d)}>{d}</button>)}
        <button className={`${b} md-secondary-container`} onClick={() => operator('×')}>×</button>
        {['4', '5', '6'].map((d) => <button key={d} className={`${b} md-surface-highest`} onClick={() => digit(d)}>{d}</button>)}
        <button className={`${b} md-secondary-container`} onClick={() => operator('−')}>−</button>
        {['1', '2', '3'].map((d) => <button key={d} className={`${b} md-surface-highest`} onClick={() => digit(d)}>{d}</button>)}
        <button className={`${b} md-secondary-container`} onClick={() => operator('+')}>+</button>
        <button className={`${b} md-surface-highest`} onClick={() => digit('0')}>0</button>
        <button className={`${b} md-surface-highest`} onClick={() => digit('.')}>.</button>
        <button className={`${b} md-surface-highest`} aria-label="Backspace" onClick={() => setDisplay((d) => (d.length > 1 ? d.slice(0, -1) : '0'))}>⌫</button>
        <button className={`${b} md-bg-primary`} onClick={equals}>=</button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- Settings */

export function SettingsApp({
  onBack, dark, setDark, themed, setThemed, wallpaper, setWallpaper, brightness, setBrightness, onSwitch,
}: {
  onBack: () => void;
  dark: boolean; setDark: (d: boolean) => void;
  themed: boolean; setThemed: (t: boolean) => void;
  wallpaper: string; setWallpaper: (w: string) => void;
  brightness: number; setBrightness: (b: number) => void;
  onSwitch: (to: 'mac' | 'windows' | 'classic' | 'all') => void;
}) {
  const [page, setPage] = useState<null | 'style' | 'display' | 'about' | 'editions'>(null);
  const rows = [
    { id: 'style' as const, icon: 'palette', title: 'Wallpaper & style', sub: 'Colours, themed icons' },
    { id: 'display' as const, icon: 'brightness_medium', title: 'Display', sub: 'Dark theme, brightness' },
    { id: 'editions' as const, icon: 'apps', title: 'RitikOS editions', sub: 'Mac, Windows, classic site' },
    { id: 'about' as const, icon: 'badge', title: 'About phone', sub: 'RitikOS Android edition' },
  ];
  return (
    <>
      <Screen title="Settings" onBack={onBack}>
        <div className="px-4 mb-4">
          <div className="rounded-[28px] md-primary-container p-4 flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={PROFILE.photo} alt="" className="w-14 h-14 rounded-full object-cover" />
            <div className="min-w-0">
              <p className="text-[18px] font-medium">{PROFILE.name}</p>
              <p className="text-[13px] opacity-80 truncate">{PROFILE.role}</p>
            </div>
          </div>
        </div>
        <Group>
          {rows.map((r) => (
            <ListItem key={r.id} onClick={() => setPage(r.id)} icon={<span className="w-10 h-10 rounded-full md-secondary-container flex items-center justify-center"><Sym name={r.icon} size={20} /></span>} title={r.title} sub={r.sub} />
          ))}
        </Group>
      </Screen>
      <AnimatePresence>
        {page === 'style' && (
          <Detail key="s" title="Wallpaper & style" onBack={() => setPage(null)}>
            <div className="px-4">
              <div className="grid grid-cols-2 gap-3 mb-5">
                {ANDROID_WALLPAPERS.map((w) => (
                  <button key={w.id} onClick={() => setWallpaper(w.id)} aria-pressed={wallpaper === w.id} className={`h-40 rounded-[24px] and-wallpaper-${w.id} relative border-4 ${wallpaper === w.id ? 'border-[var(--md-primary)]' : 'border-transparent'}`}>
                    <span className="absolute bottom-2 left-3 text-white text-[13px] drop-shadow">{w.label}</span>
                  </button>
                ))}
              </div>
              <p className="text-[14px] md-variant mb-3">Every colour in the system is picked from the wallpaper, Material You style.</p>
              <Group className="!mx-0">
                <SwitchRow title="Themed icons" sub="Tint app icons to match the wallpaper" on={themed} set={setThemed} />
                <SwitchRow title="Dark theme" on={dark} set={setDark} />
              </Group>
              <div className="flex gap-3 mt-5 justify-center">
                {(['projects', 'mail', 'music', 'settings'] as const).map((id) => <AppIcon key={id} id={id} size={52} themed={themed} />)}
              </div>
            </div>
          </Detail>
        )}
        {page === 'display' && (
          <Detail key="d" title="Display" onBack={() => setPage(null)}>
            <Group>
              <SwitchRow title="Dark theme" sub="Easier on the eyes at night" on={dark} set={setDark} />
            </Group>
            <div className="px-4 mt-5">
              <p className="text-[14px] md-primary font-medium mb-2">Brightness</p>
              <input type="range" min={0.35} max={1} step={0.01} value={brightness} onChange={(e) => setBrightness(parseFloat(e.target.value))} aria-label="Brightness" className="md-slider w-full" style={{ ['--p' as string]: `${((brightness - 0.35) / 0.65) * 100}%` }} />
            </div>
          </Detail>
        )}
        {page === 'editions' && (
          <Detail key="e" title="RitikOS editions" onBack={() => setPage(null)}>
            <p className="px-4 mb-3 md-variant text-[14px]">Same portfolio and live data, three different skins.</p>
            <Group>
              <ListItem onClick={() => onSwitch('mac')} icon={<Sym name="apps" size={24} color="var(--md-primary)" />} title="Mac edition" sub="iPhone-style on phones, desktop Mac on laptops" />
              <ListItem onClick={() => onSwitch('windows')} icon={<Sym name="code" size={24} color="var(--md-primary)" />} title="Windows edition" sub="Fluent desktop with Start menu (laptops)" />
              <ListItem onClick={() => onSwitch('all')} icon={<Sym name="apps" size={24} color="var(--md-primary)" />} title="All editions" sub="Back to the edition picker" />
              <ListItem onClick={() => onSwitch('classic')} icon={<Sym name="language" size={24} color="var(--md-primary)" />} title="Classic portfolio" sub="The regular scrolling website" />
            </Group>
          </Detail>
        )}
        {page === 'about' && (
          <Detail key="a" title="About phone" onBack={() => setPage(null)}>
            <Group>
              {[
                ['Device name', "Ritik's phone"],
                ['System', 'RitikOS Android edition 3.0'],
                ['Built with', 'Next.js 15 · React 19 · TypeScript'],
                ['Design', 'Material 3 — Material Symbols (Apache 2.0)'],
                ['Owner', `${PROFILE.name} · ${PROFILE.school}`],
              ].map(([k, v]) => <ListItem key={k} title={k} sub={v} />)}
            </Group>
            <p className="px-6 mt-4 text-[12px] md-variant">Inspired by Android’s design language. Not affiliated with or endorsed by Google.</p>
          </Detail>
        )}
      </AnimatePresence>
    </>
  );
}

function SwitchRow({ title, sub, on, set }: { title: string; sub?: string; on: boolean; set: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-4 px-4 py-3">
      <div className="flex-1 min-w-0"><p className="text-[16px]">{title}</p>{sub && <p className="text-[14px] md-variant">{sub}</p>}</div>
      <button role="switch" aria-checked={on} aria-label={title} onClick={() => set(!on)} className="md-switch" />
    </div>
  );
}

/* ---------------------------------------------------------------- Contacts */

export function ContactsApp({ onBack, onMail }: { onBack: () => void; onMail: () => void }) {
  return (
    <Screen title="" onBack={onBack} large={false}>
      <div className="flex flex-col items-center px-4 pt-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={PROFILE.photo} alt="" className="w-36 h-36 rounded-full object-cover mb-4" />
        <p className="text-[28px]">{PROFILE.name}</p>
        <p className="md-variant">{PROFILE.role}</p>
        <div className="flex gap-6 my-6">
          {[
            { label: 'Email', icon: 'mail', run: onMail },
            { label: 'GitHub', icon: 'code', href: PROFILE.github },
            { label: 'LinkedIn', icon: 'work', href: PROFILE.linkedin },
            { label: 'LeetCode', icon: 'code_blocks', href: PROFILE.leetcode },
          ].map((a) => {
            const inner = (
              <>
                <span className="w-14 h-14 rounded-[18px] md-secondary-container flex items-center justify-center"><Sym name={a.icon} size={22} /></span>
                <span className="text-[12px]">{a.label}</span>
              </>
            );
            return a.href ? (
              <a key={a.label} href={a.href} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1.5">{inner}</a>
            ) : (
              <button key={a.label} onClick={a.run} className="flex flex-col items-center gap-1.5">{inner}</button>
            );
          })}
        </div>
      </div>
      <Group>
        <ListItem icon={<Sym name="mail" size={22} color="var(--md-on-surface-variant)" />} title={PROFILE.email} sub="Email" href={`mailto:${PROFILE.email}`} />
        <ListItem icon={<Sym name="badge" size={22} color="var(--md-on-surface-variant)" />} title={PROFILE.school} sub="Education" />
        <ListItem icon={<Sym name="language" size={22} color="var(--md-on-surface-variant)" />} title="ritikagarwal.me" sub="Website" href={PROFILE.site} />
      </Group>
    </Screen>
  );
}

/* ------------------------------------------------------------------ Résumé */

export function ResumeApp({ onBack }: { onBack: () => void }) {
  return (
    <Screen
      title="Résumé"
      onBack={onBack}
      large={false}
      fab={
        <a href="/resume.pdf" download="Ritik_Agarwal_Resume.pdf" className="absolute right-4 bottom-10 h-14 px-5 rounded-[16px] md-primary-container flex items-center gap-2 shadow-lg font-medium">
          <Sym name="download" size={22} /> Download
        </a>
      }
    >
      <div className="px-4">
        <div className="rounded-[20px] md-surface-container p-4 mb-3 flex items-center gap-3">
          <Sym name="description" size={28} color="var(--md-primary)" />
          <div className="flex-1 min-w-0">
            <p className="font-medium">Ritik_Agarwal_Resume.pdf</p>
            <p className="text-[13px] md-variant">Updated {new Date(resumeUpdated).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
          </div>
          <a href="/resume.pdf" target="_blank" rel="noopener noreferrer" className="h-10 px-4 rounded-full md-bg-primary flex items-center text-[14px]">Open</a>
        </div>
        <iframe src="/resume.pdf#view=FitH" title="Résumé" className="w-full h-[560px] rounded-[16px] bg-[#525659]" />
      </div>
    </Screen>
  );
}

/* --------------------------------------------------------------- Assistant */

export function AssistantApp({ onBack, enabled }: { onBack: () => void; enabled: boolean }) {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => endRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' }), [messages, busy]);
  const send = async (text: string) => {
    const q = text.trim();
    if (!q || busy) return;
    const next = [...messages, { role: 'user' as const, content: q }];
    setMessages(next); setInput(''); setBusy(true); setError('');
    try {
      const a = await askAssistant(next);
      setMessages([...next, { role: 'assistant', content: a.replace(/\*\*(.+?)\*\*/g, '$1') }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="absolute inset-0 md-surface flex flex-col pt-9">
      <div className="h-16 flex items-center gap-2 px-1">
        <button onClick={onBack} aria-label="Back" className="w-12 h-12 rounded-full flex items-center justify-center md-state"><Sym name="arrow_back" size={24} /></button>
        <span className="w-9 h-9 rounded-full md-primary-container flex items-center justify-center"><Sym name="smart_toy" size={20} /></span>
        <div><p className="text-[17px]">Ask Ritik</p><p className="text-[12px] md-variant">Answers only from this portfolio</p></div>
      </div>
      <div className="flex-1 overflow-y-auto md-scroll px-4 space-y-3 pb-4">
        {!enabled && <p className="md-variant text-[14px] pt-6">The assistant is offline right now.</p>}
        {enabled && messages.length === 0 && (
          <div className="pt-10">
            <p className="text-[32px] leading-tight mb-6"><span className="md-primary">Hi!</span> What would you like to know about Ritik?</p>
            <div className="flex flex-col gap-2 items-start">
              {['What has Ritik built?', 'Is he open to internships?', 'Which project shows backend skills best?'].map((s) => (
                <button key={s} onClick={() => send(s)} className="px-4 py-2.5 rounded-[12px] border md-outline text-[14px] md-state">{s}</button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex'}>
            <p className={`max-w-[85%] whitespace-pre-wrap px-4 py-2.5 text-[15px] ${m.role === 'user' ? 'md-primary-container rounded-[20px] rounded-br-[6px]' : 'md-surface-container rounded-[20px] rounded-bl-[6px]'}`}>{m.content}</p>
          </div>
        ))}
        {busy && <p className="md-variant text-[13px]">Thinking…</p>}
        {error && <p className="text-[#B3261E] text-[13px]">{error}</p>}
        <div ref={endRef} />
      </div>
      <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="px-3 pb-8 pt-2 flex items-center gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} disabled={!enabled} maxLength={600} placeholder="Ask anything about Ritik" aria-label="Question" className="flex-1 h-14 rounded-full md-surface-high px-5 outline-none text-[15px]" />
        <button type="submit" disabled={!input.trim() || busy} aria-label="Send" className="w-14 h-14 rounded-[18px] md-bg-primary flex items-center justify-center disabled:opacity-40"><Sym name="send" size={22} /></button>
      </form>
    </div>
  );
}
