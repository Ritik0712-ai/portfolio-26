'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import BootScreen from './BootScreen';
import LoginScreen from './LoginScreen';
import MenuBar, { type MenuAction } from './MenuBar';
import Dock, { type DockEntry } from './Dock';
import DesktopIcons from './DesktopIcons';
import Window from './Window';
import Spotlight from './Spotlight';
import Launchpad from './Launchpad';
import NotificationCenter from './NotificationCenter';
import SiriPanel from './SiriPanel';
import { AppIcon, TrashIcon } from './icons';
import { useWindowManager } from './useWindowManager';
import { APPS, DOCK_APPS } from './registry';
import { SettingsContext, LIGHT_WALLPAPERS, readPref, writePref, type OSSettings } from './settings';
import type { AppId, WindowState } from './types';
import Finder, { type FinderFolder } from './apps/Finder';
import Notes from './apps/Notes';
import Preview from './apps/Preview';
import AboutPortfolio from './apps/AboutPortfolio';
import Safari from './apps/Safari';
import Mail from './apps/Mail';
import Terminal from './apps/Terminal';
import Photos from './apps/Photos';
import Contacts from './apps/Contacts';
import CalculatorApp from './apps/CalculatorApp';
import SystemSettings from './apps/SystemSettings';
import Trash from './apps/Trash';
import GitHubPanel from '@/components/os/GitHubPanel';
import MusicPlayer from '@/components/os/MusicPlayer';
import { useAskEnabled } from '@/components/os/data';

type Phase = 'boot' | 'login' | 'desktop' | 'off';
type Overlay = null | 'spotlight' | 'launchpad' | 'notifications' | 'siri';

export default function MacDesktop() {
  const router = useRouter();
  const wm = useWindowManager();
  const askEnabled = useAskEnabled();
  const [phase, setPhase] = useState<Phase>('boot');
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [siriQuestion, setSiriQuestion] = useState<string | undefined>();
  const [sleeping, setSleeping] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number } | null>(null);
  const [bounce, setBounce] = useState<Record<string, number>>({});

  // Settings (persisted per browser).
  const [theme, setThemeState] = useState<'dark' | 'light'>('dark');
  const [wallpaper, setWallpaperState] = useState('dusk');
  const [brightness, setBrightnessState] = useState(1);
  const [dockMagnify, setDockMagnifyState] = useState(true);

  useEffect(() => {
    setThemeState(readPref('ritikos-theme', 'dark') as 'dark' | 'light');
    setWallpaperState(readPref('ritikos-wallpaper', 'dusk'));
    setDockMagnifyState(readPref('ritikos-dock-magnify', '1') === '1');
    let booted = false;
    try {
      booted = sessionStorage.getItem('ritikos-booted') === '1';
    } catch {
      /* ignore */
    }
    setPhase(booted ? 'desktop' : 'boot');
  }, []);

  const settings: OSSettings = useMemo(
    () => ({
      theme,
      wallpaper,
      brightness,
      dockMagnify,
      setTheme: (t) => { setThemeState(t); writePref('ritikos-theme', t); },
      setWallpaper: (w) => { setWallpaperState(w); writePref('ritikos-wallpaper', w); },
      setBrightness: setBrightnessState,
      setDockMagnify: (on) => { setDockMagnifyState(on); writePref('ritikos-dock-magnify', on ? '1' : '0'); },
    }),
    [theme, wallpaper, brightness, dockMagnify]
  );

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
      const meta = APPS[app];
      let title = meta.name;
      if (app === 'finder' && params?.folder) title = params.folder[0].toUpperCase() + params.folder.slice(1);
      if (app === 'preview') title = 'Ritik_Agarwal_Resume.pdf';
      if (app === 'mail') title = 'New Message';
      if (app === 'terminal') title = 'ritik — rtksh — 80×24';
      wm.open(app, { title, params, w: meta.w, h: meta.h });
    },
    [wm]
  );

  const openSiri = useCallback((q?: string) => {
    setSiriQuestion(q);
    setOverlay('siri');
  }, []);

  const dockClick = useCallback(
    (app: AppId) => {
      const wins = wm.windows.filter((w) => w.app === app);
      if (wins.length === 0) return launch(app);
      wm.focus([...wins].sort((a, b) => b.z - a.z)[0].id);
    },
    [wm, launch]
  );

  const goClassic = useCallback(() => router.push('/'), [router]);
  const closeAll = useCallback(() => wm.windows.forEach((w) => wm.close(w.id)), [wm]);

  // Global shortcuts: ⌘K / Ctrl+K / ⌘Space → Spotlight, Esc closes overlays.
  useEffect(() => {
    if (phase !== 'desktop') return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key.toLowerCase() === 'k' || e.code === 'Space')) {
        e.preventDefault();
        setOverlay((o) => (o === 'spotlight' ? null : 'spotlight'));
      } else if (e.key === 'Escape') {
        setCtxMenu(null);
        setOverlay((o) => (o === 'siri' ? o : null));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase]);

  const focused = wm.windows.find((w) => w.id === wm.focusedId);

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
      case 'safari':
        return (
          <Safari
            key={`${win.params?.post ?? ''}${win.params?.project ?? ''}`}
            initial={win.params?.post ? { kind: 'post', slug: win.params.post } : win.params?.project ? { kind: 'project', slug: win.params.project } : undefined}
          />
        );
      case 'mail':
        return <Mail />;
      case 'terminal':
        return (
          <Terminal
            onClose={() => wm.close(win.id)}
            onOpenResume={() => launch('preview')}
            onOpenProject={(slug) => launch('safari', { project: slug })}
            onOpenMail={() => launch('mail')}
          />
        );
      case 'github':
        return <div className="h-full overflow-y-auto"><GitHubPanel /></div>;
      case 'photos':
        return <Photos />;
      case 'contacts':
        return <Contacts onMessage={() => launch('mail')} />;
      case 'calculator':
        return <CalculatorApp />;
      case 'settings':
        return <SystemSettings key={win.params?.pane} initialPane={win.params?.pane} onClassic={goClassic} />;
      case 'trash':
        return <Trash />;
      case 'music':
        return <MusicPlayer layout="mac" />;
    }
  };

  const running = new Set(wm.windows.map((w) => w.app));

  const dock: DockEntry[] = [
    { id: 'launchpad', label: 'Launchpad', icon: (s) => <AppIcon id="launchpad" size={s} />, onClick: () => setOverlay('launchpad') },
    ...DOCK_APPS.map((id) => ({
      id,
      label: APPS[id].name,
      icon: (s?: number) => <AppIcon id={APPS[id].icon} size={s} />,
      running: running.has(id),
      bounceKey: bounce[id],
      onClick: () => dockClick(id),
    })),
    ...(askEnabled ? [{ id: 'siri', label: 'Ask Ritik', icon: (s?: number) => <AppIcon id="siri" size={s} />, onClick: () => openSiri() }] : []),
    { id: 'classic', label: 'Classic portfolio', icon: (s) => <AppIcon id="classic" size={s} />, onClick: goClassic, separatorBefore: true },
    { id: 'trash', label: 'Trash', icon: (s) => <TrashIcon size={s} />, running: running.has('trash'), onClick: () => dockClick('trash') },
  ];

  const logoItems: MenuAction[] = [
    { label: 'About RitikOS', run: () => launch('about-portfolio') },
    { divider: true, label: '' },
    { label: 'System Settings…', run: () => launch('settings') },
    { divider: true, label: '' },
    { label: 'Sleep', run: () => setSleeping(true) },
    { label: 'Restart…', run: () => { closeAll(); setPhase('boot'); } },
    { label: 'Shut Down…', run: () => { closeAll(); setPhase('off'); } },
    { divider: true, label: '' },
    { label: 'Lock Screen', shortcut: '⌃⌘Q', run: () => setPhase('login') },
    { label: 'Back to classic portfolio', run: goClassic },
  ];

  const appMenus = [
    {
      title: 'File',
      items: [
        { label: 'New Finder Window', run: () => wm.open('finder', { title: 'Projects', params: { folder: 'projects' }, w: 900, h: 560, singleton: false }) },
        { label: 'New Message', run: () => launch('mail') },
        { divider: true, label: '' },
        { label: 'Close Window', disabled: !focused, run: () => focused && wm.close(focused.id) },
      ],
    },
    {
      title: 'Go',
      items: [
        { label: 'Projects', run: () => launch('finder', { folder: 'projects' }) },
        { label: 'Experience', run: () => launch('finder', { folder: 'experience' }) },
        { label: 'Certifications', run: () => launch('finder', { folder: 'certifications' }) },
        { label: 'Résumé', run: () => launch('preview') },
        { divider: true, label: '' },
        { label: 'Blog & case studies', run: () => launch('safari') },
        { label: 'GitHub activity', run: () => launch('github') },
        { label: 'Music', run: () => launch('music') },
      ],
    },
    {
      title: 'Window',
      items: [
        { label: 'Minimise', disabled: !focused, run: () => focused && wm.minimize(focused.id) },
        { label: 'Zoom', disabled: !focused, run: () => focused && wm.toggleMax(focused.id) },
        { divider: true, label: '' },
        { label: 'Close All', disabled: wm.windows.length === 0, run: closeAll },
      ],
    },
    {
      title: 'Help',
      items: [
        { label: 'Spotlight', shortcut: '⌘K', run: () => setOverlay('spotlight') },
        { label: 'Terminal commands', run: () => launch('terminal') },
        ...(askEnabled ? [{ label: 'Ask Ritik…', run: () => openSiri() }] : []),
      ],
    },
  ];

  const wallpaperTone = LIGHT_WALLPAPERS.has(wallpaper) ? 'light' : 'dark';

  return (
    <SettingsContext.Provider value={settings}>
      <div
        data-mac-theme={theme}
        data-wallpaper-tone={wallpaperTone}
        className={`mac-root fixed inset-0 overflow-hidden mac-wallpaper-${wallpaper}`}
        style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", "Segoe UI", system-ui, sans-serif' }}
        onContextMenu={(e) => {
          if ((e.target as HTMLElement).closest('section[role=dialog], nav, [role=menu]')) return;
          e.preventDefault();
          setCtxMenu({ x: e.clientX, y: e.clientY });
        }}
        onMouseDown={() => setCtxMenu(null)}
      >
        <AnimatePresence>
          {phase === 'boot' && <BootScreen key="boot" onDone={finishBoot} />}
          {phase === 'login' && <LoginScreen key="login" wallpaper={wallpaper} onUnlock={unlock} />}
        </AnimatePresence>

        {phase === 'off' && (
          <button className="fixed inset-0 z-[10001] bg-black flex items-end justify-center pb-10 text-white/40 text-[12px]" onClick={() => setPhase('boot')} autoFocus>
            Press to power on
          </button>
        )}

        {phase === 'desktop' && (
          <>
            <MenuBar
              activeApp={focused ? APPS[focused.app].name : 'Finder'}
              appMenus={appMenus}
              logoItems={logoItems}
              onSpotlight={() => setOverlay('spotlight')}
              onSiri={() => (askEnabled ? openSiri() : setOverlay('spotlight'))}
              onNotifications={() => setOverlay((o) => (o === 'notifications' ? null : 'notifications'))}
              focusMode={focusMode}
              onFocusMode={setFocusMode}
            />

            {/* Welcome widget */}
            <div className="absolute top-12 left-5 w-[300px] p-5 rounded-[22px] mac-widget mac-on-wallpaper z-[4]">
              <p className="text-[11px] uppercase tracking-widest opacity-70 mb-2">Welcome</p>
              <p className="text-2xl font-semibold leading-tight mb-2">Hi, I&apos;m Ritik.</p>
              <p className="text-[13px] opacity-85 leading-relaxed">
                Full-stack developer and CS student at VIT Bhopal. Double-click a folder, open an app from the Dock, or press ⌘K to search.
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

            <Dock key={String(dockMagnify)} entries={dock} magnify={dockMagnify} />

            {ctxMenu && (
              <div role="menu" className="fixed z-[9999] min-w-[210px] mac-menu p-1.5" style={{ left: ctxMenu.x, top: ctxMenu.y }} onMouseDown={(e) => e.stopPropagation()}>
                {[
                  { label: 'New Folder', disabled: true },
                  { divider: true, label: '' },
                  { label: 'Get Info', run: () => launch('about-portfolio') },
                  { label: 'Change Wallpaper…', run: () => launch('settings', { pane: 'wallpaper' }) },
                  { label: 'Open Terminal', run: () => launch('terminal') },
                  { divider: true, label: '' },
                  { label: 'Back to classic portfolio', run: goClassic },
                ].map((it: MenuAction, i) =>
                  it.divider ? (
                    <div key={i} className="my-1 border-t mac-divider" />
                  ) : (
                    <button key={i} role="menuitem" disabled={it.disabled} onClick={() => { setCtxMenu(null); it.run?.(); }} className="w-full text-left px-2.5 py-[3px] rounded-[5px] text-[13px] mac-menu-item mac-text disabled:opacity-40">
                      {it.label}
                    </button>
                  )
                )}
              </div>
            )}

            <AnimatePresence>
              {overlay === 'launchpad' && <Launchpad key="lp" onClose={() => setOverlay(null)} onApp={launch} />}
              {overlay === 'notifications' && <NotificationCenter key="nc" onClose={() => setOverlay(null)} />}
              {overlay === 'siri' && <SiriPanel key={`siri-${siriQuestion ?? ''}`} initialQuestion={siriQuestion} onClose={() => setOverlay(null)} />}
            </AnimatePresence>
            {overlay === 'spotlight' && (
              <Spotlight
                onClose={() => setOverlay(null)}
                onApp={(id) => launch(id)}
                onProject={(slug) => launch('safari', { project: slug })}
                onPost={(slug) => launch('safari', { post: slug })}
                onAsk={askEnabled ? (q) => setTimeout(() => openSiri(q), 0) : undefined}
              />
            )}
          </>
        )}

        {/* Display brightness + sleep */}
        <div className="fixed inset-0 pointer-events-none z-[9990] bg-black transition-opacity" style={{ opacity: 1 - brightness }} />
        <AnimatePresence>
          {sleeping && (
            <motion.button
              key="sleep"
              className="fixed inset-0 z-[10002] bg-black cursor-default"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              onClick={() => setSleeping(false)}
              onKeyDown={() => setSleeping(false)}
              autoFocus
              aria-label="Wake"
            />
          )}
        </AnimatePresence>
      </div>
    </SettingsContext.Provider>
  );
}
