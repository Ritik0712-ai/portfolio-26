'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, ArrowUp, Sparkles, Monitor, Palette, User, Info, Smartphone, Laptop, Globe, Search, ChevronRight, Check, History, Delete, LayoutGrid } from 'lucide-react';
import { aboutParagraphs, aboutHeadline } from '@/data/about';
import { nowData } from '@/data/now';
import { skillGroups } from '@/data/skills';
import InteractiveResume from '@/components/resume/InteractiveResume';
import { askAssistant, PROFILE } from '@/components/os/data';
import { WIN_WALLPAPERS, StartGlyph, BinGlyph, Fluent } from '../meta';

/* ------------------------------------------------------------------ Notepad */

const FILES = [
  { name: 'about.txt', body: () => `${aboutHeadline}\r\n\r\n${aboutParagraphs.join('\r\n\r\n')}` },
  {
    name: 'now.txt',
    body: () =>
      [
        `Last updated: ${nowData.lastUpdated}`,
        '',
        `Focus: ${nowData.focus}`,
        '',
        'Building',
        ...nowData.currentlyBuilding.map((x) => `  - ${x}`),
        '',
        'Learning',
        ...nowData.currentlyLearning.map((x) => `  - ${x}`),
        '',
        'Reading',
        ...nowData.currentlyReading.map((x) => `  - ${x}`),
      ].join('\r\n'),
  },
  { name: 'skills.txt', body: () => skillGroups.map((g) => `${g.title}\r\n  ${g.skills.join(', ')}`).join('\r\n\r\n') },
];

export function Notepad() {
  const [docs, setDocs] = useState(() => FILES.map((f) => ({ name: f.name, text: f.body(), dirty: false })));
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [wrap, setWrap] = useState(true);
  const [cursor, setCursor] = useState({ ln: 1, col: 1 });
  const [menu, setMenu] = useState<string | null>(null);
  const ref = useRef<HTMLTextAreaElement>(null);
  const doc = docs[active] ?? docs[0];

  const track = () => {
    const el = ref.current;
    if (!el) return;
    const before = el.value.slice(0, el.selectionStart);
    const lines = before.split('\n');
    setCursor({ ln: lines.length, col: lines[lines.length - 1].replace(/\r/g, '').length + 1 });
  };

  const newDoc = () => {
    setDocs((d) => [...d, { name: 'Untitled', text: '', dirty: false }]);
    setActive(docs.length);
  };
  const closeDoc = (i: number) => {
    if (docs.length === 1) return;
    setDocs((d) => d.filter((_, j) => j !== i));
    setActive((a) => Math.max(0, a >= i ? a - 1 : a));
  };

  const menus: Record<string, { label: string; run: () => void }[]> = {
    File: [
      { label: 'New tab', run: newDoc },
      { label: 'Download as .txt', run: () => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([doc.text], { type: 'text/plain' }));
        a.download = doc.name.endsWith('.txt') ? doc.name : `${doc.name}.txt`;
        a.click();
      } },
      { label: 'Close tab', run: () => closeDoc(active) },
    ],
    Edit: [
      { label: 'Select all', run: () => ref.current?.select() },
      { label: 'Restore original', run: () => setDocs((d) => d.map((x, j) => (j === active ? { ...x, text: FILES.find((f) => f.name === x.name)?.body() ?? '', dirty: false } : x))) },
    ],
    View: [
      { label: 'Zoom in', run: () => setZoom((z) => Math.min(200, z + 10)) },
      { label: 'Zoom out', run: () => setZoom((z) => Math.max(50, z - 10)) },
      { label: `${wrap ? '✓ ' : ''}Word wrap`, run: () => setWrap(!wrap) },
    ],
  };

  return (
    <div className="flex flex-col h-full text-[13px]" onClick={() => setMenu(null)}>
      <div className="flex items-end gap-1 px-2 pt-1.5 win-mica shrink-0">
        {docs.map((d, i) => (
          <div key={i} className={`flex items-center gap-2 h-8 pl-3 pr-1 max-w-[180px] rounded-t-lg ${i === active ? 'win-solid' : 'win-hover'}`}>
            <button onClick={() => setActive(i)} className="truncate text-[12px]">{d.dirty ? '• ' : ''}{d.name}</button>
            <button aria-label="Close tab" onClick={() => closeDoc(i)} className="w-6 h-6 rounded win-hover flex items-center justify-center"><X className="w-3 h-3" /></button>
          </div>
        ))}
        <button aria-label="New tab" onClick={newDoc} className="w-8 h-8 rounded-md win-hover flex items-center justify-center"><Plus className="w-4 h-4" /></button>
      </div>
      <div className="flex items-center gap-1 px-2 h-9 win-solid border-b win-stroke shrink-0 relative">
        {Object.keys(menus).map((m) => (
          <div key={m} className="relative">
            <button onClick={(e) => { e.stopPropagation(); setMenu(menu === m ? null : m); }} className={`px-3 h-7 rounded-md ${menu === m ? 'bg-[var(--win-hover)]' : 'win-hover'}`}>{m}</button>
            {menu === m && (
              <div role="menu" className="absolute left-0 top-8 z-20 w-48 p-1 rounded-lg win-acrylic">
                {menus[m].map((it) => (
                  <button key={it.label} role="menuitem" onClick={() => { setMenu(null); it.run(); }} className="w-full text-left px-3 py-1.5 rounded-md win-hover">{it.label}</button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <textarea
        ref={ref}
        value={doc.text}
        onChange={(e) => setDocs((d) => d.map((x, j) => (j === active ? { ...x, text: e.target.value, dirty: true } : x)))}
        onKeyUp={track}
        onClick={track}
        spellCheck={false}
        aria-label={doc.name}
        className={`flex-1 w-full p-4 bg-[var(--win-layer)] outline-none resize-none leading-relaxed ${wrap ? '' : 'whitespace-pre overflow-x-auto'}`}
        style={{ fontFamily: 'Consolas, "Cascadia Mono", var(--font-mono), monospace', fontSize: `${(14 * zoom) / 100}px` }}
      />
      <div className="h-7 px-4 flex items-center gap-6 text-[11px] win-text-2 border-t win-stroke shrink-0">
        <span>Ln {cursor.ln}, Col {cursor.col}</span>
        <span>{doc.text.length} characters</span>
        <span className="ml-auto">{zoom}%</span>
        <span>Windows (CRLF)</span>
        <span>UTF-8</span>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- PDF viewer */

export function PdfViewer() {
  return <InteractiveResume />;
}

/* ----------------------------------------------------------------- Settings */

type Pane = 'system' | 'personalization' | 'accounts' | 'editions' | 'about';

export function WinSettings({
  initial = 'personalization', theme, setTheme, wallpaper, setWallpaper, brightness, setBrightness, transparency, setTransparency, onSwitch,
}: {
  initial?: string;
  theme: 'light' | 'dark';
  setTheme: (t: 'light' | 'dark') => void;
  wallpaper: string;
  setWallpaper: (w: string) => void;
  brightness: number;
  setBrightness: (b: number) => void;
  transparency: boolean;
  setTransparency: (on: boolean) => void;
  onSwitch: (to: 'mac' | 'android' | 'classic' | 'all') => void;
}) {
  const [pane, setPane] = useState<Pane>((initial as Pane) || 'personalization');
  const [q, setQ] = useState('');
  const panes: { id: Pane; label: string; Icon: typeof Monitor; color: string }[] = [
    { id: 'system', label: 'System', Icon: Monitor, color: '#0078D4' },
    { id: 'personalization', label: 'Personalisation', Icon: Palette, color: '#C239B3' },
    { id: 'accounts', label: 'Accounts', Icon: User, color: '#2E9E6A' },
    { id: 'editions', label: 'RitikOS editions', Icon: Laptop, color: '#E8910C' },
    { id: 'about', label: 'About', Icon: Info, color: '#6B6B6B' },
  ];
  const visible = panes.filter((p) => p.label.toLowerCase().includes(q.toLowerCase()));
  const title = panes.find((p) => p.id === pane)?.label;

  return (
    <div className="flex h-full text-[13px] win-mica">
      <aside className="w-64 shrink-0 px-3 py-4 overflow-y-auto win-scroll">
        <div className="flex items-center gap-3 px-2 mb-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={PROFILE.photo} alt="" className="w-14 h-14 rounded-full object-cover" />
          <div className="min-w-0">
            <p className="font-semibold truncate">{PROFILE.name}</p>
            <p className="text-[12px] win-text-2 truncate">Local account</p>
          </div>
        </div>
        <label className="flex items-center gap-2 h-8 px-3 rounded-md win-input mb-3">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find a setting" aria-label="Find a setting" className="flex-1 bg-transparent outline-none text-[12px]" />
          <Search className="w-3.5 h-3.5 win-text-2" />
        </label>
        {visible.map((p) => (
          <button key={p.id} onClick={() => setPane(p.id)} className={`relative w-full flex items-center gap-3 h-9 px-3 rounded-md text-left ${pane === p.id ? 'bg-[var(--win-hover)]' : 'win-hover'}`}>
            {pane === p.id && <span className="absolute left-0 top-2.5 bottom-2.5 w-[3px] rounded-full bg-[var(--win-accent)]" />}
            <p.Icon className="w-4 h-4" style={{ color: p.color }} /> {p.label}
          </button>
        ))}
      </aside>

      <div className="flex-1 overflow-y-auto win-scroll px-8 py-6">
        <h1 className="text-[28px] font-semibold mb-6">{title}</h1>

        {pane === 'personalization' && (
          <>
            <div className="rounded-lg win-card p-5 mb-3 flex gap-6 items-center">
              <div className={`w-56 aspect-video rounded-md overflow-hidden relative win-wallpaper-${wallpaper} shadow`}>
                <div className="absolute bottom-0 inset-x-0 h-3 bg-white/60" />
                <div className="absolute left-1/2 -translate-x-1/2 bottom-5 w-24 h-14 rounded bg-white/70" />
              </div>
              <div>
                <p className="font-semibold mb-1">Select a theme to apply</p>
                <div className="flex gap-2 mt-2">
                  {(['light', 'dark'] as const).map((t) => (
                    <button key={t} onClick={() => setTheme(t)} aria-pressed={theme === t} className={`w-24 h-16 rounded-md border-2 ${theme === t ? 'border-[var(--win-accent)]' : 'border-transparent'} ${t === 'dark' ? 'bg-[#202020] text-white' : 'bg-[#f3f3f3] text-black'} text-[12px] capitalize`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <Row title="Background" desc="Original wallpapers made for RitikOS">
              <div className="flex gap-2">
                {WIN_WALLPAPERS.map((w) => (
                  <button key={w.id} onClick={() => setWallpaper(w.id)} aria-label={w.label} aria-pressed={wallpaper === w.id} className={`w-16 h-11 rounded-md win-wallpaper-${w.id} border-2 ${wallpaper === w.id ? 'border-[var(--win-accent)]' : 'border-transparent'} relative`}>
                    {wallpaper === w.id && <Check className="w-4 h-4 text-white absolute right-1 bottom-1 drop-shadow" />}
                  </button>
                ))}
              </div>
            </Row>
            <Row title="Transparency effects" desc="Windows and surfaces appear translucent">
              <Toggle on={transparency} set={setTransparency} label="Transparency effects" />
            </Row>
            <Row title="Accent colour" desc="Follows the theme — Fluent blue">
              <span className="w-8 h-8 rounded-md bg-[var(--win-accent)]" />
            </Row>
          </>
        )}

        {pane === 'system' && (
          <>
            <Row title="Brightness" desc="Adjust the brightness of the built-in display">
              <input type="range" min={0.35} max={1} step={0.01} value={brightness} onChange={(e) => setBrightness(parseFloat(e.target.value))} aria-label="Brightness" className="win-range w-48" style={{ ['--p' as string]: `${((brightness - 0.35) / 0.65) * 100}%` }} />
            </Row>
            <Row title="Display resolution" desc="Your browser window">
              <span className="win-text-2">{typeof window !== 'undefined' ? `${window.innerWidth} × ${window.innerHeight}` : ''}</span>
            </Row>
            <Row title="Storage" desc="Everything lives in Supabase and Vercel">
              <span className="win-text-2">0 bytes used on your device</span>
            </Row>
          </>
        )}

        {pane === 'accounts' && (
          <div className="rounded-lg win-card p-5 flex items-center gap-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={PROFILE.photo} alt="" className="w-20 h-20 rounded-full object-cover" />
            <div className="min-w-0">
              <p className="text-[18px] font-semibold">{PROFILE.name}</p>
              <p className="win-text-2">{PROFILE.role} · {PROFILE.school}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <a className="win-btn" href={`mailto:${PROFILE.email}`}>Email</a>
                <a className="win-btn" href={PROFILE.github} target="_blank" rel="noopener noreferrer">GitHub</a>
                <a className="win-btn" href={PROFILE.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
                <a className="win-btn" href={PROFILE.leetcode} target="_blank" rel="noopener noreferrer">LeetCode</a>
              </div>
            </div>
          </div>
        )}

        {pane === 'editions' && (
          <>
            <p className="win-text-2 mb-4">Same portfolio, same live data — three different operating-system skins. Pick one.</p>
            {([
              ['mac', 'Mac edition', 'Menu bar, Dock, Finder, Spotlight. iPhone-style on phones.', Laptop],
              ['android', 'Android edition', 'Material You phone with widgets, app drawer and quick settings.', Smartphone],
              ['all', 'All editions', 'Back to the edition picker.', LayoutGrid],
              ['classic', 'Classic portfolio', 'The regular scrolling website.', Globe],
            ] as const).map(([id, label, desc, Icon]) => (
              <button key={id} onClick={() => onSwitch(id)} className="w-full rounded-lg win-card win-hover p-4 mb-2 flex items-center gap-4 text-left">
                <Icon className="w-6 h-6 win-accent" />
                <span className="flex-1"><span className="block font-semibold">{label}</span><span className="block text-[12px] win-text-2">{desc}</span></span>
                <ChevronRight className="w-4 h-4 win-text-2" />
              </button>
            ))}
          </>
        )}

        {pane === 'about' && <About />}
      </div>
    </div>
  );
}

function Row({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg win-card px-5 py-4 mb-1 flex items-center gap-4">
      <div className="flex-1 min-w-0">
        <p>{title}</p>
        {desc && <p className="text-[12px] win-text-2">{desc}</p>}
      </div>
      {children}
    </div>
  );
}

export function Toggle({ on, set, label }: { on: boolean; set: (v: boolean) => void; label: string }) {
  return (
    <span className="flex items-center gap-3">
      <span className="text-[12px]">{on ? 'On' : 'Off'}</span>
      <button role="switch" aria-checked={on} aria-label={label} onClick={() => set(!on)} className="win-toggle" />
    </span>
  );
}

export function About() {
  const rows: [string, string][] = [
    ['Edition', 'RitikOS Fluent Edition'],
    ['Version', '2.0'],
    ['Owner', PROFILE.name],
    ['Built with', 'Next.js 15 · React 19 · TypeScript · Tailwind'],
    ['Data', 'Supabase — same content as the classic site'],
    ['Icons', 'Fluent UI System Icons (MIT)'],
  ];
  return (
    <div className="flex flex-col items-center text-center p-6 text-[13px]">
      <StartGlyph size={72} />
      <h1 className="text-[22px] font-semibold mt-3">RitikOS</h1>
      <p className="win-text-2 mb-5">Fluent Edition · inspired by Windows 11, not affiliated with Microsoft</p>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-left">
        {rows.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="win-text-2 text-right">{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function RecycleBin() {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-3 text-center win-text-2 p-6">
      <BinGlyph size={72} />
      <p className="text-[15px] win-text font-semibold">Recycle Bin is empty</p>
      <p className="text-[12px] max-w-xs">Every abandoned side project was either shipped or turned into a blog post. Nothing to restore.</p>
    </div>
  );
}

/* --------------------------------------------------------------- Calculator */

type Op = '+' | '−' | '×' | '÷' | null;
const calc = (a: number, b: number, op: Op) => (op === '+' ? a + b : op === '−' ? a - b : op === '×' ? a * b : op === '÷' ? (b === 0 ? NaN : a / b) : b);
const fmt = (n: number) => (!isFinite(n) ? 'Cannot divide by zero' : String(parseFloat(n.toPrecision(12))));

export function WinCalculator() {
  const [display, setDisplay] = useState('0');
  const [acc, setAcc] = useState<number | null>(null);
  const [op, setOp] = useState<Op>(null);
  const [fresh, setFresh] = useState(true);
  const [expr, setExpr] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [showHist, setShowHist] = useState(false);

  const digit = (d: string) => {
    if (fresh) { setDisplay(d === '.' ? '0.' : d); setFresh(false); return; }
    if (d === '.' && display.includes('.')) return;
    if (display.replace(/[-.]/g, '').length >= 16) return;
    setDisplay(display === '0' && d !== '.' ? d : display + d);
  };
  const operator = (o: Op) => {
    const cur = parseFloat(display);
    let base = cur;
    if (acc !== null && !fresh) { base = calc(acc, cur, op); setDisplay(fmt(base)); } else if (acc !== null && fresh) base = acc;
    setAcc(base); setOp(o); setFresh(true); setExpr(`${fmt(base)} ${o}`);
  };
  const equals = () => {
    if (acc === null || op === null) return;
    const b = parseFloat(display);
    const r = calc(acc, b, op);
    const line = `${fmt(acc)} ${op} ${fmt(b)} =`;
    setExpr(line); setHistory((h) => [`${line} ${fmt(r)}`, ...h].slice(0, 20));
    setDisplay(fmt(r)); setAcc(null); setOp(null); setFresh(true);
  };
  const unary = (f: (n: number) => number, label: string) => {
    const r = f(parseFloat(display));
    setExpr(`${label}(${display})`); setDisplay(fmt(r)); setFresh(true);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT' || (e.target as HTMLElement)?.tagName === 'TEXTAREA') return;
      if (/^[0-9.]$/.test(e.key)) digit(e.key);
      else if (e.key === '+') operator('+');
      else if (e.key === '-') operator('−');
      else if (e.key === '*') operator('×');
      else if (e.key === '/') { e.preventDefault(); operator('÷'); }
      else if (e.key === 'Enter' || e.key === '=') equals();
      else if (e.key === 'Escape') { setDisplay('0'); setAcc(null); setOp(null); setExpr(''); setFresh(true); }
      else if (e.key === 'Backspace') setDisplay((d) => (d.length > 1 ? d.slice(0, -1) : '0'));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const k = 'rounded-[4px] text-[15px] flex items-center justify-center border border-[var(--win-stroke)] transition-colors';
  const num = `${k} bg-[var(--win-layer)] hover:brightness-95 font-semibold`;
  const fn = `${k} win-card hover:bg-[var(--win-hover)]`;

  return (
    <div className="h-full flex flex-col p-1.5 win-mica select-none relative">
      <div className="flex items-center justify-between px-2 h-9">
        <p className="text-[18px] font-semibold">Standard</p>
        <button aria-label="History" onClick={() => setShowHist(!showHist)} className="w-8 h-8 rounded-md win-hover flex items-center justify-center"><History className="w-4 h-4" /></button>
      </div>
      <p className="px-3 text-right text-[13px] win-text-2 h-5 truncate">{expr}</p>
      <p className="px-3 text-right text-[44px] font-semibold tabular-nums truncate leading-tight">{display}</p>
      <div className="flex-1 grid grid-cols-4 gap-[2px] mt-2">
        <button className={fn} onClick={() => unary((n) => n / 100, 'percent')}>%</button>
        <button className={fn} onClick={() => { setDisplay('0'); setFresh(true); }}>CE</button>
        <button className={fn} onClick={() => { setDisplay('0'); setAcc(null); setOp(null); setExpr(''); setFresh(true); }}>C</button>
        <button className={fn} aria-label="Backspace" onClick={() => setDisplay((d) => (d.length > 1 ? d.slice(0, -1) : '0'))}><Delete className="w-4 h-4" /></button>
        <button className={fn} onClick={() => unary((n) => 1 / n, '1/')}>¹∕ₓ</button>
        <button className={fn} onClick={() => unary((n) => n * n, 'sqr')}>x²</button>
        <button className={fn} onClick={() => unary(Math.sqrt, '√')}>²√x</button>
        <button className={fn} onClick={() => operator('÷')}>÷</button>
        {['7', '8', '9'].map((d) => <button key={d} className={num} onClick={() => digit(d)}>{d}</button>)}
        <button className={fn} onClick={() => operator('×')}>×</button>
        {['4', '5', '6'].map((d) => <button key={d} className={num} onClick={() => digit(d)}>{d}</button>)}
        <button className={fn} onClick={() => operator('−')}>−</button>
        {['1', '2', '3'].map((d) => <button key={d} className={num} onClick={() => digit(d)}>{d}</button>)}
        <button className={fn} onClick={() => operator('+')}>+</button>
        <button className={num} onClick={() => setDisplay(fmt(-parseFloat(display)))}>+/−</button>
        <button className={num} onClick={() => digit('0')}>0</button>
        <button className={num} onClick={() => digit('.')}>.</button>
        <button className={`${k} bg-[var(--win-accent)] text-[var(--win-accent-text)] hover:brightness-110 text-[18px]`} onClick={equals}>=</button>
      </div>
      {showHist && (
        <div className="absolute inset-x-0 bottom-0 h-[62%] win-acrylic rounded-t-lg p-3 overflow-y-auto win-scroll">
          <p className="font-semibold mb-2">History</p>
          {history.length === 0 ? <p className="text-[12px] win-text-2">There&apos;s no history yet.</p> : history.map((h, i) => <p key={i} className="text-right text-[13px] py-1">{h}</p>)}
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------- Ask Ritik pane */

export function CopilotPane({ onClose, initialQuestion }: { onClose: () => void; initialQuestion?: string }) {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const endRef = useRef<HTMLDivElement>(null);
  const asked = useRef(false);

  const send = async (text: string) => {
    const q = text.trim();
    if (!q || busy) return;
    const next = [...messages, { role: 'user' as const, content: q }];
    setMessages(next); setInput(''); setBusy(true); setError('');
    try {
      const a = await askAssistant(next);
      setMessages([...next, { role: 'assistant', content: a.replace(/\*\*(.+?)\*\*/g, '$1') }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (initialQuestion && !asked.current) { asked.current = true; send(initialQuestion); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuestion]);
  useEffect(() => endRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' }), [messages, busy]);

  const suggestions = useMemo(() => ['What has Ritik built?', 'Is he open to internships?', 'Which project shows backend skills best?', 'What is he learning right now?'], []);

  return (
    <motion.aside
      role="dialog"
      aria-label="Ask Ritik"
      initial={{ x: 60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 60, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 480, damping: 42 }}
      onPointerDown={(e) => e.stopPropagation()}
      className="fixed right-3 top-3 bottom-[58px] z-[9100] w-[400px] max-w-[calc(100vw-24px)] rounded-lg win-acrylic win-text flex flex-col overflow-hidden"
    >
      <header className="flex items-center gap-3 px-4 h-14 border-b win-stroke">
        <Fluent name="bot_sparkle_24_color" size={26} />
        <div>
          <p className="font-semibold text-[14px]">Ask Ritik</p>
          <p className="text-[11px] win-text-2">Answers come only from this portfolio</p>
        </div>
        <button aria-label="Close" onClick={onClose} className="ml-auto w-8 h-8 rounded-md win-hover flex items-center justify-center"><X className="w-4 h-4" /></button>
      </header>
      <div className="flex-1 overflow-y-auto win-scroll p-4 space-y-3 text-[13px]">
        {messages.length === 0 && (
          <>
            <div className="rounded-lg win-card p-4">
              <p className="flex items-center gap-2 font-semibold mb-1"><Sparkles className="w-4 h-4 win-accent" /> Hi! I know Ritik&apos;s work.</p>
              <p className="win-text-2 text-[12px]">Ask about projects, skills, experience or availability.</p>
            </div>
            <div className="flex flex-col gap-1.5">
              {suggestions.map((s) => (
                <button key={s} onClick={() => send(s)} className="text-left px-3 py-2 rounded-md win-card win-hover text-[12px]">{s}</button>
              ))}
            </div>
          </>
        )}
        {messages.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex'}>
            <p className={`max-w-[88%] whitespace-pre-wrap rounded-lg px-3 py-2 ${m.role === 'user' ? 'bg-[var(--win-accent)] text-[var(--win-accent-text)]' : 'win-card'}`}>{m.content}</p>
          </div>
        ))}
        {busy && <p className="win-text-2 text-[12px] flex items-center gap-2"><Sparkles className="w-3.5 h-3.5 animate-pulse" /> Thinking…</p>}
        {error && <p className="text-[#D13438] text-[12px]">{error}</p>}
        <div ref={endRef} />
      </div>
      <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="p-3 border-t win-stroke">
        <div className="flex items-center gap-2 rounded-lg win-card px-3 py-2">
          <input autoFocus value={input} onChange={(e) => setInput(e.target.value)} maxLength={600} placeholder="Message Ask Ritik" aria-label="Question" className="flex-1 bg-transparent outline-none text-[13px]" />
          <button type="submit" disabled={!input.trim() || busy} aria-label="Send" className="w-8 h-8 rounded-md bg-[var(--win-accent)] text-[var(--win-accent-text)] flex items-center justify-center disabled:opacity-40"><ArrowUp className="w-4 h-4" /></button>
        </div>
      </form>
    </motion.aside>
  );
}
