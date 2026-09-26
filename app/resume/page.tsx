'use client';

import InteractiveResume from '@/components/resume/InteractiveResume';

export default function ResumePage() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <InteractiveResume scroll={false} className="max-w-5xl mx-auto rounded-2xl overflow-hidden border border-border" />
    </div>
  );
}
