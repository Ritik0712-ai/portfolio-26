'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { aboutParagraphs } from '@/data/about';
import { Briefcase, Megaphone, Bug, BookOpen } from 'lucide-react';

const personalityTraits = [
  { icon: Briefcase, text: 'Full-stack intern at Labmentix — shipping features on a production codebase' },
  { icon: Megaphone, text: 'Senior Marketing Manager at AIESEC — promoted from Junior within six months' },
  { icon: Bug, text: 'Debugs in production — my hardest bugs only showed up after deploy, and taught me the most' },
  { icon: BookOpen, text: 'Writes about Vedanta, philosophy and growing up — not just code' },
];

interface StatItem {
  id: string;
  value: number;
  suffix: string;
  label: string;
}

export default function About() {
  const [stats, setStats] = useState<StatItem[]>([]);

  useEffect(() => {
    fetch('/api/stats')
      .then((r) => r.json())
      .then((d) => setStats(d.stats || []))
      .catch(() => {});
  }, []);

  return (
    <section id="about" className="py-20 bg-bg-secondary">
      <div className="max-w-5xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-16 items-start">
          {/* Left: Profile */}
          <div>
            <p className="text-xs font-mono text-text-faint uppercase tracking-[0.3em] mb-4">About</p>
            <div className="relative">
              <div className="aspect-[3/4] rounded-lg overflow-hidden bg-bg-tertiary">
                <Image
                  src="/profile.jpg"
                  alt="Ritik Agarwal"
                  width={400}
                  height={533}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 bg-surface border border-border rounded-lg px-4 py-3 shadow-md">
                <p className="text-xs text-text-faint font-body">Available for</p>
                <p className="text-sm font-medium text-text-primary">Internships & Projects</p>
              </div>
            </div>

            {/* Personality */}
            <div className="mt-8 space-y-3">
              {personalityTraits.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3 text-sm text-text-secondary font-body">
                  <Icon className="w-4 h-4 text-accent shrink-0" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Bio */}
          <div className="pt-8 md:pt-20">
            <h2 className="text-3xl md:text-4xl font-display font-semibold text-text-primary mb-6 leading-tight">
              CS student building products that matter
            </h2>
            <div className="space-y-4 text-base text-text-secondary font-body leading-relaxed">
              {aboutParagraphs.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </div>

            {stats.length > 0 && (
              <div className="mt-8 pt-8 border-t border-border flex flex-wrap gap-x-12 gap-y-6">
                {stats.map((stat) => (
                  <div key={stat.id}>
                    <p className="text-3xl md:text-4xl font-display font-semibold text-text-primary">
                      {stat.value}
                      {stat.suffix}
                    </p>
                    <p className="text-xs text-text-muted font-body mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-8 pt-8 border-t border-border">
              <p className="text-xs font-mono text-text-faint uppercase tracking-widest mb-4">Quick Facts</p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Based in', value: 'India' },
                  { label: 'Education', value: 'B.Tech CSE, VIT Bhopal' },
                  { label: 'Languages', value: 'TypeScript, Java, Python, C++' },
                  { label: 'Focus', value: 'Full-Stack Development' },
                ].map(f => (
                  <div key={f.label}>
                    <p className="text-xs text-text-faint font-body">{f.label}</p>
                    <p className="text-sm font-medium text-text-primary font-body">{f.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
