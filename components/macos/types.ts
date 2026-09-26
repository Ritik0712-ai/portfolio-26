export type AppId = 'finder' | 'notes' | 'preview' | 'about-portfolio';

export interface WindowState {
  id: string;
  app: AppId;
  title: string;
  /** App-specific launch data, e.g. which Finder folder to open. */
  params?: Record<string, string>;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  minimized: boolean;
  maximized: boolean;
}

export const MENU_BAR_HEIGHT = 28;
export const DOCK_RESERVED = 88;
