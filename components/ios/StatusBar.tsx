'use client';

import { useEffect, useState } from 'react';

function useNow() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 10_000);
    return () => clearInterval(t);
  }, []);
  return now;
}

function useBattery() {
  const [level, setLevel] = useState<number>(1);
  useEffect(() => {
    const nav = navigator as Navigator & { getBattery?: () => Promise<{ level: number; addEventListener: (e: string, f: () => void) => void }> };
    nav.getBattery?.().then((b) => {
      setLevel(b.level);
      b.addEventListener('levelchange', () => setLevel(b.level));
    }).catch(() => {});
  }, []);
  return level;
}

export function useClockString() {
  const now = useNow();
  return now ? now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).replace(/\s?[AP]M/, '') : '';
}

/** iPhone status bar with Dynamic Island. `tone` = colour of the glyphs. */
export default function StatusBar({ tone = 'light', island }: { tone?: 'light' | 'dark'; island?: React.ReactNode }) {
  const time = useClockString();
  const battery = useBattery();
  const c = tone === 'light' ? '#fff' : '#000';
  return (
    <div className="absolute top-0 inset-x-0 z-[60] h-[54px] flex items-start justify-between px-7 pt-[17px] pointer-events-none select-none" style={{ color: c, paddingTop: 'max(17px, env(safe-area-inset-top))' }}>
      <span className="text-[16px] font-semibold tracking-tight w-16 tabular-nums" suppressHydrationWarning>{time}</span>
      {/* Dynamic Island */}
      <div className="absolute left-1/2 -translate-x-1/2 top-[11px] h-[35px] min-w-[120px] rounded-full bg-black flex items-center justify-center px-3 text-white">
        {island}
      </div>
      <span className="flex items-center gap-[5px] w-16 justify-end">
        {/* signal */}
        <svg width="18" height="11" viewBox="0 0 18 11" fill={c} aria-hidden><rect x="0" y="7" width="3" height="4" rx="0.8" /><rect x="5" y="5" width="3" height="6" rx="0.8" /><rect x="10" y="2.5" width="3" height="8.5" rx="0.8" /><rect x="15" y="0" width="3" height="11" rx="0.8" /></svg>
        {/* wifi */}
        <svg width="16" height="11" viewBox="0 0 16 11" fill={c} aria-hidden><path d="M8 2.2c2.3 0 4.4.9 6 2.4l1.2-1.2A10 10 0 0 0 8 .5 10 10 0 0 0 .8 3.4L2 4.6a8.5 8.5 0 0 1 6-2.4zm0 3.3c1.4 0 2.6.5 3.6 1.4l1.2-1.2A6.8 6.8 0 0 0 8 3.8 6.8 6.8 0 0 0 3.2 5.7l1.2 1.2A5 5 0 0 1 8 5.5zm0 3.3c.5 0 .9.2 1.2.5L8 10.5 6.8 9.3c.3-.3.7-.5 1.2-.5z" /></svg>
        {/* battery */}
        <span className="relative w-[25px] h-[12px] rounded-[4px] border" style={{ borderColor: tone === 'light' ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.4)' }} aria-label={`Battery ${Math.round(battery * 100)}%`}>
          <span className="absolute left-[1.5px] top-[1.5px] bottom-[1.5px] rounded-[2px]" style={{ width: `calc(${battery * 100}% - 3px)`, background: battery < 0.2 ? '#FF3B30' : c }} />
          <span className="absolute -right-[3px] top-[3.5px] w-[1.5px] h-[4px] rounded-r" style={{ background: tone === 'light' ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.4)' }} />
        </span>
      </span>
    </div>
  );
}
