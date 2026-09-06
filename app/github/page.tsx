'use client';

import GitHubTracker from '@/components/GitHubTracker';
import { Github } from 'lucide-react';

export default function GitHubPage() {
  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Github className="w-6 h-6 text-text-muted" />
            <p className="text-xs font-mono text-text-faint uppercase tracking-[0.3em]">GitHub Activity</p>
          </div>
          <h1 className="text-4xl font-display font-semibold text-text-primary">GitHub Tracker</h1>
          <p className="text-text-secondary font-body text-sm mt-1">My open source activity, repositories, and contribution history. Updated hourly.</p>
        </div>
        <GitHubTracker />
      </div>
    </div>
  );
}
