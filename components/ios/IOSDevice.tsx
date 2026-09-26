'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, FolderOpen, FileText } from 'lucide-react';
import LockScreen from './LockScreen';
import HomeScreen from './HomeScreen';
import AppShell from './AppShell';
import StatusBar from './StatusBar';
import { IOS_APPS, type IOSAppId } from './apps-meta';
import { ProjectsApp, ExperienceApp, CertificationsApp, SafariApp, NotesApp, ResumeApp } from './apps/content';
import { MailApp, PhotosApp, GitHubApp, ContactsApp, SettingsApp, AskApp } from './apps/system';
import CalculatorApp from '@/components/macos/apps/CalculatorApp';
import { readPref, writePref } from '@/components/macos/settings';
import { useBlogs, useProjects, useAskEnabled } from '@/components/os/data';

type ThemePref = 'auto' | 'light' | 'dark';

export default function IOSDevice() {
  const router = useRouter();
  const askEnabled = useAskEnabled();
  const [locked, setLocked] = useState(true);
  const [app, setApp] = useState<{ id: IOSAppId; origin: { x: number; y: number } } | null>(null);
  const [searching, setSearching] = useState(false);
  const [themePref, setThemePref] = useState<ThemePref>('auto');
  const [systemDark, setSystemDark] = useState(false);
  const [wallpaper, setWallpaper] = useState('dusk');

  useEffect(() => {
    setThemePref(readPref('ritikos-ios-theme', 'auto') as ThemePref);
    setWallpaper(readPref('ritikos-ios-wallpaper', 'dusk'));
    try {
      if (sessionStorage.getItem('ritikos-ios-unlocked') === '1') setLocked(false);
    } catch { /* ignore */ }
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemDark(mq.matches);
    const on = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  const theme = themePref === 'auto' ? (systemDark ? 'dark' : 'light') : themePref;

  const unlock = useCallback(() => {
    setLocked(false);
    try { sessionStorage.setItem('ritikos-ios-unlocked', '1'); } catch { /* ignore */ }
  }, []);

  const open = useCallback((id: IOSAppId, rect?: DOMRect) => {
    if (id === 'classic') return router.push('/');
    const origin = rect ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 } : { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    setSearching(false);
    setApp({ id, origin });
  }, [router]);

  const close = useCallback(() => setApp(null), []);

  const renderApp = (id: IOSAppId) => {
    switch (id) {
      case 'projects': return <ProjectsApp />;
      case 'experience': return <ExperienceApp />;
      case 'certifications': return <CertificationsApp />;
      case 'safari': return <SafariApp />;
      case 'notes': return <NotesApp />;
      case 'resume': return <ResumeApp />;
      case 'mail': return <MailApp onDone={close} />;
      case 'photos': return <PhotosApp />;
      case 'github': return <GitHubApp />;
      case 'contacts': return <ContactsApp onMessage={() => open('mail')} />;
      case 'calculator': return <div className="absolute inset-0 bg-black pt-[60px] pb-[40px]"><CalculatorApp /></div>;
      case 'ask': return askEnabled ? <AskApp /> : <div className="absolute inset-0 ios-screen flex items-center justify-center ios-secondary">Assistant is offline right now.</div>;
      case 'settings':
        return (
          <SettingsApp
            theme={themePref}
            setTheme={(t) => { setThemePref(t); writePref('ritikos-ios-theme', t); }}
            wallpaper={wallpaper}
            setWallpaper={(w) => { setWallpaper(w); writePref('ritikos-ios-wallpaper', w); }}
            onClassic={() => router.push('/')}
          />
        );
      default: return null;
    }
  };

  const darkApps: IOSAppId[] = ['calculator'];
  const statusTone = !app ? 'light' : darkApps.includes(app.id) || theme === 'dark' ? 'light' : 'dark';

  return (
    <div data-ios-theme={theme} className="ios-root fixed inset-0 overflow-hidden bg-black">
      <HomeScreen wallpaper={wallpaper} onOpen={open} onSearch={() => setSearching(true)} hiddenApps={new Set(app ? [app.id] : [])} />

      <AnimatePresence>
        {app && (
          <AppShell key={app.id} origin={app.origin} onClose={close} dark={darkApps.includes(app.id)}>
            {renderApp(app.id)}
          </AppShell>
        )}
      </AnimatePresence>

      <AnimatePresence>{searching && <IOSSearch key="search" onClose={() => setSearching(false)} onOpen={open} />}</AnimatePresence>

      {app && <StatusBar tone={statusTone} />}

      <AnimatePresence>{locked && <LockScreen key="lock" wallpaper={wallpaper} onUnlock={unlock} />}</AnimatePresence>
    </div>
  );
}

function IOSSearch({ onClose, onOpen }: { onClose: () => void; onOpen: (id: IOSAppId) => void }) {
  const [q, setQ] = useState('');
  const { data: projects } = useProjects();
  const { data: posts } = useBlogs();
  const t = q.trim().toLowerCase();
  const apps = useMemo(() => (Object.keys(IOS_APPS) as IOSAppId[]).filter((id) => IOS_APPS[id].name.toLowerCase().includes(t)), [t]);
  const pr = t ? (projects ?? []).filter((p) => `${p.title} ${p.short_description ?? ''}`.toLowerCase().includes(t)) : [];
  const po = t ? (posts ?? []).filter((p) => p.title.toLowerCase().includes(t)) : [];
  return (
    <motion.div className="fixed inset-0 z-[55] bg-black/40 backdrop-blur-2xl text-white pt-[62px] px-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="flex items-center gap-3">
        <div className="flex-1 h-10 rounded-xl bg-white/20 flex items-center gap-2 px-3">
          <Search className="w-4 h-4 opacity-70" />
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" aria-label="Search" className="flex-1 bg-transparent outline-none text-[17px] placeholder:text-white/60" />
        </div>
        <button onClick={onClose} className="text-[17px]">Cancel</button>
      </div>
      <div className="mt-5 space-y-5 overflow-y-auto max-h-[80vh] pb-10">
        <div className="grid grid-cols-4 gap-y-4 justify-items-center">
          {apps.slice(0, 8).map((id) => (
            <button key={id} onClick={() => onOpen(id)} className="flex flex-col items-center gap-1">
              {IOS_APPS[id].icon(56)}
              <span className="text-[11px]">{IOS_APPS[id].name}</span>
            </button>
          ))}
        </div>
        {(pr.length > 0 || po.length > 0) && (
          <div className="rounded-2xl bg-white/15 overflow-hidden">
            {pr.map((p) => (
              <a key={p.id} href={`/projects/${p.slug}`} className="flex items-center gap-3 px-4 py-3 border-b border-white/10"><FolderOpen className="w-5 h-5" /><span className="truncate">{p.title}</span></a>
            ))}
            {po.map((p) => (
              <a key={p.id} href={`/blog/${p.slug}`} className="flex items-center gap-3 px-4 py-3 border-b border-white/10"><FileText className="w-5 h-5" /><span className="truncate">{p.title}</span></a>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
