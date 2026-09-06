'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, Download } from 'lucide-react';
import PhotoCarousel from './PhotoCarousel';

const roles = ['Product Engineer', 'Full-Stack Developer', 'Builder'];

export default function Hero() {
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentRoleIndex((prev) => (prev + 1) % roles.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="min-h-[90vh] flex items-center pt-16 px-4">
      <div className="max-w-5xl mx-auto w-full">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left: Text */}
          <div>
            {/* Monogram */}
            <div className="text-xs font-mono text-text-faint uppercase tracking-[0.3em] mb-6">
              RA — Portfolio
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-semibold text-text-primary leading-[1.05] mb-4">
              Ritik<br />Agarwal
            </h1>

            {/* Role */}
            <div className="mb-6 overflow-hidden">
              <p className="text-lg text-accent font-body font-medium">
                {roles[currentRoleIndex]}
              </p>
            </div>

            {/* Positioning */}
            <p className="text-base text-text-secondary font-body leading-relaxed max-w-sm mb-8">
              I build dependable products from idea to production. Focused on clean architecture, thoughtful UX, and code that teams can actually maintain.
            </p>

            {/* Availability badge */}
            <div className="flex items-center gap-2 mb-8">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-sm text-text-muted font-body">Open to opportunities</span>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3">
              <Link
                href="/#projects"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-text-primary text-bg font-body font-medium text-sm rounded hover:opacity-90 transition-opacity"
              >
                View Work
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-border text-text-primary font-body font-medium text-sm rounded hover:bg-surface-hover transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                Read the Blog
              </Link>
            </div>
          </div>

          {/* Right: Portrait Carousel */}
          <div className="relative flex justify-center md:justify-end">
            <PhotoCarousel interval={2000} />
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="mt-16 md:mt-24 text-center">
          <div className="w-px h-12 bg-border mx-auto" />
        </div>
      </div>
    </section>
  );
}
