'use client';

import { useStats } from './data';

// The "4+ Projects Shipped" numbers from the classic About section, managed in
// the admin panel. Renders nothing until there is at least one stat, and
// updates live when a stat is added or edited.
export default function StatsRow({ className = '', valueClass = '', labelClass = 'mac-text-faint' }: { className?: string; valueClass?: string; labelClass?: string }) {
  const { data } = useStats();
  if (!data?.length) return null;
  return (
    <div className={`flex flex-wrap gap-x-8 gap-y-3 ${className}`}>
      {data.map((s) => (
        <div key={s.id} className="min-w-0">
          <p className={`text-[24px] font-semibold leading-none tabular-nums ${valueClass}`}>
            {s.value}
            {s.suffix}
          </p>
          <p className={`text-[12px] mt-1 ${labelClass}`}>{s.label}</p>
        </div>
      ))}
    </div>
  );
}
