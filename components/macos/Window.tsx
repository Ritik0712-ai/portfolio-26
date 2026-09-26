'use client';

import { useRef, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import type { WindowState } from './types';
import { MENU_BAR_HEIGHT, DOCK_RESERVED } from './types';

interface Props {
  win: WindowState;
  focused: boolean;
  onFocus: () => void;
  onClose: () => void;
  onMinimize: () => void;
  onToggleMax: () => void;
  onChange: (patch: Partial<WindowState>) => void;
  toolbar?: ReactNode;
  children: ReactNode;
}

const MIN_W = 360;
const MIN_H = 220;

type Edge = 'r' | 'b' | 'br' | 'l' | 'bl';

export default function Window({ win, focused, onFocus, onClose, onMinimize, onToggleMax, onChange, toolbar, children }: Props) {
  const drag = useRef<{ px: number; py: number; x: number; y: number; w: number; h: number; edge?: Edge } | null>(null);

  const startMove = (e: ReactPointerEvent) => {
    if (win.maximized || (e.target as HTMLElement).closest('button')) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { px: e.clientX, py: e.clientY, x: win.x, y: win.y, w: win.w, h: win.h };
  };

  const onMove = (e: ReactPointerEvent) => {
    const d = drag.current;
    if (!d || d.edge) return;
    const x = d.x + e.clientX - d.px;
    const y = Math.max(MENU_BAR_HEIGHT, Math.min(window.innerHeight - 60, d.y + e.clientY - d.py));
    onChange({ x: Math.max(-win.w + 120, Math.min(window.innerWidth - 120, x)), y });
  };

  const startResize = (edge: Edge) => (e: ReactPointerEvent) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { px: e.clientX, py: e.clientY, x: win.x, y: win.y, w: win.w, h: win.h, edge };
  };

  const onResize = (e: ReactPointerEvent) => {
    const d = drag.current;
    if (!d?.edge) return;
    const dx = e.clientX - d.px;
    const dy = e.clientY - d.py;
    const patch: Partial<WindowState> = {};
    if (d.edge.includes('r')) patch.w = Math.max(MIN_W, d.w + dx);
    if (d.edge.includes('b')) patch.h = Math.max(MIN_H, d.h + dy);
    if (d.edge.includes('l')) {
      const w = Math.max(MIN_W, d.w - dx);
      patch.w = w;
      patch.x = d.x + (d.w - w);
    }
    onChange(patch);
  };

  const end = () => {
    drag.current = null;
  };

  const rect = win.maximized
    ? { left: 0, top: MENU_BAR_HEIGHT, width: '100vw', height: `calc(100vh - ${MENU_BAR_HEIGHT + DOCK_RESERVED}px)` }
    : { left: win.x, top: win.y, width: win.w, height: win.h };

  return (
    <motion.section
      role="dialog"
      aria-label={win.title}
      initial={{ opacity: 0, scale: 0.94, y: 12 }}
      animate={
        win.minimized
          ? { opacity: 0, scale: 0.15, y: typeof window !== 'undefined' ? window.innerHeight : 800 }
          : { opacity: 1, scale: 1, y: 0 }
      }
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ type: 'spring', stiffness: 380, damping: 32, mass: 0.7 }}
      onPointerDown={onFocus}
      className={`absolute flex flex-col overflow-hidden rounded-xl border mac-window ${
        focused ? 'mac-window-focused' : ''
      } ${win.minimized ? 'pointer-events-none' : ''}`}
      style={{ ...rect, zIndex: win.z, transformOrigin: 'bottom center' }}
    >
      {/* Title bar */}
      <header
        onPointerDown={startMove}
        onPointerMove={onMove}
        onPointerUp={end}
        onPointerCancel={end}
        onDoubleClick={(e) => !(e.target as HTMLElement).closest('button') && onToggleMax()}
        className="relative flex items-center h-11 px-3.5 shrink-0 select-none mac-titlebar cursor-default"
      >
        <div className="group flex items-center gap-2 z-10">
          <button aria-label="Close window" onClick={onClose} className="mac-light bg-[#FF5F57]">
            <span className="mac-light-glyph">×</span>
          </button>
          <button aria-label="Minimise window" onClick={onMinimize} className="mac-light bg-[#FEBC2E]">
            <span className="mac-light-glyph">−</span>
          </button>
          <button aria-label={win.maximized ? 'Restore window' : 'Maximise window'} onClick={onToggleMax} className="mac-light bg-[#28C840]">
            <span className="mac-light-glyph">{win.maximized ? '↙' : '↗'}</span>
          </button>
        </div>
        <p className="absolute inset-x-0 text-center text-[13px] font-semibold mac-title pointer-events-none truncate px-24">
          {win.title}
        </p>
        {toolbar && <div className="ml-auto z-10 flex items-center gap-2">{toolbar}</div>}
      </header>

      <div className="flex-1 min-h-0 overflow-hidden mac-window-body">{children}</div>

      {/* Resize handles */}
      {!win.maximized && (
        <>
          <div onPointerDown={startResize('r')} onPointerMove={onResize} onPointerUp={end} className="absolute top-0 right-0 w-1.5 h-full cursor-ew-resize" />
          <div onPointerDown={startResize('l')} onPointerMove={onResize} onPointerUp={end} className="absolute top-0 left-0 w-1.5 h-full cursor-ew-resize" />
          <div onPointerDown={startResize('b')} onPointerMove={onResize} onPointerUp={end} className="absolute bottom-0 left-0 h-1.5 w-full cursor-ns-resize" />
          <div onPointerDown={startResize('br')} onPointerMove={onResize} onPointerUp={end} className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize" />
          <div onPointerDown={startResize('bl')} onPointerMove={onResize} onPointerUp={end} className="absolute bottom-0 left-0 w-4 h-4 cursor-nesw-resize" />
        </>
      )}
    </motion.section>
  );
}
