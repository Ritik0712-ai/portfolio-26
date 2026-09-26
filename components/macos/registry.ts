import type { AppId } from './types';
import type { IconId } from './icons';

export interface AppMeta {
  name: string;
  icon: IconId;
  w: number;
  h: number;
  /** Shown in Dock / Launchpad / Spotlight. */
  keywords?: string;
}

export const APPS: Record<AppId, AppMeta> = {
  finder: { name: 'Finder', icon: 'finder', w: 900, h: 560, keywords: 'files projects experience certifications' },
  safari: { name: 'Safari', icon: 'safari', w: 1000, h: 680, keywords: 'browser blog case studies web' },
  mail: { name: 'Mail', icon: 'mail', w: 640, h: 520, keywords: 'contact email message hire' },
  notes: { name: 'Notes', icon: 'notes', w: 820, h: 560, keywords: 'about now uses bio' },
  music: { name: 'Music', icon: 'music', w: 820, h: 560, keywords: 'spotify songs playlist listen' },
  photos: { name: 'Photos', icon: 'photos', w: 920, h: 600, keywords: 'gallery pictures screenshots' },
  terminal: { name: 'Terminal', icon: 'terminal', w: 720, h: 460, keywords: 'shell command line cli' },
  github: { name: 'GitHub', icon: 'github', w: 720, h: 640, keywords: 'code repositories contributions activity' },
  contacts: { name: 'Contacts', icon: 'contacts', w: 520, h: 560, keywords: 'socials linkedin email' },
  calculator: { name: 'Calculator', icon: 'calculator', w: 260, h: 420, keywords: 'math' },
  preview: { name: 'Preview', icon: 'preview', w: 760, h: 820, keywords: 'resume cv pdf' },
  settings: { name: 'System Settings', icon: 'settings', w: 760, h: 520, keywords: 'appearance wallpaper dark light dock' },
  'about-portfolio': { name: 'About RitikOS', icon: 'settings', w: 460, h: 470 },
  trash: { name: 'Trash', icon: 'finder', w: 520, h: 360 },
};

/** Order of apps in the Dock (before the separator). */
export const DOCK_APPS: AppId[] = ['finder', 'safari', 'mail', 'notes', 'photos', 'music', 'terminal', 'github', 'contacts', 'calculator', 'settings'];

/** Apps listed in Launchpad and Spotlight. */
export const LAUNCHPAD_APPS: AppId[] = ['finder', 'safari', 'mail', 'notes', 'photos', 'music', 'terminal', 'github', 'contacts', 'calculator', 'preview', 'settings'];
