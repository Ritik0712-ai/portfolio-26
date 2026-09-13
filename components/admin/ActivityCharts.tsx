'use client';

type Slice = { label: string; count: number };

// Palette is deliberately small and reused; these charts are for spotting
// shape, not for encoding a dozen distinct categories.
const COLORS = ['#8a9a5b', '#c9a227', '#6b8fa8', '#a86b6b', '#7d6ba8', '#5b8a7a'];

export function ActivityBars({ data }: { data: { date: string; count: number }[] }) {
  const max = Math.max(1, ...data.map(d => d.count));
  const empty = data.every(d => d.count === 0);

  return (
    <div>
      <div className="flex items-end gap-1 h-40">
        {data.map((d) => {
          const pct = (d.count / max) * 100;
          return (
            <div key={d.date} className="flex-1 flex flex-col justify-end items-center group relative">
              <div
                className="w-full rounded-t bg-accent/70 hover:bg-accent transition-colors min-h-[2px]"
                style={{ height: `${Math.max(pct, d.count > 0 ? 4 : 0.5)}%` }}
              />
              <span className="absolute -top-6 hidden group-hover:block text-xs text-text-primary bg-surface border border-border rounded px-1.5 py-0.5 whitespace-nowrap z-10">
                {d.date.slice(5)}: {d.count}
              </span>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-2 text-xs text-text-faint font-mono">
        <span>{data[0]?.date.slice(5)}</span>
        <span>{data[data.length - 1]?.date.slice(5)}</span>
      </div>
      {empty && (
        <p className="text-xs text-text-faint mt-3">
          No activity recorded in this window yet. Entries appear here as you create, edit and delete content.
        </p>
      )}
    </div>
  );
}

export function ActivityPie({ data }: { data: Slice[] }) {
  const total = data.reduce((s, d) => s + d.count, 0);

  if (total === 0) {
    return <p className="text-sm text-text-faint">Nothing logged yet.</p>;
  }

  // Build the donut with stroke-dasharray on concentric circles — no library,
  // no path maths, and it scales cleanly.
  const R = 60;
  const C = 2 * Math.PI * R;
  let offset = 0;

  return (
    <div className="flex items-center gap-6 flex-wrap">
      <svg viewBox="0 0 160 160" className="w-40 h-40 shrink-0 -rotate-90">
        {data.map((d, i) => {
          const len = (d.count / total) * C;
          const circle = (
            <circle
              key={d.label}
              cx="80" cy="80" r={R}
              fill="none"
              stroke={COLORS[i % COLORS.length]}
              strokeWidth="24"
              strokeDasharray={`${len} ${C - len}`}
              strokeDashoffset={-offset}
            />
          );
          offset += len;
          return circle;
        })}
      </svg>
      <ul className="space-y-2 text-sm">
        {data.map((d, i) => (
          <li key={d.label} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
            <span className="text-text-primary">{d.label.replace(/_/g, ' ')}</span>
            <span className="text-text-muted font-mono text-xs">
              {d.count} · {Math.round((d.count / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
