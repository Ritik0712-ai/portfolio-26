'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { aboutParagraphs, aboutParagraphsHi, aboutHeadline, aboutHeadlineHi } from '@/data/about';
import { T } from '@/lib/i18n';
import { Briefcase, Megaphone, Bug, BookOpen } from 'lucide-react';

const personalityTraits = [
  { icon: Briefcase, text: 'Full-stack intern at Labmentix — shipped SmartERP, PDF Sign, CloudVault and Voxora', hi: 'Labmentix में फ़ुल-स्टैक इंटर्न — SmartERP, PDF Sign, CloudVault और Voxora शिप किए' },
  { icon: Megaphone, text: 'Senior Marketing Manager at AIESEC — promoted from Junior within six months', hi: 'AIESEC में सीनियर मार्केटिंग मैनेजर — छह महीने में जूनियर से प्रमोशन' },
  { icon: Bug, text: 'Debugs in production — my hardest bugs only showed up after deploy, and taught me the most', hi: 'प्रोडक्शन में डीबग करता हूँ — सबसे मुश्किल बग डिप्लॉय के बाद ही दिखे, और उन्हीं ने सबसे ज़्यादा सिखाया' },
  { icon: BookOpen, text: 'Writes about Vedanta, philosophy and growing up — not just code', hi: 'सिर्फ़ कोड नहीं — वेदांत, दर्शन और बड़े होने के बारे में भी लिखता हूँ' },
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
            <p className="text-xs font-mono text-text-faint uppercase tracking-[0.3em] mb-4"><T en="About" hi="परिचय" /></p>
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
                <p className="text-xs text-text-faint font-body"><T en="Available for" hi="उपलब्ध हूँ" /></p>
                <p className="text-sm font-medium text-text-primary"><T en="Internships & Projects" hi="इंटर्नशिप और प्रोजेक्ट्स के लिए" /></p>
              </div>
            </div>

            {/* Personality */}
            <div className="mt-8 space-y-3">
              {personalityTraits.map(({ icon: Icon, text, hi }) => (
                <div key={text} className="flex items-center gap-3 text-sm text-text-secondary font-body">
                  <Icon className="w-4 h-4 text-accent shrink-0" />
                  <span><T en={text} hi={hi} /></span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Bio */}
          <div className="pt-8 md:pt-20">
            <h2 className="text-3xl md:text-4xl font-display font-semibold text-text-primary mb-6 leading-tight">
              <T en={aboutHeadline} hi={aboutHeadlineHi} />
            </h2>
            <div className="space-y-4 text-base text-text-secondary font-body leading-relaxed">
              {aboutParagraphs.map((p, i) => (
                <p key={p.slice(0, 24)}><T en={p} hi={aboutParagraphsHi[i] ?? p} /></p>
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
              <p className="text-xs font-mono text-text-faint uppercase tracking-widest mb-4"><T en="Quick Facts" hi="झलक" /></p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Based in', hi: 'कहाँ से', value: 'India', valueHi: 'भारत' },
                  { label: 'Education', hi: 'पढ़ाई', value: 'B.Tech CSE, VIT Bhopal', valueHi: 'B.Tech CSE, VIT भोपाल' },
                  { label: 'Languages', hi: 'भाषाएँ', value: 'TypeScript, Java, Python, C++', valueHi: 'TypeScript, Java, Python, C++' },
                  { label: 'Focus', hi: 'फ़ोकस', value: 'Full-Stack Development', valueHi: 'फ़ुल-स्टैक डेवलपमेंट' },
                ].map(f => (
                  <div key={f.label}>
                    <p className="text-xs text-text-faint font-body"><T en={f.label} hi={f.hi} /></p>
                    <p className="text-sm font-medium text-text-primary font-body"><T en={f.value} hi={f.valueHi} /></p>
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
