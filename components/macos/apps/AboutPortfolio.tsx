'use client';

// The "About This Mac" equivalent — specs for the portfolio itself.
export default function AboutPortfolio({ onClassic }: { onClassic: () => void }) {
  const rows: [string, string][] = [
    ['Owner', 'Ritik Agarwal'],
    ['Role', 'Full-Stack Developer · B.Tech CSE, VIT Bhopal'],
    ['Framework', 'Next.js 15 · React 19 · TypeScript'],
    ['Data', 'Supabase (Postgres) — same content as the classic site'],
    ['Hosting', 'Vercel'],
  ];
  return (
    <div className="h-full flex flex-col items-center justify-center text-center px-8 py-6 mac-text text-[13px]">
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-b from-[#3A3530] to-[#1A1714] flex items-center justify-center shadow-lg mb-4">
        <span className="text-[34px] font-semibold text-[#F0EBE3]" style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}>RA</span>
      </div>
      <h1 className="text-2xl font-semibold">RitikOS</h1>
      <p className="mac-text-faint mb-5">Version 1.0 · Magic Edition</p>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-left mb-6">
        {rows.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="text-right font-medium">{k}</dt>
            <dd className="mac-text-muted">{v}</dd>
          </div>
        ))}
      </dl>
      <button onClick={onClassic} className="mac-btn">Open the classic portfolio</button>
    </div>
  );
}
