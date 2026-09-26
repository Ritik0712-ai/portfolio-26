import type { ComponentType, ReactNode } from 'react';
import {
  FolderOpen, StickyNote, FileText, Trash2, Globe, Compass, Mail, Github, Image as ImageIcon,
  UserRound, Calculator, Settings, LayoutGrid, Sparkles, Music2,
} from 'lucide-react';

// Icons drawn on Apple's icon grid (rounded-square "squircle", top-lit
// gradient, soft drop shadow, centred symbol) — original artwork built from
// gradients and open-source lucide symbols, used by both macOS and iOS modes.

type Glyph = ComponentType<{ style?: React.CSSProperties; strokeWidth?: number }>;

interface TileProps {
  size?: number;
  from: string;
  to: string;
  glyph?: Glyph;
  glyphColor?: string;
  children?: ReactNode;
  shadow?: boolean;
}

export function Tile({ size = 48, from, to, glyph: G, glyphColor = '#fff', children, shadow = true }: TileProps) {
  const r = size * 0.2237; // Apple icon corner ratio
  return (
    <div
      className="relative flex items-center justify-center shrink-0"
      style={{
        width: size,
        height: size,
        borderRadius: r,
        background: `linear-gradient(180deg, ${from}, ${to})`,
        boxShadow: shadow ? `0 ${size * 0.03}px ${size * 0.08}px rgba(0,0,0,0.3)` : undefined,
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          borderRadius: r,
          background: 'linear-gradient(180deg, rgba(255,255,255,0.28), rgba(255,255,255,0) 50%)',
          boxShadow: 'inset 0 0 0 0.5px rgba(255,255,255,0.3)',
        }}
      />
      {children ?? (G ? <G style={{ width: size * 0.52, height: size * 0.52, color: glyphColor }} strokeWidth={1.8} /> : null)}
    </div>
  );
}

function Orb({ size }: { size: number }) {
  return (
    <div className="relative" style={{ width: size * 0.62, height: size * 0.62 }}>
      <div className="absolute inset-0 rounded-full" style={{ background: 'conic-gradient(from 200deg, #ff4fd8, #7a5cff, #2ec5ff, #34e0a1, #ffb84d, #ff4fd8)', filter: 'blur(0.5px)' }} />
      <div className="absolute inset-[18%] rounded-full" style={{ background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.95), rgba(255,255,255,0.2) 55%, transparent 70%)' }} />
    </div>
  );
}

export type IconId =
  | 'finder' | 'notes' | 'preview' | 'classic' | 'safari' | 'mail' | 'terminal' | 'siri' | 'github'
  | 'photos' | 'contacts' | 'calculator' | 'settings' | 'launchpad' | 'music' | 'files';

export function AppIcon({ id, size = 48 }: { id: IconId; size?: number }) {
  switch (id) {
    case 'finder': return <Tile size={size} from="#6BC1FF" to="#1B6FE3" glyph={FolderOpen} />;
    case 'notes': return <Tile size={size} from="#FFFFFF" to="#EDEDED" glyph={StickyNote} glyphColor="#F5B800" />;
    case 'preview': return <Tile size={size} from="#F7F9FC" to="#CFDAE8" glyph={FileText} glyphColor="#2C62AE" />;
    case 'files': return <Tile size={size} from="#FFFFFF" to="#E9EEF5" glyph={FolderOpen} glyphColor="#1B7BFF" />;
    case 'classic': return <Tile size={size} from="#4A4540" to="#1A1714" glyph={Globe} glyphColor="#E9E2D6" />;
    case 'safari': return <Tile size={size} from="#FFFFFF" to="#E6EEF8" glyph={Compass} glyphColor="#1A8CFF" />;
    case 'mail': return <Tile size={size} from="#5FB6FF" to="#1466E0" glyph={Mail} />;
    case 'github': return <Tile size={size} from="#3A3F47" to="#15181C" glyph={Github} />;
    case 'photos': return <Tile size={size} from="#FFFFFF" to="#EFEFEF" glyph={ImageIcon} glyphColor="#FF8A00" />;
    case 'contacts': return <Tile size={size} from="#D9D3C7" to="#A99F8E" glyph={UserRound} />;
    case 'calculator': return <Tile size={size} from="#4A4A4E" to="#1E1E20" glyph={Calculator} glyphColor="#FF9F0A" />;
    case 'settings': return <Tile size={size} from="#B9BCC2" to="#6E737B" glyph={Settings} />;
    case 'launchpad': return <Tile size={size} from="#7A8AA3" to="#3E4A5E" glyph={LayoutGrid} />;
    case 'music': return <Tile size={size} from="#FF6B81" to="#E5213E" glyph={Music2} />;
    case 'siri': return <Tile size={size} from="#1C1C2E" to="#07070F"><Orb size={size} /></Tile>;
    case 'terminal':
      return (
        <Tile size={size} from="#2E2E30" to="#0E0E10">
          <div className="absolute inset-[9%] rounded-[16%] border border-white/15" />
          <span className="relative font-mono font-bold text-[#E6E6E6]" style={{ fontSize: size * 0.3, marginLeft: -size * 0.12, marginTop: -size * 0.14 }}>
            &gt;_
          </span>
        </Tile>
      );
  }
}

/** Back-compat helpers used by stage-1 components. */
export const AppIcons = {
  finder: (s?: number) => <AppIcon id="finder" size={s} />,
  notes: (s?: number) => <AppIcon id="notes" size={s} />,
  preview: (s?: number) => <AppIcon id="preview" size={s} />,
  classic: (s?: number) => <AppIcon id="classic" size={s} />,
};

export function SparkIcon({ size = 16 }: { size?: number }) {
  return <Sparkles style={{ width: size, height: size }} />;
}

export function TrashIcon({ size = 48, full = false }: { size?: number; full?: boolean }) {
  return (
    <div className="flex items-center justify-center" style={{ width: size, height: size }}>
      <Trash2 style={{ width: size * 0.8, height: size * 0.8, color: 'var(--mac-on-wallpaper)', opacity: full ? 1 : 0.9 }} strokeWidth={1.4} />
    </div>
  );
}

export function FolderIcon({ size = 64 }: { size?: number }) {
  return (
    <svg width={size} height={size * 0.8} viewBox="0 0 64 51" aria-hidden="true">
      <defs>
        <linearGradient id="fold-back" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5AB0FF" />
          <stop offset="1" stopColor="#2E86EA" />
        </linearGradient>
        <linearGradient id="fold-front" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8BCBFF" />
          <stop offset="1" stopColor="#4AA3F6" />
        </linearGradient>
      </defs>
      <path d="M4 6a4 4 0 0 1 4-4h14l6 6h28a4 4 0 0 1 4 4v33a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z" fill="url(#fold-back)" />
      <path d="M2 17a4 4 0 0 1 4-4h52a4 4 0 0 1 4 4l-2 28a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z" fill="url(#fold-front)" />
      <path d="M6 14h52" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
    </svg>
  );
}

export function DocIcon({ size = 64, label = 'PDF' }: { size?: number; label?: string }) {
  return (
    <svg width={size * 0.78} height={size} viewBox="0 0 50 64" aria-hidden="true">
      <path d="M4 3a3 3 0 0 1 3-3h26l13 13v48a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3z" fill="#FAFAFA" />
      <path d="M33 0v10a3 3 0 0 0 3 3h10" fill="#E3E3E3" />
      <rect x="10" y="40" width="30" height="12" rx="2" fill="#E5484D" />
      <text x="25" y="49" textAnchor="middle" fontSize="8" fontWeight="700" fill="#fff" fontFamily="system-ui">
        {label}
      </text>
      <path d="M10 18h22M10 23h26M10 28h18" stroke="#C8C8C8" strokeWidth="1.5" />
    </svg>
  );
}
