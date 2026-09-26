'use client';

import { useEffect, useState } from 'react';
import { ChevronUp, Wifi, Volume2, BatteryFull, Search, Bell, BellOff } from 'lucide-react';
import { WIN_APPS, StartGlyph, Fluent, type WinAppId } from './meta';

interface Props {
  pinned: WinAppId[];
  running: Map<WinAppId, { focused: boolean; minimized: boolean; count: number }>;
  startOpen: boolean;
  searchOpen: boolean;
  onStart: () => void;
  onSearch: () => void;
  onWidgets: () => void;
  onApp: (id: WinAppId) => void;
  onQuick: () => void;
  onCalendar: () => void;
  onShowDesktop: () => void;
  quickOpen: boolean;
  calendarOpen: boolean;
  doNotDisturb: boolean;
}

// Centred taskbar, Windows 11 style: widgets on the far left, Start + Search +
// pinned/running apps in the middle, system tray and clock on the right.
export default function Taskbar({
  pinned, running, startOpen, searchOpen, onStart, onSearch, onWidgets, onApp, onQuick, onCalendar, onShowDesktop, quickOpen, calendarOpen, doNotDisturb,
}: Props) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 15_000);
    return () => clearInterval(t);
  }, []);

  // Running apps that aren't pinned get appended after the pinned ones.
  const apps = [...pinned, ...[...running.keys()].filter((id) => !pinned.includes(id))];

  return (
    <nav aria-label="Taskbar" onPointerDown={(e) => e.stopPropagation()} onContextMenu={(e) => e.preventDefault()} className="fixed bottom-0 inset-x-0 h-12 z-[9000] win-taskbar flex items-center px-3 select-none">
      {/* Widgets */}
      <button onClick={onWidgets} className="h-10 px-2 rounded-md win-hover flex items-center gap-2 win-text" aria-label="Widgets">
        <Fluent name="lightbulb_48_color" size={26} />
        <span className="hidden md:block text-left leading-tight">
          <span className="block text-[12px] font-semibold">Now</span>
          <span className="block text-[11px] win-text-2">Learning DSA</span>
        </span>
      </button>

      {/* Centre group */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1">
        <TaskButton label="Start" active={startOpen} onClick={onStart}>
          <StartGlyph size={26} />
        </TaskButton>
        <TaskButton label="Search" active={searchOpen} onClick={onSearch}>
          <Search className="w-[22px] h-[22px] win-text" strokeWidth={1.8} />
        </TaskButton>
        {apps.map((id) => {
          const r = running.get(id);
          return (
            <TaskButton key={id} label={WIN_APPS[id].name} active={!!r?.focused} onClick={() => onApp(id)} indicator={r ? (r.focused ? 'focused' : 'open') : undefined}>
              {WIN_APPS[id].icon(26)}
            </TaskButton>
          );
        })}
      </div>

      {/* Tray */}
      <div className="ml-auto flex items-center gap-1 win-text">
        <button className="h-10 w-7 rounded-md win-hover flex items-center justify-center" aria-label="Show hidden icons">
          <ChevronUp className="w-4 h-4" />
        </button>
        <button
          onClick={onQuick}
          aria-label="Quick settings"
          aria-expanded={quickOpen}
          className={`h-10 px-2.5 rounded-md flex items-center gap-2.5 ${quickOpen ? 'bg-[var(--win-hover)]' : 'win-hover'}`}
        >
          <Wifi className="w-4 h-4" />
          <Volume2 className="w-4 h-4" />
          <BatteryFull className="w-[18px] h-[18px]" />
        </button>
        <button
          onClick={onCalendar}
          aria-label="Clock, calendar and notifications"
          aria-expanded={calendarOpen}
          className={`h-10 pl-2.5 pr-2 rounded-md flex items-center gap-2 ${calendarOpen ? 'bg-[var(--win-hover)]' : 'win-hover'}`}
        >
          <span className="text-right leading-tight text-[12px]">
            <span className="block">{now.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}</span>
            <span className="block">{now.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
          </span>
          {doNotDisturb ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
        </button>
        {/* Show desktop sliver */}
        <button onClick={onShowDesktop} aria-label="Show desktop" className="w-2 h-12 -mr-3 ml-1 hover:border-l win-stroke" />
      </div>
    </nav>
  );
}

function TaskButton({ label, active, onClick, indicator, children }: { label: string; active?: boolean; onClick: () => void; indicator?: 'open' | 'focused'; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`group relative w-11 h-10 rounded-md flex items-center justify-center transition-colors ${active ? 'bg-[var(--win-hover)] ring-1 ring-inset ring-[var(--win-stroke)]' : 'win-hover'}`}
    >
      <span className="transition-transform group-active:scale-[0.86] group-active:translate-y-[1px]">{children}</span>
      {indicator && (
        <span
          className={`absolute bottom-[2px] h-[3px] rounded-full transition-all ${indicator === 'focused' ? 'w-4 bg-[var(--win-accent)]' : 'w-1.5 bg-[var(--win-text-2)]'}`}
        />
      )}
    </button>
  );
}
