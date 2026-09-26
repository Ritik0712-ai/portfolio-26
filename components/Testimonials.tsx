'use client';

import Link from 'next/link';
import { Star, Quote, ArrowRight, MessageSquarePlus } from 'lucide-react';
import type { Testimonial } from '@/types';

export default function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {

  return (
    <section id="testimonials" className="py-20">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-12">
          <p className="text-xs font-mono text-text-faint uppercase tracking-[0.3em] mb-2">Kind Words</p>
          <h2 className="text-3xl md:text-4xl font-display font-semibold text-text-primary">Testimonials</h2>
        </div>

        {testimonials.length > 0 && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
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
        )}

        {/* Always-visible invite, so there is a way in even before the first testimonial is approved */}

          <div className="bg-surface border border-dashed border-rule rounded-lg p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded bg-accent/15 flex items-center justify-center shrink-0">
                <MessageSquarePlus className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="font-display text-xl font-semibold text-text-primary">
                  {testimonials.length > 0 ? 'Worked with me?' : 'Worked with me? Be the first.'}
                </p>
                <p className="text-sm text-text-muted font-body mt-1 max-w-md">
                  Teammates, clients, mentors — share a few words about working together.
                  I review every note before it goes up here.
                </p>
              </div>
            </div>
            <Link
              href="/feedback"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-text-primary text-bg font-body font-medium text-sm rounded hover:opacity-90 transition-opacity shrink-0"
            >
              Leave a testimonial
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
      </div>
    </section>
  );
}
