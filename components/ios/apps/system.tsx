'use client';

import StatsRow from '@/components/os/StatsRow';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp, Check, CheckCircle2, ChevronRight, Github, Linkedin, Code2, Mail as MailIcon, Globe, MessageSquare, X } from 'lucide-react';
import IOSPage, { ListSection } from '../IOSPage';
import { askAssistant, sendContact, PROFILE } from '@/components/os/data';
import { usePhotoLibrary } from '@/components/macos/apps/Photos';
import GitHubPanel from '@/components/os/GitHubPanel';
import { WALLPAPERS } from '@/components/macos/settings';

export function MailApp({ onDone }: { onDone: () => void }) {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');
  const send = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) { setError('Name, email and a message are required.'); setState('error'); return; }
    setState('sending');
    try {
      await sendContact({ name: form.name.trim(), email: form.email.trim(), message: form.subject.trim() ? `Subject: ${form.subject.trim()}\n\n${form.message.trim()}` : form.message.trim() });
      setState('sent');
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not send.'); setState('error'); }
  };
  if (state === 'sent') {
    return (
      <div className="absolute inset-0 ios-screen flex flex-col items-center justify-center text-center px-10">
        <CheckCircle2 className="w-16 h-16 text-[#34C759] mb-4" />
        <p className="text-[22px] font-bold">Message sent</p>
        <p className="ios-secondary mt-1">Ritik usually replies within a day or two.</p>
        <button onClick={onDone} className="mt-8 ios-blue text-[17px]">Done</button>
      </div>
    );
  }
  const field = 'ios-row';
  return (
    <div className="absolute inset-0 ios-screen flex flex-col">
      <header className="pt-[54px] ios-bar border-b" style={{ borderColor: 'var(--ios-separator)' }}>
        <div className="h-11 flex items-center justify-between px-4">
          <button onClick={onDone} className="ios-blue text-[17px]">Cancel</button>
          <p className="font-semibold text-[17px]">New Message</p>
          <button onClick={send} disabled={state === 'sending'} aria-label="Send" className="w-8 h-8 rounded-full bg-[var(--ios-blue)] text-white flex items-center justify-center disabled:opacity-50"><ArrowUp className="w-5 h-5" /></button>
        </div>
      </header>
      <div className="ios-cell">
        <div className={field}><span className="ios-secondary w-16">To:</span><span className="ios-blue">{PROFILE.name}</span></div>
        <label className={field}><span className="ios-secondary w-16">From:</span><input className="flex-1 bg-transparent outline-none" placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
        <label className={field}><span className="ios-secondary w-16">Email:</span><input type="email" inputMode="email" className="flex-1 bg-transparent outline-none" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
        <label className={field}><span className="ios-secondary w-16">Subject:</span><input className="flex-1 bg-transparent outline-none" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></label>
      </div>
      <textarea className="flex-1 ios-cell p-4 text-[17px] outline-none resize-none" placeholder="Write your message…" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
      {state === 'error' && <p className="px-4 py-2 text-[15px] text-[#FF3B30] ios-cell">{error}</p>}
      <div style={{ height: 'calc(34px + env(safe-area-inset-bottom))' }} className="ios-cell" />
    </div>
  );
}

export function PhotosApp() {
  const photos = usePhotoLibrary();
  const [open, setOpen] = useState<number | null>(null);
  return (
    <>
      <IOSPage title="Library" flush>
        <div className="grid grid-cols-3 gap-[2px]">
          {photos.map((p, i) => (
            <button key={p.src + i} onClick={() => setOpen(i)} className="relative aspect-square bg-black/10">
              <Image src={p.src} alt={p.album} fill sizes="130px" className="object-cover" />
            </button>
          ))}
        </div>
        <p className="text-center text-[13px] ios-secondary py-4">{photos.length} Photos</p>
      </IOSPage>
      <AnimatePresence>
        {open !== null && photos[open] && (
          <motion.div key="viewer" className="absolute inset-0 z-[40] bg-black" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            drag="x" dragConstraints={{ left: 0, right: 0 }} onDragEnd={(_, info) => {
              if (info.offset.x < -60) setOpen((open + 1) % photos.length);
              if (info.offset.x > 60) setOpen((open - 1 + photos.length) % photos.length);
            }}>
            <Image src={photos[open].src} alt={photos[open].album} fill sizes="100vw" className="object-contain" />
            <button onClick={() => setOpen(null)} className="absolute top-[58px] left-4 w-9 h-9 rounded-full bg-white/20 backdrop-blur text-white flex items-center justify-center" aria-label="Close"><X className="w-5 h-5" /></button>
            <p className="absolute bottom-12 inset-x-0 text-center text-white/80 text-[13px]">{photos[open].album} · swipe for more</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function GitHubApp() {
  return (
    <IOSPage title="GitHub" flush>
      <GitHubPanel compact />
    </IOSPage>
  );
}

export function ContactsApp({ onMessage }: { onMessage: () => void }) {
  const rows = [
    { label: 'email', value: PROFILE.email, href: `mailto:${PROFILE.email}`, icon: MailIcon },
    { label: 'GitHub', value: 'Ritik0712-ai', href: PROFILE.github, icon: Github },
    { label: 'LinkedIn', value: 'ritik-agarwal', href: PROFILE.linkedin, icon: Linkedin },
    { label: 'LeetCode', value: 'Ritik812800', href: PROFILE.leetcode, icon: Code2 },
    { label: 'homepage', value: 'ritikagarwal.me', href: PROFILE.site, icon: Globe },
  ];
  return (
    <IOSPage title="" largeTitle={false}>
      <div className="flex flex-col items-center pt-2 pb-6">
        <div className="relative w-28 h-28 rounded-full overflow-hidden shadow-lg mb-3">
          <Image src={PROFILE.photo} alt={PROFILE.name} fill sizes="112px" className="object-cover object-top" />
        </div>
        <p className="text-[28px] font-bold">{PROFILE.name}</p>
        <p className="ios-secondary">{PROFILE.role}</p>
        <StatsRow className="justify-center text-center mt-4" valueClass="text-[26px]" labelClass="ios-secondary" />
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <button onClick={onMessage} className="ios-list py-3 flex flex-col items-center gap-1 ios-blue"><MessageSquare className="w-5 h-5" /><span className="text-[12px]">message</span></button>
        <a href={`mailto:${PROFILE.email}`} className="ios-list py-3 flex flex-col items-center gap-1 ios-blue"><MailIcon className="w-5 h-5" /><span className="text-[12px]">mail</span></a>
      </div>
      <ListSection>
        {rows.map((r) => (
          <a key={r.label} href={r.href} target={r.href.startsWith('mailto') ? undefined : '_blank'} rel="noopener noreferrer" className="ios-row flex-col !items-start !gap-0">
            <span className="text-[13px]">{r.label}</span>
            <span className="ios-blue">{r.value}</span>
          </a>
        ))}
      </ListSection>
      <ListSection><div className="ios-row"><span className="text-[13px] ios-secondary">{PROFILE.school} · Open to internships &amp; projects</span></div></ListSection>
    </IOSPage>
  );
}

export function SettingsApp({ theme, setTheme, wallpaper, setWallpaper, onClassic }: {
  theme: 'auto' | 'light' | 'dark';
  setTheme: (t: 'auto' | 'light' | 'dark') => void;
  wallpaper: string;
  setWallpaper: (w: string) => void;
  onClassic: () => void;
}) {
  const [pane, setPane] = useState<null | 'wallpaper' | 'about'>(null);
  return (
    <>
      <IOSPage title="Settings">
        <ListSection>
          <div className="ios-row" style={{ ['--ios-inset' as string]: '80px' }}>
            <div className="relative w-[52px] h-[52px] rounded-full overflow-hidden"><Image src={PROFILE.photo} alt="" fill sizes="52px" className="object-cover object-top" /></div>
            <div><p className="text-[20px] font-semibold leading-tight">{PROFILE.name}</p><p className="text-[13px] ios-secondary">RitikOS · {PROFILE.role}</p></div>
          </div>
        </ListSection>
        <ListSection header="Appearance">
          {(['auto', 'light', 'dark'] as const).map((t) => (
            <button key={t} className="ios-row" onClick={() => setTheme(t)}>
              <span className="flex-1 capitalize">{t === 'auto' ? 'Automatic' : t}</span>
              {theme === t && <Check className="w-5 h-5 ios-blue" />}
            </button>
          ))}
        </ListSection>
        <ListSection>
          <button className="ios-row" onClick={() => setPane('wallpaper')}><span className="flex-1">Wallpaper</span><ChevronRight className="w-4 h-4 ios-secondary" /></button>
          <button className="ios-row" onClick={() => setPane('about')}><span className="flex-1">About</span><ChevronRight className="w-4 h-4 ios-secondary" /></button>
        </ListSection>
        <ListSection header="RitikOS editions" footer="Same portfolio, different skins. The classic portfolio is the standard, scrolling version of this site.">
          <a className="ios-row ios-blue" href="/magic/android">Switch to Android Edition</a>
          <a className="ios-row ios-blue" href="/magic/windows">Switch to Windows Edition (laptop)</a>
          <a className="ios-row ios-blue" href="/magic">All Editions</a>
          <button className="ios-row ios-blue" onClick={onClassic}>Open Classic Portfolio</button>
        </ListSection>
      </IOSPage>
      <AnimatePresence>
        {pane === 'wallpaper' && (
          <IOSPage key="wp" title="Wallpaper" back="Settings" onBack={() => setPane(null)}>
            <div className="grid grid-cols-3 gap-3 mt-2">
              {WALLPAPERS.map((w) => (
                <button key={w.id} onClick={() => setWallpaper(w.id)} className="flex flex-col items-center gap-1.5">
                  <span className={`w-full aspect-[9/19] rounded-2xl mac-wallpaper-${w.id} ring-2 ${wallpaper === w.id ? 'ring-[var(--ios-blue)]' : 'ring-transparent'}`} />
                  <span className="text-[13px]">{w.label}</span>
                </button>
              ))}
            </div>
          </IOSPage>
        )}
        {pane === 'about' && (
          <IOSPage key="about" title="About" back="Settings" onBack={() => setPane(null)}>
            <ListSection>
              {[
                ['Name', 'RitikOS'],
                ['Version', '1.0 (Magic)'],
                ['Owner', PROFILE.name],
                ['Framework', 'Next.js 15 · React 19'],
                ['Data', 'Supabase · live'],
              ].map(([k, v]) => (
                <div key={k} className="ios-row"><span className="flex-1">{k}</span><span className="ios-secondary">{v}</span></div>
              ))}
            </ListSection>
          </IOSPage>
        )}
      </AnimatePresence>
    </>
  );
}

export function AskApp() {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => endRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' }), [messages, busy]);
  const send = async (text: string) => {
    const q = text.trim();
    if (!q || busy) return;
    const next = [...messages, { role: 'user' as const, content: q }];
    setMessages(next); setInput(''); setBusy(true); setError('');
    try {
      const a = await askAssistant(next);
      setMessages([...next, { role: 'assistant', content: a.replace(/\*\*(.+?)\*\*/g, '$1') }]);
    } catch (e) { setError(e instanceof Error ? e.message : 'Something went wrong.'); } finally { setBusy(false); }
  };
  return (
    <div className="absolute inset-0 ios-screen flex flex-col">
      <header className="pt-[54px] pb-2 ios-bar border-b flex flex-col items-center" style={{ borderColor: 'var(--ios-separator)' }}>
        <div className="w-11 h-11 rounded-full mb-1" style={{ background: 'conic-gradient(from 0deg, #ff4fd8, #7a5cff, #2ec5ff, #34e0a1, #ffb84d, #ff4fd8)' }} />
        <p className="text-[12px]">Ask Ritik <span className="ios-secondary">· AI</span></p>
      </header>
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1.5">
        {messages.length === 0 && (
          <div className="pt-6 text-center">
            <p className="ios-secondary text-[15px] mb-4">Ask anything about Ritik&apos;s work.</p>
            <div className="flex flex-col items-center gap-2">
              {['What has Ritik built?', 'Is he open to internships?', 'Which project shows his backend skills?'].map((s) => (
                <button key={s} onClick={() => send(s)} className="px-4 py-2 rounded-full ios-cell ios-blue text-[15px]">{s}</button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex'}>
            <p className={`max-w-[78%] whitespace-pre-wrap rounded-[18px] px-3.5 py-2 text-[17px] leading-snug ${m.role === 'user' ? 'bg-[var(--ios-blue)] text-white' : 'ios-cell'}`}>{m.content}</p>
          </div>
        ))}
        {busy && <div className="flex"><p className="ios-cell rounded-[18px] px-4 py-2.5 ios-secondary">•••</p></div>}
        {error && <p className="text-[#FF3B30] text-[13px] text-center">{error}</p>}
        <div ref={endRef} />
      </div>
      <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex items-center gap-2 px-3 pt-2 ios-bar" style={{ paddingBottom: 'calc(40px + env(safe-area-inset-bottom))' }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} maxLength={600} placeholder="Ask a question…" aria-label="Question"
          className="flex-1 h-9 px-4 rounded-full border bg-transparent outline-none text-[17px]" style={{ borderColor: 'var(--ios-separator)' }} />
        <button type="submit" disabled={!input.trim() || busy} aria-label="Send" className="w-8 h-8 rounded-full bg-[var(--ios-blue)] text-white flex items-center justify-center disabled:opacity-40"><ArrowUp className="w-5 h-5" /></button>
      </form>
    </div>
  );
}
