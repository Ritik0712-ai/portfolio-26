'use client';

import { Download, ExternalLink, Mail } from 'lucide-react';
import Link from 'next/link';

export default function ResumePage() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-mono text-text-faint uppercase tracking-[0.3em] mb-2">Resume</p>
          <h1 className="text-4xl font-display font-semibold text-text-primary mb-4">Ritik Agarwal</h1>
          <div className="flex flex-wrap gap-3">
            <a href="/resume.pdf" className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white font-body font-medium rounded hover:bg-accent-warm transition-colors text-sm">
              <Download className="w-4 h-4" /> Download PDF
            </a>
            <a href="mailto:ritikagarwal2468@gmail.com" className="inline-flex items-center gap-2 px-4 py-2 border border-border text-text-secondary font-body text-sm rounded hover:border-rule hover:text-text-primary transition-colors">
              <Mail className="w-4 h-4" /> Contact Me
            </a>
          </div>
        </div>

        {/* Embedded PDF */}
        <div className="border border-border rounded-lg overflow-hidden bg-surface">
          <iframe src="/resume.pdf" className="w-full h-[80vh]" title="Resume PDF" />
        </div>

        <p className="text-center text-sm text-text-muted font-body mt-4">
          Can&apos;t view PDF?{' '}
          <a href="/resume.pdf" className="text-accent hover:underline">Download it instead</a>
        </p>
      </div>
    </div>
  );
}
