'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Wifi, BatteryFull, BatteryMedium, BatteryLow, SlidersHorizontal, Sun, Moon, Search,
  Bluetooth, Radio, BellOff, Monitor,
} from 'lucide-react';
import { useOSSettings, WALLPAPERS } from './settings';

export interface MenuAction { label: string; run?: () => void; shortcut?: string; disabled?: boolean; divider?: boolean }

interface Props {
  activeApp: string;
  appMenus: { title: string; items: MenuAction[] }[];
  logoItems: MenuAction[];
  onSpotlight: () => void;
  onSiri: () => void;
  onNotifications: () => void;
  focusMode: boolean;
  onFocusMode: (on: boolean) => void;
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

function Menu({ items, onClose, align = 'left' }: { items: MenuAction[]; onClose: () => void; align?: 'left' | 'right' }) {
  return (
    <div role="menu" className={`absolute top-[26px] ${align === 'right' ? 'right-0' : 'left-0'} min-w-[230px] mac-menu p-1.5 z-[9999]`}>
      {items.map((it, i) =>
        it.divider ? (
          <div key={i} className="my-1 border-t mac-divider" />
        ) : (
          <button
            key={i}
            role="menuitem"
            disabled={it.disabled}
            onClick={() => { onClose(); it.run?.(); }}
            className="w-full flex items-center justify-between gap-6 text-left px-2.5 py-[3px] rounded-[5px] text-[13px] mac-menu-item disabled:opacity-40"
          >
            <span>{it.label}</span>
            {it.shortcut && <span className="opacity-60 text-[12px]">{it.shortcut}</span>}
          </button>
        )
      )}
    </div>
  );
}

function Toggle({ on, icon: Icon, label, sub, onClick }: { on: boolean; icon: typeof Wifi; label: string; sub: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center gap-2.5 text-left w-full">
      <span className={`w-8 h-8 rounded-full flex items-center justify-center ${on ? 'bg-[#0A84FF] text-white' : 'mac-chip mac-text'}`}><Icon className="w-4 h-4" /></span>
      <span className="leading-tight">
        <span className="block text-[12.5px] font-semibold">{label}</span>
        <span className="block text-[11px] mac-text-faint">{sub}</span>
      </span>
    </button>
  );
}

export default function MenuBar(p: Props) {
  const s = useOSSettings();
  const now = useClock();
  const battery = useBattery();
  const [open, setOpen] = useState<string | null>(null);
  const [radios, setRadios] = useState({ wifi: true, bt: true, airdrop: false });
  const barRef = useRef<HTMLDivElement>(null);
  const BatteryIcon = battery === null || battery > 0.6 ? BatteryFull : battery > 0.25 ? BatteryMedium : BatteryLow;

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !barRef.current?.contains(e.target as Node) && setOpen(null);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(null);
    window.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const toggle = (id: string) => setOpen((o) => (o === id ? null : id));
  // Once any menu is open, hovering another title switches to it (like macOS).
  const hover = (id: string) => open && open !== id && open !== 'cc' && setOpen(id);

  return (
    <div ref={barRef} className="fixed top-0 inset-x-0 h-7 z-[9000] flex items-center px-2 text-[13px] mac-menubar select-none">
      {/* Notch (MacBook Air / Pro) */}
      <div aria-hidden className="absolute left-1/2 -translate-x-1/2 top-0 w-[190px] h-[30px] bg-black rounded-b-[14px] z-[1] flex items-center justify-center">
        <span className="w-[7px] h-[7px] rounded-full bg-[#1a1a2a] ring-1 ring-[#2a2a3a]" />
      </div>

      <div className="relative">
        <button aria-label="RitikOS menu" aria-expanded={open === 'logo'} onClick={() => toggle('logo')} onMouseEnter={() => hover('logo')} className="px-2.5 h-[22px] rounded mac-menubar-btn font-semibold" style={{ fontFamily: 'var(--font-cormorant), Georgia, serif', fontSize: 16 }}>
          RA
        </button>
        {open === 'logo' && <Menu items={p.logoItems} onClose={() => setOpen(null)} />}
      </div>

      <span className="px-2.5 font-bold">{p.activeApp}</span>
      <nav className="flex items-center">
        {p.appMenus.map((m) => (
          <div key={m.title} className="relative">
            <button aria-expanded={open === m.title} onClick={() => toggle(m.title)} onMouseEnter={() => hover(m.title)} className="px-2.5 h-[22px] rounded mac-menubar-btn">
              {m.title}
            </button>
            {open === m.title && <Menu items={m.items} onClose={() => setOpen(null)} />}
          </div>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-0.5 z-[2]">
        <span className="px-1.5 h-[22px] flex items-center" aria-label={radios.wifi ? 'Wi-Fi connected' : 'Wi-Fi off'}><Wifi className={`w-4 h-4 ${radios.wifi ? '' : 'opacity-40'}`} /></span>
        <span className="px-1.5 h-[22px] flex items-center gap-1" aria-label={battery !== null ? `Battery ${Math.round(battery * 100)}%` : 'Battery'}>
          {battery !== null && <span className="text-[12px]">{Math.round(battery * 100)}%</span>}
          <BatteryIcon className="w-[19px] h-[19px]" />
        </span>
        <button aria-label="Spotlight" onClick={p.onSpotlight} className="px-1.5 h-[22px] rounded mac-menubar-btn flex items-center"><Search className="w-[15px] h-[15px]" /></button>
        <div className="relative">
          <button aria-label="Control Centre" aria-expanded={open === 'cc'} onClick={() => toggle('cc')} className="px-1.5 h-[22px] rounded mac-menubar-btn flex items-center"><SlidersHorizontal className="w-[15px] h-[15px]" /></button>
          {open === 'cc' && (
            <div className="absolute top-[26px] right-0 w-[320px] mac-menu p-2.5 z-[9999] space-y-2.5 mac-text">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="mac-cc-tile p-3 space-y-3">
                  <Toggle on={radios.wifi} icon={Wifi} label="Wi-Fi" sub={radios.wifi ? 'RitikOS-5G' : 'Off'} onClick={() => setRadios((r) => ({ ...r, wifi: !r.wifi }))} />
                  <Toggle on={radios.bt} icon={Bluetooth} label="Bluetooth" sub={radios.bt ? 'On' : 'Off'} onClick={() => setRadios((r) => ({ ...r, bt: !r.bt }))} />
                  <Toggle on={radios.airdrop} icon={Radio} label="AirDrop" sub={radios.airdrop ? 'Everyone' : 'Contacts Only'} onClick={() => setRadios((r) => ({ ...r, airdrop: !r.airdrop }))} />
                </div>
                <div className="grid grid-rows-2 gap-2.5">
                  <button onClick={() => p.onFocusMode(!p.focusMode)} className="mac-cc-tile p-3 flex items-center gap-2.5 text-left">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center ${p.focusMode ? 'bg-[#5E5CE6] text-white' : 'mac-chip'}`}><BellOff className="w-4 h-4" /></span>
                    <span className="text-[12.5px] font-semibold leading-tight">Focus<span className="block text-[11px] font-normal mac-text-faint">{p.focusMode ? 'Do Not Disturb' : 'Off'}</span></span>
                  </button>
                  <div className="mac-cc-tile p-3 grid grid-cols-2 gap-1.5">
                    {(['light', 'dark'] as const).map((t) => (
                      <button key={t} onClick={() => s.setTheme(t)} aria-label={`${t} mode`} className={`rounded-md flex items-center justify-center ${s.theme === t ? 'bg-[#0A84FF] text-white' : 'mac-hover'}`}>
                        {t === 'light' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mac-cc-tile p-3">
                <p className="text-[12.5px] font-semibold mb-2">Display</p>
                <div className="flex items-center gap-2">
                  <Monitor className="w-4 h-4 mac-text-faint" />
                  <input type="range" min={0.35} max={1} step={0.01} value={s.brightness} onChange={(e) => s.setBrightness(parseFloat(e.target.value))} aria-label="Display brightness" className="flex-1 accent-white" />
                </div>
              </div>
              <div className="mac-cc-tile p-3">
                <p className="text-[12.5px] font-semibold mb-2">Wallpaper</p>
                <div className="grid grid-cols-6 gap-1.5">
                  {WALLPAPERS.map((w) => (
                    <button key={w.id} onClick={() => s.setWallpaper(w.id)} aria-label={w.label} className={`h-7 rounded-md mac-wallpaper-${w.id} ${s.wallpaper === w.id ? 'ring-2 ring-[#0A84FF]' : ''}`} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        <button aria-label="Ask Ritik (Siri)" onClick={p.onSiri} className="px-1.5 h-[22px] rounded mac-menubar-btn flex items-center">
          <span className="w-[15px] h-[15px] rounded-full" style={{ background: 'conic-gradient(from 0deg, #ff4fd8, #7a5cff, #2ec5ff, #34e0a1, #ffb84d, #ff4fd8)' }} />
        </button>
        <button aria-label="Notification Centre" onClick={p.onNotifications} className="px-2 h-[22px] rounded mac-menubar-btn tabular-nums" suppressHydrationWarning>
          {now
            ? `${now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}  ${now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
            : ''}
        </button>
      </div>
    </div>
  );
}
