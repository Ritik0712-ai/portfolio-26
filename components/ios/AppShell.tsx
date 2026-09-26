'use client';

import { motion } from 'framer-motion';

// Full-screen app container. Zooms open from the tapped icon and closes via
// the home indicator (tap or swipe up), like iOS.
export default function AppShell({ origin, onClose, dark, children }: {
  origin: { x: number; y: number };
  onClose: () => void;
  dark?: boolean;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      className="fixed inset-0 z-[50] overflow-hidden ios-screen"
      style={{ transformOrigin: `${origin.x}px ${origin.y}px` }}
      initial={{ scale: 0.12, opacity: 0, borderRadius: 60 }}
      animate={{ scale: 1, opacity: 1, borderRadius: 0 }}
      exit={{ scale: 0.12, opacity: 0, borderRadius: 60 }}
      transition={{ type: 'spring', stiffness: 300, damping: 32, mass: 0.9 }}
    >
      <div className="absolute inset-0">{children}</div>
      <motion.button
        aria-label="Go home"
        onClick={onClose}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0.5, bottom: 0 }}
        onDragEnd={(_, info) => info.offset.y < -30 && onClose()}
        className="absolute bottom-0 inset-x-0 z-[70] h-[34px] flex items-end justify-center"
        style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}
      >
        <span className={`w-[134px] h-[5px] rounded-full ${dark ? 'bg-white' : 'bg-black/80 dark-home-indicator'}`} />
      </motion.button>
    </motion.div>
  );
}
