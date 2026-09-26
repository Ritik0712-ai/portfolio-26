import type { ComponentType } from 'react';
import { FolderOpen, StickyNote, FileText, Trash2, Globe } from 'lucide-react';

// Original icon artwork in the rounded-square style of desktop apps. No
// Apple artwork is used: every icon is a gradient tile plus an open-source
// lucide glyph, drawn at render time.

interface TileProps {
  size?: number;
  from: string;
  to: string;
  glyph: ComponentType<{ className?: string; style?: React.CSSProperties; strokeWidth?: number }>;
  glyphColor?: string;
}

function Tile({ size = 48, from, to, glyph: Glyph, glyphColor = '#fff' }: TileProps) {
  return (
    <div
      className="relative flex items-center justify-center shadow-[0_2px_6px_rgba(0,0,0,0.35)]"
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.225,
        background: `linear-gradient(180deg, ${from}, ${to})`,
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          borderRadius: size * 0.225,
          background: 'linear-gradient(180deg, rgba(255,255,255,0.35), rgba(255,255,255,0) 45%)',
          boxShadow: 'inset 0 0 0 0.5px rgba(255,255,255,0.35)',
        }}
      />
      <Glyph style={{ width: size * 0.52, height: size * 0.52, color: glyphColor }} strokeWidth={1.8} />
    </div>
  );
}

export const AppIcons = {
  finder: (s?: number) => <Tile size={s} from="#6BB8FF" to="#1A6FE0" glyph={FolderOpen} />,
  notes: (s?: number) => <Tile size={s} from="#FFE680" to="#F5C518" glyph={StickyNote} glyphColor="#6B4E00" />,
  preview: (s?: number) => <Tile size={s} from="#F4F7FB" to="#C9D6E6" glyph={FileText} glyphColor="#2B5FA8" />,
  classic: (s?: number) => <Tile size={s} from="#4A4540" to="#1A1714" glyph={Globe} glyphColor="#E9E2D6" />,
};

export function TrashIcon({ size = 48 }: { size?: number }) {
  return (
    <div className="flex items-center justify-center" style={{ width: size, height: size }}>
      <Trash2 style={{ width: size * 0.8, height: size * 0.8, color: 'var(--mac-on-wallpaper)' }} strokeWidth={1.4} />
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
