'use client';

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import type { WindowState } from '@/components/macos/types';
import type { WinAppId } from './meta';

export const TASKBAR_H = 48;
const MIN_W = 340;
const MIN_H = 220;

type Edge = 'r' | 'b' | 'br' | 'l' | 'bl';
type Snap = 'left' | 'right' | 'full' | 'tl' | 'tr' | 'bl' | 'br';

interface Props {
  win: WindowState<WinAppId>;
  focused: boolean;
  icon: ReactNode;
  onFocus: () => void;
  onClose: () => void;
  onMinimize: () => void;
  onToggleMax: () => void;
  onChange: (patch: Partial<WindowState<WinAppId>>) => void;
  /** Dark caption for apps with dark content (Terminal, Calculator). */
  darkChrome?: boolean;
  children: ReactNode;
}

function snapRect(s: Snap) {
  const W = window.innerWidth;
  const H = window.innerHeight - TASKBAR_H;
  const half = { w: Math.round(W / 2), h: Math.round(H / 2) };
  switch (s) {
    case 'left': return { x: 0, y: 0, w: half.w, h: H };
    case 'right': return { x: half.w, y: 0, w: W - half.w, h: H };
    case 'tl': return { x: 0, y: 0, w: half.w, h: half.h };
    case 'tr': return { x: half.w, y: 0, w: W - half.w, h: half.h };
    case 'bl': return { x: 0, y: half.h, w: half.w, h: H - half.h };
    case 'br': return { x: half.w, y: half.h, w: W - half.w, h: H - half.h };
    default: return null;
  }
}

// Windows 11-style window: Mica title bar with icon + title on the left,
// 46×32 caption buttons on the right, 8px corners, drag-to-top to maximise,
// drag to a side edge to snap, and a Snap Layouts flyout on the maximise button.
export default function WinWindow({ win, focused, icon, onFocus, onClose, onMinimize, onToggleMax, onChange, darkChrome, children }: Props) {
  const drag = useRef<{ px: number; py: number; x: number; y: number; w: number; h: number; edge?: Edge } | null>(null);
  const [preview, setPreview] = useState<Snap | null>(null);
  const [flyout, setFlyout] = useState(false);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (hoverTimer.current) clearTimeout(hoverTimer.current); }, []);

  const applySnap = (s: Snap) => {
    setFlyout(false);
    if (s === 'full') {
      if (!win.maximized) onToggleMax();
      return;
    }
    const r = snapRect(s);
    if (!r) return;
    onChange({ ...r, maximized: false });
  };

  const startMove = (e: ReactPointerEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { px: e.clientX, py: e.clientY, x: win.x, y: win.y, w: win.w, h: win.h };
  };

  const onMove = (e: ReactPointerEvent) => {
    const d = drag.current;
    if (!d || d.edge) return;
    if (win.maximized) {
      // Pull a maximised window down to restore it under the cursor.
      if (Math.abs(e.clientY - d.py) < 6) return;
      const ratio = e.clientX / window.innerWidth;
      const x = e.clientX - d.w * ratio;
      onChange({ maximized: false, x, y: 0 });
      drag.current = { ...d, px: e.clientX, py: e.clientY, x, y: 0 };
      return;
    }
    const x = d.x + e.clientX - d.px;
    const y = Math.max(0, Math.min(window.innerHeight - TASKBAR_H - 32, d.y + e.clientY - d.py));
    onChange({ x: Math.max(-win.w + 120, Math.min(window.innerWidth - 120, x)), y });
    const W = window.innerWidth;
    setPreview(e.clientY <= 2 ? 'full' : e.clientX <= 2 ? 'left' : e.clientX >= W - 3 ? 'right' : null);
  };

  const endMove = () => {
    if (preview) applySnap(preview);
    setPreview(null);
    drag.current = null;
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
    const patch: Partial<WindowState<WinAppId>> = {};
    if (d.edge.includes('r')) patch.w = Math.max(MIN_W, d.w + dx);
    if (d.edge.includes('b')) patch.h = Math.max(MIN_H, d.h + dy);
    if (d.edge.includes('l')) {
      const w = Math.max(MIN_W, d.w - dx);
      patch.w = w;
      patch.x = d.x + (d.w - w);
    }
    onChange(patch);
  };

  const endResize = () => { drag.current = null; };

  const rect = win.maximized
    ? { left: 0, top: 0, width: '100vw', height: `calc(100vh - ${TASKBAR_H}px)` }
    : { left: win.x, top: win.y, width: win.w, height: win.h };

  const captionTone = darkChrome ? 'text-white' : 'win-text';

  return (
    <>
      {preview && (
        <div
          className="fixed z-[8990] rounded-lg border border-white/40 bg-white/20 backdrop-blur-sm pointer-events-none transition-all"
          style={
            preview === 'full'
              ? { left: 8, top: 8, right: 8, bottom: TASKBAR_H + 8 }
              : preview === 'left'
              ? { left: 8, top: 8, width: 'calc(50vw - 12px)', bottom: TASKBAR_H + 8 }
              : { right: 8, top: 8, width: 'calc(50vw - 12px)', bottom: TASKBAR_H + 8 }
          }
        />
      )}
      <motion.section
        role="dialog"
        aria-label={win.title}
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={
          win.minimized
            ? { opacity: 0, scale: 0.6, y: typeof window !== 'undefined' ? window.innerHeight / 2 : 400 }
            : { opacity: 1, scale: 1, y: 0 }
        }
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 420, damping: 36, mass: 0.6 }}
        onPointerDown={onFocus}
        className={`absolute flex flex-col win-window ${focused ? 'win-window-focused' : ''} ${
          win.maximized ? 'rounded-none' : 'rounded-lg'
        } ${win.minimized ? 'pointer-events-none' : ''}`}
        style={{ ...rect, zIndex: win.z, transformOrigin: 'bottom center' }}
      >
        <header
          onPointerDown={startMove}
          onPointerMove={onMove}
          onPointerUp={endMove}
          onPointerCancel={endMove}
          onDoubleClick={(e) => !(e.target as HTMLElement).closest('button') && onToggleMax()}
          className={`relative z-10 flex items-center h-8 shrink-0 select-none ${win.maximized ? '' : 'rounded-t-lg'} ${darkChrome ? 'bg-[#1f1f1f]' : 'win-mica'} ${focused ? '' : 'opacity-[0.92]'}`}
        >
          <span className="pl-3 pr-2 flex items-center">{icon}</span>
          <p className={`text-[12px] truncate flex-1 ${captionTone} ${focused ? '' : 'opacity-60'}`}>{win.title}</p>
          <div className="flex items-stretch h-full">
            <button aria-label="Minimise" onClick={onMinimize} className={`win-caption ${captionTone} ${darkChrome ? 'hover:bg-white/10' : ''}`}>
              <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden><path d="M0 5h10" stroke="currentColor" strokeWidth="1" /></svg>
            </button>
            <div
              className="relative"
              onPointerEnter={() => { hoverTimer.current = setTimeout(() => setFlyout(true), 450); }}
              onPointerLeave={() => { if (hoverTimer.current) clearTimeout(hoverTimer.current); setFlyout(false); }}
            >
              <button aria-label={win.maximized ? 'Restore' : 'Maximise'} onClick={() => { setFlyout(false); onToggleMax(); }} className={`win-caption h-full ${captionTone} ${darkChrome ? 'hover:bg-white/10' : ''}`}>
                {win.maximized ? (
                  <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden fill="none" stroke="currentColor"><rect x="0.5" y="2.5" width="7" height="7" rx="1" /><path d="M2.5 2.5V1.5a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-1" /></svg>
                ) : (
                  <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden fill="none" stroke="currentColor"><rect x="0.5" y="0.5" width="9" height="9" rx="1.2" /></svg>
                )}
              </button>
              {flyout && (
                <div className="absolute right-0 top-full mt-1 z-50 p-3 rounded-lg win-acrylic grid grid-cols-3 gap-2 w-[250px]" role="menu" aria-label="Snap layouts">
                  <SnapLayout parts={[['left', 'w-1/2 h-full'], ['right', 'w-1/2 h-full']]} onPick={applySnap} />
                  <SnapLayout parts={[['full', 'w-full h-full']]} onPick={applySnap} />
                  <SnapLayout parts={[['tl', 'w-1/2 h-1/2'], ['tr', 'w-1/2 h-1/2'], ['bl', 'w-1/2 h-1/2'], ['br', 'w-1/2 h-1/2']]} onPick={applySnap} />
                </div>
              )}
            </div>
            <button aria-label="Close" onClick={onClose} className={`win-caption win-caption-close ${captionTone} ${win.maximized ? "" : "rounded-tr-lg"}`}>
              <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden><path d="M0.5 0.5l9 9M9.5 0.5l-9 9" stroke="currentColor" strokeWidth="1" /></svg>
            </button>
          </div>
        </header>

        <div className={`flex-1 min-h-0 overflow-hidden win-solid win-text relative ${win.maximized ? '' : 'rounded-b-lg'}`}>{children}</div>

        {!win.maximized && (
          <>
            <div onPointerDown={startResize('r')} onPointerMove={onResize} onPointerUp={endResize} className="absolute top-0 right-0 w-1.5 h-full cursor-ew-resize" />
            <div onPointerDown={startResize('l')} onPointerMove={onResize} onPointerUp={endResize} className="absolute top-0 left-0 w-1.5 h-full cursor-ew-resize" />
            <div onPointerDown={startResize('b')} onPointerMove={onResize} onPointerUp={endResize} className="absolute bottom-0 left-0 h-1.5 w-full cursor-ns-resize" />
            <div onPointerDown={startResize('br')} onPointerMove={onResize} onPointerUp={endResize} className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize" />
            <div onPointerDown={startResize('bl')} onPointerMove={onResize} onPointerUp={endResize} className="absolute bottom-0 left-0 w-4 h-4 cursor-nesw-resize" />
          </>
        )}
      </motion.section>
    </>
  );
}

function SnapLayout({ parts, onPick }: { parts: [Snap, string][]; onPick: (s: Snap) => void }) {
  return (
    <div className="flex flex-wrap h-12 rounded-md overflow-hidden gap-[3px] p-[3px] border win-stroke">
      {parts.map(([s, cls]) => (
        <button
          key={s}
          role="menuitem"
          aria-label={`Snap ${s}`}
          onClick={() => onPick(s)}
          className={`${cls} rounded-[3px] win-snap-cell transition-colors`}
          style={{ flexBasis: cls.includes('w-1/2') ? 'calc(50% - 1.5px)' : '100%', height: cls.includes('h-1/2') ? 'calc(50% - 1.5px)' : '100%' }}
        />
      ))}
    </div>
  );
}
