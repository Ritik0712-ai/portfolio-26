'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Sparkles, Play, Pause, Square, Headphones, Volume2, RotateCcw } from 'lucide-react';
import { T, useLang } from '@/lib/i18n';

/* ---------------------------------------------------------------- text prep */

/** Markdown → plain sentences a speech engine can read naturally. */
export function markdownToSpeech(md: string): string[] {
  const text = md
    .replace(/```[\s\S]*?```/g, ' (code sample skipped) ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^\s{0,3}#{1,6}\s+(.*)$/gm, '$1.')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/^\s*>\s?/gm, '')
    .replace(/\|/g, ' ')
    .replace(/[*_~]{1,3}([^*_~]+)[*_~]{1,3}/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\n{2,}/g, '\n')
    .replace(/[ \t]+/g, ' ');
  // Chrome cuts utterances off after ~15s, so speak in sentence-sized chunks.
  const chunks: string[] = [];
  for (const para of text.split('\n')) {
    const sentences = para.match(/[^.!?।]+[.!?।]+["')\]]*|[^.!?।]+$/g) ?? [];
    let buf = '';
    for (const s of sentences) {
      if ((buf + s).length > 220 && buf) {
        chunks.push(buf.trim());
        buf = '';
      }
      buf += s;
    }
    if (buf.trim()) chunks.push(buf.trim());
  }
  return chunks.filter((c) => /\w|[ऀ-ॿ]/.test(c));
}

function pickVoice(lang: 'en' | 'hi') {
  const voices = window.speechSynthesis.getVoices();
  if (lang === 'hi') return voices.find((v) => v.lang.toLowerCase().startsWith('hi')) ?? null;
  return (
    voices.find((v) => v.lang === 'en-IN') ??
    voices.find((v) => /natural|neural|premium|enhanced/i.test(v.name) && v.lang.startsWith('en')) ??
    voices.find((v) => v.lang.startsWith('en') && v.default) ??
    voices.find((v) => v.lang.startsWith('en')) ??
    null
  );
}

/* ------------------------------------------------------------ speech player */

type State = 'idle' | 'playing' | 'paused' | 'done';

function useSpeech(chunks: string[], lang: 'en' | 'hi') {
  const [state, setState] = useState<State>('idle');
  const [index, setIndex] = useState(0);
  const [rate, setRate] = useState(1);
  const idx = useRef(0);
  const token = useRef(0);
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const speakFrom = useCallback(
    (start: number, r = rate) => {
      if (!supported) return;
      const synth = window.speechSynthesis;
      synth.cancel();
      const my = ++token.current;
      const say = (i: number) => {
        if (my !== token.current) return;
        if (i >= chunks.length) {
          setState('done');
          idx.current = 0;
          setIndex(chunks.length);
          return;
        }
        idx.current = i;
        setIndex(i);
        const u = new SpeechSynthesisUtterance(chunks[i]);
        const v = pickVoice(lang);
        if (v) u.voice = v;
        u.lang = v?.lang ?? (lang === 'hi' ? 'hi-IN' : 'en-IN');
        u.rate = r;
        u.onend = () => say(i + 1);
        u.onerror = (e) => {
          if (e.error !== 'interrupted' && e.error !== 'canceled') say(i + 1);
        };
        synth.speak(u);
      };
      setState('playing');
      say(start);
    },
    [chunks, lang, rate, supported],
  );

  const toggle = () => {
    if (!supported) return;
    const synth = window.speechSynthesis;
    if (state === 'playing') {
      synth.pause();
      setState('paused');
    } else if (state === 'paused') {
      // Resume is unreliable on some engines; restart the current sentence.
      speakFrom(idx.current);
    } else {
      speakFrom(state === 'done' ? 0 : idx.current);
    }
  };

  const stop = () => {
    token.current++;
    if (supported) window.speechSynthesis.cancel();
    idx.current = 0;
    setIndex(0);
    setState('idle');
  };

  const changeRate = (r: number) => {
    setRate(r);
    if (state === 'playing') speakFrom(idx.current, r);
  };

  useEffect(() => () => {
    token.current++;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
  }, []);

  // Voices load asynchronously in Chrome.
  useEffect(() => {
    if (!supported) return;
    window.speechSynthesis.getVoices();
  }, [supported]);

  return { state, index, rate, toggle, stop, changeRate, supported, seek: (i: number) => speakFrom(i) };
}

/* ---------------------------------------------------------------- listen bar */

export function ListenBar({ title, content, compact = false }: { title: string; content: string; compact?: boolean }) {
  const chunks = useMemo(() => [title + '.', ...markdownToSpeech(content)], [title, content]);
  const words = useMemo(() => chunks.join(' ').split(/\s+/).length, [chunks]);
  const speech = useSpeech(chunks, 'en');
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted || !speech.supported) return null;

  const minutes = Math.max(1, Math.round(words / (165 * speech.rate)));
  const pct = Math.min(100, (speech.index / chunks.length) * 100);
  const active = speech.state === 'playing' || speech.state === 'paused';

  return (
    <div className={`not-prose rounded-lg border border-border bg-surface ${compact ? 'p-3' : 'p-4'} mb-6`} role="region" aria-label="Listen to this post">
      <div className="flex items-center gap-3">
        <button
          onClick={speech.toggle}
          className="w-10 h-10 shrink-0 rounded-full bg-text-primary text-bg flex items-center justify-center hover:opacity-90 transition-opacity"
          aria-label={speech.state === 'playing' ? 'Pause' : 'Listen to this post'}
        >
          {speech.state === 'playing' ? <Pause className="w-4 h-4" /> : speech.state === 'done' ? <RotateCcw className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text-primary flex items-center gap-1.5">
            <Headphones className="w-3.5 h-3.5 text-text-muted" />
            {speech.state === 'done' ? <T en="Finished — play again" hi="पूरा हुआ — फिर से सुनें" /> : active ? <T en="Listening" hi="सुन रहे हैं" /> : <T en="Listen to this post" hi="यह पोस्ट सुनें (अंग्रेज़ी में)" />}
          </p>
          <div
            className="mt-1.5 h-1 rounded-full bg-bg-secondary overflow-hidden cursor-pointer"
            onClick={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              speech.seek(Math.floor(((e.clientX - r.left) / r.width) * chunks.length));
            }}
            role="progressbar"
            aria-valuenow={Math.round(pct)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className="h-full bg-accent transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <span className="text-xs text-text-muted tabular-nums hidden sm:block">~{minutes} min</span>
        <select
          value={speech.rate}
          onChange={(e) => speech.changeRate(parseFloat(e.target.value))}
          aria-label="Playback speed"
          className="text-xs bg-bg-secondary border border-border rounded px-1.5 py-1 text-text-secondary"
        >
          {[0.75, 1, 1.25, 1.5, 1.75].map((r) => (
            <option key={r} value={r}>{r}×</option>
          ))}
        </select>
        {active && (
          <button onClick={speech.stop} aria-label="Stop" className="p-1.5 text-text-muted hover:text-text-primary">
            <Square className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      <p className="text-[11px] text-text-faint mt-2">
        <T en="Read aloud by your device's built-in voice — nothing is uploaded." hi="आपके डिवाइस की अपनी आवाज़ में पढ़ा जाता है — कुछ भी अपलोड नहीं होता।" />
      </p>
    </div>
  );
}

/* --------------------------------------------------------------- AI summary */

interface SummaryData {
  enabled?: boolean;
  points?: string[];
  takeaway?: string;
  error?: string;
}

export function AISummary({ slug, compact = false }: { slug: string; compact?: boolean }) {
  const { lang } = useLang();
  const [data, setData] = useState<Record<string, SummaryData>>({});
  const [loading, setLoading] = useState(true);
  const current = data[lang];
  const speech = useSpeech(current?.points ? [...current.points, current.takeaway ?? ''].filter(Boolean) : [], lang);

  useEffect(() => {
    if (data[lang]) return;
    let alive = true;
    setLoading(true);
    fetch(`/api/blogs/summary?slug=${encodeURIComponent(slug)}&lang=${lang}`)
      .then((r) => r.json())
      .then((d: SummaryData) => alive && setData((prev) => ({ ...prev, [lang]: d })))
      .catch(() => alive && setData((prev) => ({ ...prev, [lang]: { error: 'unavailable' } })))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, lang]);

  if (current?.enabled === false || current?.error) return null;

  return (
    <aside className={`not-prose rounded-lg border border-accent/25 bg-accent/[0.06] ${compact ? 'p-4' : 'p-5'} mb-4`} aria-label="AI summary">
      <div className="flex items-center justify-between gap-3 mb-3">
        <p className="text-xs font-mono uppercase tracking-[0.2em] text-accent flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" /> <T en="TL;DR" hi="सार" />
        </p>
        {current?.points && speech.supported && (
          <button onClick={speech.toggle} className="text-xs text-text-muted hover:text-text-primary inline-flex items-center gap-1" aria-label="Read the summary aloud">
            {speech.state === 'playing' ? <Pause className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            <T en="Hear it" hi="सुनें" />
          </button>
        )}
      </div>
      {loading && !current ? (
        <div className="space-y-2" aria-busy="true">
          {[92, 84, 70].map((w) => (
            <div key={w} className="h-3.5 rounded bg-text-faint/15 animate-pulse" style={{ width: `${w}%` }} />
          ))}
        </div>
      ) : (
        current?.points && (
          <>
            <ul className="space-y-1.5 text-[15px] text-text-secondary leading-relaxed list-disc pl-5" lang={lang}>
              {current.points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
            {current.takeaway && (
              <p className="mt-3 text-[15px] text-text-primary font-medium" lang={lang}>
                {current.takeaway}
              </p>
            )}
          </>
        )
      )}
      <p className="text-[11px] text-text-faint mt-3">
        <T en="Summarised by AI from the post below — it can miss nuance." hi="नीचे की पोस्ट से AI द्वारा बनाया गया सार — कुछ बारीकियाँ छूट सकती हैं।" />
      </p>
    </aside>
  );
}
