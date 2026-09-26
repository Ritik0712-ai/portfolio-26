'use client';

import { createContext, useContext } from 'react';

export const WALLPAPERS = [
  { id: 'dusk', label: 'Dusk' },
  { id: 'aurora', label: 'Aurora' },
  { id: 'dawn', label: 'Dawn' },
  { id: 'graphite', label: 'Graphite' },
  { id: 'lagoon', label: 'Lagoon' },
  { id: 'ember', label: 'Ember' },
] as const;

export const LIGHT_WALLPAPERS = new Set(['dawn']);

export interface OSSettings {
  theme: 'dark' | 'light';
  wallpaper: string;
  brightness: number; // 0.3 – 1
  dockMagnify: boolean;
  setTheme: (t: 'dark' | 'light') => void;
  setWallpaper: (w: string) => void;
  setBrightness: (b: number) => void;
  setDockMagnify: (on: boolean) => void;
}

export const SettingsContext = createContext<OSSettings | null>(null);

export function useOSSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useOSSettings must be used inside RitikOS');
  return ctx;
}

export function readPref(key: string, fallback: string) {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

export function writePref(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* private mode: preference just isn't remembered */
  }
}
