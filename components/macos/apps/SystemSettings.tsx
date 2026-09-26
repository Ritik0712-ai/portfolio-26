'use client';

import { useState } from 'react';
import { Sun, Moon, Image as ImageIcon, Monitor, PanelBottom, Info, Search } from 'lucide-react';
import { useOSSettings, WALLPAPERS } from '../settings';
import AboutPortfolio from './AboutPortfolio';

type Pane = 'appearance' | 'wallpaper' | 'displays' | 'dock' | 'about';

const PANES: { id: Pane; label: string; icon: typeof Sun; color: string }[] = [
  { id: 'appearance', label: 'Appearance', icon: Sun, color: '#1C1C1E' },
  { id: 'wallpaper', label: 'Wallpaper', icon: ImageIcon, color: '#32ADE6' },
  { id: 'displays', label: 'Displays', icon: Monitor, color: '#0A84FF' },
  { id: 'dock', label: 'Desktop & Dock', icon: PanelBottom, color: '#1C1C1E' },
  { id: 'about', label: 'About', icon: Info, color: '#8E8E93' },
];

export default function SystemSettings({ initialPane = 'appearance', onClassic }: { initialPane?: string; onClassic: () => void }) {
  const s = useOSSettings();
  const [pane, setPane] = useState<Pane>((initialPane as Pane) ?? 'appearance');
  const [q, setQ] = useState('');
  const panes = PANES.filter((p) => p.label.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="flex h-full mac-text text-[13px]">
      <aside className="w-52 shrink-0 mac-sidebar px-2 py-3 overflow-y-auto">
        <div className="flex items-center gap-1.5 px-2 h-7 rounded-md mac-urlbar mb-3">
          <Search className="w-3.5 h-3.5 mac-text-faint" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" aria-label="Search settings" className="bg-transparent outline-none flex-1 text-[12px]" />
        </div>
        {panes.map((p) => (
          <button key={p.id} onClick={() => setPane(p.id)} className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left ${pane === p.id ? 'bg-[#0A84FF] text-white' : 'mac-hover'}`}>
            <span className="w-5 h-5 rounded-[5px] flex items-center justify-center" style={{ background: p.color }}><p.icon className="w-3 h-3 text-white" /></span>
            {p.label}
          </button>
        ))}
      </aside>
      <div className="flex-1 overflow-y-auto p-6">
        {pane === 'appearance' && (
          <Group title="Appearance">
            <div className="flex gap-6">
              {(['light', 'dark'] as const).map((t) => (
                <button key={t} onClick={() => s.setTheme(t)} className="flex flex-col items-center gap-2">
                  <span className={`w-24 h-16 rounded-lg overflow-hidden ring-2 ${s.theme === t ? 'ring-[#0A84FF]' : 'ring-transparent'}`}>
                    <span className={`block w-full h-full ${t === 'light' ? 'bg-gradient-to-br from-[#f5f5f7] to-[#d1d1d6]' : 'bg-gradient-to-br from-[#3a3a3c] to-[#1c1c1e]'}`} />
                  </span>
                  <span className="capitalize inline-flex items-center gap-1">{t === 'light' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}{t}</span>
                </button>
              ))}
            </div>
          </Group>
        )}
        {pane === 'wallpaper' && (
          <Group title="Wallpaper">
            <div className="grid grid-cols-3 gap-3">
              {WALLPAPERS.map((w) => (
                <button key={w.id} onClick={() => s.setWallpaper(w.id)} className="flex flex-col items-center gap-1.5">
                  <span className={`w-full aspect-video rounded-lg mac-wallpaper-${w.id} ring-2 ${s.wallpaper === w.id ? 'ring-[#0A84FF]' : 'ring-transparent'}`} />
                  <span className="text-[12px]">{w.label}</span>
                </button>
              ))}
            </div>
          </Group>
        )}
        {pane === 'displays' && (
          <Group title="Displays">
            <label className="block mb-1.5">Brightness</label>
            <input type="range" min={0.35} max={1} step={0.01} value={s.brightness} onChange={(e) => s.setBrightness(parseFloat(e.target.value))} className="w-full accent-[#0A84FF]" aria-label="Brightness" />
          </Group>
        )}
        {pane === 'dock' && (
          <Group title="Desktop & Dock">
            <label className="flex items-center justify-between">
              <span>Magnification</span>
              <input type="checkbox" checked={s.dockMagnify} onChange={(e) => s.setDockMagnify(e.target.checked)} className="w-9 h-5 accent-[#0A84FF]" />
            </label>
          </Group>
        )}
        {pane === 'about' && <AboutPortfolio onClassic={onClassic} />}
      </div>
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-[20px] font-bold mb-4">{title}</h2>
      <div className="rounded-xl mac-card p-4">{children}</div>
    </section>
  );
}
