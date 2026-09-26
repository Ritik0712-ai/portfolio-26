'use client';

import { useEffect, useState } from 'react';
import { Award, ExternalLink } from 'lucide-react';
import type { Certification } from '@/types';

interface TimelineEvent {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
}

// event_date is free text: ISO dates ("2024-09-05") become "Sep 2024",
// anything else ("Present") is shown as-is.
function formatEventDate(value: string) {
  if (!/^\d{4}-\d{2}(-\d{2})?$/.test(value)) return value;
  return new Date(value).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function formatMonth(value: string) {
  return new Date(value).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export default function Experience() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);

  useEffect(() => {
    fetch('/api/timeline')
      .then((r) => r.json())
      .then((d) => setEvents(d.events || []))
      .catch(() => {});
    fetch('/api/certifications')
      .then((r) => r.json())
      .then((d) => setCertifications(d.certifications || []))
      .catch(() => {});
  }, []);

  if (events.length === 0 && certifications.length === 0) return null;

  return (
    <section id="experience" className="py-20">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-12">
          <p className="text-xs font-mono text-text-faint uppercase tracking-[0.3em] mb-2">Background</p>
          <h2 className="text-3xl md:text-4xl font-display font-semibold text-text-primary">Experience</h2>
        </div>

        <div className="grid md:grid-cols-[1.3fr_1fr] gap-12 md:gap-16">
          {/* Journey */}
          {events.length > 0 && (
            <div>
              <h3 className="text-xs font-mono text-text-faint uppercase tracking-widest mb-6">Journey</h3>
              <ol className="relative border-l border-border ml-1.5 space-y-8">
                {events.map((event) => (
                  <li key={event.id} className="reveal pl-6 relative">
                    <span className="absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full bg-bg border-2 border-rule" />
                    <p className="text-xs font-mono text-accent uppercase tracking-wider mb-1">
                      {formatEventDate(event.event_date)}
                    </p>
                    <p className="font-display text-lg font-semibold text-text-primary leading-snug">
                      {event.title}
                    </p>
                    {event.description && (
                      <p className="text-sm text-text-muted font-body mt-1">{event.description}</p>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Certifications */}
          {certifications.length > 0 && (
            <div id="certifications" className="scroll-mt-24">
              <h3 className="text-xs font-mono text-text-faint uppercase tracking-widest mb-6">Certifications</h3>
              <ul className="space-y-3">
                {certifications.map((cert) => (
                  <li
                    key={cert.id}
                    className="bg-surface border border-border rounded-lg p-4 flex items-start gap-3"
                  >
                    {cert.image_url ? (
                      <img
                        src={cert.image_url}
                        alt=""
                        className="w-10 h-10 rounded object-contain bg-bg-secondary shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded bg-accent/15 flex items-center justify-center shrink-0">
                        <Award className="w-4 h-4 text-accent" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium font-body text-text-primary leading-snug">
                        {cert.title}
                      </p>
                      <p className="text-xs text-text-muted font-body mt-0.5">
                        {cert.issuer}
                        {cert.issue_date ? ` · ${formatMonth(cert.issue_date)}` : ''}
                      </p>
                      {cert.credential_url && (
                        <a
                          href={cert.credential_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center gap-1 text-xs font-body text-text-secondary hover:text-text-primary transition-colors"
                        >
                          Verify <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
