'use client';

// English / Hindi toggle for the classic site.
//
// Text is rendered in BOTH languages (<T en hi />) and CSS shows the one that
// matches <html data-lang>. A tiny inline script in the root layout sets that
// attribute from localStorage before first paint, so pages stay static (no
// cookies, no per-language routes) and there is no flash of the wrong
// language. Strings that can't be dual-rendered (placeholders, aria-labels)
// use the useLang() hook instead.

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

export type Lang = 'en' | 'hi';
const KEY = 'lang';

/** Runs before paint (inlined in <head>). Keep it tiny and dependency-free. */
export const LANG_BOOT_SCRIPT = `try{var l=localStorage.getItem('${KEY}');if(l==='hi'){document.documentElement.setAttribute('data-lang','hi');document.documentElement.lang='hi';}}catch(e){}`;

const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({ lang: 'en', setLang: () => {} });

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en');

  useEffect(() => {
    if (document.documentElement.getAttribute('data-lang') === 'hi') setLangState('hi');
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    const html = document.documentElement;
    html.setAttribute('data-lang', l);
    html.lang = l;
    try {
      localStorage.setItem(KEY, l);
    } catch {
      /* private mode: choice lasts for this page only */
    }
  }, []);

  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>;
}

export function useLang() {
  const { lang, setLang } = useContext(LangContext);
  /** Pick a string for the current language (for attributes, placeholders…). */
  const t = useCallback((en: string, hi: string) => (lang === 'hi' ? hi : en), [lang]);
  return { lang, setLang, t };
}

/** Dual-rendered text: both spans ship, CSS shows one. Works in server components. */
export function T({ en, hi }: { en: ReactNode; hi: ReactNode }) {
  return (
    <>
      <span className="i18n-en">{en}</span>
      <span className="i18n-hi" lang="hi">
        {hi}
      </span>
    </>
  );
}

export function LanguageToggle({ className = '' }: { className?: string }) {
  const { lang, setLang } = useLang();
  return (
    <button
      type="button"
      onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
      className={className}
      aria-label={lang === 'en' ? 'हिन्दी में पढ़ें' : 'Read in English'}
      title={lang === 'en' ? 'हिन्दी में पढ़ें' : 'Read in English'}
    >
      <span aria-hidden className={lang === 'en' ? 'font-semibold' : 'opacity-50'}>EN</span>
      <span aria-hidden className="opacity-40 mx-1">/</span>
      <span aria-hidden className={lang === 'hi' ? 'font-semibold' : 'opacity-50'} lang="hi">हि</span>
    </button>
  );
}
