'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { Laptop, ArrowLeft } from 'lucide-react';
import BootScreen from './BootScreen';
import LoginScreen from './LoginScreen';
import MenuBar from './MenuBar';
import Dock, { type DockEntry } from './Dock';
import DesktopIcons from './DesktopIcons';
import Window from './Window';
import { AppIcons, TrashIcon } from './icons';
import { useWindowManager } from './useWindowManager';
import type { AppId, WindowState } from './types';
import Finder, { type FinderFolder } from './apps/Finder';
import Notes from './apps/Notes';
import Preview from './apps/Preview';
import AboutPortfolio from './apps/AboutPortfolio';

type Phase = 'checking' | 'small-screen' | 'boot' | 'login' | 'desktop';

const WALLPAPERS = [
  { id: 'dusk', label: 'Dusk' },
  { id: 'aurora', label: 'Aurora' },
  { id: 'dawn', label: 'Dawn' },
];

const APP_NAMES: Record<AppId, string> = {
  finder: 'Finder',
  notes: 'Notes',
  preview: 'Preview',
  'about-portfolio': 'RitikOS',
};

function readPref(key: string, fallback: string) {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}
function writePref(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* private mode — preference just isn't remembered */
  }
}

export default function MacDesktop() {
  const router = useRouter();
  const wm = useWindowManager();
  const [phase, setPhase] = useState<Phase>('checking');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [wallpaper, setWallpaper] = useState('dusk');
  const [bounce, setBounce] = useState<Record<string, number>>({});

  useEffect(() => {
    setTheme(readPref('ritikos-theme', 'dark') as 'dark' | 'light');
    setWallpaper(readPref('ritikos-wallpaper', 'dusk'));
    if (window.innerWidth < 900) return setPhase('small-screen');
    let booted = false;
    try {
      booted = sessionStorage.getItem('ritikos-booted') === '1';
    } catch {
      /* ignore */
    }
    setPhase(booted ? 'desktop' : 'boot');
  }, []);

  const finishBoot = useCallback(() => setPhase('login'), []);
  const unlock = useCallback(() => {
    try {
      sessionStorage.setItem('ritikos-booted', '1');
    } catch {
      /* ignore */
    }
    setPhase('desktop');
  }, []);

  const launch = useCallback(
    (app: AppId, params?: Record<string, string>) => {
      setBounce((b) => ({ ...b, [app]: (b[app] ?? 0) + 1 }));
      const title =
        app === 'finder' ? (params?.folder ? params.folder[0].toUpperCase() + params.folder.slice(1) : 'Finder') : app === 'preview' ? 'Ritik_Agarwal_Resume.pdf' : app === 'notes' ? 'Notes' : 'About RitikOS';
      const size = app === 'finder' ? { w: 900, h: 560 } : app === 'notes' ? { w: 820, h: 560 } : app === 'preview' ? { w: 760, h: 820 } : { w: 460, h: 460 };
      wm.open(app, { title, params, ...size });
    },
    [wm]
  );

  // Dock click: restore/focus an existing window, otherwise launch.
  const dockClick = useCallback(
    (app: AppId) => {
      const wins = wm.windows.filter((w) => w.app === app);
      if (wins.length === 0) return launch(app);
      const top = [...wins].sort((a, b) => b.z - a.z)[0];
      wm.focus(top.id);
    },
    [wm, launch]
  );

  const goClassic = useCallback(() => router.push('/'), [router]);

  const renderApp = (win: WindowState) => {
    switch (win.app) {
      case 'finder':
        return <Finder initialFolder={(win.params?.folder as FinderFolder) ?? 'projects'} onOpenResume={() => launch('preview')} />;
      case 'notes':
        return <Notes initialNote={win.params?.note} />;
      case 'preview':
        return <Preview />;
      case 'about-portfolio':
        return <AboutPortfolio onClassic={goClassic} />;
    }
  };

  const running = new Set(wm.windows.map((w) => w.app));
  const focusedApp = wm.windows.find((w) => w.id === wm.focusedId)?.app;

  const dock: DockEntry[] = useMemo(
    () => [
      { id: 'finder', label: 'Finder', icon: AppIcons.finder, running: running.has('finder'), bounceKey: bounce.finder, onClick: () => dockClick('finder') },
      { id: 'notes', label: 'Notes — About me', icon: AppIcons.notes, running: running.has('notes'), bounceKey: bounce.notes, onClick: () => dockClick('notes') },
      { id: 'preview', label: 'Preview — Résumé', icon: AppIcons.preview, running: running.has('preview'), bounceKey: bounce.preview, onClick: () => dockClick('preview') },
      { id: 'classic', label: 'Classic portfolio', icon: AppIcons.classic, onClick: goClassic, separatorBefore: true },
      { id: 'trash', label: 'Trash', icon: (s) => <TrashIcon size={s} />, onClick: () => {} },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [wm.windows, bounce, dockClick, goClassic]
  );

  if (phase === 'checking') return <div className="fixed inset-0 bg-black" />;

  if (phase === 'small-screen') {
    return (
      <div className="fixed inset-0 bg-[#111] text-white flex flex-col items-center justify-center text-center px-8">
        <Laptop className="w-12 h-12 mb-5 opacity-80" />
        <h1 className="text-2xl font-semibold mb-2">RitikOS is made for a laptop</h1>
        <p className="text-sm text-white/70 max-w-xs mb-8">
          This is a desktop-style version of my portfolio with draggable windows and a Dock. Open it on a bigger screen for the full experience.
        </p>
        <button onClick={goClassic} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black text-sm font-medium mb-3">
          <ArrowLeft className="w-4 h-4" /> Back to the portfolio
        </button>
        <button onClick={() => setPhase('boot')} className="text-sm text-white/60 underline underline-offset-4">
          Continue anyway
        </button>
      </div>
    );
  }

  return (
    <div
      data-mac-theme={theme}
      data-wallpaper-tone={wallpaper === 'dawn' ? 'light' : 'dark'}
      className={`mac-root fixed inset-0 overflow-hidden mac-wallpaper-${wallpaper}`}
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", system-ui, sans-serif' }}
    >
      <AnimatePresence>
        {phase === 'boot' && <BootScreen key="boot" onDone={finishBoot} />}
        {phase === 'login' && <LoginScreen key="login" wallpaper={wallpaper} onUnlock={unlock} />}
      </AnimatePresence>

      {phase === 'desktop' && (
        <>
          <MenuBar
            activeApp={focusedApp ? APP_NAMES[focusedApp] : 'Finder'}
            theme={theme}
            wallpaper={wallpaper}
            wallpapers={WALLPAPERS}
            onTheme={(t) => { setTheme(t); writePref('ritikos-theme', t); }}
            onWallpaper={(w) => { setWallpaper(w); writePref('ritikos-wallpaper', w); }}
            onAbout={() => launch('about-portfolio')}
            onLock={() => setPhase('login')}
            onRestart={() => {
              wm.windows.forEach((w) => wm.close(w.id));
              setPhase('boot');
            }}
            onClassic={goClassic}
            shortcuts={[
              { label: 'Projects', run: () => launch('finder', { folder: 'projects' }) },
              { label: 'Experience', run: () => launch('finder', { folder: 'experience' }) },
              { label: 'About', run: () => launch('notes', { note: 'about' }) },
              { label: 'Résumé', run: () => launch('preview') },
            ]}
          />

          {/* Welcome widget */}
          <div className="absolute top-12 left-5 w-[300px] p-5 rounded-2xl mac-widget mac-on-wallpaper z-[4]">
            <p className="text-[11px] uppercase tracking-widest opacity-70 mb-2">Welcome</p>
            <p className="text-2xl font-semibold leading-tight mb-2">Hi, I&apos;m Ritik.</p>
            <p className="text-[13px] opacity-85 leading-relaxed">
              Full-stack developer and CS student at VIT Bhopal. Double-click a folder on the right, or open an app from the Dock.
            </p>
          </div>

          <DesktopIcons
            items={[
              { id: 'projects', label: 'Projects', kind: 'folder', open: () => launch('finder', { folder: 'projects' }) },
              { id: 'experience', label: 'Experience', kind: 'folder', open: () => launch('finder', { folder: 'experience' }) },
              { id: 'certifications', label: 'Certifications', kind: 'folder', open: () => launch('finder', { folder: 'certifications' }) },
              { id: 'resume', label: 'Resume.pdf', kind: 'pdf', open: () => launch('preview') },
            ]}
          />

          <AnimatePresence>
            {wm.windows.map((win) => (
              <Window
                key={win.id}
                win={win}
                focused={wm.focusedId === win.id}
                onFocus={() => wm.focus(win.id)}
                onClose={() => wm.close(win.id)}
                onMinimize={() => wm.minimize(win.id)}
                onToggleMax={() => wm.toggleMax(win.id)}
                onChange={(patch) => wm.update(win.id, patch)}
              >
                {renderApp(win)}
              </Window>
            ))}
          </AnimatePresence>

          <Dock entries={dock} />
        </>
      )}
    </div>
  );
}
