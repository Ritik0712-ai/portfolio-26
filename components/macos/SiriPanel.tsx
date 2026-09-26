'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, X } from 'lucide-react';
import { askAssistant } from '@/components/os/data';

// "Ask Ritik" — a Siri-style floating assistant powered by /api/ask.
export default function SiriPanel({ onClose, initialQuestion }: { onClose: () => void; initialQuestion?: string }) {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const endRef = useRef<HTMLDivElement>(null);
  const asked = useRef(false);

  const send = async (text: string) => {
    const q = text.trim();
    if (!q || busy) return;
    const next = [...messages, { role: 'user' as const, content: q }];
    setMessages(next);
    setInput('');
    setBusy(true);
    setError('');
    try {
      const a = await askAssistant(next);
      setMessages([...next, { role: 'assistant', content: a.replace(/\*\*(.+?)\*\*/g, '$1') }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (initialQuestion && !asked.current) {
      asked.current = true;
      send(initialQuestion);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuestion]);
  useEffect(() => endRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' }), [messages, busy]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
      className="fixed top-9 right-3 z-[8900] w-[380px] max-h-[70vh] flex flex-col mac-menu overflow-hidden"
      role="dialog"
      aria-label="Ask Ritik"
    >
      <div className="flex items-center gap-3 px-4 pt-4 pb-2">
        <motion.div
          className="w-9 h-9 rounded-full"
          style={{ background: 'conic-gradient(from 0deg, #ff4fd8, #7a5cff, #2ec5ff, #34e0a1, #ffb84d, #ff4fd8)' }}
          animate={{ rotate: busy ? 360 : 0, scale: busy ? [1, 1.08, 1] : 1 }}
          transition={{ rotate: { repeat: busy ? Infinity : 0, duration: 2, ease: 'linear' }, scale: { repeat: busy ? Infinity : 0, duration: 1 } }}
        />
        <div>
          <p className="text-[14px] font-semibold mac-text">Ask Ritik</p>
          <p className="text-[11px] mac-text-faint">Answers from this portfolio</p>
        </div>
        <button aria-label="Close" onClick={onClose} className="ml-auto p-1.5 rounded-full mac-hover mac-text"><X className="w-4 h-4" /></button>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2 text-[13px]">
        {messages.length === 0 && (
          <div className="flex flex-wrap gap-1.5">
            {['What has Ritik built?', 'Is he open to internships?', 'Best backend project?'].map((s) => (
              <button key={s} onClick={() => send(s)} className="px-2.5 py-1 rounded-full mac-chip mac-text text-[12px]">{s}</button>
            ))}
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex'}>
            <p className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 ${m.role === 'user' ? 'bg-[#0A84FF] text-white' : 'mac-chip mac-text'}`}>{m.content}</p>
          </div>
        ))}
        {busy && <p className="mac-text-faint text-[12px]">Thinking…</p>}
        {error && <p className="text-[#FF453A] text-[12px]">{error}</p>}
        <div ref={endRef} />
      </div>
      <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex items-center gap-2 p-3 border-t mac-divider">
        <input autoFocus value={input} onChange={(e) => setInput(e.target.value)} maxLength={600} placeholder="Ask about Ritik…" aria-label="Question" className="flex-1 h-8 px-3 rounded-full mac-chip mac-text outline-none text-[13px]" />
        <button type="submit" disabled={!input.trim() || busy} aria-label="Send" className="w-8 h-8 rounded-full bg-[#0A84FF] text-white flex items-center justify-center disabled:opacity-40"><ArrowUp className="w-4 h-4" /></button>
      </form>
    </motion.div>
  );
}
