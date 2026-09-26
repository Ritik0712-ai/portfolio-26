'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function BootScreen({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const total = reduce ? 300 : 2200;
    const start = performance.now();
    let frame = 0;
    const tick = (t: number) => {
      // Ease-in-out with a small stall in the middle, like a real boot.
      const x = Math.min(1, (t - start) / total);
      setProgress(x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
      if (x < 1) frame = requestAnimationFrame(tick);
      else setTimeout(onDone, 250);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [onDone]);

  return (
    <motion.div
      className="fixed inset-0 z-[10000] bg-black flex flex-col items-center justify-center"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <p className="text-white text-[88px] leading-none mb-14 select-none" style={{ fontFamily: 'var(--font-cormorant), Georgia, serif', fontWeight: 600 }}>
        RA
      </p>
      <div className="w-52 h-[5px] rounded-full bg-white/20 overflow-hidden" role="progressbar" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100} aria-label="Starting up">
        <div className="h-full bg-white rounded-full" style={{ width: `${progress * 100}%` }} />
      </div>
    </motion.div>
  );
}
