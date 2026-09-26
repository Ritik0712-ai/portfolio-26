'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { RotateCw, Palette, Monitor, Terminal as TerminalIcon, Laptop, Smartphone, Globe, ChevronRight, LayoutGrid } from 'lucide-react';
import { useWindowManager } from '@/components/macos/useWindowManager';
import { readPref, writePref } from '@/components/macos/settings';
import Terminal from '@/components/macos/apps/Terminal';
import Mail from '@/components/macos/apps/Mail';
import Photos from '@/components/macos/apps/Photos';
import GitHubPanel from '@/components/os/GitHubPanel';
import MusicPlayer from '@/components/os/MusicPlayer';
import { useAskEnabled } from '@/components/os/data';
import WinWindow, { TASKBAR_H } from './WinWindow';
import Taskbar from './Taskbar';
import StartMenu, { type PowerAction } from './StartMenu';
import Widgets from './Widgets';
import { QuickSettings, CalendarPanel } from './Panels';
import { BootScreen, LockScreen } from './BootLock';
import { WIN_APPS, TASKBAR, FolderGlyph, type WinAppId } from './meta';
import Explorer, { type ExplorerFolder } from './apps/Explorer';
import Browser from './apps/Browser';
import { Notepad, PdfViewer, WinSettings, About, RecycleBin, WinCalculator, CopilotPane } from './apps/Small';

type Phase = 'boot' | 'lock' | 'desktop' | 'off' | 'shutting-down';
type Overlay = null | 'start' | 'search' | 'widgets' | 'quick' | 'calendar' | 'copilot';

const FOLDER_TITLE: Record<string, string> = { home: 'Home', projects: 'Projects', experience: 'Experience', certifications: 'Certifications', documents: 'Documents', desktop: 'Desktop' };

export default function WinDesktop() {
  const router = useRouter();
  const wm = useWindowManager<WinAppId>({ top: 0, bottom: TASKBAR_H + 20 });
  const askEnabled = useAskEnabled();
  const [phase, setPhase] = useState<Phase>('boot');
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [askQ, setAskQ] = useState<string | undefined>();
  const [ctx, setCtx] = useState<{ x: number; y: number; sub?: boolean } | null>(null);
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [sleeping, setSleeping] = useState(false);
  const [dnd, setDnd] = useState(false);

  const [theme, setThemeS] = useState<'light' | 'dark'>('dark');
  const [wallpaper, setWallpaperS] = useState('glow');
  const [brightness, setBrightness] = useState(1);
  const [transparency, setTransparencyS] = useState(true);

  useEffect(() => {
    setThemeS(readPref('ritikos-win-theme', window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark') as 'light' | 'dark');
    setWallpaperS(readPref('ritikos-win-wallpaper', 'glow'));
    setTransparencyS(readPref('ritikos-win-transparency', '1') === '1');
    let signedIn = false;
    try { signedIn = sessionStorage.getItem('ritikos-win-signed-in') === '1'; } catch { /* ignore */ }
    setPhase(signedIn ? 'desktop' : 'boot');
  }, []);

  const setTheme = (t: 'light' | 'dark') => { setThemeS(t); writePref('ritikos-win-theme', t); };
  const setWallpaper = (w: string) => { setWallpaperS(w); writePref('ritikos-win-wallpaper', w); };
  const setTransparency = (on: boolean) => { setTransparencyS(on); writePref('ritikos-win-transparency', on ? '1' : '0'); };

  const unlock = useCallback(() => {
    try { sessionStorage.setItem('ritikos-win-signed-in', '1'); } catch { /* ignore */ }
    setPhase('desktop');
  }, []);
  const toLock = useCallback(() => setPhase('lock'), []);

  const openAsk = useCallback((q?: string) => {
    setAskQ(q);
    setOverlay('copilot');
  }, []);

  const launch = useCallback(
    (app: WinAppId, params?: Record<string, string>) => {
      setCtx(null);
      if (app === 'copilot') return openAsk();
      setOverlay(null);
      const meta = WIN_APPS[app];
      let title = meta.name;
      if (app === 'explorer') title = FOLDER_TITLE[params?.folder ?? 'home'] ?? 'File Explorer';
      if (app === 'resume') title = 'Ritik_Agarwal_Resume.pdf';
      if (app === 'terminal') title = 'Windows PowerShell';
      if (app === 'notepad') title = 'Notepad';
      wm.open(app, { title, params, w: meta.w, h: meta.h });
    },
    [wm, openAsk]
  );

  const switchTo = useCallback((to: 'mac' | 'android' | 'classic') => {
    router.push(to === 'mac' ? '/magic' : to === 'android' ? '/magic/android' : '/');
  }, [router]);

  const closeAll = useCallback(() => wm.windows.forEach((w) => wm.close(w.id)), [wm]);

  const power = useCallback((a: PowerAction) => {
    setOverlay(null);
    if (a === 'lock') return toLock();
    if (a === 'sleep') return setSleeping(true);
    if (a === 'restart') { closeAll(); return setPhase('boot'); }
    if (a === 'shutdown') { closeAll(); setPhase('shutting-down'); return; }
    switchTo(a);
  }, [toLock, closeAll, switchTo]);

  // Taskbar click: open, focus, or minimise like Windows does.
  const taskClick = useCallback((app: WinAppId) => {
    if (app === 'copilot') return setOverlay((o) => (o === 'copilot' ? null : 'copilot'));
    const wins = wm.windows.filter((w) => w.app === app);
    if (!wins.length) return launch(app);
    const top = [...wins].sort((a, b) => b.z - a.z)[0];
    if (top.id === wm.focusedId && !top.minimized) wm.minimize(top.id);
    else wm.focus(top.id);
    setOverlay(null);
  }, [wm, launch]);

  const showDesktop = useCallback(() => {
    const anyVisible = wm.windows.some((w) => !w.minimized);
    wm.windows.forEach((w) => (anyVisible ? wm.minimize(w.id) : wm.focus(w.id)));
  }, [wm]);

  useEffect(() => {
    if (phase !== 'desktop') return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setOverlay((o) => (o === 'search' ? null : 'search')); }
      else if (e.ctrlKey && e.key === 'Escape') { e.preventDefault(); setOverlay((o) => (o === 'start' ? null : 'start')); }
      else if (e.key === 'Escape') { setCtx(null); setOverlay(null); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase]);

  const running = useMemo(() => {
    const m = new Map<WinAppId, { focused: boolean; minimized: boolean; count: number }>();
    wm.windows.forEach((w) => {
      const prev = m.get(w.app);
      m.set(w.app, { focused: (prev?.focused ?? false) || (w.id === wm.focusedId && !w.minimized), minimized: w.minimized, count: (prev?.count ?? 0) + 1 });
    });
    if (overlay === 'copilot') m.set('copilot', { focused: true, minimized: false, count: 1 });
    return m;
  }, [wm.windows, wm.focusedId, overlay]);

  const renderApp = (win: (typeof wm.windows)[number]) => {
    const openBrowser = (p: Record<string, string>) => launch('browser', p);
    switch (win.app) {
      case 'explorer':
        return <Explorer initial={(win.params?.folder as ExplorerFolder) ?? 'home'} onOpenProject={(slug) => openBrowser({ project: slug })} onOpenPost={(slug) => openBrowser({ post: slug })} onOpenResume={() => launch('resume')} />;
      case 'browser':
        return (
          <Browser
            key={`${win.params?.post ?? ''}${win.params?.project ?? ''}`}
            initial={win.params?.post ? { kind: 'post', slug: win.params.post } : win.params?.project ? { kind: 'project', slug: win.params.project } : undefined}
          />
        );
      case 'mail': return <Mail />;
      case 'notepad': return <Notepad />;
      case 'photos': return <Photos />;
      case 'terminal':
        return (
          <Terminal
            variant="windows"
            prompt="PS C:\Users\Ritik>"
            onClose={() => wm.close(win.id)}
            onOpenResume={() => launch('resume')}
            onOpenProject={(slug) => openBrowser({ project: slug })}
            onOpenMail={() => launch('mail')}
          />
        );
      case 'github': return <div className="h-full overflow-y-auto win-scroll"><GitHubPanel /></div>;
      case 'music': return <div className="h-full win-solid"><MusicPlayer layout="mac" /></div>;
      case 'settings':
        return (
          <WinSettings
            key={win.params?.pane}
            initial={win.params?.pane}
            theme={theme} setTheme={setTheme}
            wallpaper={wallpaper} setWallpaper={setWallpaper}
            brightness={brightness} setBrightness={setBrightness}
            transparency={transparency} setTransparency={setTransparency}
            onSwitch={switchTo}
          />
        );
      case 'calculator': return <WinCalculator />;
      case 'resume': return <PdfViewer />;
      case 'recycle': return <RecycleBin />;
      case 'about': return <About />;
      default: return null;
    }
  };

  const desktopIcons: { id: string; label: string; icon: React.ReactNode; open: () => void }[] = [
    { id: 'recycle', label: 'Recycle Bin', icon: WIN_APPS.recycle.icon(44), open: () => launch('recycle') },
    { id: 'projects', label: 'Projects', icon: <FolderGlyph size={44} />, open: () => launch('explorer', { folder: 'projects' }) },
    { id: 'experience', label: 'Experience', icon: <FolderGlyph size={44} />, open: () => launch('explorer', { folder: 'experience' }) },
    { id: 'certifications', label: 'Certifications', icon: <FolderGlyph size={44} />, open: () => launch('explorer', { folder: 'certifications' }) },
    { id: 'resume', label: 'Resume.pdf', icon: WIN_APPS.resume.icon(44), open: () => launch('resume') },
    { id: 'terminal', label: 'Terminal', icon: WIN_APPS.terminal.icon(44), open: () => launch('terminal') },
  ];

  const toggle = (o: Exclude<Overlay, null>) => setOverlay((cur) => (cur === o ? null : o));

  return (
    <div
      data-win-theme={theme}
      data-win-transparency={transparency ? 'on' : 'off'}
      className={`win-root fixed inset-0 overflow-hidden win-wallpaper-${wallpaper} select-none`}
      onContextMenu={(e) => {
        if ((e.target as HTMLElement).closest('section[role=dialog], nav, [role=menu], [role=dialog], aside, textarea, input')) return;
        e.preventDefault();
        setOverlay(null);
        setCtx({ x: Math.min(e.clientX, window.innerWidth - 260), y: Math.min(e.clientY, window.innerHeight - 330) });
      }}
      onPointerDown={() => { setCtx(null); if (overlay) setOverlay(null); }}
    >
      {phase === 'desktop' && (
        <>
          {/* Desktop icons */}
          <div className="absolute top-2 left-1 bottom-14 flex flex-col flex-wrap content-start gap-1 z-[1]">
            {desktopIcons.map((d) => (
              <button
                key={d.id}
                onClick={() => setSelectedIcon(d.id)}
                onDoubleClick={() => { setSelectedIcon(null); d.open(); }}
                onKeyDown={(e) => e.key === 'Enter' && d.open()}
                className={`w-[78px] py-1.5 flex flex-col items-center gap-1 rounded-[4px] border text-white ${selectedIcon === d.id ? 'bg-white/25 border-white/40' : 'border-transparent hover:bg-white/10'}`}
              >
                {d.icon}
                <span className="text-[12px] leading-tight text-center [text-shadow:0_1px_2px_rgba(0,0,0,.9)] line-clamp-2">{d.label}</span>
              </button>
            ))}
          </div>

          <AnimatePresence>
            {wm.windows.map((win) => (
              <WinWindow
                key={win.id}
                win={win}
                focused={wm.focusedId === win.id}
                icon={WIN_APPS[win.app].icon(16)}
                darkChrome={win.app === 'terminal'}
                onFocus={() => wm.focus(win.id)}
                onClose={() => wm.close(win.id)}
                onMinimize={() => wm.minimize(win.id)}
                onToggleMax={() => wm.toggleMax(win.id)}
                onChange={(patch) => wm.update(win.id, patch)}
              >
                {renderApp(win)}
              </WinWindow>
            ))}
          </AnimatePresence>

          <Taskbar
            pinned={TASKBAR}
            running={running}
            startOpen={overlay === 'start'}
            searchOpen={overlay === 'search'}
            quickOpen={overlay === 'quick'}
            calendarOpen={overlay === 'calendar'}
            doNotDisturb={dnd}
            onStart={() => toggle('start')}
            onSearch={() => toggle('search')}
            onWidgets={() => toggle('widgets')}
            onApp={taskClick}
            onQuick={() => toggle('quick')}
            onCalendar={() => toggle('calendar')}
            onShowDesktop={showDesktop}
          />

          <AnimatePresence>
            {(overlay === 'start' || overlay === 'search') && (
              <StartMenu
                key="start"
                mode={overlay}
                onClose={() => setOverlay(null)}
                onApp={launch}
                onPower={power}
                onAsk={askEnabled ? (q) => openAsk(q) : undefined}
              />
            )}
            {overlay === 'widgets' && (
              <Widgets
                key="widgets"
                onClose={() => setOverlay(null)}
                onOpen={(w) => (typeof w === 'string' ? launch(w) : launch('browser', w as Record<string, string>))}
              />
            )}
            {overlay === 'quick' && (
              <QuickSettings
                key="quick"
                theme={theme} setTheme={setTheme}
                brightness={brightness} setBrightness={setBrightness}
                dnd={dnd} setDnd={setDnd}
                onSettings={() => launch('settings', { pane: 'personalization' })}
              />
            )}
            {overlay === 'calendar' && (
              <CalendarPanel key="cal" dnd={dnd} onOpenPost={(slug) => launch('browser', { post: slug })} onOpenGitHub={() => launch('github')} />
            )}
            {overlay === 'copilot' && (
              askEnabled ? (
                <CopilotPane key={`ask-${askQ ?? ''}`} initialQuestion={askQ} onClose={() => setOverlay(null)} />
              ) : (
                <motion.div key="ask-off" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onPointerDown={(e) => e.stopPropagation()} className="fixed right-3 bottom-[58px] z-[9100] w-[320px] p-4 rounded-lg win-acrylic win-text text-[13px]">
                  The assistant is offline right now — try the Terminal&apos;s <code>help</code> or the Browser instead.
                </motion.div>
              )
            )}
          </AnimatePresence>

          {ctx && (
            <div
              role="menu"
              className="fixed z-[9500] w-[250px] p-1 rounded-lg win-acrylic win-text text-[13px]"
              style={{ left: ctx.x, top: ctx.y }}
              onPointerDown={(e) => e.stopPropagation()}
            >
              {[
                { label: 'View', Icon: LayoutGrid, run: undefined, disabled: true },
                { label: 'Refresh', Icon: RotateCw, run: () => setCtx(null) },
                { divider: true },
                { label: 'Display settings', Icon: Monitor, run: () => launch('settings', { pane: 'system' }) },
                { label: 'Personalise', Icon: Palette, run: () => launch('settings', { pane: 'personalization' }) },
                { divider: true },
                { label: 'Open in Terminal', Icon: TerminalIcon, run: () => launch('terminal') },
              ].map((it, i) =>
                'divider' in it ? (
                  <div key={i} className="my-1 border-t win-stroke" />
                ) : (
                  <button key={it.label} role="menuitem" disabled={it.disabled} onClick={() => { setCtx(null); it.run?.(); }} className="w-full flex items-center gap-3 px-3 py-1.5 rounded-md win-hover text-left disabled:opacity-45">
                    <it.Icon className="w-4 h-4" /> {it.label}
                  </button>
                )
              )}
              <div className="my-1 border-t win-stroke" />
              <div className="relative" onPointerEnter={() => setCtx({ ...ctx, sub: true })} onPointerLeave={() => setCtx({ ...ctx, sub: false })}>
                <button role="menuitem" aria-haspopup onClick={() => setCtx({ ...ctx, sub: !ctx.sub })} className="w-full flex items-center gap-3 px-3 py-1.5 rounded-md win-hover text-left">
                  <Laptop className="w-4 h-4" /> Switch edition <ChevronRight className="w-3.5 h-3.5 ml-auto" />
                </button>
                {ctx.sub && (
                  <div role="menu" className={`absolute top-0 ${ctx.x > window.innerWidth - 520 ? 'right-full mr-1' : 'left-full ml-1'} w-[210px] p-1 rounded-lg win-acrylic`}>
                    {([
                      ['mac', 'Mac edition', Laptop],
                      ['android', 'Android edition', Smartphone],
                      ['classic', 'Classic portfolio', Globe],
                    ] as const).map(([id, label, Icon]) => (
                      <button key={id} role="menuitem" onClick={() => switchTo(id)} className="w-full flex items-center gap-3 px-3 py-1.5 rounded-md win-hover text-left">
                        <Icon className="w-4 h-4" /> {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      <AnimatePresence>
        {phase === 'boot' && <BootScreen key="boot" onDone={toLock} />}
        {phase === 'lock' && <LockScreen key="lock" wallpaper={wallpaper} onUnlock={unlock} />}
        {phase === 'shutting-down' && <BootScreen key="bye" label="Shutting down" onDone={() => setPhase('off')} />}
      </AnimatePresence>

      {phase === 'off' && (
        <div className="fixed inset-0 z-[10001] bg-black flex flex-col items-center justify-center gap-6 text-white/80 text-[13px]">
          <button onClick={() => setPhase('boot')} className="px-5 py-2 rounded-md border border-white/25 hover:bg-white/10" autoFocus>Power on</button>
          <div className="flex gap-3">
            <button onClick={() => switchTo('mac')} className="hover:underline">Mac edition</button>·
            <button onClick={() => switchTo('android')} className="hover:underline">Android edition</button>·
            <button onClick={() => switchTo('classic')} className="hover:underline">Classic portfolio</button>
          </div>
        </div>
      )}

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
            onClick={() => { setSleeping(false); toLock(); }}
            autoFocus
            aria-label="Wake"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
