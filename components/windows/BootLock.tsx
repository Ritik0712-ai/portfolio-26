'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Wifi, Accessibility, Power, ArrowRight } from 'lucide-react';
import { PROFILE } from '@/components/os/data';

/** The five orbiting dots from the Windows boot/sign-in screens. */
export function Spinner({ size = 40 }: { size?: number }) {
  return (
    <span className="relative inline-block" style={{ width: size, height: size }} role="progressbar" aria-label="Loading">
      {[0, 1, 2, 3, 4].map((i) => (
        <span key={i} className="win-orbit absolute inset-0" style={{ animationDelay: `${i * 0.14}s` }}>
          <span className="absolute left-1/2 top-0 -translate-x-1/2 rounded-full bg-current" style={{ width: size / 9, height: size / 9 }} />
        </span>
      ))}
    </span>
  );
}

export function BootScreen({ onDone, label }: { onDone: () => void; label?: string }) {
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const t = setTimeout(onDone, reduce ? 300 : 2600);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <motion.div className="fixed inset-0 z-[10000] bg-black text-white flex flex-col items-center justify-center" exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
      <div className="w-[120px] h-[120px] rounded-[26px] flex items-center justify-center mb-[18vh]" style={{ background: 'linear-gradient(135deg,#3DB0F7,#0F62D6)' }}>
        <span className="text-[56px] leading-none font-semibold" style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}>RA</span>
      </div>
      <Spinner size={42} />
      {label && <p className="mt-6 text-[15px]">{label}</p>}
    </motion.div>
  );
}

export function LockScreen({ wallpaper, onUnlock }: { wallpaper: string; onUnlock: () => void }) {
  const [stage, setStage] = useState<'lock' | 'signin' | 'welcome'>('lock');
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 10_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (stage !== 'lock') return;
    const next = () => setStage('signin');
    window.addEventListener('keydown', next);
    return () => window.removeEventListener('keydown', next);
  }, [stage]);

  const signIn = () => {
    setStage('welcome');
    setTimeout(onUnlock, 1300);
  };

  return (
    <motion.div
      className={`fixed inset-0 z-[9995] win-wallpaper-${wallpaper} overflow-hidden text-white`}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45 }}
    >
      <div className={`absolute inset-0 transition-all duration-500 ${stage === 'lock' ? 'bg-black/10' : 'bg-black/35 backdrop-blur-2xl'}`} />
      <AnimatePresence mode="wait">
        {stage === 'lock' ? (
          <motion.button
            key="lock"
            className="absolute inset-0 flex flex-col items-center pt-[12vh] cursor-default"
            onClick={() => setStage('signin')}
            exit={{ y: '-100%' }}
            transition={{ duration: 0.35, ease: [0.4, 0, 1, 1] }}
            aria-label="Click or press any key to sign in"
          >
            <p className="text-[20px] font-semibold drop-shadow">{now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            <p className="text-[112px] leading-none font-semibold tabular-nums drop-shadow-lg" style={{ fontFamily: '"Segoe UI Variable Display", "Segoe UI", system-ui, sans-serif' }}>
              {now.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: false })}
            </p>
            <span className="absolute bottom-8 text-[13px] opacity-80">Click anywhere or press a key</span>
          </motion.button>
        ) : (
          <motion.div
            key="signin"
            className="absolute inset-0 flex flex-col items-center justify-center"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={PROFILE.photo} alt="" className="w-[190px] h-[190px] rounded-full object-cover mb-5 shadow-2xl" />
            <p className="text-[28px] font-semibold mb-5">{PROFILE.name}</p>
            {stage === 'welcome' ? (
              <div className="flex flex-col items-center gap-4"><Spinner size={30} /><p className="text-[18px]">Welcome</p></div>
            ) : (
              <form
                onSubmit={(e) => { e.preventDefault(); signIn(); }}
                className="flex flex-col items-center gap-3"
              >
                <div className="flex items-center h-9 w-[260px] rounded-md bg-black/30 border border-white/25 border-b-white/80 overflow-hidden">
                  <input autoFocus aria-label="PIN (anything works)" placeholder="PIN (anything works)" type="password" className="flex-1 h-full bg-transparent px-3 text-[14px] outline-none placeholder:text-white/60" />
                  <button aria-label="Sign in" className="w-9 h-full flex items-center justify-center hover:bg-white/10"><ArrowRight className="w-4 h-4" /></button>
                </div>
                <button type="submit" className="text-[13px] opacity-85 hover:underline">Sign in as guest</button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      <div className="absolute bottom-6 right-8 flex items-center gap-5 opacity-90">
        <Wifi className="w-5 h-5" />
        <Accessibility className="w-5 h-5" />
        <Power className="w-5 h-5" />
      </div>
    </motion.div>
  );
}
