'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';
import { Code, Users, Globe, Coffee } from 'lucide-react';

interface StatItem {
  id: string;
  icon: string;
  value: number;
  suffix: string;
  label: string;
}

const iconMap: Record<string, React.ReactNode> = {
  Code: <Code className="w-5 h-5" />,
  Users: <Users className="w-5 h-5" />,
  Globe: <Globe className="w-5 h-5" />,
  Coffee: <Coffee className="w-5 h-5" />,
};

// Each counter owns its own ref and observer. Previously the observer lived
// on the parent, whose ref was attached to a <section> that did not exist
// until the fetch resolved — so it observed null, never fired, and every
// stat rendered a hardcoded "0" forever.
function Counter({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    if (!value) {
      setCount(0);
      return;
    }
    // Time-based rather than fixed-increment, so the value always lands
    // exactly on target and small values (e.g. 1) still animate visibly.
    const duration = 1200;
    const startedAt = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(value * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [isInView, value]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

export default function Stats() {
  const [stats, setStats] = useState<StatItem[]>([]);

  useEffect(() => {
    fetch('/api/stats')
      .then((r) => r.json())
      .then((d) => setStats(d.stats || []))
      .catch(() => {});
  }, []);

  if (stats.length === 0) return null;

  return (
    <section className="py-20 border-y border-border bg-bg-secondary">
      <div className="max-w-5xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.id} className="text-center">
              <div className="flex justify-center mb-2 text-text-muted">
                {iconMap[stat.icon] || <Code className="w-5 h-5" />}
              </div>
              <p className="text-3xl md:text-4xl font-display font-semibold text-text-primary">
                <Counter value={stat.value} suffix={stat.suffix} />
              </p>
              <p className="text-sm text-text-muted font-body mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
