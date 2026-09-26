'use client';

import { Star, Quote, MessageSquarePlus } from 'lucide-react';
import { useTestimonials } from './data';

// Approved testimonials, shared by every RitikOS edition. Colours come from the
// --mac-* variables that each edition's root defines; `accent` lets an edition
// use its own highlight colour. Updates live as testimonials are approved.
export default function TestimonialsPanel({ accent = '#0A84FF', columns = 2 }: { accent?: string; columns?: 1 | 2 }) {
  const { data } = useTestimonials();
  if (!data) return <p className="p-6 mac-text-faint text-[13px]">Loading…</p>;

  return (
    <div className="p-5 mac-text text-[13px]">
      {data.length > 0 && (
        <div className={`grid gap-3 ${columns === 2 ? 'sm:grid-cols-2' : ''}`}>
          {data.map((t) => (
            <figure key={t.id} className="rounded-xl mac-card p-4 flex flex-col">
              <Quote className="w-4 h-4 mb-2" style={{ color: accent }} />
              <blockquote className="mac-text-muted leading-relaxed text-[14px] flex-1 whitespace-pre-line">&ldquo;{t.content}&rdquo;</blockquote>
              <figcaption className="flex items-center gap-2.5 mt-4">
                {t.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={t.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <span className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-semibold text-white" style={{ background: accent }}>
                    {t.name.trim()[0]?.toUpperCase()}
                  </span>
                )}
                <span className="min-w-0">
                  <span className="block font-semibold truncate">{t.name}</span>
                  {(t.role || t.company) && (
                    <span className="block text-[12px] mac-text-faint truncate">
                      {t.role}{t.role && t.company ? ' · ' : ''}{t.company}
                    </span>
                  )}
                </span>
                {t.rating ? (
                  <span className="ml-auto flex gap-0.5 shrink-0" aria-label={`${t.rating} out of 5`}>
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-[#FFB400] text-[#FFB400]" />
                    ))}
                  </span>
                ) : null}
              </figcaption>
            </figure>
          ))}
        </div>
      )}
      <a
        href="/feedback"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 flex items-center gap-3 rounded-xl border border-dashed mac-divider p-4 hover:opacity-90"
      >
        <MessageSquarePlus className="w-5 h-5 shrink-0" style={{ color: accent }} />
        <span>
          <span className="block font-semibold">Worked with Ritik?</span>
          <span className="block text-[12px] mac-text-faint">Leave a testimonial — it appears here once approved.</span>
        </span>
      </a>
    </div>
  );
}
