// Material You-style dynamic colour for RitikOS Android edition. Each original
// wallpaper carries a seed palette (tonal roles follow Material 3 naming);
// the whole UI re-themes when the wallpaper changes, like on a real phone.

import type { CSSProperties } from 'react';

type Roles = {
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  secondaryContainer: string;
  onSecondaryContainer: string;
  surface: string;
  surfaceLow: string;
  surfaceContainer: string;
  surfaceHigh: string;
  surfaceHighest: string;
  onSurface: string;
  onSurfaceVariant: string;
  outline: string;
  outlineVariant: string;
};

export const ANDROID_WALLPAPERS = [
  { id: 'dune', label: 'Dune' },
  { id: 'lagoon', label: 'Lagoon' },
  { id: 'bloom', label: 'Bloom' },
  { id: 'forest', label: 'Forest' },
] as const;

export type AndroidWallpaper = (typeof ANDROID_WALLPAPERS)[number]['id'];

const P: Record<AndroidWallpaper, { light: Roles; dark: Roles }> = {
  dune: {
    light: { primary: '#9A4521', onPrimary: '#FFFFFF', primaryContainer: '#FFDBCC', onPrimaryContainer: '#380D00', secondaryContainer: '#F7DED3', onSecondaryContainer: '#2C160D', surface: '#FFF8F6', surfaceLow: '#FEF1EC', surfaceContainer: '#F8EBE6', surfaceHigh: '#F2E5E0', surfaceHighest: '#ECE0DA', onSurface: '#231A16', onSurfaceVariant: '#53433E', outline: '#85736D', outlineVariant: '#D8C2BA' },
    dark: { primary: '#FFB599', onPrimary: '#5A1D03', primaryContainer: '#7A2F0E', onPrimaryContainer: '#FFDBCC', secondaryContainer: '#5D4034', onSecondaryContainer: '#FFDBCC', surface: '#1A110E', surfaceLow: '#231A16', surfaceContainer: '#271E1A', surfaceHigh: '#322824', surfaceHighest: '#3D322E', onSurface: '#F1DFD9', onSurfaceVariant: '#D8C2BA', outline: '#A08D86', outlineVariant: '#53433E' },
  },
  lagoon: {
    light: { primary: '#006A6A', onPrimary: '#FFFFFF', primaryContainer: '#9CF1F0', onPrimaryContainer: '#002020', secondaryContainer: '#CCE8E7', onSecondaryContainer: '#051F1F', surface: '#F4FBFA', surfaceLow: '#EFF5F4', surfaceContainer: '#E9EFEE', surfaceHigh: '#E3E9E8', surfaceHighest: '#DDE4E3', onSurface: '#161D1D', onSurfaceVariant: '#3F4948', outline: '#6F7979', outlineVariant: '#BEC9C8' },
    dark: { primary: '#80D5D4', onPrimary: '#003737', primaryContainer: '#004F4F', onPrimaryContainer: '#9CF1F0', secondaryContainer: '#324B4B', onSecondaryContainer: '#CCE8E7', surface: '#0E1514', surfaceLow: '#161D1D', surfaceContainer: '#1A2121', surfaceHigh: '#252B2B', surfaceHighest: '#2F3636', onSurface: '#DDE4E3', onSurfaceVariant: '#BEC9C8', outline: '#889392', outlineVariant: '#3F4948' },
  },
  bloom: {
    light: { primary: '#6750A4', onPrimary: '#FFFFFF', primaryContainer: '#EADDFF', onPrimaryContainer: '#21005D', secondaryContainer: '#E8DEF8', onSecondaryContainer: '#1D192B', surface: '#FEF7FF', surfaceLow: '#F7F2FA', surfaceContainer: '#F3EDF7', surfaceHigh: '#ECE6F0', surfaceHighest: '#E6E0E9', onSurface: '#1D1B20', onSurfaceVariant: '#49454F', outline: '#79747E', outlineVariant: '#CAC4D0' },
    dark: { primary: '#D0BCFF', onPrimary: '#381E72', primaryContainer: '#4F378B', onPrimaryContainer: '#EADDFF', secondaryContainer: '#4A4458', onSecondaryContainer: '#E8DEF8', surface: '#141218', surfaceLow: '#1D1B20', surfaceContainer: '#211F26', surfaceHigh: '#2B2930', surfaceHighest: '#36343B', onSurface: '#E6E0E9', onSurfaceVariant: '#CAC4D0', outline: '#938F99', outlineVariant: '#49454F' },
  },
  forest: {
    light: { primary: '#4C662B', onPrimary: '#FFFFFF', primaryContainer: '#CDEDA3', onPrimaryContainer: '#102000', secondaryContainer: '#DCE7C8', onSecondaryContainer: '#131F0D', surface: '#F9FAEF', surfaceLow: '#F3F4E9', surfaceContainer: '#EEEFE3', surfaceHigh: '#E8E9DE', surfaceHighest: '#E2E3D8', onSurface: '#1A1C16', onSurfaceVariant: '#44483D', outline: '#75796C', outlineVariant: '#C5C8BA' },
    dark: { primary: '#B1D18A', onPrimary: '#1F3701', primaryContainer: '#354E16', onPrimaryContainer: '#CDEDA3', secondaryContainer: '#3F4A34', onSecondaryContainer: '#DCE7C8', surface: '#12140E', surfaceLow: '#1A1C16', surfaceContainer: '#1E201A', surfaceHigh: '#282B24', surfaceHighest: '#33362E', onSurface: '#E2E3D8', onSurfaceVariant: '#C5C8BA', outline: '#8F9285', outlineVariant: '#44483D' },
  },
};

const kebab = (s: string) => s.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);

/** CSS custom properties (--md-*) for the chosen wallpaper + theme. */
export function paletteVars(wallpaper: string, dark: boolean): CSSProperties {
  const set = P[(wallpaper as AndroidWallpaper) in P ? (wallpaper as AndroidWallpaper) : 'dune'][dark ? 'dark' : 'light'];
  const vars: Record<string, string> = {};
  for (const [k, v] of Object.entries(set)) vars[`--md-${kebab(k)}`] = v;
  return vars as CSSProperties;
}

export function seedOf(wallpaper: string) {
  return P[(wallpaper as AndroidWallpaper) in P ? (wallpaper as AndroidWallpaper) : 'dune'];
}
