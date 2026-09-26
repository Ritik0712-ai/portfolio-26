'use client';

import { useLiveCursors, useLiveVisitors } from '@/lib/presence';

/** "3 here now" pill. Hidden until the live connection is up. */
export function LiveCount({ edition, className = '', label = 'here now', showAlone = true }: { edition: string; className?: string; label?: string; showAlone?: boolean }) {
  const { total } = useLiveVisitors(edition);
  if (!total || (!showAlone && total < 2)) return null;
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`} title={`${total} ${total === 1 ? 'person is' : 'people are'} exploring RitikOS right now`}>
      <span className="relative flex w-2 h-2">
        <span className="absolute inline-flex h-full w-full rounded-full bg-[#30D158] opacity-60 animate-ping" />
        <span className="relative inline-flex w-2 h-2 rounded-full bg-[#30D158]" />
      </span>
      <span className="tabular-nums">{total}</span> {label}
    </span>
  );
}

/** Other visitors' cursors, drawn over a desktop edition. */
export function LiveCursors({ edition }: { edition: string }) {
  const cursors = useLiveCursors(edition);
  return (
    <div aria-hidden className="fixed inset-0 pointer-events-none z-[9400] overflow-hidden">
      {cursors.map((c) => (
        <div
          key={c.id}
          className="absolute top-0 left-0 transition-transform duration-100 ease-linear"
          style={{ transform: `translate(${c.x * 100}vw, ${c.y * 100}vh)` }}
        >
          <svg width="18" height="20" viewBox="0 0 18 20" className="drop-shadow">
            <path d="M1 1l6.5 17 2.4-7.1L17 8.4z" fill={c.color} stroke="#fff" strokeWidth="1.3" strokeLinejoin="round" />
          </svg>
          <span className="absolute left-4 top-4 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium text-white shadow" style={{ background: c.color }}>
            {c.name}
          </span>
        </div>
      ))}
    </div>
  );
}
