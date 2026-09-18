'use client';

import { useEffect, useState } from 'react';
import { Award, ExternalLink } from 'lucide-react';
import type { Certification } from '@/types';

function formatMonth(value: string) {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });
}

export default function Certifications() {
  const [certifications, setCertifications] = useState<Certification[]>([]);

  useEffect(() => {
    fetch('/api/certifications')
      .then((r) => r.json())
      .then((d) => setCertifications(d.certifications || []))
      .catch(() => {});
  }, []);

  if (certifications.length === 0) return null;

  return (
    <section id="certifications" className="py-20">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-12">
          <p className="text-xs font-mono text-text-faint uppercase tracking-[0.3em] mb-2">
            Credentials
          </p>
          <h2 className="text-3xl md:text-4xl font-display font-semibold text-text-primary">
            Certifications
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {certifications.map((cert) => (
            <article
              key={cert.id}
              className="bg-surface border border-border rounded-lg p-6 flex flex-col gap-4 hover:border-rule transition-colors"
            >
              <div className="flex items-start gap-3">
                {cert.image_url ? (
                  <img
                    src={cert.image_url}
                    alt={cert.title}
                    className="w-12 h-12 rounded object-contain bg-bg-secondary shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded bg-accent/20 flex items-center justify-center shrink-0">
                    <Award className="w-5 h-5 text-accent" />
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="text-sm font-medium font-body text-text-primary leading-snug">
                    {cert.title}
                  </h3>
                  <p className="text-xs text-text-muted font-body mt-1">{cert.issuer}</p>
                </div>
              </div>

              {cert.issue_date && (
                <p className="text-xs font-mono text-text-faint">
                  Issued {formatMonth(cert.issue_date)}
                  {cert.expiry_date ? ` — Expires ${formatMonth(cert.expiry_date)}` : ''}
                </p>
              )}

              {cert.credential_url && (
                <a
                  href={cert.credential_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto inline-flex items-center gap-1.5 text-xs font-body font-medium text-text-secondary hover:text-text-primary transition-colors"
                >
                  Verify credential
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
