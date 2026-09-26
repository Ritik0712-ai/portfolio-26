'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';

// A navigation page following the HIG: inline back button, large title that
// collapses into the bar on scroll, translucent bar material.
export default function IOSPage({
  title, back, onBack, trailing, children, largeTitle = true, flush = false,
}: {
  title: string;
  back?: string;
  onBack?: () => void;
  trailing?: React.ReactNode;
  children: React.ReactNode;
  largeTitle?: boolean;
  flush?: boolean;
}) {
  const [scrolled, setScrolled] = useState(!largeTitle);
  const ref = useRef<HTMLDivElement>(null);

  return (
    <motion.div
      className="absolute inset-0 ios-screen flex flex-col"
      initial={onBack ? { x: '100%' } : false}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 420, damping: 42 }}
    >
      <header className={`relative z-10 shrink-0 pt-[54px] ${scrolled ? 'ios-bar border-b' : ''}`} style={{ borderColor: 'var(--ios-separator)', borderBottomWidth: scrolled ? 0.5 : 0 }}>
        <div className="h-11 flex items-center px-2">
          {onBack ? (
            <button onClick={onBack} className="flex items-center ios-blue text-[17px] -ml-1 pr-2 h-11">
              <ChevronLeft className="w-7 h-7" strokeWidth={2.2} /> {back}
            </button>
          ) : <span />}
          <p className={`absolute left-1/2 -translate-x-1/2 text-[17px] font-semibold transition-opacity max-w-[55%] truncate ${scrolled ? 'opacity-100' : 'opacity-0'}`}>{title}</p>
          <div className="ml-auto pr-2 flex items-center gap-3 ios-blue">{trailing}</div>
        </div>
      </header>
      <div
        ref={ref}
        className="flex-1 overflow-y-auto overscroll-contain"
        onScroll={(e) => largeTitle && setScrolled((e.target as HTMLDivElement).scrollTop > 30)}
        style={{ paddingBottom: 'calc(34px + env(safe-area-inset-bottom))' }}
      >
        {largeTitle && <h1 className="ios-large-title px-4 pb-2">{title}</h1>}
        <div className={flush ? '' : 'px-4'}>{children}</div>
      </div>
    </motion.div>
  );
}

export function ListSection({ header, footer, children }: { header?: string; footer?: string; children: React.ReactNode }) {
  return (
    <section className="mt-6 first:mt-3">
      {header && <p className="ios-section-header">{header}</p>}
      <div className="ios-list">{children}</div>
      {footer && <p className="text-[13px] ios-secondary px-4 pt-1.5">{footer}</p>}
    </section>
  );
}
