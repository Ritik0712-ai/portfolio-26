'use client';

import { useCallback, useReducer } from 'react';
import type { AppId, WindowState } from './types';
import { MENU_BAR_HEIGHT } from './types';

interface State {
  windows: WindowState<string>[];
  topZ: number;
  focusedId: string | null;
}

type Action =
  | { type: 'open'; win: Omit<WindowState<string>, 'z' | 'minimized' | 'maximized'>; singleton: boolean }
  | { type: 'close'; id: string }
  | { type: 'focus'; id: string }
  | { type: 'minimize'; id: string }
  | { type: 'toggleMax'; id: string }
  | { type: 'update'; id: string; patch: Partial<WindowState<string>> };

function topVisible(windows: WindowState<string>[]) {
  return windows.filter((w) => !w.minimized).sort((a, b) => b.z - a.z)[0]?.id ?? null;
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'open': {
      if (action.singleton) {
        const existing = state.windows.find((w) => w.app === action.win.app);
        if (existing) {
          const z = state.topZ + 1;
          return {
            topZ: z,
            focusedId: existing.id,
            windows: state.windows.map((w) =>
              w.id === existing.id ? { ...w, z, minimized: false, params: action.win.params ?? w.params } : w
            ),
          };
        }
      }
      const z = state.topZ + 1;
      return {
        topZ: z,
        focusedId: action.win.id,
        windows: [...state.windows, { ...action.win, z, minimized: false, maximized: false }],
      };
    }
    case 'close': {
      const windows = state.windows.filter((w) => w.id !== action.id);
      return { ...state, windows, focusedId: state.focusedId === action.id ? topVisible(windows) : state.focusedId };
    }
    case 'focus': {
      if (state.focusedId === action.id) return state;
      const z = state.topZ + 1;
      return {
        topZ: z,
        focusedId: action.id,
        windows: state.windows.map((w) => (w.id === action.id ? { ...w, z, minimized: false } : w)),
      };
    }
    case 'minimize': {
      const windows = state.windows.map((w) => (w.id === action.id ? { ...w, minimized: true } : w));
      return { ...state, windows, focusedId: topVisible(windows) };
    }
    case 'toggleMax':
      return {
        ...state,
        windows: state.windows.map((w) => (w.id === action.id ? { ...w, maximized: !w.maximized } : w)),
      };
    case 'update':
      return {
        ...state,
        windows: state.windows.map((w) => (w.id === action.id ? { ...w, ...action.patch } : w)),
      };
  }
}

let counter = 0;

export interface OpenOptions {
  title: string;
  w: number;
  h: number;
  params?: Record<string, string>;
  singleton?: boolean;
}

export function useWindowManager<A extends string = AppId>(opts?: { top?: number; bottom?: number }) {
  const [state, dispatch] = useReducer(reducer, { windows: [], topZ: 10, focusedId: null });
  // NOTE: z-index stays below the menu bar (9000) / overlays; 10 + one per focus is plenty.

  const topInset = opts?.top ?? MENU_BAR_HEIGHT;
  const bottomInset = opts?.bottom ?? 110;
  const open = useCallback((app: A, o: OpenOptions) => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const w = Math.min(o.w, vw - 40);
    const h = Math.min(o.h, vh - topInset - bottomInset);
    // Cascade new windows so they don't stack exactly on top of each other.
    const offset = (counter % 6) * 28;
    counter += 1;
    const x = Math.max(20, Math.round((vw - w) / 2) - 80 + offset);
    const y = Math.max(topInset + 16, Math.round((vh - h) / 2) - 60 + offset);
    dispatch({
      type: 'open',
      singleton: o.singleton ?? true,
      win: { id: `${app}-${Date.now()}-${counter}`, app, title: o.title, params: o.params, x, y, w, h },
    });
  }, [topInset, bottomInset]);

  return {
    windows: state.windows as WindowState<A>[],
    focusedId: state.focusedId,
    open,
    close: useCallback((id: string) => dispatch({ type: 'close', id }), []),
    focus: useCallback((id: string) => dispatch({ type: 'focus', id }), []),
    minimize: useCallback((id: string) => dispatch({ type: 'minimize', id }), []),
    toggleMax: useCallback((id: string) => dispatch({ type: 'toggleMax', id }), []),
    update: useCallback((id: string, patch: Partial<WindowState<A>>) => dispatch({ type: 'update', id, patch: patch as Partial<WindowState<string>> }), []),
  };
}

export type WindowManager = ReturnType<typeof useWindowManager<AppId>>;
