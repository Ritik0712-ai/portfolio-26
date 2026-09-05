'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Star, Quote } from 'lucide-react';
import type { Testimonial } from '@/types';

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    fetch('/api/testimonials')
      .then((r) => r.json())
      .then((d) => setTestimonials(d.testimonials || []))
      .catch(() => {});
  }, []);

  if (testimonials.length === 0) return null;

  return (
    <section id="testimonials" className="py-20">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-12">
          <p className="text-xs font-mono text-text-faint uppercase tracking-[0.3em] mb-2">Social Proof</p>
          <h2 className="text-3xl md:text-4xl font-display font-semibold text-text-primary">Testimonials</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {testimonials.map((t) => (
            <figure key={t.id} className="bg-surface border border-border rounded-lg p-6">
              <Quote className="w-5 h-5 text-text-faint mb-4" />
              <blockquote className="text-text-secondary font-body leading-relaxed mb-4">
                &ldquo;{t.content}&rdquo;
              </blockquote>
              <figcaption className="flex items-center gap-3">
                {t.avatar ? (
                  <img src={t.avatar} alt={t.name} className="w-8 h-8 rounded-full object-cover bg-bg-secondary" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-xs font-mono text-accent">
                    {t.name[0]}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-text-primary font-body">{t.name}</p>
                  {(t.role || t.company) && (
                    <p className="text-xs text-text-muted font-body">
                      {t.role}{t.role && t.company ? ' at ' : ''}{t.company}
                    </p>
                  )}
                </div>
                {t.rating && (
                  <div className="ml-auto flex gap-0.5">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-accent-warm text-accent-warm" />
                    ))}
                  </div>
                )}
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-text-muted font-body mb-3">Worked with me? Share your experience!</p>
          <Link href="/feedback" className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-body font-medium bg-surface border border-border text-text-primary rounded hover:border-rule transition-colors">
            Leave a Testimonial
          </Link>
        </div>
      </div>
    </section>
  );
}
