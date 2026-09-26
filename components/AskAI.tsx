'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, X, ArrowUp } from 'lucide-react';
import { OPEN_ASK_EVENT } from './CommandPalette';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTIONS = [
  'What has Ritik built?',
  'Which project best shows his backend skills?',
  'Is he open to internships?',
  'What tech does he work with?',
];

// Light formatting for answers: strips stray markdown emphasis, turns
// [text](url) and bare /projects/x style paths into links, and "* " bullets
// into "• ".
function renderAnswer(raw: string) {
  const text = raw
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/^\s*[*-]\s+/gm, '• ')
    .replace(/\[([^\]]+)\]\((?:https?:\/\/(?:www\.)?ritikagarwal\.me)?(\/[^)\s]*)\)/g, '$2');
  const parts = text.split(/(\/(?:projects|blog)\/[a-z0-9-]+|\/(?:projects|blog|now|uses|resume|contact|feedback)\b)/g);
  return parts.map((part, i) =>
    /^\/[a-z]/.test(part) ? (
      <Link key={i} href={part} className="underline decoration-border underline-offset-2 hover:text-accent">
        {part}
      </Link>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

export default function AskAI() {
  const pathname = usePathname();
  const [enabled, setEnabled] = useState(false);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetch('/api/ask')
      .then((r) => r.json())
      .then((d) => setEnabled(!!d.enabled))
      .catch(() => {});
    const onOpen = () => setOpen(true);
    window.addEventListener(OPEN_ASK_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_ASK_EVENT, onOpen);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  if (!enabled || (pathname?.startsWith('/admin') || pathname?.startsWith('/magic'))) return null;

  const send = async (text: string) => {
    const q = text.trim();
    if (!q || loading) return;
    const next = [...messages, { role: 'user' as const, content: q.slice(0, 600) }];
    setMessages(next);
    setInput('');
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next.slice(-10) }),
      });
      const data = await res.json();
      if (!res.ok || !data.answer) throw new Error(data.error || 'Something went wrong.');
      setMessages([...next, { role: 'assistant', content: data.answer }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 pl-3.5 pr-4 py-2.5 rounded-full bg-text-primary text-bg font-body text-sm font-medium shadow-lg hover:opacity-90 transition-opacity"
          aria-label="Ask AI about Ritik"
        >
          <Sparkles className="w-4 h-4" />
          Ask about me
        </button>
      )}

      {open && (
        <div
          role="dialog"
          aria-label="Ask AI about Ritik"
          className="fixed z-50 inset-x-3 bottom-3 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-[380px] h-[min(560px,80vh)] flex flex-col bg-surface border border-border rounded-lg shadow-2xl overflow-hidden palette-in"
        >
          <div className="flex items-center gap-3 px-4 h-14 border-b border-border shrink-0">
            <div className="w-7 h-7 rounded-full bg-accent/15 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-text-primary font-body">Ask about Ritik</p>
              <p className="text-[11px] text-text-faint font-body">AI answers from this site&apos;s content</p>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close" className="ml-auto p-1.5 text-text-muted hover:text-text-primary transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3" aria-live="polite">
            {messages.length === 0 && (
              <div>
                <p className="text-sm text-text-secondary font-body mb-4">
                  Hi! I can answer questions about Ritik&apos;s projects, skills and experience.
                </p>
                <div className="flex flex-col gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="text-left text-sm font-body text-text-secondary border border-border rounded px-3 py-2 hover:border-rule hover:text-text-primary transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex'}>
                <div
                  className={`max-w-[85%] rounded-lg px-3.5 py-2.5 text-sm font-body leading-relaxed whitespace-pre-wrap ${
                    m.role === 'user' ? 'bg-text-primary text-bg' : 'bg-bg-secondary text-text-primary'
                  }`}
                >
                  {m.role === 'assistant' ? renderAnswer(m.content) : m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex">
                <div className="bg-bg-secondary rounded-lg px-3.5 py-3 flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="w-1.5 h-1.5 rounded-full bg-text-faint animate-bounce" style={{ animationDelay: `${i * 120}ms` }} />
                  ))}
                </div>
              </div>
            )}
            {error && <p className="text-xs text-error font-body">{error}</p>}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-end gap-2 p-3 border-t border-border shrink-0"
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              rows={1}
              maxLength={600}
              placeholder="Ask a question…"
              className="flex-1 resize-none max-h-28 px-3 py-2 text-sm font-body bg-bg border border-border rounded text-text-primary placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              aria-label="Send"
              className="p-2.5 rounded bg-text-primary text-bg disabled:opacity-40 transition-opacity"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
