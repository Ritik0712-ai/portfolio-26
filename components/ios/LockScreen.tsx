'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Lock, Flashlight, Camera } from 'lucide-react';
import StatusBar from './StatusBar';
import { PROFILE } from '@/components/os/data';

export default function LockScreen({ wallpaper, onUnlock }: { wallpaper: string; onUnlock: () => void }) {
  const [now, setNow] = useState<Date | null>(null);
  const y = useMotionValue(0);
  const opacity = useTransform(y, [-220, 0], [0, 1]);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 10_000);
    return () => clearInterval(t);
  }, []);

  return (
    <motion.div
      className={`fixed inset-0 z-[70] mac-wallpaper-${wallpaper} text-white select-none touch-none`}
      style={{ y, opacity }}
      drag="y"
      dragConstraints={{ top: -400, bottom: 0 }}
      dragElastic={{ top: 0.6, bottom: 0 }}
      onDragEnd={(_, info) => (info.offset.y < -100 || info.velocity.y < -500 ? onUnlock() : undefined)}
      exit={{ y: '-100%', transition: { duration: 0.35, ease: [0.32, 0.72, 0, 1] } }}
    >
      <StatusBar tone="light" />
      <div className="flex flex-col items-center pt-[70px]" suppressHydrationWarning>
        <Lock className="w-4 h-4 mb-3 opacity-90" />
        <p className="text-[20px] font-semibold opacity-90">{now?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        <p className="text-[96px] leading-[1] font-bold tracking-tight">
          {now?.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).replace(/\s?[AP]M/, '')}
        </p>
      </div>

      {/* Notification */}
      <button onClick={onUnlock} className="mx-3 mt-8 w-[calc(100%-24px)] ios-widget rounded-[20px] p-3 flex items-start gap-3 text-left">
        <div className="relative w-10 h-10 rounded-[10px] overflow-hidden shrink-0">
          <Image src={PROFILE.photo} alt="" fill sizes="40px" className="object-cover object-top" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex justify-between text-[13px]"><span className="font-semibold">Ritik Agarwal</span><span className="opacity-70">now</span></div>
          <p className="text-[14px] leading-snug">Hi! Swipe up to explore my portfolio — projects, blog, and more.</p>
        </div>
      </button>

      <div className="absolute bottom-0 inset-x-0 pb-[max(12px,env(safe-area-inset-bottom))] flex flex-col items-center">
        <div className="w-full flex justify-between px-12 mb-8">
          <span className="w-[50px] h-[50px] rounded-full ios-widget flex items-center justify-center"><Flashlight className="w-5 h-5" /></span>
          <span className="w-[50px] h-[50px] rounded-full ios-widget flex items-center justify-center"><Camera className="w-5 h-5" /></span>
        </div>
        <button onClick={onUnlock} className="text-[15px] opacity-80 mb-3">Swipe up to open</button>
        <span className="w-[134px] h-[5px] rounded-full bg-white" />
      </div>
    </motion.div>
  );
}
