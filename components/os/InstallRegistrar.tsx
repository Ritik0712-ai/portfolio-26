'use client';

import { useEffect, useState } from 'react';

// Registers the RitikOS service worker (scoped to /magic) and keeps the
// browser's install prompt so the picker can offer an "Install" button.

type PromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> };

let deferred: PromptEvent | null = null;
const listeners = new Set<() => void>();

export default function InstallRegistrar() {
  useEffect(() => {
    if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
      navigator.serviceWorker.register('/ritikos-sw.js', { scope: '/magic' }).catch(() => {});
    }
    const onPrompt = (e: Event) => {
      e.preventDefault();
      deferred = e as PromptEvent;
      listeners.forEach((l) => l());
    };
    const onInstalled = () => {
      deferred = null;
      listeners.forEach((l) => l());
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

/** 'prompt' = one-tap install available, 'ios' = show Add-to-Home-Screen steps, 'installed' / 'none' = hide. */
export function useInstall() {
  const [, force] = useState(0);
  const [env, setEnv] = useState<{ standalone: boolean; ios: boolean }>({ standalone: false, ios: false });
  useEffect(() => {
    const l = () => force((n) => n + 1);
    listeners.add(l);
    const nav = navigator as Navigator & { standalone?: boolean };
    setEnv({
      standalone: window.matchMedia('(display-mode: standalone)').matches || !!nav.standalone,
      ios: /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1),
    });
    return () => {
      listeners.delete(l);
    };
  }, []);
  const state: 'prompt' | 'ios' | 'installed' | 'none' = env.standalone ? 'installed' : deferred ? 'prompt' : env.ios ? 'ios' : 'none';
  const install = async () => {
    if (!deferred) return false;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    deferred = null;
    force((n) => n + 1);
    return outcome === 'accepted';
  };
  return { state, install };
}
