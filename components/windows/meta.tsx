'use client';

// App registry + icons for RitikOS Fluent Edition (/magic/windows).
// Icons are Microsoft's open-source Fluent UI System Icons (MIT, vendored in
// /public/os-icons/fluent) or drawn here. No Windows logo, no Edge/Store
// artwork — the Start button is the RA monogram.

import type { CSSProperties, ReactNode } from 'react';

export type WinAppId =
  | 'explorer'
  | 'browser'
  | 'mail'
  | 'notepad'
  | 'photos'
  | 'terminal'
  | 'github'
  | 'music'
  | 'settings'
  | 'calculator'
  | 'copilot'
  | 'resume'
  | 'recycle'
  | 'about';

interface AppMeta {
  name: string;
  w: number;
  h: number;
  icon: (size?: number) => ReactNode;
  /** Short line shown in Start search results. */
  blurb: string;
}

const F = (name: string) => `/os-icons/fluent/${name}.svg`;

export function Fluent({ name, size = 24, className = '' }: { name: string; size?: number; className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={F(name)} alt="" width={size} height={size} className={`shrink-0 select-none ${className}`} draggable={false} />;
}

/** Monochrome icon recoloured via CSS mask (Fluent "filled" or Material Symbols). */
export function MaskIcon({ src, size = 20, color = 'currentColor', style }: { src: string; size?: number; color?: string; style?: CSSProperties }) {
  return (
    <span
      aria-hidden
      className="inline-block shrink-0"
      style={{
        width: size,
        height: size,
        background: color,
        WebkitMask: `url(${src}) center / contain no-repeat`,
        mask: `url(${src}) center / contain no-repeat`,
        ...style,
      }}
    />
  );
}

/** Hand-drawn manila folder in the Fluent style (there is no colour folder in the open icon set). */
export function FolderGlyph({ size = 24, open = false }: { size?: number; open?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden className="shrink-0">
      <defs>
        <linearGradient id="wf-back" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E8A93A" />
          <stop offset="1" stopColor="#D4861E" />
        </linearGradient>
        <linearGradient id="wf-front" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFD867" />
          <stop offset="1" stopColor="#F7B928" />
        </linearGradient>
      </defs>
      <path d="M4 12a4 4 0 0 1 4-4h10.3a4 4 0 0 1 2.9 1.2L24 12h16a4 4 0 0 1 4 4v20a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z" fill="url(#wf-back)" />
      {open ? (
        <path d="M9.2 20h35.1a2.5 2.5 0 0 1 2.4 3.2l-4 14A4 4 0 0 1 38.8 40H7a3 3 0 0 1-2.9-3.8l3.4-14.3A2.5 2.5 0 0 1 9.2 20z" fill="url(#wf-front)" />
      ) : (
        <path d="M4 18a3 3 0 0 1 3-3h34a3 3 0 0 1 3 3v18a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z" fill="url(#wf-front)" />
      )}
    </svg>
  );
}

export function PdfGlyph({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden className="shrink-0">
      <path d="M11 4h18l10 10v28a2 2 0 0 1-2 2H11a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" fill="#fff" stroke="#c8c8c8" />
      <path d="M29 4v8a2 2 0 0 0 2 2h8" fill="#e6e6e6" stroke="#c8c8c8" />
      <rect x="5" y="24" width="26" height="12" rx="2" fill="#D13438" />
      <text x="18" y="33" textAnchor="middle" fontSize="8.5" fontWeight="700" fill="#fff" fontFamily="Segoe UI, system-ui, sans-serif">PDF</text>
    </svg>
  );
}

export function BinGlyph({ size = 24, full = false }: { size?: number; full?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden className="shrink-0">
      <defs>
        <linearGradient id="wb" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#d9e9f7" />
          <stop offset="1" stopColor="#9cc3e6" />
        </linearGradient>
      </defs>
      <path d="M11 14h26l-2.4 27.2A3 3 0 0 1 31.6 44H16.4a3 3 0 0 1-3-2.8z" fill="url(#wb)" stroke="#6b9cc7" strokeWidth="1.2" />
      <rect x="8" y="9" width="32" height="5" rx="2" fill="#bcd7ee" stroke="#6b9cc7" strokeWidth="1.2" />
      <path d="M19 20v18M24 20v18M29 20v18" stroke="#6b9cc7" strokeWidth="1.6" strokeLinecap="round" opacity=".7" />
      {full && <path d="M16 9c2-5 7-6 10-3 3-3 8-1 7 3" fill="#fff" stroke="#9aa" />}
    </svg>
  );
}

/** Rounded gradient tile with a white glyph — used where the open set has no colour icon. */
export function GlyphTile({ size = 24, from, to, glyph, pad = 0.22 }: { size?: number; from: string; to: string; glyph: string; pad?: number }) {
  return (
    <span
      aria-hidden
      className="inline-flex items-center justify-center shrink-0"
      style={{ width: size, height: size, borderRadius: size * 0.22, background: `linear-gradient(135deg, ${from}, ${to})` }}
    >
      <MaskIcon src={glyph} size={size * (1 - pad * 2)} color="#fff" />
    </span>
  );
}

export function TerminalGlyph({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden className="shrink-0">
      <rect x="4" y="7" width="40" height="34" rx="5" fill="#2B2B2B" />
      <rect x="4" y="7" width="40" height="7" rx="3" fill="#4A4A4A" />
      <path d="M12 22l6 5-6 5" stroke="#6CCB5F" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 33h12" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

/** The Start button: RA monogram on a Fluent-blue tile (not the Windows logo). */
export function StartGlyph({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden className="shrink-0">
      <defs>
        <linearGradient id="ws" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3DB0F7" />
          <stop offset="1" stopColor="#0F62D6" />
        </linearGradient>
      </defs>
      <rect x="3" y="3" width="42" height="42" rx="10" fill="url(#ws)" />
      <text x="24" y="32" textAnchor="middle" fontSize="21" fontWeight="700" fill="#fff" fontFamily="Georgia, 'Times New Roman', serif">RA</text>
    </svg>
  );
}

export const WIN_APPS: Record<WinAppId, AppMeta> = {
  explorer: { name: 'File Explorer', w: 980, h: 600, icon: (s = 24) => <FolderGlyph size={s} />, blurb: 'Projects, experience, certifications' },
  browser: { name: 'Browser', w: 1060, h: 700, icon: (s = 24) => <Fluent name="globe_24_color" size={s} />, blurb: 'Blog posts and case studies' },
  mail: { name: 'Mail', w: 760, h: 560, icon: (s = 24) => <Fluent name="mail_48_color" size={s} />, blurb: 'Send Ritik a message' },
  notepad: { name: 'Notepad', w: 720, h: 520, icon: (s = 24) => <Fluent name="notebook_32_color" size={s} />, blurb: 'About, now and skills' },
  photos: { name: 'Photos', w: 900, h: 600, icon: (s = 24) => <Fluent name="image_48_color" size={s} />, blurb: 'Portraits and project screenshots' },
  terminal: { name: 'Terminal', w: 780, h: 480, icon: (s = 24) => <TerminalGlyph size={s} />, blurb: 'Type help to get started' },
  github: { name: 'GitHub', w: 760, h: 620, icon: (s = 24) => <Fluent name="code_block_48_color" size={s} />, blurb: 'Live contributions and repos' },
  music: { name: 'Music', w: 820, h: 580, icon: (s = 24) => <GlyphTile size={s} from="#FF5E7E" to="#C4166B" glyph="/os-icons/fluent/music_note_2_24_filled.svg" />, blurb: "Ritik's current rotation" },
  settings: { name: 'Settings', w: 900, h: 620, icon: (s = 24) => <Fluent name="settings_48_color" size={s} />, blurb: 'Theme, wallpaper, switch OS' },
  calculator: { name: 'Calculator', w: 340, h: 520, icon: (s = 24) => <GlyphTile size={s} from="#6B6B6B" to="#3B3B3B" glyph="/os-icons/fluent/calculator_24_filled.svg" />, blurb: 'Standard calculator' },
  copilot: { name: 'Ask Ritik', w: 420, h: 640, icon: (s = 24) => <Fluent name="bot_sparkle_24_color" size={s} />, blurb: 'AI assistant that knows Ritik' },
  resume: { name: 'Resume.pdf', w: 960, h: 720, icon: (s = 24) => <PdfGlyph size={s} />, blurb: 'View or download the résumé' },
  recycle: { name: 'Recycle Bin', w: 640, h: 420, icon: (s = 24) => <BinGlyph size={s} />, blurb: 'Nothing to see here' },
  about: { name: 'About RitikOS', w: 520, h: 460, icon: (s = 24) => <Fluent name="person_48_color" size={s} />, blurb: 'What this is and how it was built' },
};

export const PINNED: WinAppId[] = ['explorer', 'browser', 'mail', 'notepad', 'photos', 'terminal', 'github', 'music', 'copilot', 'calculator', 'settings', 'resume'];
export const TASKBAR: WinAppId[] = ['explorer', 'browser', 'mail', 'terminal', 'github', 'music', 'settings'];

export const WIN_WALLPAPERS = [
  { id: 'glow', label: 'Glow' },
  { id: 'night', label: 'Night' },
  { id: 'meadow', label: 'Meadow' },
  { id: 'ribbon', label: 'Ribbon' },
] as const;
