'use client';

import { useEffect, useRef, useState } from 'react';
import { Wifi, BatteryFull, BatteryMedium, BatteryLow, SlidersHorizontal, Sun, Moon, Image as ImageIcon } from 'lucide-react';

interface Props {
  activeApp: string;
  theme: 'dark' | 'light';
  wallpaper: string;
  wallpapers: { id: string; label: string }[];
  onTheme: (t: 'dark' | 'light') => void;
  onWallpaper: (id: string) => void;
  onAbout: () => void;
  onLock: () => void;
  onRestart: () => void;
  onClassic: () => void;
  shortcuts: { label: string; run: () => void }[];
}

function useClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 10_000);
    return () => clearInterval(t);
  }, []);
  return now;
}

function useBattery() {
  const [level, setLevel] = useState<number | null>(null);
  useEffect(() => {
    const nav = navigator as Navigator & { getBattery?: () => Promise<{ level: number; addEventListener: (e: string, f: () => void) => void }> };
    nav.getBattery?.().then((b) => {
      setLevel(b.level);
      b.addEventListener('levelchange', () => setLevel(b.level));
    }).catch(() => {});
  }, []);
  return level;
}

function Dropdown({ open, onClose, children, align = 'left' }: { open: boolean; onClose: () => void; children: React.ReactNode; align?: 'left' | 'right' }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !ref.current?.parentElement?.contains(e.target as Node) && onClose();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div ref={ref} role="menu" className={`absolute top-[26px] ${align === 'right' ? 'right-0' : 'left-0'} min-w-[220px] mac-menu p-1.5 z-[9999]`}>
      {children}
    </div>
  );
}

function MenuItem({ children, onClick, disabled }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean }) {
  return (
    <button role="menuitem" disabled={disabled} onClick={onClick} className="w-full text-left px-2.5 py-1 rounded-[5px] text-[13px] mac-menu-item disabled:opacity-40">
      {children}
    </button>
  );
}

export default function MenuBar(p: Props) {
  const now = useClock();
  const battery = useBattery();
  const [menu, setMenu] = useState<null | 'logo' | 'cc'>(null);
  const close = () => setMenu(null);
  const BatteryIcon = battery === null || battery > 0.6 ? BatteryFull : battery > 0.25 ? BatteryMedium : BatteryLow;

  return (
    <div className="fixed top-0 inset-x-0 h-7 z-[9000] flex items-center px-3 text-[13px] mac-menubar select-none">
      <div className="relative">
        <button aria-label="RitikOS menu" onClick={() => setMenu(menu === 'logo' ? null : 'logo')} className="px-2.5 h-7 rounded mac-menubar-btn font-semibold" style={{ fontFamily: 'var(--font-cormorant), Georgia, serif', fontSize: 16 }}>
          RA
        </button>
        <Dropdown open={menu === 'logo'} onClose={close}>
          <MenuItem onClick={() => { close(); p.onAbout(); }}>About RitikOS</MenuItem>
          <div className="my-1 border-t mac-divider" />
          <MenuItem onClick={() => { close(); p.onLock(); }}>Lock Screen</MenuItem>
          <MenuItem onClick={() => { close(); p.onRestart(); }}>Restart…</MenuItem>
          <div className="my-1 border-t mac-divider" />
          <MenuItem onClick={() => { close(); p.onClassic(); }}>Back to classic portfolio</MenuItem>
        </Dropdown>
      </div>

      <span className="px-2.5 font-semibold">{p.activeApp}</span>
      <nav className="hidden md:flex items-center">
        {p.shortcuts.map((s) => (
          <button key={s.label} onClick={s.run} className="px-2.5 h-7 rounded mac-menubar-btn">{s.label}</button>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-0.5">
        <span className="px-2 h-7 flex items-center" aria-label="Wi-Fi connected"><Wifi className="w-4 h-4" /></span>
        <span className="px-2 h-7 flex items-center gap-1" aria-label={battery !== null ? `Battery ${Math.round(battery * 100)}%` : 'Battery'}>
          {battery !== null && <span className="text-[12px]">{Math.round(battery * 100)}%</span>}
          <BatteryIcon className="w-[18px] h-[18px]" />
        </span>
        <div className="relative">
          <button aria-label="Control Centre" onClick={() => setMenu(menu === 'cc' ? null : 'cc')} className="px-2 h-7 rounded mac-menubar-btn flex items-center">
            <SlidersHorizontal className="w-4 h-4" />
          </button>
          <Dropdown open={menu === 'cc'} onClose={close} align="right">
            <div className="p-2 w-[260px] space-y-3">
              <div className="mac-cc-tile p-3">
                <p className="text-[11px] font-semibold mac-text-faint mb-2">Appearance</p>
                <div className="grid grid-cols-2 gap-2">
                  {(['light', 'dark'] as const).map((t) => (
                    <button key={t} onClick={() => p.onTheme(t)} className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[12px] capitalize ${p.theme === t ? 'bg-[#2E6BD9] text-white' : 'mac-hover'}`}>
                      {t === 'light' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />} {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mac-cc-tile p-3">
                <p className="text-[11px] font-semibold mac-text-faint mb-2 flex items-center gap-1.5"><ImageIcon className="w-3.5 h-3.5" /> Wallpaper</p>
                <div className="grid grid-cols-3 gap-2">
                  {p.wallpapers.map((w) => (
                    <button key={w.id} onClick={() => p.onWallpaper(w.id)} aria-label={w.label} className={`h-10 rounded-md mac-wallpaper-${w.id} ${p.wallpaper === w.id ? 'ring-2 ring-[#2E6BD9] ring-offset-1' : ''}`} />
                  ))}
                </div>
              </div>
            </div>
          </Dropdown>
        </div>
        <span className="px-2.5 tabular-nums" suppressHydrationWarning>
          {now
            ? `${now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}  ${now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
            : ''}
        </span>
      </div>
    </div>
  );
}
