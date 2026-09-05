'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface TimelineEvent {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
}

export default function Timeline() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);

  useEffect(() => {
    fetch('/api/timeline').then(r => r.json()).then(d => setEvents(d.events || [])).catch(() => {});
  }, []);

  if (events.length === 0) return null;

  return (
    <section className="py-20">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-12">
          <p className="text-xs font-mono text-text-faint uppercase tracking-[0.3em] mb-2">History</p>
          <h2 className="text-3xl md:text-4xl font-display font-semibold text-text-primary">Timeline</h2>
        </div>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[11px] top-2 bottom-2 w-px bg-border" />

          <div className="space-y-8">
            {events.map((event, i) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="relative pl-10"
              >
                <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-surface border-2 border-border flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-text-faint" />
                </div>
                <p className="text-xs font-mono text-accent uppercase tracking-wider mb-0.5">{event.event_date}</p>
                <p className="font-display font-semibold text-text-primary">{event.title}</p>
                {event.description && (
                  <p className="text-sm text-text-muted font-body mt-1">{event.description}</p>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
