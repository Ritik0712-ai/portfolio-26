import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, BookOpen } from 'lucide-react';
import { T } from '@/lib/i18n';


export default function Hero() {
  return (
    <section className="pt-32 pb-20 md:pt-40 md:pb-28 px-4">
      <div className="max-w-5xl mx-auto w-full">
        <div className="grid md:grid-cols-[1.4fr_1fr] gap-12 md:gap-16 items-center">
          {/* Left: Text */}
          <div>
            <p className="text-xs font-mono text-text-faint uppercase tracking-[0.3em] mb-6">
              <T en="Full-Stack Developer" hi="फ़ुल-स्टैक डेवलपर" />
            </p>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-semibold text-text-primary leading-[1.05] mb-6">
              Ritik Agarwal
            </h1>

            <p className="text-lg text-text-secondary font-body leading-relaxed max-w-md mb-8">
              <T
                en="I build dependable products from idea to production — clean architecture, thoughtful UX, and code that teams can actually maintain."
                hi="मैं आइडिया से प्रोडक्शन तक भरोसेमंद प्रोडक्ट्स बनाता हूँ — साफ़ आर्किटेक्चर, सोच-समझकर बना UX, और ऐसा कोड जिसे टीमें सच में मेंटेन कर सकें।"
              />
            </p>

            <div className="flex items-center gap-2 mb-10">
              <span className="w-2 h-2 rounded-full bg-success" />
              <span className="text-sm text-text-muted font-body">
                <T en="Open to internships & projects" hi="इंटर्नशिप और प्रोजेक्ट्स के लिए उपलब्ध" />
              </span>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/#projects"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-text-primary text-bg font-body font-medium text-sm rounded hover:opacity-90 transition-opacity"
              >
                <T en="View Work" hi="मेरा काम देखें" />
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-border text-text-primary font-body font-medium text-sm rounded hover:bg-surface-hover transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                <T en="Read the Blog" hi="ब्लॉग पढ़ें" />
              </Link>
            </div>
          </div>

          {/* Right: Portrait */}
          <div className="flex justify-center md:justify-end">
            <div className="relative w-64 md:w-full max-w-xs aspect-[4/5] overflow-hidden rounded-lg bg-bg-tertiary">
              <Image
                src="/IMG-20260904-WA0065.jpg"
                alt="Ritik Agarwal"
                fill
                priority
                sizes="(min-width: 768px) 320px, 256px"
                className="object-cover object-top"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
