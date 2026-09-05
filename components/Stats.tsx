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

function Counter({ value, suffix, isInView }: { value: number; suffix: string; isInView: boolean }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 2000;
    const increment = value / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) { setCount(value); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, value]);
  return <span>{count}{suffix}</span>;
}

export default function Stats() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [stats, setStats] = useState<StatItem[]>([]);

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(d => setStats(d.stats || [])).catch(() => {});
  }, []);

  if (stats.length === 0) return null;

  return (
    <section ref={ref} className="py-20 border-y border-border bg-bg-secondary">
      <div className="max-w-5xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <div key={stat.id} className="text-center">
              <div className="flex justify-center mb-2 text-text-muted">
                {iconMap[stat.icon] || <Code className="w-5 h-5" />}
              </div>
              <p className="text-3xl md:text-4xl font-display font-semibold text-text-primary">
                {isInView ? <Counter value={stat.value} suffix={stat.suffix} isInView={isInView} /> : `0${stat.suffix}`}
              </p>
              <p className="text-sm text-text-muted font-body mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
