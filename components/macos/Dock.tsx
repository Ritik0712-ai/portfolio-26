'use client';

import { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from 'framer-motion';

export interface DockEntry {
  id: string;
  label: string;
  icon: (size?: number) => React.ReactNode;
  running?: boolean;
  bounceKey?: number;
  onClick: () => void;
  separatorBefore?: boolean;
}

const BASE = 50;
const MAX = 78;

function DockItem({ entry, mouseX }: { entry: DockEntry; mouseX: MotionValue<number> }) {
  const ref = useRef<HTMLButtonElement>(null);
  const distance = useTransform(mouseX, (v) => {
    const b = ref.current?.getBoundingClientRect();
    return b ? v - b.x - b.width / 2 : Infinity;
  });
  const sizeRaw = useTransform(distance, [-150, 0, 150], [BASE, MAX, BASE], { clamp: true });
  const size = useSpring(sizeRaw, { mass: 0.1, stiffness: 170, damping: 14 });
  const scale = useTransform(size, (s) => s / BASE);

  return (
    <>
      {entry.separatorBefore && <div className="w-px h-10 self-center mx-1 mac-dock-sep" />}
      <motion.button
        ref={ref}
        onClick={entry.onClick}
        aria-label={entry.label}
        className="group relative flex flex-col items-center justify-end focus:outline-none"
        style={{ width: size, height: BASE }}
      >
        <span className="pointer-events-none absolute -top-12 whitespace-nowrap px-2.5 py-1 rounded-md text-[12px] mac-tooltip opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity">
          {entry.label}
        </span>
        <motion.div
          key={entry.bounceKey}
          style={{ scale, transformOrigin: 'bottom center' }}
          animate={entry.bounceKey ? { y: [0, -22, 0, -10, 0] } : undefined}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          {entry.icon(BASE)}
        </motion.div>
        <span className={`absolute -bottom-2 w-1 h-1 rounded-full mac-dock-dot ${entry.running ? 'opacity-100' : 'opacity-0'}`} />
      </motion.button>
    </>
  );
}

export default function Dock({ entries }: { entries: DockEntry[] }) {
  const mouseX = useMotionValue(Infinity);
  return (
    <div className="fixed bottom-2 inset-x-0 z-[8000] flex justify-center pointer-events-none">
      <nav
        aria-label="Dock"
        onMouseMove={(e) => mouseX.set(e.clientX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        className="pointer-events-auto flex items-end gap-2 px-2.5 pt-2 pb-2.5 rounded-2xl mac-dock"
      >
        {entries.map((e) => (
          <DockItem key={e.id} entry={e} mouseX={mouseX} />
        ))}
      </nav>
    </div>
  );
}
