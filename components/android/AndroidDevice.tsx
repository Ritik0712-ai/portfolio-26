'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { readPref, writePref } from '@/components/macos/settings';
import { useAskEnabled } from '@/components/os/data';
import { paletteVars } from './theme';
import { StatusBar, LockScreen, HomeScreen, AppDrawer, Shade, GestureBar, type AndAppId } from './System';
import {
  ProjectsApp, ExperienceApp, CertificatesApp, WebApp, MailApp, NotesApp, GalleryApp, GitHubApp, TerminalApp,
  MusicApp, CalculatorApp, SettingsApp, ContactsApp, ResumeApp, AssistantApp,
} from './Apps';

const W = 412;
const H = 900;

interface Running { id: AndAppId; origin: { x: number; y: number }; params?: Record<string, string> }

// RitikOS Android edition. Full-screen on phones; on laptops it sits in a
// phone frame next to a short explainer, scaled to fit the window.
export default function AndroidDevice() {
  const router = useRouter();
  const askEnabled = useAskEnabled();
  const screenRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<'phone' | 'framed' | null>(null);
  const [scale, setScale] = useState(1);
  const [locked, setLocked] = useState(true);
  const [app, setApp] = useState<Running | null>(null);
  const [drawer, setDrawer] = useState(false);
  const [shade, setShade] = useState(false);
  const [dark, setDarkS] = useState(false);
  const [themed, setThemedS] = useState(true);
  const [wallpaper, setWallpaperS] = useState('dune');
  const [brightness, setBrightness] = useState(1);

  useEffect(() => {
    const pick = () => {
      const phone = window.innerWidth < 640 || (window.matchMedia('(pointer: coarse)').matches && Math.min(window.innerWidth, window.innerHeight) < 600);
      setMode(phone ? 'phone' : 'framed');
      setScale(Math.min(1, (window.innerHeight - 48) / (H + 24)));
    };
    pick();
    window.addEventListener('resize', pick);
    setDarkS(readPref('ritikos-and-dark', window.matchMedia('(prefers-color-scheme: dark)').matches ? '1' : '0') === '1');
    setThemedS(readPref('ritikos-and-themed', '1') === '1');
    setWallpaperS(readPref('ritikos-and-wallpaper', 'dune'));
    try { if (sessionStorage.getItem('ritikos-and-unlocked') === '1') setLocked(false); } catch { /* ignore */ }
    return () => window.removeEventListener('resize', pick);
  }, []);

  const setDark = (d: boolean) => { setDarkS(d); writePref('ritikos-and-dark', d ? '1' : '0'); };
  const setThemed = (t: boolean) => { setThemedS(t); writePref('ritikos-and-themed', t ? '1' : '0'); };
  const setWallpaper = (w: string) => { setWallpaperS(w); writePref('ritikos-and-wallpaper', w); };

  const unlock = useCallback(() => {
    setLocked(false);
    try { sessionStorage.setItem('ritikos-and-unlocked', '1'); } catch { /* ignore */ }
  }, []);

  const open = useCallback((id: AndAppId, rect?: DOMRect, params?: Record<string, string>) => {
    const box = screenRef.current?.getBoundingClientRect();
    const s = box ? box.width / (screenRef.current?.offsetWidth || box.width) : 1;
    const origin = rect && box
      ? { x: (rect.left + rect.width / 2 - box.left) / s, y: (rect.top + rect.height / 2 - box.top) / s }
      : { x: (box?.width ?? W) / 2 / s, y: (box?.height ?? H) / 2 / s };
    setDrawer(false);
    setShade(false);
    setApp({ id, origin, params });
  }, []);

  const home = useCallback(() => { setApp(null); setDrawer(false); setShade(false); }, []);

  const switchTo = useCallback((to: 'mac' | 'windows' | 'classic') => {
    router.push(to === 'mac' ? '/magic' : to === 'windows' ? '/magic/windows' : '/');
  }, [router]);

  // Esc / Backspace-free "back" on keyboards.
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (shade) setShade(false);
      else if (drawer) setDrawer(false);
      else if (app) setApp(null);
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [shade, drawer, app]);

  const renderApp = (r: Running) => {
    const back = home;
    switch (r.id) {
      case 'projects': return <ProjectsApp onBack={back} initial={r.params?.project} />;
      case 'experience': return <ExperienceApp onBack={back} />;
      case 'certificates': return <CertificatesApp onBack={back} />;
      case 'web': return <WebApp onBack={back} initialPost={r.params?.post} />;
      case 'mail': return <MailApp onBack={back} />;
      case 'notes': return <NotesApp onBack={back} />;
      case 'gallery': return <GalleryApp onBack={back} />;
      case 'github': return <GitHubApp onBack={back} />;
      case 'terminal': return <TerminalApp onBack={back} onOpenResume={() => open('resume')} onOpenProject={(slug) => open('projects', undefined, { project: slug })} onOpenMail={() => open('mail')} />;
      case 'music': return <MusicApp onBack={back} />;
      case 'calculator': return <CalculatorApp onBack={back} />;
      case 'contacts': return <ContactsApp onBack={back} onMail={() => open('mail')} />;
      case 'resume': return <ResumeApp onBack={back} />;
      case 'assistant': return <AssistantApp onBack={back} enabled={askEnabled} />;
      case 'settings':
        return (
          <SettingsApp
            onBack={back}
            dark={dark} setDark={setDark}
            themed={themed} setThemed={setThemed}
            wallpaper={wallpaper} setWallpaper={setWallpaper}
            brightness={brightness} setBrightness={setBrightness}
            onSwitch={switchTo}
          />
        );
    }
  };

  if (!mode) return <div className="fixed inset-0 bg-black" />;

  const darkApp = app?.id === 'terminal';
  const barTone: 'light' | 'dark' = !app || darkApp || dark ? 'light' : 'dark';

  const screen = (
    <div
      ref={screenRef}
      data-and-theme={dark ? 'dark' : 'light'}
      className={`and-root overflow-hidden ${mode === 'phone' ? 'fixed inset-0' : 'relative w-[412px] h-[900px] rounded-[40px]'}`}
      style={{ ...paletteVars(wallpaper, dark), colorScheme: dark ? 'dark' : 'light' }}
    >
      <HomeScreen
        wallpaper={wallpaper}
        themed={themed}
        onOpen={(id, rect) => open(id, rect)}
        onDrawer={() => setDrawer(true)}
        onShade={() => setShade(true)}
        hidden={new Set(app ? [app.id] : [])}
      />

      <AnimatePresence>
        {drawer && (
          <AppDrawer
            key="drawer"
            themed={themed}
            onOpen={(id, rect) => open(id, rect)}
            onClose={() => setDrawer(false)}
            onOpenProject={(slug) => open('projects', undefined, { project: slug })}
            onOpenPost={(slug) => open('web', undefined, { post: slug })}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {app && (
          <motion.div
            key={app.id + (app.params ? JSON.stringify(app.params) : '')}
            className="absolute inset-0 z-30 overflow-hidden"
            style={{ transformOrigin: `${app.origin.x}px ${app.origin.y}px` }}
            initial={{ scale: 0.12, opacity: 0, borderRadius: 60 }}
            animate={{ scale: 1, opacity: 1, borderRadius: 0 }}
            exit={{ scale: 0.12, opacity: 0, borderRadius: 60 }}
            transition={{ type: 'spring', stiffness: 360, damping: 34, mass: 0.8 }}
          >
            {renderApp(app)}
          </motion.div>
        )}
      </AnimatePresence>

      {(app || drawer) && <StatusBar tone={drawer && !app ? (dark ? 'light' : 'dark') : barTone} onPull={() => setShade(true)} />}

      <AnimatePresence>
        {shade && (
          <Shade
            key="shade"
            dark={dark} setDark={setDark}
            brightness={brightness} setBrightness={setBrightness}
            onClose={() => setShade(false)}
            onOpen={({ app: id, post }) => open(id, undefined, post ? { post } : undefined)}
            onSettings={() => open('settings')}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>{locked && <LockScreen key="lock" wallpaper={wallpaper} onUnlock={unlock} />}</AnimatePresence>

      {!locked && <GestureBar tone={app || drawer ? (darkApp || dark ? 'light' : 'dark') : 'light'} onHome={home} />}

      <div className="absolute inset-0 pointer-events-none z-[70] bg-black transition-opacity" style={{ opacity: 1 - brightness }} />
      {mode === 'framed' && <span aria-hidden className="absolute top-3 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-black z-[80] ring-2 ring-white/5 pointer-events-none" />}
    </div>
  );

  if (mode === 'phone') return screen;

  return (
    <div className="fixed inset-0 overflow-hidden flex items-center justify-center gap-16 px-10" style={{ background: 'radial-gradient(60% 60% at 30% 40%, #2a2522 0%, #0f0d0c 70%)', fontFamily: 'var(--font-roboto), Roboto, system-ui, sans-serif' }}>
      <aside className="hidden lg:block max-w-sm text-white">
        <p className="text-[12px] uppercase tracking-[0.2em] text-white/50 mb-3">RitikOS · Android edition</p>
        <h1 className="text-[40px] leading-[1.05] font-medium mb-4">My portfolio, as a phone.</h1>
        <p className="text-white/70 text-[15px] leading-relaxed mb-6">
          Material You colours pulled from the wallpaper, live GitHub and blog data, and every app wired to the real site. Swipe up to unlock, swipe up again for all apps, pull down for quick settings.
        </p>
        <div className="flex flex-wrap gap-2 text-[13px]">
          <Link href="/magic" className="px-4 h-10 rounded-full bg-white/10 hover:bg-white/15 flex items-center">Mac edition</Link>
          <Link href="/magic/windows" className="px-4 h-10 rounded-full bg-white/10 hover:bg-white/15 flex items-center">Windows edition</Link>
          <Link href="/" className="px-4 h-10 rounded-full bg-white text-black flex items-center">Classic portfolio</Link>
        </div>
      </aside>
      <div style={{ width: (W + 24) * scale, height: (H + 24) * scale }} className="shrink-0">
        <div className="origin-top-left p-3 rounded-[52px] bg-[#1b1b1d] shadow-[0_40px_80px_rgba(0,0,0,.6),inset_0_0_0_1px_rgba(255,255,255,.08)]" style={{ transform: `scale(${scale})`, width: W + 24, height: H + 24 }}>
          {screen}
        </div>
      </div>
    </div>
  );
}
