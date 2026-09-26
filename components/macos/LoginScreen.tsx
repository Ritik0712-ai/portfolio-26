'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function LoginScreen({ wallpaper, onUnlock }: { wallpaper: string; onUnlock: () => void }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 10_000);
    const onKey = (e: KeyboardEvent) => (e.key === 'Enter' || e.key === ' ') && onUnlock();
    window.addEventListener('keydown', onKey);
    return () => {
      clearInterval(t);
      window.removeEventListener('keydown', onKey);
    };
  }, [onUnlock]);

  return (
    <motion.div
      className={`fixed inset-0 z-[9500] mac-wallpaper-${wallpaper} flex flex-col items-center text-white select-none`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.45 }}
    >
      <div className="absolute inset-0 backdrop-blur-2xl bg-black/20" />
      <div className="relative mt-[8vh] text-center" suppressHydrationWarning>
        <p className="text-xl font-medium opacity-90">
          {now?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
        <p className="text-[96px] font-semibold leading-none tracking-tight">
          {now?.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).replace(/\s?[AP]M/, '')}
        </p>
      </div>

      <div className="relative mt-auto mb-[12vh] flex flex-col items-center">
        <div className="relative w-24 h-24 rounded-full overflow-hidden ring-2 ring-white/40 shadow-2xl mb-3">
          <Image src="/IMG-20260904-WA0065.jpg" alt="Ritik Agarwal" fill sizes="96px" className="object-cover object-top" priority />
        </div>
        <p className="text-lg font-semibold mb-3">Ritik Agarwal</p>
        <button
          onClick={onUnlock}
          autoFocus
          className="group flex items-center gap-2 pl-4 pr-1.5 py-1.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-[13px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
        >
          Click to enter
          <span className="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </button>
        <p className="text-[11px] opacity-70 mt-3">or press Enter</p>
      </div>
    </motion.div>
  );
}
