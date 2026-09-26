'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { AppIcon } from './icons';
import { APPS, LAUNCHPAD_APPS } from './registry';
import type { AppId } from './types';

export default function Launchpad({ onClose, onApp }: { onClose: () => void; onApp: (id: AppId) => void }) {
  const [q, setQ] = useState('');
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  const apps = LAUNCHPAD_APPS.filter((id) => APPS[id].name.toLowerCase().includes(q.toLowerCase()));
  return (
    <motion.div
      className="fixed inset-0 z-[8500] flex flex-col items-center pt-16 bg-black/25 backdrop-blur-3xl"
      initial={{ opacity: 0, scale: 1.08 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.08 }}
      transition={{ duration: 0.22 }}
      onClick={onClose}
    >
      <div className="flex items-center gap-2 w-64 h-8 px-3 rounded-lg bg-white/15 border border-white/20 text-white mb-14" onClick={(e) => e.stopPropagation()}>
        <Search className="w-4 h-4 opacity-70" />
        <input ref={ref} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" aria-label="Search apps" className="bg-transparent outline-none text-[13px] flex-1 placeholder:text-white/60" />
      </div>
      <div className="grid grid-cols-5 lg:grid-cols-7 gap-x-16 gap-y-10">
        {apps.map((id) => (
          <button key={id} onClick={(e) => { e.stopPropagation(); onApp(id); onClose(); }} className="flex flex-col items-center gap-2 group">
            <span className="group-active:brightness-75 transition"><AppIcon id={APPS[id].icon} size={84} /></span>
            <span className="text-white text-[13px] [text-shadow:0_1px_3px_rgba(0,0,0,0.6)]">{APPS[id].name}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
