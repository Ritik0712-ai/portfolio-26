'use client';

import { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';
import { sendContact, PROFILE } from '@/components/os/data';

export default function Mail() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');

  const send = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError('Name, email and a message are required.');
      setState('error');
      return;
    }
    setState('sending');
    try {
      await sendContact({
        name: form.name.trim(),
        email: form.email.trim(),
        message: form.subject.trim() ? `Subject: ${form.subject.trim()}\n\n${form.message.trim()}` : form.message.trim(),
      });
      setState('sent');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not send.');
      setState('error');
    }
  };

  if (state === 'sent') {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center mac-text px-8">
        <CheckCircle2 className="w-12 h-12 text-[#30D158] mb-3" />
        <p className="text-[17px] font-semibold">Message sent</p>
        <p className="mac-text-faint text-[13px] mt-1">Thanks, {form.name.split(' ')[0]}! Ritik usually replies within a day or two.</p>
        <button onClick={() => { setForm({ name: '', email: '', subject: '', message: '' }); setState('idle'); }} className="mac-btn mt-5">New message</button>
      </div>
    );
  }

  const row = 'flex items-center gap-3 px-4 h-10 border-b mac-divider';
  const input = 'flex-1 bg-transparent outline-none text-[13px] placeholder:mac-text-faint';
  return (
    <div className="flex flex-col h-full mac-text text-[13px]">
      <div className="flex items-center justify-between h-11 px-4 border-b mac-divider mac-toolbar shrink-0">
        <p className="font-semibold">New Message</p>
        <button onClick={send} disabled={state === 'sending'} className="mac-btn-primary inline-flex items-center gap-1.5 disabled:opacity-60">
          <Send className="w-3.5 h-3.5" /> {state === 'sending' ? 'Sending…' : 'Send'}
        </button>
      </div>
      <div className={row}><span className="w-16 mac-text-faint">To:</span><span className="px-2 py-0.5 rounded-md bg-[#0A84FF]/15 text-[#0A84FF]">{PROFILE.name}</span></div>
      <div className={row}><span className="w-16 mac-text-faint">From:</span><input aria-label="Your name" className={input} placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
      <div className={row}><span className="w-16 mac-text-faint">Reply-to:</span><input aria-label="Your email" type="email" className={input} placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
      <div className={row}><span className="w-16 mac-text-faint">Subject:</span><input aria-label="Subject" className={input} placeholder="Internship, project, or just hello" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></div>
      <textarea aria-label="Message" className="flex-1 w-full p-4 bg-transparent outline-none resize-none text-[14px] leading-relaxed" placeholder="Write your message…" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
      {state === 'error' && <p className="px-4 pb-3 text-[12px] text-[#FF453A]">{error}</p>}
    </div>
  );
}
