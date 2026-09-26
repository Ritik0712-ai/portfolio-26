'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Wifi, Bluetooth, Plane, Moon, Sun, Sparkles, BellOff, Pencil, ChevronUp, ChevronDown, Settings, BatteryFull, Accessibility, Volume2 } from 'lucide-react';
import { useActivity, useBlogs, timeAgo } from '@/components/os/data';
import { Fluent } from './meta';

const panel = 'fixed right-3 bottom-[58px] z-[9100] rounded-lg win-acrylic win-text overflow-hidden';
const anim = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 30 },
  transition: { type: 'spring' as const, stiffness: 520, damping: 42 },
};

export function QuickSettings({
  theme, setTheme, brightness, setBrightness, dnd, setDnd, onSettings,
}: {
  theme: 'light' | 'dark';
  setTheme: (t: 'light' | 'dark') => void;
  brightness: number;
  setBrightness: (b: number) => void;
  dnd: boolean;
  setDnd: (on: boolean) => void;
  onSettings: () => void;
}) {
  const [wifi, setWifi] = useState(true);
  const [bt, setBt] = useState(true);
  const [plane, setPlane] = useState(false);
  const [saver, setSaver] = useState(false);
  const [volume, setVolume] = useState(0.6);

  const tiles = [
    { label: plane ? 'Airplane mode' : 'RitikNet', on: wifi && !plane, set: () => setWifi(!wifi), Icon: Wifi },
    { label: 'Bluetooth', on: bt && !plane, set: () => setBt(!bt), Icon: Bluetooth },
    { label: 'Airplane mode', on: plane, set: () => setPlane(!plane), Icon: Plane },
    { label: 'Energy saver', on: saver, set: () => setSaver(!saver), Icon: Sparkles },
    { label: 'Dark mode', on: theme === 'dark', set: () => setTheme(theme === 'dark' ? 'light' : 'dark'), Icon: Moon },
    { label: 'Do not disturb', on: dnd, set: () => setDnd(!dnd), Icon: BellOff },
  ];

  return (
    <motion.div {...anim} role="dialog" aria-label="Quick settings" className={`${panel} w-[360px]`} onPointerDown={(e) => e.stopPropagation()}>
      <div className="p-5 grid grid-cols-3 gap-x-3 gap-y-4">
        {tiles.map((t) => (
          <div key={t.label} className="flex flex-col items-center gap-1.5">
            <button
              onClick={t.set}
              aria-pressed={t.on}
              aria-label={t.label}
              className={`w-full h-12 rounded-md flex items-center justify-center border transition-colors ${
                t.on ? 'bg-[var(--win-accent)] text-[var(--win-accent-text)] border-transparent' : 'win-card win-hover'
              }`}
            >
              <t.Icon className="w-4 h-4" />
            </button>
            <span className="text-[11px] text-center leading-tight truncate w-full">{t.label}</span>
          </div>
        ))}
      </div>
      <div className="px-5 pb-5 space-y-4">
        <Slider icon={<Sun className="w-4 h-4" />} label="Brightness" value={brightness} min={0.35} onChange={setBrightness} />
        <Slider icon={<Volume2 className="w-4 h-4" />} label="Volume" value={volume} min={0} onChange={setVolume} />
      </div>
      <div className="h-12 px-4 flex items-center justify-between border-t win-stroke bg-[var(--win-hover)] text-[12px]">
        <span className="inline-flex items-center gap-1.5"><BatteryFull className="w-4 h-4" /> 100%</span>
        <span className="flex items-center gap-1">
          <button aria-label="Edit quick settings" className="w-8 h-8 rounded-md win-hover flex items-center justify-center"><Pencil className="w-3.5 h-3.5" /></button>
          <button aria-label="Accessibility" className="w-8 h-8 rounded-md win-hover flex items-center justify-center"><Accessibility className="w-3.5 h-3.5" /></button>
          <button aria-label="All settings" onClick={onSettings} className="w-8 h-8 rounded-md win-hover flex items-center justify-center"><Settings className="w-3.5 h-3.5" /></button>
        </span>
      </div>
    </motion.div>
  );
}

function Slider({ icon, label, value, min, onChange }: { icon: React.ReactNode; label: string; value: number; min: number; onChange: (v: number) => void }) {
  return (
    <label className="flex items-center gap-3">
      <span className="w-5 flex justify-center">{icon}</span>
      <input
        type="range"
        min={min}
        max={1}
        step={0.01}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        aria-label={label}
        className="win-range flex-1"
        style={{ ['--p' as string]: `${((value - min) / (1 - min)) * 100}%` }}
      />
    </label>
  );
}

/** Notification centre + calendar flyout (clock button). */
export function CalendarPanel({ dnd, onOpenPost, onOpenGitHub }: { dnd: boolean; onOpenPost: (slug: string) => void; onOpenGitHub: () => void }) {
  const [monthOffset, setMonthOffset] = useState(0);
  const [collapsed, setCollapsed] = useState(false);
  const activity = useActivity();
  const { data: posts } = useBlogs();
  const today = new Date();
  const view = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);

  const days = useMemo(() => {
    const start = new Date(view);
    start.setDate(1 - view.getDay());
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthOffset]);

  const latest = activity?.github?.latest;
  const notes = [
    latest && { key: 'gh', app: 'GitHub', icon: 'code_block_48_color', title: `Pushed to ${latest.repo}`, body: latest.message ?? 'New commits', when: latest.at, run: onOpenGitHub },
    posts?.[0] && { key: 'post', app: 'Blog', icon: 'document_48_color', title: 'New post', body: posts[0].title, when: posts[0].created_at, run: () => onOpenPost(posts[0].slug) },
    { key: 'hi', app: 'RitikOS', icon: 'alert_48_color', title: 'Welcome to the Fluent edition', body: 'Right-click the desktop, try Snap Layouts on the maximise button, or press Ctrl+K to search.', when: null, run: undefined },
  ].filter(Boolean) as { key: string; app: string; icon: string; title: string; body: string; when: string | null; run?: () => void }[];

  return (
    <motion.div {...anim} className="fixed right-3 bottom-[58px] z-[9100] w-[360px] flex flex-col gap-3" onPointerDown={(e) => e.stopPropagation()}>
      <section aria-label="Notifications" className="rounded-lg win-acrylic win-text p-3 max-h-[42vh] overflow-y-auto win-scroll">
        <div className="flex items-center justify-between px-1 mb-2">
          <p className="text-[13px] font-semibold">Notifications</p>
          {dnd && <span className="text-[11px] win-text-2">Do not disturb is on</span>}
        </div>
        <div className="space-y-2">
          {notes.map((n) => (
            <button key={n.key} onClick={n.run} className="w-full text-left rounded-md win-card p-3 win-hover">
              <p className="flex items-center gap-2 text-[11px] win-text-2 mb-1.5">
                <Fluent name={n.icon} size={14} /> {n.app}
                {n.when && <span className="ml-auto">{timeAgo(n.when)}</span>}
              </p>
              <p className="text-[13px] font-semibold">{n.title}</p>
              <p className="text-[12px] win-text-2 line-clamp-2">{n.body}</p>
            </button>
          ))}
        </div>
      </section>

      <section aria-label="Calendar" className="rounded-lg win-acrylic win-text overflow-hidden">
        <div className="flex items-center justify-between px-4 h-12 border-b win-stroke">
          <p className="text-[13px] font-semibold">{today.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          <button onClick={() => setCollapsed((c) => !c)} aria-label={collapsed ? 'Expand calendar' : 'Collapse calendar'} className="w-8 h-8 rounded-md win-hover flex items-center justify-center">
            {collapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
        {!collapsed && (
          <div className="p-3">
            <div className="flex items-center justify-between px-1 mb-2">
              <p className="text-[13px] font-semibold">{view.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p>
              <span className="flex">
                <button aria-label="Previous month" onClick={() => setMonthOffset((m) => m - 1)} className="w-8 h-8 rounded-md win-hover flex items-center justify-center"><ChevronUp className="w-4 h-4" /></button>
                <button aria-label="Next month" onClick={() => setMonthOffset((m) => m + 1)} className="w-8 h-8 rounded-md win-hover flex items-center justify-center"><ChevronDown className="w-4 h-4" /></button>
              </span>
            </div>
            <div className="grid grid-cols-7 text-center text-[12px] gap-y-0.5">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => <span key={d} className="h-8 flex items-center justify-center">{d}</span>)}
              {days.map((d) => {
                const isToday = d.toDateString() === today.toDateString();
                const inMonth = d.getMonth() === view.getMonth();
                return (
                  <span key={d.toISOString()} className={`h-10 w-10 mx-auto flex items-center justify-center rounded-full ${isToday ? 'bg-[var(--win-accent)] text-[var(--win-accent-text)] font-semibold' : inMonth ? 'win-hover' : 'win-text-2 opacity-60'}`}>
                    {d.getDate()}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </motion.div>
  );
}
