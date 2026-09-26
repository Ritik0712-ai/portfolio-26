import { Briefcase, Award } from 'lucide-react';
import { AppIcon, Tile } from '@/components/macos/icons';

export type IOSAppId =
  | 'projects' | 'experience' | 'certifications' | 'safari' | 'mail' | 'notes' | 'photos'
  | 'github' | 'contacts' | 'resume' | 'settings' | 'calculator' | 'ask' | 'classic' | 'music';

export const IOS_APPS: Record<IOSAppId, { name: string; icon: (size: number) => React.ReactNode }> = {
  projects: { name: 'Projects', icon: (s) => <AppIcon id="files" size={s} /> },
  experience: { name: 'Experience', icon: (s) => <Tile size={s} from="#5E5CE6" to="#3634A3" glyph={Briefcase} /> },
  certifications: { name: 'Certificates', icon: (s) => <Tile size={s} from="#FFD60A" to="#F5A300" glyph={Award} glyphColor="#5A3A00" /> },
  safari: { name: 'Safari', icon: (s) => <AppIcon id="safari" size={s} /> },
  mail: { name: 'Mail', icon: (s) => <AppIcon id="mail" size={s} /> },
  notes: { name: 'Notes', icon: (s) => <AppIcon id="notes" size={s} /> },
  photos: { name: 'Photos', icon: (s) => <AppIcon id="photos" size={s} /> },
  music: { name: 'Music', icon: (s) => <AppIcon id="music" size={s} /> },
  github: { name: 'GitHub', icon: (s) => <AppIcon id="github" size={s} /> },
  contacts: { name: 'Contacts', icon: (s) => <AppIcon id="contacts" size={s} /> },
  resume: { name: 'Résumé', icon: (s) => <AppIcon id="preview" size={s} /> },
  settings: { name: 'Settings', icon: (s) => <AppIcon id="settings" size={s} /> },
  calculator: { name: 'Calculator', icon: (s) => <AppIcon id="calculator" size={s} /> },
  ask: { name: 'Ask Ritik', icon: (s) => <AppIcon id="siri" size={s} /> },
  classic: { name: 'Classic Site', icon: (s) => <AppIcon id="classic" size={s} /> },
};

export const HOME_GRID: IOSAppId[] = ['projects', 'experience', 'certifications', 'resume', 'photos', 'music', 'github', 'notes', 'contacts', 'calculator', 'settings', 'ask', 'classic'];
export const HOME_DOCK: IOSAppId[] = ['mail', 'safari', 'music', 'notes'];
