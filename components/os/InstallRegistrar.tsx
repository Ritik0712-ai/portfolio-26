'use client';

import { useEffect, useState } from 'react';
import { Download, X, Share, MoreVertical, PlusSquare, Check } from 'lucide-react';

// Registers the RitikOS service worker (scoped to /magic), keeps the
// browser's one-tap install prompt when there is one, and provides an
// install button that ALWAYS works: if the browser hasn't offered a prompt
// (iPhone, Samsung Internet, Firefox, or Chrome before it decides), it shows
// the exact menu steps for that browser instead of hiding.

type PromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> };

let deferred: PromptEvent | null = null;
let installed = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export default function InstallRegistrar() {
  useEffect(() => {
    if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
      navigator.serviceWorker.register('/ritikos-sw.js', { scope: '/magic' }).catch(() => {});
    }
    const onPrompt = (e: Event) => {
      e.preventDefault();
      deferred = e as PromptEvent;
      emit();
    };
    const onInstalled = () => {
      deferred = null;
      installed = true;
      emit();
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);
  return null;
}

export type Browser = 'ios-safari' | 'ios-other' | 'samsung' | 'firefox-android' | 'android' | 'desktop-safari' | 'firefox-desktop' | 'desktop';

function detectBrowser(): Browser {
  const ua = navigator.userAgent;
  const ios = /iphone|ipad|ipod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (ios) return /crios|fxios|edgios|opios/i.test(ua) ? 'ios-other' : 'ios-safari';
  if (/android/i.test(ua)) {
    if (/samsungbrowser/i.test(ua)) return 'samsung';
    if (/firefox/i.test(ua)) return 'firefox-android';
    return 'android';
  }
  if (/firefox/i.test(ua)) return 'firefox-desktop';
  if (/safari/i.test(ua) && !/chrome|chromium|edg/i.test(ua)) return 'desktop-safari';
  return 'desktop';
}

/** state: 'installed' (running as the app), 'prompt' (one-tap install), 'manual' (show steps). */
export function useInstall() {
  const [, force] = useState(0);
  const [env, setEnv] = useState<{ standalone: boolean; browser: Browser } | null>(null);
  useEffect(() => {
    const l = () => force((n) => n + 1);
    listeners.add(l);
    const nav = navigator as Navigator & { standalone?: boolean };
    setEnv({
      standalone: window.matchMedia('(display-mode: standalone)').matches || !!nav.standalone,
      browser: detectBrowser(),
    });
    return () => {
      listeners.delete(l);
    };
  }, []);
  const state: 'loading' | 'installed' | 'prompt' | 'manual' = !env ? 'loading' : env.standalone || installed ? 'installed' : deferred ? 'prompt' : 'manual';
  const install = async () => {
    if (!deferred) return false;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    deferred = null;
    force((n) => n + 1);
    return outcome === 'accepted';
  };
  return { state, install, browser: env?.browser ?? 'desktop' };
}

const STEPS: Record<Browser, { title: string; steps: React.ReactNode[] }> = {
  'ios-safari': {
    title: 'Add RitikOS to your Home Screen',
    steps: [
      <>Tap <Share className="inline w-4 h-4 -mt-1" /> <b>Share</b> at the bottom of Safari.</>,
      <>Scroll down and tap <PlusSquare className="inline w-4 h-4 -mt-1" /> <b>Add to Home Screen</b>.</>,
      <>Tap <b>Add</b>. RitikOS opens full-screen like an app, even offline.</>,
    ],
  },
  'ios-other': {
    title: 'Add RitikOS to your Home Screen',
    steps: [
      <>Tap <Share className="inline w-4 h-4 -mt-1" /> <b>Share</b> (next to the address bar, or in the menu).</>,
      <>Tap <PlusSquare className="inline w-4 h-4 -mt-1" /> <b>Add to Home Screen</b>, then <b>Add</b>.</>,
      <>If you don&apos;t see it, open this page in Safari and try there.</>,
    ],
  },
  android: {
    title: 'Install RitikOS',
    steps: [
      <>Tap the <MoreVertical className="inline w-4 h-4 -mt-1" /> <b>menu</b> (top-right of the browser).</>,
      <>Tap <b>Install app</b> or <b>Add to Home screen</b>.</>,
      <>Confirm with <b>Install</b>. It appears in your app drawer.</>,
    ],
  },
  samsung: {
    title: 'Install RitikOS',
    steps: [
      <>Tap the <b>≡ menu</b> at the bottom right.</>,
      <>Tap <b>Add page to</b> → <b>Home screen</b>.</>,
      <>Tap <b>Add</b>.</>,
    ],
  },
  'firefox-android': {
    title: 'Install RitikOS',
    steps: [
      <>Tap the <MoreVertical className="inline w-4 h-4 -mt-1" /> <b>menu</b>.</>,
      <>Tap <b>Add app to Home screen</b> (or <b>Install</b>).</>,
      <>Confirm with <b>Add</b>.</>,
    ],
  },
  desktop: {
    title: 'Install RitikOS',
    steps: [
      <>Click the <b>install icon</b> at the right end of the address bar (a small screen with a down arrow).</>,
      <>Or open the browser menu → <b>Cast, save and share</b> → <b>Install page as app</b>.</>,
    ],
  },
  'desktop-safari': {
    title: 'Add RitikOS to your Dock',
    steps: [<>In the menu bar choose <b>File</b> → <b>Add to Dock</b>.</>],
  },
  'firefox-desktop': {
    title: 'Install RitikOS',
    steps: [<>Firefox on desktop can&apos;t install web apps. Open this page in Chrome, Edge or Brave to install it.</>],
  },
};

/**
 * Install button + instructions sheet. Hidden only when already running as
 * the installed app. `variant` lets each edition style it.
 */
export function InstallButton({ className = '', label = 'Install RitikOS as an app', compact = false }: { className?: string; label?: string; compact?: boolean }) {
  const { state, install, browser } = useInstall();
  const [open, setOpen] = useState(false);
  if (state === 'loading' || state === 'installed') return null;

  const onClick = async () => {
    if (state === 'prompt') {
      const ok = await install();
      if (!ok) setOpen(true);
    } else setOpen(true);
  };

  return (
    <>
      <button onClick={onClick} className={className} aria-haspopup="dialog">
        <Download className={compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} /> {label}
      </button>
      {open && <InstallSheet browser={browser} onClose={() => setOpen(false)} />}
    </>
  );
}

export function InstallSheet({ browser, onClose, onInstall }: { browser: Browser; onClose: () => void; onInstall?: () => void }) {
  const s = STEPS[browser];
  return (
    <div className="fixed inset-0 z-[20000] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-3" onClick={onClose} role="dialog" aria-modal="true" aria-label={s.title}>
      <div
        className="w-full max-w-sm rounded-2xl bg-[#1d1b22] text-white border border-white/10 shadow-2xl p-5"
        style={{ fontFamily: 'var(--font-dm-sans), system-ui, sans-serif' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 mb-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/ritikos-192.png" alt="" className="w-12 h-12 rounded-xl" />
          <div className="flex-1 min-w-0">
            <p className="text-[16px] font-semibold leading-tight">{s.title}</p>
            <p className="text-[12px] text-white/60 mt-0.5">Free · no app store · works offline</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="p-1.5 rounded-full hover:bg-white/10"><X className="w-4 h-4" /></button>
        </div>
        {onInstall && (
          <>
            <button onClick={onInstall} className="w-full h-11 rounded-xl bg-white text-black text-[15px] font-semibold inline-flex items-center justify-center gap-2 mb-4">
              <Download className="w-4 h-4" /> Install now
            </button>
            <p className="text-[12px] text-white/50 mb-3">Or do it from the browser menu:</p>
          </>
        )}
        <ol className="space-y-3 text-[14px] text-white/85">
          {s.steps.map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="w-6 h-6 shrink-0 rounded-full bg-white/10 text-[12px] flex items-center justify-center">{i + 1}</span>
              <span className="leading-relaxed pt-0.5">{step}</span>
            </li>
          ))}
        </ol>
        <button onClick={onClose} className="mt-5 w-full h-10 rounded-xl bg-white text-black text-[14px] font-medium inline-flex items-center justify-center gap-2">
          <Check className="w-4 h-4" /> Got it
        </button>
      </div>
    </div>
  );
}
