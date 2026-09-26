'use client';

import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react';
import { motion } from 'framer-motion';
import { useActivity, useBlogs, useProjects } from '@/components/os/data';
import { nowData } from '@/data/now';

/* ------------------------------------------------------------------ Icons */

/** Material Symbols (Apache 2.0) from /public/os-icons/material, recoloured with a CSS mask. */
export function Sym({ name, size = 24, color = 'currentColor', className = '', style }: { name: string; size?: number; color?: string; className?: string; style?: CSSProperties }) {
  const src = `/os-icons/material/${name}.svg`;
  return (
    <span
      aria-hidden
      className={`inline-block shrink-0 ${className}`}
      style={{ width: size, height: size, background: color, WebkitMask: `url(${src}) center / contain no-repeat`, mask: `url(${src}) center / contain no-repeat`, ...style }}
    />
  );
}

export type AndAppId =
  | 'projects' | 'experience' | 'certificates' | 'web' | 'mail' | 'notes' | 'gallery' | 'github'
  | 'terminal' | 'music' | 'calculator' | 'settings' | 'contacts' | 'assistant' | 'resume';

/** name, glyph, colourful-mode tint */
export const AND_APPS: Record<AndAppId, { name: string; glyph: string; tint: [string, string] }> = {
  projects: { name: 'Projects', glyph: 'folder-fill', tint: ['#FFD8A8', '#8A4B00'] },
  experience: { name: 'Experience', glyph: 'work-fill', tint: ['#C7E0FF', '#0B4F9C'] },
  certificates: { name: 'Certificates', glyph: 'badge-fill', tint: ['#FFE08A', '#6B5100'] },
  web: { name: 'Web', glyph: 'public', tint: ['#C4EED0', '#0F6B35'] },
  mail: { name: 'Mail', glyph: 'mail-fill', tint: ['#FFD6D2', '#A3261C'] },
  notes: { name: 'Notes', glyph: 'sticky_note_2-fill', tint: ['#FFF0A6', '#6B5A00'] },
  gallery: { name: 'Gallery', glyph: 'photo_library-fill', tint: ['#E4D7FF', '#5A3FB8'] },
  github: { name: 'GitHub', glyph: 'code_blocks', tint: ['#D9DDE3', '#24292F'] },
  terminal: { name: 'Terminal', glyph: 'terminal', tint: ['#2B2B2B', '#9CE59C'] },
  music: { name: 'Music', glyph: 'music_note', tint: ['#FFD1E4', '#B0165C'] },
  calculator: { name: 'Calculator', glyph: 'calculate-fill', tint: ['#D2F1F0', '#00696E'] },
  settings: { name: 'Settings', glyph: 'settings-fill', tint: ['#DDE3EA', '#3F4A57'] },
  contacts: { name: 'Contacts', glyph: 'contacts-fill', tint: ['#CDE5FF', '#00497D'] },
  assistant: { name: 'Ask Ritik', glyph: 'smart_toy-fill', tint: ['#E8DDFF', '#4F378B'] },
  resume: { name: 'Résumé', glyph: 'description-fill', tint: ['#FFDAD6', '#8C1D18'] },
};

export function AppIcon({ id, size = 56, themed }: { id: AndAppId; size?: number; themed: boolean }) {
  const a = AND_APPS[id];
  const bg = themed ? 'var(--md-primary-container)' : a.tint[0];
  const fg = themed ? 'var(--md-on-primary-container)' : a.tint[1];
  return (
    <span className="inline-flex items-center justify-center rounded-full shrink-0 shadow-[0_1px_3px_rgba(0,0,0,.25)]" style={{ width: size, height: size, background: bg }}>
      <Sym name={a.glyph} size={size * 0.46} color={fg} />
    </span>
  );
}

/* ------------------------------------------------------------- Status bar */

export function StatusBar({ tone, onPull }: { tone: 'light' | 'dark'; onPull?: () => void }) {
  const now = useClock();
  const c = tone === 'light' ? '#fff' : 'var(--md-on-surface)';
  return (
    <button
      onClick={onPull}
      aria-label="Open notifications and quick settings"
      className="absolute top-0 inset-x-0 h-9 z-40 flex items-center justify-between px-6 text-[14px] font-medium"
      style={{ color: c }}
    >
      <span className="tabular-nums">{now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
      <span className="flex items-center gap-1">
        <Sym name="wifi" size={17} color={c} />
        <Sym name="signal_cellular_alt" size={17} color={c} />
        <Sym name="battery_full" size={17} color={c} style={{ transform: 'rotate(90deg)' }} />
      </span>
    </button>
  );
}

export function useClock(interval = 10_000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), interval);
    return () => clearInterval(t);
  }, [interval]);
  return now;
}

/** Vertical drag helper: calls back when the pointer travels far enough up/down. */
function useSwipe(onUp?: () => void, onDown?: () => void, threshold = 50) {
  const start = useRef<number | null>(null);
  return {
    onPointerDown: (e: ReactPointerEvent) => { start.current = e.clientY; },
    onPointerUp: (e: ReactPointerEvent) => {
      if (start.current === null) return;
      const dy = e.clientY - start.current;
      start.current = null;
      if (dy < -threshold) onUp?.();
      else if (dy > threshold) onDown?.();
    },
    onPointerCancel: () => { start.current = null; },
  };
}

/* ----------------------------------------------------------- Lock screen */

export function LockScreen({ wallpaper, onUnlock }: { wallpaper: string; onUnlock: () => void }) {
  const now = useClock();
  const swipe = useSwipe(onUnlock);
  const hh = now.toLocaleTimeString('en-GB', { hour: '2-digit' }).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  useEffect(() => {
    const k = (e: KeyboardEvent) => (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowUp') && onUnlock();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onUnlock]);
  return (
    <motion.div
      className={`absolute inset-0 z-50 and-wallpaper-${wallpaper} text-white select-none touch-none`}
      exit={{ y: '-100%', opacity: 0.4 }}
      transition={{ duration: 0.35, ease: [0.2, 0, 0, 1] }}
      {...swipe}
    >
      <div className="absolute inset-0 bg-black/15" />
      <StatusBar tone="light" />
      <div className="relative pt-24 px-8">
        <p className="text-[15px] font-medium opacity-95">{now.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })} · Now: learning DSA</p>
        <div className="mt-6 leading-[0.86] font-normal tabular-nums drop-shadow-sm" style={{ fontSize: 132, color: 'var(--md-primary-container)' }}>
          <div>{hh}</div>
          <div>{mm}</div>
        </div>
      </div>
      <div className="absolute bottom-0 inset-x-0 pb-10 flex flex-col items-center gap-5">
        <button onClick={onUnlock} aria-label="Unlock" className="w-16 h-16 rounded-full flex items-center justify-center bg-white/10 backdrop-blur">
          <Sym name="fingerprint" size={40} color="#fff" />
        </button>
        <p className="text-[13px] opacity-85">Swipe up or tap to unlock</p>
      </div>
      <div className="absolute bottom-10 left-8"><Sym name="flashlight_on" size={24} color="#fff" /></div>
      <div className="absolute bottom-10 right-8"><Sym name="photo_library" size={24} color="#fff" /></div>
    </motion.div>
  );
}

/* ----------------------------------------------------------- Home screen */

export const HOME_GRID: AndAppId[] = ['projects', 'experience', 'certificates', 'resume', 'notes', 'gallery', 'github', 'music'];
export const DOCK: AndAppId[] = ['mail', 'web', 'assistant', 'terminal'];

export function HomeScreen({
  wallpaper, themed, onOpen, onDrawer, onShade, hidden,
}: {
  wallpaper: string;
  themed: boolean;
  onOpen: (id: AndAppId, rect: DOMRect) => void;
  onDrawer: () => void;
  onShade: () => void;
  hidden: Set<string>;
}) {
  const now = useClock();
  const activity = useActivity();
  const { data: posts } = useBlogs();
  const swipe = useSwipe(onDrawer, onShade, 60);
  const latest = activity?.github?.latest;

  return (
    <div className={`absolute inset-0 and-wallpaper-${wallpaper} select-none touch-none`} {...swipe}>
      <div className="absolute inset-0 bg-black/10" />
      <StatusBar tone="light" onPull={onShade} />

      {/* At a Glance */}
      <div className="relative pt-16 px-6 text-white">
        <p className="text-[22px] leading-tight drop-shadow-sm">{now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })}</p>
        <p className="text-[14px] opacity-90 mt-1 drop-shadow-sm flex items-center gap-1.5">
          <Sym name="code" size={16} color="#fff" />
          {latest ? `Pushed to ${latest.repo}` : nowData.focus.split('.')[0]}
        </p>
      </div>

      {/* Widgets */}
      <div className="relative px-4 mt-6 grid grid-cols-2 gap-3">
        <button onClick={(e) => onOpen('notes', e.currentTarget.getBoundingClientRect())} className="rounded-[28px] md-primary-container p-4 text-left h-[152px] flex flex-col md-state">
          <span className="text-[12px] font-medium opacity-80">Now</span>
          <span className="text-[17px] leading-snug font-medium mt-1 line-clamp-4">{nowData.focus}</span>
        </button>
        <div className="grid grid-rows-2 gap-3">
          <button onClick={(e) => onOpen('github', e.currentTarget.getBoundingClientRect())} className="rounded-[24px] md-surface-container md-on-surface px-4 text-left flex items-center gap-3 md-state">
            <Sym name="code_blocks" size={22} color="var(--md-primary)" />
            <span className="min-w-0">
              <span className="block text-[12px] md-variant">GitHub</span>
              <span className="block text-[14px] font-medium truncate">{latest ? latest.repo : 'Live activity'}</span>
            </span>
          </button>
          <button onClick={(e) => posts?.[0] && onOpen('web', e.currentTarget.getBoundingClientRect())} className="rounded-[24px] md-secondary-container px-4 text-left flex items-center gap-3 md-state">
            <Sym name="description" size={22} color="currentColor" />
            <span className="min-w-0">
              <span className="block text-[12px] opacity-75">Latest post</span>
              <span className="block text-[14px] font-medium truncate">{posts?.[0]?.title ?? 'Blog'}</span>
            </span>
          </button>
        </div>
      </div>

      {/* App grid + dock */}
      <div className="absolute inset-x-0 bottom-0 pb-7 px-4">
        <div className="grid grid-cols-4 gap-y-5 mb-7">
          {HOME_GRID.map((id) => (
            <IconButton key={id} id={id} themed={themed} hidden={hidden.has(id)} onOpen={onOpen} label />
          ))}
        </div>
        <div className="grid grid-cols-4 mb-5">
          {DOCK.map((id) => (
            <IconButton key={id} id={id} themed={themed} hidden={hidden.has(id)} onOpen={onOpen} />
          ))}
        </div>
        <button onClick={onDrawer} className="w-full h-14 rounded-full md-surface-high md-on-surface flex items-center gap-3 px-5 shadow-md" aria-label="Search apps">
          <span className="w-7 h-7 rounded-full md-bg-primary flex items-center justify-center text-[13px] font-bold" style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}>R</span>
          <span className="text-[15px] md-variant flex-1 text-left">Search apps, projects…</span>
          <Sym name="smart_toy" size={22} color="var(--md-primary)" />
        </button>
      </div>
    </div>
  );
}

function IconButton({ id, themed, hidden, onOpen, label }: { id: AndAppId; themed: boolean; hidden: boolean; onOpen: (id: AndAppId, r: DOMRect) => void; label?: boolean }) {
  return (
    <button
      onClick={(e) => onOpen(id, e.currentTarget.getBoundingClientRect())}
      className="flex flex-col items-center gap-1.5 active:scale-95 transition-transform"
      style={{ opacity: hidden ? 0 : 1 }}
      aria-label={AND_APPS[id].name}
    >
      <AppIcon id={id} size={56} themed={themed} />
      {label && <span className="text-[12px] text-white drop-shadow-[0_1px_2px_rgba(0,0,0,.6)] truncate max-w-[76px]">{AND_APPS[id].name}</span>}
    </button>
  );
}

/* -------------------------------------------------------------- App drawer */

export function AppDrawer({ themed, onOpen, onClose, onOpenProject, onOpenPost }: {
  themed: boolean;
  onOpen: (id: AndAppId, r: DOMRect) => void;
  onClose: () => void;
  onOpenProject: (slug: string) => void;
  onOpenPost: (slug: string) => void;
}) {
  const [q, setQ] = useState('');
  const { data: projects } = useProjects();
  const { data: posts } = useBlogs();
  const t = q.trim().toLowerCase();
  const apps = (Object.keys(AND_APPS) as AndAppId[]).sort((a, b) => AND_APPS[a].name.localeCompare(AND_APPS[b].name)).filter((id) => AND_APPS[id].name.toLowerCase().includes(t));
  const pr = t ? (projects ?? []).filter((p) => `${p.title} ${p.short_description ?? ''}`.toLowerCase().includes(t)) : [];
  const po = t ? (posts ?? []).filter((p) => p.title.toLowerCase().includes(t)) : [];
  const swipe = useSwipe(undefined, () => !q && onClose(), 70);

  return (
    <motion.div
      className="absolute inset-0 z-30 md-surface rounded-t-[28px] flex flex-col"
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 380, damping: 40 }}
    >
      <div className="pt-12 px-4 pb-3" {...swipe}>
        <div className="mx-auto w-8 h-1 rounded-full bg-[var(--md-outline-variant)] mb-4" />
        <label className="h-14 rounded-full md-surface-high flex items-center gap-3 px-5">
          <Sym name="search" size={22} color="var(--md-on-surface-variant)" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search apps, projects, posts" aria-label="Search" className="flex-1 bg-transparent outline-none text-[16px] placeholder:text-[var(--md-on-surface-variant)]" />
          {q && <button aria-label="Clear" onClick={() => setQ('')}><Sym name="close" size={20} color="var(--md-on-surface-variant)" /></button>}
        </label>
      </div>
      <div className="flex-1 overflow-y-auto md-scroll px-4 pb-10">
        <div className="grid grid-cols-4 gap-y-5 pt-2">
          {apps.map((id) => (
            <button key={id} onClick={(e) => onOpen(id, e.currentTarget.getBoundingClientRect())} className="flex flex-col items-center gap-1.5 active:scale-95 transition-transform">
              <AppIcon id={id} size={56} themed={themed} />
              <span className="text-[12px] truncate max-w-[76px]">{AND_APPS[id].name}</span>
            </button>
          ))}
        </div>
        {(pr.length > 0 || po.length > 0) && (
          <div className="mt-6 rounded-[24px] md-surface-container overflow-hidden">
            {pr.map((p) => (
              <button key={p.id} onClick={() => onOpenProject(p.slug)} className="w-full flex items-center gap-4 px-4 py-3 text-left md-state">
                <Sym name="folder" size={22} color="var(--md-primary)" />
                <span className="min-w-0"><span className="block truncate">{p.title}</span><span className="block text-[12px] md-variant truncate">Project</span></span>
              </button>
            ))}
            {po.map((p) => (
              <button key={p.id} onClick={() => onOpenPost(p.slug)} className="w-full flex items-center gap-4 px-4 py-3 text-left md-state">
                <Sym name="description" size={22} color="var(--md-primary)" />
                <span className="min-w-0"><span className="block truncate">{p.title}</span><span className="block text-[12px] md-variant truncate">Blog post</span></span>
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------ Notification shade + QS */

export function Shade({
  dark, setDark, brightness, setBrightness, onClose, onOpen, onSettings,
}: {
  dark: boolean;
  setDark: (d: boolean) => void;
  brightness: number;
  setBrightness: (b: number) => void;
  onClose: () => void;
  onOpen: (what: { app: AndAppId; post?: string }) => void;
  onSettings: () => void;
}) {
  const now = useClock();
  const [wifi, setWifi] = useState(true);
  const [bt, setBt] = useState(false);
  const [dnd, setDnd] = useState(false);
  const [torch, setTorch] = useState(false);
  const [plane, setPlane] = useState(false);
  const activity = useActivity();
  const { data: posts } = useBlogs();
  const swipe = useSwipe(onClose, undefined, 50);

  const tiles = [
    { label: 'Internet', sub: wifi ? 'RitikNet' : 'Off', on: wifi, set: () => setWifi(!wifi), icon: 'wifi' },
    { label: 'Bluetooth', sub: bt ? 'On' : 'Off', on: bt, set: () => setBt(!bt), icon: 'bluetooth' },
    { label: 'Dark theme', sub: dark ? 'On' : 'Off', on: dark, set: () => setDark(!dark), icon: 'dark_mode' },
    { label: 'Do Not Disturb', sub: dnd ? 'On' : 'Off', on: dnd, set: () => setDnd(!dnd), icon: 'do_not_disturb_on' },
    { label: 'Torch', sub: torch ? 'On' : 'Off', on: torch, set: () => setTorch(!torch), icon: 'flashlight_on' },
    { label: 'Aeroplane mode', sub: plane ? 'On' : 'Off', on: plane, set: () => setPlane(!plane), icon: 'flight' },
  ];

  const notes = useMemo(() => {
    const out: { key: string; app: string; icon: string; title: string; body: string; run: () => void }[] = [];
    const latest = activity?.github?.latest;
    if (latest) out.push({ key: 'gh', app: 'GitHub', icon: 'code_blocks', title: `Pushed to ${latest.repo}`, body: latest.message ?? 'New commits', run: () => onOpen({ app: 'github' }) });
    if (posts?.[0]) out.push({ key: 'post', app: 'Web', icon: 'public', title: 'New blog post', body: posts[0].title, run: () => onOpen({ app: 'web', post: posts[0].slug }) });
    out.push({ key: 'hi', app: 'RitikOS', icon: 'notifications', title: 'Welcome to the Android edition', body: 'Swipe up for all apps. Change the wallpaper in Settings and watch every colour follow it.', run: () => onSettings() });
    return out;
  }, [activity, posts, onOpen, onSettings]);

  return (
    <motion.div
      className="absolute inset-0 z-40 bg-black/45 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="absolute inset-x-0 top-0 md-surface-low rounded-b-[32px] px-4 pt-10 pb-4 shadow-2xl max-h-full overflow-y-auto md-scroll"
        initial={{ y: -60 }}
        animate={{ y: 0 }}
        exit={{ y: -60 }}
        transition={{ type: 'spring', stiffness: 420, damping: 38 }}
        onClick={(e) => e.stopPropagation()}
        {...swipe}
      >
        <div className="flex items-center justify-between px-2 mb-4">
          <div>
            <p className="text-[28px] leading-none tabular-nums">{now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</p>
            <p className="text-[13px] md-variant mt-1">{now.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={onSettings} aria-label="Settings" className="w-10 h-10 rounded-full md-surface-highest flex items-center justify-center md-state"><Sym name="settings" size={20} /></button>
            <button onClick={onClose} aria-label="Close" className="w-10 h-10 rounded-full md-surface-highest flex items-center justify-center md-state"><Sym name="keyboard_arrow_up" size={22} /></button>
          </div>
        </div>

        <div className="rounded-[26px] mb-3 overflow-hidden">
          <label className="block relative">
            <input
              type="range" min={0.35} max={1} step={0.01} value={brightness}
              onChange={(e) => setBrightness(parseFloat(e.target.value))}
              aria-label="Brightness"
              className="md-slider w-full block"
              style={{ ['--p' as string]: `${((brightness - 0.35) / 0.65) * 100}%` }}
            />
            <Sym name="brightness_medium" size={20} color="var(--md-on-primary)" className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          {tiles.map((t) => (
            <button key={t.label} onClick={t.set} aria-pressed={t.on} className={`h-[68px] rounded-[22px] flex items-center gap-3 px-4 text-left md-state ${t.on ? 'md-bg-primary' : 'md-surface-highest md-on-surface'}`}>
              <Sym name={t.icon} size={22} />
              <span className="min-w-0">
                <span className="block text-[14px] font-medium truncate">{t.label}</span>
                <span className="block text-[12px] opacity-80 truncate">{t.sub}</span>
              </span>
            </button>
          ))}
        </div>

        <div className="space-y-1.5">
          {notes.map((n, i) => (
            <button
              key={n.key}
              onClick={n.run}
              className={`w-full text-left md-surface-container px-4 py-3 md-state ${i === 0 ? 'rounded-t-[22px]' : 'rounded-t-[6px]'} ${i === notes.length - 1 ? 'rounded-b-[22px]' : 'rounded-b-[6px]'}`}
            >
              <p className="flex items-center gap-2 text-[12px] md-variant mb-1"><span className="w-6 h-6 rounded-full md-primary-container flex items-center justify-center"><Sym name={n.icon} size={14} /></span>{n.app}</p>
              <p className="text-[14px] font-medium">{n.title}</p>
              <p className="text-[13px] md-variant line-clamp-2">{n.body}</p>
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ---------------------------------------------------------- Gesture bar */

export function GestureBar({ tone, onHome }: { tone: 'light' | 'dark'; onHome: () => void }) {
  const swipe = useSwipe(onHome, undefined, 20);
  return (
    <button onClick={onHome} aria-label="Home" className="absolute bottom-0 inset-x-0 h-6 z-[60] flex items-center justify-center touch-none" {...swipe}>
      <span className="w-28 h-1 rounded-full" style={{ background: tone === 'light' ? 'rgba(255,255,255,.85)' : 'var(--md-on-surface)' }} />
    </button>
  );
}
